import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Plus,
    AlertCircle,
    ArrowRightLeft,
    Clock
} from "lucide-react";
import API_BASE from "../api";
import "./holidayExchangeRequests.css";

const API = `${API_BASE}/holidays`;

function HolidayExchangeRequests({ user }: { user: any }) {
    const [requests, setRequests] = useState<any[]>([]);
    const [holidays, setHolidays] = useState<any[]>([]);
    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ originalHolidayId: "", exchangeDate: "", reason: "" });

    const isAdmin = user?.role === "Admin" || user?.role === "HR";

    useEffect(() => {
        fetchRequests();
        fetchHolidays();
    }, []);

    const fetchRequests = async () => {
        try {
            const r = await axios.get(`${API}/exchange`);
            setRequests(r.data.requests);
        } catch (e) { }
    };

    const fetchHolidays = async () => {
        try {
            const r = await axios.get(API);
            setHolidays(r.data.holidays);
        } catch (e) { }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/exchange`, {
                ...form,
                employeeId: user.id
            });
            setMsg({ type: "success", text: "Exchange request submitted!" });
            setShowAdd(false);
            setForm({ originalHolidayId: "", exchangeDate: "", reason: "" });
            fetchRequests();
        } catch (err) {
            setMsg({ type: "error", text: "Failed to submit request." });
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        try {
            await axios.patch(`${API}/exchange/${id}`, { status });
            setMsg({ type: "success", text: `Request ${status.toLowerCase()}!` });
            fetchRequests();
        } catch (e) { }
    };

    return (
        <div className="sm-container fade-in">
            <div className="exchange-header">
                <div className="exchange-header-content">
                    <h2 className="sm-page-title"><ArrowRightLeft size={22} /> Holiday Exchange</h2>
                    <p>Swap public holidays for optional working days or vice versa</p>
                </div>
                {!isAdmin && (
                    <button className="exchange-add-btn btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={18} /> New Exchange
                    </button>
                )}
            </div>

            {msg && (
                <div className={`exchange-alert exchange-alert-${msg.type}`}>
                    {msg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{msg.text}</span>
                </div>
            )}

            <div className="exchange-table-wrapper">
                <table className="exchange-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Holiday to Swap</th>
                            <th>New Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} style={{textAlign: 'center', padding: 'var(--space-8)'}}>
                                    <div className="exchange-empty">
                                        <p className="exchange-empty-text">No exchange requests yet</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            requests.map((req: any) => (
                                <tr key={req.id}>
                                    <td>
                                        <div className="exchange-employee-name">
                                            {req.employee?.firstName} {req.employee?.lastName}
                                        </div>
                                        <div className="exchange-employee-id">
                                            {req.employee?.employeeId}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="exchange-cell-flex exchange-cell-danger">
                                            <Calendar size={14} /> 
                                            <span>ID: {req.originalHolidayId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="exchange-cell-flex exchange-cell-success">
                                            <Clock size={14} /> 
                                            <span>{new Date(req.exchangeDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="exchange-cell-muted">
                                            {req.reason}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`exchange-status-badge exchange-status-${req.status.toLowerCase()}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td>
                                            {req.status === "Pending" && (
                                                <div className="exchange-actions">
                                                    <button 
                                                        className="exchange-action-btn exchange-action-approve"
                                                        onClick={() => handleStatusUpdate(req.id, "Approved")}
                                                        title="Approve request"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button 
                                                        className="exchange-action-btn exchange-action-reject"
                                                        onClick={() => handleStatusUpdate(req.id, "Rejected")}
                                                        title="Reject request"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Exchange Request Modal */}
            {showAdd && (
                <div className="exchange-modal-overlay">
                    <div className="exchange-modal">
                        <h3>New Holiday Exchange Request</h3>
                        <form className="exchange-modal-form" onSubmit={handleCreate}>
                            <div className="exchange-form-field">
                                <label className="exchange-form-label">Holiday to Exchange</label>
                                <select 
                                    className="exchange-form-select" 
                                    value={form.originalHolidayId} 
                                    onChange={e => setForm({...form, originalHolidayId: e.target.value})} 
                                    required
                                >
                                    <option value="">Select a holiday</option>
                                    {holidays.map((h: any) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name} ({new Date(h.date).toLocaleDateString()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="exchange-form-field">
                                <label className="exchange-form-label">Requested Work Date</label>
                                <input 
                                    className="exchange-form-input" 
                                    type="date" 
                                    value={form.exchangeDate} 
                                    onChange={e => setForm({...form, exchangeDate: e.target.value})} 
                                    required 
                                />
                                <small style={{fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block'}}>
                                    The date you want to work instead of the holiday
                                </small>
                            </div>
                            <div className="exchange-form-field">
                                <label className="exchange-form-label">Reason</label>
                                <textarea 
                                    className="exchange-form-input exchange-form-textarea"
                                    value={form.reason} 
                                    onChange={e => setForm({...form, reason: e.target.value})} 
                                    placeholder="Why do you need this exchange?"
                                    required 
                                />
                            </div>
                            <div className="exchange-form-actions">
                                <button type="submit" className="exchange-form-submit">Submit Request</button>
                                <button type="button" className="exchange-form-cancel" onClick={() => setShowAdd(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HolidayExchangeRequests;
