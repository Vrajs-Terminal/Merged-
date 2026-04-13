import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Search, Banknote, Undo2, Check } from "lucide-react";
import API_BASE from "../api";

export default function AdvanceSalary() {
    const [advances, setAdvances] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showReturnAuth, setShowReturnAuth] = useState<any>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const initialForm = {
        employeeId: "",
        department: "",
        salaryMonth: "",
        givenDate: new Date().toISOString().substring(0, 10),
        amount: "",
        givenMode: "Bank",
        remark: ""
    };

    const [formData, setFormData] = useState(initialForm);
    const [returnForm, setReturnForm] = useState({ amount: "", returnDate: new Date().toISOString().substring(0, 10), remark: "", adjustedInPayroll: false });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [advRes, empRes] = await Promise.all([
                axios.get(`${API_BASE}/advance-salaries`),
                axios.get(`${API_BASE}/employees`)
            ]);
            setAdvances(Array.isArray(advRes.data) ? advRes.data : []);
            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
        } catch (e) {
            console.error("Failed to load advances", e);
            setAdvances([]);
            setEmployees([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/advance-salaries`, formData);
            setShowForm(false);
            setFormData(initialForm);
            loadData();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving advance");
        }
    };

    const handleReturnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/advance-salaries/${showReturnAuth.id}/return`, returnForm);
            setShowReturnAuth(null);
            setReturnForm({ amount: "", returnDate: new Date().toISOString().substring(0, 10), remark: "", adjustedInPayroll: false });
            loadData();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error processing return");
        }
    };

    const filteredAdvances = advances.filter(a => 
        (a.employee?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.salaryMonth.includes(searchTerm)
    );

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Banknote size={22} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Advance Salaries</h2>
                    </div>
                    <p className="page-subtitle">Track and manage emergency salary advances given to employees.</p>
                </div>
                {!showForm && !showReturnAuth && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={16} /> Add Advance
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Provide Advance Salary</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr' }}>
                        <div>
                            <label className="input-label">Employee *</label>
                            <select className="select-modern" value={formData.employeeId} onChange={e => {
                                const emp = employees.find(x => x.id === Number(e.target.value));
                                setFormData(prev => ({ ...prev, employeeId: e.target.value, department: emp?.department || "" }));
                            }} required>
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Department</label>
                            <input type="text" className="input-modern" value={formData.department} readOnly disabled style={{ background: 'var(--bg-app)' }} />
                        </div>
                        <div>
                            <label className="input-label">Salary Month *</label>
                            <input type="month" className="input-modern" value={formData.salaryMonth} onChange={e => setFormData({ ...formData, salaryMonth: e.target.value })} required />
                        </div>
                        <div>
                            <label className="input-label">Given Date *</label>
                            <input type="date" className="input-modern" value={formData.givenDate} onChange={e => setFormData({ ...formData, givenDate: e.target.value })} required />
                        </div>
                        <div>
                            <label className="input-label">Amount (₹) *</label>
                            <input type="number" className="input-modern" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                        </div>
                        <div>
                            <label className="input-label">Given Mode</label>
                            <select className="select-modern" value={formData.givenMode} onChange={e => setFormData({ ...formData, givenMode: e.target.value })}>
                                <option value="Cash">Cash</option>
                                <option value="Bank">Bank Transfer</option>
                                <option value="UPI">UPI</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="input-label">Remarks</label>
                            <input type="text" className="input-modern" value={formData.remark} onChange={e => setFormData({ ...formData, remark: e.target.value })} placeholder="Reason for advance..." />
                        </div>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary"><Check size={16} /> Save Advance</button>
                        </div>
                    </form>
                </div>
            ) : showReturnAuth ? (
                <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Register Advance Return</h3>
                    <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '20px' }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>Employee: <strong>{showReturnAuth.employee?.firstName} {showReturnAuth.employee?.lastName}</strong></p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: 'var(--danger)' }}>Remaining Balance: <strong>₹{showReturnAuth.remainingAmount}</strong></p>
                    </div>
                    <form onSubmit={handleReturnSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label className="input-label">Return Amount (₹) *</label>
                            <input type="number" className="input-modern" value={returnForm.amount} max={showReturnAuth.remainingAmount} onChange={e => setReturnForm({ ...returnForm, amount: e.target.value })} required />
                        </div>
                        <div>
                            <label className="input-label">Date of Return *</label>
                            <input type="date" className="input-modern" value={returnForm.returnDate} onChange={e => setReturnForm({ ...returnForm, returnDate: e.target.value })} required />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={returnForm.adjustedInPayroll} onChange={e => setReturnForm({ ...returnForm, adjustedInPayroll: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                            <span>This return was deducted natively via Payroll Runs</span>
                        </label>
                        <div>
                            <label className="input-label">Notes / Remarks</label>
                            <input type="text" className="input-modern" value={returnForm.remark} onChange={e => setReturnForm({ ...returnForm, remark: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowReturnAuth(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary"><Undo2 size={16} /> Process Return</button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', position: 'relative', width: '300px', marginBottom: '16px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input type="text" className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search employee..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="table-modern">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Salary Month</th>
                                    <th>Given Date</th>
                                    <th>Amount</th>
                                    <th>Remaining</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdvances.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 500 }}>{a.employee?.firstName} {a.employee?.lastName}</td>
                                        <td>{a.salaryMonth}</td>
                                        <td>{new Date(a.givenDate).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 600 }}>₹{a.amount}</td>
                                        <td style={{ fontWeight: 600, color: a.remainingAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                            ₹{a.remainingAmount}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${a.status === 'Paid' ? 'primary' : a.status === 'Returned' ? 'success' : 'warning'}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {a.remainingAmount > 0 && (
                                                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setShowReturnAuth(a)}>
                                                    Register Return
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredAdvances.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No advance salaries found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
