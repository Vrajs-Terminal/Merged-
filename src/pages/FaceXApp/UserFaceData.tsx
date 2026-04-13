import React, { useState, useEffect } from "react";
import { 
  Camera, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Search, 
  Clock, 
  UserCheck, 
  Loader2,
  Users,
  Activity,
    UserPlus,
    Scan
} from "lucide-react";
import { faceXAPI, branchAPI, departmentAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./UserFaceData.css";

interface UserFaceDataProps {
    setActivePage?: (page: string) => void;
}

const UserFaceData: React.FC<UserFaceDataProps> = ({ setActivePage }) => {
    const [faceData, setFaceData] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filters, setFilters] = useState({
        branch: "All",
        department: "All",
        search: ""
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dataRes, branchRes, deptRes] = await Promise.all([
                faceXAPI.getUserFaceData(filters),
                branchAPI.getAll(),
                departmentAPI.getAll()
            ]);
            setFaceData(dataRes.data);
            setBranches(branchRes.data);
            setDepartments(deptRes.data);
        } catch (error) {
            toast.error("Failed to load user biometric data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleResetFace = async (id: number, employeeName: string) => {
        if (!window.confirm(`Are you sure you want to delete and reset the face data for ${employeeName}? The employee will need to enroll again from the Face App.`)) return;

        try {
            await faceXAPI.deleteUserFaceData(id);
            toast.success("Biometric data reset successfully");
            fetchData();
        } catch (error) {
            toast.error("Failed to reset face data");
        }
    };

    const handleReuploadRequest = async (employeeName: string) => {
        toast.info(`Re-upload request notification sent to ${employeeName}'s devicce.`);
    };

    const stats = {
        total: faceData.length,
        synced: faceData.filter(d => d.photoUrl).length,
        missing: 0, // Placeholder
    };

    return (
        <div className="main-content animate-fade-in fx-bio-page">
            <div className="page-header fx-page-header">
                <div>
                    <h1 className="page-title"><Scan size={22} /> Biometric Face Registry</h1>
                    <p className="page-subtitle">Repository of all employee facial identity data captured via mobile/tablet apps</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="main-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.1s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-blue"><Users size={16} /></div>
                        <div className="ns-change positive">Identity</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.total}</div>
                        <div className="ns-title">Employees Enrolled</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.2s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-green"><Activity size={16} /></div>
                        <div className="ns-change positive">Healthy</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">100%</div>
                        <div className="ns-title">Data Integrity</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.3s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-orange"><UserPlus size={16} /></div>
                        <div className="ns-change positive">New</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">12+</div>
                        <div className="ns-title">Pending Enrollments</div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", alignItems: "flex-end" }}>
                    <div>
                        <label className="form-label">Branch</label>
                        <select 
                            className="form-control" 
                            name="branch" 
                            value={filters.branch}
                            onChange={(e) => setFilters(prev => ({ ...prev, branch: e.target.value }))}
                        >
                            <option value="All">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.branchName}>{b.branchName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Department</label>
                        <select 
                            className="form-control" 
                            name="department" 
                            value={filters.department}
                            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                        >
                            <option value="All">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.departmentName}>{d.departmentName}</option>)}
                        </select>
                    </div>
                    <div style={{ position: "relative" }}>
                        <label className="form-label">Employee Search</label>
                        <div style={{ position: "relative" }}>
                            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Name or ID..." 
                                style={{ paddingLeft: "40px" }}
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            />
                        </div>
                    </div>
                    <button className="btn-secondary" onClick={fetchData} style={{ height: "48px" }}>
                        <RefreshCw size={18} /> Sync Registry
                    </button>
                </div>
            </div>

            {/* Photo Cards Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "100px" }}>
                    <Loader2 className="animate-spin" size={48} style={{ margin: "0 auto" }} />
                </div>
            ) : faceData.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                    {faceData.map((data) => (
                        <div key={data.id} className="glass-card animate-scale-in" style={{ padding: "0", overflow: "hidden", position: "relative" }}>
                             <div style={{ 
                                 height: "180px", 
                                 background: `url(${data.photoUrl || 'https://via.placeholder.com/200x200?text=Face+Enrolled'})`,
                                 backgroundSize: "cover",
                                 backgroundPosition: "center",
                                 position: "relative"
                             }}>
                                <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px" }}>
                                        <UserCheck size={10} /> Face Active
                                    </div>
                                    <div style={{ color: "white", fontSize: "10px", background: "rgba(0,0,0,0.5)", padding: "2px 6px", borderRadius: "4px" }}>
                                        <Clock size={10} /> {new Date(data.lastUpdatedDate).toLocaleDateString()}
                                    </div>
                                </div>
                             </div>
                             
                             <div style={{ padding: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>{data.employee?.firstName} {data.employee?.lastName}</h4>
                                        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "12px" }}>{data.employee?.designation} • {data.employee?.department}</p>
                                    </div>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        <button className="btn-icon" title="View Detail" style={{ padding: "6px" }} onClick={() => toast.info(`Viewing high-res for ${data.employee?.firstName}`)}>
                                            <Eye size={14} />
                                        </button>
                                        <button className="btn-icon color-danger" title="Reset Biometrics" style={{ padding: "6px" }} onClick={() => handleResetFace(data.id, data.employee?.firstName)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                                    <button className="btn-secondary" style={{ width: "100%", fontSize: "12px" }} onClick={() => handleReuploadRequest(data.employee?.firstName)}>
                                        <Camera size={14} /> Request Re-upload
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card" style={{ textAlign: "center", padding: "100px", opacity: 0.5 }}>
                    <Users size={64} style={{ margin: "0 auto 16px" }} />
                    <h3>No face biometric records found for the current selection.</h3>
                </div>
            )}
        </div>
    );
};

export default UserFaceData;
