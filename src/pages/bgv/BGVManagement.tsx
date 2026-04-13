import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Filter, ClipboardList, CheckCircle2, AlertCircle, Clock,
    Download, LayoutDashboard, UserCheck, UserMinus, Eye, FileText
} from 'lucide-react';
import './bgv.css';

interface BGVRecord {
    id: number;
    employee_id: number;
    employee: { name: string; id: number };
    branch: { name: string } | null;
    department: { name: string } | null;
    verificationType: { name: string };
    verification_way: string;
    status: string;
    verified_by: number | null;
    verifier: { name: string } | null;
    verification_date: string | null;
    remarks: string | null;
}

export default function BGVManagement() {
    const [records, setRecords] = useState<BGVRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Filter Stats
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0, failed: 0 });

    // Form / Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [types, setTypes] = useState<{ id: number; name: string }[]>([]);

    // Add Verification Form
    const [formEmployeeId, setFormEmployeeId] = useState('');
    const [formTypeId, setFormTypeId] = useState('');
    const [formWay, setFormWay] = useState('Call');
    const [formStatus, setFormStatus] = useState('Pending');
    const [formRemarks, setFormRemarks] = useState('');

    useEffect(() => {
        fetchData();
        fetchEmployees();
        fetchTypes();
    }, [activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/bgv/manage?is_new=${activeTab === 'new'}`);
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch BGV records", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/search/employees');
            if (res.ok) {
                const data = await res.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const fetchTypes = async () => {
        try {
            const res = await fetch('/api/bgv/types');
            if (res.ok) {
                const data = await res.json();
                setTypes(data);
            }
        } catch (error) {
            console.error("Failed to fetch types", error);
        }
    };

    const calculateStats = (data: BGVRecord[]) => {
        const s = {
            total: data.length,
            verified: data.filter(r => r.status === 'Verified').length,
            pending: data.filter(r => r.status === 'Pending').length,
            failed: data.filter(r => r.status === 'Failed').length,
        };
        setStats(s);
    };

    const handleSave = async () => {
        if (!formEmployeeId || !formTypeId || !formWay) return alert("All fields are required");

        setIsSaving(true);
        try {
            const res = await fetch('/api/bgv/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employee_id: formEmployeeId,
                    verification_type_id: formTypeId,
                    verification_way: formWay,
                    status: formStatus,
                    remarks: formRemarks
                })
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
                resetForm();
            } else {
                alert("Failed to save verification");
            }
        } catch (error) {
            console.error("Error saving BGV", error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormEmployeeId('');
        setFormTypeId('');
        setFormWay('Call');
        setFormStatus('Pending');
        setFormRemarks('');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Verified': return <span className="status-badge verified"><CheckCircle2 size={12} /> Verified</span>;
            case 'Pending': return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
            case 'Failed': return <span className="status-badge failed"><AlertCircle size={12} /> Failed</span>;
            default: return <span className="status-badge not-started">Not Started</span>;
        }
    };

    const filteredRecords = records.filter(r => 
        (r.employee.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'All' || r.status === statusFilter)
    );

    return (
        <div className="bgv-layout">
            <div className="bgv-header-bar">
                <div className="bgv-header-left">
                    <ClipboardList size={24} color="#3b82f6" />
                    <h1>Manage Background Verification</h1>
                </div>
                <div className="bgv-header-actions">
                    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Add Verification
                    </button>
                </div>
            </div>

            <div className="bgv-stats-grid">
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}><LayoutDashboard size={24} /></div>
                    <div className="bgv-stat-info"><h3>Total</h3><p>{stats.total}</p></div>
                </div>
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}><UserCheck size={24} /></div>
                    <div className="bgv-stat-info"><h3>Verified</h3><p>{stats.verified}</p></div>
                </div>
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><Clock size={24} /></div>
                    <div className="bgv-stat-info"><h3>Pending</h3><p>{stats.pending}</p></div>
                </div>
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><UserMinus size={24} /></div>
                    <div className="bgv-stat-info"><h3>Failed</h3><p>{stats.failed}</p></div>
                </div>
            </div>

            <div className="bgv-tabs">
                <button className={`bgv-tab ${activeTab === 'existing' ? 'active' : ''}`} onClick={() => setActiveTab('existing')}>Existing Employees</button>
                <button className={`bgv-tab ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>New Employees</button>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        <div className="bgv-search-box" style={{ maxWidth: '400px' }}>
                            <Search size={16} className="search-icon" />
                            <input type="text" placeholder="Search employee..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="bgv-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <button className="btn-icon-only" title="Download Excel"><Download size={18} /></button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Sr. No</th>
                            <th>Employee Name</th>
                            <th>Branch/Department</th>
                            <th>Type Name</th>
                            <th>Way</th>
                            <th>Status</th>
                            <th>Verified By</th>
                            <th style={{ width: '120px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Refreshing records...</div>
                                </td>
                            </tr>
                        ) : filteredRecords.length > 0 ? (
                            filteredRecords.map((record, index) => (
                                <tr key={record.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{record.employee.name}</strong></td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#334155' }}>{record.branch?.name || 'N/A'}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{record.department?.name || 'N/A'}</div>
                                    </td>
                                    <td>{record.verificationType.name}</td>
                                    <td>{record.verification_way}</td>
                                    <td>{getStatusBadge(record.status)}</td>
                                    <td>{record.verifier?.name || <span style={{ color: '#94a3b8' }}>-</span>}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="View"><Eye size={16} /></button>
                                            <button className="btn-icon-only" title="Edit"><Edit2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No verification records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content wide" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <ClipboardList size={20} className="text-blue" />
                                Add / Perform Verification
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="bgv-form-grid">
                                <div className="form-group">
                                    <label>Employee Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select className="form-select" value={formEmployeeId} onChange={e => setFormEmployeeId(e.target.value)}>
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Verification Type <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select className="form-select" value={formTypeId} onChange={e => setFormTypeId(e.target.value)}>
                                        <option value="">Select Type</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Verification Way <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select className="form-select" value={formWay} onChange={e => setFormWay(e.target.value)}>
                                        <option value="Call">Call</option>
                                        <option value="Email">Email</option>
                                        <option value="Physical Visit">Physical Visit</option>
                                        <option value="Document Verification">Document Verification</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-select" value={formStatus} onChange={e => setFormStatus(e.target.value)}>
                                        <option value="Pending">Pending</option>
                                        <option value="Verified">Verified</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Verification Details / Documents</label>
                                <button className="btn-upload"><Download size={14} /> Upload Required Documents (ID, Marksheet, etc.)</button>
                            </div>

                            <div className="form-group">
                                <label>Remarks</label>
                                <textarea 
                                    className="form-textarea" 
                                    placeholder="Enter your observations..." 
                                    rows={3}
                                    value={formRemarks}
                                    onChange={e => setFormRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                {isSaving ? 'Processing...' : 'Save Verification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
