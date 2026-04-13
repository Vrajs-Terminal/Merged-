import { useState, useEffect } from "react";
import axios from "axios";
import "./autoLeaves.css";
import { ShieldAlert, Trash2, Calendar, AlertTriangle } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves/auto`;

export default function AutoLeaves() {
    const [autoLeaves, setAutoLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<any>(null);

    const load = () => {
        setLoading(true);
        axios.get(API).then(r => setAutoLeaves(r.data)).catch(() => { }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to reverse this penalty/auto-leave?")) return;
        setMsg(null);
        try {
            await axios.delete(`${API}/${id}`);
            setMsg({ type: "success", text: "Auto-leave record deleted and reversed." });
            load();
        } catch (err: any) {
            setMsg({ type: "error", text: "Failed to delete the record." });
        }
    };

    return (
        <div className="lm-container lm-fade lp-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><ShieldAlert size={22} /> Auto-Deducted Leaves (Penalties)</h2>
                    <p className="lm-page-subtitle">Review leaves automatically deducted by the system due to shift late marks or absences.</p>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"} mb-4`}>
                    {msg.text}
                </div>
            )}

            {loading ? <div className="lm-loading">Loading penalty records...</div> : (
                <div className="lm-card lp-card">
                    {autoLeaves.length === 0 ? (
                        <div className="lp-empty lp-empty-warning">
                            <div className="lp-empty-icon-wrap lp-empty-icon-wrap-warning">
                                <AlertTriangle size={46} className="lp-empty-icon lp-empty-icon-warning" />
                            </div>
                            <h3 className="lp-empty-title">No Penalties Found</h3>
                            <p className="lp-empty-text">There are no auto-leaves or shift penalties on record.</p>
                        </div>
                    ) : (
                        <div className="lp-table-wrap">
                        <table className="lp-table lp-table-auto">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Date Applied</th>
                                    <th>Deduction Rule</th>
                                    <th>Days Deducted</th>
                                    <th className="lp-col-action">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {autoLeaves.map(a => (
                                    <tr key={a.id}>
                                        <td className="lp-cell-employee">
                                            <div className="lp-employee-pill">
                                                <div className="lp-employee-avatar">
                                                    {a.employee?.firstName?.[0]}{a.employee?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <div>{a.employee?.firstName} {a.employee?.lastName}</div>
                                                    <div className="lp-employee-id">{a.employee?.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="lp-date-cell">
                                                <Calendar size={14} />
                                                {a.leaveDate?.split("T")[0]}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="lm-badge lm-badge-orange">{a.ruleApplied || 'Late Mark Penalty'}</span>
                                        </td>
                                        <td>
                                            <strong>{a.daysDeducted}</strong> days
                                        </td>
                                        <td className="lp-col-action">
                                            <button onClick={() => handleDelete(a.id)} className="lp-delete-btn" title="Reverse Penalty">
                                                <Trash2 size={18} />
                                            </button>
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
