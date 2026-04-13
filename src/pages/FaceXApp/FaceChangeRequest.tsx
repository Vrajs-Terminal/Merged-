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
    Scan
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
    const [statusFilter, setStatusFilter] = useState("Pending");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await faceXAPI.getChangeRequests({ status: statusFilter });
            setRequests(res.data);
        } catch (error) {
            toast.error("Failed to load face change requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

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
            fetchRequests();
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

    return (
        <div className="main-content animate-fade-in fx-change-page">
            <div className="page-header fx-page-header">
                <div>
                    <h1 className="page-title"><Scan size={22} /> Approval Workflow</h1>
                    <p className="page-subtitle">Security approval workflow for biometric face signature update requests</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="main-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.1s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-orange"><Clock size={16} /></div>
                        <div className="ns-change positive">Requests</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.pending}</div>
                        <div className="ns-title">Pending Review</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.2s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-green"><Check size={16} /></div>
                        <div className="ns-change positive">Verified</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.approved}</div>
                        <div className="ns-title">Total Approved</div>
                    </div>
                </div>
                <div className="new-stat-card animate-slide-in" style={{ animationDelay: "0.3s" }}>
                    <div className="ns-header">
                        <div className="ns-icon ns-red"><X size={16} /></div>
                        <div className="ns-change negative">Dismissed</div>
                    </div>
                    <div className="ns-body">
                        <div className="ns-value">{stats.rejected}</div>
                        <div className="ns-title">Total Rejected</div>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", padding: "20px", alignItems: "center" }}>
                    <div className="tabs-underline-container" style={{ gap: "0", flex: 1 }}>
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
                                    <td colSpan={8} style={{ textAlign: "center", padding: "80px" }}>
                                        <Loader2 className="animate-spin" size={40} style={{ margin: "0 auto" }} />
                                    </td>
                                </tr>
                            ) : requests.length > 0 ? (
                                requests.map((req, idx) => (
                                    <tr key={req.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            {req.status === "Pending" ? (
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button className="btn-icon color-success" title="Approve" onClick={() => handleAction(req.id, "Approved")}>
                                                        <Check size={18} />
                                                    </button>
                                                    <button className="btn-icon color-danger" title="Reject" onClick={() => handleAction(req.id, "Rejected")}>
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn-icon" title="View Request Details">
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: "700" }}>{req.employee?.firstName} {req.employee?.lastName}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{req.employee?.designation}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: "12px" }}>{req.employee?.branch}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{req.employee?.department}</div>
                                        </td>
                                        <td>{new Date(req.createdAt).toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{ textAlign: "center" }}>
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `url(${req.oldPhotoUrl || 'https://via.placeholder.com/40x40?text=Old'})`, backgroundSize: "cover" }}></div>
                                                    <div style={{ fontSize: "9px" }}>Old signature</div>
                                                </div>
                                                <ArrowRight size={14} color="var(--text-muted)" />
                                                <div style={{ textAlign: "center" }}>
                                                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `url(${req.newPhotoUrl})`, backgroundSize: "cover", border: "2px solid var(--primary-light)" }}></div>
                                                    <div style={{ fontSize: "9px", fontWeight: "700" }}>New request</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
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
                                                <div style={{ fontSize: "10px", color: "var(--danger)", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    Reason: {req.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "100px", opacity: 0.5 }}>
                                        <AlertCircle size={48} style={{ margin: "0 auto 16px" }} />
                                        <h3>No {statusFilter.toLowerCase()} update requests found.</h3>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FaceChangeRequest;
