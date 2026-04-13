import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import "./leaveApprovals.css";

function LeaveApprovals() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/leaves/requests`);
            // Only show Pending requests for approval, but could show all history
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, status: string) => {
        try {
            const userRaw = localStorage.getItem("user");
            const currentUser = userRaw ? JSON.parse(userRaw) : null;
            await axios.put(`${API_BASE}/leaves/request/${id}/review`, {
                status,
                reviewedBy: currentUser?.id
            });
            fetchRequests(); // refresh local state
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to modify request.");
        }
    };

    return (
        <div className="leave-container lreq-legacy-page">
            <div className="leave-header">
                <h2>Leave Approvals (HR)</h2>
                <p>Manage and review employee time off requests.</p>
            </div>

            <div className="form-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? <p style={{ padding: '24px' }}>Loading requests...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Employee</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Leave Type</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Duration</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Dates</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Reason</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '13px', color: '#64748b' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: '500' }}>
                                        {r.employee?.firstName} {r.employee?.lastName}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>{r.leaveType?.name}</td>
                                    <td style={{ padding: '16px 24px' }}>{r.days} days</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.reason}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span className={`h-status ${r.status}`}>{r.status}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {r.status === 'Pending' && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleAction(r.id, "Approved")}
                                                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(r.id, "Rejected")}
                                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center' }}>No leave requests found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default LeaveApprovals;
