import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Layers, CirclePlus, ToggleLeft, ToggleRight, Filter
} from 'lucide-react';
import './visitors.css';

interface VisitorSubType {
    id: number;
    name: string;
    category: string;
    status: 'Active' | 'Inactive';
}

const CATEGORIES = ['Interview', 'Delivery', 'Transport', 'Services', 'Others'];

export default function VisitorSubTypePage() {
    const [types, setTypes] = useState<VisitorSubType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<VisitorSubType | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('Others');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/visitors/sub-types');
            if (res.ok) {
                const data = await res.json();
                setTypes(data);
            }
        } catch (error) {
            console.error("Failed to fetch visitor sub-types", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingType(null);
        setFormName('');
        setFormCategory('Others');
        setIsModalOpen(true);
    };

    const handleEditClick = (type: VisitorSubType) => {
        setEditingType(type);
        setFormName(type.name);
        setFormCategory(type.category);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) return alert("Name is required");

        setIsSaving(true);
        try {
            const payload = {
                name: formName.trim(),
                category: formCategory,
            };

            const url = editingType ? `/api/visitors/sub-types/${editingType.id}` : '/api/visitors/sub-types';
            const method = editingType ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchTypes();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.message || "Failed to save category");
            }
        } catch (error) {
            console.error("Error saving visitor category", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure? This will affect historical reports.")) return;
        try {
            const res = await fetch(`/api/visitors/sub-types/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTypes();
        } catch (error) {
            console.error("Error deleting category", error);
        }
    };

    const filteredTypes = types.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="visitors-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <Layers size={24} color="#3b82f6" />
                    <h1>Visitor Sub Types</h1>
                </div>
                <div className="bgv-header-actions">
                    <button className="btn-add" onClick={handleAddClick}>
                        <Plus size={16} /> Add Sub Type
                    </button>
                </div>
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
                            <th style={{ width: '80px' }}>#</th>
                            <th>Sub Type Name</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Refreshing categories...</div>
                                </td>
                            </tr>
                        ) : filteredTypes.length > 0 ? (
                            filteredTypes.map((type, index) => (
                                <tr key={type.id} className="fade-in">
                                    <td>{index + 1}</td>
                                    <td><strong>{type.name}</strong></td>
                                    <td>
                                        <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                                            {type.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${type.status === 'Active' ? 'verified' : 'not-started'}`}>
                                            {type.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(type)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(type.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No visitor types found. Add your first category!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '24px' }}>
                        <div className="modal-header">
                            <h3>
                                <CirclePlus size={20} className="text-blue" />
                                {editingType ? 'Edit Sub Type' : 'Add Visitor Sub Type'}
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Sub Type Name (e.g. Swiggy, Interview, etc.) <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Enter name..." 
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Main Category <span style={{ color: '#ef4444' }}>*</span></label>
                                <select 
                                    className="form-select" 
                                    value={formCategory}
                                    onChange={e => setFormCategory(e.target.value)}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : (editingType ? 'Update' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
