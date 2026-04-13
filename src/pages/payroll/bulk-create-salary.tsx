import { useState, useEffect } from 'react';
import { 
    Search, Filter, Users, 
    CheckCircle, Loader2, Play, FileSpreadsheet, AlertTriangle, Layers,
    Trash2
} from 'lucide-react';
import api from '../../lib/axios';
import './payroll-modules.css'; // Using shared styles
import './bulk-create-salary.css'; 
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const BulkCreateSalary = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [salaryGroups, setSalaryGroups] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [fetching, setFetching] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        salary_group_id: '',
        status: 'Pending'
    });

    const [attendanceWarnings, setAttendanceWarnings] = useState({
        pending: 0,
        rejected: 0,
        missingPunch: 0,
        onHold: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, gRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments'),
                api.get('/salary-groups')
            ]);
            setBranches(bRes.data || []);
            setDepartments(dRes.data || []);
            setSalaryGroups(gRes.data || []);
        } catch (error) {
            console.error("Data fetch error:", error);
            toast.error("Failed to load initial data");
        }
    };

    const handleGetEmployees = async () => {
        setFetching(true);
        try {
            const res = await api.get('/employee-ctc', { params: filters });
            const data = Array.isArray(res.data) ? res.data : [];
            setEmployees(data);
            setSelectedEmployees([]);
            
            // Real-time attendance verification for the selected context
            const verifyRes = await api.get('/attendance/payroll-verification', { params: {
                month: filters.month,
                year: filters.year,
                branch_id: filters.branch_id,
                department_id: filters.department_id
            }});
            setAttendanceWarnings(verifyRes.data);
        } catch (error) {
            toast.error("Failed to fetch employees");
            setEmployees([]);
        } finally {
            setFetching(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedEmployees.length === employees.length && employees.length > 0) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employees.map(e => e.user?.id).filter(id => id !== undefined));
        }
    };

    const toggleSelectEmployee = (id: number) => {
        if (selectedEmployees.includes(id)) {
            setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
        } else {
            setSelectedEmployees([...selectedEmployees, id]);
        }
    };

    const handleBulkGenerate = async (status: 'Generated' | 'Published') => {
        if (selectedEmployees.length === 0) {
            toast.error("Please select at least one employee");
            return;
        }

        setGenerating(true);
        try {
            const res = await api.post('/salary-slips/bulk-generate', {
                user_ids: selectedEmployees,
                month: filters.month,
                year: filters.year,
                status: status
            });
            toast.success(res.data.message || `Bulk ${status} Completed`);
            handleGetEmployees();
            setSelectedEmployees([]);
        } catch (error) {
            toast.error(`Bulk ${status.toLowerCase()} failed`);
        } finally {
            setGenerating(false);
        }
    };

    const handleExport = () => {
        if (employees.length === 0) {
            toast.error("No data to export");
            return;
        }
        
        const data = employees.map((e, idx) => ({
            "Sr No": idx + 1,
            "Employee ID": e.user?.id || 'N/A',
            "Name": e.user?.name || 'N/A',
            "Email": e.user?.email || 'N/A',
            "Branch": e.user?.branch?.name || 'N/A',
            "Department": e.user?.department?.name || 'N/A',
            "Salary Group": e.salaryGroup?.name || 'Standard',
            "Gross Salary": e.gross_salary || 0
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees_For_Payroll");
        XLSX.writeFile(wb, `Payroll_List_${months[filters.month - 1]}_${filters.year}.xlsx`);
        toast.success("Excel exported successfully");
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1];

    return (
        <div className="payroll-module-container animate-in">
            <div className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <Layers className="title-icon" />
                    </div>
                    <div>
                        <h1>Bulk Salary Creation</h1>
                        <p className="subtitle">Process payroll for multiple employees with precision and speed</p>
                    </div>
                </div>
            </div>

            {/* Selection Panel */}
            <div className="glass-card">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label><Filter size={14} /> Branch</label>
                        <select value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Users size={14} /> Department</label>
                        <select value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})}>
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Filter size={14} /> Month & Year</label>
                        <div className="dual-input">
                            <select value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
                                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                            <select value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="filter-item">
                        <label><Layers size={14} /> Salary Group</label>
                        <select value={filters.salary_group_id} onChange={e => setFilters({...filters, salary_group_id: e.target.value})}>
                            <option value="">All Groups</option>
                            {salaryGroups.map(sg => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
                        </select>
                    </div>
                    <button className="btn-primary" onClick={handleGetEmployees} disabled={fetching}>
                        {fetching ? <Loader2 size={18} className="spin" /> : <Users size={18} />}
                        <span>Get Employees</span>
                    </button>
                </div>
            </div>

            {/* Attendance Verification Warning */}
            {(attendanceWarnings.pending > 0 || attendanceWarnings.rejected > 0) && (
                <div className="warning-panel animate-in">
                    <div className="warning-icon">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="warning-content">
                        <h4>Attendance Conflicts Detected</h4>
                        <p>There are unresolved attendance records for this period that might cause payroll errors.</p>
                        <div className="warning-stats">
                            <span>Pending: <strong>{attendanceWarnings.pending}</strong></span>
                            <span>Rejected: <strong>{attendanceWarnings.rejected}</strong></span>
                            <span>Missing Punch: <strong>{attendanceWarnings.missingPunch}</strong></span>
                            <span>Salary on Hold: <strong className="text-amber-600">{attendanceWarnings.onHold}</strong></span>
                        </div>
                    </div>
                    <button className="btn-secondary">Resolve Attendance Conflict</button>
                </div>
            )}

            {/* Employee Actions & Table */}
            <div className="glass-card">
                <div className="card-controls" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="search-box" style={{ position: 'relative', flex: '1', maxWidth: '350px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search employees..." 
                            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                        />
                    </div>
                    <div className="bulk-actions" style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-secondary" onClick={handleExport}>
                            <FileSpreadsheet size={18} /> Export List
                        </button>
                        <button className="btn-secondary" onClick={() => handleBulkGenerate('Generated')} disabled={generating}>
                            {generating ? <Loader2 size={18} className="spin" /> : <Play size={18} />}
                            Generate Selected
                        </button>
                        <button className="btn-primary" onClick={() => handleBulkGenerate('Published')} disabled={generating}>
                            <div className="btn-icon-bg">{generating ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}</div>
                            <span>Generate & Publish</span>
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>
                                    <input type="checkbox" checked={employees.length > 0 && selectedEmployees.length === employees.length} onChange={toggleSelectAll} />
                                </th>
                                <th>Employee</th>
                                <th>Branch & Dept</th>
                                <th>Salary Group</th>
                                <th>Gross Salary</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((e, idx) => (
                                <tr key={e.id || idx}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked={selectedEmployees.includes(e.user?.id)} 
                                            onChange={() => toggleSelectEmployee(e.user?.id)} 
                                        />
                                    </td>
                                    <td>
                                        <div className="employee-info">
                                            <div className="avatar">{e.user?.name?.charAt(0)}</div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{e.user?.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>ID: {1000 + (e.user?.id || 0)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div>{e.user?.branch?.name || 'Main Office'}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{e.user?.department?.name || 'IT Dept'}</div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                            {e.salaryGroup?.name || 'Standard'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                            ₹{e.gross_salary?.toLocaleString() || '0'}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill pending`}>Pending</span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button className="action-btn" title="View Details"><Search size={16} /></button>
                                            <button className="action-btn delete" title="Exclude"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && !fetching && (
                                <tr>
                                    <td colSpan={7} className="no-data">
                                        <div style={{ opacity: 0.5, marginBottom: '12px' }}><Users size={48} /></div>
                                        <p>No employees found. Please adjust filters and click "Get Employees".</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BulkCreateSalary;
