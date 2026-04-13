import React, { useState, useEffect } from "react";
import { 
  BarChart2, FileText, Download, Filter, 
  Users, TrendingUp, Zap
} from "lucide-react";
import { eventAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const EventsReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    eventType: "All",
    branchId: "All",
    departmentId: "All"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, brRes, depRes] = await Promise.all([
        eventAPI.getReport(filters),
        branchAPI.getAll(),
        departmentAPI.getAll()
      ]);
      setReportData(repRes.data);
      setBranches(brRes.data);
      setDepartments(depRes.data);
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleExport = (type: "Excel" | "PDF") => {
    toast.info(`Exporting to ${type}...`);
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title"><Zap size={22} /> Events Participation Report</h1>
          <p className="page-subtitle">Track attendance and employee engagement levels</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary" onClick={() => handleExport("Excel")}><FileText size={18} /> Export Excel</button>
          <button className="btn-secondary" onClick={() => handleExport("PDF")}><Download size={18} /> Export PDF</button>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "24px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Report Filters</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label className="input-label">Date From</label>
            <input type="date" className="input-modern" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Date To</label>
            <input type="date" className="input-modern" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Event Type</label>
            <select className="select-modern" value={filters.eventType} onChange={e => setFilters({...filters, eventType: e.target.value})}>
              <option value="All">All Types</option>
              <option value="Meeting">Meeting</option>
              <option value="Training">Training</option>
              <option value="Celebration">Celebration</option>
              <option value="Webinar">Webinar</option>
            </select>
          </div>
          <div>
            <label className="input-label">Branch</label>
            <select className="select-modern" value={filters.branchId} onChange={e => setFilters({...filters, branchId: e.target.value})}>
              <option value="All">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Department</label>
            <select className="select-modern" value={filters.departmentId} onChange={e => setFilters({...filters, departmentId: e.target.value})}>
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
            </select>
          </div>
        </div>
      </div>

      {!loading && (
      <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Total Events</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>{reportData.length}</h2>
            </div>
            <div style={{ background: "var(--primary-light)", padding: "12px", borderRadius: "12px", height: "fit-content" }}><BarChart2 size={24} color="var(--primary)" /></div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #10b981" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Avg Participation</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>
                {reportData.length > 0 ? (reportData.reduce((acc, curr) => acc + curr.participationRate, 0) / reportData.length).toFixed(1) : 0}%
              </h2>
            </div>
            <div style={{ background: "#ecfdf5", padding: "12px", borderRadius: "12px", height: "fit-content" }}><TrendingUp size={24} color="#10b981" /></div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #6366f1" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Total Invited</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>
                {reportData.reduce((acc, curr) => acc + curr.totalInvited, 0)}
              </h2>
            </div>
            <div style={{ background: "#eef2ff", padding: "12px", borderRadius: "12px", height: "fit-content" }}><Users size={24} color="#6366f1" /></div>
          </div>
        </div>
      </div>

      <div className="glass-card animate-slide-up" style={{ marginTop: "24px" }}>
        <table className="table-modern">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Location</th>
              <th style={{ textAlign: "center" }}>Total Invited</th>
              <th style={{ textAlign: "center" }}>Attended</th>
              <th style={{ textAlign: "center" }}>Not Attended</th>
              <th style={{ textAlign: "center" }}>Participation %</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: "600" }}>{row.eventName}</td>
                <td><span className="badge badge-primary-light">{row.type}</span></td>
                <td>{new Date(row.date).toLocaleDateString()}</td>
                <td>{row.location}</td>
                <td style={{ textAlign: "center", fontWeight: "600" }}>{row.totalInvited}</td>
                <td style={{ textAlign: "center", color: "#10b981", fontWeight: "600" }}>{row.attended}</td>
                <td style={{ textAlign: "center", color: "#ef4444", fontWeight: "600" }}>{row.notAttended}</td>
                <td style={{ textAlign: "center" }}>
                   <div style={{ fontWeight: "700", color: row.participationRate > 70 ? "#10b981" : row.participationRate > 40 ? "#f59e0b" : "#ef4444" }}>
                      {row.participationRate.toFixed(1)}%
                   </div>
                </td>
              </tr>
            ))}
            {reportData.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: "60px" }}>No report data found</td></tr>}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
};

export default EventsReport;
