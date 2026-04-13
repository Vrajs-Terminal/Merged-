import { useState, useEffect } from 'react';
import { Search, GraduationCap, Calendar, Edit2, X, Save, History, Loader2 , UserCheck} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './assign-employee-grade.css';

interface EmployeeGrade {
    id: string; // user id
    employeeId: string;
    employeeName: string;
    branch: string;
    department: string;
    currentGrade: string;
}

interface GradeMaster {
    id: number;
    name: string;
    code: string;
}

interface GradeHistory {
    id: number;
    effective_from: string;
    effective_to: string | null;
    status: string;
    remarks: string;
    grade: { name: string };
}

export default function AssignEmployeeGrade() {
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeGrade | null>(null);
    const [employees, setEmployees] = useState<EmployeeGrade[]>([]);
    const [availableGrades, setAvailableGrades] = useState<GradeMaster[]>([]);
    const [gradeHistory, setGradeHistory] = useState<GradeHistory[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Modal Form State
    const [newGrade, setNewGrade] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [remarks, setRemarks] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const userRes = await fetch('/api/auth/users');
            const users = userRes.ok ? await userRes.json() : [];

            const gradeRes = await fetch('/api/employee-grades');
            const gradesData = await gradeRes.json();

            setAvailableGrades(gradesData);

            const mappedUsers = Array.isArray(users) ? users.map((u: any) => ({
                id: u.id.toString(),
                employeeId: u.employee_id || `EMP-${String(u.id).padStart(3, '0')}`,
                employeeName: u.name,
                branch: u.branch?.name || 'Unassigned',
                department: u.department?.name || 'Unassigned',
                currentGrade: u.employeeGrade?.name || 'None'
            })) : [];

            setEmployees(mappedUsers);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssignClick = (emp: EmployeeGrade) => {
        setSelectedEmployee(emp);
        setNewGrade('');
        setEffectiveDate(new Date().toISOString().split('T')[0]);
        setRemarks('');
        setIsModalOpen(true);
    };

    const handleHistoryClick = async (emp: EmployeeGrade) => {
        setSelectedEmployee(emp);
        setGradeHistory([]);
        setIsHistoryModalOpen(true);
        try {
            const res = await fetch(`/api/employee-grades/history/${emp.id}`);
            const data = await res.json();
            setGradeHistory(data);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handleSave = async () => {
        if (!newGrade || !effectiveDate) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/employee-grades/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedEmployee?.id,
                    new_grade_id: newGrade,
                    effective_from: effectiveDate,
                    remarks
                })
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to assign grade');
            }
        } catch (error) {
            console.error("Failed to save grade", error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredData = employees.filter(emp => {
        const matchesSearch = emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBranch = branchFilter ? emp.branch === branchFilter : true;
        const matchesDept = deptFilter ? emp.department === deptFilter : true;
        return matchesSearch && matchesBranch && matchesDept;
    });

    return (
        <div className="assign-grade-layout">
            <div className="filters-header">
                <div className="filter-group">
                    <label>Employee Search</label>
                    <div className="search-input-wrapper" style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                        <input
                            type="text"
                            className="filter-input"
                            placeholder="Search Name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Company</label>
                    <select className="filter-select">
                        <option value="">All Companies</option>
                        <option value="minehr">MineHR Solutions</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Branch</label>
                    <select className="filter-select" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                        <option value="">All Branches</option>
                        <option value="Mumbai Head Office">Mumbai Head Office</option>
                        <option value="Delhi Branch">Delhi Branch</option>
                        <option value="Pune Office">Pune Office</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Department</label>
                    <select className="filter-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                        <option value="">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="HR">HR</option>
                        <option value="Sales">Sales</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>
            </div>

            <div className="table-card">
                <div className="table-header-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2><UserCheck className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Employee Grades</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <ImportButton
                            onImport={(data) => {
                                console.log('Imported Grades:', data);
                                alert(`Imported ${data.length} grade assignments.`);
                            }}
                            label="Import"
                        />
                        <ExportButtons
                            data={filteredData.map(emp => ({
                                "Employee ID": emp.employeeId,
                                "Name": emp.employeeName,
                                "Branch": emp.branch,
                                "Dept": emp.department,
                                "Current Grade": emp.currentGrade
                            }))}
                            fileName={`Employee_Grades_${new Date().toISOString().split('T')[0]}`}
                            title="Employee Grade Assignments"
                        />
                        <button
                            className="btn-add"
                            onClick={() => {
                                setSelectedEmployee(null);
                                setNewGrade('');
                                setEffectiveDate(new Date().toISOString().split('T')[0]);
                                setRemarks('');
                                setIsModalOpen(true);
                            }}
                        >
                            <Edit2 size={16} /> Assign Grade Limit
                        </button>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Branch</th>
                            <th>Department</th>
                            <th>Current Grade</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading employees...</div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map(emp => (
                                <tr key={emp.id}>
                                    <td><strong>{emp.employeeId}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold' }}>
                                                {emp.employeeName.charAt(0)}
                                            </div>
                                            {emp.employeeName}
                                        </div>
                                    </td>
                                    <td>{emp.branch}</td>
                                    <td>{emp.department}</td>
                                    <td>
                                        <span className={`grade-badge ${emp.currentGrade === 'None' ? 'badge-none' : ''}`}>
                                            {emp.currentGrade}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="action-btn" onClick={() => handleAssignClick(emp)}>
                                                <Edit2 size={14} />
                                                {emp.currentGrade === 'None' ? 'Assign' : 'Update'}
                                            </button>
                                            <button className="action-btn action-btn-history" onClick={() => handleHistoryClick(emp)} style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                <History size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No employees found matching the filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><GraduationCap size={20} className="text-blue" /> Assign / Update Grade</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Employee Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    className="form-select"
                                    value={selectedEmployee ? selectedEmployee.id : ''}
                                    onChange={(e) => {
                                        const emp = employees.find(emp => emp.id === e.target.value);
                                        if (emp) {
                                            setSelectedEmployee(emp);
                                        }
                                    }}
                                >
                                    <option value="" disabled>-- Select Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.employeeName} ({emp.employeeId})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Current Grade</label>
                                <div>
                                    <span className={`grade-badge ${selectedEmployee?.currentGrade === 'None' || !selectedEmployee ? 'badge-none' : ''}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                                        {selectedEmployee?.currentGrade || 'None'}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Select New Grade <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    className="form-select"
                                    value={newGrade}
                                    onChange={(e) => setNewGrade(e.target.value)}
                                >
                                    <option value="">-- Select Grade --</option>
                                    {availableGrades.map(grade => (
                                        <option key={grade.id} value={grade.id} disabled={selectedEmployee ? grade.name === selectedEmployee.currentGrade : false}>
                                            {grade.name} ({grade.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Effective From Date <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={effectiveDate}
                                        onChange={(e) => setEffectiveDate(e.target.value)}
                                        style={{ paddingRight: '36px' }}
                                    />
                                    <Calendar size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Remarks (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Add any internal notes or remarks..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Grade'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && selectedEmployee && (
                <div className="modal-overlay" onClick={() => setIsHistoryModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3><History size={20} className="text-blue" /> Grade History - {selectedEmployee.employeeName}</h3>
                            <button className="close-btn" onClick={() => setIsHistoryModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto', padding: '0' }}>
                            {gradeHistory.length > 0 ? (
                                <table className="data-table" style={{ margin: 0, border: 'none' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                                        <tr>
                                            <th>Grade</th>
                                            <th>Effective From</th>
                                            <th>Effective To</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gradeHistory.map((hist: any) => (
                                            <tr key={hist.id}>
                                                <td style={{ fontWeight: 500 }}>{hist.grade?.name || 'Unknown'}</td>
                                                <td>{new Date(hist.effective_from).toLocaleDateString()}</td>
                                                <td>{hist.effective_to ? new Date(hist.effective_to).toLocaleDateString() : 'Current'}</td>
                                                <td>
                                                    <span className={`grade-badge ${hist.status === 'Closed' ? 'badge-none' : ''}`} style={{ zoom: 0.8 }}>
                                                        {hist.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    No grade history found for this employee.
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsHistoryModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
