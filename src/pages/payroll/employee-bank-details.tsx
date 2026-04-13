import { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, 
    Landmark, CreditCard,
    User, XCircle, Shield,
    Building2, Star, Upload, Loader2, Info, CheckCircle
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css';

const EmployeeBankDetails = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        user_id: '',
        branch_id: '',
        status: 'Active'
    });

    const [formData, setFormData] = useState({
        user_id: '',
        bank_name: '',
        bank_branch: '',
        account_number: '',
        account_type: 'Saving',
        ifsc_code: '',
        account_holder_name: '',
        pan_no: '',
        crn_no: '',
        esic_no: '',
        pf_no: '',
        uan_no: '',
        micr_code: '',
        insurance_no: '',
        is_primary: false
    });

    useEffect(() => {
        fetchInitialData();
        fetchBankDetails();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [eRes, bRes] = await Promise.all([
                api.get('/auth/users'),
                api.get('/branches')
            ]);
            setEmployees(Array.isArray(eRes.data) ? eRes.data : []);
            setBranches(Array.isArray(bRes.data) ? bRes.data : []);
        } catch (error) {
            console.error("Master data fetch failed", error);
        }
    };

    const fetchBankDetails = async () => {
        setFetching(true);
        try {
            const res = await api.get('/employee-bank-details', { params: filters });
            setRecords(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to sync bank accounts");
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
                await api.put(`/employee-bank-details/${editingRecord.id}`, formData);
                toast.success("Bank portfolio updated");
            } else {
                await api.post('/employee-bank-details', formData);
                toast.success("New bank account registered");
            }
            setShowModal(false);
            setEditingRecord(null);
            fetchBankDetails();
        } catch (error) {
            toast.error("Record persistence failed");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Effectively remove this account from registry?")) return;
        try {
            await api.delete(`/employee-bank-details/${id}`);
            toast.success("Account purged");
            fetchBankDetails();
        } catch (error) {
            toast.error("Deletion cycle interrupted");
        }
    };

    const togglePrimary = async (id: number) => {
        try {
            await api.put(`/employee-bank-details/${id}`, { is_primary: true });
            toast.success("Settlement account set as Primary");
            fetchBankDetails();
        } catch (error) {
            toast.error("Identity update failed");
        }
    };

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <Landmark className="title-icon" />
                    </div>
                    <div>
                        <h1>Employee Bank Details</h1>
                        <p className="subtitle">Securely manage disbursement channels and KYC IDs</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary"><Upload size={18} /> Bulk Load</button>
                    <button className="btn-primary" onClick={() => { 
                        setEditingRecord(null); 
                        setFormData({
                            user_id: '', bank_name: '', bank_branch: '', account_number: '',
                            account_type: 'Saving', ifsc_code: '', account_holder_name: '',
                            pan_no: '', crn_no: '', esic_no: '', pf_no: '', uan_no: '',
                            micr_code: '', insurance_no: '', is_primary: false
                        });
                        setShowModal(true); 
                    }}>
                        <div className="btn-icon-bg"><Plus size={18} /></div>
                        <span>Add Account Reference</span>
                    </button>
                </div>
            </header>

            <div className="glass-card">
                <div className="filter-grid" style={{ gridTemplateColumns: '2fr 2fr 1fr' }}>
                    <div className="filter-item">
                        <label><Building2 size={12} /> Branch Scope</label>
                        <select value={filters.branch_id} onChange={(e) => setFilters({...filters, branch_id: e.target.value})}>
                            <option value="">Global (All Branches)</option>
                            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div className="filter-item">
                        <label><User size={12} /> Specific Staff Profile</label>
                        <select value={filters.user_id} onChange={(e) => setFilters({...filters, user_id: e.target.value})}>
                            <option value="">All Registered Staff</option>
                            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                        </select>
                    </div>
                    <button className="btn-secondary" onClick={fetchBankDetails} disabled={fetching}>
                        {fetching ? <Loader2 size={18} className="spin" /> : <Search size={18} />}
                        <span>Search</span>
                    </button>
                </div>
            </div>

            <div className="glass-card">
                <div className="table-container">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Staff Member</th>
                                <th>Financial Institution</th>
                                <th>Account Spectrum</th>
                                <th>IFSC / MICR</th>
                                <th>Primary</th>
                                <th>Compliance IDs</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length > 0 ? records.map((record) => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="employee-info">
                                            <div className="avatar" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                                                {record.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 700}}>{record.user?.name}</div>
                                                <div style={{fontSize: '11px', color: '#64748b'}}>{record.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 600}}>{record.bank_name}</div>
                                        <div style={{fontSize: '11px', color: '#64748b'}}>{record.bank_branch}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.5px' }}>{record.account_number}</div>
                                        <div style={{fontSize: '11px', color: '#64748b', textTransform: 'uppercase'}}>{record.account_type} Account</div>
                                    </td>
                                    <td>
                                        <div style={{fontWeight: 600}}>{record.ifsc_code}</div>
                                        {record.micr_code && <div style={{fontSize: '10px', color: '#94a3b8'}}>M: {record.micr_code}</div>}
                                    </td>
                                    <td>
                                        <button 
                                            className={`primary-toggle ${record.is_primary ? 'active' : ''}`}
                                            onClick={() => !record.is_primary && togglePrimary(record.id)}
                                            title={record.is_primary ? "Default Salary Hub" : "Mark as Primary"}
                                        >
                                            <Star size={14} fill={record.is_primary ? "currentColor" : "none"} />
                                            <span>{record.is_primary ? 'Default' : 'Set Main'}</span>
                                        </button>
                                    </td>
                                    <td>
                                        <div className="statutory-tags">
                                            {record.pan_no && <span className="stat-tag" title={`Permanent Account Number: ${record.pan_no}`}>PAN</span>}
                                            {record.uan_no && <span className="stat-tag" style={{background: '#f5f3ff', color: '#5b21b6'}} title={`Universal Account Number: ${record.uan_no}`}>UAN</span>}
                                            {record.pf_no && <span className="stat-tag" style={{background: '#fff7ed', color: '#9a3412'}} title={`Provident Fund: ${record.pf_no}`}>PF</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions" style={{ justifyContent: 'flex-end' }}>
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
                                    <td colSpan={7} className="no-data">
                                        <Landmark size={40} style={{opacity: 0.2, marginBottom: '10px'}} />
                                        <p>No financial profiles registered yet.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content animate-in" style={{ maxWidth: '850px' }}>
                        <div className="modal-header" style={{ marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', margin: 0 }}>Hub & KYC Management</h2>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Authorize banking infrastructure and compliance IDs</p>
                            </div>
                            <button className="action-btn" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="premium-form">
                            <div className="form-sections" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
                                <div className="form-section">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6366f1', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                        <CreditCard size={16} /> BANKING ARCHITECTURE
                                    </h3>
                                    <div className="form-grid">
                                        <div className="form-group full">
                                            <label>Select Profile Holder *</label>
                                            <select value={formData.user_id} onChange={(e) => setFormData({...formData, user_id: e.target.value})} required>
                                                <option value="">Search employee identity...</option>
                                                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Bank Entity *</label>
                                            <input type="text" value={formData.bank_name} onChange={(e) => setFormData({...formData, bank_name: e.target.value})} placeholder="e.g. HDFC Bank" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Location / Branch *</label>
                                            <input type="text" value={formData.bank_branch} onChange={(e) => setFormData({...formData, bank_branch: e.target.value})} placeholder="Branch Locale" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Account Reference *</label>
                                            <input type="text" value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value})} placeholder="Enter Numeric Value" required />
                                        </div>
                                        <div className="form-group">
                                            <label>IFSC Standard *</label>
                                            <input type="text" value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})} placeholder="ABCD0123456" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Nominee / Holder Name *</label>
                                            <input type="text" value={formData.account_holder_name} onChange={(e) => setFormData({...formData, account_holder_name: e.target.value})} placeholder="As per records" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Catalog</label>
                                            <select value={formData.account_type} onChange={(e) => setFormData({...formData, account_type: e.target.value})}>
                                                <option value="Saving">Savings Hub</option>
                                                <option value="Current">Current / Business</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#0ea5e9', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                        <Shield size={16} /> COMPLIANCE ECOSYSTEM
                                    </h3>
                                    <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                                        <div className="form-group">
                                            <label>PAN ID</label>
                                            <input type="text" value={formData.pan_no} onChange={(e) => setFormData({...formData, pan_no: e.target.value})} placeholder="Tax Identity" />
                                        </div>
                                        <div className="form-group">
                                            <label>UAN Number</label>
                                            <input type="text" value={formData.uan_no} onChange={(e) => setFormData({...formData, uan_no: e.target.value})} placeholder="Universal Portal ID" />
                                        </div>
                                        <div className="form-group">
                                            <label>PF Registry</label>
                                            <input type="text" value={formData.pf_no} onChange={(e) => setFormData({...formData, pf_no: e.target.value})} placeholder="Provident Details" />
                                        </div>
                                        <div className="form-group">
                                            <label>ESIC Code</label>
                                            <input type="text" value={formData.esic_no} onChange={(e) => setFormData({...formData, esic_no: e.target.value})} placeholder="Insurance Reference" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-footer" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="checkbox-group">
                                    <input type="checkbox" id="primary" checked={formData.is_primary} onChange={(e) => setFormData({...formData, is_primary: e.target.checked})} />
                                    <label htmlFor="primary" style={{ fontWeight: 700, color: '#1e293b' }}>Set as default primary node for all payroll payouts</label>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        <div className="btn-icon-bg">{loading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}</div>
                                        <span>Deploy Financial Node</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeBankDetails;
