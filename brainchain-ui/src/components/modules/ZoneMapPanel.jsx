import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useFacilityStore } from '../../store/facilityStore';
import { useTelemetry } from '../../hooks/useTelemetry';
import { AlertTriangle, Info, Map as MapIcon, GripHorizontal } from 'lucide-react';
import { AnomalyBadge } from '../common/AnomalyBadge';

// Fix for leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Basic GeoJSON polygons for our demo facilities
const FACILITY_ZONES = {
  'bput-campus': {
    center: [22.2604, 84.8536],
    zoom: 16,
    zones: [
      { id: 'block-a', name: 'Academic Block A', coords: [[22.2610, 84.8530], [22.2615, 84.8530], [22.2615, 84.8540], [22.2610, 84.8540]] },
      { id: 'block-b', name: 'Academic Block B', coords: [[22.2595, 84.8530], [22.2600, 84.8530], [22.2600, 84.8540], [22.2595, 84.8540]] },
      { id: 'hostel',  name: 'Student Hostels',  coords: [[22.2610, 84.8550], [22.2620, 84.8550], [22.2620, 84.8560], [22.2610, 84.8560]] },
      { id: 'canteen', name: 'Central Canteen',  coords: [[22.2600, 84.8520], [22.2605, 84.8520], [22.2605, 84.8525], [22.2600, 84.8525]] },
    ]
  },
  'kims-hospital': {
    center: [20.3533, 85.8266],
    zoom: 17,
    zones: [
      { id: 'opd', name: 'Outpatient Dept (OPD)', coords: [[20.3535, 85.8260], [20.3540, 85.8260], [20.3540, 85.8265], [20.3535, 85.8265]] },
      { id: 'icu', name: 'Intensive Care (ICU)', coords: [[20.3535, 85.8268], [20.3540, 85.8268], [20.3540, 85.8273], [20.3535, 85.8273]] },
      { id: 'ward', name: 'Inpatient Wards', coords: [[20.3525, 85.8260], [20.3530, 85.8260], [20.3530, 85.8270], [20.3525, 85.8270]] },
    ]
  },
  'tcs-campus': {
    center: [19.1082, 72.8291],
    zoom: 16,
    zones: [
      { id: 'tower-1', name: 'Tower 1', coords: [[19.1085, 72.8285], [19.1090, 72.8285], [19.1090, 72.8290], [19.1085, 72.8290]] },
      { id: 'tower-2', name: 'Tower 2', coords: [[19.1085, 72.8295], [19.1090, 72.8295], [19.1090, 72.8300], [19.1085, 72.8300]] },
      { id: 'cafeteria', name: 'Food Court', coords: [[19.1075, 72.8290], [19.1080, 72.8290], [19.1080, 72.8295], [19.1075, 72.8295]] },
    ]
  }
};

const MAP_TYPE_MAP = {
  college: 'bput-campus',
  hospital: 'kims-hospital',
  corporate: 'tcs-campus'
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function ZoneMapPanel({ className = '' }) {
  const activeFacility = useFacilityStore(s => s.activeFacility);
  
  const facilityId = useMemo(() => {
    const raw = typeof activeFacility === 'object' ? activeFacility?.id : activeFacility;
    return MAP_TYPE_MAP[raw] || raw || 'bput-campus';
  }, [activeFacility]);

  const mapConfig = FACILITY_ZONES[facilityId] || FACILITY_ZONES['bput-campus'];

  // Fetch telemetry from multiple modules to overlay
  const { data: energyData } = useTelemetry('energy');
  const { data: airData } = useTelemetry('air-quality');

  // Determine zone colors based on anomalies
  const getZoneStatus = (zoneId) => {
    let hasAnomaly = false;
    let anomalyScore = 0;
    let details = [];

    // Check Energy
    const e = energyData?.find(d => d.zone_id.toLowerCase().includes(zoneId.split('-')[0]) && d.anomaly);
    if (e) {
      hasAnomaly = true;
      anomalyScore = Math.max(anomalyScore, e.anomaly_score || 0);
      details.push({ type: 'Energy', reason: e.anomaly_reason });
    }

    // Check AQI
    const a = airData?.find(d => d.zone_id.toLowerCase().includes(zoneId.split('-')[0]) && d.anomaly);
    if (a) {
      hasAnomaly = true;
      anomalyScore = Math.max(anomalyScore, a.anomaly_score || 0);
      details.push({ type: 'Air Quality', reason: a.anomaly_reason });
    }

    // Determine color
    if (!hasAnomaly) return { color: '#10b981', status: 'Normal', details: [] }; // Emerald
    if (anomalyScore > 3.5) return { color: '#ef4444', status: 'Critical Anomaly', details }; // Red
    return { color: '#f59e0b', status: 'Warning', details }; // Amber
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl group ${className}`}>
      <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-gray-900">Geospatial Overview</h2>
            <p className="text-sm font-medium text-gray-500">Live zone monitoring and anomaly mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Anomaly
            </div>
          </div>
          <div className="panel-drag-handle opacity-0 group-hover:opacity-100 p-1.5 -mr-2 rounded-md cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all" title="Drag to reorder">
            <GripHorizontal className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="flex-1 relative p-4">
        <div className="absolute inset-4 rounded-xl overflow-hidden border border-gray-200 shadow-inner z-10">
          <MapContainer 
            center={mapConfig.center} 
            zoom={mapConfig.zoom} 
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <MapUpdater center={mapConfig.center} zoom={mapConfig.zoom} />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAP_TOKEN || ''}`}
            />
            
            {mapConfig.zones.map((zone) => {
              const status = getZoneStatus(zone.id);
              
              return (
                <Polygon
                  key={zone.id}
                  positions={zone.coords}
                  pathOptions={{
                    color: status.color,
                    fillColor: status.color,
                    fillOpacity: status.status === 'Normal' ? 0.2 : 0.5,
                    weight: 2
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[200px]">
                      <div className="font-bold text-gray-900 mb-1">{zone.name}</div>
                      
                      {status.status === 'Normal' ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 p-2 rounded border border-emerald-100">
                          <Info className="w-3.5 h-3.5" /> All telemetry nominal
                        </div>
                      ) : (
                        <div className="space-y-2 mt-2">
                          <AnomalyBadge score={4.5} />
                          <div className="space-y-1">
                            {status.details.map((d, i) => (
                              <div key={i} className="text-xs bg-red-50 text-red-700 p-2 rounded border border-red-100">
                                <span className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">{d.type}</span>
                                {d.reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Polygon>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
