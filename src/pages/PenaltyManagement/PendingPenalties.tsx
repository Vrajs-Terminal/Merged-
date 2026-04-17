import React, { useState, useEffect } from "react";
import { penaltyAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, CheckCircle2, XCircle, Info, Clock, Calendar, AlertTriangle, AlertCircle, RotateCcw, Users } from "lucide-react";
import "./Penalty.css";

interface PendingPenaltiesProps {
  user: any;
}

const PendingPenalties: React.FC<PendingPenaltiesProps> = ({ user }) => {
  const [records, setRecords] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "Pending",
    penaltyType: "All",
    employeeId: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await penaltyAPI.getRecords(filters);
      setRecords(res.data);
    } catch (err) {
      toast.error("Failed to fetch pending penalties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleApprove = async (id: number) => {
    try {
      await penaltyAPI.approve(id, { approvedBy: user.id });
      toast.success("Penalty approved");
      fetchData();
    } catch (err) {
      toast.error("Failed to approve penalty");
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await penaltyAPI.reject(id, { rejectionReason: reason });
      toast.success("Penalty rejected");
      fetchData();
    } catch (err) {
      toast.error("Failed to reject penalty");
    }
  };

  const resetFilters = () => {
    setFilters({
      status: "Pending",
      penaltyType: "All",
      employeeId: ""
    });
  };

  const activeFilterCount = (filters.penaltyType !== "All" ? 1 : 0) + (filters.status !== "Pending" ? 1 : 0);

  return (
    <div className="main-content animate-fade-in penalty-page-container">
      <div className="penalty-header">
        <div className="penalty-title-block">
          <div className="penalty-title-row">
            <AlertTriangle size={24} className="penalty-title-icon" />
            <h1 className="page-title">Pending Penalties</h1>
          </div>
          <p className="page-subtitle">Review and approve penalties before they are applied</p>
        </div>
        <div className="penalty-header-actions">
          <span className="penalty-chip">{records.length} pending</span>
        </div>
      </div>

      <div className="penalty-stats-grid penalty-pending-stats">
        <div className="penalty-stat-card penalty-stat-upgrade accent-danger">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Items in queue</span>
            <span className="penalty-stat-icon danger"><AlertTriangle size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{records.length}</strong>
          <span className="penalty-stat-note">Records awaiting review</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-warning">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Selected status</span>
            <span className="penalty-stat-icon warning"><Clock size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{filters.status}</strong>
          <span className="penalty-stat-note">Current review mode</span>
        </div>
        <div className="penalty-stat-card penalty-stat-upgrade accent-primary">
          <div className="penalty-stat-head">
            <span className="penalty-stat-label">Selected type</span>
            <span className="penalty-stat-icon primary"><Users size={14} /></span>
          </div>
          <strong className="penalty-stat-value">{filters.penaltyType}</strong>
          <span className="penalty-stat-note">Violation category in view</span>
        </div>
      </div>

      <div className="penalty-card penalty-filter-shell">
        <div className="penalty-card-header penalty-filter-header-compact">
          <div>
            <div className="penalty-inline-meta">
              <Filter size={18} className="penalty-icon-muted" />
              <h3 className="penalty-card-title">Review Filters</h3>
            </div>
            <p className="penalty-card-subtitle">Refine queue by type and approval status before taking action.</p>
          </div>
          <div className="penalty-header-actions">
            <span className="penalty-chip muted">{activeFilterCount} active</span>
            <button className="penalty-btn secondary" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
        <div className="penalty-form-grid penalty-filter-grid-pending-compact">
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
            <label className="input-label">Status</label>
            <select className="select-modern" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="penalty-card penalty-table-shell penalty-queue-shell">
        <div className="penalty-table-header">
          <div>
            <h3 className="penalty-card-title">Review Queue</h3>
            <p className="penalty-card-subtitle">Approve or reject each case with documented reason and context.</p>
          </div>
          <span className="penalty-chip">{records.length} items</span>
        </div>

        <div className="penalty-rules-grid penalty-review-grid">
          {records.map((rec) => (
            <div key={rec.id} className="penalty-rule-card animate-slide-up penalty-review-card">
            <div className="penalty-review-card-head">
              <div className="avatar" style={{ borderRadius: "12px" }}>{(rec.employee.firstName[0] + rec.employee.lastName[0])}</div>
              <div>
                <div className="penalty-strong">{rec.employee.firstName} {rec.employee.lastName}</div>
                <div className="penalty-pill subtle">{rec.penaltyType} Violation</div>
              </div>
            </div>
            <div className="penalty-review-card-body">
              <div className="penalty-inline-meta subdued">
                <Calendar size={14} /> <span>{new Date(rec.date).toLocaleDateString()}</span>
              </div>
              <div className="penalty-inline-meta subdued">
                <Clock size={14} /> <span>{rec.shift?.shiftName || "Regular"}</span>
              </div>
              <div className="penalty-inline-meta subdued penalty-full-span">
                <Info size={14} /> <span>Reason: {rec.reason || "Automatic detection"}</span>
              </div>
              <div className="penalty-spotlight penalty-full-span">
                <AlertCircle size={18} color="var(--primary)" />
                <span className="penalty-spotlight-text">
                  {rec.amountDeducted ? `Penalty: ₹${rec.amountDeducted} Salary` : rec.leaveDeducted ? `Penalty: ${rec.leaveDeducted} Day ${rec.rule?.penaltyType || ""}` : "Warning Only"}
                </span>
              </div>
            </div>
            <div className="penalty-review-card-actions">
              {rec.status === "Pending" && (
                <>
                  <button className="penalty-btn primary penalty-btn-fluid" onClick={() => handleApprove(rec.id)}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button className="penalty-btn danger penalty-btn-fluid" onClick={() => handleReject(rec.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
              {rec.status === "Approved" && <div className="penalty-status-note success"><CheckCircle2 size={18} /> Already Approved</div>}
              {rec.status === "Rejected" && <div className="penalty-status-note danger"><XCircle size={18} /> Already Rejected</div>}
            </div>
            </div>
          ))}
          {records.length === 0 && (
            <div className="penalty-empty-state penalty-empty-grid">
              <p>No {filters.status.toLowerCase()} penalties in the queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingPenalties;
