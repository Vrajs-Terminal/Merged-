import { useState, useEffect } from 'react';
import { 
    Plus, Filter, Edit2, Trash2, 
    XCircle, Calendar, User, Building2, Briefcase,
    IndianRupee, CheckCircle, Search, Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css'; 

const OtherEarningsDeductions = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    
    // Filters
    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        user_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        user_id: '',
        name: '',
        type: 'Earning',
        amount: '',
        percentage: '',
        description: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        is_recurring: false
    });

    useEffect(() => {
        const initialize = async () => {
            setInitialLoading(true);
            await fetchInitialData();
            await fetchRecords();
            setInitialLoading(false);
        };
        initialize();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, eRes] = await Promise.all([
                api.get('/branches').catch(() => ({ data: [] })),
                api.get('/departments').catch(() => ({ data: [] })),
                api.get('/auth/users').catch(() => ({ data: [] }))
            ]);
            setBranches(Array.isArray(bRes.data) ? bRes.data : []);
            setDepartments(Array.isArray(dRes.data) ? dRes.data : []);
            setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
        } catch (error) {
            console.error("Critical telemetry failure", error);
        }
    };

    const fetchRecords = async () => {
        setFetching(true);
        try {
            const res = await api.get('/other-earnings', { params: filters });
            setRecords(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to sync records bundle");
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
                await api.put(`/other-earnings/${editingRecord.id}`, formData);
                toast.success("Record updated in registry");
            } else {
                await api.post('/other-earnings', formData);
                toast.success("New component deployed");
            }
            setShowModal(false);
            setEditingRecord(null);
            fetchRecords();
        } catch (error) {
            toast.error("Transaction integrity failure");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Permanently purge this component from records?")) return;
        try {
            await api.delete(`/other-earnings/${id}`);
            toast.success("Record purged");
            fetchRecords();
        } catch (error) {
            toast.error("Deletion protocol interrupted");
        }
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    if (initialLoading) {
        return (
            <div className="payroll-module-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="spin" style={{ color: '#6366f1', marginBottom: '16px' }} />
                    <p style={{ fontWeight: 800, color: '#64748b' }}>SYNCHRONIZING REVENUE NODES...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <IndianRupee className="title-icon" />
                    </div>
                    <div>
                        <h1>Other Earnings / Deductions</h1>
                        <p className="subtitle">Manage supplemental payroll vectors with high precision</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={() => { 
                    setEditingRecord(null); 
                    setFormData({
                        user_id: '', name: '', type: 'Earning', amount: '', 
                        percentage: '', description: '', is_recurring: false,
                        month: filters.month, year: filters.year
                    });
                    setShowModal(true); 
                }}>
                    <div className="btn-icon-bg"><Plus size={18} /></div>
                    <span>Provision New Component</span>
                </button>
            </header>

            <div className="glass-card">
                <div className="filter-grid">
                    <div className="filter-item">
                        <label><Building2 size={12} /> Branch Scope</label>
                        <select value={filters.branch_id} onChange={(e) => setFilters({...filters, branch_id: e.target.value})}>
                            <option value="">Global Hierarchy</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Briefcase size={12} /> Unit / Dept</label>
                        <select value={filters.department_id} onChange={(e) => setFilters({...filters, department_id: e.target.value})}>
                            <option value="">All Units</option>
                            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><User size={12} /> Target Staff</label>
                        <select value={filters.user_id} onChange={(e) => setFilters({...filters, user_id: e.target.value})}>
                            <option value="">All Registered Staff</option>
                            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><Calendar size={12} /> Fiscal Period</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select style={{ flex: 1.5 }} value={filters.month} onChange={(e) => setFilters({...filters, month: parseInt(e.target.value)})}>
                                {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                            </select>
                            <select style={{ flex: 1 }} value={filters.year} onChange={(e) => setFilters({...filters, year: parseInt(e.target.value)})}>
                                <option value={2026}>2026</option>
                                <option value={2025}>2025</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-secondary" onClick={fetchRecords} disabled={fetching}>
                        {fetching ? <Loader2 size={18} className="spin" /> : <Filter size={18} />}
                        <span>Sync</span>
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Staff Profile</th>
                                <th>Ledger Head</th>
                                <th>Classification</th>
                                <th>Value (₹)</th>
                                <th>Timeline</th>
                                <th>State</th>
                                <th style={{textAlign: 'right'}}>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? records.map((record, index) => (
                                <tr key={record.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="employee-info">
                                            <div className="avatar" style={{ background: '#f8fafc', color: '#1e293b' }}>
                                                {record.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 800}}>{record.user?.name}</div>
                                                <div style={{fontSize: '11px', color: '#64748b'}}>{record.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 700}}>{record.name}</div>
                                        {record.is_recurring && <div style={{fontSize: '10px', color: '#6366f1', fontWeight: 800}}>RECURRING NODE</div>}
                                    </td>
                                    <td>
                                        <span className={`badge ${record.type === 'Earning' ? 'earning' : 'deduction'}`}>
                                            {record.type}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 900, fontSize: '15px'}}>₹{record.amount?.toLocaleString()}</div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{months[record.month-1]} {record.year}</td>
                                    <td>
                                        <span className={`status-pill active`}>Verified</span>
                                    </td>
                                    <td>
                                        <div className="actions" style={{justifyContent: 'flex-end'}}>
                                            <button className="action-btn edit" onClick={() => { setEditingRecord(record); setFormData(record); setShowModal(true); }}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(record.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8} className="no-data">
                                        <Search size={40} style={{opacity: 0.2, marginBottom: '10px'}} />
                                        <p>No active components found in this period.</p>
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
                        <div className="modal-header" style={{ marginBottom: '36px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', margin: 0 }}>Payload Configuration</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Authorize custom payout or deduction vectors</p>
                            </div>
                            <button className="action-btn" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label>Staff Association *</label>
                                    <select value={formData.user_id} onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                        <option value="">Identify staff member...</option>
                                        {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Head Title *</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Special Bonus" required />
                                </div>
                                <div className="form-group">
                                    <label>Flux Identity *</label>
                                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="Earning">Inflow Node (+)</option>
                                        <option value="Deduction">Outflow Node (-)</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Monetary Value *</label>
                                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} placeholder="Numeric Value" required />
                                </div>
                                <div className="form-group">
                                    <label>CTC Proportion %</label>
                                    <input type="number" value={formData.percentage} onChange={(e) => setFormData({...formData, percentage: e.target.value})} placeholder="Optional Ratio" />
                                </div>
                                <div className="form-group">
                                    <label>Fiscal Month *</label>
                                    <select value={formData.month} onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}>
                                        {months.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Fiscal Year *</label>
                                    <select value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}>
                                        <option value={2026}>2026</option>
                                        <option value={2025}>2025</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <label>Administrative Rationale</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Document the protocol rationale..." rows={3}></textarea>
                                </div>
                                <div className="form-group full checkbox-group">
                                    <input type="checkbox" id="recurring" checked={formData.is_recurring} onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})} />
                                    <label htmlFor="recurring" style={{ color: '#1e293b', fontWeight: 800 }}>PERSISTENT RECURRING NODE</label>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px', marginTop: '12px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    <div className="btn-icon-bg">{loading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}</div>
                                    <span>Deploy Protocol</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OtherEarningsDeductions;
