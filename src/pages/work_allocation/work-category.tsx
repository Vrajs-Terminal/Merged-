import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Layers, X, Check, Activity, Clock, FileText } from 'lucide-react';
import api from '../../lib/axios';
import './work-category.css';
import { toast } from 'react-hot-toast';

interface WorkCategory {
    id: number;
    name: string;
    code: string;
    priority: string;
    status: string;
    sla_hours: number;
    description: string;
    createdBy?: { id: number, name: string };
    createdAt: string;
}

const WorkCategoryPage = () => {
    const [categories, setCategories] = useState<WorkCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    // Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Partial<WorkCategory> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/work-allocation/categories');
            let data = res.data;
            if (search) {
                const lowerSrc = search.toLowerCase();
                data = data.filter((c: WorkCategory) => 
                    c.name.toLowerCase().includes(lowerSrc) || 
                    c.code.toLowerCase().includes(lowerSrc)
                );
            }
            setCategories(data);
        } catch (error) {
            toast.error("Failed to load work categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchCategories();
    };

    const handleKeypress = (e: any) => {
        if (e.key === 'Enter') handleSearch();
    };

    const deleteCategory = async (id: number) => {
        if (!window.confirm("Are you sure you want to mark this category as Inactive? (Soft Delete)")) return;
        try {
            await api.delete(`/work-allocation/categories/${id}`);
            toast.success("Category deactivated successfully");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete category");
        }
    };

    const toggleStatus = async (cat: WorkCategory) => {
        try {
            const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
            await api.put(`/work-allocation/categories/${cat.id}`, { ...cat, status: newStatus });
            toast.success(`Category marked as ${newStatus}`);
            fetchCategories();
        } catch (error: any) {
             toast.error(error.response?.data?.message || "Failed to toggle status");
        }
    }

    const saveCategory = async () => {
        if (!editingCat?.name || !editingCat?.priority) {
            return toast.error("Name and Priority are required");
        }
        setIsSaving(true);
        try {
            if (editingCat.id) {
                await api.put(`/work-allocation/categories/${editingCat.id}`, editingCat);
                toast.success("Work Category updated");
            } else {
                await api.post(`/work-allocation/categories`, editingCat);
                toast.success("Work Category created");
            }
            setDrawerOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save category");
        } finally {
            setIsSaving(false);
        }
    };

    const openCreateDrawer = () => {
        setEditingCat({
            name: '',
            code: '', // leave empty for auto-generation
            priority: 'Medium',
            sla_hours: 24,
            description: '',
            status: 'Active'
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (cat: WorkCategory) => {
        setEditingCat({ ...cat });
        setDrawerOpen(true);
    };

    const stats = {
        total: categories.length,
        active: categories.filter(c => c.status === 'Active').length,
        highPriority: categories.filter(c => c.priority === 'High').length,
    };

    return (
        <div className="wa-layout">
            <div className="wa-container">
                <div className="wa-header">
                    <div>
                        <h2>Work Categories</h2>
                        <p>Define types of work, SLA expectations, and priority tags for tasks.</p>
                    </div>
                    <button className="btn-add-primary" onClick={openCreateDrawer}>
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="wa-stats-grid">
                    <div className="wa-stat-card">
                        <div className="stat-icon-wrapper i-blue"><Layers size={20}/></div>
                        <div>
                            <p className="stat-title">Total Categories</p>
                            <p className="stat-value">{stats.total}</p>
                        </div>
                    </div>
                    <div className="wa-stat-card">
                        <div className="stat-icon-wrapper i-green"><Activity size={20}/></div>
                        <div>
                            <p className="stat-title">Active Categories</p>
                            <p className="stat-value">{stats.active}</p>
                        </div>
                    </div>
                    <div className="wa-stat-card">
                        <div className="stat-icon-wrapper i-red"><FileText size={20}/></div>
                        <div>
                            <p className="stat-title">High Priority</p>
                            <p className="stat-value">{stats.highPriority}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="wa-filters-bar">
                    <div className="search-wrapper">
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            className="wa-input search-input" 
                            placeholder="Search by category name or code..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeypress}
                        />
                    </div>
                    <button className="btn-secondary" onClick={handleSearch}>Search</button>
                </div>

                {/* Table */}
                <div className="wa-table-wrapper">
                    <table className="wa-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Category Name</th>
                                <th>Priority</th>
                                <th>SLA (Hours)</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="table-loading">Loading configuration...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={6} className="table-loading">No work categories found. Create your first category above! 🔥</td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <span className="code-badge">{cat.code}</span>
                                    </td>
                                    <td>
                                        <p className="row-title">{cat.name}</p>
                                        <p className="row-desc">{cat.description || 'No description provided'}</p>
                                    </td>
                                    <td>
                                        <div className={`priority-badge p-${cat.priority.toLowerCase()}`}>
                                            <span className={`dot p-${cat.priority.toLowerCase()}`}></span>
                                            {cat.priority}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="sla-badge">
                                            <Clock size={12} /> {cat.sla_hours} Hrs
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-toggle ${cat.status.toLowerCase()}`} onClick={() => toggleStatus(cat)}>
                                            <div className="status-knob"></div>
                                            <span>{cat.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div className="action-buttons">
                                            <button className="btn-icon" onClick={() => openEditDrawer(cat)} title="Edit"><Edit2 size={15} /></button>
                                            <button className="btn-icon danger" onClick={() => deleteCategory(cat.id)} title="Delete"><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart Drawer for Create/Edit */}
            {drawerOpen && editingCat && (
                <div className="wa-drawer-overlay" onClick={() => setDrawerOpen(false)}>
                    <div className="wa-drawer" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3>{editingCat.id ? 'Edit Work Category' : 'New Work Category'}</h3>
                            <button className="btn-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="drawer-body">
                            <div className="wa-input-wrapper">
                                <label>Work Category Name <span className="required">*</span></label>
                                <input 
                                    className="wa-input" 
                                    placeholder="e.g., Client Follow-up" 
                                    value={editingCat.name}
                                    onChange={e => setEditingCat({...editingCat, name: e.target.value})}
                                />
                            </div>

                            <div className="wa-input-wrapper">
                                <label>
                                    <span>Category Code</span>
                                    {!editingCat.id && <span className="auto-text">Leave empty for Auto (e.g., WRK-001)</span>}
                                </label>
                                <input 
                                    className="wa-input" 
                                    placeholder="e.g., WRK-001" 
                                    value={editingCat.code || ''}
                                    onChange={e => setEditingCat({...editingCat, code: e.target.value})}
                                />
                            </div>
                            
                            <div className="wa-input-wrapper">
                                <label>Priority Level <span className="required">*</span></label>
                                <div className="wa-chip-group">
                                    {['High', 'Medium', 'Low'].map(p => (
                                        <button 
                                            key={p}
                                            className={`wa-chip-btn ${editingCat.priority === p ? 'active' : ''}`}
                                            onClick={() => setEditingCat({...editingCat, priority: p})}
                                        >
                                            {p === editingCat.priority && <Check size={14} className="check-icon"/>} 
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="wa-input-wrapper">
                                <label>SLA (Expected Completion in Hours) <span className="required">*</span></label>
                                <input 
                                    type="number"
                                    className="wa-input" 
                                    value={editingCat.sla_hours || ''}
                                    onChange={e => setEditingCat({...editingCat, sla_hours: parseInt(e.target.value) || 0})}
                                />
                            </div>

                            <div className="wa-input-wrapper">
                                <label>Description (Optional)</label>
                                <textarea 
                                    className="wa-input" 
                                    rows={3} 
                                    placeholder="Short description..."
                                    value={editingCat.description || ''}
                                    onChange={e => setEditingCat({...editingCat, description: e.target.value})}
                                />
                            </div>

                            <div className="wa-input-wrapper">
                                <label>Status</label>
                                <select 
                                    className="wa-input" 
                                    value={editingCat.status}
                                    onChange={e => setEditingCat({...editingCat, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="drawer-footer">
                            <button className="btn-cancel" onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={saveCategory} disabled={isSaving}>
                                {isSaving ? 'Saving...' : (editingCat.id ? 'Save Changes' : 'Create Category')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkCategoryPage;
