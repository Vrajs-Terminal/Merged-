import React, { useState, useEffect } from "react";
import { 
  Eye, 
  AlertCircle, 
  Smartphone, 
  Loader2,
  Check,
  X,
  ArrowRight,
    Clock,
    Scan,
    RefreshCw,
    Shield,
    CalendarClock
} from "lucide-react";
import { faceXAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./FaceChangeRequest.css";

interface FaceChangeRequestProps {
    setActivePage?: (page: string) => void;
}

const FaceChangeRequest: React.FC<FaceChangeRequestProps> = ({ setActivePage }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState("Pending");
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

    const fetchRequests = async (silent = false) => {
        try {
            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            const res = await faceXAPI.getChangeRequests({ status: statusFilter });
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to load face change requests");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    useEffect(() => {
        void setActivePage;
    }, [setActivePage]);

    const handleAction = async (id: number, status: "Approved" | "Rejected") => {
        let reason = "";
        if (status === "Rejected") {
            reason = window.prompt("Reason for rejection:") || "";
            if (!reason) {
                toast.info("Rejection reason is required");
                return;
            }
        } else {
            if (!window.confirm("Approve this request? This will overwrite the employee's current face signature.")) return;
        }

        try {
            await faceXAPI.handleChangeRequest(id, { status, rejectionReason: reason });
            toast.success(`Request ${status} successfully`);
            fetchRequests(true);
        } catch (error) {
            toast.error("Process failed");
        }
    };

    const stats = {
        pending: requests.filter(r => r.status === "Pending").length,
        approved: requests.filter(r => r.status === "Approved").length,
        rejected: requests.filter(r => r.status === "Rejected").length,
        total: requests.length
    };

    const getEmployeeName = (req: any) => `${req.employee?.firstName || ""} ${req.employee?.lastName || ""}`.trim() || "Unknown Employee";

    return (
        <div className="main-content animate-fade-in fx-change-page">
            <div className="fx-page-header">
                <div className="fx-title-block">
                    <div className="fx-title-row">
                        <Scan size={24} className="fx-title-icon" />
                        <h1 className="page-title">Biometric Approval Workflow Center</h1>
                    </div>
                    <p className="page-subtitle">Security approval workflow for biometric face signature update requests.</p>
                </div>
                <button className="btn-secondary fx-refresh-btn" onClick={() => fetchRequests(true)} disabled={loading || refreshing}>
                    <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="fx-stats-grid">
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Requests</span>
                        <span className="fx-stat-icon orange"><Clock size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.pending}</strong>
                    <span className="fx-stat-note">Pending Review</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Verified</span>
                        <span className="fx-stat-icon green"><Check size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.approved}</strong>
                    <span className="fx-stat-note">Total Approved</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">Dismissed</span>
                        <span className="fx-stat-icon red"><X size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.rejected}</strong>
                    <span className="fx-stat-note">Total Rejected</span>
                </div>
                <div className="fx-stat-card">
                    <div className="fx-stat-head">
                        <span className="fx-stat-title">All Requests</span>
                        <span className="fx-stat-icon purple"><Shield size={16} /></span>
                    </div>
                    <strong className="fx-stat-value">{stats.total}</strong>
                    <span className="fx-stat-note">Current Dataset</span>
                </div>
            </div>

            <div className="glass-card fx-table-card">
                <div className="fx-table-header">
                    <div className="tabs-underline-container fx-tabs-wrap">
                        {["Pending", "Approved", "Rejected", ""].map(status => (
                            <button 
                                key={status}
                                className={`tab-underline ${statusFilter === status ? "active" : ""}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status || "All Requests"}
                            </button>
                        ))}
                    </div>
                    <span className="fx-chip">{statusFilter || "All"} • {requests.length}</span>
                </div>
                <div className="fx-table-subhead">
                    <span>Filter requests by status and review biometric signature changes with one-click actions.</span>
                </div>

                <div className="table-responsive">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Action</th>
                                <th>Employee Name</th>
                                <th>Branch / Dept</th>
                                <th>Request Date</th>
                                <th>Comparison Preview</th>
                                <th>Device Used</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                <tr>
                                    <td colSpan={8} className="fx-empty-row">
                                        <div className="fx-empty-content">
                                            <Loader2 className="spin" size={22} />
                                            <span>Loading change requests...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((req, idx) => (
                                    <tr key={req.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            {req.status === "Pending" ? (
                                                <div className="fx-actions">
                                                    <button className="btn-icon color-success" title="Approve" onClick={() => handleAction(req.id, "Approved")}>
                                                        <Check size={18} />
                                                    </button>
                                                    <button className="btn-icon color-danger" title="Reject" onClick={() => handleAction(req.id, "Rejected")}>
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-icon" title="View Request Details" onClick={() => setSelectedRequest(req)}>
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <div className="fx-employee-cell">
                                                <strong>{getEmployeeName(req)}</strong>
                                                <span>{req.employee?.designation}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fx-branch-cell">
                                                <strong>{req.employee?.branch}</strong>
                                                <span>{req.employee?.department}</span>
                                            </div>
                                        </td>
                                        <td><span className="fx-time-text">{new Date(req.createdAt).toLocaleString()}</span></td>
                                        <td>
                                            <div className="fx-compare-wrap">
                                                <div className="fx-compare-photo-group">
                                                    <div className="fx-compare-photo" style={{ backgroundImage: `url(${req.oldPhotoUrl || 'https://via.placeholder.com/40x40?text=Old'})` }} />
                                                    <div className="fx-compare-label">Old signature</div>
                                                </div>
                                                <ArrowRight size={14} color="var(--color-text-muted)" />
                                                <div className="fx-compare-photo-group">
                                                    <div className="fx-compare-photo new" style={{ backgroundImage: `url(${req.newPhotoUrl || 'https://via.placeholder.com/40x40?text=New'})` }} />
                                                    <div className="fx-compare-label emphasis">New request</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="fx-device-used">
                                                <Smartphone size={14} color="var(--primary)" />
                                                {req.device?.deviceModel || "Mobile App"}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                req.status === "Approved" ? "badge-success" : 
                                                req.status === "Rejected" ? "badge-danger" : 
                                                "badge-warning"
                                            }`}>
                                                {req.status}
                                            </span>
                                            {req.status === "Rejected" && req.rejectionReason && (
                                                <div className="fx-reject-reason">
                                                    Reason: {req.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="fx-empty-row">
                                        <div className="fx-empty-content">
                                            <AlertCircle size={22} />
                                            <span>No {(statusFilter || "pending").toLowerCase()} update requests found.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest && (
                <div className="fx-modal-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="fx-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fx-modal-head">
                            <div className="fx-modal-title-row">
                                <Eye size={18} />
                                <h4>Request Detail</h4>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedRequest(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="fx-modal-grid">
                            <div>
                                <label>Employee</label>
                                <p>{getEmployeeName(selectedRequest)}</p>
                            </div>
                            <div>
                                <label>Status</label>
                                <p><span className={`badge ${selectedRequest.status === "Approved" ? "badge-success" : selectedRequest.status === "Rejected" ? "badge-danger" : "badge-warning"}`}>{selectedRequest.status}</span></p>
                            </div>
                            <div>
                                <label>Branch</label>
                                <p>{selectedRequest.employee?.branch || "-"}</p>
                            </div>
                            <div>
                                <label>Department</label>
                                <p>{selectedRequest.employee?.department || "-"}</p>
                            </div>
                            <div>
                                <label>Requested On</label>
                                <p><CalendarClock size={14} /> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : "-"}</p>
                            </div>
                            <div>
                                <label>Device</label>
                                <p>{selectedRequest.device?.deviceModel || "Mobile App"}</p>
                            </div>
                            {selectedRequest.rejectionReason && (
                                <div className="fx-modal-wide">
                                    <label>Rejection Reason</label>
                                    <p>{selectedRequest.rejectionReason}</p>
                                </div>
                            )}
                        </div>
                        <div className="fx-modal-actions">
                            <button className="btn-secondary" onClick={() => setSelectedRequest(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceChangeRequest;
