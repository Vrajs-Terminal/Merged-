import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Loader2, Filter, Download } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vendor.css';

interface Category {
    id: number;
    name: string;
    description: string | null;
    status: string;
    _count?: {
        vendors: number;
        subCategories: number;
    };
    createdAt: string;
}

const EMPTY_FORM = { name: '', description: '', status: 'Active' };

const Category: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<Partial<Category> | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/vendors/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openAdd = () => {
        setEditItem({ ...EMPTY_FORM });
        setModalOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditItem({ ...cat });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!editItem?.name) {
            return toast.error('Category name is required');
        }
        setSaving(true);
        try {
            if (editItem.id) {
                await api.put(`/vendors/categories/${editItem.id}`, editItem);
                toast.success('Category updated successfully');
            } else {
                await api.post('/vendors/categories', editItem);
                toast.success('Category created successfully');
            }
            setModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category? All linked sub-categories and vendors will also be affected.')) return;
        try {
            await api.delete(`/vendors/categories/${id}`);
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to delete');
        }
    };

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="vendor-layout">
            <div className="vendor-container">
                <div className="vendor-header">
                    <div className="vendor-header-info">
                        <h2><Filter size={20} /> Vendor Category</h2>
                        <p>Organize your suppliers and service providers into main categories.</p>
                    </div>
                    <div className="vendor-actions">
                        <div className="search-input-wrapper">
                            <Search size={16} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search categories..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" onClick={openAdd}>
                            <Plus size={16} /> Add Category
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Sub Categories</th>
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
                                        <p style={{ marginTop: '12px', color: '#64748b' }}>Loading categories...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((cat, index) => (
                                    <tr key={cat.id}>
                                        <td>{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{cat.name}</td>
                                        <td style={{ color: '#64748b', fontSize: '13px' }}>{cat.description || '—'}</td>
                                        <td>{cat._count?.subCategories || 0}</td>
                                        <td>{cat._count?.vendors || 0}</td>
                                        <td>
                                            <span className={`status-badge ${cat.status.toLowerCase()}`}>
                                                {cat.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                                <button className="action-btn" onClick={() => openEdit(cat)} title="Edit">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(cat.id)} title="Delete">
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

                <div className="pagination">
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                        Showing {filtered.length} total categories
                    </div>
                </div>
            </div>

            {modalOpen && editItem && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editItem.id ? 'Edit Category' : 'Add New Category'}</h3>
                            <button className="action-btn" onClick={() => setModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="e.g. Raw Material Supplier"
                                    value={editItem.name || ''}
                                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    placeholder="Enter category details..."
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
                                {editItem.id ? 'Update Category' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Category;
