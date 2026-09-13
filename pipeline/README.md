# BrainChain Data Pipeline

## Architecture
```
Synthetic Generator → Field Mapper → Validator → Anomaly Detector → Forecaster → JSON Export → React Dashboard
```

## Core Schema
| Field | Type | Notes |
|---|---|---|
| timestamp | datetime | ISO 8601 UTC |
| facility_id | string | bput-campus, kims-hospital, tcs-infopark |
| module_id | string | energy, water, waste, air_quality, traffic |
| zone_id | string | Building/wing/lot |
| metric_name | string | Canonical from controlled vocabulary |
| value | float | Historical actual value |
| unit | string | kWh, liters, AQI, % |
| source_type | enum | real \| synthetic \| manual |
| anomaly | bool | Z-score detection flag |
| anomaly_score | float | Standard deviations from mean |
| anomaly_reason | string | Human-readable explanation |
| is_forecast | bool | True for predicted future points |
| forecast | float | Predicted value |
| forecast_lower | float | 85% confidence lower bound |
| forecast_upper | float | 85% confidence upper bound |
| model | string | Algorithm name |
| confidence | float | Model confidence 0-1 |

## Data Source Tiers
| Module | Source | Reason |
|---|---|---|
| Air Quality | Real (CPCB public data) | Station data available for Bhubaneswar/Rourkela |
| Energy | Synthetic IoT (occupancy-driven) | No public sub-meter data available |
| Water | Synthetic IoT | No public consumption data |
| Waste | Synthetic IoT | Smart bin data not publicly available |
| Traffic | Synthetic IoT | Gate sensor data simulated |
| Assets | Manual sample data | Field inspection records |
| Safety | Manual sample data | Incident logs |
| Scorecard | Derived (not ingested) | Aggregated from above modules |

## Anomaly Detection
- **Method**: Rolling z-score (7-day window, per-zone baseline)
- **Threshold**: z > 2.0 (configurable per facility type)
- **Mode**: Lenient (flags but never drops records)
- **Assumption**: Values are approximately normally distributed within each zone

## Forecasting
- **Method**: Linear trend + daily seasonality (numpy)
- **Horizon**: 24 hours ahead at 2-hour intervals
- **Confidence**: ±15% interval (empirical, not statistical)
- **Limitation**: Assumes stationarity — not suitable for event-based data
- **Production upgrade path**: Replace with Prophet (drop-in, same interface)

## Field Mapper Example
Handles variant field names from different data sources:
```python
FIELD_MAP = {
    "pm2_5": "PM2.5", "PM2.5": "PM2.5", "pm25_ugm3": "PM2.5",
    "pm10": "PM10", "no2": "NO2", "aqi": "AQI"
}
```
New source shapes are handled by extending the module's FIELD_MAP.
The pipeline itself never changes — only the map.
