# BrainChain — Hackathon Execution Plan
**PS: Sustainable Facility & Estate Intelligence Dashboard for India**

---

## Evaluation Target & Score Maximization

| Criterion | Weight | Current Status | Plan to Maximize Score |
|---|---|---|---|
| Sustainability & Ops Relevance | 20% | ✅ Done (8 modules) | Polish module coverage |
| Data Engineering & Visualization | 20% | ⚠️ Maps missing | Add ZoneMapPanel |
| **AI/ML Modeling & Forecasting** | **20%** | **❌ Fake ML** | **Real pipeline (Phase 1)** |
| Actionability of Recommendations | 15% | ⚠️ Hardcoded | GenAI batch insights (Phase 2) |
| Usability for Admins | 10% | ⚠️ Role tabs removed| Restore properly (Phase 3) |
| **Explainability & Assumptions** | **10%** | **❌ Nothing** | **ModelCard per module (Phase 3)** |
| Demo Quality | 5% | ✅ Good | Final polish (Phase 4) |

---

## Cost-Efficient Architecture Strategy
> **Core principle: NO continuous LLM calls. Run ML locally. Call Gemini only when anomaly state changes. Cache everything.**

- **Python ML runs locally:** `IsolationForest` + `LinearRegression` are free, run via cron every 10 min.
- **Gemini fires on delta:** Only when NEW anomalies are detected since the last check.
- **Batching:** 1 single prompt per facility = ALL anomalies bundled → 3-5 insights returned.
- **Cost Estimate:** < $0.05/day even with continuous running.

---

## Execution Phases

### Phase 1 — Real Python ML Pipeline 🚨 (Priority 1)
*   **What:** Build an actual scikit-learn pipeline for Anomaly Detection (Isolation Forest) and Forecasting (Linear Regression with seasonal features).
*   **Where:** `brainchain-backend/ml/ml_pipeline.py`
*   **Why:** Secures the 20% AI/ML weight. Judges can inspect actual model code and weights. Replaces hardcoded JSON scores.

### Phase 2 — Geospatial Zone Map 🗺️ (Priority 2)
*   **What:** Integrate `react-leaflet` to render facility zone polygons based on GPS coordinates.
*   **Where:** `brainchain-ui/src/components/modules/ZoneMapPanel.jsx`
*   **Why:** Directly answers the PS requirement for "geospatial libraries" and "pollution hotspots". Secures Data Engineering points.

### Phase 3 — GenAI Insights & Explainability 🤖 (Priority 3)
*   **What:** Create a backend endpoint to call Gemini 1.5 Flash using real anomaly data as context to generate plain-language insights.
*   **Where:** `brainchain-backend/ai/gemini_insights.py`
*   **Explainability:** Add a `ModelExplainabilityCard` in the UI to document assumptions (e.g., Z-score threshold, seasonality factors).

### Phase 4 — Role-Based Views & Polish 👥 (Priority 4)
*   **What:** Restore Admin, Operations, and Sustainability role filters in the UI so insights dynamically filter based on user role.
*   **Why:** Directly answers the Usability criteria explicitly mentioned in the PS.
