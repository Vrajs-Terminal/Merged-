import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Trash2, Edit3, MoreVertical, 
    CheckCircle2, XCircle, Info, ChevronRight, 
    Layers, Filter, ArrowRight 
} from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import './idea-box.css';

interface Category {
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    creator?: { name: string };
    _count?: { ideas: number };
}

const IdeaCategory: React.FC = () => {
    const { user } = useAuthStore();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter/Search State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Drawer State
    const [showDrawer, setShowDrawer] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get('/idea-box/categories');
            setCategories(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDrawer = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                status: category.status
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', status: 'Active' });
        }
        setShowDrawer(true);
    };

    const handleCloseDrawer = () => {
        setShowDrawer(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', status: 'Active' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.name.trim()) return setError('Category name is required');

        try {
            if (editingCategory) {
                await api.put(`/idea-box/categories/${editingCategory.id}`, formData);
                setSuccess('Category updated successfully');
            } else {
                await api.post('/idea-box/categories', {
                    ...formData,
                    created_by: user?.id
                });
                setSuccess('Category created successfully');
            }
            fetchCategories();
            handleCloseDrawer();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/idea-box/categories/${id}`);
            setSuccess('Category deleted successfully');
            fetchCategories();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete');
        }
    };

    const filteredCategories = categories.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="ib-layout">
            <div className="ib-container ib-fade-in">
                {/* Header */}
                <div className="ib-header">
                    <div className="ib-header-left">
                        <div className="ib-header-icon">
                            <Layers size={32} />
                        </div>
                        <div>
                            <h2>Idea Categories</h2>
                            <p>Organize innovation by defining structured categories</p>
                        </div>
                    </div>
                    <div className="ib-header-actions">
                        <button className="ib-btn ib-btn-primary" onClick={() => handleOpenDrawer()}>
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="ib-stats-grid">
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box blue">
                            <Layers size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Total Categories</h3>
                            <div className="value">{categories.length}</div>
                        </div>
                    </div>
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box green">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Active</h3>
                            <div className="value">{categories.filter(c => c.status === 'Active').length}</div>
                        </div>
                    </div>
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box pink">
                            <ArrowRight size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Total Ideas</h3>
                            <div className="value">{categories.reduce((acc, curr) => acc + (curr._count?.ideas || 0), 0)}</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="ib-table-card" style={{ marginBottom: '24px', padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search categories..." 
                                className="ib-input"
                                style={{ paddingLeft: '40px' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select 
                            className="ib-select" 
                            style={{ width: '180px' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="ib-table-card">
                    <table className="ib-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Sr No</th>
                                <th>Category Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Ideas Linked</th>
                                <th>Created At</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No categories found</td></tr>
                            ) : filteredCategories.map((c, idx) => (
                                <tr key={c.id}>
                                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>by {c.creator?.name || 'Admin'}</div>
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '13px', maxWidth: '300px' }}>
                                        {c.description || 'No description provided'}
                                    </td>
                                    <td>
                                        <span className={`ib-idea-badge ${c.status === 'Active' ? 'ib-badge-approved' : 'ib-badge-pending'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                                            <Layers size={14} color="#6366f1" />
                                            {c._count?.ideas || 0}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="ib-btn ib-btn-secondary" style={{ padding: '6px' }} onClick={() => handleOpenDrawer(c)}>
                                                <Edit3 size={16} color="#4f46e5" />
                                            </button>
                                            <button className="ib-btn ib-btn-secondary" style={{ padding: '6px' }} onClick={() => handleDelete(c.id)}>
                                                <Trash2 size={16} color="#ef4444" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Drawer */}
            {showDrawer && (
                <div className="ib-overlay" onClick={handleCloseDrawer}>
                    <div className="ib-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">
                                {editingCategory ? <Edit3 size={20} /> : <Plus size={20} />}
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </div>
                            <button className="ib-btn ib-btn-secondary" style={{ padding: '4px' }} onClick={handleCloseDrawer}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
                            <div className="ib-drawer-body">
                                <div className="ib-form-group">
                                    <label className="ib-label">Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input 
                                        className="ib-input" 
                                        placeholder="e.g. Process Improvement"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Description</label>
                                    <textarea 
                                        className="ib-textarea" 
                                        placeholder="Explain what kind of ideas fall into this category..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Status</label>
                                    <select 
                                        className="ib-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
                            </div>
                            <div className="ib-drawer-footer">
                                <button type="button" className="ib-btn ib-btn-secondary" onClick={handleCloseDrawer}>Cancel</button>
                                <button type="submit" className="ib-btn ib-btn-primary">
                                    {editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdeaCategory;
