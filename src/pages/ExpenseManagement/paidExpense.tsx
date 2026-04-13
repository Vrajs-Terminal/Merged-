import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Search } from "lucide-react";
import API_BASE from "../api";

export default function PaidExpense() {
    const [entries, setEntries] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries?status=Paid`);
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const total = entries.reduce((s, e) => s + e.amount, 0);
    const filtered = entries.filter(e => (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={22} strokeWidth={2.25} style={{ color: 'var(--success)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Paid Expenses</h2>
                    </div>
                    <p className="page-subtitle">Complete payment history of all reimbursed expenses.</p>
                </div>
                <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Paid</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success)' }}>₹{total.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ position: 'relative', width: '300px', marginBottom: '16px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Type</th><th>Amount</th><th>Paid Date</th><th>Payment Mode</th><th>Voucher No</th><th>Status</th></tr></thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td>{e.expenseType}</td>
                                <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{e.amount}</td>
                                <td>{e.paidAt ? new Date(e.paidAt).toLocaleDateString() : '-'}</td>
                                <td>{e.paymentMode || '-'}</td>
                                <td>{e.voucherNo || '-'}</td>
                                <td><span className="badge badge-success">Paid</span></td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No paid expenses found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
