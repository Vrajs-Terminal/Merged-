import React, { useState, useEffect } from "react";
import axios from "axios";
import { Banknote, Plus, Check, X } from "lucide-react";
import API_BASE from "../api";

export default function ManageExpenseAdvance() {
    const [advances, setAdvances] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeeId: "", requestedAmount: "", reason: "" });

    useEffect(() => { loadData(); }, []);
    const loadData = async () => {
        try {
            const [aRes, eRes] = await Promise.all([
                axios.get(`${API_BASE}/expense-advances`),
                axios.get(`${API_BASE}/employees`)
            ]);
            setAdvances(Array.isArray(aRes.data) ? aRes.data : []);
            setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/expense-advances`, form);
            setShowForm(false);
            setForm({ employeeId: "", requestedAmount: "", reason: "" });
            loadData();
        } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const approve = async (id: number) => {
        try { await axios.put(`${API_BASE}/expense-advances/${id}/approve`, { approvedBy: 1 }); loadData(); }
        catch (e: any) { alert(e.response?.data?.error); }
    };

    const reject = async (id: number) => {
        const remark = prompt("Rejection reason:");
        try { await axios.put(`${API_BASE}/expense-advances/${id}/reject`, { adminRemark: remark }); loadData(); }
        catch (e: any) { alert(e.response?.data?.error); }
    };

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Banknote size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Manage Expense Advances</h2>
                    </div>
                    <p className="page-subtitle">Track advance amounts given to employees before expense submission.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Add Advance</button>
            </div>

            {showForm && (
                <div className="glass-card" style={{ maxWidth: '600px', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>New Expense Advance</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label className="input-label">Employee *</label>
                            <select className="select-modern" required value={form.employeeId} onChange={e => setForm({...form, employeeId: e.target.value})}>
                                <option value="">Select Employee</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Requested Amount (₹) *</label>
                            <input type="number" className="input-modern" required value={form.requestedAmount} onChange={e => setForm({...form, requestedAmount: e.target.value})} />
                        </div>
                        <div>
                            <label className="input-label">Reason</label>
                            <input className="input-modern" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} placeholder="Purpose of advance..." />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Submit Request</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Requested</th><th>Used</th><th>Remaining</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {advances.map((a, i) => (
                            <tr key={a.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{a.employee?.firstName} {a.employee?.lastName}</td>
                                <td style={{ fontWeight: 700 }}>₹{a.requestedAmount}</td>
                                <td style={{ color: 'var(--danger)' }}>₹{a.usedAmount}</td>
                                <td style={{ color: 'var(--success)' }}>₹{a.remainingAmount}</td>
                                <td>
                                    <span className={`badge badge-${a.status === 'Approved' ? 'success' : a.status === 'Rejected' ? 'danger' : 'warning'}`}>{a.status}</span>
                                </td>
                                <td>
                                    {a.status === 'Pending' && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'unset' }} onClick={() => approve(a.id)}><Check size={13} /></button>
                                            <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'unset' }} onClick={() => reject(a.id)}><X size={13} /></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {advances.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No expense advances found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
