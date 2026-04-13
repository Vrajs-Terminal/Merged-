import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Filter, Search, Save, CheckCircle, AlertCircle, Users2
} from "lucide-react";

interface Employee { id: number; firstName?: string; lastName?: string; employeeId: string; branch?: string; department?: { departmentName?: string } }
interface Distributor { id: number; companyName: string }
interface Assignment {
  id: number;
  employee: Employee;
  distributors: Distributor[];
  createdAt?: string;
}

export default function AssignedDistributors() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [formData, setFormData] = useState({ employeeId: 0, distributorIds: [] as number[] });

  const itemsPerPage = 25;

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [assignRes, empRes, distRes] = await Promise.all([
        axios.get('/api/distributor-assignments'),
        axios.get('/api/employees'),
        axios.get('/api/distributors')
      ]);
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : assignRes.data?.assignments || []);
      setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data?.employees || []);
      setDistributors(Array.isArray(distRes.data) ? distRes.data : distRes.data?.distributors || []);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load data: " + err.message });
    }
  };

  const filteredRows = assignments.filter(row => {
    const empName = `${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`.toLowerCase();
    const empId = row.employee?.employeeId || '';
    return empName.includes(searchTerm.toLowerCase()) || empId.includes(searchTerm);
  });

  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const handleAssign = async () => {
    if (!formData.employeeId || formData.distributorIds.length === 0) {
      alert("Select employee and at least one distributor!");
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/distributor-assignments', formData);
      await fetchAll();
      setMsg({ type: "success", text: "Distributor assigned successfully!" });
      setFormData({ employeeId: 0, distributorIds: [] });
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed: " + err.message });
    } finally { setLoading(false); }
  };

  const toggleDistributor = (id: number) => {
    setFormData(f => ({
      ...f, distributorIds: f.distributorIds.includes(id) ? f.distributorIds.filter(d => d !== id) : [...f.distributorIds, id]
    }));
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Users2 size={22} /> Assigned Distributors</h2>
          <p className="lm-page-subtitle">Assign distributors to employees for controlled order access — Live DB</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filter/search bar */}
      <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
        <div className="lm-card-title"><Filter size={18} /> Search</div>
        <div className="lm-form-grid">
          <div className="lm-field lm-col-2" style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" className="lm-input" placeholder="Search employee name or ID…"
              value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className="lm-btn-primary" onClick={() => setShowForm(!showForm)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem" }}>
          <Plus size={16} /> Assign Distributor
        </button>
        {checkedRows.length > 0 && (
          <button style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "0.375rem", cursor: "pointer" }}>
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        )}
      </div>

      {/* Assignment Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">Assign Distributor to Employee</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Employee*</label>
              <select className="lm-select" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: Number(e.target.value) })}>
                <option value={0}>-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="lm-field lm-col-2">
              <label className="lm-label">Distributor(s)*</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", padding: "0.5rem", border: "1px solid #e2e8f0", borderRadius: "0.375rem", maxHeight: "150px", overflowY: "auto" }}>
                {distributors.map(d => (
                  <label key={d.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", backgroundColor: formData.distributorIds.includes(d.id) ? "#dbeafe" : "#f8fafc", fontSize: "0.875rem" }}>
                    <input type="checkbox" checked={formData.distributorIds.includes(d.id)} onChange={() => toggleDistributor(d.id)} />
                    {d.companyName}
                  </label>
                ))}
                {distributors.length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>No distributors found — add distributors first</span>}
              </div>
            </div>
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button className="lm-btn-primary" onClick={handleAssign} disabled={loading} style={{ flex: 1, padding: "0.7rem 1rem" }}>
                <Save size={14} /> {loading ? "Saving..." : "Assign"}
              </button>
              <button className="lm-btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "0.7rem 1rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Employee–Distributor Assignments ({filteredRows.length} employees — Live DB)</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "center", width: "50px" }}>
                  <input type="checkbox" onChange={e => setCheckedRows(e.target.checked ? filteredRows.map(a => a.id) : [])}
                    checked={checkedRows.length === filteredRows.length && filteredRows.length > 0} />
                </th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Sr. No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Emp. ID</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Employee Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Branch</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Department</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Assigned Distributors</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No distributor assignments found</td></tr>
              ) : paginatedRows.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e2e8f0" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <input type="checkbox" checked={checkedRows.includes(row.id)}
                      onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, row.id] : checkedRows.filter(id => id !== row.id))} />
                  </td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontWeight: 500 }}>{row.employee?.employeeId || '—'}</td>
                  <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{row.employee?.firstName} {row.employee?.lastName}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{row.employee?.branch || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{row.employee?.department?.departmentName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>
                    {row.distributors?.length ? row.distributors.map(d => d.companyName).join(", ") : <span style={{ color: "#94a3b8", fontStyle: "italic" }}>None assigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", opacity: currentPage === 1 ? 0.5 : 1 }}>Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
