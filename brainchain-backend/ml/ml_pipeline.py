import sqlite3
import pandas as pd
import numpy as np
import datetime
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'brainchain.db')

def get_db_connection():
    return sqlite3.connect(DB_PATH)

def process_anomalies(df, contamination=0.05):
    """
    Runs Isolation Forest to detect anomalies on the value column.
    """
    if len(df) < 10:
        return df # Not enough data
        
    model = IsolationForest(contamination=contamination, random_state=42)
    # Reshape for sklearn
    X = df['value'].values.reshape(-1, 1)
    
    # Fit and predict (-1 for anomaly, 1 for normal)
    preds = model.fit_predict(X)
    
    # Compute anomaly scores (lower is more anomalous, we negate it so higher = worse)
    scores = -model.decision_function(X)
    
    df['anomaly'] = (preds == -1).astype(int)
    # Z-score normalization for the anomaly_score just for visual scale in UI (0 to 5)
    mean_score = scores.mean()
    std_score = scores.std() if scores.std() > 0 else 1
    z_scores = (scores - mean_score) / std_score
    df['anomaly_score'] = np.clip(z_scores * 2 + 1, 0, 5) # Scale to a 0-5 range roughly
    
    df.loc[df['anomaly'] == 1, 'anomaly_reason'] = 'Statistical anomaly detected by IsolationForest'
    return df

def generate_forecast(df_hist, periods=8, interval_hours=3):
    """
    Uses LinearRegression with time-based features to generate a forecast.
    """
    if len(df_hist) < 10:
        return None
        
    # Prepare features
    df = df_hist.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['dayofweek'] = df['timestamp'].dt.dayofweek
    
    # Cyclical features
    df['hour_sin'] = np.sin(df['hour'] * (2. * np.pi / 24))
    df['hour_cos'] = np.cos(df['hour'] * (2. * np.pi / 24))
    
    X = df[['hour_sin', 'hour_cos', 'dayofweek']]
    y = df['value']
    
    model = LinearRegression()
    model.fit(X, y)
    
    # Calculate RMSE for confidence bands
    preds = model.predict(X)
    rmse = np.sqrt(np.mean((y - preds)**2))
    
    # Generate future timestamps
    last_time = df['timestamp'].max()
    future_times = [last_time + datetime.timedelta(hours=interval_hours * i) for i in range(1, periods + 1)]
    
    future_df = pd.DataFrame({'timestamp': future_times})
    future_df['hour'] = future_df['timestamp'].dt.hour
    future_df['dayofweek'] = future_df['timestamp'].dt.dayofweek
    future_df['hour_sin'] = np.sin(future_df['hour'] * (2. * np.pi / 24))
    future_df['hour_cos'] = np.cos(future_df['hour'] * (2. * np.pi / 24))
    
    X_future = future_df[['hour_sin', 'hour_cos', 'dayofweek']]
    future_preds = model.predict(X_future)
    
    # Ensure no negative predictions if original data was positive
    if df['value'].min() >= 0:
        future_preds = np.clip(future_preds, 0, None)
        
    future_df['forecast'] = future_preds
    future_df['forecast_lower'] = np.clip(future_preds - (1.96 * rmse), 0 if df['value'].min() >= 0 else None, None)
    future_df['forecast_upper'] = future_preds + (1.96 * rmse)
    
    return future_df

def run_pipeline():
    print("Starting BrainChain ML Pipeline...")
    conn = get_db_connection()
    
    # Process module by module, facility by facility
    facilities = pd.read_sql("SELECT id FROM facilities", conn)['id'].tolist()
    
    if not facilities:
        print("No facilities found. DB might not be seeded.")
        return
        
    # Get distinct module_id and zone_id combinations
    combo_query = "SELECT DISTINCT facility_id, module_id, zone_id FROM telemetry WHERE is_forecast = 0"
    combos = pd.read_sql(combo_query, conn)
    
    print(f"Found {len(combos)} distinct time series to process.")
    
    # Keep track of generated forecasts to insert at the end
    forecasts_to_insert = []
    
    for _, row in combos.iterrows():
        fac_id = row['facility_id']
        mod_id = row['module_id']
        zone_id = row['zone_id']
        
        # 1. Fetch historical data for this series
        df = pd.read_sql(f"""
            SELECT id, timestamp, value 
            FROM telemetry 
            WHERE facility_id = ? AND module_id = ? AND zone_id = ? AND is_forecast = 0 
            ORDER BY timestamp ASC
        """, conn, params=(fac_id, mod_id, zone_id))
        
        if df.empty or df['value'].isnull().all():
            continue
            
        # 2. Run Anomaly Detection
        df_anom = process_anomalies(df)
        
        # Update anomalies in DB
        # Only update rows that were flagged as anomalous to save DB time
        anomalies = df_anom[df_anom['anomaly'] == 1]
        for _, a_row in anomalies.iterrows():
            conn.execute("""
                UPDATE telemetry 
                SET anomaly = 1, anomaly_score = ?, anomaly_reason = ?
                WHERE id = ?
            """, (a_row['anomaly_score'], a_row['anomaly_reason'], a_row['id']))
            
        # Clear anomalies that are no longer flagged (in case data changed)
        normals = df_anom[df_anom['anomaly'] == 0]
        for _, n_row in normals.iterrows():
            conn.execute("""
                UPDATE telemetry 
                SET anomaly = 0, anomaly_score = NULL, anomaly_reason = NULL
                WHERE id = ? AND anomaly = 1
            """, (n_row['id'],))
            
        # 3. Generate Forecasts
        future_df = generate_forecast(df_anom, periods=8, interval_hours=3)
        if future_df is not None:
            # We need to know the unit and metric_name to insert properly
            meta_info = pd.read_sql("""
                SELECT unit, metric_name FROM telemetry 
                WHERE facility_id = ? AND module_id = ? AND zone_id = ? 
                LIMIT 1
            """, conn, params=(fac_id, mod_id, zone_id))
            
            unit = meta_info['unit'].iloc[0] if not meta_info.empty else ''
            metric_name = meta_info['metric_name'].iloc[0] if not meta_info.empty else 'value'
            
            for _, f_row in future_df.iterrows():
                forecasts_to_insert.append({
                    'timestamp': f_row['timestamp'].isoformat(),
                    'facility_id': fac_id,
                    'module_id': mod_id,
                    'zone_id': zone_id,
                    'metric_name': metric_name,
                    'unit': unit,
                    'forecast': f_row['forecast'],
                    'forecast_lower': f_row['forecast_lower'],
                    'forecast_upper': f_row['forecast_upper'],
                    'model': 'LinearRegression+Seasonal',
                    'confidence': 0.85
                })
                
    # 4. Replace old forecasts with new ones
    print("Deleting old forecasts...")
    conn.execute("DELETE FROM telemetry WHERE is_forecast = 1")
    
    print(f"Inserting {len(forecasts_to_insert)} new ML forecast points...")
    if forecasts_to_insert:
        conn.executemany("""
            INSERT INTO telemetry (
                timestamp, facility_id, module_id, zone_id, metric_name, unit,
                is_forecast, forecast, forecast_lower, forecast_upper, model, confidence
            ) VALUES (
                :timestamp, :facility_id, :module_id, :zone_id, :metric_name, :unit,
                1, :forecast, :forecast_lower, :forecast_upper, :model, :confidence
            )
        """, forecasts_to_insert)
        
    conn.commit()
    conn.close()
    print("ML Pipeline completed successfully!")

if __name__ == "__main__":
    run_pipeline()
