import React, { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Eye,
    ToggleLeft,
    ToggleRight,
    Search,
    Loader2,
    ShieldCheck,
    UserPlus,
    Activity,
    RefreshCw,
    Scan,
    UserCheck,
    X,
    CalendarClock,
    Shield
} from "lucide-react";
import { faceXAPI, managerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./FaceAppAdmin.css";

interface FaceAppAdminProps {
    setActivePage?: (page: string) => void;
}

const FaceAppAdmin: React.FC<FaceAppAdminProps> = ({ setActivePage }) => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedManager, setSelectedManager] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);

    const fetchData = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const [adminRes, managerRes] = await Promise.all([
                faceXAPI.getAdmins(),
                managerAPI.getAll()
            ]);
            setAdmins(Array.isArray(adminRes.data) ? adminRes.data : []);
            setManagers(Array.isArray(managerRes.data) ? managerRes.data : []);
        } catch (error) {
            toast.error("Failed to load Face App Admins");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        void setActivePage;
    }, [setActivePage]);

    const getManagerName = (manager: any) => manager?.name || manager?.managerName || "Unknown";
    const getManagerDepartment = (manager: any) => manager?.department || manager?.departmentName || "General";
    const isActive = (status: string) => String(status).toLowerCase() === "active";

    const handleGenerate = async () => {
        if (!selectedManager) {
            toast.info("Please select a manager first");
            return;
        }
        try {
            setSubmitting(true);
            await faceXAPI.generateAdmin({ managerId: parseInt(selectedManager) });
            toast.success("Login generated successfully");
            setSelectedManager("");
            fetchData(true);
        } catch (error) {
            toast.error("Failed to generate login");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this admin access?")) return;
        try {
            await faceXAPI.deleteAdmin(id);
            toast.success("Admin deleted successfully");
            fetchData(true);
        } catch (error) {
            toast.error("Failed to delete admin");
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await faceXAPI.toggleAdminStatus(id);
            toast.success("Status updated");
            fetchData(true);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredAdmins = admins.filter(admin => 
        getManagerName(admin.manager).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(admin.username || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    const hasSearchQuery = searchQuery.trim().length > 0;

    const stats = {
        total: admins.length,
        active: admins.filter((a: any) => isActive(a.status)).length,
        inactive: admins.filter((a: any) => !isActive(a.status)).length
    };

    const selectedManagerInfo = selectedManager
        ? managers.find((m: any) => String(m.id) === selectedManager)
        : null;

    return (
        <div className="main-content animate-fade-in fx-admin-page">
            <div className="fx-page-header">
                <div className="fx-title-block">
                    <div className="fx-title-row">
                        <Scan size={24} className="fx-title-icon" />
                        <h1 className="page-title">FaceX Admin Control Center</h1>
                    </div>
                    <p className="page-subtitle">Manage secure access credentials and account status for the FaceX mobile application.</p>
                </div>
                <button className="btn-secondary fx-header-refresh" onClick={() => fetchData(true)} disabled={refreshing || loading}>
                    <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="fx-stats-grid">
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Total Admins</span>
                        <span className="fx-stat-icon blue"><ShieldCheck size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.total}</strong>
                    <span className="fx-stat-note">Total configured accounts</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Active Credentials</span>
                        <span className="fx-stat-icon green"><Activity size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.active}</strong>
                    <span className="fx-stat-note">Accounts currently enabled</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Inactive Credentials</span>
                        <span className="fx-stat-icon orange"><Shield size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.inactive}</strong>
                    <span className="fx-stat-note">Accounts currently disabled</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Managers Available</span>
                        <span className="fx-stat-icon purple"><UserPlus size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{managers.length}</strong>
                    <span className="fx-stat-note">Eligible managers for new access</span>
                </div>
            </div>

            <div className="fx-grid-layout">
                <div className="glass-card fx-access-card">
                    <div className="fx-panel-head">
                        <h3>Grant FaceX Access</h3>
                        <span className="fx-chip">Credential Setup</span>
                    </div>
                    <p className="fx-panel-subtitle">Select a manager account and generate secure login credentials instantly.</p>

                    <div className="fx-form-grid">
                        <div>
                            <label className="form-label fx-label">Manager</label>
                            <select 
                                className="form-control"
                                value={selectedManager}
                                onChange={(e) => setSelectedManager(e.target.value)}
                                disabled={submitting || loading}
                            >
                                <option value="">-- Select Manager --</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{getManagerName(m)} ({getManagerDepartment(m)})</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-primary fx-generate-btn" onClick={handleGenerate} disabled={!selectedManager || submitting || loading}>
                            {submitting ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}
                            {submitting ? "Generating..." : "Generate Login"}
                        </button>
                    </div>

                    <div className="fx-selected-meta">
                        <span className="fx-meta-label">Selected Manager</span>
                        <strong className="fx-meta-value">{selectedManagerInfo ? getManagerName(selectedManagerInfo) : "Not selected"}</strong>
                        <span className="fx-meta-note">{selectedManagerInfo ? getManagerDepartment(selectedManagerInfo) : "Choose a manager to continue"}</span>
                    </div>
                </div>

                <div className="glass-card fx-table-card">
                    <div className="fx-panel-head fx-table-head">
                        <div>
                            <h3>Face App Administrators</h3>
                            <p className="fx-panel-subtitle">Monitor account status and manage credentials from a single table.</p>
                        </div>
                        <div className="fx-search-wrap">
                            <Search size={16} className="fx-search-icon" />
                            <input 
                                type="text" 
                                className="form-control fx-search-input" 
                                placeholder="Search by manager or username"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {hasSearchQuery && (
                                <button
                                    type="button"
                                    className="fx-search-clear"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear admin search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="fx-search-meta">
                        {hasSearchQuery
                            ? `Showing ${filteredAdmins.length} result${filteredAdmins.length === 1 ? "" : "s"} for "${searchQuery}"`
                            : `Showing all ${filteredAdmins.length} administrator records`}
                    </div>

                    <div className="table-responsive">
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Manager Name</th>
                                    <th>Username</th>
                                    <th>App Password</th>
                                    <th>Created Date</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="fx-empty-row">
                                            <Loader2 className="spin" size={18} />
                                            <span>Loading administrators...</span>
                                        </td>
                                    </tr>
                                ) : filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin, idx) => (
                                        <tr key={admin.id}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <div className="fx-manager-cell">
                                                    <strong>{getManagerName(admin.manager)}</strong>
                                                    <span>{getManagerDepartment(admin.manager)}</span>
                                                </div>
                                            </td>
                                            <td><code className="fx-code-pill">{admin.username}</code></td>
                                            <td><code className="fx-code-pill subtle">{admin.password}</code></td>
                                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${isActive(admin.status) ? "badge-success" : "badge-danger"}`}>
                                                    {isActive(admin.status) ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fx-actions">
                                                    <button className="btn-icon" title="View Details" onClick={() => setSelectedAdmin(admin)}>
                                                        <Eye size={15} />
                                                    </button>
                                                    <button className="btn-icon color-primary" onClick={() => handleToggle(admin.id)} title="Toggle Status">
                                                        {isActive(admin.status) ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                    </button>
                                                    <button className="btn-icon color-danger" onClick={() => handleDelete(admin.id)} title="Delete Access">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="fx-empty-row">
                                            <UserCheck size={18} />
                                            <span>No Face App Admins found</span>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {selectedAdmin && (
                <div className="fx-modal-overlay" onClick={() => setSelectedAdmin(null)}>
                    <div className="fx-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fx-modal-head">
                            <div className="fx-modal-title-row">
                                <Eye size={18} />
                                <h4>Admin Credential Details</h4>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedAdmin(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="fx-modal-grid">
                            <div>
                                <label>Manager</label>
                                <p>{getManagerName(selectedAdmin.manager)}</p>
                            </div>
                            <div>
                                <label>Department</label>
                                <p>{getManagerDepartment(selectedAdmin.manager)}</p>
                            </div>
                            <div>
                                <label>Username</label>
                                <p>{selectedAdmin.username}</p>
                            </div>
                            <div>
                                <label>Password</label>
                                <p>{selectedAdmin.password}</p>
                            </div>
                            <div>
                                <label>Status</label>
                                <p>{isActive(selectedAdmin.status) ? "Active" : "Inactive"}</p>
                            </div>
                            <div>
                                <label>Created</label>
                                <p><CalendarClock size={14} /> {new Date(selectedAdmin.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="fx-modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedAdmin(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceAppAdmin;

