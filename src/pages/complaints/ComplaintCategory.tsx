import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Settings, Clock, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import './complaints.css';

interface ComplaintCategory {
    id: number;
    name: string;
    sla_limit: number;
    status: 'Active' | 'Inactive';
}

export default function ComplaintCategoryPage() {
    const [categories, setCategories] = useState<ComplaintCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ComplaintCategory | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    const [formSla, setFormSla] = useState(24); // Default 24 hours
    const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/complaints/categories');
            if (res.ok) setCategories(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleSave = async () => {
        if (!formName.trim()) return alert("Name is required");

        setIsSaving(true);
        try {
            const payload = {
                name: formName.trim(),
                sla_limit: Number(formSla),
                status: formStatus
            };

            const url = editingCategory ? `/api/complaints/categories/${editingCategory.id}` : '/api/complaints/categories';
            const method = editingCategory ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                fetchCategories();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.message || "Failed to save category");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this category?")) return;
        try {
            const res = await fetch(`/api/complaints/categories/${id}`, { method: 'DELETE' });
            if (res.ok) fetchCategories();
        } catch (e) { console.error(e); }
    };

    const openModal = (cat: ComplaintCategory | null = null) => {
        setEditingCategory(cat);
        setFormName(cat ? cat.name : '');
        setFormSla(cat ? cat.sla_limit : 24);
        setFormStatus(cat ? cat.status : 'Active');
        setIsModalOpen(true);
    };

    return (
        <div className="complaints-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <Settings size={24} color="#3b82f6" />
                    <h1>Complaint Categories</h1>
                </div>
                <button className="btn-add" onClick={() => openModal()}>
                    <Plus size={16} /> Add Category
                </button>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div className="v-filter-row">
                    <div className="bgv-search-box" style={{ maxWidth: '400px' }}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search categories..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>SLA Limit (Hours)</th>
                            <th>Expected Resolution</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} className="spin" style={{ color: '#3b82f6', margin: '0 auto' }} />
                                </td>
                            </tr>
                        ) : categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                            <tr key={cat.id} className="fade-in">
                                <td><strong>{cat.name}</strong></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={14} color="#64748b" />
                                        {cat.sla_limit} hrs
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        Within {cat.sla_limit >= 24 ? `${Math.floor(cat.sla_limit / 24)} days` : `${cat.sla_limit} hours`}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${cat.status === 'Active' ? 'verified' : 'not-started'}`}>
                                        {cat.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon-only" onClick={() => openModal(cat)}><Edit2 size={16} /></button>
                                        <button className="btn-icon-only delete" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '24px' }}>
                        <div className="modal-header">
                            <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Category Name (e.g. HR, IT, Payroll) <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="form-input" value={formName} onChange={e => setFormName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>SLA Limit (Resolution Time in Hours) <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input type="number" className="form-input" value={formSla} onChange={e => setFormSla(Number(e.target.value))} />
                                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>HRS</span>
                                </div>
                                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>Example: 24 = 1 Day, 48 = 2 Days, 120 = 5 Days</p>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select className="form-select" value={formStatus} onChange={e => setFormStatus(e.target.value as any)}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                {editingCategory ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
