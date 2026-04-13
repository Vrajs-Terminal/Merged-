import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Users, Search, Trash2, LayoutTemplate } from "lucide-react";
import API_BASE from "../api";

export default function ManageExpenseTemplate() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [view, setView] = useState<"list" | "create" | "assign">("list");
    const [search, setSearch] = useState("");

    const defaultExpenseTypes = [
        { type: "Travel", dailyLimit: "", monthlyLimit: "", perClaimLimit: "", approvalRequired: true, autoApprovalLimit: "", attachmentRequired: false, billRequired: false, allowMultiplePerDay: true, restrictWithoutVisit: false, linkWith: "Visit" },
        { type: "Food", dailyLimit: "", monthlyLimit: "", perClaimLimit: "", approvalRequired: true, autoApprovalLimit: "500", attachmentRequired: false, billRequired: false, allowMultiplePerDay: true, restrictWithoutVisit: false, linkWith: "General" },
        { type: "Stay", dailyLimit: "", monthlyLimit: "", perClaimLimit: "", approvalRequired: true, autoApprovalLimit: "", attachmentRequired: true, billRequired: true, allowMultiplePerDay: false, restrictWithoutVisit: false, linkWith: "General" },
        { type: "Misc", dailyLimit: "", monthlyLimit: "", perClaimLimit: "", approvalRequired: true, autoApprovalLimit: "", attachmentRequired: false, billRequired: false, allowMultiplePerDay: true, restrictWithoutVisit: false, linkWith: "General" },
    ];

    const [form, setForm] = useState({ templateName: "", description: "", expenseTypes: defaultExpenseTypes });
    const [assignForm, setAssignForm] = useState({ templateId: "", selectedEmployees: [] as number[], department: "", branch: "" });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [tRes, aRes, eRes] = await Promise.all([
                axios.get(`${API_BASE}/expense-templates`),
                axios.get(`${API_BASE}/expense-templates/assignments`),
                axios.get(`${API_BASE}/employees`)
            ]);
            setTemplates(Array.isArray(tRes.data) ? tRes.data : []);
            setAssignments(Array.isArray(aRes.data) ? aRes.data : []);
            setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/expense-templates`, form);
            setView("list"); loadData();
        } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE}/expense-templates/assign`, { ...assignForm, employeeIds: assignForm.selectedEmployees });
            setView("list"); loadData();
        } catch (e: any) { alert(e.response?.data?.error || "Error"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this template?")) return;
        try { await axios.delete(`${API_BASE}/expense-templates/${id}`); loadData(); } catch (e: any) { alert(e.response?.data?.error); }
    };

    const filtered = assignments.filter(a =>
        (a.employee?.firstName || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.template?.templateName || "").toLowerCase().includes(search.toLowerCase())
    );

    if (view === "create") return (
        <div style={{ padding: '24px 32px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '8px' }}>Create Expense Template</h2>
            <form onSubmit={handleCreate}>
                <div className="glass-card" style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label className="input-label">Template Name *</label>
                            <input className="input-modern" value={form.templateName} onChange={e => setForm({...form, templateName: e.target.value})} required />
                        </div>
                        <div>
                            <label className="input-label">Description</label>
                            <input className="input-modern" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                        </div>
                    </div>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Expense Type Configuration</h3>
                {form.expenseTypes.map((et, i) => (
                    <div key={i} className="glass-card" style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--primary)' }}>{et.type}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '12px' }}>
                            {[["dailyLimit", "Daily Limit (₹)"], ["monthlyLimit", "Monthly Limit (₹)"], ["perClaimLimit", "Per Claim Limit (₹)"], ["autoApprovalLimit", "Auto Approve Below (₹)"]].map(([key, label]) => (
                                <div key={key}>
                                    <label className="input-label" style={{ fontSize: '11px' }}>{label}</label>
                                    <input type="number" className="input-modern" value={(et as any)[key]} onChange={e => { const copy = [...form.expenseTypes]; (copy[i] as any)[key] = e.target.value; setForm({...form, expenseTypes: copy}); }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '12px', fontSize: '12px' }}>
                            {[["approvalRequired", "Approval Required"], ["attachmentRequired", "Attachment Required"], ["billRequired", "Bill Mandatory"], ["allowMultiplePerDay", "Allow Multiple/Day"], ["restrictWithoutVisit", "Restrict Without Visit"]].map(([key, label]) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={(et as any)[key]} onChange={e => { const copy = [...form.expenseTypes]; (copy[i] as any)[key] = e.target.checked; setForm({...form, expenseTypes: copy}); }} />
                                    {label}
                                </label>
                            ))}
                            <div>
                                <label className="input-label" style={{ fontSize: '11px' }}>Link With</label>
                                <select className="select-modern" style={{ fontSize: '12px', padding: '4px 8px' }} value={et.linkWith} onChange={e => { const copy = [...form.expenseTypes]; copy[i].linkWith = e.target.value; setForm({...form, expenseTypes: copy}); }}>
                                    <option value="General">General</option><option value="Visit">Visit</option><option value="Order">Order</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setView("list")}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Template</button>
                </div>
            </form>
        </div>
    );

    if (view === "assign") return (
        <div style={{ padding: '24px 32px' }}>
            <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '20px' }}>Assign Template to Employees</h2>
            <div className="glass-card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleAssign} style={{ display: 'grid', gap: '16px' }}>
                    <div>
                        <label className="input-label">Template *</label>
                        <select className="select-modern" required value={assignForm.templateId} onChange={e => setAssignForm({...assignForm, templateId: e.target.value})}>
                            <option value="">Select Template</option>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.templateName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="input-label">Select Employees (hold Ctrl to multi-select)</label>
                        <select multiple className="select-modern" style={{ height: '180px' }} onChange={e => setAssignForm({...assignForm, selectedEmployees: Array.from(e.target.selectedOptions, o => Number(o.value))})}>
                            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                            <label className="input-label">Or Assign to Entire Department</label>
                            <input className="input-modern" placeholder="e.g. Sales" value={assignForm.department} onChange={e => setAssignForm({...assignForm, department: e.target.value})} />
                        </div>
                        <div>
                            <label className="input-label">Or Assign to Entire Branch</label>
                            <input className="input-modern" placeholder="e.g. Mumbai HQ" value={assignForm.branch} onChange={e => setAssignForm({...assignForm, branch: e.target.value})} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setView("list")}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Assign Template</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LayoutTemplate size={22} style={{ color: 'var(--primary)' }} />
                        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Manage Expense Templates</h2>
                    </div>
                    <p className="page-subtitle">Assign structured expense policies to employees.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={() => setView("assign")}><Users size={16} /> Assign Template</button>
                    <button className="btn btn-primary" onClick={() => setView("create")}><Plus size={16} /> Create Template</button>
                </div>
            </div>

            {/* Templates summary row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {templates.map(t => (
                    <div key={t.id} className="glass-card" style={{ minWidth: '200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.templateName}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(t.expenseTypes as any[])?.length || 0} expense types</div>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '12px', minHeight: 'unset' }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                    </div>
                ))}
                {templates.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '8px' }}>No templates yet.</div>}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search assignments..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table-modern">
                    <thead><tr><th>#</th><th>Employee</th><th>Branch</th><th>Department</th><th>Template Name</th><th>Status</th><th>Action</th></tr></thead>
                    <tbody>
                        {filtered.map((a, i) => (
                            <tr key={a.id}>
                                <td>{i + 1}</td>
                                <td style={{ fontWeight: 500 }}>{a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : (a.department ? `Dept: ${a.department}` : `Branch: ${a.branch}`)}</td>
                                <td>{a.branch || a.employee?.branch || "-"}</td>
                                <td>{a.department || a.employee?.department || "-"}</td>
                                <td>{a.template?.templateName}</td>
                                <td><span className="badge badge-success">{a.status}</span></td>
                                <td>
                                    <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: '12px', minHeight: 'unset' }} onClick={async () => { await axios.delete(`${API_BASE}/expense-templates/assignments/${a.id}`); loadData(); }}>Remove</button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No assignments found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
