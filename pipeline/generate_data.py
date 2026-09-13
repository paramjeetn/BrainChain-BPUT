"""
BrainChain Synthetic IoT Data Generator

One reusable generator function that serves energy/water/waste/traffic/AQ
with different parameters. Uses seasonality + noise + occupancy patterns.
"""
import json
import math
import random
import datetime
from pathlib import Path

random.seed(42)  # reproducible

def generate_time_series(
    facility_id: str,
    module_id: str,
    zone_id: str,
    metric_name: str,
    unit: str,
    base_value: float,
    daily_amplitude: float,  # how much it varies through the day
    weekly_trend: float,     # slight weekly drift
    noise_pct: float,        # random noise as % of base
    peak_hours: list,        # hours of day with higher values [8, 9, 10]
    peak_multiplier: float,  # how much higher at peak
    source_type: str,        # 'synthetic' | 'real' | 'manual'
    start_date: str,         # ISO date
    days: int,               # number of days
    interval_hours: int,     # data point interval
    anomaly_probability: float = 0.03,  # 3% chance of anomaly per point
    anomaly_multiplier: float = 2.5     # anomaly = 2.5x normal
) -> list[dict]:
    """Generate time-series records conforming to BrainChain core schema."""
    records = []
    start = datetime.datetime.fromisoformat(start_date)
    
    for day in range(days):
        for hour in range(0, 24, interval_hours):
            ts = start + datetime.timedelta(days=day, hours=hour)
            
            # Daily seasonality: sine wave peaking at midday
            hour_factor = 1 + daily_amplitude * math.sin(math.pi * hour / 24)
            
            # Peak hours boost
            peak_boost = peak_multiplier if hour in peak_hours else 1.0
            
            # Weekly trend
            weekly_factor = 1 + (day / days) * weekly_trend
            
            # Random noise
            noise = 1 + random.gauss(0, noise_pct)
            
            # Base value computation  
            value = base_value * hour_factor * peak_boost * weekly_factor * noise
            value = max(0, round(value, 2))
            
            # Anomaly injection
            is_anomaly = random.random() < anomaly_probability
            if is_anomaly:
                value = round(value * anomaly_multiplier, 2)
            
            record = {
                "timestamp": ts.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "facility_id": facility_id,
                "module_id": module_id,
                "zone_id": zone_id,
                "metric_name": metric_name,
                "value": value,
                "unit": unit,
                "source_type": source_type,
                "anomaly": is_anomaly,
                "raw_extra": {}
            }
            records.append(record)
    
    return records


if __name__ == "__main__":
    # Generate energy data for BPUT campus
    energy_data = []
    for zone in ["Block A", "Block B", "Central Library", "Hostel Zone"]:
        base = {"Block A": 120, "Block B": 145, "Central Library": 80, "Hostel Zone": 95}[zone]
        energy_data.extend(generate_time_series(
            facility_id="bput-campus",
            module_id="energy",
            zone_id=zone,
            metric_name="kWh_total",
            unit="kWh",
            base_value=base,
            daily_amplitude=0.4,
            weekly_trend=-0.05,
            noise_pct=0.08,
            peak_hours=[9, 10, 11, 14, 15],
            peak_multiplier=1.35,
            source_type="synthetic",
            start_date="2026-09-07",
            days=7,
            interval_hours=2
        ))
    
    print(f"Generated {len(energy_data)} energy records")
    output_path = Path(__file__).resolve().parent.parent / "brainchain-ui" / "src" / "demo-data" / "energy_raw.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(energy_data, indent=2), encoding="utf-8")
    print(f"Saved raw energy records to {output_path}")
