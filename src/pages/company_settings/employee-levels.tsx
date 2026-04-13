import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GitMerge , Layers} from 'lucide-react';
import api from '../../lib/axios';
import './employee-levels.css';

interface EmployeeLevel {
    id: number;
    name: string;
    parent_id: number | null;
    order_index: number;
    parent?: { id: number; name: string };
    children?: EmployeeLevel[];
}

export default function EmployeeLevels() {
    const [levels, setLevels] = useState<EmployeeLevel[]>([]);
    const [tree, setTree] = useState<EmployeeLevel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showHierarchy, setShowHierarchy] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [formData, setFormData] = useState<{ name: string; parent_id: number | '' }>({ name: '', parent_id: '' });

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        setIsLoading(true);
        try {
            const [flatRes, treeRes] = await Promise.all([
                api.get('/employee-levels'),
                api.get('/employee-levels/hierarchy')
            ]);
            setLevels(flatRes.data);
            setTree(treeRes.data);
        } catch (error) {
            console.error('Failed to load employee levels');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name) return alert('Name is required');

        const payload = {
            name: formData.name,
            parent_id: formData.parent_id === '' ? null : Number(formData.parent_id)
        };

        try {
            if (editingId) {
                await api.put(`/employee-levels/${editingId}`, payload);
            } else {
                await api.post('/employee-levels', payload);
            }
            fetchLevels();
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', parent_id: '' });
        } catch (error: any) {
            alert(error.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this Level? Cannot delete if it has child levels.")) return;
        try {
            await api.delete(`/employee-levels/${id}`);
            fetchLevels();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete level.');
        }
    };

    // Recursive component to render tree graph
    const renderTree = (nodes: EmployeeLevel[]) => {
        if (!nodes || nodes.length === 0) return null;
        return (
            <ul className="el-tree">
                {nodes.map(node => (
                    <li key={node.id} className="el-node">
                        <div className="el-node-content">
                            <div className="el-node-icon">
                                <Layers size={14} />
                            </div>
                            <span className="el-node-name">{node.name}</span>
                        </div>
                        {node.children && node.children.length > 0 && renderTree(node.children)}
                    </li>
                ))}
            </ul>
        );
    };

    if (isLoading) return <div style={{ padding: '2rem' }}>Loading Hierarchy...</div>;

    return (
        <div className="el-container">
            <div className="el-header">
                <div>
                    <h1><Layers className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Employee Levels</h1>
                    <p>Manage the reporting hierarchy structure for all employees</p>
                </div>
                <div className="el-header-actions">
                    <button className="btn-cancel" onClick={() => setShowHierarchy(!showHierarchy)}>
                        <GitMerge size={18} />
                        {showHierarchy ? 'Hide Hierarchy' : 'View Hierarchy'}
                    </button>
                    <button className="btn-add" onClick={() => {
                        setIsAdding(true);
                        setEditingId(null);
                        setFormData({ name: '', parent_id: '' });
                    }}>
                        <Plus size={18} />
                        Add Level
                    </button>
                </div>
            </div>

            {showHierarchy && (
                <div className="el-tree-card">
                    <h3><GitMerge size={18} color="#3b82f6" /> Hierarchy Organization Chart</h3>
                    <div className="el-tree-container">
                        {tree.length > 0 ? renderTree(tree) : <p style={{ color: '#94a3b8' }}>No levels created yet.</p>}
                    </div>
                </div>
            )}

            <div className="el-layout">
                {/* List Column */}
                <div className="el-list-card" style={{ flex: isAdding ? '2' : '1' }}>
                    <h2>Hierarchy Table</h2>
                    <div className="el-list">
                        {levels.map((level) => (
                            <div key={level.id} className="el-item">
                                <div className="el-left">
                                    <div className="el-icon">
                                        <Layers size={24} />
                                    </div>
                                    <div className="el-details">
                                        <h4>{level.name}</h4>
                                        <p>
                                            {level.parent ? (
                                                <>Reports to: <span className="el-badge">{level.parent.name}</span></>
                                            ) : (
                                                <span className="el-badge root">Top Level (Root)</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="el-actions">
                                    <button
                                        className="btn-icon"
                                        title="Add Child Level"
                                        onClick={() => {
                                            setIsAdding(true);
                                            setEditingId(null);
                                            setFormData({ name: '', parent_id: level.id });
                                        }}
                                    >
                                        <Plus size={16} color="#10b981" />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        title="Edit"
                                        onClick={() => {
                                            setEditingId(level.id);
                                            setIsAdding(true);
                                            setFormData({ name: level.name, parent_id: level.parent_id || '' });
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-delete"
                                        title="Delete"
                                        onClick={() => handleDelete(level.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {levels.length === 0 && <p style={{ color: '#64748b', padding: '1rem', textAlign: 'center' }}>No employee levels exist yet.</p>}
                    </div>
                </div>

                {/* Form Column */}
                {isAdding && (
                    <div className="el-form-card" style={{ flex: '1' }}>
                        <h2>{editingId ? 'Edit Level' : 'Add New Level'}</h2>
                        <div className="form-group">
                            <label>Level Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Senior Manager"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label>Parent Level (Optional)</label>
                            <select
                                value={formData.parent_id === null ? "" : formData.parent_id}
                                onChange={e => setFormData({ ...formData, parent_id: e.target.value === "" ? '' : Number(e.target.value) })}
                            >
                                <option value="">-- None (Make Top-Level) --</option>
                                {levels.filter(l => l.id !== editingId).map(lvl => (
                                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                                ))}
                            </select>
                            <small style={{ color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                                If blank, this level will report to no one (e.g. CEO).
                            </small>
                        </div>
                        <div className="form-actions">
                            <button className="btn-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>
                                {editingId ? 'Update' : 'Save'} Level
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
