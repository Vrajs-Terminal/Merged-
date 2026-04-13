import React, { useState, useEffect } from "react";
import axios from "axios";
import { LayoutGrid } from "lucide-react";
import API_BASE from "../api";

export default function GroupWiseExpense() {
    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries/analytics/group-wise`);
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const totalAll = groups.reduce((s, g) => s + g.total, 0);

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <LayoutGrid size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Group Wise Expense</h2>
            </div>
            <p className="page-subtitle">Department-level expense tracking and budget monitoring.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {[{ label: 'Total Expense', value: totalAll, color: 'var(--primary)' },
                  { label: 'Approved', value: groups.reduce((s, g) => s + g.approved, 0), color: 'var(--success)' },
                  { label: 'Pending', value: groups.reduce((s, g) => s + g.pending, 0), color: 'var(--warning)' },
                  { label: 'Paid', value: groups.reduce((s, g) => s + g.paid, 0), color: 'var(--info)' }
                ].map(stat => (
                    <div key={stat.label} className="glass-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>{stat.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 700, color: stat.color }}>₹{(stat.value || 0).toLocaleString()}</div>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Department</th><th>Total Expense</th><th>Approved</th><th>Pending</th><th>Paid</th></tr></thead>
                    <tbody>
                        {groups.map((g, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{g.group}</td>
                                <td style={{ fontWeight: 700 }}>₹{g.total.toLocaleString()}</td>
                                <td style={{ color: 'var(--success)' }}>₹{g.approved.toLocaleString()}</td>
                                <td style={{ color: 'var(--warning)' }}>₹{g.pending.toLocaleString()}</td>
                                <td style={{ color: 'var(--info, var(--primary))' }}>₹{g.paid.toLocaleString()}</td>
                            </tr>
                        ))}
                        {groups.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No group data available.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
