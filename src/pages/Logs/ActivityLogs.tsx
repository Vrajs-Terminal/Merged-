import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  User,
  Monitor,
  AlertTriangle,
  Layers,
  RefreshCw,
  X,
} from "lucide-react";
import PageTitle from "../../components/PageTitle";
import { activityLogAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Logs.css";

interface ActivityLogRow {
  id: number | string;
  dateTime: string;
  dateISO: string;
  user: string;
  module: string;
  action: string;
  description: string;
  ip: string;
  device: string;
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

const normalizeActivityLog = (row: any): ActivityLogRow => {
  const details = parseJsonSafely(row?.details);
  const dateValue = row?.dateTime || row?.createdAt || row?.timestamp || row?.updatedAt;
  const user =
    row?.user?.name ||
    row?.userName ||
    row?.user ||
    (typeof details.user === "string" ? details.user : "") ||
    "System";
  const moduleName =
    row?.module ||
    row?.entity_type ||
    row?.entityType ||
    (typeof details.module === "string" ? details.module : "") ||
    "General";
  const action = row?.action || row?.event || "View";
  const description =
    row?.description ||
    row?.entity_name ||
    row?.entityName ||
    (typeof details.description === "string" ? details.description : "") ||
    "--";
  const ip = row?.ip || row?.ipAddress || (typeof details.ip === "string" ? details.ip : "") || "--";
  const device = row?.device || row?.userAgent || (typeof details.device === "string" ? details.device : "") || "--";

  return {
    id: row?.id ?? `${String(dateValue || "na")}-${String(action)}`,
    dateTime: dateValue ? new Date(dateValue).toLocaleString() : "--",
    dateISO: dateValue ? new Date(dateValue).toISOString().slice(0, 10) : "",
    user,
    module: moduleName,
    action,
    description,
    ip,
    device,
  };
};

const ActivityLogs: React.FC = () => {
  const [data, setData] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [denseView, setDenseView] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    user: "All Users",
    module: "All Modules",
    action: "All Actions",
    search: "",
  });

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        const res = await activityLogAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setData(rows.map(normalizeActivityLog));
      } catch {
        toast.error("Failed to load activity logs");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const userOptions = useMemo(
    () => ["All Users", ...Array.from(new Set(data.map((item) => item.user).filter(Boolean)))] as string[],
    [data],
  );

  const moduleOptions = useMemo(
    () => ["All Modules", ...Array.from(new Set(data.map((item) => item.module).filter(Boolean)))] as string[],
    [data],
  );

  const actionOptions = useMemo(
    () => ["All Actions", ...Array.from(new Set(data.map((item) => item.action).filter(Boolean)))] as string[],
    [data],
  );

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const dateMatch = !filters.date || item.dateISO === filters.date;
      const userMatch = filters.user === "All Users" || item.user === filters.user;
      const moduleMatch = filters.module === "All Modules" || item.module === filters.module;
      const actionMatch = filters.action === "All Actions" || item.action === filters.action;
      const q = filters.search.trim().toLowerCase();
      const searchMatch =
        !q ||
        item.description.toLowerCase().includes(q) ||
        item.ip.toLowerCase().includes(q) ||
        item.user.toLowerCase().includes(q) ||
        item.module.toLowerCase().includes(q);

      return dateMatch && userMatch && moduleMatch && actionMatch && searchMatch;
    });
  }, [data, filters]);

  const handleApplyFilters = () => {
    toast.info(`${filteredData.length} logs matched your filters`);
  };

  const handleResetFilters = () => {
    setFilters({
      date: "",
      user: "All Users",
      module: "All Modules",
      action: "All Actions",
      search: "",
    });
    toast.info("Activity filters reset");
  };

  const exportAsCsv = () => {
    if (filteredData.length === 0) {
      toast.info("No activity logs available to export");
      return;
    }

    const rows = [
      ["Date & Time", "System User", "Module", "Action", "Activity Description", "Terminal IP", "Platform Device"],
      ...filteredData.map((item) => [item.dateTime, item.user, item.module, item.action, item.description, item.ip, item.device]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Activity logs exported to Excel");
  };

  const exportAsPdf = () => {
    if (filteredData.length === 0) {
      toast.info("No activity logs available to export");
      return;
    }

    const rowsHtml = filteredData
      .slice(0, 200)
      .map(
        (item) => `
          <tr>
            <td>${item.dateTime}</td>
            <td>${item.user}</td>
            <td>${item.module}</td>
            <td>${item.action}</td>
            <td>${item.description}</td>
            <td>${item.ip}</td>
          </tr>
        `,
      )
      .join("");

    const popup = window.open("", "_blank", "width=1024,height=760");
    if (!popup) {
      toast.error("Popup blocked. Please allow popups to generate PDF.");
      return;
    }

    popup.document.write(`
      <html>
      <head>
        <title>Activity Logs Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { margin-bottom: 8px; }
          p { color: #475569; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>Activity Logs</h1>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>Module</th>
              <th>Action</th>
              <th>Description</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    toast.success("Activity PDF ready for print");
  };

  return (
    <div className="main-content animate-fade-in logs-page">
      <div className="page-header logs-header">
        <PageTitle
          title="Activity Logs"
          subtitle="Real-time system-wide activity tracking for audit and security monitoring"
          icon={<Layers size={22} />}
        />
        <div className="logs-header-actions">
          <button className="btn btn-secondary shadow-sm" onClick={exportAsCsv}>
            <FileSpreadsheet size={18} color="#16a34a" /> Excel
          </button>
          <button className="btn btn-secondary shadow-sm" onClick={exportAsPdf}>
            <FileText size={18} color="#dc2626" /> PDF
          </button>
        </div>
      </div>

      <div className="glass-card logs-filter-card">
        <div className="logs-filter-grid logs-filter-grid-5">
          <div>
            <label className="input-label">Date Range</label>
            <input
              type="date"
              className="input-modern"
              value={filters.date}
              onChange={(event) => setFilters((prev) => ({ ...prev, date: event.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">User / Employee</label>
            <select
              className="select-modern"
              value={filters.user}
              onChange={(event) => setFilters((prev) => ({ ...prev, user: event.target.value }))}
            >
               {userOptions.map((user) => (
                <option key={user} value={user}>{user}</option>
               ))}
            </select>
          </div>
          <div>
            <label className="input-label">Module Filter</label>
            <select
              className="select-modern"
              value={filters.module}
              onChange={(event) => setFilters((prev) => ({ ...prev, module: event.target.value }))}
            >
               {moduleOptions.map((moduleName) => (
                <option key={moduleName} value={moduleName}>{moduleName}</option>
               ))}
            </select>
          </div>
          <div>
            <label className="input-label">Action Type</label>
            <select
              className="select-modern"
              value={filters.action}
              onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
            >
               {actionOptions.map((action) => (
                <option key={action} value={action}>{action}</option>
               ))}
            </select>
          </div>
          <div className="logs-filter-actions">
            <button className="btn btn-primary shadow-glow" onClick={handleApplyFilters}>
              <Filter size={18} /> filter Logs
            </button>
            <button className="btn btn-secondary" onClick={handleResetFilters}>
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
                 placeholder="Search by description, IP or user..."
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
                <span className="badge badge-success">Live Feed Active</span>
                <span className="badge badge-primary">Total {filteredData.length} Logs</span>
                <button
                  className="btn btn-secondary shadow-sm"
                  style={{ padding: "8px" }}
                  onClick={() => setDenseView((prev) => !prev)}
                  title="Toggle compact rows"
                >
                  <Layers size={16} />
                </button>
             </div>
         </div>

        <div style={{ overflowX: "auto" }}>
          <table className={`table-modern ${denseView ? "logs-table-dense" : ""}`}>
            <thead>
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>System User</th>
                <th>Module</th>
                <th>Action</th>
                <th>Activity Description</th>
                <th>Terminal IP</th>
                <th>Platform Device</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredData.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td style={{ fontSize: "13px", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{item.dateTime}</td>
                  <td>
                    <div className="logs-user-cell">
                       <User size={14} color="var(--primary)" />
                       <span style={{ fontWeight: "700" }}>{item.user}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{item.module}</span></td>
                  <td>
                    <span className="badge badge-success">
                       {item.action}
                    </span>
                  </td>
                  <td style={{ maxWidth: "250px", fontSize: "13px" }}>{item.description}</td>
                  <td style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums" }}>{item.ip}</td>
                  <td>
                     <div className="logs-device-cell">
                        <Monitor size={12} />
                        {item.device}
                     </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="logs-empty-row">No activity logs found for selected filters.</td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={8} className="logs-empty-row">Loading activity logs...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       <div className="logs-note logs-note-danger">
         <AlertTriangle size={20} />
         <p style={{ fontSize: "13px", fontWeight: "600" }}>Important: System logs are retained for 365 days for compliance purposes. Deletions from this view do not purge permanent server-side backups.</p>
      </div>
    </div>
  );
};

export default ActivityLogs;
