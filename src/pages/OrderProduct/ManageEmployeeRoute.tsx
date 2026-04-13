import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Filter, Save, CheckCircle, AlertCircle, Navigation
} from "lucide-react";

interface Employee { id: number; firstName?: string; lastName?: string; employeeId: string }
interface SalesRoute { id: number; routeName: string; city: { name: string }; area: { name: string } }
interface EmployeeRoute {
  id: number; status: string; assignedDate: string;
  route: SalesRoute;
  employee: Employee;
}

export default function ManageEmployeeRoute() {
  const [assignments, setAssignments] = useState<EmployeeRoute[]>([]);
  const [routes, setRoutes] = useState<SalesRoute[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({ routeId: 0, employeeId: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [assignRes, routesRes, empRes] = await Promise.all([
        axios.get('/api/geo/employee-routes'),
        axios.get('/api/geo/routes'),
        axios.get('/api/employees')
      ]);
      const safeAssignments = Array.isArray(assignRes?.data)
        ? assignRes.data
        : Array.isArray(assignRes?.data?.data)
          ? assignRes.data.data
          : [];
      const safeRoutes = Array.isArray(routesRes?.data)
        ? routesRes.data
        : Array.isArray(routesRes?.data?.data)
          ? routesRes.data.data
          : [];
      const rawEmployees = empRes?.data?.employees ?? empRes?.data?.data ?? empRes?.data;
      const safeEmployees = Array.isArray(rawEmployees) ? rawEmployees : [];

      setAssignments(safeAssignments);
      setRoutes(safeRoutes);
      setEmployees(safeEmployees);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load data: " + err.message });
    }
  };

  const handleAssign = async () => {
    if (!formData.routeId || !formData.employeeId) { alert("Please select both route and employee!"); return; }
    setLoading(true);
    try {
      await axios.post('/api/geo/employee-routes', formData);
      await fetchData();
      setMsg({ type: "success", text: "Employee assigned to route!" });
      setFormData({ routeId: 0, employeeId: 0 });
      setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed: " + err.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Navigation size={22} /> Employee Route Assignments</h2>
          <p className="lm-page-subtitle">Assign employees to sales routes — live DB integration</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Assign Form Toggle */}
      <div style={{ marginBottom: "1.5rem" }}>
        <button className="lm-btn-primary" onClick={() => setShowForm(!showForm)}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem" }}>
          <Plus size={16} /> Assign Route to Employee
        </button>
      </div>

      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">Assign Route</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Select Employee*</label>
              <select className="lm-select" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: Number(e.target.value) })}>
                <option value={0}>-- Pick Employee --</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName || ''} {e.lastName || ''} ({e.employeeId})</option>
                ))}
              </select>
            </div>
            <div className="lm-field lm-col-2">
              <label className="lm-label">Select Sales Route*</label>
              <select className="lm-select" value={formData.routeId} onChange={e => setFormData({ ...formData, routeId: Number(e.target.value) })}>
                <option value={0}>-- Pick Route --</option>
                {routes.map(r => <option key={r.id} value={r.id}>{r.routeName} ({r.city?.name} / {r.area?.name})</option>)}
              </select>
            </div>
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button className="lm-btn-primary" onClick={handleAssign} disabled={loading} style={{ flex: 1, padding: "0.7rem 1rem" }}>
                <Save size={14} /> {loading ? "Assigning..." : "Assign"}
              </button>
              <button className="lm-btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1, padding: "0.7rem 1rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Table */}
      <div className="lm-card">
        <div className="lm-card-title">Active Route Assignments ({assignments.length}) — Live DB</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>S.No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Employee</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Route</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>City / Area</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Assigned On</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No assignments yet. Assign an employee above.</td></tr>
              ) : assignments.map((a, idx) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem", color: "#475569" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>
                    {a.employee?.firstName || ''} {a.employee?.lastName || ''} <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>({a.employee?.employeeId})</span>
                  </td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{a.route?.routeName}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{a.route?.city?.name} / {a.route?.area?.name}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{new Date(a.assignedDate).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ padding: "0.3rem 0.7rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, backgroundColor: a.status === "Active" ? "#d1fae5" : "#fee2e2", color: a.status === "Active" ? "#047857" : "#dc2626" }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
