import { useState, useEffect } from "react";
import axios from "axios";
import { 
    RefreshCcw, 
    CheckCircle, 
    XCircle, 
    Clock, 
    Calendar, 
    Plus,
    AlertCircle,
    Inbox
} from "lucide-react";
import API_BASE from "../api";

const API = `${API_BASE}/shifts`;

function ShiftChangeRequests({ user }: { user: any }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [shifts, setShifts] = useState<any[]>([]);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ requestedShiftId: "", date: "", reason: "" });

    const isAdmin = user?.role === "Admin" || user?.role === "HR";

    useEffect(() => {
        fetchRequests();
        fetchShifts();
    }, []);

    const fetchRequests = async () => {
        try {
            const r = await axios.get(`${API}/change-requests`);
            setRequests(r.data.requests);
        } catch (e) { }
    };

    const fetchShifts = async () => {
        try {
            const r = await axios.get(API);
            setShifts(r.data.shifts);
        } catch (e) { }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/change-requests`, {
                ...form,
                employeeId: user.id // In production, this would be from auth
            });
            setMsg({ type: "success", text: "Request submitted successfully!" });
            setShowAdd(false);
            setForm({ requestedShiftId: "", date: "", reason: "" });
            fetchRequests();
        } catch (err) {
            setMsg({ type: "error", text: "Failed to submit request." });
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await axios.patch(`${API}/change-requests/${id}`, { status });
            setMsg({ type: "success", text: `Request ${status.toLowerCase()}!` });
            fetchRequests();
        } catch (e) { }
    };

    return (
        <div className="sm-container fade-in">
            <div className="sm-page-header">
                <div>
                    <h2 className="sm-page-title"><RefreshCcw size={22} color="#4f46e5" /> Shift Change Requests</h2>
                    <p className="sm-page-subtitle">Manage temporary shift adjustments and employee requests</p>
                </div>
                {!isAdmin && (
                    <button className="btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={18} /> New Request
                    </button>
                )}
            </div>

            {msg && (
                <div className={`sm-alert sm-alert-${msg.type}`} style={{ marginBottom: "1.5rem" }}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {msg.text}
                </div>
            )}

            {requests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#f8fafc", borderRadius: "16px", border: "2px dashed #e2e8f0", marginTop: "2rem" }}>
                    <div style={{ background: "#e0e7ff", width: 64, height: 64, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                        <Inbox size={32} color="#4f46e5" />
                    </div>
                    <h3 style={{ fontSize: "1.25rem", color: "#1e293b", marginBottom: "0.5rem" }}>No Shift Change Requests Yet</h3>
                    <p style={{ color: "#64748b", maxWidth: "400px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
                        Employees can submit requests to change their assigned shifts temporarily. All requests will appear here for Manager/HR approval.
                    </p>
                    {!isAdmin && (
                        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ padding: "0.75rem 1.5rem", borderRadius: "8px" }}>
                            <Plus size={18} /> Submit a Request Now
                        </button>
                    )}
                </div>
            ) : (
                <div className="requests-list" style={{ marginTop: "2rem" }}>
                    <table className="attendance-table" style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                        <thead style={{ background: "#f8fafc", color: "#64748b", textTransform: "uppercase", fontSize: "0.75rem", textAlign: "left" }}>
                            <tr>
                                <th style={{ padding: "1rem" }}>Employee</th>
                                <th style={{ padding: "1rem" }}>Target Date</th>
                                <th style={{ padding: "1rem" }}>Requested Shift</th>
                                <th style={{ padding: "1rem" }}>Reason</th>
                                <th style={{ padding: "1rem" }}>Status</th>
                                {isAdmin && <th style={{ padding: "1rem" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req: any) => (
                                <tr key={req.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = "#f8fafc"} onMouseOut={e => e.currentTarget.style.background = "white"}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#4f46e5", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                                                {req.employee?.firstName?.[0]}{req.employee?.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: "#1e293b" }}>{req.employee?.firstName} {req.employee?.lastName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{req.employee?.employeeId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#1e293b" }}>
                                            <Calendar size={14} color="#6366f1" /> {new Date(req.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 500, color: "#1e293b" }}>
                                            <Clock size={14} color="#f59e0b" /> {req.requestedShift?.shiftName}
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{req.reason}</div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{ 
                                            padding: "6px 12px", 
                                            borderRadius: "20px", 
                                            fontSize: "0.75rem", 
                                            fontWeight: 600,
                                            background: req.status === "Approved" ? "#ecfdf5" : req.status === "Rejected" ? "#fef2f2" : "#fffbeb",
                                            color: req.status === "Approved" ? "#059669" : req.status === "Rejected" ? "#ef4444" : "#d97706",
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.25rem"
                                        }}>
                                            {req.status === "Approved" && <CheckCircle size={12} />}
                                            {req.status === "Rejected" && <XCircle size={12} />}
                                            {req.status === "Pending" && <Clock size={12} />}
                                            {req.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td style={{ padding: "1rem" }}>
                                            {req.status === "Pending" ? (
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => handleStatusUpdate(req.id, "Approved")} style={{ background: "#ecfdf5", border: "1px solid #10b981", color: "#059669", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }} title="Approve">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button onClick={() => handleStatusUpdate(req.id, "Rejected")} style={{ background: "#fef2f2", border: "1px solid #ef4444", color: "#dc2626", padding: "6px 10px", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s" }} title="Reject">
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No actions</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAdd && (
                <div className="sm-modal-overlay">
                    <div className="sm-modal-content">
                        <h3>Request Shift Change</h3>
                        <form onSubmit={handleCreate}>
                            <div className="sm-field">
                                <label className="sm-label">Effective Date</label>
                                <input className="sm-input" type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                            </div>
                            <div className="sm-field">
                                <label className="sm-label">Desired Shift</label>
                                <select className="sm-select" value={form.requestedShiftId} onChange={e => setForm({...form, requestedShiftId: e.target.value})} required>
                                    <option value="">Select Shift</option>
                                    {shifts.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.shiftName} ({s.startTime}-{s.endTime})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm-field">
                                <label className="sm-label">Reason</label>
                                <textarea className="sm-input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={3} placeholder="Why do you need this change?" required />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Request</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShiftChangeRequests;
