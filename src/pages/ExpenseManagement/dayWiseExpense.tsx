import React, { useState, useEffect } from "react";
import axios from "axios";
import { CalendarDays } from "lucide-react";
import API_BASE from "../api";

export default function DayWiseExpense() {
    const [days, setDays] = useState<any[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-entries/analytics/day-wise`);
            setDays(Array.isArray(res.data) ? res.data : []);
        } catch (e) { console.error(e); }
    };

    const totalAmount = days.reduce((s, d) => s + d.total, 0);

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CalendarDays size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Day Wise Expense</h2>
                    </div>
                    <p className="page-subtitle">Daily expense summary for trend analysis and monitoring.</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'right', padding: '12px 20px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All Time Total</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Date</th><th>Total Expense</th><th>No. of Employees</th><th>Avg Per Employee</th></tr></thead>
                    <tbody>
                        {days.map((d, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                <td style={{ fontWeight: 700 }}>₹{d.total.toLocaleString()}</td>
                                <td>{d.employeeCount}</td>
                                <td style={{ color: 'var(--text-muted)' }}>₹{(d.employeeCount > 0 ? d.total / d.employeeCount : 0).toFixed(0)}</td>
                            </tr>
                        ))}
                        {days.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No daily data available.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
