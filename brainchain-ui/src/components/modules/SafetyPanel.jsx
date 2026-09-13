import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  User,
  Activity,
  FileText,
  Filter,
  ArrowRight,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import incidentsData from '../../demo-data/incidents.json';
import { useFacilityStore } from '../../store/useFacilityStore';
import { StatCard, AlertBadge } from '../common';

export const SafetyPanel = () => {
  const { activeFacility } = useFacilityStore();
  const [severityFilter, setSeverityFilter] = useState('All');
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Filter by facility_id === activeFacility.id with fallback
  const facilityIncidents = useMemo(() => {
    if (!incidentsData) return [];
    const list = Array.isArray(incidentsData) ? incidentsData : Object.values(incidentsData);
    const filtered = list.filter((item) => item.facility_id === activeFacility?.id);
    return filtered.length > 0 ? filtered : list.filter((item) => item.facility_id === 'bput-campus');
  }, [activeFacility?.id]);

  // Safe date-fns formatters
  const formatTime = (timeStr) => {
    try {
      const date = typeof timeStr === 'string' ? parseISO(timeStr) : new Date(timeStr);
      return format(date, 'MMM d, yyyy · HH:mm');
    } catch {
      return timeStr || 'Recently';
    }
  };

  const getRelativeTime = (timeStr) => {
    try {
      const date = typeof timeStr === 'string' ? parseISO(timeStr) : new Date(timeStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = facilityIncidents.length;
    const openCount = facilityIncidents.filter((i) => i.status?.toLowerCase() === 'open').length;
    const inProgressCount = facilityIncidents.filter((i) => i.status?.toLowerCase() === 'in progress').length;
    const resolvedCount = facilityIncidents.filter((i) => i.status?.toLowerCase() === 'resolved').length;
    const highSeverityCount = facilityIncidents.filter((i) => i.severity?.toLowerCase() === 'high').length;

    return { total, openCount, inProgressCount, resolvedCount, highSeverityCount };
  }, [facilityIncidents]);

  // Check if any high-severity open incident exists
  const highSeverityOpenIncidents = useMemo(() => {
    return facilityIncidents.filter(
      (i) => i.severity?.toLowerCase() === 'high' && i.status?.toLowerCase() === 'open'
    );
  }, [facilityIncidents]);

  const hasHighSeverityOpen = highSeverityOpenIncidents.length > 0;

  // Filtered timeline incidents
  const filteredIncidents = useMemo(() => {
    if (severityFilter === 'All') return facilityIncidents;
    return facilityIncidents.filter(
      (i) => i.severity?.toLowerCase() === severityFilter.toLowerCase()
    );
  }, [facilityIncidents, severityFilter]);

  // Helper for status badge
  const renderStatus = (status) => {
    const s = status?.toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3 w-3" />
          Resolved
        </span>
      );
    }
    if (s === 'in progress') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
          <Clock className="h-3 w-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        Open
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-700 border border-red-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                Safety & Emergency Incidents
              </h2>
              <p className="text-xs text-gray-500">
                Facility risk registry, environmental hazard alarms & dispatch tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600">
            <LifeBuoy className="h-3.5 w-3.5 text-red-700" />
            Facility: {activeFacility?.name || 'Selected Campus'}
          </span>
          {hasHighSeverityOpen ? (
            <AlertBadge severity="critical" pulse text="Critical Incident Active" />
          ) : (
            <AlertBadge severity="success" text="All Hazards Contained" />
          )}
        </div>
      </div>

      {/* Critical Alert if any High-Severity Open Incident */}
      <AnimatePresence>
        {hasHighSeverityOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/60 via-red-950/40 to-gray-50/80 p-4.5 shadow-2xl shadow-rose-950/30 "
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-inner">
                  <Flame className="h-5 w-5 animate-pulse text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-rose-100">
                      High-Priority Emergency Active: {highSeverityOpenIncidents[0].type}
                    </h3>
                    <AlertBadge severity="critical" pulse size="sm" text="Immediate Attention" />
                  </div>
                  <p className="mt-1 text-xs text-rose-200/90 leading-relaxed">
                    Zone: <span className="font-semibold text-gray-900">{highSeverityOpenIncidents[0].zone}</span> — {highSeverityOpenIncidents[0].description}
                  </p>
                  <p className="mt-1 text-[11px] text-rose-300/80 font-mono">
                    Protocol: {highSeverityOpenIncidents[0].action_taken}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-md hover:bg-rose-500 transition-colors">
                  Acknowledge & Dispatch
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Open vs Resolved Count Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Incidents"
          value={stats.openCount}
          unit="active"
          icon={AlertTriangle}
          color="red"
          change={stats.openCount > 0 ? `${stats.openCount} require action` : 'Clean log'}
          changeType={stats.openCount > 0 ? 'negative' : 'positive'}
          subtitle="Real-time incident queue"
          status={stats.openCount > 0 ? 'Active Queue' : 'Clear'}
        />

        <StatCard
          title="Resolved Incidents"
          value={stats.resolvedCount}
          unit="closed"
          icon={CheckCircle2}
          color="green"
          change="+3 this week"
          changeType="positive"
          subtitle="96.4% compliance closure"
        />

        <StatCard
          title="High Severity Events"
          value={stats.highSeverityCount}
          unit="flagged"
          icon={Flame}
          color="red"
          change={hasHighSeverityOpen ? '1 unresolved' : '0 active'}
          changeType={hasHighSeverityOpen ? 'negative' : 'positive'}
          subtitle="Priority tier Level-1"
        />

        <StatCard
          title="Avg Dispatch Response"
          value="4.2"
          unit="mins"
          icon={Clock}
          color="red"
          change="-1.1m faster"
          changeType="positive"
          subtitle="Standard benchmark: < 8 mins"
        />
      </div>

      {/* Timeline Controls & Filter Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white/60 p-3.5 ">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-red-700" />
          <span className="text-xs font-semibold text-gray-800">
            Filter Incidents by Severity:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {['All', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? sev === 'High'
                    ? 'bg-rose-600 text-gray-900 shadow-sm'
                    : sev === 'Medium'
                    ? 'bg-amber-600 text-gray-900 shadow-sm'
                    : sev === 'Low'
                    ? 'bg-blue-600 text-gray-900 shadow-sm'
                    : 'bg-gray-100 text-gray-900 shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 border border-gray-200/60'
              }`}
            >
              {sev}
              {sev === 'All' && ` (${facilityIncidents.length})`}
              {sev === 'High' && ` (${stats.highSeverityCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Incident Timeline: Vertical List with Top 5 Highlighted */}
      <div className="rounded-xl border border-gray-200 bg-white/70 p-5 ">
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Incident Timeline Log</h3>
            <p className="text-xs text-gray-500">
              Chronological log with top 5 recent events highlighted
            </p>
          </div>
          <span className="text-xs text-gray-500 font-mono">
            Showing {filteredIncidents.length} events
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:bottom-0 before:left-2.5 before:top-2 before:w-0.5 before:bg-gray-50">
          <AnimatePresence>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident, index) => {
                const isRecent = index < 5;
                const isHigh = incident.severity?.toLowerCase() === 'high';
                const isSelected = selectedIncident?.id === incident.id;

                return (
                  <motion.div
                    key={incident.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedIncident(isSelected ? null : incident)}
                    className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      isSelected
                        ? 'border-red-500/60 bg-red-50/20 shadow-lg'
                        : isRecent
                        ? isHigh
                          ? 'border-red-500/40 bg-white/90 shadow-md shadow-red-950/10 hover:border-red-400/80'
                          : 'border-gray-200 bg-white/80 hover:border-gray-300'
                        : 'border-gray-200 bg-white hover:border-gray-200'
                    }`}
                  >
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -left-[30px] top-5 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-gray-50 ${
                        isHigh
                          ? 'border-rose-500 text-rose-500'
                          : incident.severity?.toLowerCase() === 'medium'
                          ? 'border-amber-400 text-amber-400'
                          : 'border-blue-400 text-blue-700'
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-500 animate-ping'
                            : incident.severity?.toLowerCase() === 'medium'
                            ? 'bg-amber-400'
                            : 'bg-blue-400'
                        }`}
                      />
                    </div>

                    {/* Top Row: Severity Badge, Recent Tag, Time, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertBadge
                          severity={incident.severity?.toLowerCase()}
                          text={`${incident.severity} Severity`}
                          size="sm"
                        />
                        {isRecent && (
                          <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                            Recent Event
                          </span>
                        )}
                        <span className="font-mono text-xs text-gray-500">#{incident.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3.5 w-3.5 text-gray-500" />
                          <span>{formatTime(incident.time)}</span>
                          <span className="text-gray-500">({getRelativeTime(incident.time)})</span>
                        </div>
                        {renderStatus(incident.status)}
                      </div>
                    </div>

                    {/* Incident Type & Description */}
                    <div className="mt-2.5">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        {incident.type}
                      </h4>
                      <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    {/* Zone & Meta Footer */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-2.5 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-red-700" />
                        <span className="font-medium text-gray-800">{incident.zone}</span>
                      </div>

                      {incident.reported_by && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                          <span>Reported by: <span className="text-gray-600">{incident.reported_by}</span></span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Action Taken Drawer */}
                    {incident.action_taken && (
                      <div className="mt-2.5 rounded-lg bg-gray-50/60 p-2.5 text-xs border border-gray-200">
                        <span className="font-semibold text-red-700">Resolution / Mitigation: </span>
                        <span className="text-gray-600">{incident.action_taken}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-gray-500">
                No incidents found matching the selected filter.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SafetyPanel;
