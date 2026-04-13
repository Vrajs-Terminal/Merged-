import { useState, useEffect } from 'react';
import {
    Plus, GripVertical, Building2, Layers, ChevronLeft, ChevronRight, Trash2
, Grid} from 'lucide-react';
import api from '../../lib/axios';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './departments.css';

interface Department {
    id: number;
    name: string;
}

interface BranchGroup {
    branchId: number;
    branchName: string;
    branchCode: string;
    departments: Department[];
}

export default function Departments() {
    // Initial State: Departments linked within Branches
    const [branchGroups, setBranchGroups] = useState<BranchGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDepartments = async () => {
        try {
            // The branches endpoint already includes the departments array
            const res = await api.get('/branches');
            const mappedGroups = res.data.map((b: any) => ({
                branchId: b.id,
                branchName: b.name,
                branchCode: b.code,
                departments: b.departments
            }));
            setBranchGroups(mappedGroups);

            // Set default dropdown selection if possible
            if (mappedGroups.length > 0 && selectedBranchId === 0) {
                setSelectedBranchId(mappedGroups[0].branchId);
            }
        } catch (error) {
            console.error('Failed to fetch departments', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Form State
    const [selectedBranchId, setSelectedBranchId] = useState<number>(0);
    const [deptCount, setDeptCount] = useState<number>(1);
    const [newDepartments, setNewDepartments] = useState<string[]>(['']);

    // Toggle Reorder Mode
    const [isReordering, setIsReordering] = useState(false);

    const moveDept = (branchId: number, deptIndex: number, direction: 'left' | 'right') => {
        setBranchGroups(prevGroups => prevGroups.map(group => {
            if (group.branchId !== branchId) return group;

            const newDepts = [...group.departments];
            if (direction === 'left' && deptIndex > 0) {
                [newDepts[deptIndex - 1], newDepts[deptIndex]] = [newDepts[deptIndex], newDepts[deptIndex - 1]];
            } else if (direction === 'right' && deptIndex < newDepts.length - 1) {
                [newDepts[deptIndex + 1], newDepts[deptIndex]] = [newDepts[deptIndex], newDepts[deptIndex + 1]];
            }
            return { ...group, departments: newDepts };
        }));
    };

    const handleDeptCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const count = parseInt(e.target.value) || 1;
        const validCount = Math.max(1, count); // At least 1
        setDeptCount(validCount);

        // Adjust the inputs array length safely
        if (validCount > newDepartments.length) {
            setNewDepartments([...newDepartments, ...Array(validCount - newDepartments.length).fill('')]);
        } else {
            setNewDepartments(newDepartments.slice(0, validCount));
        }
    };

    const handleDeptNameChange = (index: number, value: string) => {
        const updated = [...newDepartments];
        updated[index] = value;
        setNewDepartments(updated);
    };

    const handleAddDepartments = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty names
        const validNames = newDepartments.filter(n => n.trim() !== '');
        if (validNames.length === 0) {
            alert("Please enter at least one department name.");
            return;
        }

        try {
            // Execute multiple POST requests in parallel
            await Promise.all(validNames.map(name =>
                api.post('/departments', { name, branch_id: selectedBranchId })
            ));

            // Refresh the groups to ensure DB parity
            await fetchDepartments();

            // Reset form
            setDeptCount(1);
            setNewDepartments(['']);
            alert("Departments Added Successfully");
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to add departments");
        }
    };

    const handleDeleteDept = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;
        try {
            await api.delete(`/departments/${id}`);
            fetchDepartments(); // refresh list
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to delete department");
        }
    };

    if (isLoading) {
        return <div className="dept-container setup-container" style={{ padding: '2rem' }}>Loading departments...</div>;
    }

    return (
        <div className="dept-container setup-container">
            <div className="dept-header setup-header">
                <div>
                    <h1><Grid className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Departments</h1>
                    <p>Organize internal departments linked to specific branches</p>
                </div>
                <div className="actions-row" style={{ display: 'flex', gap: '8px' }}>
                    <ImportButton
                        onImport={(data) => {
                            console.log('Imported Depts:', data);
                        }}
                        label="Import"
                    />
                    <ExportButtons
                        data={branchGroups.flatMap(bg => bg.departments.map(d => ({
                            "Branch": bg.branchName,
                            "Branch Code": bg.branchCode,
                            "Department": d.name
                        })))}
                        fileName="Departments_List"
                        title="Company Departments"
                    />
                    <button className={`btn-secondary ${isReordering ? 'active-reorder' : ''}`} onClick={() => setIsReordering(!isReordering)}>
                        <GripVertical size={16} />
                        {isReordering ? 'Done Reordering' : 'Change Order'}
                    </button>
                </div>
            </div>

            <div className="dept-layout">
                {/* Visual Branch -> Departments Grouping */}
                <div className="branch-groups">
                    {branchGroups.map((group) => (
                        <div className="branch-group-card" key={group.branchId}>
                            <div className="bgc-header">
                                <h3><Building2 size={18} color="#3b82f6" /> {group.branchName} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400 }}>({group.branchCode})</span></h3>
                                <span className="bgc-badge">{group.departments.length} Departments</span>
                            </div>

                            <div className="dept-grid">
                                {group.departments.map((dept, deptIndex) => (
                                    <div className="dept-item-box" key={dept.id}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Layers size={16} color="#94a3b8" />
                                            <span>{dept.name}</span>
                                        </div>
                                        {isReordering ? (
                                            <div className="sort-actions-hz">
                                                <button
                                                    style={{ border: 'none', background: 'transparent', cursor: deptIndex === 0 ? 'not-allowed' : 'pointer', padding: '4px' }}
                                                    onClick={() => moveDept(group.branchId, deptIndex, 'left')}
                                                    disabled={deptIndex === 0}
                                                >
                                                    <ChevronLeft size={16} color={deptIndex === 0 ? '#cbd5e1' : '#64748b'} />
                                                </button>
                                                <button
                                                    style={{ border: 'none', background: 'transparent', cursor: deptIndex === group.departments.length - 1 ? 'not-allowed' : 'pointer', padding: '4px' }}
                                                    onClick={() => moveDept(group.branchId, deptIndex, 'right')}
                                                    disabled={deptIndex === group.departments.length - 1}
                                                >
                                                    <ChevronRight size={16} color={deptIndex === group.departments.length - 1 ? '#cbd5e1' : '#64748b'} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleDeleteDept(dept.id)}
                                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', padding: '4px' }}
                                                title="Delete Department"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {group.departments.length === 0 && (
                                    <p style={{ color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>No departments linked yet.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form to Add Multiple Departments */}
                <div className="dept-form-card" id="dept-form">
                    <h3>Add New Departments</h3>
                    <form onSubmit={handleAddDepartments}>
                        <div className="form-group">
                            <label>Select Branch *</label>
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(parseInt(e.target.value))}
                                required
                            >
                                {branchGroups.map(bg => (
                                    <option key={bg.branchId} value={bg.branchId}>
                                        {bg.branchName} ({bg.branchCode})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>How many departments to create?</label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={deptCount}
                                onChange={handleDeptCountChange}
                                required
                            />
                        </div>

                        <div className="dept-inputs-container" style={{ marginTop: '20px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                                Department Names
                            </label>
                            {newDepartments.map((deptName, index) => (
                                <div className="dept-input-row" key={index}>
                                    <span>{index + 1}</span>
                                    <input
                                        type="text"
                                        placeholder={`e.g.Sales Team ${index + 1} `}
                                        value={deptName}
                                        onChange={(e) => handleDeptNameChange(index, e.target.value)}
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <button type="submit" className="btn-save" style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}>
                            <Plus size={18} />
                            Save {deptCount > 1 ? `${deptCount} Departments` : 'Department'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
