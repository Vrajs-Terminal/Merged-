import React, { useState, useEffect } from "react";
import { penaltyAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, Download, FileText, BarChart2, TrendingUp, CheckCircle2, AlertTriangle, RotateCcw, CalendarRange, Users } from "lucide-react";
import "./Penalty.css";

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

  const resetFilters = () => {
    setFilters({
      employeeId: "",
      departmentId: "All",
      penaltyType: "All",
      startDate: "",
      endDate: ""
    });
  };

  const totalPenalties = reportData.reduce((acc, curr) => acc + curr.totalPenalties, 0);
  const totalSalaryDeduction = reportData.reduce((acc, curr) => acc + curr.totalAmountDeducted, 0);
  const totalLeaveDeducted = reportData.reduce((acc, curr) => acc + curr.leaveDeducted, 0);
  const activeFilterCount = (filters.departmentId !== "All" ? 1 : 0) + (filters.penaltyType !== "All" ? 1 : 0) + (filters.startDate ? 1 : 0) + (filters.endDate ? 1 : 0);

  return (
    <div className="main-content animate-fade-in penalty-page-container penalty-report-page">
      <div className="penalty-header">
        <div className="penalty-title-block">
          <div className="penalty-title-row">
            <AlertTriangle size={24} className="penalty-title-icon" />
            <h1 className="page-title">Penalties Report</h1>
          </div>
          <p className="page-subtitle">Track discipline and automated deductions across your organization</p>
        </div>
        <div className="penalty-header-actions">
          <button className="penalty-btn secondary" onClick={() => handleExport("Excel")}><FileText size={16} /> Excel Export</button>
          <button className="penalty-btn secondary" onClick={() => handleExport("PDF")}><Download size={16} /> PDF Export</button>
        </div>
      </div>

      <div className="penalty-stats-grid penalty-report-stats">
        <div className="penalty-stat-card penalty-stat-upgrade accent-danger">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Total penalties</span>
            <span className="penalty-stat-icon danger"><BarChart2 size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{totalPenalties}</strong>
          <span className="penalty-stat-note">Across selected filters</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-warning">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Salary deductions</span>
            <span className="penalty-stat-icon warning"><TrendingUp size={14} /></span>
          </div>
          <strong className="penalty-stat-value">Rs. {totalSalaryDeduction.toLocaleString()}</strong>
          <span className="penalty-stat-note">Monetary impact</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-primary">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Leave deducted</span>
            <span className="penalty-stat-icon primary"><CheckCircle2 size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{totalLeaveDeducted} days</strong>
          <span className="penalty-stat-note">Converted leave impact</span>
        </div>
      </div>

      <div className="penalty-card penalty-filter-shell">
        <div className="penalty-card-header">
          <div>
            <div className="penalty-inline-meta">
              <Filter size={18} className="penalty-icon-muted" />
              <h3 className="penalty-card-title">Report Filters</h3>
              <span className="penalty-chip muted">{activeFilterCount} active</span>
            </div>
            <p className="penalty-card-subtitle">Use filters to focus on specific departments, violation types, and periods.</p>
          </div>
          <button className="penalty-btn secondary" onClick={resetFilters}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="penalty-form-grid penalty-filter-grid-report">
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
          <div className="penalty-field-span-2">
            <label className="input-label">Date Range</label>
            <div className="penalty-date-range">
              <div className="penalty-date-field">
                <CalendarRange size={15} className="penalty-icon-muted" />
                <input type="date" className="input-modern" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <span className="penalty-date-separator">to</span>
              <div className="penalty-date-field">
                <CalendarRange size={15} className="penalty-icon-muted" />
                <input type="date" className="input-modern" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="penalty-filter-meta-card">
            <span className="penalty-filter-meta-label">Rows in report</span>
            <strong className="penalty-filter-meta-value">{reportData.length}</strong>
            <span className="penalty-filter-meta-note"><Users size={12} /> Employees shown</span>
          </div>
        </div>
      </div>

      <div className="penalty-card penalty-table-shell">
        <div className="penalty-table-header">
          <div>
            <h3 className="penalty-card-title">Report summary</h3>
            <p className="penalty-card-subtitle">Department-wise breakdown of violations and deductions.</p>
          </div>
          <span className="penalty-chip">{reportData.length} employees</span>
        </div>
        <div className="penalty-table-wrap">
          <table className="penalty-table animate-slide-up">
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
                  <td className="penalty-strong">{row.employee}</td>
                  <td><span className="penalty-pill">{row.department || "General"}</span></td>
                  <td style={{ textAlign: "center", fontWeight: "700" }}>{row.totalPenalties}</td>
                  <td style={{ textAlign: "center" }} className="penalty-negative">Rs. {row.totalAmountDeducted}</td>
                  <td style={{ textAlign: "center" }} className="penalty-warning-text">{row.leaveDeducted}</td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr><td colSpan={5}><div className="penalty-empty-state">No activity in this period</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PenaltiesReport;
