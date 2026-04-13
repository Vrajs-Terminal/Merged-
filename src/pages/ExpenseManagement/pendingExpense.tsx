import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Check, X, Search } from "lucide-react";
import API_BASE from "../api";

export default function PendingExpense() {
    const [entries, setEntries] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [viewing, setViewing] = useState<any>(null);

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries?status=Pending`);
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const approve = async (id: number) => {
        try { await axios.put(`${API_BASE}/expense-entries/${id}/approve`, { approvedBy: 1 }); load(); } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };
    const reject = async (id: number) => {
        const note = prompt("Rejection reason (optional):");
        try { await axios.put(`${API_BASE}/expense-entries/${id}/reject`, { rejectedBy: 1, rejectionNote: note }); load(); } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const filtered = entries.filter(e =>
        (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(search.toLowerCase()) ||
        (e.expenseType || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={22} strokeWidth={2.25} style={{ color: 'var(--warning)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Pending Expenses</h2>
                    </div>
                    <p className="page-subtitle">Review and approve submitted expense claims.</p>
                </div>
                <div style={{ padding: '8px 16px', background: 'rgba(255,170,0,0.15)', borderRadius: '8px', fontWeight: 600, color: 'var(--warning)' }}>
                    {filtered.length} Pending
                </div>
            </div>

            <div style={{ position: 'relative', width: '300px', marginBottom: '16px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Date</th><th>Type</th><th>Amount</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                                <td>{e.expenseType}</td>
                                <td style={{ fontWeight: 600 }}>₹{e.amount}</td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '-'}</td>
                                <td><span className="badge badge-warning">Pending</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'unset' }} onClick={() => approve(e.id)}><Check size={13} /> Approve</button>
                                        <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'unset' }} onClick={() => reject(e.id)}><X size={13} /> Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No pending expenses.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
