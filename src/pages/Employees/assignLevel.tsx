import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Search, Map, Layers, CheckCircle, RefreshCcw, Info, Target, Users } from "lucide-react";
import "./assignLevel.css";

interface Employee {
    id: number;
    firstName: string;
    lastName: string;
    department: string;
    designation: string;
    email: string;
    levelId?: number | null;
    levelName?: string | null;
}

interface Level {
    id: number;
    levelName: string;
    role: string;
    description: string;
}

function AssignLevel() {
    const [search, setSearch] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState({
        levelId: "",
        effectiveDate: new Date().toISOString().split('T')[0],
        remarks: ""
    });

    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, lvlRes] = await Promise.all([
                axios.get(`${API_BASE}/employees`),
                axios.get(`${API_BASE}/levels`)
            ]);

            // Map level info into employees if present on backend (Assuming backend might return relations next time).
            // For now, handling generic array:
            setEmployees(empRes.data);
            setLevels(lvlRes.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredEmployees = employees.filter(e =>
        (e.firstName + " " + e.lastName).toLowerCase().includes(search.toLowerCase()) ||
        (e.department || "").toLowerCase().includes(search.toLowerCase()) ||
        (e.designation || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectEmployee = (emp: Employee) => {
        setSelectedEmployee(emp);
        setFormData({
            levelId: emp.levelId ? emp.levelId.toString() : "",
            effectiveDate: new Date().toISOString().split('T')[0],
            remarks: ""
        });
    };

    const handleAssign = async () => {
        if (!selectedEmployee) return;
        if (!formData.levelId) return alert("Please select a valid level.");

        setIsSaving(true);
        try {
            await axios.post(`${API_BASE}/levels/assign`, {
                employeeId: selectedEmployee.id,
                levelId: parseInt(formData.levelId),
                effectiveDate: formData.effectiveDate,
                remarks: formData.remarks
            });
            alert("Level assigned successfully!");
            setSelectedEmployee(null);
            fetchData(); // Refresh list to get updated levels
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to assign level.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="assign-level-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Target size={22} /> Level Assignments</h2>
                    <p>Assign corporate grades and levels to employees systematically.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Total Employees</h4>
                        <div className="val">{employees.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Levels Defined</h4>
                        <div className="val">{levels.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                        <Layers size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Pending Assignments</h4>
                        <div className="val">{employees.filter(e => !e.levelId).length}</div>
                    </div>
                </div>
            </div>

            <div className="top-controls">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        placeholder="Search employee by name, department, or designation..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button className="btn-secondary" onClick={fetchData}>
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>

            <div className="layout-grid">
                <div className="base-card">
                    <div className="card-header">
                        <Users size={18} color="#3b82f6" /> Employee Directory
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Employee Details</th>
                                    <th>Designation & Dept</th>
                                    <th>Current Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading directory...</td></tr>
                                ) : filteredEmployees.length === 0 ? (
                                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No employees found.</td></tr>
                                ) : (
                                    filteredEmployees.map(emp => (
                                        <tr
                                            key={emp.id}
                                            className={selectedEmployee?.id === emp.id ? 'active-row' : ''}
                                            onClick={() => handleSelectEmployee(emp)}
                                        >
                                            <td>
                                                <div className="emp-name">
                                                    {emp.firstName} {emp.lastName}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                    {emp.email}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: '500', color: '#1e293b' }}>{emp.designation || 'N/A'}</div>
                                                <div className="emp-dept">{emp.department || 'N/A'}</div>
                                            </td>
                                            <td>
                                                <span className={`level-badge ${!emp.levelId ? 'none' : ''}`}>
                                                    {emp.levelName || emp.levelId || 'Unassigned'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="base-card" style={{ alignSelf: 'start', position: 'sticky', top: '24px' }}>
                    <div className="card-header">
                        <Map size={18} color="#f59e0b" /> Assignment Panel
                    </div>

                    {selectedEmployee ? (
                        <div className="form-panel">
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Selected Employee</div>
                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '16px' }}>{selectedEmployee.firstName} {selectedEmployee.lastName}</div>
                                <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>{selectedEmployee.designation || 'No Designation'} • {selectedEmployee.department || 'No Dept'}</div>
                            </div>

                            <div className="form-group">
                                <label>Target Corporate Level <span style={{ color: 'red' }}>*</span></label>
                                <select
                                    value={formData.levelId}
                                    onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                                >
                                    <option value="">-- Select a Level --</option>
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id}>{l.levelName} - {l.role}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Effective Date <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="date"
                                    value={formData.effectiveDate}
                                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Evaluation Notes / Remarks</label>
                                <textarea
                                    placeholder="e.g. Assigned upon completion of probation period."
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                />
                            </div>

                            <div className="form-actions">
                                <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedEmployee(null)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={handleAssign} disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Confirm Assignment"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Info size={48} />
                            <h3>No Selection</h3>
                            <p style={{ marginTop: '8px', lineHeight: '1.5' }}>Click on an employee from the directory list to assign or modify their corporate level.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AssignLevel;
