import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Network } from 'lucide-react';
import api from '../../lib/axios';
import { Building2 } from 'lucide-react';
import './sister-companies.css';

interface Company {
    id: number;
    name: string;
    code: string | null;
    status: string;
    order_index: number;
}

export default function SisterCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({ name: '', code: '', status: 'Active' });

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const res = await api.get('/companies');
            setCompanies(res.data);
        } catch (error) {
            console.error('Failed to load companies');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');

        try {
            if (editingId) {
                await api.put(`/companies/${editingId}`, formData);
            } else {
                await api.post('/companies', formData);
            }
            fetchCompanies();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', code: '', status: 'Active' });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this Company? If branches exist under it, it will fail.")) return;
        try {
            await api.delete(`/companies/${id}`);
            setCompanies(companies.filter(c => c.id !== id));
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete company.');
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === companies.length - 1)) return;

        const newOrder = [...companies];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

        // Update exact order indices
        const updatedItems = newOrder.map((item, i) => ({ ...item, order_index: i }));
        setCompanies(updatedItems);

        try {
            await api.put('/companies/reorder/update', { items: updatedItems });
        } catch (error) {
            console.error('Failed to save order');
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading Companies...</div>;

    return (
        <div className="sister-companies-container">
            <div className="sc-header">
                <div>
                    <h1><Network className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Sister Companies</h1>
                    <p>Manage all companies under your organization</p>
                </div>
                <button className="btn-add" onClick={() => {
                    setIsAdding(true);
                    setEditingId(null);
                    setFormData({ name: '', code: '', status: 'Active' });
                }}>
                    <Plus size={18} />
                    Add Company
                </button>
            </div>

            <div className="sc-layout">
                {/* List Column */}
                <div className="sc-list-card">
                    <h2>Company List</h2>
                    <div className="sc-list">
                        {companies.map((company, index) => (
                            <div key={company.id} className="sc-item">
                                <div className="sc-left">
                                    <div className="sc-handle">
                                        <div className="order-arrows">
                                            <button onClick={() => handleMove(index, 'up')} disabled={index === 0}>▲</button>
                                            <button onClick={() => handleMove(index, 'down')} disabled={index === companies.length - 1}>▼</button>
                                        </div>
                                    </div>
                                    <div className="sc-icon">
                                        <Building2 size={24} />
                                    </div>
                                    <div className="sc-details">
                                        <h4>{company.name} {company.code && <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'normal' }}>({company.code})</span>}</h4>
                                        <span className={`sc-status ${company.status.toLowerCase()}`}>
                                            {company.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="sc-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => {
                                            setEditingId(company.id);
                                            setIsAdding(true);
                                            setFormData({ name: company.name, code: company.code || '', status: company.status });
                                        }}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => handleDelete(company.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {companies.length === 0 && <p style={{ color: '#64748b', padding: '1rem' }}>No sister companies configured.</p>}
                    </div>
                </div>

                {/* Form Column */}
                {isAdding && (
                    <div className="sc-form-card">
                        <h2>{editingId ? 'Edit Company' : 'Add New Company'}</h2>
                        <div className="form-group">
                            <label>Company Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. MineHR Solutions"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Company Code (Optional)</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. MHR-01 (Optional)"
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="form-actions">
                            <button className="btn-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>
                                {editingId ? 'Update' : 'Save'} Company
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
