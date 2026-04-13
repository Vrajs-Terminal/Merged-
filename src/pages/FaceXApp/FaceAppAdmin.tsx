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
    Scan
} from "lucide-react";
import { faceXAPI, managerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./FaceAppAdmin.css";

interface FaceAppAdminProps {
    setActivePage?: (page: string) => void;
}

const FaceAppAdmin: React.FC<FaceAppAdminProps> = ({ setActivePage }) => {
    const [admins, setAdmins] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedManager, setSelectedManager] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [adminRes, managerRes] = await Promise.all([
                faceXAPI.getAdmins(),
                managerAPI.getAll()
            ]);
            setAdmins(adminRes.data);
            setManagers(managerRes.data);
        } catch (error) {
            toast.error("Failed to load Face App Admins");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleGenerate = async () => {
        if (!selectedManager) {
            toast.info("Please select a manager first");
            return;
        }
        try {
            await faceXAPI.generateAdmin({ managerId: parseInt(selectedManager) });
            toast.success("Login generated successfully");
            setSelectedManager("");
            fetchData();
        } catch (error) {
            toast.error("Failed to generate login");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this admin access?")) return;
        try {
            await faceXAPI.deleteAdmin(id);
            toast.success("Admin deleted successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete admin");
        }
    };

    const handleToggle = async (id: number) => {
        try {
            await faceXAPI.toggleAdminStatus(id);
            toast.success("Status updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const filteredAdmins = admins.filter(admin => 
        admin.manager?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: admins.length,
        active: admins.filter((a: any) => a.status === "Active").length,
        inactive: admins.filter((a: any) => a.status === "Inactive").length
    };

    return (
        <div className="main-content animate-fade-in fx-admin-page">
            <div className="page-header fx-page-header">
                <div>
                    <PageTitle title="App Administration" subtitle="Manage administrative access and login credentials for the FaceX mobile application" />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="main-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.1s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-blue"><ShieldCheck size={16} /></div>
                        <div className="ns-change positive">Access</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.total}</div>
                        <div className="ns-title">Total Admins</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.2s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-green"><Activity size={16} /></div>
                        <div className="ns-change positive">Live</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.active}</div>
                        <div className="ns-title">Active Credentials</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.3s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-orange"><UserPlus size={16} /></div>
                        <div className="ns-change positive">Setup</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{managers.length}</div>
                        <div className="ns-title">Managers Available</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.4s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-purple"><RefreshCw size={16} /></div>
                        <button className="ns-change positive" onClick={fetchData} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", font: "inherit", padding: 0 }}>Refresh</button>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">Sync</div>
                        <div className="ns-title">Latest Cloud Data</div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Generation Control */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
                        <div style={{ flex: 1, minWidth: "250px" }}>
                            <label className="form-label" style={{ whiteSpace: "nowrap", marginBottom: "8px", display: "block" }}>Select Manager to Grant Access</label>
                            <select 
                                className="form-control"
                                value={selectedManager}
                                onChange={(e) => setSelectedManager(e.target.value)}
                            >
                                <option value="">-- Select Manager --</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-primary" onClick={handleGenerate} style={{ height: "48px", padding: "0 24px" }}>
                            <Plus size={20} /> Generate Login
                        </button>
                    </div>
                </div>

                {/* Admins Table */}
                <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid var(--border-color, #e2e8f0)" }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>Face App Administrators</h3>
                        <div className="search-box" style={{ width: "300px", position: "relative" }}>
                            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search admins..." 
                                style={{ paddingLeft: "40px" }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
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
                                        <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                                            <Loader2 className="animate-spin" style={{ margin: "0 auto" }} />
                                        </td>
                                    </tr>
                                ) : filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin, idx) => (
                                        <tr key={admin.id}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: "600" }}>{admin.manager?.name}</div>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{admin.manager?.department}</div>
                                            </td>
                                            <td><code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "4px" }}>{admin.username}</code></td>
                                            <td><code>{admin.password}</code></td>
                                            <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${admin.status === "Active" ? "badge-success" : "badge-danger"}`}>
                                                    {admin.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button className="btn-icon" title="View Details">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button className="btn-icon color-primary" onClick={() => handleToggle(admin.id)} title="Toggle Status">
                                                        {admin.status === "Active" ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                                    </button>
                                                    <button className="btn-icon color-danger" onClick={() => handleDelete(admin.id)} title="Delete Access">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "40px", opacity: 0.5 }}>
                                            No Face App Admins found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceAppAdmin;

