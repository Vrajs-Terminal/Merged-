import { useState, useEffect } from 'react';
import { 
    PauseCircle, Trash2, User, Building2, Briefcase, 
    CheckSquare, XSquare, Clock, Filter, Loader2, Plus, AlertCircle
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css';

const SalaryHoldRequests = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [fetching, setFetching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    // Initial data
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    // Filters
    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        employee_id: '',
        status: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Form
    const [formData, setFormData] = useState({
        employee_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        start_date: '',
        end_date: '',
        reason: ''
    });

    useEffect(() => {
        fetchInitialData();
        fetchHoldRequests();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, eRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments'),
                api.get('/auth/users')
            ]);
            setBranches(bRes.data || []);
            setDepartments(dRes.data || []);
            setEmployees(eRes.data || []);
        } catch (error) {
            console.error("Fetch failed", error);
        }
    };

    const fetchHoldRequests = async () => {
        setFetching(true);
        try {
            const res = await api.get('/salary-hold', { params: filters });
            setRecords(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to fetch hold requests");
            setRecords([]);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/salary-hold', formData);
            toast.success("Salary hold request submitted");
            setShowModal(false);
            setFormData({
                employee_id: '',
                month: filters.month,
                year: filters.year,
                start_date: '',
                end_date: '',
                reason: ''
            });
            fetchHoldRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await api.patch(`/salary-hold/${id}/status`, { status });
            toast.success(`Request marked as ${status}`);
            fetchHoldRequests();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this request?")) return;
        try {
            await api.delete(`/salary-hold/${id}`);
            toast.success("Request deleted");
            fetchHoldRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Delete failed");
        }
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved': return 'status-paid';
            case 'Rejected': return 'status-rejected';
            case 'Processed': return 'status-success';
            default: return 'status-pending';
        }
    };

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper hold-logic-icon">
                        <PauseCircle className="title-icon" />
                    </div>
                    <div>
                        <h1>Salary Hold Requests</h1>
                        <p className="subtitle">Manage temporary payroll withholdings by reporting managers</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <div className="btn-icon-bg"><Plus size={18} /></div>
                    <span>New Hold Request</span>
                </button>
            </header>

            <div className="glass-card">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label><Building2 size={12} /> Branch</label>
                        <select value={filters.branch_id} onChange={(e) => setFilters({...filters, branch_id: e.target.value})}>
                            <option value="">All Branches</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Briefcase size={12} /> Department</label>
                        <select value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                            <option value="">All Departments</option>
                            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><User size={12} /> Employee</label>
                        <select value={filters.employee_id} onChange={(e) => setFilters({...filters, employee_id: e.target.value})}>
                            <option value="">All Employees</option>
                            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Clock size={12} /> Period</label>
                        <div className="dual-input">
                            <select value={filters.month} onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}>
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                            <select value={filters.year} onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}>
                                <option value={2026}>2026</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                    </div>
                    <div className="filter-item">
                        <label><AlertCircle size={12} /> Status</label>
                        <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Processed">Processed</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <button className="btn-secondary filter-apply-btn" onClick={fetchHoldRequests} disabled={fetching}>
                            {fetching ? <Loader2 size={18} className="spin" /> : <Filter size={18} />}
                            <span>Get Requests</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card table-card animate-in-up">
                <div className="table-responsive">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Status</th>
                                <th>Reporting Person</th>
                                <th>Employee</th>
                                <th>Branch / Dept</th>
                                <th>Hold Period</th>
                                <th>Reason</th>
                                <th>Date</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? records.map((record, index) => (
                                <tr key={record.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(record.status)}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-mini">{record.reportingUser.name.charAt(0)}</div>
                                            <span>{record.reportingUser.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="user-avatar-mini purple">{record.employee.name.charAt(0)}</div>
                                            <span>{record.employee.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="dept-info">
                                            <span>{record.employee.branch?.name}</span>
                                            <small>{record.employee.department?.name}</small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="period-cell">
                                            <strong>{months[record.month-1]} {record.year}</strong>
                                            <small>{new Date(record.start_date).toLocaleDateString()} - {new Date(record.end_date).toLocaleDateString()}</small>
                                        </div>
                                    </td>
                                    <td className="reason-cell">{record.reason}</td>
                                    <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                                    <td className="text-right">
                                        <div className="action-group justify-end">
                                            {record.status === 'Pending' && (
                                                <>
                                                    <button className="icon-btn success" title="Approve" onClick={() => handleStatusChange(record.id, 'Approved')}>
                                                        <CheckSquare size={16} />
                                                    </button>
                                                    <button className="icon-btn danger" title="Reject" onClick={() => handleStatusChange(record.id, 'Rejected')}>
                                                        <XSquare size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {record.status === 'Approved' && (
                                                <button className="icon-btn primary" title="Mark Processed" onClick={() => handleStatusChange(record.id, 'Processed')}>
                                                    <CheckSquare size={16} />
                                                </button>
                                            )}
                                            {record.status !== 'Processed' && (
                                                <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(record.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={9} className="empty-state">No hold requests found for the selected criteria</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-effect animate-in-up" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>New Salary Hold Request</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}><XSquare size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group span-2">
                                    <label>Select Employee *</label>
                                    <select required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})}>
                                        <option value="">Search Employee...</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Month *</label>
                                    <select value={formData.month} onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}>
                                        {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Year *</label>
                                    <select value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}>
                                        <option value={2026}>2026</option>
                                        <option value={2025}>2025</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>End Date *</label>
                                    <input type="date" required value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                                </div>
                                <div className="form-group span-2">
                                    <label>Reason for Hold *</label>
                                    <textarea required placeholder="Explain why this salary should be held..." value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} rows={3}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className="spin" size={18} /> : <CheckSquare size={18} />}
                                    <span>Submit Request</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryHoldRequests;
