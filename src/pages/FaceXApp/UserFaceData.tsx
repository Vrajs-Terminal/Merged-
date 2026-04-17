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
    Scan,
    X,
    Building2,
    Layers,
    CalendarClock
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
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
    const [searchInput, setSearchInput] = useState("");
    
    // Filters
    const [filters, setFilters] = useState({
        branch: "All",
        department: "All",
        search: ""
    });

    const fetchData = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const [dataRes, branchRes, deptRes] = await Promise.all([
                faceXAPI.getUserFaceData(filters),
                branchAPI.getAll(),
                departmentAPI.getAll()
            ]);
            setFaceData(Array.isArray(dataRes.data) ? dataRes.data : []);
            setBranches(Array.isArray(branchRes.data) ? branchRes.data : []);
            setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        } catch (error) {
            toast.error("Failed to load user biometric data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput.trim() }));
        }, 320);

        return () => window.clearTimeout(timeoutId);
    }, [searchInput]);

    useEffect(() => {
        void setActivePage;
    }, [setActivePage]);

    const handleResetFace = async (id: number, employeeName: string) => {
        if (!window.confirm(`Are you sure you want to delete and reset the face data for ${employeeName}? The employee will need to enroll again from the Face App.`)) return;

        try {
            await faceXAPI.deleteUserFaceData(id);
            toast.success("Biometric data reset successfully");
            fetchData(true);
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
        pending: faceData.filter(d => !d.photoUrl).length,
    };

    const getEmployeeName = (data: any) => `${data.employee?.firstName || ""} ${data.employee?.lastName || ""}`.trim() || "Unknown Employee";
    const hasSearchQuery = searchInput.trim().length > 0;
    const isSearchSyncing = searchInput.trim() !== filters.search;

    return (
        <div className="main-content animate-fade-in fx-bio-page">
            <div className="fx-page-header">
                <div className="fx-title-block">
                    <div className="fx-title-row">
                        <Scan size={24} className="fx-title-icon" />
                        <h1 className="page-title">Face Identity Registry Hub</h1>
                    </div>
                    <p className="page-subtitle">Repository of employee facial identity data captured via mobile and tablet apps.</p>
                </div>
                <button className="btn-secondary fx-refresh-btn" onClick={() => fetchData(true)} disabled={loading || refreshing}>
                    <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Syncing..." : "Sync Registry"}
                </button>
            </div>

            <div className="fx-stats-grid">
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Identity</span>
                        <span className="fx-stat-icon blue"><Users size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.total}</strong>
                    <span className="fx-stat-note">Employees Enrolled</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Healthy</span>
                        <span className="fx-stat-icon green"><Activity size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">100%</strong>
                    <span className="fx-stat-note">Data Integrity</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Captured</span>
                        <span className="fx-stat-icon purple"><UserCheck size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.synced}</strong>
                    <span className="fx-stat-note">Records with Face Data</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Pending</span>
                        <span className="fx-stat-icon orange"><UserPlus size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.pending}</strong>
                    <span className="fx-stat-note">Records without Photo</span>
                </div>
            </div>

            <div className="glass-card fx-filter-card">
                <div className="fx-filter-grid">
                    <div>
                        <label className="form-label fx-label">Branch</label>
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
                        <label className="form-label fx-label">Department</label>
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
                    <div className="fx-search-field">
                        <label className="form-label fx-label">Employee Search</label>
                        <div className="fx-search-wrap">
                            <Search size={18} className="fx-search-icon" />
                            <input 
                                type="text" 
                                className="form-control fx-search-input"
                                placeholder="Name or ID..." 
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            {hasSearchQuery && (
                                <button
                                    type="button"
                                    className="fx-search-clear"
                                    onClick={() => setSearchInput("")}
                                    aria-label="Clear employee search"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                    <button className="btn-secondary fx-sync-btn" onClick={() => fetchData(true)}>
                        <RefreshCw size={16} className={refreshing ? "spin" : ""} /> Sync Registry
                    </button>
                </div>
                <div className="fx-search-meta">
                    {isSearchSyncing
                        ? "Searching employee records..."
                        : hasSearchQuery
                            ? `Showing ${faceData.length} result${faceData.length === 1 ? "" : "s"} for "${filters.search}"`
                            : `Showing all ${faceData.length} employee records`}
                </div>
            </div>

            {loading ? (
                <div className="fx-loading-state">
                    <Loader2 className="spin" size={28} />
                    <span>Loading biometric registry...</span>
                </div>
            ) : faceData.length > 0 ? (
                <div className="fx-photo-grid">
                    {faceData.map((data) => (
                        <div key={data.id} className="glass-card animate-scale-in fx-photo-card">
                             <div className="fx-photo-cover" style={{ backgroundImage: `url(${data.photoUrl || 'https://via.placeholder.com/320x220?text=Face+Enrolled'})` }}>
                                <div className="fx-photo-meta-top">
                                    <div className="badge badge-success fx-photo-badge">
                                        <UserCheck size={10} /> Face Active
                                    </div>
                                    <div className="fx-photo-date">
                                        <Clock size={10} /> {new Date(data.lastUpdatedDate).toLocaleDateString()}
                                    </div>
                                </div>
                             </div>
                             
                             <div className="fx-photo-content">
                                <div className="fx-photo-head">
                                    <div>
                                        <h4>{getEmployeeName(data)}</h4>
                                        <p>{data.employee?.designation} • {data.employee?.department}</p>
                                    </div>
                                    <div className="fx-photo-actions">
                                        <button className="btn-icon" title="View Detail" onClick={() => setSelectedRecord(data)}>
                                            <Eye size={14} />
                                        </button>
                                        <button className="btn-icon color-danger" title="Reset Biometrics" onClick={() => handleResetFace(data.id, getEmployeeName(data))}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="fx-photo-foot">
                                    <button className="btn-secondary fx-reupload-btn" onClick={() => handleReuploadRequest(getEmployeeName(data))}>
                                        <Camera size={14} /> Request Re-upload
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-card fx-empty-card">
                    <Users size={52} />
                    <h3>No face biometric records found for the current selection.</h3>
                </div>
            )}

            {selectedRecord && (
                <div className="fx-modal-overlay" onClick={() => setSelectedRecord(null)}>
                    <div className="fx-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fx-modal-head">
                            <div className="fx-modal-title-row">
                                <Eye size={18} />
                                <h4>Biometric Record Detail</h4>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedRecord(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="fx-modal-grid">
                            <div>
                                <label>Employee</label>
                                <p>{getEmployeeName(selectedRecord)}</p>
                            </div>
                            <div>
                                <label>Designation</label>
                                <p>{selectedRecord.employee?.designation || "-"}</p>
                            </div>
                            <div>
                                <label>Branch</label>
                                <p><Building2 size={14} /> {selectedRecord.employee?.branch || selectedRecord.branch || "-"}</p>
                            </div>
                            <div>
                                <label>Department</label>
                                <p><Layers size={14} /> {selectedRecord.employee?.department || selectedRecord.department || "-"}</p>
                            </div>
                            <div>
                                <label>Last Updated</label>
                                <p><CalendarClock size={14} /> {selectedRecord.lastUpdatedDate ? new Date(selectedRecord.lastUpdatedDate).toLocaleString() : "-"}</p>
                            </div>
                            <div>
                                <label>Status</label>
                                <p><span className="badge badge-success">Face Active</span></p>
                            </div>
                        </div>
                        <div className="fx-modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedRecord(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserFaceData;
