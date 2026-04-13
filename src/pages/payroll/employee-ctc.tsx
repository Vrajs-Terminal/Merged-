import { useState, useEffect } from 'react';
import { 
    Plus, Search, Filter, History, Trash2, Edit2, 
    X, User, DollarSign, Calendar, Calculator, 
    Layers, Clock, Eye, EyeOff, Loader2, Landmark, IndianRupee
} from 'lucide-react';
import api from '../../lib/axios';
import './employee-ctc.css';
import { toast } from 'react-hot-toast';

interface EmployeeCTCData {
    id: number;
    user_id: number;
    user: {
        id: number;
        name: string;
        email: string;
        branch?: { name: string };
        department?: { name: string };
    };
    salary_group_id: number;
    salaryGroup: { name: string };
    salary_type: string;
    gross_salary: number;
    increment_remark: string | null;
    start_date: string;
    next_increment_date: string | null;
    status: string;
}

const EmployeeCTC = () => {
    const [ctcs, setCtcs] = useState<EmployeeCTCData[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [salaryGroups, setSalaryGroups] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        search: ''
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [history, setHistory] = useState<EmployeeCTCData[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const [formData, setFormData] = useState({
        user_id: '',
        salary_group_id: '',
        salary_type: 'Fixed Per Month',
        gross_salary: '',
        increment_remark: '',
        start_date: '',
        next_increment_date: ''
    });

    useEffect(() => {
        fetchCtcs();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [uRes, gRes, bRes, dRes] = await Promise.all([
                api.get('/employee-ctc/users-list'),
                api.get('/salary-groups'),
                api.get('/branches'),
                api.get('/departments')
            ]);
            setUsers(uRes.data);
            setSalaryGroups(gRes.data);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (error) {
            console.error("Failed to load dependency data");
        }
    };

    const fetchCtcs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/employee-ctc', { params: filters });
            setCtcs(res.data);
        } catch (error) {
            toast.error("Failed to load CTC data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchCtcs();
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/employee-ctc/${editingId}`, formData);
                toast.success("CTC Updated successfully");
            } else {
                await api.post('/employee-ctc', formData);
                toast.success("CTC Assigned successfully");
            }
            setIsModalOpen(false);
            fetchCtcs();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this CTC record?")) return;
        try {
            await api.delete(`/employee-ctc/${id}`);
            toast.success("Record deleted");
            fetchCtcs();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const toggleStatus = async (item: EmployeeCTCData) => {
        try {
            const newStatus = item.status === 'Current' ? 'Previous' : 'Current';
            await api.put(`/employee-ctc/${item.id}`, { status: newStatus });
            toast.success(`Marked as ${newStatus}`);
            fetchCtcs();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: '',
            salary_group_id: '',
            salary_type: 'Fixed Per Month',
            gross_salary: '',
            increment_remark: '',
            start_date: '',
            next_increment_date: ''
        });
        setEditingId(null);
    };

    const openEditModal = (item: EmployeeCTCData) => {
        setFormData({
            user_id: item.user_id.toString(),
            salary_group_id: item.salary_group_id.toString(),
            salary_type: item.salary_type,
            gross_salary: item.gross_salary.toString(),
            increment_remark: item.increment_remark || '',
            start_date: item.start_date.split('T')[0],
            next_increment_date: item.next_increment_date ? item.next_increment_date.split('T')[0] : ''
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const fetchHistory = async (userId: number) => {
        setIsHistoryModalOpen(true);
        setHistoryLoading(true);
        try {
            const res = await api.get(`/employee-ctc/history/${userId}`);
            setHistory(res.data);
        } catch (error) {
            toast.error("Failed to load history");
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="ctc-layout">
            <div className="ctc-container">
                <div className="ctc-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <IndianRupee size={32} className="page-title-icon text-indigo-600" />
                            <h2>Employee CTC Management</h2>
                        </div>
                        <p>Track salary structures and increment history</p>
                    </div>
                    <button className="btn-add" onClick={() => { resetForm(); setIsModalOpen(true); }}>
                        <Plus size={18} /> Assign New CTC
                    </button>
                </div>

                <div className="ctc-filters">
                    <div className="filter-group">
                        <label>Branch</label>
                        <select 
                            className="filter-control"
                            value={filters.branch_id}
                            onChange={e => setFilters({ ...filters, branch_id: e.target.value })}
                        >
                            <option value="">All Branches</option>
                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Department</label>
                        <select 
                            className="filter-control"
                            value={filters.department_id}
                            onChange={e => setFilters({ ...filters, department_id: e.target.value })}
                        >
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Search Employee</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                className="filter-control" 
                                style={{ paddingLeft: '32px' }}
                                placeholder="Name or Email"
                                value={filters.search}
                                onChange={e => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="btn-add" onClick={handleSearch} style={{ background: '#64748b' }}>
                        <Filter size={18} /> Apply Filter
                    </button>
                </div>

                <div className="table-wrapper">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Employee</th>
                                    <th>Salary Group</th>
                                    <th>Gross Salary</th>
                                    <th>Start Date</th>
                                    <th>Next Increment</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ctcs.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div className="employee-info">
                                                <div className="emp-avatar">{item.user.name.charAt(0)}</div>
                                                <div className="emp-details">
                                                    <p>{item.user.name}</p>
                                                    <span>{item.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Landmark size={14} color="#64748b" />
                                                {item.salaryGroup.name}
                                            </div>
                                        </td>
                                        <td className="salary-value">₹ {item.gross_salary.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="#64748b" />
                                                {new Date(item.start_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>{item.next_increment_date ? new Date(item.next_increment_date).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="action-btn btn-edit" 
                                                    onClick={() => openEditModal(item)}
                                                    title="Edit CTC"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn btn-toggle" 
                                                    onClick={() => toggleStatus(item)}
                                                    title={item.status === 'Current' ? 'Mark as Previous' : 'Mark as Current'}
                                                >
                                                    {item.status === 'Current' ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button 
                                                    className="action-btn btn-history" 
                                                    onClick={() => fetchHistory(item.user.id)}
                                                    title="View Salary History"
                                                >
                                                    <History size={16} />
                                                </button>
                                                <button 
                                                    className="action-btn btn-delete" 
                                                    onClick={() => handleDelete(item.id)}
                                                    title="Delete CTC"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {ctcs.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No employee CTC found matching the criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Assign/Edit CTC Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '750px' }}>
                        <div className="modal-header">
                            <h3>{editingId ? 'Edit Employee CTC' : 'Assign New CTC'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Select Employee*</label>
                                        <div className="input-with-icon">
                                            <User className="field-icon" size={18} />
                                            <select 
                                                className="premium-control" 
                                                required
                                                value={formData.user_id}
                                                onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                                                disabled={!!editingId}
                                            >
                                                <option value="">-- Select Employee --</option>
                                                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Salary Group*</label>
                                        <div className="input-with-icon">
                                            <Layers className="field-icon" size={18} />
                                            <select 
                                                className="premium-control" 
                                                required
                                                value={formData.salary_group_id}
                                                onChange={e => setFormData({ ...formData, salary_group_id: e.target.value })}
                                            >
                                                <option value="">-- Select Group --</option>
                                                {salaryGroups.map(sg => <option key={sg.id} value={sg.id}>{sg.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Salary Type*</label>
                                        <div className="input-with-icon">
                                            <Clock className="field-icon" size={18} />
                                            <select 
                                                className="premium-control"
                                                value={formData.salary_type}
                                                onChange={e => setFormData({ ...formData, salary_type: e.target.value })}
                                            >
                                                <option>Fixed Per Month</option>
                                                <option>Fixed Per Day</option>
                                                <option>Fixed Per Hour</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Gross Salary*</label>
                                        <div className="input-with-icon">
                                            <DollarSign className="field-icon" size={18} />
                                            <input 
                                                type="number" 
                                                className="premium-control" 
                                                placeholder="0.00"
                                                required
                                                value={formData.gross_salary}
                                                onChange={e => setFormData({ ...formData, gross_salary: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Effective Start Date*</label>
                                        <div className="input-with-icon">
                                            <Calendar className="field-icon" size={18} />
                                            <input 
                                                type="date" 
                                                className="premium-control" 
                                                required
                                                value={formData.start_date}
                                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Next Increment Date</label>
                                        <div className="input-with-icon">
                                            <Calculator className="field-icon" size={18} />
                                            <input 
                                                type="date" 
                                                className="premium-control"
                                                value={formData.next_increment_date}
                                                onChange={e => setFormData({ ...formData, next_increment_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>Increment / Assignment Remark</label>
                                    <textarea 
                                        className="premium-control no-icon-input" 
                                        rows={2}
                                        placeholder="e.g. Annual Increment 2024"
                                        value={formData.increment_remark}
                                        onChange={e => setFormData({ ...formData, increment_remark: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-save-ctc">
                                    {editingId ? 'Update CTC Record' : 'Assign CTC'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h3>Salary Revision History</h3>
                            <button className="btn-close" onClick={() => setIsHistoryModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {historyLoading ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : history.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No salary history found for this employee.</p>
                            ) : (
                                <div className="history-list">
                                    {history.map(h => (
                                        <div key={h.id} className={`history-item ${h.status === 'Current' ? 'current' : ''}`}>
                                            <div className="history-meta">
                                                <div className="history-date">
                                                    <Calendar size={14} />
                                                    {new Date(h.start_date).toLocaleDateString()}
                                                </div>
                                                <div className={`history-status ${h.status.toLowerCase()}`}>{h.status}</div>
                                            </div>
                                            <div className="history-details">
                                                <div className="history-amount">₹ {h.gross_salary.toLocaleString()}</div>
                                                <div className="history-group">
                                                    <Landmark size={12} />
                                                    {h.salaryGroup.name}
                                                </div>
                                            </div>
                                            {h.increment_remark && <div className="history-remark">"{h.increment_remark}"</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeCTC;
