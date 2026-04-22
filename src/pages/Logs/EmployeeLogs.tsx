import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Smartphone, SmartphoneNfc, Search, Filter, Layers, X, RefreshCw, ExternalLink } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { activityLogAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Logs.css";

interface EmployeeLogRow {
  id: number | string;
  dateTime: string;
  dateISO: string;
  employee: string;
  activity: string;
  location: string;
  device: string;
  details: string;
  latitude: number | null;
  longitude: number | null;
}

const parseJsonSafely = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
};

const toNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractCoordinates = (row: any, details: Record<string, unknown>): { latitude: number | null; longitude: number | null } => {
  const directLat =
    toNumber(row?.latitude) ??
    toNumber(row?.lat) ??
    toNumber(row?.locationLat) ??
    toNumber((details as any)?.latitude) ??
    toNumber((details as any)?.lat);
  const directLng =
    toNumber(row?.longitude) ??
    toNumber(row?.lng) ??
    toNumber(row?.locationLng) ??
    toNumber((details as any)?.longitude) ??
    toNumber((details as any)?.lng);

  if (directLat !== null && directLng !== null && Math.abs(directLat) <= 90 && Math.abs(directLng) <= 180) {
    return { latitude: directLat, longitude: directLng };
  }

  const source = `${row?.location || ""} ${row?.module || ""} ${row?.description || ""} ${(details as any)?.location || ""}`;
  const match = source.match(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
  if (match) {
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  return { latitude: null, longitude: null };
};

const normalizeEmployeeLog = (row: any): EmployeeLogRow => {
  const details = parseJsonSafely(row?.details);
  const dateValue = row?.dateTime || row?.createdAt || row?.timestamp || row?.updatedAt;
  const { latitude, longitude } = extractCoordinates(row, details);

  return {
    id: row?.id ?? `${String(dateValue || "na")}-${String(row?.action || "activity")}`,
    dateTime: dateValue ? new Date(dateValue).toLocaleString() : "--",
    dateISO: dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "",
    employee: row?.user?.name || row?.user || row?.userName || "System",
    activity: row?.action || row?.event || "Activity",
    location: row?.location || row?.module || row?.entity_type || "General",
    device: row?.device || row?.userAgent || "Unknown Device",
    details: row?.description || row?.entity_name || "--",
    latitude,
    longitude,
  };
};

const EmployeeLogs: React.FC = () => {
  const [logs, setLogs] = useState<EmployeeLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMapFeed, setShowMapFeed] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<string | number | null>(null);
  const [filters, setFilters] = useState({
    employee: "All Field Personnel",
    date: "",
    activity: "All Activities",
    search: "",
  });

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await activityLogAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setLogs(rows.map(normalizeEmployeeLog));
      } catch {
        toast.error("Failed to load employee logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const employeeOptions = useMemo(
    () => ["All Field Personnel", ...Array.from(new Set(logs.map((log) => log.employee).filter(Boolean)))],
    [logs],
  );

  const activityOptions = useMemo(
    () => ["All Activities", ...Array.from(new Set(logs.map((log) => log.activity).filter(Boolean)))],
    [logs],
  );

  const data = useMemo(() => {
    return logs
      .filter((log) => {
        const employeeMatch =
          filters.employee === "All Field Personnel" || log.employee === filters.employee;
        const dateMatch = !filters.date || log.dateISO === filters.date;
        const activityMatch =
          filters.activity === "All Activities" || log.activity === filters.activity;
        const q = filters.search.trim().toLowerCase();
        const searchMatch =
          !q ||
          String(log.employee || "").toLowerCase().includes(q) ||
          String(log.activity || "").toLowerCase().includes(q) ||
          String(log.location || "").toLowerCase().includes(q) ||
          String(log.details || "").toLowerCase().includes(q);

        return employeeMatch && dateMatch && activityMatch && searchMatch;
      })
      .sort((a, b) => String(b.dateTime).localeCompare(String(a.dateTime)));
  }, [logs, filters]);

  const mapRows = useMemo(
    () => data.filter((item) => item.latitude !== null && item.longitude !== null),
    [data],
  );

  const selectedMapRow = useMemo(() => {
    if (!selectedMapId) return mapRows[0] || null;
    return mapRows.find((item) => item.id === selectedMapId) || mapRows[0] || null;
  }, [mapRows, selectedMapId]);

  const openMapFeed = () => {
    if (mapRows.length === 0) {
      toast.info("No coordinates found in current employee logs");
      return;
    }

    setSelectedMapId(mapRows[0].id);
    setShowMapFeed(true);
  };

  const handleApplyFilter = () => {
    toast.info(`${data.length} employee logs matched your filters`);
  };

  const handleResetFilter = () => {
    setFilters({
      employee: "All Field Personnel",
      date: "",
      activity: "All Activities",
      search: "",
    });
    toast.info("Employee log filters reset");
  };

  const getMapEmbedUrl = (lat: number, lng: number) => {
    const delta = 0.02;
    const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
  };

  return (
    <div className="main-content animate-fade-in logs-page">
      <div className="page-header logs-header">
        <PageTitle
          title="Employee Logs (Field Activity)"
          subtitle="Track real-time employee activities, especially from mobile and on-field usage"
          icon={<MapPin size={22} />}
        />
        <div className="logs-header-actions">
           <button className="btn btn-secondary shadow-sm" onClick={openMapFeed}>
            <MapPin size={18} color="var(--primary)" /> View Map Feed
          </button>
        </div>
      </div>

      <div className="glass-card logs-filter-card">
        <div className="logs-filter-grid logs-filter-grid-4">
          <div>
            <label className="input-label">Select Employee</label>
            <select
              className="select-modern"
              value={filters.employee}
              onChange={(event) => setFilters((prev) => ({ ...prev, employee: event.target.value }))}
            >
               {employeeOptions.map((employee) => (
                <option key={employee} value={employee}>{employee}</option>
               ))}
            </select>
          </div>
          <div>
            <label className="input-label">Date Filter</label>
            <input
              type="date"
              className="input-modern"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Activity Type</label>
            <select
              className="select-modern"
              value={filters.activity}
              onChange={(event) => setFilters((prev) => ({ ...prev, activity: event.target.value }))}
            >
               {activityOptions.map((option) => (
                 <option key={option}>{option}</option>
               ))}
            </select>
          </div>
          <div className="logs-filter-actions single-row">
            <button className="btn btn-primary shadow-glow" onClick={handleApplyFilter}>
              <Filter size={18} /> Apply Filter
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilter}>
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card logs-table-card">
         <div className="logs-toolbar">
            <div className="logs-search-wrap">
               <Search size={18} className="logs-search-icon" />
              <input
                type="text"
                className="input-modern"
                placeholder="Search by activity, location or details..."
                style={{ paddingLeft: "40px", paddingRight: "36px" }}
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
              {filters.search && (
                <button className="logs-search-clear" onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}>
                  <X size={14} />
                </button>
              )}
            </div>
             <div className="logs-toolbar-meta">
                <span className="badge badge-success"><SmartphoneNfc size={12} /> Mobile Logs Live</span>
                <span className="badge badge-primary"><Layers size={12} /> Total {data.length} Units</span>
             </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Date Time</th>
                <th>Field Employee</th>
                <th>Captured Activity</th>
                <th>GPS Location / Pin</th>
                <th>Handheld Device</th>
                <th>Detailed Info</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{item.dateTime}</td>
                  <td>
                    <div className="logs-user-cell">
                       <div className="logs-avatar">{item.employee.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                       <span style={{ fontWeight: "700" }}>{item.employee}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                        {item.activity}
                    </span>
                  </td>
                  <td>
                    <div className="logs-location-cell">
                       <MapPin size={14} />
                       {item.location}
                    </div>
                  </td>
                  <td>
                     <div className="logs-device-cell">
                        <Smartphone size={12} />
                        {item.device}
                     </div>
                  </td>
                  <td style={{ fontSize: "13px" }}>{item.details}</td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={7} className="logs-empty-row">No employee logs found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className="logs-empty-row">Loading employee logs...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showMapFeed && selectedMapRow && selectedMapRow.latitude !== null && selectedMapRow.longitude !== null && (
        <div className="logs-map-modal-overlay" onClick={() => setShowMapFeed(false)}>
          <div className="logs-map-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="logs-map-modal-header">
              <h3>Employee Map Feed</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setShowMapFeed(false)}>
                <X size={14} />
              </button>
            </div>

            <div className="logs-map-modal-grid">
              <div className="logs-map-list">
                {mapRows.map((item) => (
                  <button
                    key={item.id}
                    className={`logs-map-list-item ${item.id === selectedMapRow.id ? "is-active" : ""}`}
                    onClick={() => setSelectedMapId(item.id)}
                  >
                    <strong>{item.employee}</strong>
                    <span>{item.activity}</span>
                    <small>{item.dateTime}</small>
                  </button>
                ))}
              </div>

              <div className="logs-map-canvas-wrap">
                <iframe
                  title="Employee map feed"
                  className="logs-map-canvas"
                  src={getMapEmbedUrl(selectedMapRow.latitude, selectedMapRow.longitude)}
                  loading="lazy"
                />
                <div className="logs-map-footer">
                  <span>
                    {selectedMapRow.latitude.toFixed(6)}, {selectedMapRow.longitude.toFixed(6)}
                  </span>
                  <a
                    className="btn btn-secondary"
                    href={`https://www.google.com/maps?q=${selectedMapRow.latitude},${selectedMapRow.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={14} /> Open in Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLogs;
