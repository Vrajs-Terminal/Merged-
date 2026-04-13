import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import "./leaveRequest.css";

function LeaveRequest() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [activeEmployeeId, setActiveEmployeeId] = useState<string>("");

    const [balances, setBalances] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        days: 1,
        reason: ""
    });

    useEffect(() => {
        const bootstrap = async () => {
            const userRaw = localStorage.getItem("user");
            const currentUser = userRaw ? JSON.parse(userRaw) : null;

            if (currentUser?.id) {
                setActiveEmployeeId(String(currentUser.id));
            }

            const res = await axios.get(`${API_BASE}/employees`);
            const activeEmployees = Array.isArray(res.data) ? res.data.filter((e: any) => e.status === "Active") : [];
            setEmployees(activeEmployees);

            if (!currentUser?.id && activeEmployees.length > 0) {
                setActiveEmployeeId(activeEmployees[0].id.toString());
            }
        };

        bootstrap();
    }, []);

    useEffect(() => {
        if (activeEmployeeId) fetchData(activeEmployeeId);
    }, [activeEmployeeId]);

    const fetchData = async (empId: string) => {
        setLoading(true);
        try {
            const balRes = await axios.get(`${API_BASE}/leaves/balances/${empId}`);
            setBalances(balRes.data);

            // fetch own history (filtering from all requests for now)
            const reqRes = await axios.get(`${API_BASE}/leaves/requests`);
            const myRequests = reqRes.data.filter((r: any) => r.employeeId === parseInt(empId));
            setHistory(myRequests);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/leaves/request`, {
                employeeId: activeEmployeeId,
                ...formData
            });
            alert("Leave Request Submitted Successfully");
            fetchData(activeEmployeeId); // refresh balances to lock pending
            setFormData({ leaveTypeId: "", startDate: "", endDate: "", days: 1, reason: "" });
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to submit request");
        }
    };

    return (
        <div className="leave-container lreq-legacy-page">
            <div className="leave-header">
                <h2>My Leave Requests</h2>
                {employees.length > 1 && !localStorage.getItem("user") && (
                    <select
                        value={activeEmployeeId}
                        onChange={e => setActiveEmployeeId(e.target.value)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                        {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                    </select>
                )}
            </div>

            {loading ? <p>Loading data...</p> : (
                <>
                    <div className="balances-grid">
                        {balances.map(b => (
                            <div className="balance-card" key={b.id}>
                                <h4>{b.leaveType.name}</h4>
                                <div className="balance-number">{b.total - b.used - b.pending}</div>
                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    Total: {b.total} | Used: {b.used} | Pending: {b.pending}
                                </div>
                            </div>
                        ))}
                        {balances.length === 0 && <p style={{ gridColumn: '1 / -1' }}>No leave balances initialized.</p>}
                    </div>

                    <div className="leave-split">
                        <div className="form-panel">
                            <h3 style={{ marginBottom: '20px' }}>Apply for Leave</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Leave Type</label>
                                    <select
                                        required
                                        value={formData.leaveTypeId}
                                        onChange={e => setFormData({ ...formData, leaveTypeId: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        {balances.map(b => <option key={b.leaveType.id} value={b.leaveType.id}>{b.leaveType.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Start Date</label>
                                        <input required type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>End Date</label>
                                        <input required type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Duration (Days)</label>
                                    <input required type="number" step="0.5" min="0.5" value={formData.days} onChange={e => setFormData({ ...formData, days: parseFloat(e.target.value) })} />
                                </div>
                                <div className="form-group">
                                    <label>Reason</label>
                                    <textarea required rows={3} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}></textarea>
                                </div>
                                <button type="submit" className="btn-primary">Submit Request</button>
                            </form>
                        </div>

                        <div className="history-panel">
                            <h3 style={{ marginBottom: '20px' }}>Leave History</h3>
                            <div className="history-list">
                                {history.map(h => (
                                    <div className="history-item" key={h.id}>
                                        <div>
                                            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{h.leaveType.name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()} ({h.days} days)
                                            </div>
                                        </div>
                                        <div className={`h-status ${h.status}`}>{h.status}</div>
                                    </div>
                                ))}
                                {history.length === 0 && <p>No history found.</p>}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default LeaveRequest;
