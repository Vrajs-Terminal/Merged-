import { useState, useEffect } from "react";
import axios from "axios";
import "./leaveBalance.css";
import { Wallet, Search, Plus, Minus, RefreshCcw, CheckCircle, AlertCircle, Download } from "lucide-react";

import API_BASE from "../api";
const API = `${API_BASE}/leaves`;

export default function LeaveBalance() {
    const [balances, setBalances] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [_employees, setEmployees] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState<any>(null);
    const [adjustModal, setAdjustModal] = useState<any>(null);
    const [adjustForm, setAdjustForm] = useState({ type: "add", leaveTypeId: "", adjustment: "1" });
    const year = new Date().getFullYear();

    const load = async () => {
        setLoading(true);
        try {
            const [br, tr] = await Promise.all([
                axios.get(`${API}/balances?year=${year}`),
                axios.get(`${API}/types`)
            ]);
            setBalances(br.data); setTypes(tr.data);
            const empMap: any = {};
            br.data.forEach((b: any) => { if (b.employee) empMap[b.employeeId] = b.employee; });
            setEmployees(Object.values(empMap));
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    // Group by employee
    const grouped: any = {};
    balances.forEach(b => {
        if (!grouped[b.employeeId]) grouped[b.employeeId] = { emp: b.employee, items: [] };
        grouped[b.employeeId].items.push(b);
    });

    const filtered = Object.values(grouped).filter((g: any) => {
        const name = `${g.emp?.firstName} ${g.emp?.lastName}`.toLowerCase();
        return name.includes(search.toLowerCase()) || g.emp?.employeeId?.toLowerCase().includes(search.toLowerCase());
    });

    const handleAdjust = async () => {
        if (!adjustModal || !adjustForm.leaveTypeId) return;
        try {
            await axios.post(`${API}/balances/adjust`, {
                employeeId: adjustModal.employeeId, leaveTypeId: adjustForm.leaveTypeId,
                year, type: adjustForm.type, adjustment: adjustForm.adjustment
            });
            setMsg({ type: "success", text: "Balance adjusted successfully!" });
            setAdjustModal(null); load();
        } catch (err: any) {
            setMsg({ type: "error", text: err?.response?.data?.error || "Failed." });
        }
    };

    const handleInitAll = async () => {
        if (!window.confirm(`Initialize leave balances for all active employees for ${year}?`)) return;
        try {
            const r = await axios.post(`${API}/balances/init`, { year });
            setMsg({ type: "success", text: r.data.message }); load();
        } catch (err: any) { setMsg({ type: "error", text: err?.response?.data?.error || "Failed." }); }
    };

    const exportCSV = () => {
        const rows = [["Employee", "EmpID", ...types.map(t => t.leaveCode || t.name), "Total Used"]];
        filtered.forEach((g: any) => {
            const row = [`${g.emp?.firstName} ${g.emp?.lastName}`, g.emp?.employeeId || ""];
            let totalUsed = 0;
            types.forEach(t => {
                const b = g.items.find((i: any) => i.leaveTypeId === t.id);
                row.push(b ? `${b.total - b.used - b.pending}/${b.total}` : "0/0");
                if (b) totalUsed += b.used;
            });
            row.push(String(totalUsed));
            rows.push(row);
        });
        const csv = rows.map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `leave_balance_${year}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="lm-container lm-fade lb-page">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title"><Wallet size={22} /> Leave Balance</h2>
                    <p className="lm-page-subtitle">Employee-wise leave balance overview for {year}</p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="lm-btn-secondary" onClick={handleInitAll}><RefreshCcw size={14} /> Init All Balances</button>
                    <button className="lm-btn-secondary" onClick={exportCSV}><Download size={14} /> Export CSV</button>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            <div className="lm-filter-row">
                <div className="lm-search-bar">
                    <Search size={15} color="#94a3b8" />
                    <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="lm-card">
                {loading ? <div className="lm-loading">Loading balances...</div> : (
                    <div className="lm-table-wrap">
                        <table className="lm-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    {types.map(t => <th key={t.id}>{t.leaveCode || t.name}</th>)}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0
                                    ? <tr><td colSpan={types.length + 2} className="lm-empty">No balance records found. Click "Init All Balances" to create records.</td></tr>
                                    : filtered.map((g: any) => (
                                        <tr key={g.emp?.id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: "#1e293b" }}>{g.emp?.firstName} {g.emp?.lastName}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{g.emp?.employeeId} · {g.emp?.department || "—"}</div>
                                            </td>
                                            {types.map(t => {
                                                const b = g.items.find((i: any) => i.leaveTypeId === t.id);
                                                const avail = b ? b.total - b.used - b.pending : 0;
                                                const pct = b && b.total > 0 ? Math.min(100, (avail / b.total) * 100) : 0;
                                                return (
                                                    <td key={t.id}>
                                                        {b ? (
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{avail}<span style={{ color: "#94a3b8", fontWeight: 400 }}>/{b.total}</span></div>
                                                                <div className="lm-balance-bar-wrap"><div className="lm-balance-bar" style={{ width: `${pct}%` }} /></div>
                                                            </div>
                                                        ) : <span style={{ color: "#94a3b8" }}>—</span>}
                                                    </td>
                                                );
                                            })}
                                            <td>
                                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                                    <button className="lm-btn-success" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                                                        onClick={() => { setAdjustModal({ employeeId: g.emp?.id, name: `${g.emp?.firstName} ${g.emp?.lastName}` }); setAdjustForm({ type: "add", leaveTypeId: types[0]?.id?.toString() || "", adjustment: "1" }); }}>
                                                        <Plus size={12} /> Add
                                                    </button>
                                                    <button className="lm-btn-danger" style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                                                        onClick={() => { setAdjustModal({ employeeId: g.emp?.id, name: `${g.emp?.firstName} ${g.emp?.lastName}` }); setAdjustForm({ type: "deduct", leaveTypeId: types[0]?.id?.toString() || "", adjustment: "1" }); }}>
                                                        <Minus size={12} /> Deduct
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Adjust Modal */}
            {adjustModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div className="lm-card" style={{ width: 380, margin: 0 }}>
                        <div className="lm-card-title">Adjust Balance — {adjustModal.name}</div>
                        <div className="lm-field">
                            <label className="lm-label">Action</label>
                            <select className="lm-select" value={adjustForm.type} onChange={e => setAdjustForm(p => ({ ...p, type: e.target.value }))}>
                                <option value="add">Add Days</option>
                                <option value="deduct">Deduct Days</option>
                                <option value="reset">Reset (clear used & pending)</option>
                            </select>
                        </div>
                        <div className="lm-field">
                            <label className="lm-label">Leave Type</label>
                            <select className="lm-select" value={adjustForm.leaveTypeId} onChange={e => setAdjustForm(p => ({ ...p, leaveTypeId: e.target.value }))}>
                                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        {adjustForm.type !== "reset" && (
                            <div className="lm-field">
                                <label className="lm-label">Days</label>
                                <input className="lm-input" type="number" min={0.5} step={0.5} value={adjustForm.adjustment}
                                    onChange={e => setAdjustForm(p => ({ ...p, adjustment: e.target.value }))} />
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button className="lm-btn-primary" onClick={handleAdjust}>Confirm</button>
                            <button className="lm-btn-secondary" onClick={() => setAdjustModal(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
