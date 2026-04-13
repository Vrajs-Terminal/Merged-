import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Loader2, ListTree } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vendor.css';

interface Category {
    id: number;
    name: string;
}

interface SubCategory {
    id: number;
    name: string;
    description: string | null;
    status: string;
    categoryId: number;
    category?: Category;
    createdAt: string;
    _count?: { vendors: number };
}

const EMPTY_FORM = { name: '', description: '', status: 'Active', categoryId: 0 };

const SubCategory: React.FC = () => {
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Partial<SubCategory> | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [catRes, subRes] = await Promise.all([
                api.get('/vendors/categories'),
                api.get('/vendors/sub-categories')
            ]);
            setCategories(catRes.data.filter((c: any) => c.status === 'Active'));
            setSubCategories(subRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openAdd = () => {
        setEditItem({ ...EMPTY_FORM });
        setModalOpen(true);
    };

    const openEdit = (sub: SubCategory) => {
        setEditItem({ ...sub });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!editItem?.name || !editItem?.categoryId) {
            return toast.error('Name and Category are required');
        }
        setSaving(true);
        try {
            if (editItem.id) {
                await api.put(`/vendors/sub-categories/${editItem.id}`, editItem);
                toast.success('Sub-category updated');
            } else {
                await api.post('/vendors/sub-categories', editItem);
                toast.success('Sub-category created');
            }
            setModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this sub-category? Linked vendors may be affected.')) return;
        try {
            await api.delete(`/vendors/sub-categories/${id}`);
            toast.success('Deleted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    const filtered = subCategories.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.category?.name && s.category.name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="vendor-layout">
            <div className="vendor-container">
                <div className="vendor-header">
                    <div className="vendor-header-info">
                        <h2><ListTree size={20} /> Vendor Sub Category</h2>
                        <p>Create detailed classifications linked to main categories.</p>
                    </div>
                    <div className="vendor-actions">
                        <div className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search sub-categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={openAdd}>
                            <Plus size={16} /> Add Sub Category
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Main Category</th>
                                <th>Sub Category Name</th>
                                <th>Description</th>
                                <th>Vendors</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No sub-categories found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((sub, index) => (
                                    <tr key={sub.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <span style={{ 
                                                background: '#f1f5f9', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '12px', 
                                                fontWeight: 600,
                                                color: '#475569'
                                            }}>
                                                {sub.category?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{sub.name}</td>
                                        <td style={{ color: '#64748b', fontSize: '13px' }}>{sub.description || '—'}</td>
                                        <td>{sub._count?.vendors || 0}</td>
                                        <td>
                                            <span className={`status-badge ${sub.status.toLowerCase()}`}>
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                <button className="action-btn" onClick={() => openEdit(sub)} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(sub.id)} title="Delete">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && editItem && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem.id ? 'Edit Sub Category' : 'Add New Sub Category'}</h3>
                            <button className="action-btn" onClick={() => setModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Main Category <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    className="form-control"
                                    value={editItem.categoryId || ''}
                                    onChange={e => setEditItem({ ...editItem, categoryId: Number(e.target.value) })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Sub Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Local Transport"
                                    value={editItem.name || ''}
                                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Enter details..."
                                    value={editItem.description || ''}
                                    onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    value={editItem.status || 'Active'}
                                    onChange={e => setEditItem({ ...editItem, status: e.target.value })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setModalOpen(false)} style={{
                                background: '#f1f5f9',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                {editItem.id ? 'Update Sub Category' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubCategory;
