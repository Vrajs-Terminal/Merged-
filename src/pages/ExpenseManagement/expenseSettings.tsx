import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, Settings, Building2, CheckCircle2, XCircle, Search, LayoutList, Check } from "lucide-react";
import API_BASE from "../api";

export default function ExpenseSettings() {
    const [settings, setSettings] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [subDepartments, setSubDepartments] = useState<any[]>([]);
    
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);

    const initialForm = {
        branchId: "",
        departmentId: "",
        subDepartmentId: "",
        isExpenseEnabled: true,
        hideExpenseTitle: false,
        dayTypeOption: "Default",
        allowBackdate: false,
        maxBackdateDays: "",
        approvalRequired: true,
        autoApprove: false
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => {
        loadSettings();
        loadDropdownData();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-settings`);
            setSettings(Array.isArray(res.data) ? res.data : res.data?.settings || []);
        } catch (e) { console.error(e); }
    };

    const loadDropdownData = async () => {
        try {
            const [bRes, dRes, sdRes] = await Promise.all([
                axios.get(`${API_BASE}/branches`),
                axios.get(`${API_BASE}/departments`),
                axios.get(`${API_BASE}/sub-departments`)
            ]);
            setBranches(Array.isArray(bRes.data) ? bRes.data : bRes.data?.branches || []);
            setDepartments(Array.isArray(dRes.data) ? dRes.data : dRes.data?.departments || []);
            setSubDepartments(Array.isArray(sdRes.data) ? sdRes.data : sdRes.data?.subDepartments || []);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                branchId: formData.branchId ? Number(formData.branchId) : null,
                departmentId: formData.departmentId ? Number(formData.departmentId) : null,
                subDepartmentId: formData.subDepartmentId ? Number(formData.subDepartmentId) : null,
                maxBackdateDays: formData.maxBackdateDays ? Number(formData.maxBackdateDays) : null
            };

            if (editingId) {
                await axios.put(`${API_BASE}/expense-settings/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE}/expense-settings`, payload);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
            loadSettings();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving setting");
        }
    };

    const handleEdit = (s: any) => {
        setEditingId(s.id);
        setFormData({
            branchId: s.branchId?.toString() || "",
            departmentId: s.departmentId?.toString() || "",
            subDepartmentId: s.subDepartmentId?.toString() || "",
            isExpenseEnabled: s.isExpenseEnabled,
            hideExpenseTitle: s.hideExpenseTitle,
            dayTypeOption: s.dayTypeOption || "Default",
            allowBackdate: s.allowBackdate,
            maxBackdateDays: s.maxBackdateDays || "",
            approvalRequired: s.approvalRequired,
            autoApprove: s.autoApprove
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this setting?")) return;
        try {
            await axios.delete(`${API_BASE}/expense-settings/${id}`);
            loadSettings();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error deleting");
        }
    };

    const filteredSettings = useMemo(() => {
        return settings.filter(s => {
            const bName = (s.branch?.branchName || '').toLowerCase();
            const dName = (s.department?.departmentName || '').toLowerCase();
            const term = searchTerm.toLowerCase();
            return bName.includes(term) || dName.includes(term) || (term === 'global' && !s.branch && !s.department);
        }).slice(0, entriesPerPage);
    }, [settings, searchTerm, entriesPerPage]);

    // Analytics
    const activeEnabled = settings.filter(s => s.isExpenseEnabled).length;
    const globalCount = settings.filter(s => !s.branchId && !s.departmentId).length;

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Expense Settings</h2>
                </div>
                    <p className="page-subtitle">Configure global and local organizational rules for expense operations.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add Policy Rule
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            {!showForm && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Settings size={32} style={{ color: "var(--primary)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Configs</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{settings.length}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Building2 size={32} style={{ color: "var(--success)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Enabled Targets</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{activeEnabled}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <CheckCircle2 size={32} style={{ color: "var(--warning)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Global Scope Rules</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{globalCount}</h3>
                        </div>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{editingId ? "Edit Policy" : "New Settings Policy"}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Leave organizational fields blank to apply setting globally.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                            <div>
                                <label className="input-label" style={{ fontWeight: 600 }}>Target Branch</label>
                                <select className="select-modern" value={formData.branchId} onChange={e => setFormData({ ...formData, branchId: e.target.value })}>
                                    <option value="">-- Apply Globally --</option>
                                    {branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.branchName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ fontWeight: 600 }}>Target Department</label>
                                <select className="select-modern" value={formData.departmentId} onChange={e => setFormData({ ...formData, departmentId: e.target.value })}>
                                    <option value="">-- Apply to All --</option>
                                    {departments.filter(d => !formData.branchId || d.branchId?.toString() === formData.branchId).map(d => (
                                        <option key={d.id} value={d.id}>{d.departmentName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ fontWeight: 600 }}>Sub Department</label>
                                <select className="select-modern" value={formData.subDepartmentId} onChange={e => setFormData({ ...formData, subDepartmentId: e.target.value })}>
                                    <option value="">-- Apply to All --</option>
                                    {subDepartments.filter(sd => !formData.departmentId || sd.departmentId?.toString() === formData.departmentId).map(sd => (
                                        <option key={sd.id} value={sd.id}>{sd.subDepartmentName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.isExpenseEnabled} onChange={e => setFormData({ ...formData, isExpenseEnabled: e.target.checked })} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 600 }}>Enable Expense Module</span>
                                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Allow users in this scope to submit expenses.</span>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.hideExpenseTitle} onChange={e => setFormData({ ...formData, hideExpenseTitle: e.target.checked })} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 600 }}>Hide Title Input</span>
                                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Remove custom title field for standard entries.</span>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.allowBackdate} onChange={e => setFormData({ ...formData, allowBackdate: e.target.checked })} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                                <div style={{ width: '100%' }}>
                                    <span style={{ display: 'block', fontWeight: 600 }}>Allow Backdated Expenses</span>
                                    {formData.allowBackdate && (
                                        <input type="number" placeholder="Max Days (e.g. 7)" value={formData.maxBackdateDays} onChange={e => setFormData({ ...formData, maxBackdateDays: e.target.value })} className="input-modern" style={{ marginTop: '8px', padding: '8px 12px' }} />
                                    )}
                                </div>
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.approvalRequired} onChange={e => setFormData({ ...formData, approvalRequired: e.target.checked })} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--primary)' }}>Force Approval Flow</span>
                                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Requires manager sign-off.</span>
                                </div>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.autoApprove} onChange={e => setFormData({ ...formData, autoApprove: e.target.checked })} style={{ width: '20px', height: '20px', marginTop: '4px' }} />
                                <div>
                                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--success)' }}>Default Auto Approve</span>
                                    <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Bypass managerial review.</span>
                                </div>
                            </label>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: '12px' }}>
                                <span style={{ fontWeight: 600, fontSize: '14px' }}>Day Type Filter Option</span>
                                <select className="select-modern" value={formData.dayTypeOption} onChange={e => setFormData({ ...formData, dayTypeOption: e.target.value })} style={{ background: 'var(--bg-app)' }}>
                                    <option value="Default">System Default</option>
                                    <option value="Custom">Custom Override</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialForm); }}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                <Check size={18} /> Save Policy
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Show</span>
                            <select className="select-modern" style={{ width: 'auto', padding: '8px 12px' }} value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search by Target..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {filteredSettings.length === 0 ? (
                            <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Settings size={48} style={{ color: 'var(--border-light)', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No Settings Configured</h3>
                                <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => setShowForm(true)}>
                                    <Plus size={16} /> Create Global Rule
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Target Scope</th>
                                            <th style={{ textAlign: 'center' }}>Module Status</th>
                                            <th style={{ textAlign: 'center' }}>Backdate</th>
                                            <th style={{ textAlign: 'center' }}>Approval Flow</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSettings.map(s => (
                                            <tr key={s.id}>
                                                <td>
                                                    {s.branch || s.department ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{ fontWeight: 600 }}>{s.branch?.branchName || 'All Branches'}</span>
                                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.department?.departmentName || 'All Depts'} {s.subDepartment && `> ${s.subDepartment.subDepartmentName}`}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="badge badge-primary">GLOBAL POLICY</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {s.isExpenseEnabled ? (
                                                        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--success)' }}><CheckCircle2 size={20} /></div>
                                                    ) : (
                                                        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--danger)' }}><XCircle size={20} /></div>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    {s.allowBackdate ? <span className="badge badge-warning">{s.maxBackdateDays} Days Default</span> : <span style={{ color: 'var(--text-muted)' }}>Disabled</span>}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                                        {s.autoApprove && <span className="badge badge-success">Auto Approve</span>}
                                                        {s.approvalRequired && <span className="badge badge-primary">Requires RM</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button onClick={() => handleEdit(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {filteredSettings.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <div>Showing {filteredSettings.length} defined configurations</div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
