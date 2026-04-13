import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    TrendingUp, TrendingDown, ToggleLeft, ToggleRight,
    CirclePlus, Layers
} from 'lucide-react';
import './earning-deduction-types.css';
import '../company_settings/assign-employee-grade.css';

interface EarningDeductionType {
    id: number;
    name: string;
    type: 'Earning' | 'Deduction';
    taxable: boolean;
    description: string | null;
    status: 'Active' | 'Inactive';
}

const ITEMS_PER_PAGE = 25;

export default function EarningDeductionTypes() {
    const [items, setItems] = useState<EarningDeductionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<EarningDeductionType | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<'Earning' | 'Deduction'>('Earning');
    const [formTaxable, setFormTaxable] = useState(false);
    const [formDescription, setFormDescription] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'All' | 'Earning' | 'Deduction'>('All');
    const [currentPage, setCurrentPage] = useState(1);

    // Selected items for bulk delete
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/earning-deduction-types');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to load earning/deduction types", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingItem(null);
        setFormName('');
        setFormType('Earning');
        setFormTaxable(false);
        setFormDescription('');
        setIsModalOpen(true);
    };

    const handleEditClick = (item: EarningDeductionType) => {
        setEditingItem(item);
        setFormName(item.name);
        setFormType(item.type);
        setFormTaxable(item.taxable);
        setFormDescription(item.description || '');
        setIsModalOpen(true);
    };

    const handleSave = async (addMore = false) => {
        if (!formName.trim()) {
            alert('Component Name is required.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                name: formName.trim(),
                type: formType,
                taxable: formTaxable,
                description: formDescription.trim() || null
            };

            let res;
            if (editingItem) {
                res = await fetch(`/api/earning-deduction-types/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/earning-deduction-types', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                await fetchData();
                if (addMore) {
                    setFormName('');
                    setFormDescription('');
                    setEditingItem(null);
                } else {
                    setIsModalOpen(false);
                }
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save component');
            }
        } catch (error) {
            console.error("Error saving component", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this component?")) return;
        try {
            const res = await fetch(`/api/earning-deduction-types/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
                selectedIds.delete(id);
                setSelectedIds(new Set(selectedIds));
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete component.");
            }
        } catch (error) {
            console.error("Error deleting component", error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Delete ${selectedIds.size} selected component(s)?`)) return;

        for (const id of selectedIds) {
            try {
                await fetch(`/api/earning-deduction-types/${id}`, { method: 'DELETE' });
            } catch (e) {
                console.error(`Failed to delete ID ${id}`, e);
            }
        }
        setSelectedIds(new Set());
        await fetchData();
    };

    const handleToggleStatus = async (id: number) => {
        try {
            const res = await fetch(`/api/earning-deduction-types/${id}/toggle`, { method: 'PATCH' });
            if (res.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Error toggling status", error);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    };

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Filter and paginate
    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'All' || item.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const earningCount = items.filter(i => i.type === 'Earning').length;
    const deductionCount = items.filter(i => i.type === 'Deduction').length;

    return (
        <div className="earning-deduction-layout">
            {/* Header */}
            <div className="ed-header-bar">
                <div className="ed-header-left">
                    <Layers size={24} color="#3b82f6" />
                    <h1>Earning / Deduction Types</h1>
                </div>
                <div className="ed-header-actions">
                    {selectedIds.size > 0 && (
                        <button className="btn-delete-all" onClick={handleBulkDelete}>
                            <Trash2 size={16} /> Delete ({selectedIds.size})
                        </button>
                    )}
                    <button className="btn-add" onClick={handleAddClick}>
                        <Plus size={16} /> Add Component
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="ed-stats-row">
                <div className="ed-stat-chip total">
                    <Layers size={14} /> Total: {items.length}
                </div>
                <div className="ed-stat-chip earning">
                    <TrendingUp size={14} /> Earnings: {earningCount}
                </div>
                <div className="ed-stat-chip deduction">
                    <TrendingDown size={14} /> Deductions: {deductionCount}
                </div>
            </div>

            {/* Table Card */}
            <div className="table-card">
                {/* Search & Filter */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="ed-search-box">
                        <Search size={16} className="ed-search-icon" />
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <select
                        className="ed-type-filter"
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value as 'All' | 'Earning' | 'Deduction'); setCurrentPage(1); }}
                    >
                        <option value="All">All Types</option>
                        <option value="Earning">Earnings Only</option>
                        <option value="Deduction">Deductions Only</option>
                    </select>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    checked={filteredItems.length > 0 && selectedIds.size === filteredItems.length}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th style={{ width: '60px' }}>#</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Taxable</th>
                            <th>Status</th>
                            <th style={{ width: '140px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading components...</div>
                                </td>
                            </tr>
                        ) : paginatedItems.length > 0 ? (
                            paginatedItems.map((item, index) => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                        />
                                    </td>
                                    <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td><strong>{item.name}</strong></td>
                                    <td>
                                        <span className={item.type === 'Earning' ? 'type-earning' : 'type-deduction'}>
                                            {item.type === 'Earning' ? <TrendingUp size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> : <TrendingDown size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />}
                                            {item.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={item.taxable ? 'taxable-yes' : 'taxable-no'}>
                                            {item.taxable ? 'Yes' : 'No'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="status-toggle-btn"
                                            onClick={() => handleToggleStatus(item.id)}
                                            title={`Click to ${item.status === 'Active' ? 'deactivate' : 'activate'}`}
                                        >
                                            {item.status === 'Active' ? (
                                                <ToggleRight size={28} color="#22c55e" />
                                            ) : (
                                                <ToggleLeft size={28} color="#94a3b8" />
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(item)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(item.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No components found. Click "Add Component" to create one.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="ed-pagination">
                        <div className="ed-pagination-info">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
                        </div>
                        <div className="ed-pagination-buttons">
                            <button className="ed-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`ed-page-btn ${page === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                            <button className="ed-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <CirclePlus size={20} className="text-blue" />
                                {editingItem ? 'Edit Component' : 'Add Earning / Deduction'}
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Component Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Basic Salary, PF, HRA..."
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Type <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        className="form-select"
                                        value={formType}
                                        onChange={e => setFormType(e.target.value as 'Earning' | 'Deduction')}
                                    >
                                        <option value="Earning">Earning</option>
                                        <option value="Deduction">Deduction</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Taxable</label>
                                    <select
                                        className="form-select"
                                        value={formTaxable ? 'Yes' : 'No'}
                                        onChange={e => setFormTaxable(e.target.value === 'Yes')}
                                    >
                                        <option value="Yes">Yes</option>
                                        <option value="No">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Optional description..."
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            {!editingItem && (
                                <button className="btn-save-more" onClick={() => handleSave(true)} disabled={isSaving}>
                                    <CirclePlus size={16} />
                                    Save & Add More
                                </button>
                            )}
                            <button className="btn-save" onClick={() => handleSave(false)} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
