import React, { useState, useEffect } from "react";
import { penaltyAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, Download, FileText, BarChart2, TrendingUp, CheckCircle2, AlertTriangle } from "lucide-react";

const PenaltiesReport: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: "",
    departmentId: "All",
    penaltyType: "All",
    startDate: "",
    endDate: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, depRes] = await Promise.all([
        penaltyAPI.getReport(filters),
        departmentAPI.getAll()
      ]);
      setReportData(repRes.data);
      setDepartments(depRes.data);
    } catch (err) {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleExport = (type: "Excel" | "PDF") => {
    toast.info(`Exporting report to ${type}...`);
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title"><AlertTriangle size={22} /> Penalties Report</h1>
          <p className="page-subtitle">Track discipline and automated deductions across your organization</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-secondary" onClick={() => handleExport("Excel")}><FileText size={18} /> Excel Export</button>
          <button className="btn-secondary" onClick={() => handleExport("PDF")}><Download size={18} /> PDF Export</button>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "24px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Report Filters</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label className="input-label">Department</label>
            <select className="select-modern" value={filters.departmentId} onChange={e => setFilters({...filters, departmentId: e.target.value})}>
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Penalty Type</label>
            <select className="select-modern" value={filters.penaltyType} onChange={e => setFilters({...filters, penaltyType: e.target.value})}>
              <option value="All">All Types</option>
              <option value="Late In">Late In</option>
              <option value="Early Out">Early Out</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div>
            <label className="input-label">Date From</label>
            <input type="date" className="input-modern" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Date To</label>
            <input type="date" className="input-modern" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginTop: "24px" }}>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #ef4444" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Total Penalties</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>{reportData.reduce((acc, curr) => acc + curr.totalPenalties, 0)}</h2>
            </div>
            <div style={{ background: "rgba(239, 68, 68, 0.1)", padding: "12px", borderRadius: "12px", height: "fit-content" }}><BarChart2 size={24} color="#ef4444" /></div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Salary Deductions</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>₹{reportData.reduce((acc, curr) => acc + curr.totalAmountDeducted, 0).toLocaleString()}</h2>
            </div>
            <div style={{ background: "rgba(245, 158, 11, 0.1)", padding: "12px", borderRadius: "12px", height: "fit-content" }}><TrendingUp size={24} color="#f59e0b" /></div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: "24px", borderLeft: "4px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>Leave Deducted</p>
              <h2 style={{ fontSize: "32px", margin: "8px 0" }}>{reportData.reduce((acc, curr) => acc + curr.leaveDeducted, 0)} Days</h2>
            </div>
            <div style={{ background: "rgba(var(--primary-rgb), 0.1)", padding: "12px", borderRadius: "12px", height: "fit-content" }}><CheckCircle2 size={24} color="var(--primary)" /></div>
          </div>
        </div>
      </div>

      <div className="glass-card animate-slide-up" style={{ marginTop: "24px", overflow: "hidden" }}>
        <table className="table-modern">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Department</th>
              <th style={{ textAlign: "center" }}>Total Penalties</th>
              <th style={{ textAlign: "center" }}>Deducted Amount</th>
              <th style={{ textAlign: "center" }}>Leave Deducted</th>
            </tr>
          </thead>
          <tbody>
            {(reportData as any[]).map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: "600", color: "var(--primary)" }}>{row.employee}</td>
                <td><span className="badge badge-info-light">{row.department || "General"}</span></td>
                <td style={{ textAlign: "center", fontWeight: "700" }}>{row.totalPenalties}</td>
                <td style={{ textAlign: "center", color: "#ef4444", fontWeight: "700" }}>₹{row.totalAmountDeducted}</td>
                <td style={{ textAlign: "center", color: "#f59e0b", fontWeight: "700" }}>{row.leaveDeducted}</td>
              </tr>
            ))}
            {reportData.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: "60px" }}>No activity in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PenaltiesReport;
