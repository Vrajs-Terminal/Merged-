import React, { useState, useEffect } from "react";
import axios from "axios";
import { Check, X, HandCoins } from "lucide-react";
import API_BASE from "../api";

export default function AdvanceSalaryRequests() {
    const [requests, setRequests] = useState<any[]>([]);
    const [actionModal, setActionModal] = useState<any>(null); // { req: any, type: 'Approved' | 'Rejected' }
    const [adminRemark, setAdminRemark] = useState("");

    const userRaw = localStorage.getItem("user");
    const currentUser = userRaw ? JSON.parse(userRaw) : null;

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE}/advance-requests`);
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to load requests", e);
            setRequests([]);
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`${API_BASE}/advance-requests/${actionModal.req.id}/status`, {
                status: actionModal.type,
                adminRemark,
                approvedBy: currentUser?.id,
                givenMode: "Bank"
            });
            setActionModal(null);
            setAdminRemark("");
            loadRequests();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error processing request status");
        }
    };

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HandCoins size={22} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Advance Salary Requests</h2>
                </div>
                <p className="page-subtitle">Review, approve, or reject advance salary requests submitted by employees.</p>
            </div>

            {actionModal ? (
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                        {actionModal.type === 'Approved' ? 'Approve' : 'Reject'} Request
                    </h3>
                    <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>Employee: <strong>{actionModal.req.employee?.firstName} {actionModal.req.employee?.lastName}</strong></p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--primary)' }}>Requested Amount: <strong>₹{actionModal.req.requestedAmount}</strong></p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Reason: {actionModal.req.reason}</p>
                    </div>

                    <form onSubmit={handleAction} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label className="input-label">Admin Remarks</label>
                            <input type="text" className="input-modern" value={adminRemark} onChange={e => setAdminRemark(e.target.value)} required={actionModal.type === 'Rejected'} placeholder={actionModal.type === 'Rejected' ? "Reason for rejection is required" : "Optional approval notes"} />
                        </div>
                        {actionModal.type === 'Approved' && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                Approving this will immediately allocate ₹{actionModal.req.requestedAmount} to the employee's active Advance tab and flag them for Payroll deduction.
                            </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setActionModal(null)}>Cancel</button>
                            <button type="submit" className={`btn btn-${actionModal.type === 'Approved' ? 'success' : 'danger'}`}>
                                {actionModal.type === 'Approved' ? <Check size={16} /> : <X size={16} />} Confirm {actionModal.type}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="table-modern">
                        <thead>
                            <tr>
                                <th>#ID</th>
                                <th>Employee</th>
                                <th>Requested Amount</th>
                                <th>Reason</th>
                                <th>Request Date</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td>#{req.id}</td>
                                    <td style={{ fontWeight: 500 }}>{req.employee?.firstName} {req.employee?.lastName}</td>
                                    <td style={{ fontWeight: 600 }}>₹{req.requestedAmount}</td>
                                    <td>{req.reason || "-"}</td>
                                    <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge badge-${req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        {req.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '12px', minHeight: 'unset' }} onClick={() => setActionModal({ req, type: 'Approved' })}>
                                                    Approve
                                                </button>
                                                <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px', minHeight: 'unset' }} onClick={() => setActionModal({ req, type: 'Rejected' })}>
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {req.status !== 'Pending' && (
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{req.adminRemark || "-"}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No advance requests found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
