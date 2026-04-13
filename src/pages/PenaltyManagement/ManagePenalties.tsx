import React, { useState, useEffect } from "react";
import { penaltyAPI, employeeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Filter, Trash2, Eye } from "lucide-react";
import PageTitle from "../../components/PageTitle";

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

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <div>
          <PageTitle title="Manage Penalties" subtitle="View and manage all approved penalty records" />
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "24px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px" }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ margin: 0 }}>Penalty Filters</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
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
            <label className="input-label">Date From</label>
            <input type="date" className="input-modern" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
          </div>
          <div>
            <label className="input-label">Date To</label>
            <input type="date" className="input-modern" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "24px", overflow: "hidden" }}>
        <table className="table-modern">
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
                <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div className="avatar-small">{(rec.employee.firstName[0] + rec.employee.lastName[0])}</div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{rec.employee.firstName} {rec.employee.lastName}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{rec.employee.employeeId}</div>
                  </div>
                </td>
                <td><span className="badge badge-info-light">{rec.penaltyType}</span></td>
                <td>{new Date(rec.date).toLocaleDateString()}</td>
                <td>{rec.shift?.shiftName || "N/A"}</td>
                <td>
                  {rec.amountDeducted ? (
                    <div style={{ color: "#ef4444", fontWeight: "600" }}>â‚¹{rec.amountDeducted} Salary</div>
                  ) : rec.leaveDeducted ? (
                    <div style={{ color: "#f59e0b", fontWeight: "600" }}>{rec.leaveDeducted} Day Leave</div>
                  ) : "Warning Only"}
                </td>
                <td><span className="badge badge-success-light">Approved</span></td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="action-btn"><Eye size={16} /></button>
                    <button className="action-btn" onClick={() => handleDelete(rec.id)} style={{ color: "#ef4444" }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "60px" }}>No penalty records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagePenalties;

