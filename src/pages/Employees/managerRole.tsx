import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Search, Plus, UserCheck, Shield, Users, Mail, Phone, Edit, Trash2, X, Users2 } from "lucide-react";
import "./managerRole.css";

interface Manager {
    id: string; // Visual format (e.g. MGR-1)
    dbId: number; // Internal ID
    name: string;
    email: string;
    mobile: string;
    role: string;
    branchAccess: string;
    departmentAccess: string;
    status: string;
    teamSize: number;
}

function ManagerRole() {
    const [search, setSearch] = useState("");
    const [managers, setManagers] = useState<Manager[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Assign Team Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [activeManager, setActiveManager] = useState<Manager | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [assignParams, setAssignParams] = useState({ effectiveFrom: "", remarks: "" });

    const [formData, setFormData] = useState<Manager>({
        id: "", dbId: 0, name: "", email: "", mobile: "", role: "Manager", branchAccess: "", departmentAccess: "", status: "Active", teamSize: 0
    });

    const fetchManagers = async () => {
        try {
            const response = await axios.get(`${API_BASE}/managers`);
            const mapped = response.data.map((m: any) => ({
                id: `MGR-${m.id}`,
                dbId: m.id,
                name: m.name || "",
                email: m.email || "",
                mobile: m.mobile || "N/A",
                role: m.level || "Manager",
                branchAccess: m.branch || "All",
                departmentAccess: m.department || "",
                status: m.active ? "Active" : "Disabled",
                teamSize: m._count?.employees || 0
            }));
            setManagers(mapped);
        } catch (error) {
            console.error("Error fetching managers:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_BASE}/employees`);
            setAllEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchManagers();
        fetchEmployees();
    }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenAdd = () => {
        setIsEditing(false);
        setFormData({ id: "", dbId: 0, name: "", email: "", mobile: "", role: "Manager", branchAccess: "All Branches", departmentAccess: "All", status: "Active", teamSize: 0 });
        setShowFormModal(true);
    };

    const handleEdit = (mgr: Manager) => {
        setIsEditing(true);
        setFormData(mgr);
        setShowFormModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) return alert("Name and Email are required.");
        try {
            if (isEditing) {
                await axios.put(`${API_BASE}/managers/${formData.dbId}`, {
                    name: formData.name, email: formData.email, mobile: formData.mobile, level: formData.role, branch: formData.branchAccess, department: formData.departmentAccess, active: formData.status === "Active"
                });
            } else {
                await axios.post(`${API_BASE}/managers`, {
                    name: formData.name, email: formData.email, mobile: formData.mobile, level: formData.role, branch: formData.branchAccess, department: formData.departmentAccess, active: true
                });
            }
            setShowFormModal(false);
            fetchManagers();
        } catch (error) {
            console.error("Error saving manager", error);
            alert("Failed to save manager.");
        }
    };

    const handleDelete = async (dbId: number) => {
        if (!window.confirm("Are you sure you want to remove this manager?")) return;
        try {
            await axios.delete(`${API_BASE}/managers/${dbId}`);
            fetchManagers();
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to delete manager");
        }
    };

    const handleOpenAssign = (mgr: Manager) => {
        setActiveManager(mgr);
        setAssignParams({ effectiveFrom: new Date().toISOString().split('T')[0], remarks: "" });
        const currentTeam = allEmployees.filter(e => e.managerId === mgr.dbId).map(e => e.id);
        setSelectedEmployees(currentTeam);
        setShowAssignModal(true);
    };

    const toggleEmployeeSelect = (empId: number) => {
        if (selectedEmployees.includes(empId)) {
            setSelectedEmployees(selectedEmployees.filter(id => id !== empId));
        } else {
            setSelectedEmployees([...selectedEmployees, empId]);
        }
    };

    const handleSaveAssign = async () => {
        if (!activeManager) return;
        if (!assignParams.effectiveFrom) return alert("Effective From Date is required.");

        try {
            await axios.post(`${API_BASE}/managers/assign`, {
                managerId: activeManager.dbId,
                employeeIds: selectedEmployees,
                effectiveFrom: assignParams.effectiveFrom,
                remarks: assignParams.remarks
            });
            setShowAssignModal(false);
            fetchManagers();
            fetchEmployees();
        } catch (error: any) {
            alert("Failed to assign employees. " + (error.response?.data?.message || ""));
        }
    };

    const filteredManagers = managers.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="manager-role-container">
            <div className="page-header">
                <div>
                    <h2 className="page-title"><Shield size={22} /> Manager Profiles</h2>
                    <p>Create managers and assign teams for hierarchical reporting.</p>
                </div>
                <button className="btn-primary" onClick={handleOpenAdd}>
                    <Plus size={20} /> Create New Role
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Total Personnel</h4>
                        <div className="val">{managers.length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>Active Managers</h4>
                        <div className="val">{managers.filter(m => m.status === 'Active').length}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <h4>System Admins</h4>
                        <div className="val">{managers.filter(m => m.role === 'Admin').length}</div>
                    </div>
                </div>
            </div>

            <div className="top-controls">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-card">
                <table className="manager-table">
                    <thead>
                        <tr>
                            <th>Manager Profile</th>
                            <th>Role & Access</th>
                            <th>Contact</th>
                            <th>Team Size</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading Profiles...</td></tr>
                        ) : filteredManagers.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No managers match your search.</td></tr>
                        ) : (
                            filteredManagers.map(m => (
                                <tr key={m.id}>
                                    <td>
                                        <div className="profile-cell">
                                            <div className="avatar">
                                                {m.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="name-primary">{m.name}</div>
                                                <div className="email-secondary">{m.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="role-badge" style={{ background: m.role === 'Admin' ? '#f5f3ff' : '#eff6ff', color: m.role === 'Admin' ? '#8b5cf6' : '#2563eb' }}>
                                            {m.role}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            {m.departmentAccess} {m.branchAccess !== "All" && `• ${m.branchAccess}`}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                            <Mail size={14} color="#94a3b8" /> {m.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Phone size={14} color="#94a3b8" /> {m.mobile}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Users2 size={16} color="#64748b" /> {m.teamSize} Members
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${m.status.toLowerCase()}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button className="assign-btn" onClick={() => handleOpenAssign(m)}>
                                                Assign Team
                                            </button>
                                            <button className="btn-secondary" onClick={() => handleEdit(m)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-danger" onClick={() => handleDelete(m.dbId)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <>
                    <div className="modal-overlay" onClick={() => setShowFormModal(false)}></div>
                    <div className="form-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0 }}>{isEditing ? "Edit Profile" : "Create New Role"}</h3>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowFormModal(false)}><X size={24} color="#64748b" /></button>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name <span style={{ color: 'red' }}>*</span></label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Sarah Jenkins" />
                            </div>
                            <div className="form-group">
                                <label>Email Address <span style={{ color: 'red' }}>*</span></label>
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="sarah@company.com" />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+1 234 567 8900" />
                            </div>
                            <div className="form-group">
                                <label>System Role</label>
                                <select name="role" value={formData.role} onChange={handleChange}>
                                    <option>Manager</option>
                                    <option>Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Branch Access Limit</label>
                                <select name="branchAccess" value={formData.branchAccess} onChange={handleChange}>
                                    <option>All Branches</option>
                                    <option>Head Office</option>
                                    <option>Rajkot</option>
                                    <option>Surat</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Department Access Limit</label>
                                <select name="departmentAccess" value={formData.departmentAccess} onChange={handleChange}>
                                    <option>All</option>
                                    <option>HR</option>
                                    <option>IT</option>
                                    <option>Finance</option>
                                    <option>Sales</option>
                                </select>
                            </div>
                            {isEditing && (
                                <div className="form-group">
                                    <label>Account Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange}>
                                        <option value="Active">Active</option>
                                        <option value="Disabled">Disabled</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                            <button className="btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave}>{isEditing ? "Update Profile" : "Create Profile"}</button>
                        </div>
                    </div>
                </>
            )}

            {/* Assign Team Modal */}
            {showAssignModal && activeManager && (
                <>
                    <div className="modal-overlay" onClick={() => setShowAssignModal(false)}></div>
                    <div className="form-card" style={{ maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>Assign Team: {activeManager.name}</h3>
                            <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowAssignModal(false)}><X size={24} color="#64748b" /></button>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Select the employees who will directly report to this manager.</p>

                        <div className="emp-list" style={{ marginBottom: '24px' }}>
                            {allEmployees.map(emp => (
                                <label key={emp.id} className={`emp-item ${selectedEmployees.includes(emp.id) ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.includes(emp.id)}
                                        onChange={() => toggleEmployeeSelect(emp.id)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{emp.firstName} {emp.lastName}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{emp.designation || 'No Role'} • {emp.department}</div>
                                    </div>
                                </label>
                            ))}
                            {allEmployees.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No active employees found in the system.</div>}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Effective Change Date</label>
                                <input type="date" value={assignParams.effectiveFrom} onChange={(e) => setAssignParams({ ...assignParams, effectiveFrom: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Internal Remarks</label>
                                <input type="text" placeholder="e.g. Q3 Restructure" value={assignParams.remarks} onChange={(e) => setAssignParams({ ...assignParams, remarks: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveAssign}>Save Assignments</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ManagerRole;
