import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, Layers, HelpCircle, X, Check, Activity, AlertCircle, Users } from 'lucide-react';
import api from '../../lib/axios';
import './tax-benefit-category.css';
import { toast } from 'react-hot-toast';

interface TaxCategory {
    id: number;
    category_name: string;
    section_code: string;
    max_limit: number;
    applicable_regime: string;
    financial_year: string;
    description: string;
    status: string;
    usage_count: number;
}

const TaxBenefitCategory = () => {
    const [categories, setCategories] = useState<TaxCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [financialYear, setFinancialYear] = useState('2025-26');
    
    // Drawer State
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<Partial<TaxCategory> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [financialYear]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-categories', { params: { search, financial_year: financialYear } });
            setCategories(res.data);
        } catch (error) {
            toast.error("Failed to load categories");
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
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await api.delete(`/payroll/tax-categories/${id}`);
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to delete category");
        }
    };

    const saveCategory = async () => {
        if (!editingCat?.category_name || !editingCat?.section_code) {
            return toast.error("Name and Section Code are required");
        }
        setIsSaving(true);
        try {
            if (editingCat.id) {
                await api.put(`/payroll/tax-categories/${editingCat.id}`, editingCat);
                toast.success("Category updated");
            } else {
                await api.post(`/payroll/tax-categories`, { ...editingCat, financial_year: financialYear });
                toast.success("Category created");
            }
            setDrawerOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save category");
        } finally {
            setIsSaving(false);
        }
    };

    const openCreateDrawer = () => {
        setEditingCat({
            category_name: '',
            section_code: '',
            max_limit: 0,
            applicable_regime: 'Old',
            description: '',
            status: 'Active'
        });
        setDrawerOpen(true);
    };

    const openEditDrawer = (cat: TaxCategory) => {
        setEditingCat({ ...cat });
        setDrawerOpen(true);
    };

    const stats = {
        total: categories.length,
        active: categories.filter(c => c.status === 'Active').length,
        oldOnly: categories.filter(c => c.applicable_regime === 'Old').length,
        both: categories.filter(c => c.applicable_regime === 'Both').length
    };

    // AI suggestion for limits based on section code
    const applySuggestion = () => {
        if (!editingCat?.section_code) return;
        const code = editingCat.section_code.toUpperCase().replace(/\s/g,'');
        if (code === '80C' || code === '80CCC' || code === '80CCD(1)') {
            setEditingCat({ ...editingCat, max_limit: 150000 });
            toast.success("Applied smart limit suggestion: ₹1,50,000");
        } else if (code === '80D') {
            setEditingCat({ ...editingCat, max_limit: 75000 });
            toast.success("Applied smart limit suggestion for 80D (Max): ₹75,000");
        } else if (code === '80CCD(1B)') {
            setEditingCat({ ...editingCat, max_limit: 50000 });
            toast.success("Applied smart limit suggestion for NPS: ₹50,000");
        } else {
            toast("No standard suggestion found for this section.");
        }
    };

    return (
        <div className="tax-category-layout">
            <div className="tax-category-container">
                <div className="tc-header">
                    <div>
                        <h2>Tax Benefit Categories</h2>
                        <p>Manage tax exemption sections (e.g., 80C, 80D) and their global limits required for employee declarations.</p>
                    </div>
                    <button className="btn-add-primary" onClick={openCreateDrawer}>
                        <Plus size={16} /> Add Category
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="tc-stats-grid">
                    <div className="tc-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20}/></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Categories</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{stats.total}</p>
                        </div>
                    </div>
                    <div className="tc-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={20}/></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Active Categories</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{stats.active}</p>
                        </div>
                    </div>
                    <div className="tc-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={20}/></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Old Regime Only</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{stats.oldOnly}</p>
                        </div>
                    </div>
                    <div className="tc-stat-card">
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20}/></div>
                        <div>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Common (Both Regimes)</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{stats.both}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <select className="tc-input" style={{ minWidth: 150 }} value={financialYear} onChange={(e: any) => setFinancialYear(e.target.value)}>
                        <option value="2025-26">FY 2025–26</option>
                        <option value="2024-25">FY 2024–25</option>
                    </select>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                            type="text" 
                            className="tc-input" 
                            style={{ paddingLeft: '36px', width: '100%' }} 
                            placeholder="Search by category name or section code..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={handleKeypress}
                        />
                    </div>
                    <button className="btn-add-primary" style={{ background: '#f1f5f9', color: '#475569' }} onClick={handleSearch}>Search</button>
                </div>

                {/* Table */}
                <div className="tc-table-wrapper">
                    <table className="tc-table">
                        <thead>
                            <tr>
                                <th>Section Code</th>
                                <th>Category Name</th>
                                <th>Max Exemption Limit</th>
                                <th>Applicable Regime</th>
                                <th>Usage</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
                            ) : categories.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No categories configured yet.</td></tr>
                            ) : categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: '#0f172a', background: '#f1f5f9', padding: '4px 8px', borderRadius: 6, fontSize: 13 }}>{cat.section_code}</span>
                                    </td>
                                    <td>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{cat.category_name}</p>
                                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 12, maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.description || 'No description'}</p>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#16a34a', fontSize: 14 }}>₹{cat.max_limit.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: cat.applicable_regime === 'Both' ? '#f3e8ff' : cat.applicable_regime === 'Old' ? '#dbeafe' : '#dcfce7', color: cat.applicable_regime === 'Both' ? '#9333ea' : cat.applicable_regime === 'Old' ? '#2563eb' : '#16a34a' }}>
                                            {cat.applicable_regime}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="tc-usage-badge">
                                            <Users size={12} /> {cat.usage_count} Declarations
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cat.status === 'Active' ? '#dcfce7' : '#fef2f2', color: cat.status === 'Active' ? '#16a34a' : '#ef4444' }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.status === 'Active' ? '#16a34a' : '#ef4444' }}></span>
                                            {cat.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }} onClick={() => openEditDrawer(cat)}><Edit2 size={15} /></button>
                                            <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }} onClick={() => deleteCategory(cat.id)}><Trash2 size={15} /></button>
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerOpen(false)}>
                    <div style={{ background: 'white', width: 480, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: 24, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>{editingCat.id ? 'Edit Tax Category' : 'New Tax Category'}</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="tc-input-wrapper">
                                <label>Section Code <span style={{color: '#ef4444'}}>*</span></label>
                                <input 
                                    className="tc-input" 
                                    placeholder="e.g., 80C, 80D" 
                                    value={editingCat.section_code}
                                    onChange={e => setEditingCat({...editingCat, section_code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            
                            <div className="tc-input-wrapper">
                                <label>Category Name <span style={{color: '#ef4444'}}>*</span></label>
                                <input 
                                    className="tc-input" 
                                    placeholder="e.g., Medical Insurance" 
                                    value={editingCat.category_name}
                                    onChange={e => setEditingCat({...editingCat, category_name: e.target.value})}
                                />
                            </div>

                            <div className="tc-input-wrapper">
                                <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Max Exemption Limit (₹) <span style={{color: '#ef4444'}}>*</span></span>
                                    {editingCat.section_code && (
                                        <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer' }} onClick={applySuggestion}>Suggest Auto-Limit ✨</button>
                                    )}
                                </label>
                                <input 
                                    type="number"
                                    className="tc-input" 
                                    value={editingCat.max_limit || ''}
                                    onChange={e => setEditingCat({...editingCat, max_limit: parseFloat(e.target.value) || 0})}
                                />
                            </div>

                            <div className="tc-input-wrapper">
                                <label>Applicable Tax Regime <span style={{color: '#ef4444'}}>*</span></label>
                                <div className="tc-chip-group">
                                    {['Old', 'New', 'Both'].map(r => (
                                        <button 
                                            key={r}
                                            className={`tc-chip-btn ${editingCat.applicable_regime === r ? 'active' : ''}`}
                                            onClick={() => setEditingCat({...editingCat, applicable_regime: r})}
                                        >
                                            {r === editingCat.applicable_regime && <Check size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/>} 
                                            {r} Regime
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="tc-input-wrapper">
                                <label>Description (Optional)</label>
                                <textarea 
                                    className="tc-input" 
                                    rows={3} 
                                    placeholder="Brief description about what this section covers..."
                                    value={editingCat.description || ''}
                                    onChange={e => setEditingCat({...editingCat, description: e.target.value})}
                                />
                            </div>

                            <div className="tc-input-wrapper">
                                <label>Status</label>
                                <select 
                                    className="tc-input" 
                                    value={editingCat.status}
                                    onChange={e => setEditingCat({...editingCat, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div style={{ marginTop: 10, padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <AlertCircle size={16} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
                                <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>These limits act as the parent cap. Individual tax benefit items (sub-categories) created under this section cannot exceed this total maximum limit per financial year.</p>
                            </div>
                        </div>

                        <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc' }}>
                            <button style={{ padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: 'white', color: '#475569', border: '1px solid #e2e8f0' }} onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button style={{ padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }} onClick={saveCategory} disabled={isSaving}>
                                {isSaving ? 'Saving...' : (editingCat.id ? 'Save Changes' : 'Create Category')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxBenefitCategory;
