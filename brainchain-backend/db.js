const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'brainchain.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS facilities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    activeModules TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    facility_id TEXT,
    module_id TEXT,
    zone_id TEXT,
    metric_name TEXT,
    value REAL,
    unit TEXT,
    is_forecast BOOLEAN,
    anomaly BOOLEAN,
    anomaly_score REAL,
    anomaly_reason TEXT,
    forecast REAL,
    forecast_lower REAL,
    forecast_upper REAL,
    model TEXT,
    confidence REAL,
    metadata JSON
  );
`);

// Function to seed database from UI demo-data
function seedDatabase() {
  const facilityCount = db.prepare('SELECT COUNT(*) as count FROM facilities').get().count;
  if (facilityCount > 0) return; // Already seeded

  console.log("Seeding database from JSON files...");
  
  // Insert default facilities
  const insertFac = db.prepare('INSERT INTO facilities (id, name, location, type, activeModules) VALUES (?, ?, ?, ?, ?)');
  const defaultModules = JSON.stringify(['energy', 'water', 'waste', 'traffic', 'safety', 'scorecard', 'air_quality']);
  
  insertFac.run('bput-campus', 'BPUT Engineering Campus', 'Rourkela, Odisha', 'college', defaultModules);
  insertFac.run('kims-hospital', 'Apollo - KIMS Hospital', 'Bhubaneswar, Odisha', 'hospital', defaultModules);
  insertFac.run('tcs-campus', 'TCS Infopark', 'Mumbai, India', 'corporate', defaultModules);

  // Read JSON files
  const dataDir = path.resolve(__dirname, '../brainchain-ui/src/demo-data');
  const modules = ['energy', 'water', 'waste', 'air-quality', 'traffic'];
  
  const insertTel = db.prepare(`
    INSERT INTO telemetry (
      timestamp, facility_id, module_id, zone_id, metric_name, value, unit, 
      is_forecast, anomaly, anomaly_score, anomaly_reason, forecast, 
      forecast_lower, forecast_upper, model, confidence, metadata
    ) VALUES (
      @timestamp, @facility_id, @module_id, @zone_id, @metric_name, @value, @unit, 
      @is_forecast, @anomaly, @anomaly_score, @anomaly_reason, @forecast, 
      @forecast_lower, @forecast_upper, @model, @confidence, @metadata
    )
  `);

  db.transaction(() => {
    for (const mod of modules) {
      try {
        const fileData = JSON.parse(fs.readFileSync(path.join(dataDir, `${mod}.json`), 'utf-8'));
        for (const item of fileData) {
          // Flatten any dynamic keys into metadata
          const coreKeys = new Set(['timestamp', 'facility_id', 'module_id', 'zone_id', 'metric_name', 'value', 'unit', 'is_forecast', 'anomaly', 'anomaly_score', 'anomaly_reason', 'forecast', 'forecast_lower', 'forecast_upper', 'model', 'confidence']);
          const metadata = {};
          for (const key in item) {
            if (!coreKeys.has(key)) {
              metadata[key] = item[key];
            }
          }
          
          insertTel.run({
            timestamp: item.timestamp || item.time || new Date().toISOString(),
            facility_id: item.facility_id,
            module_id: item.module_id || mod.replace('-', '_'),
            zone_id: item.zone_id || 'Global',
            metric_name: item.metric_name || 'value',
            value: item.value ?? null,
            unit: item.unit || '',
            is_forecast: item.is_forecast ? 1 : 0,
            anomaly: item.anomaly ? 1 : 0,
            anomaly_score: item.anomaly_score ?? null,
            anomaly_reason: item.anomaly_reason || null,
            forecast: item.forecast ?? null,
            forecast_lower: item.forecast_lower ?? null,
            forecast_upper: item.forecast_upper ?? null,
            model: item.model || null,
            confidence: item.confidence ?? null,
            metadata: JSON.stringify(metadata)
          });
        }
      } catch (err) {
        console.error(`Skipping ${mod}.json:`, err.message);
      }
    }
  })();
  console.log("Database seeded successfully.");
}

seedDatabase();

module.exports = db;
