import { useState, useEffect } from "react";
import axios from "axios";
import "./leavePayouts.css";
import { DollarSign, AlertCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves/payouts`;

export default function LeavePayouts() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        axios.get(API).then(r => setPayouts(r.data)).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    return (
        <div className="lm-container lm-fade lp-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><DollarSign size={22} /> Leave Payouts (Encashment)</h2>
                    <p className="lm-page-subtitle">View leave encashment requests and their statuses.</p>
                </div>
            </div>

            {!loading && payouts.length > 0 && (
                <div className="lm-stats-row mb-6">
                    <div className="lm-stat-card"><div className="lm-stat-label">Total Requests</div><div className="lm-stat-value">{payouts.length}</div></div>
                    <div className="lm-stat-card green"><div className="lm-stat-label">Approved</div><div className="lm-stat-value">{payouts.filter(p => p.status === "Approved").length}</div></div>
                    <div className="lm-stat-card orange"><div className="lm-stat-label">Pending</div><div className="lm-stat-value">{payouts.filter(p => p.status === "Pending").length}</div></div>
                    <div className="lm-stat-card red"><div className="lm-stat-label">Rejected</div><div className="lm-stat-value">{payouts.filter(p => p.status === "Rejected").length}</div></div>
                </div>
            )}

            {loading ? <div className="lm-loading">Loading payouts...</div> : (
                <div className="lm-card lp-card">
                    {payouts.length === 0 ? (
                        <div className="lp-empty">
                            <div className="lp-empty-icon-wrap">
                                <AlertCircle size={46} className="lp-empty-icon" />
                            </div>
                            <h3 className="lp-empty-title">No Leave Payouts</h3>
                            <p className="lp-empty-text">There are no leave encashment requests on record.</p>
                        </div>
                    ) : (
                        <div className="lp-table-wrap">
                        <table className="lp-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Leave Type</th>
                                    <th>Days Encashed</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map(p => (
                                    <tr key={p.id}>
                                        <td className="lp-cell-employee">
                                            {p.employee?.firstName} {p.employee?.lastName}
                                        </td>
                                        <td>
                                            {p.leaveType?.name || 'Annual Leave'}
                                        </td>
                                        <td>
                                            <strong>{p.days}</strong> days
                                        </td>
                                        <td>
                                            <span className={`lm-badge ${p.status === 'Approved' ? 'lm-badge-green' : p.status === 'Rejected' ? 'lm-badge-red' : 'lm-badge-orange'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
