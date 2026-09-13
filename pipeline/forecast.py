"""
BrainChain Forecasting Module

Linear trend + daily seasonality forecaster.
One generic function applied to any normalized metric stream.

For production: replace with Prophet.
For demo: uses numpy linear regression + sine seasonality.
"""
import json
import numpy as np
import datetime
from pathlib import Path

def forecast_next_24h(
    records: list[dict],
    value_key: str = "value",
    hours_ahead: int = 24,
    interval_hours: int = 2,
    confidence_width: float = 0.15,
    model_name: str = "LinearTrend+Seasonality",
    confidence_score: float = 0.85
) -> list[dict]:
    """
    Forecast next N hours using linear trend + daily seasonality.
    
    Method:
    1. Fit linear trend to historical values (numpy polyfit degree=1)
    2. Compute hourly seasonality from historical mean by hour-of-day
    3. Combine trend + seasonality + confidence interval
    
    Assumptions:
    - Stationarity over the 7-day window (no major structural breaks)
    - Daily pattern repeats (suitable for energy/water/waste)
    - Confidence interval = ±15% of forecast value (simple but interpretable)
    - Not suitable for event-based data (safety incidents)
    """
    if not records:
        return []
    
    # Extract values and timestamps
    valid = [(r, float(r.get(value_key, 0) or 0)) for r in records if not r.get("is_forecast")]
    if len(valid) < 3:
        return []
    
    values = np.array([v for _, v in valid], dtype=float)
    x = np.arange(len(values))
    
    # Linear trend
    coeffs = np.polyfit(x, values, 1)
    slope, intercept = coeffs
    
    # Hourly seasonality
    hour_means = {}
    for r, v in valid:
        try:
            ts_str = str(r.get("timestamp", ""))
            hour = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00")).hour
        except Exception:
            hour = 12
        hour_means.setdefault(hour, []).append(v)
    
    hourly_avg = {h: float(np.mean(vs)) for h, vs in hour_means.items()}
    global_mean = float(np.mean(values))
    
    # Last timestamp
    last_record = valid[-1][0]
    try:
        ts_str = str(last_record.get("timestamp", ""))
        last_ts = datetime.datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        last_ts = datetime.datetime.now(datetime.timezone.utc)
    
    # Generate forecast points
    forecasts = []
    for step in range(interval_hours, hours_ahead + interval_hours, interval_hours):
        future_ts = last_ts + datetime.timedelta(hours=step)
        future_hour = future_ts.hour
        
        # Trend component
        trend_val = slope * (len(values) + step // interval_hours) + intercept
        
        # Seasonality component
        season_factor = hourly_avg.get(future_hour, global_mean) / (global_mean or 1)
        
        forecast_val = max(0.0, round(float(trend_val * season_factor), 2))
        lower = round(forecast_val * (1 - confidence_width), 2)
        upper = round(forecast_val * (1 + confidence_width), 2)
        
        # Carry over metadata from last record
        forecast_record = {
            **{k: v for k, v in last_record.items() if k not in ["value", "timestamp"]},
            "timestamp": future_ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "value": None,
            "is_forecast": True,
            "forecast": forecast_val,
            "forecast_lower": lower,
            "forecast_upper": upper,
            "model": model_name,
            "confidence": confidence_score,
            "anomaly": False,
            "anomaly_score": None,
            "anomaly_reason": None,
        }
        forecasts.append(forecast_record)
    
    return forecasts


if __name__ == "__main__":
    data_file = Path(__file__).resolve().parent.parent / "brainchain-ui" / "src" / "demo-data" / "energy.json"
    if not data_file.exists():
        data_file = Path("../brainchain-ui/src/demo-data/energy.json")
    data = json.loads(data_file.read_text(encoding="utf-8"))
    bput_data = [r for r in data if r.get("facility_id") == "bput-campus" and r.get("zone_id") == "Block A"]
    forecasts = forecast_next_24h(bput_data, value_key="value")
    print(f"Generated {len(forecasts)} forecast points for Block A")
    for f in forecasts:
        print(f"  {f['timestamp']} | forecast={f['forecast']} | [{f['forecast_lower']}, {f['forecast_upper']}]")
