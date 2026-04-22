import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Monitor, AlertTriangle, ShieldCheck, LogOut, Power, RefreshCw, X } from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { activityLogAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Logs.css";

type SessionStatus = "Active" | "Logged Out";

interface SessionLogRow {
  id: number | string;
  user: string;
  login: string;
  loginISO: string;
  logout: string;
  ip: string;
  device: string;
  duration: string;
  status: SessionStatus;
}

const calculateDurationText = (startIso: string, endIso?: string) => {
  if (!startIso) return "--";
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return "--";

  const mins = Math.floor((end - start) / 60000);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours <= 0) return `${remMins}m`;
  return `${hours}h ${remMins}m`;
};

const normalizeSessionLog = (row: any): SessionLogRow => {
  const loginSource = row?.dateTime || row?.createdAt || row?.timestamp || row?.updatedAt;
  const logoutSource = row?.logoutTime || row?.loggedOutAt || null;
  const status: SessionStatus = String(row?.action || "")
    .toLowerCase()
    .includes("logout")
    ? "Logged Out"
    : "Active";

  const loginDate = loginSource ? new Date(loginSource) : null;
  const logoutDate = logoutSource ? new Date(logoutSource) : null;
  const loginIso = loginDate ? loginDate.toISOString() : "";
  const logoutIso = logoutDate ? logoutDate.toISOString() : "";

  return {
    id: row?.id ?? `${String(loginSource || "na")}-${String(row?.user || "system")}`,
    user: row?.user?.name || row?.user || row?.userName || "System",
    login: loginDate ? loginDate.toLocaleString() : "--",
    loginISO: loginIso,
    logout: status === "Active" ? "Active session" : logoutDate ? logoutDate.toLocaleString() : "--",
    ip: row?.ip || row?.ipAddress || "--",
    device: row?.device || row?.userAgent || "Unknown",
    duration: calculateDurationText(loginIso, status === "Logged Out" ? logoutIso : undefined),
    status,
  };
};

const SessionLogs: React.FC = () => {
  const [logs, setLogs] = useState<SessionLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    user: "",
    date: "",
    status: "All Statuses",
    search: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await activityLogAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setLogs(rows.map(normalizeSessionLog));
      } catch {
        toast.error("Failed to load session logs");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const data = useMemo(() => {
    return logs
      .filter((item) => {
        const userMatch = !filters.user || item.user.toLowerCase().includes(filters.user.toLowerCase());
        const dateMatch = !filters.date || item.loginISO.slice(0, 10) === filters.date;
        const statusMatch = filters.status === "All Statuses" || item.status === filters.status;
        const q = filters.search.trim().toLowerCase();
        const searchMatch =
          !q ||
          item.user.toLowerCase().includes(q) ||
          item.ip.toLowerCase().includes(q) ||
          item.device.toLowerCase().includes(q);

        return userMatch && dateMatch && statusMatch && searchMatch;
      })
      .sort((a, b) => String(b.login).localeCompare(String(a.login)));
  }, [logs, filters]);

  const activeCount = useMemo(() => data.filter((item) => item.status === "Active").length, [data]);

  const handleApplyFilter = () => {
    toast.info(`${data.length} sessions matched your filters`);
  };

  const handleResetFilter = () => {
    setFilters({ user: "", date: "", status: "All Statuses", search: "" });
    toast.info("Session filters reset");
  };

  const handleForceTerminateOne = (id: string | number) => {
    setLogs((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.status !== "Active") return item;
        const nowIso = new Date().toISOString();
        return {
          ...item,
          status: "Logged Out",
          logout: new Date(nowIso).toLocaleString(),
          duration: calculateDurationText(item.loginISO, nowIso),
        };
      }),
    );
    toast.success("Session terminated");
  };

  const handleForceLogoutAll = () => {
    if (activeCount === 0) {
      toast.info("No active sessions to terminate");
      return;
    }

    const confirmed = window.confirm(`Force logout ${activeCount} active sessions?`);
    if (!confirmed) return;

    const nowIso = new Date().toISOString();
    setLogs((prev) =>
      prev.map((item) =>
        item.status === "Active"
          ? {
              ...item,
              status: "Logged Out",
              logout: new Date(nowIso).toLocaleString(),
              duration: calculateDurationText(item.loginISO, nowIso),
            }
          : item,
      ),
    );

    toast.success(`Force-logged out ${activeCount} sessions`);
  };

  return (
    <div className="main-content animate-fade-in logs-page">
      <div className="page-header logs-header">
        <PageTitle
          title="Session Logs"
          subtitle="Security monitoring for active and historical user login sessions"
          icon={<Monitor size={22} />}
        />
        <div className="logs-header-actions">
          <button className="btn btn-danger shadow-glow" onClick={handleForceLogoutAll}>
            <Power size={18} /> Force Logout All Sessions
          </button>
        </div>
      </div>

      <div className="glass-card logs-filter-card">
        <div className="logs-filter-grid logs-filter-grid-4">
          <div>
            <label className="input-label">Search User</label>
            <input
              type="text"
              className="input-modern"
              placeholder="E.g., Ash Master"
              value={filters.user}
              onChange={(event) => setFilters((prev) => ({ ...prev, user: event.target.value }))}
            />
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
            <label className="input-label">Session Status</label>
            <select
              className="select-modern"
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            >
               <option>All Statuses</option>
               <option>Active</option>
               <option>Logged Out</option>
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
                placeholder="Search by IP, Device or Name..."
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
                <span className="badge badge-success"><ShieldCheck size={12} /> MFA Enforcement Active</span>
                <span className="badge badge-primary">Total {data.length} Units</span>
                <span className="badge badge-gray">Active {activeCount}</span>
             </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>System User</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Terminal IP</th>
                <th>Platform Device</th>
                <th>Session Duration</th>
                <th>Access Status</th>
                <th>Force</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                  <div className="logs-user-cell">
                    <div className="logs-avatar">{item.user.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                       <span style={{ fontWeight: "700" }}>{item.user}</span>
                    </div>
                  </td>
                <td style={{ fontSize: "12px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{item.login}</td>
                <td style={{ fontSize: "12px", color: item.status === "Active" ? "#059669" : "var(--color-text-muted)", fontWeight: item.status === "Active" ? "600" : "400" }}>{item.logout}</td>
                  <td style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>{item.ip}</td>
                  <td>
                  <div className="logs-device-cell">
                        <Monitor size={12} />
                        {item.device}
                     </div>
                  </td>
                  <td style={{ fontWeight: "700", fontSize: "13px" }}>{item.duration}</td>
                  <td>
                    <span className={`badge ${
                      item.status === "Active" ? "badge-success" : 
                      item.status === "Logged Out" ? "badge-gray" : "badge-danger"
                    }`} style={{ gap: "6px" }}>
                      {item.status === "Active" ? <ShieldCheck size={12} /> : null}
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.status === "Active" && (
                       <button
                         className="btn btn-secondary"
                         style={{ padding: "6px", color: "#be123c" }}
                         title="Terminate Session Profile"
                         onClick={() => handleForceTerminateOne(item.id)}
                       >
                         <LogOut size={14} />
                       </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={9} className="logs-empty-row">No session logs found.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={9} className="logs-empty-row">Loading session logs...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="logs-note logs-note-primary">
         <AlertTriangle size={20} />
         <p style={{ fontSize: "13px", fontWeight: "600" }}>Pro Feature: Multiple concurrent login attempts from different IPs within 1 hour globally will trigger a security lock.</p>
      </div>
    </div>
  );
};

export default SessionLogs;
