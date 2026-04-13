import { useState, useMemo, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Check, X, Award, FolderTree, Building, Briefcase } from 'lucide-react';
import axios from '../../lib/axios';
import './designations.css';

interface Branch { id: number; name: string; }
interface Department { id: number; name: string; branch_id: number; }
interface SubDepartment { id: number; name: string; department_id: number; }
interface Designation { id: number; name: string; sub_department_id: number; order_index: number; }

export default function Designations() {
    // --- Live Data State ---
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subDepts, setSubDepts] = useState<SubDepartment[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [branchesRes, deptsRes, subDeptsRes, desigRes] = await Promise.all([
                axios.get('/branches'),
                axios.get('/departments'),
                axios.get('/sub-departments'),
                axios.get('/designations')
            ]);
            setBranches(branchesRes.data);
            setDepartments(deptsRes.data);
            setSubDepts(subDeptsRes.data);
            setDesignations(desigRes.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            alert('Failed to load data from server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Form State (3-Tier Cascade)
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [selectedSubDeptId, setSelectedSubDeptId] = useState<string>('');
    const [numToCreate, setNumToCreate] = useState<number | ''>('');
    const [newNames, setNewNames] = useState<string[]>([]);

    // Edit & Reorder State
    const [isReordering, setIsReordering] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    // --- Dynamic Filters (Cascading) ---
    const filteredDepartments = useMemo(() => {
        if (!selectedBranchId) return [];
        return departments.filter(d => d.branch_id === parseInt(selectedBranchId));
    }, [selectedBranchId, departments]);

    const filteredSubDepts = useMemo(() => {
        if (!selectedDeptId) return [];
        return subDepts.filter(sd => sd.department_id === parseInt(selectedDeptId));
    }, [selectedDeptId, subDepts]);

    // Cascading Resets
    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBranchId(e.target.value);
        setSelectedDeptId('');
        setSelectedSubDeptId('');
    };

    const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDeptId(e.target.value);
        setSelectedSubDeptId('');
    };

    // --- Form Logic ---
    const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (isNaN(val) || val <= 0) {
            setNumToCreate('');
            setNewNames([]);
            return;
        }
        setNumToCreate(val);
        setNewNames(Array(val).fill(''));
    };

    const handleNameChange = (index: number, value: string) => {
        const updated = [...newNames];
        updated[index] = value;
        setNewNames(updated);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedBranchId || !selectedDeptId || !selectedSubDeptId) {
            alert("Please select a Branch, Department, and Sub-Department.");
            return;
        }

        const validNames = newNames.map(n => n.trim()).filter(n => n !== '');
        if (validNames.length !== numToCreate) {
            alert("All designation names must be filled out.");
            return;
        }

        try {
            await axios.post('/designations/bulk', {
                sub_department_id: selectedSubDeptId,
                names: validNames
            });

            // Refresh data
            const response = await axios.get('/designations');
            setDesignations(response.data);

            // Reset form
            setSelectedBranchId('');
            setSelectedDeptId('');
            setSelectedSubDeptId('');
            setNumToCreate('');
            setNewNames([]);
            alert(`${validNames.length} Designation(s) added successfully!`);
        } catch (error: any) {
            console.error('Error adding designations:', error);
            alert(error.response?.data?.error || 'Failed to add designations.');
        }
    };

    // --- Item Actions ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this Designation?")) return;

        try {
            await axios.delete(`/designations/${id}`);
            setDesignations(designations.filter(d => d.id !== id));
        } catch (error: any) {
            console.error('Error deleting designation:', error);
            alert('Failed to delete designation.');
        }
    };

    const startEditing = (d: Designation) => {
        setEditingId(d.id);
        setEditName(d.name);
    };

    const saveEdit = async () => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await axios.put(`/designations/${editingId}`, { name: editName.trim() });
            setDesignations(designations.map(d => d.id === editingId ? { ...d, name: editName.trim() } : d));
            setEditingId(null);
            setEditName('');
        } catch (error: any) {
            console.error('Error updating designation:', error);
            alert('Failed to update designation.');
        }
    };

    const moveDesig = async (subDeptId: number, index: number, direction: 'up' | 'down') => {
        const itemsInGroup = designations.filter(d => d.sub_department_id === subDeptId).sort((a, b) => a.order_index - b.order_index);
        const updatedItems = [...itemsInGroup];

        if (direction === 'up' && index > 0) {
            [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
        } else if (direction === 'down' && index < itemsInGroup.length - 1) {
            [updatedItems[index + 1], updatedItems[index]] = [updatedItems[index], updatedItems[index + 1]];
        } else {
            return;
        }

        // Optimistic Update
        const newArray = designations.map(d => {
            const found = updatedItems.find(item => item.id === d.id);
            if (found) {
                return { ...d, order_index: updatedItems.indexOf(found) };
            }
            return d;
        });
        setDesignations(newArray);

        // API Call
        try {
            const orderedIds = updatedItems.map(item => item.id);
            await axios.put('/designations/action/reorder', { orderedIds });
        } catch (error: any) {
            console.error('Error reordering designations:', error);
            alert('Failed to save order.');
            fetchInitialData(); // Revert
        }
    };

    // --- Deep Hierarchy Rendering (Branch -> Dept -> SubDept -> Designations) ---
    const renderHierarchy = () => {
        if (isLoading) {
            return <div className="empty-state">Loading hierarchy from server...</div>;
        }

        if (designations.length === 0) {
            return <div className="empty-state">No Designations found. Complete the form to add some.</div>;
        }

        // Extremely nested map to match user requirements perfectly
        return branches.map(branch => {
            const branchDepts = departments.filter(d => d.branch_id === branch.id);

            // Check if this branch actually has any designations beneath it
            const hasDesignationsInBranch = designations.some(desig => {
                const parentSub = subDepts.find(sd => sd.id === desig.sub_department_id);
                if (!parentSub) return false;
                const parentDept = departments.find(d => d.id === parentSub.department_id);
                return parentDept?.branch_id === branch.id;
            });

            if (!hasDesignationsInBranch) return null;

            return (
                <div key={branch.id} className="hier-branch-block">
                    <h2 className="hier-branch-title"><Building size={20} /> {branch.name}</h2>

                    {branchDepts.map(dept => {
                        const deptSubs = subDepts.filter(sd => sd.department_id === dept.id);

                        // Check if this dept has designations
                        const hasDesignationsInDept = designations.some(desig => {
                            const parentSub = subDepts.find(sd => sd.id === desig.sub_department_id);
                            return parentSub?.department_id === dept.id;
                        });

                        if (!hasDesignationsInDept) return null;

                        return (
                            <div key={dept.id} className="hier-dept-block">
                                <h3 className="hier-dept-title"><FolderTree size={16} /> {dept.name}</h3>

                                <div className="hier-sub-grid">
                                    {deptSubs.map(subDept => {
                                        const subDesignations = designations
                                            .filter(d => d.sub_department_id === subDept.id)
                                            .sort((a, b) => a.order_index - b.order_index);

                                        if (subDesignations.length === 0) return null;

                                        return (
                                            <div key={subDept.id} className="hier-subdept-card">
                                                <div className="hier-subdept-header">
                                                    <h4>{subDept.name}</h4>
                                                    <span className="badge">{subDesignations.length} Roles</span>
                                                </div>

                                                <div className="designations-list">
                                                    {subDesignations.map((desig, index) => (
                                                        <div className="desig-item" key={desig.id}>
                                                            <div className="desig-left">
                                                                <Award size={14} className="desig-icon" />
                                                                {editingId === desig.id ? (
                                                                    <div className="item-edit-mode">
                                                                        <input
                                                                            autoFocus
                                                                            value={editName}
                                                                            onChange={e => setEditName(e.target.value)}
                                                                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                                        />
                                                                        <button onClick={saveEdit} className="btn-icon text-green p-0"><Check size={14} /></button>
                                                                        <button onClick={() => setEditingId(null)} className="btn-icon text-gray p-0"><X size={14} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="desig-name">{desig.name}</span>
                                                                )}
                                                            </div>

                                                            {!isReordering && editingId !== desig.id && (
                                                                <div className="item-actions">
                                                                    <button onClick={() => startEditing(desig)} className="btn-icon text-blue p-0" title="Edit"><Edit2 size={12} /></button>
                                                                    <button onClick={() => handleDelete(desig.id)} className="btn-icon text-red p-0" title="Delete"><Trash2 size={12} /></button>
                                                                </div>
                                                            )}

                                                            {isReordering && (
                                                                <div className="reorder-actions-small">
                                                                    <button onClick={() => moveDesig(subDept.id, index, 'up')} disabled={index === 0}>▲</button>
                                                                    <button onClick={() => moveDesig(subDept.id, index, 'down')} disabled={index === subDesignations.length - 1}>▼</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        });
    };

    return (
        <div className="setup-container">
            <div className="setup-header">
                <div>
                    <h1><Briefcase className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Designations</h1>
                    <p>Assign and manage specific job titles grouped by Sub-Departments</p>
                </div>
                <div className="actions-row">
                    <button className={`btn-secondary ${isReordering ? 'active-reorder' : ''}`} onClick={() => { setIsReordering(!isReordering); setEditingId(null); }}>
                        <GripVertical size={16} />
                        {isReordering ? 'Done Reordering' : 'Change Order'}
                    </button>
                </div>
            </div>

            <div className="designations-layout">
                {/* Multi-Tier Tree List Area */}
                <div className="list-area">
                    {renderHierarchy()}
                </div>

                {/* Extended Cascade Form Area */}
                <div className="add-form-card">
                    <h3>Add Designation</h3>

                    <div className="form-group">
                        <label>Select Branch *</label>
                        <select value={selectedBranchId} onChange={handleBranchChange} required>
                            <option value="">-- Choose Branch --</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Department *</label>
                        <select
                            value={selectedDeptId}
                            onChange={handleDeptChange}
                            required
                            disabled={!selectedBranchId}
                            className={!selectedBranchId ? 'disabled-input' : ''}
                        >
                            <option value="">-- Choose Department --</option>
                            {filteredDepartments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Select Sub-Department *</label>
                        <select
                            value={selectedSubDeptId}
                            onChange={(e) => setSelectedSubDeptId(e.target.value)}
                            required
                            disabled={!selectedDeptId}
                            className={!selectedDeptId ? 'disabled-input' : ''}
                        >
                            <option value="">-- Choose Sub-Department --</option>
                            {filteredSubDepts.map(sd => (
                                <option key={sd.id} value={sd.id}>{sd.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number of Job Titles *</label>
                        <input
                            type="number"
                            min="1"
                            max="30"
                            value={numToCreate}
                            onChange={handleNumChange}
                            placeholder="e.g. 2"
                            disabled={!selectedSubDeptId}
                            className={`num-input ${!selectedSubDeptId ? 'disabled-input' : ''}`}
                        />
                    </div>

                    {typeof numToCreate === 'number' && numToCreate > 0 && selectedSubDeptId && (
                        <form onSubmit={handleAdd} className="multi-inputs-container">
                            <div className="inputs-grid-scroll">
                                {newNames.map((name, index) => (
                                    <div className="form-group" key={index}>
                                        <label>Job Title {index + 1} *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => handleNameChange(index, e.target.value)}
                                            required
                                            placeholder={`e.g. Senior Designer`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn-save" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                <Plus size={18} />
                                Save {numToCreate} Designation(s)
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
