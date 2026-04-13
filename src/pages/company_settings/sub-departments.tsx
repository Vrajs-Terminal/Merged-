import { useState, useMemo, useEffect } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Check, X, FolderTree , List} from 'lucide-react';
import axios from '../../lib/axios';
import './sub-departments.css';

interface Branch { id: number; name: string; }
interface Department { id: number; name: string; branch_id: number; }
interface SubDepartment { id: number; name: string; department_id: number; order_index: number; }

export default function SubDepartments() {
    // --- Live Data State ---
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subDepts, setSubDepts] = useState<SubDepartment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [branchesRes, deptsRes, subDeptsRes] = await Promise.all([
                axios.get('/branches'),
                axios.get('/departments'),
                axios.get('/sub-departments')
            ]);
            setBranches(branchesRes.data);
            setDepartments(deptsRes.data);
            setSubDepts(subDeptsRes.data);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            alert('Failed to load data from server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Form State
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [selectedDeptId, setSelectedDeptId] = useState<string>('');
    const [numToCreate, setNumToCreate] = useState<number | ''>('');
    const [newNames, setNewNames] = useState<string[]>([]);

    // Edit & Reorder State
    const [isReordering, setIsReordering] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');

    // --- Dynamic Filters ---
    const filteredDepartments = useMemo(() => {
        if (!selectedBranchId) return [];
        return departments.filter(d => d.branch_id === parseInt(selectedBranchId));
    }, [selectedBranchId, departments]);

    // When Branch changes, reset Department selection
    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBranchId(e.target.value);
        setSelectedDeptId('');
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

        if (!selectedBranchId || !selectedDeptId) {
            alert("Please select both a Branch and a Department.");
            return;
        }

        const validNames = newNames.map(n => n.trim()).filter(n => n !== '');
        if (validNames.length !== numToCreate) {
            alert("All sub-department names must be filled out.");
            return;
        }

        try {
            await axios.post('/sub-departments/bulk', {
                department_id: selectedDeptId,
                names: validNames
            });

            // Refresh data
            const response = await axios.get('/sub-departments');
            setSubDepts(response.data);

            // Reset form
            setSelectedBranchId('');
            setSelectedDeptId('');
            setNumToCreate('');
            setNewNames([]);
            alert(`${validNames.length} Sub-Department(s) added successfully!`);
        } catch (error: any) {
            console.error('Error adding sub-departments:', error);
            alert(error.response?.data?.error || 'Failed to add sub-departments.');
        }
    };

    // --- Item Actions ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this Sub-Department?")) return;

        try {
            await axios.delete(`/sub-departments/${id}`);
            setSubDepts(subDepts.filter(sd => sd.id !== id));
        } catch (error: any) {
            console.error('Error deleting sub-department:', error);
            alert(error.response?.data?.error || 'Failed to delete sub-department.');
        }
    };

    const startEditing = (sd: SubDepartment) => {
        setEditingId(sd.id);
        setEditName(sd.name);
    };

    const saveEdit = async () => {
        if (!editName.trim()) {
            setEditingId(null);
            return;
        }

        try {
            await axios.put(`/sub-departments/${editingId}`, { name: editName.trim() });
            setSubDepts(subDepts.map(sd => sd.id === editingId ? { ...sd, name: editName.trim() } : sd));
            setEditingId(null);
            setEditName('');
        } catch (error: any) {
            console.error('Error updating sub-department:', error);
            alert(error.response?.data?.error || 'Failed to update sub-department.');
        }
    };

    const moveSubDept = async (departmentId: number, index: number, direction: 'up' | 'down') => {
        const itemsInGroup = subDepts.filter(sd => sd.department_id === departmentId).sort((a, b) => a.order_index - b.order_index);
        const updatedItems = [...itemsInGroup];

        if (direction === 'up' && index > 0) {
            [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
        } else if (direction === 'down' && index < itemsInGroup.length - 1) {
            [updatedItems[index + 1], updatedItems[index]] = [updatedItems[index], updatedItems[index + 1]];
        } else {
            return;
        }

        // Optimistic update
        const newArray = subDepts.map(sd => {
            const found = updatedItems.find(item => item.id === sd.id);
            if (found) {
                // Ensure we use the index as the true order_index within the group
                return { ...sd, order_index: updatedItems.indexOf(found) };
            }
            return sd;
        });
        setSubDepts(newArray);

        try {
            const orderedIds = updatedItems.map(item => item.id);
            await axios.put('/sub-departments/action/reorder', { orderedIds });
        } catch (error: any) {
            console.error('Error reordering:', error);
            alert('Failed to save new order. Reverting.');
            const response = await axios.get('/sub-departments');
            setSubDepts(response.data);
        }
    };

    // --- Data Grouping ---
    const groupedData = departments.map(dept => {
        const items = subDepts
            .filter(sd => sd.department_id === dept.id)
            .sort((a, b) => a.order_index - b.order_index);
        return { department: dept, items };
    }).filter(group => group.items.length > 0);

    return (
        <div className="setup-container">
            <div className="setup-header">
                <div>
                    <h1><List className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Sub-Departments</h1>
                    <p>Organize sub-teams beneath their respective parent Departments.</p>
                </div>
                <div className="actions-row">
                    <button className={`btn-secondary ${isReordering ? 'active-reorder' : ''}`} onClick={() => { setIsReordering(!isReordering); setEditingId(null); }}>
                        <GripVertical size={16} />
                        {isReordering ? 'Done Reordering' : 'Change Order'}
                    </button>
                </div>
            </div>

            <div className="subdept-layout">
                {/* Visual List Area */}
                <div className="list-area">
                    {isLoading ? (
                        <div className="empty-state">Loading data from server...</div>
                    ) : groupedData.length === 0 ? (
                        <div className="empty-state">No Sub-Departments found. Add one using the form.</div>
                    ) : (
                        groupedData.map((group) => (
                            <div key={group.department.id} className="dept-group-card">
                                <div className="dept-group-header">
                                    <FolderTree size={18} className="text-blue" />
                                    <h3>{group.department.name}</h3>
                                    <span className="badge">{group.items.length} Teams</span>
                                </div>

                                <div className="items-grid">
                                    {group.items.map((sd, index) => (
                                        <div className="list-item" key={sd.id}>
                                            <div className="item-left">
                                                {editingId === sd.id ? (
                                                    <div className="item-edit-mode">
                                                        <input
                                                            autoFocus
                                                            value={editName}
                                                            onChange={e => setEditName(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && saveEdit()}
                                                        />
                                                        <button onClick={saveEdit} className="btn-icon text-green"><Check size={16} /></button>
                                                        <button onClick={() => setEditingId(null)} className="btn-icon text-gray"><X size={16} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="item-details">
                                                        <h4>{sd.name}</h4>
                                                    </div>
                                                )}
                                            </div>

                                            {!isReordering && editingId !== sd.id && (
                                                <div className="item-actions">
                                                    <button onClick={() => startEditing(sd)} className="btn-icon text-blue" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(sd.id)} className="btn-icon text-red" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            {isReordering && (
                                                <div className="reorder-actions">
                                                    <button onClick={() => moveSubDept(group.department.id, index, 'up')} disabled={index === 0}>▲</button>
                                                    <button onClick={() => moveSubDept(group.department.id, index, 'down')} disabled={index === group.items.length - 1}>▼</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Form Area */}
                <div className="add-form-card">
                    <h3>Add Sub-Department</h3>

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
                            onChange={(e) => setSelectedDeptId(e.target.value)}
                            required
                            disabled={!selectedBranchId}
                        >
                            <option value="">-- Choose Department --</option>
                            {filteredDepartments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Number to Create *</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={numToCreate}
                            onChange={handleNumChange}
                            placeholder="e.g. 3"
                            disabled={!selectedDeptId}
                            className={`num-input ${!selectedDeptId ? 'disabled-input' : ''}`}
                        />
                    </div>

                    {typeof numToCreate === 'number' && numToCreate > 0 && selectedDeptId && (
                        <form onSubmit={handleAdd} className="multi-inputs-container">
                            <div className="inputs-grid-scroll">
                                {newNames.map((name, index) => (
                                    <div className="form-group" key={index}>
                                        <label>Sub-Department {index + 1} Name *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => handleNameChange(index, e.target.value)}
                                            required
                                            placeholder={`e.g. Sub-Dept ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn-save" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                                <Plus size={18} />
                                Save {numToCreate} Sub-Department(s)
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
