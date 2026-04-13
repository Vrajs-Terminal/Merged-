import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Layers, Plus, Edit2, Trash2, LayoutList, Search, ClipboardList, Zap, Check } from "lucide-react";
import API_BASE from "../api";

export default function ExpenseSubCategories() {
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [entriesPerPage, setEntriesPerPage] = useState(25);

    const initialForm = {
        categoryId: "",
        subCategoryName: "",
        type: "Fixed", // Fixed / Unit / Both
        paymentMode: "Cash",
        unitName: "",
        unitPrice: "",
        amountType: "Fixed",
        amount: "",
        attachmentRequired: false,
        autoApproved: false
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { 
        loadSubCategories(); 
        loadCategories();
    }, []);

    const loadSubCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-sub-categories`);
            setSubCategories(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadCategories = async () => {
        try {
            const res = await axios.get(`${API_BASE}/expense-categories`);
            setCategories(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        const parent = categories.find(c => c.id?.toString() === catId);
        if (parent) {
            setFormData({
                ...formData,
                categoryId: catId,
                type: parent.type,
                paymentMode: parent.paymentMode || "Cash",
                unitName: parent.unitName || "",
                unitPrice: parent.unitPrice || "",
                amountType: parent.amountType || "Fixed",
                attachmentRequired: parent.attachmentRequired,
                autoApproved: parent.autoApproved
            });
        } else {
            setFormData({ ...formData, categoryId: catId });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                categoryId: Number(formData.categoryId),
                unitPrice: formData.unitPrice ? Number(formData.unitPrice) : null,
                amount: formData.amount ? Number(formData.amount) : null
            };
            if (editingId) {
                await axios.put(`${API_BASE}/expense-sub-categories/${editingId}`, payload);
            } else {
                await axios.post(`${API_BASE}/expense-sub-categories`, payload);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData(initialForm);
            loadSubCategories();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error saving sub category");
        }
    };

    const handleEdit = (c: any) => {
        setEditingId(c.id);
        setFormData({
            categoryId: c.categoryId.toString(),
            subCategoryName: c.subCategoryName,
            type: c.type,
            paymentMode: c.paymentMode || "Cash",
            unitName: c.unitName || "",
            unitPrice: c.unitPrice || "",
            amountType: c.amountType || "Fixed",
            amount: c.amount || "",
            attachmentRequired: c.attachmentRequired,
            autoApproved: c.autoApproved
        });
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this sub category?")) return;
        try {
            await axios.delete(`${API_BASE}/expense-sub-categories/${id}`);
            loadSubCategories();
        } catch (e: any) {
            alert(e.response?.data?.error || "Error deleting");
        }
    };

    const filteredData = useMemo(() => {
        return subCategories.filter((item) => {
            const matchName = item.subCategoryName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchCat = (item.category?.categoryName || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchName || matchCat;
        }).slice(0, entriesPerPage);
    }, [subCategories, searchTerm, entriesPerPage]);

    const showUnitFields = formData.type === "Unit" || formData.type === "Both";

    const totalSub = subCategories.length;
    const typeUnitCount = subCategories.filter(s => s.type === "Unit" || s.type === "Both").length;
    const totalAttached = subCategories.filter(s => s.attachmentRequired).length;

    return (
        <div style={{ padding: '24px 32px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={22} strokeWidth={2.25} style={{ color: 'var(--primary)' }} />
                    <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>Expense Sub Categories</h2>
                </div>
                    <p className="page-subtitle">Break down top-level categories into specialized reporting elements.</p>
                </div>
                {!showForm && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> Add Sub Category
                    </button>
                )}
            </div>

            {!showForm && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <ClipboardList size={32} style={{ color: "var(--primary)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Sub Categories</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{totalSub}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <Zap size={32} style={{ color: "var(--success)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unit-based Expenses</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{typeUnitCount}</h3>
                        </div>
                    </div>
                    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
                        <LayoutList size={32} style={{ color: "var(--warning)" }} />
                        <div>
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>Attachment Required</p>
                            <h3 style={{ fontSize: '28px', margin: 0, fontWeight: 700 }}>{totalAttached}</h3>
                        </div>
                    </div>
                </div>
            )}

            {showForm ? (
                <div className="glass-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>{editingId ? "Edit Sub Category" : "New Sub Category"}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Fields mapped to a parent will autofill logically.</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label className="input-label">Parent Expense Category *</label>
                                <select className="select-modern" value={formData.categoryId} onChange={handleCategoryChange} required>
                                    <option value="">Select Parent Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="input-label">Sub Category Name *</label>
                                <input type="text" className="input-modern" value={formData.subCategoryName} onChange={e => setFormData({ ...formData, subCategoryName: e.target.value })} required placeholder="e.g. Fuel, Toll Tax" />
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
                                <input type="number" className="input-modern" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="Optional max coverage" />
                            </div>

                            {showUnitFields && (
                                <>
                                    <div>
                                        <label className="input-label" style={{ color: 'var(--primary)' }}>Unit Name</label>
                                        <input type="text" className="input-modern" value={formData.unitName} onChange={e => setFormData({ ...formData, unitName: e.target.value })} required={showUnitFields} />
                                    </div>
                                    <div>
                                        <label className="input-label" style={{ color: 'var(--primary)' }}>Unit Price</label>
                                        <input type="number" className="input-modern" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} required={showUnitFields} />
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-main)' }}>Verification Logic</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.attachmentRequired} onChange={e => setFormData({ ...formData, attachmentRequired: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Attachment Required</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--bg-app)', border: '1px solid var(--border-light)', borderRadius: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.autoApproved} onChange={e => setFormData({ ...formData, autoApproved: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Auto Approved</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid var(--border-light)', paddingTop: '24px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingId(null); setFormData(initialForm); }}>Discard</button>
                            <button type="submit" className="btn btn-primary" disabled={!formData.subCategoryName || !formData.categoryId}>
                                <Check size={18} /> Confirm Save
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
                            <input type="text" className="input-modern" style={{ paddingLeft: '36px' }} placeholder="Search by name or parent..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        {filteredData.length === 0 ? (
                            <div style={{ padding: '64px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                <LayoutList size={48} style={{ color: 'var(--border-light)', marginBottom: '16px' }} />
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No Records Match</h3>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table-modern">
                                    <thead>
                                        <tr>
                                            <th>Parent Node</th>
                                            <th>Sub Category</th>
                                            <th>Type</th>
                                            <th>Unit / Price</th>
                                            <th>Max Scope</th>
                                            <th style={{ textAlign: 'right' }}>Edit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map(sub => (
                                            <tr key={sub.id}>
                                                <td>
                                                    <span className="badge badge-gray">{sub.category?.categoryName || 'Orphan'}</span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{sub.subCategoryName}</td>
                                                <td>{sub.type}</td>
                                                <td style={{ fontFamily: 'monospace' }}>
                                                    {sub.type === 'Unit' || sub.type === 'Both' ? `${sub.unitPrice} / ${sub.unitName}` : '-'}
                                                </td>
                                                <td style={{ fontWeight: 600, color: 'var(--success)' }}>{sub.amount ? `₹${sub.amount}` : 'Open'}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <button onClick={() => handleEdit(sub)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                                                            <Edit2 size={18} />
                                                        </button>
                                                        <button onClick={() => handleDelete(sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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
                        {filteredData.length > 0 && (
                            <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <div>Showing 1 to {filteredData.length} of {subCategories.length} records</div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
