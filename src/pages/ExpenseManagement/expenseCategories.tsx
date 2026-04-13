import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Plus, Edit2, Trash2, LayoutList, Search, ClipboardList, Zap, Settings, Check, Wallet } from "lucide-react";
import API_BASE from "../api";

export default function ExpenseCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);

    const initialForm = {
        categoryName: "",
        expenseSlabType: "Fixed",
        type: "Fixed",
        paymentMode: "Cash",
        unitName: "",
        unitPrice: "",
        amountType: "Fixed",
        amount: "",
        attachmentRequired: false,
        autoApproved: false,
        isVisitExpense: false,
        isTravelExpense: false
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-categories`);
            setCategories(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                unitPrice: formData.unitPrice ? Number(formData.unitPrice) : null,
                amount: formData.amount ? Number(formData.amount) : null
            };
            if (editingId) {
                await axios.put(`${API_BASE}/expense-categories/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE}/expense-categories`, payload);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
            loadCategories();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving category");
        }
    };

    const handleEdit = (c: any) => {
        setEditingId(c.id);
        setFormData({
            categoryName: c.categoryName,
            expenseSlabType: c.expenseSlabType,
            type: c.type,
            paymentMode: c.paymentMode || "Cash",
            unitName: c.unitName || "",
            unitPrice: c.unitPrice || "",
            amountType: c.amountType || "Fixed",
            amount: c.amount || "",
            attachmentRequired: c.attachmentRequired,
            autoApproved: c.autoApproved,
            isVisitExpense: c.isVisitExpense,
            isTravelExpense: c.isTravelExpense
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            await axios.delete(`${API_BASE}/expense-categories/${id}`);
            loadCategories();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error deleting category");
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(c => 
            c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.expenseSlabType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.type.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, entriesPerPage);
    }, [categories, searchTerm, entriesPerPage]);

    const showUnitFields = formData.type === "Unit" || formData.type === "Both";

    const totalCategories = categories.length;
    const autoApprovedCount = categories.filter(c => c.autoApproved).length;
    const attachmentsReqCount = categories.filter(c => c.attachmentRequired).length;

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Expense Categories</h2>
                </div>
                    <p className="page-subtitle">Define types of expenses, limits, approval rules, and tax impact.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add Category
                    </button>
                )}
            </div>

            {!showForm && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <ClipboardList size={32} style={{ color: "var(--primary)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Categories</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{totalCategories}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Zap size={32} style={{ color: "var(--success)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Auto Approved</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{autoApprovedCount}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Settings size={32} style={{ color: "var(--warning)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Requires Attachment</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{attachmentsReqCount}</h3>
                        </div>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{editingId ? "Edit Category" : "New Category"}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Fill in the primary details and behavior rules for this expense type.</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label className="input-label">Category Name *</label>
                                <input type="text" className="input-modern" value={formData.categoryName} onChange={e => setFormData({ ...formData, categoryName: e.target.value })} required />
                            </div>
                            <div>
                                <label className="input-label">Expense Slab Type</label>
                                <select className="select-modern" value={formData.expenseSlabType} onChange={e => setFormData({ ...formData, expenseSlabType: e.target.value })}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Slab Wise">Slab Wise</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Type</label>
                                <select className="select-modern" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Unit">Unit</option>
                                    <option value="Both">Both</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Default Payment Mode</label>
                                <select className="select-modern" value={formData.paymentMode} onChange={e => setFormData({ ...formData, paymentMode: e.target.value })}>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank">Bank</option>
                                    <option value="Card">Card</option>
                                    <option value="Wallet">Wallet</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Amount Type</label>
                                <select className="select-modern" value={formData.amountType} onChange={e => setFormData({ ...formData, amountType: e.target.value })}>
                                    <option value="Fixed">Fixed</option>
                                    <option value="Variable">Variable</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Amount Limit</label>
                                <input type="number" className="input-modern" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g. 5000" />
                            </div>

                            {showUnitFields && (
                                <>
                                    <div>
                                        <label className="input-label" style={{ color: 'var(--primary)' }}>Unit Name</label>
                                        <input type="text" className="input-modern" value={formData.unitName} onChange={e => setFormData({ ...formData, unitName: e.target.value })} placeholder="e.g. KM, Hours, Days" required={showUnitFields} />
                                    </div>
                                    <div>
                                        <label className="input-label" style={{ color: 'var(--primary)' }}>Unit Price</label>
                                        <input type="number" className="input-modern" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} placeholder="e.g. 10" required={showUnitFields} />
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Flags & Boolean Rules</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.attachmentRequired} onChange={e => setFormData({ ...formData, attachmentRequired: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Attachment Required</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.autoApproved} onChange={e => setFormData({ ...formData, autoApproved: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Auto Approved</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isVisitExpense} onChange={e => setFormData({ ...formData, isVisitExpense: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Visit Expense Category</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.isTravelExpense} onChange={e => setFormData({ ...formData, isTravelExpense: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Visit Wise Travel Expense</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialForm); }}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={!formData.categoryName}>
                                <Check size={18} /> Save Category
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
                            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>entries</span>
                        </div>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {filteredCategories.length === 0 ? (
                            <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <LayoutList size={48} style={{ color: 'var(--border-light)', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No Categories Found</h3>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Try adjusting your search or add a new category to get started.</p>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Category Name</th>
                                            <th>Slab Type</th>
                                            <th>Type</th>
                                            <th>Unit Details</th>
                                            <th>Amount Limit</th>
                                            <th>Rules</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCategories.map(c => (
                                            <tr key={c.id}>
                                                <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                                                <td>
                                                    <span className={c.expenseSlabType === 'Fixed' ? 'badge badge-primary' : 'badge badge-warning'}>
                                                        {c.expenseSlabType}
                                                    </span>
                                                </td>
                                                <td>{c.type}</td>
                                                <td style={{ fontFamily: 'monospace' }}>
                                                    {c.type === 'Unit' || c.type === 'Both' ? `${c.unitPrice} / ${c.unitName}` : '-'}
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>{c.amount ? `₹${c.amount}` : '-'}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {c.attachmentRequired && <span className="badge badge-danger">Attachment</span>}
                                                        {c.autoApproved && <span className="badge badge-success">Auto Approve</span>}
                                                        {c.isVisitExpense && <span className="badge badge-primary">Visit Exp</span>}
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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
                        {filteredCategories.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <div>Showing 1 to {filteredCategories.length} of {categories.length} entries</div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
