import { useState, useEffect } from "react";
import axios from "axios";
import "./shiftAssignment.css";
import { UserCheck, Search, Save, AlertCircle, CheckCircle, X } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}`;

function ShiftAssignment() {
    const [shifts, setShifts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [form, setForm] = useState({
        shiftId: "",
        assignedBy: "Individual",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        selectedEmployees: [] as number[],
        departmentFilter: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, shiftRes, assignRes] = await Promise.all([
                    axios.get(`${API}/employees`),
                    axios.get(`${API}/shifts`),
                    axios.get(`${API}/shifts/assignments/list`),
                ]);
                setEmployees(empRes.data.employees || empRes.data);
                setShifts(shiftRes.data.shifts);
                setAssignments(assignRes.data.assignments);
            } catch {
                /* ignore */
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const departments = [...new Set(employees.map((e: any) => e.department).filter(Boolean))];

    const filteredEmployees = employees.filter((e: any) => {
        const matchSearch = `${e.firstName} ${e.lastName} ${e.employeeId}`.toLowerCase().includes(search.toLowerCase());
        const matchDept = form.departmentFilter ? e.department === form.departmentFilter : true;
        return matchSearch && matchDept;
    });

    const toggleEmployee = (id: number) => {
        setForm(prev => ({
            ...prev,
            selectedEmployees: prev.selectedEmployees.includes(id)
                ? prev.selectedEmployees.filter(x => x !== id)
                : [...prev.selectedEmployees, id]
        }));
    };

    const selectAllFiltered = () => {
        const ids = filteredEmployees.map((e: any) => e.id);
        setForm(prev => ({ ...prev, selectedEmployees: [...new Set([...prev.selectedEmployees, ...ids])] }));
    };

    const clearSelection = () => setForm(prev => ({ ...prev, selectedEmployees: [] }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.shiftId) { setMsg({ type: "error", text: "Please select a shift." }); return; }
        if (form.selectedEmployees.length === 0) { setMsg({ type: "error", text: "Select at least one employee." }); return; }
        setSaving(true);
        setMsg(null);
        try {
            await axios.post(`${API}/shifts/assignments/assign`, {
                employeeIds: form.selectedEmployees,
                shiftId: parseInt(form.shiftId),
                startDate: form.startDate,
                endDate: form.endDate || null,
                assignedBy: form.assignedBy
            });
            setMsg({ type: "success", text: `Shift assigned to ${form.selectedEmployees.length} employee(s) successfully!` });
            const assignRes = await axios.get(`${API}/shifts/assignments/list`);
            setAssignments(assignRes.data.assignments);
            setForm(prev => ({ ...prev, selectedEmployees: [] }));
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed to assign shift." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><UserCheck size={22} /> Shift Assignment</h2>
                    <p className="sm-page-subtitle">Assign working shifts to employees, departments, or teams</p>
                </div>
            </div>

            {msg && (
                <div className={`sm-alert sm-alert-${msg.type}`}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            {loading ? <div className="sm-loading">Loading data...</div> : (
                <form onSubmit={handleSubmit}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        {/* Left: Configuration */}
                        <div className="sm-section">
                            <div className="sm-section-title">⚙️ Assignment Configuration</div>
                            <div className="sm-section-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                <div className="sm-field">
                                    <label className="sm-label">Select Shift *</label>
                                    <select className="sm-select" value={form.shiftId} onChange={e => setForm(prev => ({ ...prev, shiftId: e.target.value }))} required>
                                        <option value="">— Choose Shift —</option>
                                        {shifts.map((s: any) => (
                                            <option key={s.id} value={s.id}>{s.shiftName} ({s.startTime} – {s.endTime})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Assignment Type</label>
                                    <select className="sm-select" value={form.assignedBy} onChange={e => setForm(prev => ({ ...prev, assignedBy: e.target.value }))}>
                                        <option value="Individual">Individual</option>
                                        <option value="Department">Department</option>
                                        <option value="Team">Team</option>
                                    </select>
                                </div>
                                <div className="sm-grid-2">
                                    <div className="sm-field">
                                        <label className="sm-label">Effective From *</label>
                                        <input className="sm-input" type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} required />
                                    </div>
                                    <div className="sm-field">
                                        <label className="sm-label">Effective Until (optional)</label>
                                        <input className="sm-input" type="date" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="sm-field">
                                    <label className="sm-label">Filter by Department</label>
                                    <select className="sm-select" value={form.departmentFilter} onChange={e => setForm(prev => ({ ...prev, departmentFilter: e.target.value }))}>
                                        <option value="">All Departments</option>
                                        {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Right: Employee selection */}
                        <div className="sm-section" style={{ display: "flex", flexDirection: "column" }}>
                            <div className="sm-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>👥 Select Employees ({form.selectedEmployees.length} selected)</span>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button type="button" className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={selectAllFiltered}>All</button>
                                    <button type="button" className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={clearSelection}><X size={12} /> Clear</button>
                                </div>
                            </div>
                            <div className="sm-section-body" style={{ flexGrow: 1 }}>
                                <div style={{ position: "relative", marginBottom: "0.75rem" }}>
                                    <Search size={14} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                                    <input className="sm-input" style={{ paddingLeft: "2rem" }} placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                    {filteredEmployees.map((emp: any) => (
                                        <label key={emp.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem", borderRadius: 8, cursor: "pointer", background: form.selectedEmployees.includes(emp.id) ? "#ede9fe" : "#f9fafb", border: `1px solid ${form.selectedEmployees.includes(emp.id) ? "#a78bfa" : "#e5e7eb"}`, fontSize: "0.875rem" }}>
                                            <input type="checkbox" checked={form.selectedEmployees.includes(emp.id)} onChange={() => toggleEmployee(emp.id)} />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{emp.employeeId} • {emp.department || "—"}</div>
                                            </div>
                                        </label>
                                    ))}
                                    {filteredEmployees.length === 0 && <div className="sm-empty" style={{ padding: "1rem" }}>No employees found</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sm-form-actions" style={{ marginTop: "1rem" }}>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            <Save size={16} /> {saving ? "Assigning..." : `Assign Shift to ${form.selectedEmployees.length} Employee(s)`}
                        </button>
                    </div>
                </form>
            )}

            {/* Current Assignments Table */}
            <div className="sm-section" style={{ marginTop: "1.5rem" }}>
                <div className="sm-section-title">📋 Current Assignments</div>
                <div style={{ overflowX: "auto" }}>
                    <table className="sm-table">
                        <thead>
                            <tr><th>Employee</th><th>Department</th><th>Shift</th><th>Timing</th><th>Start Date</th><th>End Date</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0
                                ? <tr><td colSpan={7} className="sm-empty">No assignments yet.</td></tr>
                                : assignments.map((a: any) => (
                                    <tr key={a.id}>
                                        <td><strong>{a.employee?.firstName} {a.employee?.lastName}</strong><div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{a.employee?.employeeId}</div></td>
                                        <td>{a.employee?.department || "—"}</td>
                                        <td><strong>{a.shift?.shiftName}</strong></td>
                                        <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{a.shift?.startTime} – {a.shift?.endTime}</td>
                                        <td>{a.startDate?.split("T")[0]}</td>
                                        <td>{a.endDate?.split("T")[0] || <span style={{ color: "#9ca3af" }}>Ongoing</span>}</td>
                                        <td><span className={`sm-badge ${a.isActive ? "sm-badge-active" : "sm-badge-inactive"}`}>{a.isActive ? "Active" : "Inactive"}</span></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ShiftAssignment;
