import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart3, CheckCircle, Clock3, BadgeCheck, TrendingUp, Users } from "lucide-react";
import API_BASE from "../api";

function ReportTable({ title, icon, entries, cols }: any) {
    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {icon}
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>{title}</h2>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginTop: '16px' }}>
                <table className="table-modern">
                    <thead><tr>{cols.map((c: string) => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>
                        {entries.length === 0 && <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No data available.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function PaidExpenseHistoryReport() {
    const [entries, setEntries] = useState<any[]>([]);
    useEffect(() => { axios.get(`${API_BASE}/expense-entries?status=Paid`).then(r => setEntries(Array.isArray(r.data) ? r.data : [])).catch(console.error); }, []);

    const byMonth: Record<string, any> = {};
    entries.forEach(e => {
        const key = e.paidAt ? new Date(e.paidAt).toISOString().substring(0, 7) : 'Unknown';
        if (!byMonth[key]) byMonth[key] = { month: key, count: 0, total: 0 };
        byMonth[key].count++;
        byMonth[key].total += e.amount;
    });

    return (
        <div className="animate-fade-in" style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle size={22} strokeWidth={2.25} style={{ color: 'var(--success)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Paid Expense History Report</h2>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Total Paid</th><th>Month</th><th>Payment Mode</th></tr></thead>
                    <tbody>
                        {entries.map((e, i) => (
                            <tr key={e.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{e.amount}</td>
                                <td>{e.paidAt ? new Date(e.paidAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '-'}</td>
                                <td>{e.paymentMode || '-'}</td>
                            </tr>
                        ))}
                        {entries.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No paid records.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function EmployeeExpenseReport() {
    const [entries, setEntries] = useState<any[]>([]);
    const [empFilter, setEmpFilter] = useState("");
    useEffect(() => { axios.get(`${API_BASE}/expense-entries`).then(r => setEntries(Array.isArray(r.data) ? r.data : [])).catch(console.error); }, []);

    const filtered = entries.filter(e => empFilter === "" || String(e.employeeId) === empFilter || (`${e.employee?.firstName} ${e.employee?.lastName}`).toLowerCase().includes(empFilter.toLowerCase()));
    const uniqueEmps = [...new Map(entries.map(e => [e.employeeId, e.employee])).entries()];

    return (
        <div className="animate-fade-in" style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Employee Expense Report</h2>
                </div>
                <select className="select-modern" style={{ width: '220px' }} value={empFilter} onChange={e => setEmpFilter(e.target.value)}>
                    <option value="">All Employees</option>
                    {uniqueEmps.map(([id, emp]) => <option key={id} value={id}>{emp?.firstName} {emp?.lastName}</option>)}
                </select>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead>
                    <tbody>
                        {filtered.map((e, i) => (
                            <tr key={e.id}>
                                <td>{new Date(e.expenseDate).toLocaleDateString()}</td>
                                <td>{e.expenseType}</td>
                                <td style={{ fontWeight: 700 }}>₹{e.amount}</td>
                                <td><span className={`badge badge-${e.status === 'Paid' ? 'success' : e.status === 'Approved' ? 'primary' : e.status === 'Rejected' ? 'danger' : 'warning'}`}>{e.status}</span></td>
                                <td>{e.description || '-'}</td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No expenses found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function UnpaidExpenseReport() {
    const [entries, setEntries] = useState<any[]>([]);
    useEffect(() => { axios.get(`${API_BASE}/expense-entries?status=Approved`).then(r => setEntries(Array.isArray(r.data) ? r.data : [])).catch(console.error); }, []);
    return (
        <div className="animate-fade-in" style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Clock3 size={22} strokeWidth={2.25} style={{ color: 'var(--warning)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Unpaid Expense Report</h2>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Employee</th><th>Amount</th><th>Approved Date</th><th>Pending Since (Days)</th></tr></thead>
                    <tbody>
                        {entries.map((e, i) => {
                            const pendingDays = e.approvedAt ? Math.floor((Date.now() - new Date(e.approvedAt).getTime()) / 86400000) : 0;
                            return (
                                <tr key={e.id}>
                                    <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{e.amount}</td>
                                    <td>{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '-'}</td>
                                    <td style={{ color: pendingDays > 7 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: pendingDays > 7 ? 700 : 400 }}>{pendingDays} days</td>
                                </tr>
                            );
                        })}
                        {entries.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No unpaid expenses.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function ApprovedExpenseReport() {
    const [entries, setEntries] = useState<any[]>([]);
    useEffect(() => { axios.get(`${API_BASE}/expense-entries?status=Approved`).then(r => setEntries(Array.isArray(r.data) ? r.data : [])).catch(console.error); }, []);
    return (
        <div className="animate-fade-in" style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BadgeCheck size={22} strokeWidth={2.25} style={{ color: 'var(--success)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Approved Expense Report</h2>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Employee</th><th>Approved Amount</th><th>Approved Date</th><th>Type</th></tr></thead>
                    <tbody>
                        {entries.map(e => (
                            <tr key={e.id}>
                                <td style={{ fontWeight: 500 }}>{e.employee?.firstName} {e.employee?.lastName}</td>
                                <td style={{ fontWeight: 700, color: 'var(--success)' }}>₹{e.amount}</td>
                                <td>{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '-'}</td>
                                <td>{e.expenseType}</td>
                            </tr>
                        ))}
                        {entries.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No approved expenses.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function AdvanceExpenseReport() {
    const [advances, setAdvances] = useState<any[]>([]);
    useEffect(() => { axios.get(`${API_BASE}/expense-advances`).then(r => setAdvances(Array.isArray(r.data) ? r.data : [])).catch(console.error); }, []);
    return (
        <div className="animate-fade-in" style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <TrendingUp size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Advance Expense Report</h2>
            </div>
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>Employee</th><th>Advance Taken</th><th>Used</th><th>Remaining</th><th>Status</th></tr></thead>
                    <tbody>
                        {advances.map(a => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 500 }}>{a.employee?.firstName} {a.employee?.lastName}</td>
                                <td style={{ fontWeight: 700 }}>₹{a.requestedAmount}</td>
                                <td style={{ color: 'var(--danger)' }}>₹{a.usedAmount}</td>
                                <td style={{ color: 'var(--success)' }}>₹{a.remainingAmount}</td>
                                <td><span className={`badge badge-${a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'danger' : 'warning'}`}>{a.status}</span></td>
                            </tr>
                        ))}
                        {advances.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No advance data.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PaidExpenseHistoryReport;
