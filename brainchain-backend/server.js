const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Get all facilities
app.get('/api/facilities', (req, res) => {
  const rows = db.prepare('SELECT * FROM facilities').all();
  // Parse activeModules array
  rows.forEach(r => r.activeModules = JSON.parse(r.activeModules));
  res.json(rows);
});

// Register new facility
app.post('/api/facilities', (req, res) => {
  const { id, name, location, type, activeModules } = req.body;
  if (!id || !name || !location || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO facilities (id, name, location, type, activeModules) VALUES (?, ?, ?, ?, ?)');
    stmt.run(id, name, location, type, JSON.stringify(activeModules || []));
    res.status(201).json({ success: true, facility: { id, name, location, type, activeModules } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get telemetry for a facility and module
app.get('/api/telemetry/:facilityId/:moduleId', (req, res) => {
  const { facilityId, moduleId } = req.params;
  const rows = db.prepare('SELECT * FROM telemetry WHERE facility_id = ? AND module_id = ? ORDER BY timestamp ASC').all(facilityId, moduleId);
  
  // Re-map to the JSON format the frontend expects
  const formatted = rows.map(r => {
    let base = {
      timestamp: r.timestamp,
      facility_id: r.facility_id,
      module_id: r.module_id,
      zone_id: r.zone_id,
      metric_name: r.metric_name,
      value: r.value,
      unit: r.unit,
      is_forecast: Boolean(r.is_forecast),
      anomaly: Boolean(r.anomaly),
      anomaly_score: r.anomaly_score,
      anomaly_reason: r.anomaly_reason,
      forecast: r.forecast,
      forecast_lower: r.forecast_lower,
      forecast_upper: r.forecast_upper,
      model: r.model,
      confidence: r.confidence
    };
    if (r.metadata) {
      try {
        const meta = JSON.parse(r.metadata);
        base = { ...base, ...meta };
      } catch (e) {}
    }
    return base;
  });
  
  res.json(formatted);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`BrainChain Backend running on http://localhost:${PORT}`);
});
