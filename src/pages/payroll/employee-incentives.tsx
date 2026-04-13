import { useState, useEffect } from 'react';
import { 
    Plus, Trash2, XCircle, User, Building2, Briefcase, 
    Gift, CheckSquare, XSquare, Clock, Filter, Loader2, CheckCircle
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css';

const EmployeeIncentives = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    
    // Initial data
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [incentiveTypes, setIncentiveTypes] = useState<any[]>([]);

    // Filters
    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        user_id: '',
        incentive_type_id: '',
        status: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    // Form
    const [formData, setFormData] = useState({
        user_id: '',
        incentive_type_id: '',
        amount: '',
        description: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'Pending'
    });

    useEffect(() => {
        fetchInitialData();
        fetchIncentives();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, eRes, tRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments'),
                api.get('/auth/users'),
                api.get('/incentive-types')
            ]);
            setBranches(bRes.data || []);
            setDepartments(dRes.data || []);
            setEmployees(eRes.data || []);
            setIncentiveTypes(tRes.data || []);
        } catch (error) {
            console.error("Fetch failed", error);
        }
    };

    const fetchIncentives = async () => {
        setFetching(true);
        try {
            const res = await api.get('/employee-incentives', { params: filters });
            setRecords(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to fetch incentives");
            setRecords([]);
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingRecord) {
                await api.post(`/employee-incentives/${editingRecord.id}`, formData); 
                toast.success("Incentive updated");
            } else {
                await api.post('/employee-incentives', formData);
                toast.success("Incentive added successfully");
            }
            setShowModal(false);
            setEditingRecord(null);
            fetchIncentives();
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await api.patch(`/employee-incentives/${id}/status`, { status });
            toast.success(`Incentive ${status}`);
            fetchIncentives();
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/employee-incentives/${id}`);
            toast.success("Incentive deleted");
            fetchIncentives();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Delete failed");
        }
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <Gift className="title-icon" />
                    </div>
                    <div>
                        <h1>Employee Incentives</h1>
                        <p className="subtitle">Reward performance and track commissions effortlessly</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { 
                    setEditingRecord(null); 
                    setFormData({
                        user_id: '', incentive_type_id: '', amount: '', description: '',
                        month: filters.month, year: filters.year, status: 'Pending'
                    }); 
                    setShowModal(true); 
                }}>
                    <div className="btn-icon-bg"><Plus size={18} /></div>
                    <span>Release Performance Incentive</span>
                </button>
            </header>

            <div className="glass-card">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label><Building2 size={12} /> Office Branch</label>
                        <select value={filters.branch_id} onChange={(e) => setFilters({...filters, branch_id: e.target.value})}>
                            <option value="">Global Hierarchy</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Briefcase size={12} /> Unit / Department</label>
                        <select value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                            <option value="">All Functional Units</option>
                            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Gift size={12} /> Bonus Category</label>
                        <select value={filters.incentive_type_id} onChange={(e) => setFilters({...filters, incentive_type_id: e.target.value})}>
                            <option value="">All Categories</option>
                            {incentiveTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><User size={12} /> Selected Staff</label>
                        <select value={filters.user_id} onChange={(e) => setFilters({...filters, user_id: e.target.value})}>
                            <option value="">All Registered Staff</option>
                            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Clock size={12} /> Fiscal Period</label>
                        <div className="dual-input premium-period-input">
                            <select value={filters.month} onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}>
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                            <div className="divider" />
                            <select value={filters.year} onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}>
                                <option value={2026}>2026</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                    </div>
                    <div className="filter-item">
                        <button className="btn-secondary filter-apply-btn" onClick={fetchIncentives} disabled={fetching}>
                            {fetching ? <Loader2 size={18} className="spin" /> : <Filter size={18} />}
                            <span>Sync Registry</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Employee Details</th>
                                <th>Incentive Category</th>
                                <th>Payout Amount</th>
                                <th>Target Month</th>
                                <th>Approval Status</th>
                                <th style={{textAlign: 'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? records.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="employee-info">
                                            <div className="avatar" style={{ background: '#f5f3ff', color: '#6d28d9' }}>
                                                {record.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 700}}>{record.user?.name}</div>
                                                <div style={{fontSize: '11px', color: '#64748b'}}>{record.user?.branch?.name} • {record.user?.department?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="incentive-type-tag">{record.incentiveType.name}</span></td>
                                    <td><div style={{fontWeight: 700, color: '#0f172a'}}>₹{record.amount?.toLocaleString()}</div></td>
                                    <td>{months[record.month-1]} {record.year}</td>
                                    <td>
                                        <span className={`status-pill ${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions" style={{justifyContent: 'flex-end'}}>
                                            {record.status === 'Pending' && (
                                                <>
                                                    <button className="action-btn" style={{color: '#166534', background: '#dcfce7'}} onClick={() => handleStatusChange(record.id, 'Approved')} title="Approve">
                                                        <CheckSquare size={16} />
                                                    </button>
                                                    <button className="action-btn" style={{color: '#991b1b', background: '#fee2e2'}} onClick={() => handleStatusChange(record.id, 'Rejected')} title="Reject">
                                                        <XSquare size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="action-btn delete" onClick={() => handleDelete(record.id)} disabled={record.status === 'Paid'}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="no-data">
                                        <Gift size={40} style={{opacity: 0.2, marginBottom: '10px'}} />
                                        <p>No incentive records found for this period.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-in">
                        <div className="modal-header">
                            <div>
                                <h2 style={{ fontSize: '24px', margin: 0 }}>New Incentive Bonus</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Authorize a performance reward for staff member</p>
                            </div>
                            <button className="action-btn" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Staff Member *</label>
                                    <select value={formData.user_id} onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                        <option value="">Search for employee...</option>
                                        {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Reward Type *</label>
                                    <select value={formData.incentive_type_id} onChange={(e) => setFormData({...formData, incentive_type_id: e.target.value})} required>
                                        <option value="">Select category...</option>
                                        {incentiveTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Total Amount (₹) *</label>
                                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="0.00" required />
                                </div>
                                <div className="form-group">
                                    <label>Effective Month *</label>
                                    <select value={formData.month} onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}>
                                        {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Effective Year *</label>
                                    <select value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}>
                                        <option value={2026}>2026</option>
                                        <option value={2025}>2025</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <label>Justification / Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Provide context for this reward..." rows={3}></textarea>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
                                    <span>Release Incentive</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeIncentives;
