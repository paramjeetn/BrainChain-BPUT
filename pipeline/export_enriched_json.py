"""
Pipeline orchestrator: generates synthetic data, runs anomaly detection,
adds forecasts, exports enriched JSON for the React dashboard.

Run: python export_enriched_json.py
Output: ../brainchain-ui/src/demo-data/ (overwrites with enriched versions)
"""
from detect_anomalies import detect_anomalies
from forecast import forecast_next_24h
from pathlib import Path
import json

def enrich_module_data(input_file: str, output_file: str, value_key: str = "value"):
    input_path = Path(input_file)
    if not input_path.exists():
        input_path = Path(__file__).resolve().parent / input_file
    if not input_path.exists():
        print(f"Warning: File not found: {input_file}")
        return
        
    data = json.loads(input_path.read_text(encoding="utf-8"))
    # Keep only historical records so running this multiple times doesn't compound forecasts
    historical_records = [r for r in data if not r.get("is_forecast")]

    # Anomaly detection
    enriched = detect_anomalies(historical_records, value_key=value_key)
    
    # Add forecasts per facility+zone
    all_forecasts = []
    by_fac_zone = {}
    for r in enriched:
        key = (r.get("facility_id"), r.get("zone_id"))
        by_fac_zone.setdefault(key, []).append(r)
    
    for (fac, zone), records in by_fac_zone.items():
        forecasts = forecast_next_24h(records, value_key=value_key)
        all_forecasts.extend(forecasts)
    
    final = enriched + all_forecasts
    output_path = Path(output_file)
    if not output_path.parent.exists():
        output_path = Path(__file__).resolve().parent / output_file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(final, indent=2), encoding="utf-8")
    print(f"Enriched {len(enriched)} records + {len(all_forecasts)} forecasts -> {output_path}")


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent / "brainchain-ui" / "src" / "demo-data"
    if not base.exists():
        base = Path("../brainchain-ui/src/demo-data")
    enrich_module_data(str(base / "energy.json"), str(base / "energy.json"))
    enrich_module_data(str(base / "water.json"), str(base / "water.json"))
    enrich_module_data(str(base / "air-quality.json"), str(base / "air-quality.json"))
    enrich_module_data(str(base / "waste.json"), str(base / "waste.json"))
    print("All modules enriched successfully!")
