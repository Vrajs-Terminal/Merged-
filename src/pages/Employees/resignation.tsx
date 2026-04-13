import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Send, FileText, User, Calendar, Trash2 } from "lucide-react";
import "./resignation.css";
import PageTitle from "../../components/PageTitle";

function Resignation() {
    const [activeTab, setActiveTab] = useState("Submit");
    const [employees, setEmployees] = useState<any[]>([]);
    const [resignations, setResignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        employeeId: "",
        reason: "",
        noticePeriodDays: 30
    });

    // Review Modal
    const [selectedResignation, setSelectedResignation] = useState<any>(null);
    const [reviewRemarks, setReviewRemarks] = useState("");
    const [finalLwd, setFinalLwd] = useState("");

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "Submit") {
                const res = await axios.get(`${API_BASE}/employees`);
                setEmployees(res.data.filter((e: any) => e.status === "Active"));
            } else {
                const res = await axios.get(`${API_BASE}/resignations`);
                setResignations(res.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.employeeId || !formData.reason) return alert("All fields are required");
        try {
            await axios.post(`${API_BASE}/resignations`, formData);
            alert("Resignation Submitted Successfully");
            setFormData({ employeeId: "", reason: "", noticePeriodDays: 30 });
        } catch (error: any) {
            alert(error.response?.data?.error || "Submission failed");
        }
    };

    const handleApprove = async () => {
        try {
            await axios.put(`${API_BASE}/resignations/${selectedResignation.id}/approve`, {
                remarks: reviewRemarks,
                finalLastWorkingDate: finalLwd || selectedResignation.lastWorkingDate
            });
            alert("Resignation Approved. Offboarding checklist initiated.");
            setSelectedResignation(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Approval failed");
        }
    };

    const handleReject = async () => {
        if (!reviewRemarks) return alert("Remarks are required for rejection");
        try {
            await axios.put(`${API_BASE}/resignations/${selectedResignation.id}/reject`, {
                remarks: reviewRemarks
            });
            alert("Resignation Rejected.");
            setSelectedResignation(null);
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || "Rejection failed");
        }
    };

    const renderSubmitTab = () => (
        <div className="glass-card max-w-[600px] mx-auto p-8 animate-slide-up">
            <div className="card-header-simple border-b pb-4 mb-6">
                <h3>Submit Resignation</h3>
                <p className="text-xs text-muted">Capture exit intent and calculate notice period alignment</p>
            </div>

            <div className="space-y-6">
                <div className="form-group">
                    <label className="form-group-label">Select Employee</label>
                    <div className="relative">
                        <select className="form-group-select" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}>
                            <option value="">-- Choose Employee --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-group-label">Notice Period (Days)</label>
                    <input className="form-group-input" type="number" value={formData.noticePeriodDays} onChange={e => setFormData({ ...formData, noticePeriodDays: parseInt(e.target.value) })} min="0" />
                </div>

                <div className="form-group">
                    <label className="form-group-label">Reason for Leaving</label>
                    <textarea className="form-group-input min-h-[120px]" rows={4} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="State the reason..."></textarea>
                </div>

                <button className="btn btn-primary w-full btn-lg" onClick={handleSubmit}>
                    <Send size={18} /> Submit Formal Notice
                </button>
            </div>
        </div>
    );

    const renderReviewTab = () => (
        <div className="glass-card overflow-hidden animate-slide-up">
            <div className="card-header-simple border-b px-6 py-4">
                <h3>Resignation Requests</h3>
            </div>
            {loading ? (
                <div className="flex-col flex-center py-20">
                    <div className="spinner mb-4"></div>
                    <p className="text-muted">Loading requests...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>Employee / ID</th>
                                <th>Date Submitted</th>
                                <th>Expected LWD</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resignations.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar-sm bg-primary text-white font-bold">
                                                {r.employee?.firstName?.charAt(0)}{r.employee?.lastName?.charAt(0)}
                                            </div>
                                            <div className="flex-col">
                                                <span className="font-bold text-slate-800 leading-tight">{r.employee?.firstName} {r.employee?.lastName}</span>
                                                <span className="text-[10px] text-muted font-mono">{r.employee?.employeeId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm font-medium text-slate-700">{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td className="text-sm font-medium text-slate-700">{new Date(r.lastWorkingDate).toLocaleDateString()}</td>
                                    <td>
                                        <div className="text-[11px] max-w-[180px] wrap-break-word line-clamp-2 italic" title={r.reason}>
                                            "{r.reason}"
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${r.status.toLowerCase()}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end">
                                            <button
                                                className="act-btn edit"
                                                onClick={() => {
                                                    setSelectedResignation(r);
                                                    setReviewRemarks(r.remarks || "");
                                                    setFinalLwd(new Date(r.lastWorkingDate).toISOString().split('T')[0]);
                                                }}
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {resignations.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                        <div className="flex-col flex-center text-muted">
                                            <FileText size={48} className="opacity-20 mb-4" />
                                            <p className="text-lg font-bold">No Pending Requests</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="resignation-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Separation Management" 
                    subtitle="Capture employee resignations and manage formalized exit requests" 
                />
            </div>

            <div className="branch-nav-wrapper mb-8">
                <div className="branch-nav">
                    <button className={`branch-nav-item ${activeTab === "Submit" ? "active" : ""}`} onClick={() => setActiveTab("Submit")}>
                        Submit Request Flow
                    </button>
                    <button className={`branch-nav-item ${activeTab === "Review" ? "active" : ""}`} onClick={() => setActiveTab("Review")}>
                        HR Review Command
                    </button>
                </div>
            </div>

            {activeTab === "Submit" ? renderSubmitTab() : renderReviewTab()}

            {/* Review Modal */}
            {selectedResignation && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Review Resignation</h3>
                        <p style={{ marginBottom: '10px' }}><strong>Employee:</strong> {selectedResignation.employee.firstName} {selectedResignation.employee.lastName}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Reason:</strong> {selectedResignation.reason}</p>

                        {selectedResignation.status === "Pending" ? (
                            <>
                                <div className="form-group" style={{ marginTop: '20px' }}>
                                    <label>Confirm Last Working Date (LWD)</label>
                                    <input type="date" value={finalLwd} onChange={e => setFinalLwd(e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>HR Remarks</label>
                                    <textarea rows={3} value={reviewRemarks} onChange={e => setReviewRemarks(e.target.value)} placeholder="Approval conditions or rejection reason..."></textarea>
                                </div>
                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={() => setSelectedResignation(null)}>Cancel</button>
                                    <button className="btn btn-success" onClick={handleApprove}>Approve (Start Offboarding)</button>
                                    <button className="btn btn-danger" onClick={handleReject}>Reject</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p style={{ marginTop: '20px' }}><strong>Status:</strong> <span className={`status-badge ${selectedResignation.status.toLowerCase()}`}>{selectedResignation.status}</span></p>
                                <p><strong>Remarks:</strong> {selectedResignation.remarks || 'None'}</p>
                                <div className="modal-actions">
                                    <button className="btn btn-secondary" onClick={() => setSelectedResignation(null)}>Close</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Resignation;
