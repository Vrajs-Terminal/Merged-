import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import api from '../../lib/axios';
import './employee-grades.css';

interface EmployeeGrade {
    id: number;
    name: string;
    code: string | null;
    status: string;
}

export default function EmployeeGrades() {
    const [grades, setGrades] = useState<EmployeeGrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState({ name: '', code: '', status: 'Active' });

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            const res = await api.get('/employee-grades');
            setGrades(res.data);
        } catch (error) {
            console.error('Failed to load grades');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');

        try {
            if (editingId) {
                await api.put(`/employee-grades/${editingId}`, formData);
            } else {
                await api.post('/employee-grades', formData);
            }
            fetchGrades();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', code: '', status: 'Active' });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this Grade?")) return;
        try {
            await api.delete(`/employee-grades/${id}`);
            fetchGrades();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete grade.');
        }
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading Grades...</div>;

    return (
        <div className="eg-container">
            <div className="eg-header">
                <div>
                    <h1><Award className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Employee Grades</h1>
                    <p>Configure grade categories linking to Expense, Travel, and Flight limits</p>
                </div>
                <button className="btn-add" onClick={() => {
                    setIsAdding(true);
                    setEditingId(null);
                    setFormData({ name: '', code: '', status: 'Active' });
                }}>
                    <Plus size={18} />
                    Add Grade
                </button>
            </div>

            <div className="eg-layout">
                {/* List Column */}
                <div className="eg-list-card" style={{ flex: isAdding ? '2' : '1' }}>
                    <h2>Grades List</h2>
                    <div className="eg-list">
                        {grades.map((grade) => (
                            <div key={grade.id} className="eg-item">
                                <div className="eg-left">
                                    <div className="eg-icon">
                                        <Award size={24} />
                                    </div>
                                    <div className="eg-details">
                                        <h4>{grade.name} {grade.code && <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 'normal' }}>({grade.code})</span>}</h4>
                                        <span className={`eg-status ${grade.status.toLowerCase()}`}>
                                            {grade.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="eg-actions">
                                    <button
                                        className="btn-icon"
                                        onClick={() => {
                                            setEditingId(grade.id);
                                            setIsAdding(true);
                                            setFormData({ name: grade.name, code: grade.code || '', status: grade.status });
                                        }}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        onClick={() => handleDelete(grade.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {grades.length === 0 && <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No employee grades configured yet.</p>}
                    </div>
                </div>

                {/* Form Column */}
                {isAdding && (
                    <div className="eg-form-card" style={{ flex: '1' }}>
                        <h2>{editingId ? 'Edit Grade' : 'Add New Grade'}</h2>
                        <div className="form-group">
                            <label>Grade Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Grade A"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Internal Code</label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                placeholder="e.g. GA-100"
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
                                {editingId ? 'Update' : 'Save'} Grade
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
