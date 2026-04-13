import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Layers, CirclePlus, ToggleLeft, ToggleRight
} from 'lucide-react';
import './bgv.css';

interface VerificationType {
    id: number;
    name: string;
    description: string | null;
    status: 'Active' | 'Inactive';
}

export default function VerificationTypes() {
    const [types, setTypes] = useState<VerificationType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<VerificationType | null>(null);

    // Form State
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/bgv/types');
            if (res.ok) {
                const data = await res.json();
                setTypes(data);
            }
        } catch (error) {
            console.error("Failed to fetch verification types", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingType(null);
        setFormName('');
        setFormDescription('');
        setIsModalOpen(true);
    };

    const handleEditClick = (type: VerificationType) => {
        setEditingType(type);
        setFormName(type.name);
        setFormDescription(type.description || '');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formName.trim()) return alert("Name is required");

        setIsSaving(true);
        try {
            const payload = {
                name: formName.trim(),
                description: formDescription.trim() || null,
            };

            const url = editingType ? `/api/bgv/types/${editingType.id}` : '/api/bgv/types';
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
                alert(err.message || "Failed to save verification type");
            }
        } catch (error) {
            console.error("Error saving verification type", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this verification type?")) return;
        try {
            const res = await fetch(`/api/bgv/types/${id}`, { method: 'DELETE' });
            if (res.ok) fetchTypes();
        } catch (error) {
            console.error("Error deleting verification type", error);
        }
    };

    const filteredTypes = types.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bgv-layout">
            <div className="bgv-header-bar">
                <div className="bgv-header-left">
                    <Layers size={24} color="#3b82f6" />
                    <h1>Verification Types</h1>
                </div>
                <div className="bgv-header-actions">
                    <button className="btn-add" onClick={handleAddClick}>
                        <Plus size={16} /> Add Type
                    </button>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                    <div className="bgv-search-box" style={{ maxWidth: '400px' }}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search verification types..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>#</th>
                            <th>Type Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading types...</div>
                                </td>
                            </tr>
                        ) : filteredTypes.length > 0 ? (
                            filteredTypes.map((type, index) => (
                                <tr key={type.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{type.name}</strong></td>
                                    <td>{type.description || <span style={{ color: '#94a3b8' }}>No description</span>}</td>
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
                                    No verification types found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>
                                <CirclePlus size={20} className="text-blue" />
                                {editingType ? 'Edit Type' : 'Add Verification Type'}
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Verification Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. Identity Proof, Address..." 
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Enter details..." 
                                    rows={3}
                                    value={formDescription}
                                    onChange={e => setFormDescription(e.target.value)}
                                />
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
