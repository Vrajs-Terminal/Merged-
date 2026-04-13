import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { CheckCircle, XCircle, Eye, Search, UserCog, Filter, AlertTriangle } from "lucide-react";
import "./profileChangeRequests.css";
import PageTitle from "../../components/PageTitle";

interface EmployeeRef {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    branch: string;
    department: string;
}

interface ProfileChangeRequest {
    id: number;
    employee: EmployeeRef;
    changeType: string;
    oldData: any;
    newData: any;
    riskLevel: string;
    status: string;
    createdAt: string;
    rejectionReason?: string;
    reviewedBy?: number;
}

function ProfileChangeRequests() {
    const [requests, setRequests] = useState<ProfileChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ProfileChangeRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Filters
    const [filterStatus, setFilterStatus] = useState("Pending");
    const [filterRisk, setFilterRisk] = useState("All");
    const [filterBranch, setFilterBranch] = useState("All");
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [searchEmployee, setSearchEmployee] = useState("");

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE}/profile-changes?status=${filterStatus === 'All' ? '' : filterStatus}`);
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [filterStatus]);

    const handleApprove = async () => {
        if (!selectedRequest) return;
        try {
            await axios.put(`${API_BASE}/profile-changes/${selectedRequest.id}/approve`, {
                reviewedBy: 1 // TODO: Get logged in admin ID
            });
            alert("Request approved successfully");
            setSelectedRequest(null);
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || "Error approving request");
        }
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        if (!rejectionReason) return alert("Please provide a rejection reason");
        try {
            await axios.put(`${API_BASE}/profile-changes/${selectedRequest.id}/reject`, {
                reviewedBy: 1, // TODO: Get logged in admin ID
                rejectionReason
            });
            alert("Request rejected");
            setSelectedRequest(null);
            setRejectionReason("");
            fetchRequests();
        } catch (error: any) {
            alert(error.response?.data?.error || "Error rejecting request");
        }
    };

    // Helper: calculate if pending for > 2 days (SLA breach)
    const isSLABreached = (dateString: string, status: string) => {
        if (status !== 'Pending') return false;
        const requestedDate = new Date(dateString);
        const diffTime = Math.abs(new Date().getTime() - requestedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 2;
    };

    // Client-side filtering for other parameters
    const filteredRequests = requests.filter(req => {
        const matchesRisk = filterRisk === "All" || req.riskLevel === filterRisk;
        const matchesBranch = filterBranch === "All" || req.employee.branch === filterBranch;
        const matchesDept = filterDepartment === "All" || req.employee.department === filterDepartment;
        const matchesEmp = searchEmployee === "" ||
            `${req.employee.firstName} ${req.employee.lastName} ${req.employee.employeeId}`.toLowerCase().includes(searchEmployee.toLowerCase());

        return matchesRisk && matchesBranch && matchesDept && matchesEmp;
    });

    // Helper to render JSON diff beautifully
    const renderJSONDiff = (oldData: any, newData: any) => {
        const keys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
        return (
            <table className="diff-table">
                <thead>
                    <tr>
                        <th>Field</th>
                        <th>Old Value</th>
                        <th>New Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(keys).map(key => {
                        const oldVal = oldData?.[key];
                        const newVal = newData?.[key];
                        const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal);

                        if (!isChanged) return null; // Only show changed fields

                        return (
                            <tr key={key} className={isChanged ? "highlight-change" : ""}>
                                <td>{key}</td>
                                <td className="old-val">{oldVal ? String(oldVal) : "-"}</td>
                                <td className="new-val">{newVal ? String(newVal) : "-"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    // Extract unique branches and departments for dropdowns
    const branches = Array.from(new Set(requests.map(r => r.employee.branch).filter(Boolean)));
    const departments = Array.from(new Set(requests.map(r => r.employee.department).filter(Boolean)));

    return (
        <div className="profile-change-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Self-Service Requests" 
                    subtitle="Review and moderate employee profile update requests and data changes" 
                />
            </div>

            <div className="glass-card mb-8">
                <div className="form-grid-3">
                    <div className="form-group">
                        <label className="form-group-label">Branch</label>
                        <select className="form-group-select" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                            <option value="All">All Branches</option>
                            {branches.map((b: any) => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-group-label">Department</label>
                        <select className="form-group-select" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
                            <option value="All">All Departments</option>
                            {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-group-label">Status</label>
                        <select className="form-group-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="All">All Requests</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-group-label">Risk Level</label>
                        <select className="form-group-select" value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)}>
                            <option value="All">All Risks</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="form-group col-span-2">
                        <label className="form-group-label">Employee Search</label>
                        <input
                            className="form-group-input"
                            type="text"
                            placeholder="Search name or ID..."
                            value={searchEmployee}
                            onChange={(e) => setSearchEmployee(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="table-wrapper glass-card overflow-hidden">
                {loading ? (
                    <div className="flex-col flex-center py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-muted">Loading change requests...</p>
                    </div>
                ) : (
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Risk Matrix</th>
                                <th>Submission Date</th>
                                <th>Decision Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id} className={isSLABreached(req.createdAt, req.status) ? "sla-breach-row" : ""}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar-sm bg-primary text-white font-bold">
                                                {req.employee.firstName?.charAt(0)}{req.employee.lastName?.charAt(0)}
                                            </div>
                                            <div className="flex-col">
                                                <span className="font-bold text-slate-800 leading-tight">{req.employee.firstName} {req.employee.lastName}</span>
                                                <span className="text-[10px] text-muted font-mono">{req.employee.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="text-sm font-medium text-slate-700">{req.changeType}</span>
                                    </td>
                                    <td>
                                        <span className={`status-badge !rounded-lg ${req.riskLevel.toLowerCase()}`}>
                                            {req.riskLevel}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</span>
                                            {isSLABreached(req.createdAt, req.status) && (
                                                <AlertTriangle size={14} className="text-red-500 animate-pulse" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end">
                                            <button className="act-btn view" onClick={() => setSelectedRequest(req)}>
                                                Review Changes
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "60px" }}>
                                        <div className="flex-col flex-center text-muted">
                                            <Search size={48} className="opacity-20 mb-4" />
                                            <p className="text-lg font-bold">No Records Found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Review Modal */}
            {selectedRequest && (
                <div className="modal-overlay">
                    <div className="modal-content review-modal-content">
                        <div className="modal-header">
                            <h3>Review Change Request</h3>
                            <button className="close-btn" onClick={() => { setSelectedRequest(null); setRejectionReason(""); }}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="request-summary">
                                <p><strong>Employee:</strong> {selectedRequest.employee.firstName} {selectedRequest.employee.lastName} ({selectedRequest.employee.employeeId})</p>
                                <p><strong>Change Type:</strong> {selectedRequest.changeType}</p>
                                <p>
                                    <strong>Risk Level:</strong>
                                    <span className={`risk-badge ${selectedRequest.riskLevel.toLowerCase()}`} style={{ marginLeft: '10px' }}>
                                        {selectedRequest.riskLevel}
                                    </span>
                                </p>
                            </div>

                            <h4>Data Changes:</h4>
                            {renderJSONDiff(selectedRequest.oldData, selectedRequest.newData)}

                            <div className="audit-trail mt-4">
                                <h4 className="text-sm font-bold mb-2">Audit Trail</h4>
                                <ul style={{ listStyleType: "none", padding: 0, fontSize: "13px", color: "#64748b" }}>
                                    <li><strong>Requested On:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</li>
                                    {selectedRequest.status !== "Pending" && (
                                        <li><strong>Reviewed By Admin ID:</strong> {selectedRequest.reviewedBy || "System"}</li>
                                    )}
                                </ul>
                            </div>

                            {selectedRequest.status === "Pending" && (
                                <div className="action-area">
                                    <textarea
                                        placeholder="Reason for rejection (Required if rejecting)..."
                                        className="form-group-input min-h-[80px] mb-4"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                    />
                                    <div className="action-buttons">
                                        <button className="btn btn-success" onClick={handleApprove}>
                                            <CheckCircle size={18} /> Approve & Apply
                                        </button>
                                        <button className="btn btn-danger" onClick={handleReject}>
                                            <XCircle size={18} /> Reject Request
                                        </button>
                                    </div>
                                </div>
                            )}

                            {selectedRequest.status === "Rejected" && (
                                <div className="rejection-note" style={{ marginTop: "15px", padding: "10px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "5px" }}>
                                    <strong>Rejection Reason:</strong> {selectedRequest.rejectionReason}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProfileChangeRequests;
