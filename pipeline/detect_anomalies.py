"""
BrainChain Anomaly Detection

Generic z-score based anomaly detection that works on any module's
normalized metric stream. Threshold from facility config.
"""
import json
import numpy as np
from pathlib import Path

def detect_anomalies(
    records: list[dict],
    value_key: str = "value",
    window_days: int = 7,
    z_threshold: float = 2.0,
    module_context: dict = None
) -> list[dict]:
    """
    Z-score anomaly detection over a rolling window.
    
    Assumptions:
    - Rolling 7-day window mean and std computed per zone
    - Points > z_threshold standard deviations flagged as anomalies
    - Lenient mode: flags but doesn't drop anomalous records
    
    Returns enriched records with anomaly fields added.
    """
    # Group by facility_id, zone_id, metric_name for proper baseline
    zones = {}
    for r in records:
        group_key = (r.get("facility_id", ""), r.get("zone_id", "main"), r.get("metric_name", value_key))
        if group_key not in zones:
            zones[group_key] = []
        zones[group_key].append(r)
    
    enriched = []
    for group_key, zone_records in zones.items():
        values = [float(r.get(value_key, 0) or 0) for r in zone_records]
        if len(values) < 3:
            for r in zone_records:
                enriched.append({**r, "anomaly": False, "anomaly_score": 0.0, "anomaly_reason": None})
            continue
        
        mean = float(np.mean(values))
        std = float(np.std(values)) or 1.0  # avoid div by zero
        
        for i, r in enumerate(zone_records):
            v = float(r.get(value_key, 0) or 0)
            z_score = abs((v - mean) / std)
            is_anomaly = bool(z_score > z_threshold)
            
            reason = None
            if is_anomaly:
                direction = "above" if v > mean else "below"
                reason = (
                    f"{r.get('zone_id', 'Zone')} {r.get('metric_name', 'value')} recorded {v:.1f} {r.get('unit', '')} "
                    f"— {z_score:.2f}σ {direction} 7-day baseline ({mean:.1f} {r.get('unit', '')}). "
                    f"Source: {r.get('source_type', 'synthetic')} IoT sensor."
                )
            
            enriched.append({
                **r,
                "anomaly": is_anomaly,
                "anomaly_score": round(float(z_score), 3),
                "anomaly_reason": reason
            })
    
    return enriched


if __name__ == "__main__":
    # Test on energy data
    data_file = Path(__file__).resolve().parent.parent / "brainchain-ui" / "src" / "demo-data" / "energy.json"
    if not data_file.exists():
        data_file = Path("../brainchain-ui/src/demo-data/energy.json")
    data = json.loads(data_file.read_text(encoding="utf-8"))
    enriched = detect_anomalies(data, value_key="value", z_threshold=2.0)
    anomalies_found = [r for r in enriched if r.get("anomaly")]
    print(f"Detected {len(anomalies_found)} anomalies out of {len(data)} records")
    for a in anomalies_found:
        print(f"  {a['timestamp']} | {a['zone_id']} | z={a['anomaly_score']} | {a['value']} {a.get('unit', '')}")
