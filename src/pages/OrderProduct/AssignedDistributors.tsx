import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Plus,
  Search,
  Save,
  Trash2,
  Users2,
} from "lucide-react";
import "./AssignedDistributors.css";

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

  useEffect(() => {
    fetchAll();
  }, []);

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

  const filteredRows = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return assignments.filter(row => {
      const empName = `${row.employee?.firstName || ''} ${row.employee?.lastName || ''}`.toLowerCase();
      const empId = row.employee?.employeeId || '';
      const branch = row.employee?.branch || '';
      const department = row.employee?.department?.departmentName || '';
      const distributorsText = row.distributors?.map(item => item.companyName).join(" ").toLowerCase() || "";
      return (
        empName.includes(query) ||
        empId.toLowerCase().includes(query) ||
        branch.toLowerCase().includes(query) ||
        department.toLowerCase().includes(query) ||
        distributorsText.includes(query)
      );
    });
  }, [assignments, searchTerm]);

  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const selectedCount = checkedRows.length;
  const assignedDistributorCount = assignments.reduce((sum, row) => sum + (row.distributors?.length || 0), 0);
  const selectedDistributorCount = filteredRows
    .filter(row => checkedRows.includes(row.id))
    .reduce((sum, row) => sum + (row.distributors?.length || 0), 0);

  const handleAssign = async () => {
    if (!formData.employeeId || formData.distributorIds.length === 0) {
      setMsg({ type: "error", text: "Select an employee and at least one distributor." });
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

  const handleBulkDelete = async () => {
    if (checkedRows.length === 0) {
      return;
    }

    if (!window.confirm(`Delete assignments for ${checkedRows.length} employee(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        checkedRows.map(employeeId => axios.delete(`/api/distributor-assignments/employee/${employeeId}`))
      );
      setCheckedRows([]);
      await fetchAll();
      setMsg({ type: "success", text: "Selected assignments removed successfully." });
    } catch (err: any) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to delete selected assignments." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    if (!window.confirm("Remove this employee's distributor assignments?")) {
      return;
    }

    try {
      await axios.delete(`/api/distributor-assignments/employee/${employeeId}`);
      setCheckedRows(rows => rows.filter(id => id !== employeeId));
      await fetchAll();
      setMsg({ type: "success", text: "Assignment removed successfully." });
    } catch (err: any) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to remove assignment." });
    }
  };

  return (
    <div className="lm-container lm-fade assigned-distributors-page">
      <div className="assigned-distributors-hero lm-card">
        <div className="assigned-distributors-hero-copy">
          <div className="assigned-distributors-kicker"><Users2 size={16} /> Distributor access control</div>
          <h2>Assigned Distributors</h2>
          <p>Assign distributor visibility to employees, search the current mapping, and keep access clean with one-click removals.</p>
        </div>
        <div className="assigned-distributors-stats">
          <div className="assigned-distributors-stat">
            <span>Total employees</span>
            <strong>{assignments.length}</strong>
          </div>
          <div className="assigned-distributors-stat">
            <span>Assigned distributors</span>
            <strong>{assignedDistributorCount}</strong>
          </div>
          <div className="assigned-distributors-stat">
            <span>Selected rows</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="assigned-distributors-toolbar lm-card">
        <div className="assigned-distributors-search">
          <Filter size={18} />
          <div>
            <span>Search mapping</span>
            <input
              type="text"
              className="lm-input"
              placeholder="Search employee name, ID, branch, department, or distributor"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="assigned-distributors-toolbar-actions">
          <button className="assigned-btn assigned-btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> {showForm ? "Hide Assign Form" : "Assign Distributor"}
          </button>
          <button className="assigned-btn assigned-btn-danger" onClick={handleBulkDelete} disabled={selectedCount === 0 || loading}>
            <Trash2 size={16} /> Delete Selected ({selectedCount})
          </button>
        </div>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <div className="lm-card assigned-distributors-form-card">
          <div className="lm-card-title">Assign distributor to employee</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Employee*</label>
              <select
                className="lm-select"
                value={formData.employeeId}
                onChange={e => setFormData({ ...formData, employeeId: Number(e.target.value) })}
              >
                <option value={0}>-- Select Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="lm-field lm-col-2">
              <label className="lm-label">Distributor(s)*</label>
              <div className="assigned-distributors-chip-grid">
                {distributors.map(d => (
                  <label key={d.id} className={`assigned-distributor-chip ${formData.distributorIds.includes(d.id) ? "is-selected" : ""}`}>
                    <input type="checkbox" checked={formData.distributorIds.includes(d.id)} onChange={() => toggleDistributor(d.id)} />
                    {d.companyName}
                  </label>
                ))}
                {distributors.length === 0 && <span className="assigned-distributors-empty-chip">No distributors found. Add distributors first.</span>}
              </div>
            </div>
            <div className="assigned-distributors-form-actions lm-col-4">
              <button className="assigned-btn assigned-btn-primary" onClick={handleAssign} disabled={loading}>
                <Save size={14} /> {loading ? "Saving..." : "Assign"}
              </button>
              <button className="assigned-btn assigned-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="lm-card assigned-distributors-table-card">
        <div className="assigned-distributors-table-head">
          <div>
            <h3>Employee distributor assignments</h3>
            <p>{filteredRows.length} employee record(s) in the current view</p>
          </div>
          <div className="assigned-distributors-table-meta">
            <span>{selectedDistributorCount} distributor(s) selected for removal</span>
          </div>
        </div>

        <div className="lm-table-wrap assigned-distributors-table-wrap">
          <table className="lm-table assigned-distributors-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "center", width: "50px" }}>
                  <input
                    type="checkbox"
                    onChange={e => setCheckedRows(e.target.checked ? filteredRows.map(a => a.id) : [])}
                    checked={filteredRows.length > 0 && checkedRows.length === filteredRows.length}
                  />
                </th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Sr. No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Emp. ID</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Employee Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Branch</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Department</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Assigned Distributors</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr><td colSpan={8} className="assigned-distributors-empty-state">No distributor assignments found</td></tr>
              ) : paginatedRows.map((row, idx) => (
                <tr key={row.id}>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={checkedRows.includes(row.id)}
                      onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, row.id] : checkedRows.filter(id => id !== row.id))}
                    />
                  </td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontWeight: 600 }}>{row.employee?.employeeId || '—'}</td>
                  <td style={{ padding: "1rem", fontWeight: 700, color: "#1f2937" }}>{row.employee?.firstName} {row.employee?.lastName}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{row.employee?.branch || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{row.employee?.department?.departmentName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.92rem" }}>
                    {row.distributors?.length ? row.distributors.map(d => d.companyName).join(", ") : <span className="assigned-distributors-none">None assigned</span>}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button className="assigned-row-remove-btn" onClick={() => handleDeleteEmployee(row.id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="assigned-distributors-pagination">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length}
            </span>
            <div>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
