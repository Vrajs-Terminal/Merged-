import React, { useState, useEffect } from "react";
import axios from "axios";
import { Wallet, IndianRupee, Search } from "lucide-react";
import API_BASE from "../api";

export default function UnpaidExpense() {
    const [entries, setEntries] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries?status=Approved`);
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const markPaid = async (id: number) => {
        const mode = prompt("Payment mode? (Cash / Bank / UPI)") || "Cash";
        try { await axios.put(`${API_BASE}/expense-entries/${id}/pay`, { paidBy: 1, paymentMode: mode }); load(); }
        catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const total = entries.reduce((s, e) => s + e.amount, 0);
    const filtered = entries.filter(e => (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wallet size={22} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Unpaid Expenses</h2>
                    </div>
                    <p className="page-subtitle">Approved expenses pending payment disbursement.</p>
                </div>
                <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-light)', textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Pending Payment</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--danger)' }}>₹{total.toLocaleString()}</div>
                </div>
            </div>

            <div style={{ position: 'relative', width: '300px', marginBottom: '16px' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Dept</th><th>Type</th><th>Amount</th><th>Approved Date</th><th>Payment Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td>{e.employee?.department || '-'}</td>
                                <td>{e.expenseType}</td>
                                <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{e.amount}</td>
                                <td>{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '-'}</td>
                                <td><span className="badge badge-warning">Unpaid</span></td>
                                <td>
                                    <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '12px', minHeight: 'unset' }} onClick={() => markPaid(e.id)}><IndianRupee size={13} /> Mark Paid</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No unpaid expenses.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
