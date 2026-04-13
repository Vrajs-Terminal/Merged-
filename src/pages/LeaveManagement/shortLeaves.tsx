import { useState, useEffect } from "react";
import axios from "axios";
import "./shortLeaves.css";
import { Clock, AlertCircle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves/short`;

export default function ShortLeaves() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        axios.get(API).then(r => setLeaves(r.data)).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    return (
        <div className="lm-container lm-fade sl-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><Clock size={22} /> Short Leaves (Hourly)</h2>
                    <p className="lm-page-subtitle">View hourly short leave requests and their statuses.</p>
                </div>
            </div>

            {!loading && leaves.length > 0 && (
                <div className="lm-stats-row mb-6">
                    <div className="lm-stat-card"><div className="lm-stat-label">Total Requests</div><div className="lm-stat-value">{leaves.length}</div></div>
                    <div className="lm-stat-card green"><div className="lm-stat-label">Approved</div><div className="lm-stat-value">{leaves.filter(l => l.status === "Approved").length}</div></div>
                    <div className="lm-stat-card orange"><div className="lm-stat-label">Pending</div><div className="lm-stat-value">{leaves.filter(l => l.status === "Pending").length}</div></div>
                    <div className="lm-stat-card red"><div className="lm-stat-label">Rejected</div><div className="lm-stat-value">{leaves.filter(l => l.status === "Rejected").length}</div></div>
                </div>
            )}

            {loading ? <div className="lm-loading">Loading short leaves...</div> : (
                <div className="lm-card sl-card">
                    {leaves.length === 0 ? (
                        <div className="sl-empty">
                            <div className="sl-empty-icon-wrap">
                                <AlertCircle size={46} className="sl-empty-icon" />
                            </div>
                            <h3 className="sl-empty-title">No Short Leaves</h3>
                            <p className="sl-empty-text">There are no short hourly leave requests on record.</p>
                        </div>
                    ) : (
                        <div className="sl-table-wrap">
                        <table className="sl-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map(l => (
                                    <tr key={l.id}>
                                        <td className="sl-cell-employee">
                                            {l.employee?.firstName} {l.employee?.lastName}
                                        </td>
                                        <td>
                                            {l.date?.split("T")[0]}
                                        </td>
                                        <td>
                                            {l.startTime} - {l.endTime}
                                        </td>
                                        <td className="sl-cell-reason">
                                            {l.reason || "—"}
                                        </td>
                                        <td>
                                            <span className={`lm-badge ${l.status === 'Approved' ? 'lm-badge-green' : l.status === 'Rejected' ? 'lm-badge-red' : 'lm-badge-orange'}`}>
                                                {l.status}
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
