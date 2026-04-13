import React, { useState, useEffect } from "react";
import axios from "axios";
import { XCircle, Search } from "lucide-react";
import API_BASE from "../api";

export default function RejectedExpense() {
    const [entries, setEntries] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries?status=Rejected`);
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const filtered = entries.filter(e => (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <XCircle size={22} strokeWidth={2.25} style={{ color: 'var(--danger)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Rejected Expenses</h2>
            </div>
            <p className="page-subtitle">All rejected expense claims with reasons for transparency.</p>

            <div style={{ position: 'relative', width: '300px', margin: '16px 0' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Type</th><th>Amount</th><th>Date</th><th>Rejection Reason</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td>{e.expenseType}</td>
                                <td>₹{e.amount}</td>
                                <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                                <td style={{ color: 'var(--danger)' }}>{e.rejectionNote || '-'}</td>
                                <td><span className="badge badge-danger">Rejected</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No rejected expenses.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
