import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Briefcase, Plus, Edit2, Trash2, Search, Users, MapPin, Check, Filter } from "lucide-react";
import API_BASE from "../api";

export default function AssignVisitExpense() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);
    const [statusFilter, setStatusFilter] = useState("All");

    const initialForm = {
        employeeId: "",
        role: "",
        categoryId: "",
        subCategoryId: "",
        isVisitExpense: false,
        isTravelExpense: false,
        limitAmount: "",
        dailyLimit: "",
        monthlyLimit: "",
        startDate: "",
        endDate: "",
        status: "Active"
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { 
        loadAssignments();
        loadFilters();
    }, []);

    const loadAssignments = async () => {
        try {
            const res = await axios.get(`${API_BASE}/visit-expense-assignments`);
            setAssignments(Array.isArray(res.data) ? res.data : res.data?.assignments || []);
        } catch (e) { console.error(e); }
    };

    const loadFilters = async () => {
        try {
            const [empRes, catRes, subRes] = await Promise.all([
                axios.get(`${API_BASE}/employees`),
                axios.get(`${API_BASE}/expense-categories`),
                axios.get(`${API_BASE}/expense-sub-categories`)
            ]);
            setEmployees(Array.isArray(empRes.data) ? empRes.data : empRes.data?.employees || []);
            setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || []);
            setSubCategories(Array.isArray(subRes.data) ? subRes.data : subRes.data?.subCategories || []);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                role: formData.role.trim(),
                employeeId: formData.employeeId ? Number(formData.employeeId) : null,
                categoryId: Number(formData.categoryId),
                subCategoryId: formData.subCategoryId ? Number(formData.subCategoryId) : null,
                limitAmount: formData.limitAmount ? Number(formData.limitAmount) : null,
                dailyLimit: formData.dailyLimit ? Number(formData.dailyLimit) : null,
                monthlyLimit: formData.monthlyLimit ? Number(formData.monthlyLimit) : null,
                startDate: formData.startDate ? new Date(formData.startDate) : null,
                endDate: formData.endDate ? new Date(formData.endDate) : null
            };
            if (editingId) {
                await axios.put(`${API_BASE}/visit-expense-assignments/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE}/visit-expense-assignments`, payload);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
            loadAssignments();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving assignment");
        }
    };

    const handleEdit = (a: any) => {
        setEditingId(a.id);
        const formatDt = (d: any) => d ? new Date(d).toISOString().split('T')[0] : "";
        setFormData({
            employeeId: a.employeeId?.toString() || "",
            role: a.role || "",
            categoryId: a.categoryId.toString(),
            subCategoryId: a.subCategoryId?.toString() || "",
            isVisitExpense: a.isVisitExpense,
            isTravelExpense: a.isTravelExpense,
            limitAmount: a.limitAmount || "",
            dailyLimit: a.dailyLimit || "",
            monthlyLimit: a.monthlyLimit || "",
            startDate: formatDt(a.startDate),
            endDate: formatDt(a.endDate),
            status: a.status
        });
        setShowForm(true);
    };

    const handleToggleStatus = async (a: any) => {
        try {
            const newStatus = a.status === 'Active' ? 'Inactive' : 'Active';
            await axios.put(`${API_BASE}/visit-expense-assignments/${a.id}`, { status: newStatus });
            loadAssignments();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Remove this assignment?")) return;
        try {
            await axios.delete(`${API_BASE}/visit-expense-assignments/${id}`);
            loadAssignments();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error deleting");
        }
    };

    const filteredAssignments = useMemo(() => {
        return assignments.filter(a => {
            const matchName = (a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : a.role || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = (a.category?.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchStatus = statusFilter === 'All' || a.status === statusFilter;
            return (matchName || matchCat) && matchStatus;
        }).slice(0, entriesPerPage);
    }, [assignments, searchTerm, statusFilter, entriesPerPage]);

    // Analytics
    const activeCount = assignments.filter(a => a.status === "Active").length;
    const multiScope = assignments.filter(a => a.isVisitExpense && a.isTravelExpense).length;

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Briefcase size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Assign Visit Expenses</h2>
                </div>
                    <p className="page-subtitle">Directly allocate spending limits to individual employees or entire roles.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Assign Limits
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            {!showForm && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Users size={32} style={{ color: "var(--primary)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Deployments</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{assignments.length}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Check size={32} style={{ color: "var(--success)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Active Allocations</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{activeCount}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <MapPin size={32} style={{ color: "var(--warning)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Dual Travel & Visit</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{multiScope}</h3>
                        </div>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{editingId ? "Edit Allocation" : "New Matrix Allocation"}</h3>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Link an employee or role to specific expense scopes.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'var(--bg-app)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
                            <div>
                                <label className="input-label" style={{ fontWeight: 600, color: 'var(--primary)' }}>Target Employee (Optional)</label>
                                <select className="select-modern" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })}>
                                    <option value="">-- Apply Generic Role Below --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ fontWeight: 600, color: 'var(--primary)' }}>Target Role (Optional)</label>
                                <input type="text" className="input-modern" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Sales Regional" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label className="input-label">Expense Category *</label>
                                <select className="select-modern" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                                    <option value="">Select Target Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Sub Category Scope (Optional)</label>
                                <select className="select-modern" value={formData.subCategoryId} onChange={e => setFormData({ ...formData, subCategoryId: e.target.value })}>
                                    <option value="">Apply Globally to Category</option>
                                    {subCategories.filter(s => !formData.categoryId || s.categoryId?.toString() === formData.categoryId).map(s => (
                                        <option key={s.id} value={s.id}>{s.subCategoryName}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="input-label">Max Cap Amount ₹</label>
                                <input type="number" className="input-modern" value={formData.limitAmount} onChange={e => setFormData({ ...formData, limitAmount: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Daily Rolling Cap ₹</label>
                                <input type="number" className="input-modern" value={formData.dailyLimit} onChange={e => setFormData({ ...formData, dailyLimit: e.target.value })} />
                            </div>
                            
                            <div>
                                <label className="input-label">Commencement Date</label>
                                <input type="date" className="input-modern" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                            </div>
                            <div>
                                <label className="input-label">Expiration Date</label>
                                <input type="date" className="input-modern" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                            </div>
                        </div>

                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Functional Triggers</h4>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isVisitExpense} onChange={e => setFormData({ ...formData, isVisitExpense: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Triggers on Client Visits</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isTravelExpense} onChange={e => setFormData({ ...formData, isTravelExpense: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Triggers on Outstation Travel</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialForm); }}>Abort</button>
                            <button type="submit" className="btn btn-primary" disabled={!formData.categoryId || (!formData.employeeId && !formData.role.trim())}>
                                Execute Allocation
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Show</span>
                                <select className="select-modern" style={{ width: 'auto', padding: '8px 12px' }} value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div style={{ height: '24px', width: '1px', background: 'var(--border-light)' }}></div>
                            <select className="select-modern" style={{ width: 'auto', padding: '8px 12px', fontWeight: 500 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">All States</option>
                                <option value="Active">Active Only</option>
                                <option value="Inactive">Inactive Only</option>
                            </select>
                        </div>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search Employee, Role or Category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {filteredAssignments.length === 0 ? (
                            <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <Filter size={48} style={{ color: 'var(--border-light)', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No Active Assigments</h3>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Target Profile</th>
                                            <th>Category Map</th>
                                            <th>Trip Scope</th>
                                            <th>Allocated Cap</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssignments.map(a => (
                                            <tr key={a.id}>
                                                <td>
                                                    {a.employee ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{ fontWeight: 600 }}>{a.employee.firstName} {a.employee.lastName}</span>
                                                            <span className="badge badge-primary" style={{ width: 'max-content' }}>Direct Assignment</span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                            <span style={{ fontWeight: 600 }}>{a.role}</span>
                                                            <span className="badge badge-warning" style={{ width: 'max-content' }}>Role-Based Allocation</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ fontWeight: 500 }}>
                                                    {a.category?.categoryName} 
                                                    {a.subCategory && <span style={{ color: 'var(--text-muted)' }}> › {a.subCategory.subCategoryName}</span>}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {a.isVisitExpense && <span className="badge badge-primary">Client Visit</span>}
                                                        {a.isTravelExpense && <span className="badge badge-success">Core Travel</span>}
                                                    </div>
                                                </td>
                                                <td style={{ fontFamily: 'monospace' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontWeight: 600 }}>{a.limitAmount ? `MAX: ₹${a.limitAmount}` : 'Unlimited Cap'}</span>
                                                        {a.dailyLimit && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily: ₹{a.dailyLimit}</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button onClick={() => handleToggleStatus(a)} style={{ background: 'none', border: 'none', cursor: 'pointer' }} title="Click to Toggle">
                                                        <span className={a.status === 'Active' ? 'badge badge-success' : 'badge badge-danger'}>
                                                            {a.status}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button onClick={() => handleEdit(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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
                        {filteredAssignments.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <div>Viewing {filteredAssignments.length} compiled assignments</div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
