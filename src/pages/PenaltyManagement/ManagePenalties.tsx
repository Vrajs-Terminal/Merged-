import React, { useState, useEffect } from "react";
import { penaltyAPI, employeeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, Trash2, Eye, AlertTriangle, Wallet, CheckCircle2, Users, RotateCcw, CalendarRange } from "lucide-react";
import "./Penalty.css";

const ManagePenalties: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: "",
    penaltyType: "All",
    startDate: "",
    endDate: "",
    status: "Approved"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, empRes] = await Promise.all([
        penaltyAPI.getRecords(filters),
        employeeAPI.getAll()
      ]);
      setRecords(recRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      toast.error("Failed to fetch penalties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await penaltyAPI.deleteRecord(id);
      toast.success("Record deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete record");
    }
  };

  const resetFilters = () => {
    setFilters({
      employeeId: "",
      penaltyType: "All",
      startDate: "",
      endDate: "",
      status: "Approved"
    });
  };

  const totalSalaryDeduction = records.reduce((sum, rec) => sum + Number(rec.amountDeducted || 0), 0);
  const totalLeaveDeduction = records.reduce((sum, rec) => sum + Number(rec.leaveDeducted || 0), 0);
  const activeFilterCount = [filters.employeeId, filters.startDate, filters.endDate]
    .filter(Boolean).length + (filters.penaltyType !== "All" ? 1 : 0) + (filters.status !== "Approved" ? 1 : 0);

  return (
    <div className="main-content animate-fade-in penalty-page-container">
      <div className="penalty-header">
        <div className="penalty-title-block">
          <div className="penalty-title-row">
            <AlertTriangle size={24} className="penalty-title-icon" />
            <h1 className="page-title">Manage Penalties</h1>
          </div>
          <p className="page-subtitle">View and manage all approved penalty records</p>
        </div>
        <div className="penalty-header-actions">
          <span className="penalty-chip">{records.length} records</span>
        </div>
      </div>

      <div className="penalty-stats-grid">
        <div className="penalty-stat-card penalty-stat-upgrade accent-danger">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Approved records</span>
            <span className="penalty-stat-icon danger"><CheckCircle2 size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{records.length}</strong>
          <span className="penalty-stat-note">Current approved queue</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-warning">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Salary deductions</span>
            <span className="penalty-stat-icon warning"><Wallet size={14} /></span>
          </div>
          <strong className="penalty-stat-value">Rs. {totalSalaryDeduction.toLocaleString()}</strong>
          <span className="penalty-stat-note">Approved salary impact</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-primary">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Leave deducted</span>
            <span className="penalty-stat-icon primary"><Users size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{totalLeaveDeduction} days</strong>
          <span className="penalty-stat-note">Converted leave deductions</span>
        </div>
      </div>

      <div className="penalty-card penalty-filter-shell">
        <div className="penalty-card-header">
          <div>
            <div className="penalty-inline-meta">
              <Filter size={18} className="penalty-icon-muted" />
              <h3 className="penalty-card-title">Penalty Filters</h3>
              <span className="penalty-chip muted">{activeFilterCount} active</span>
            </div>
            <p className="penalty-card-subtitle">Filter by employee, penalty type, status, and date range.</p>
          </div>
          <button className="penalty-btn secondary" onClick={resetFilters}>
            <RotateCcw size={14} /> Reset
          </button>
        </div>
        <div className="penalty-form-grid penalty-filter-grid-manage">
          <div>
            <label className="input-label">Select Employee</label>
            <select name="employeeId" className="select-modern" value={filters.employeeId} onChange={e => setFilters({...filters, employeeId: e.target.value})}>
              <option value="">All Employees</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Penalty Type</label>
            <select name="penaltyType" className="select-modern" value={filters.penaltyType} onChange={e => setFilters({...filters, penaltyType: e.target.value})}>
              <option value="All">All Types</option>
              <option value="Late In">Late In</option>
              <option value="Early Out">Early Out</option>
              <option value="Absent">Absent</option>
              <option value="Missed Punch">Missed Punch</option>
            </select>
          </div>
          <div>
            <label className="input-label">Status</label>
            <select name="status" className="select-modern" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
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
        </div>
      </div>

      <div className="penalty-card penalty-table-shell">
        <div className="penalty-table-header">
          <div>
            <h3 className="penalty-card-title">Approved penalties</h3>
            <p className="penalty-card-subtitle">Review entries, deduction values, and each affected employee.</p>
          </div>
          <span className="penalty-chip">Approved only</span>
        </div>
        <div className="penalty-table-wrap">
          <table className="penalty-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Date</th>
                <th>Shift</th>
                <th>Deduction / Leave</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(records as any[]).map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="penalty-employee-cell">
                      <div className="avatar-small">{(rec.employee.firstName[0] + rec.employee.lastName[0])}</div>
                      <div>
                        <div className="penalty-strong">{rec.employee.firstName} {rec.employee.lastName}</div>
                        <div className="penalty-muted-text">{rec.employee.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="penalty-pill">{rec.penaltyType}</span></td>
                  <td>{new Date(rec.date).toLocaleDateString()}</td>
                  <td>{rec.shift?.shiftName || "N/A"}</td>
                  <td>
                    {rec.amountDeducted ? (
                      <div className="penalty-negative">Rs. {rec.amountDeducted} Salary</div>
                    ) : rec.leaveDeducted ? (
                      <div className="penalty-warning-text">{rec.leaveDeducted} Day Leave</div>
                    ) : "Warning Only"}
                  </td>
                  <td><span className="penalty-pill success">Approved</span></td>
                  <td>
                    <div className="penalty-row-actions">
                      <button className="penalty-icon-btn"><Eye size={16} /></button>
                      <button className="penalty-icon-btn danger" onClick={() => handleDelete(rec.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={7}><div className="penalty-empty-state">No penalty records found</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePenalties;

