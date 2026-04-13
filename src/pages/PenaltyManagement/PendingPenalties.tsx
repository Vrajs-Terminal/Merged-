import React, { useState, useEffect } from "react";
import { penaltyAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, CheckCircle2, XCircle, Info, Clock, Calendar, AlertTriangle } from "lucide-react";

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

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title"><AlertTriangle size={22} /> Pending Penalties</h1>
          <p className="page-subtitle">Review and approve penalties before they are applied</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "24px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Review Filters</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
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

      <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {records.map((rec) => (
          <div key={rec.id} className="glass-card animate-slide-up" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px", display: "flex", gap: "12px", borderBottom: "1px solid var(--border-color)" }}>
              <div className="avatar" style={{ borderRadius: "12px" }}>{(rec.employee.firstName[0] + rec.employee.lastName[0])}</div>
              <div>
                <div style={{ fontWeight: "600", fontSize: "16px" }}>{rec.employee.firstName} {rec.employee.lastName}</div>
                <div style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "500" }}>{rec.penaltyType} Violation</div>
              </div>
            </div>
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                <Calendar size={14} /> <span>{new Date(rec.date).toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                <Clock size={14} /> <span>{rec.shift?.shiftName || "Regular"}</span>
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "var(--text-muted)" }}>
                <Info size={14} /> <span>Reason: {rec.reason || "Automatic detection"}</span>
              </div>
              <div style={{ gridColumn: "1 / -1", background: "var(--primary-light)", padding: "10px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <AlertCircle size={18} color="var(--primary)" />
                <span style={{ fontWeight: "600", color: "var(--primary)" }}>
                  {rec.amountDeducted ? `Penalty: ₹${rec.amountDeducted} Salary` : rec.leaveDeducted ? `Penalty: ${rec.leaveDeducted} Day ${rec.rule?.penaltyType || ""}` : "Warning Only"}
                </span>
              </div>
            </div>
            <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.2)", display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)" }}>
              {rec.status === "Pending" && (
                <>
                  <button className="btn-primary" style={{ flex: 1, padding: "8px" }} onClick={() => handleApprove(rec.id)}>
                    <CheckCircle2 size={16} /> Approve
                  </button>
                  <button className="btn-secondary" style={{ flex: 1, padding: "8px", background: "#ef4444", color: "white", borderColor: "#ef4444" }} onClick={() => handleReject(rec.id)}>
                    <XCircle size={16} /> Reject
                  </button>
                </>
              )}
              {rec.status === "Approved" && <div style={{ width: "100%", textAlign: "center", color: "#10b981", fontWeight: "600" }}><CheckCircle2 size={18} /> Already Approved</div>}
              {rec.status === "Rejected" && <div style={{ width: "100%", textAlign: "center", color: "#ef4444", fontWeight: "600" }}><XCircle size={18} /> Already Rejected</div>}
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "60px", textAlign: "center" }}>
            <p>No {filters.status.toLowerCase()} penalties in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal AlertCircle if missing from imports though I have it in previous thoughts, just in case
const AlertCircle = ({ size, color }: any) => <Info size={size} color={color} />;

export default PendingPenalties;
