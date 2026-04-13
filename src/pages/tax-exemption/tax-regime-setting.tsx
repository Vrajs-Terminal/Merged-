import { useState, useEffect } from 'react';
import { 
    Search, Filter, ShieldCheck, Mail, Edit2, 
    Download, CheckSquare, X, RefreshCw, AlertCircle, Building, Layers,
    Users, Eye
} from 'lucide-react';
import api from '../../lib/axios';
import './tax-regime-setting.css';
import { toast } from 'react-hot-toast';

interface TaxRegimeData {
    user_id: number;
    name: string;
    email: string;
    designation: string;
    department: string;
    branch: string;
    salary_type: string;
    gross_salary: number;
    tax_regime: string;
    metro_type: string;
    declaration_status: string;
    lock_status: boolean;
    financial_year: string;
}

const TaxRegimeSetting = () => {
    const [data, setData] = useState<TaxRegimeData[]>([]);
    const [stats, setStats] = useState({ total: 0, new_regime: 0, old_regime: 0, not_assigned: 0 });
    const [loading, setLoading] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        search: '',
        salary_type: '',
        tax_regime: '',
        financial_year: '2025-26'
    });

    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<TaxRegimeData | null>(null);

    // Initial load
    useEffect(() => {
        fetchPreferences();
        fetchData();
    }, []);

    const fetchPreferences = async () => {
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (error) {
            console.error("Failed to fetch branches/departments");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-regimes', { params: filters });
            setData(res.data.data);
            setStats(res.data.stats);
            setSelectedRows([]); // Reset selection on new fetch
        } catch (error) {
            toast.error("Failed to fetch Tax Regimes");
        } finally {
            setLoading(false);
        }
    };

    const openDrawer = (user: TaxRegimeData) => {
        setEditingUser({ ...user });
        setDrawerOpen(true);
    };

    const saveRegime = async () => {
        if (!editingUser) return;
        try {
            await api.put(`/payroll/tax-regimes/${editingUser.user_id}`, {
                financial_year: editingUser.financial_year,
                tax_regime: editingUser.tax_regime,
                metro_type: editingUser.metro_type,
                declaration_status: editingUser.declaration_status
            });
            toast.success("Employee Tax Regime updated");
            setDrawerOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to update Tax Regime");
        }
    };

    const handleBulkUpdate = async (regime: string) => {
        if (selectedRows.length === 0) return toast.error("Select employees first");
        try {
            await api.put('/payroll/tax-regimes/bulk', {
                user_ids: selectedRows,
                financial_year: filters.financial_year,
                tax_regime: regime
            });
            toast.success(`Bulk updated selected employees to ${regime} Regime`);
            fetchData();
        } catch (error) {
            toast.error("Failed to bulk update");
        }
    };

    // Table toggle handlers mimicking the inline switches
    const toggleRegime = async (user: TaxRegimeData, newRegime: string) => {
        try {
            await api.put(`/payroll/tax-regimes/${user.user_id}`, {
                financial_year: user.financial_year,
                tax_regime: newRegime
            });
            fetchData();
            toast.success("Regime toggled");
        } catch (error) {
            toast.error("Failed to toggle regime");
        }
    };

    const toggleMetro = async (user: TaxRegimeData, newMetro: string) => {
        try {
            await api.put(`/payroll/tax-regimes/${user.user_id}`, {
                financial_year: user.financial_year,
                metro_type: newMetro
            });
            fetchData();
            toast.success("Metro type toggled");
        } catch (error) {
            toast.error("Failed to toggle metro type");
        }
    };

    return (
        <div className="tax-regime-layout">
            <div className="tax-regime-container">
                <div className="tax-header">
                    <div>
                        <h2>Tax Regime Setting</h2>
                        <p>Configure tax structures and investment declarations for Financial Year {filters.financial_year}</p>
                    </div>
                </div>

                {/* Smart Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="card-icon total"><Users size={24} /></div>
                        <div className="card-info">
                            <h4>Total Employees</h4>
                            <p>{stats.total}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="card-icon new"><ShieldCheck size={24} /></div>
                        <div className="card-info">
                            <h4>New Regime</h4>
                            <p>{stats.new_regime}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="card-icon old"><ShieldCheck size={24} /></div>
                        <div className="card-info">
                            <h4>Old Regime</h4>
                            <p>{stats.old_regime}</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="card-icon pending"><AlertCircle size={24} /></div>
                        <div className="card-info">
                            <h4>Not Assigned</h4>
                            <p>{stats.not_assigned}</p>
                        </div>
                    </div>
                </div>

                {/* Smart Filter Panel (Top Section) */}
                <div className="smart-filters">
                    <select 
                        className="filter-chip-select"
                        value={filters.financial_year}
                        onChange={(e) => setFilters({...filters, financial_year: e.target.value})}
                    >
                        <option value="2025-26">FY 2025–26</option>
                        <option value="2024-25">FY 2024–25</option>
                    </select>

                    <select 
                        className="filter-chip-select"
                        value={filters.branch_id}
                        onChange={(e) => setFilters({...filters, branch_id: e.target.value})}
                    >
                        <option value="">Branch (All)</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <select 
                        className="filter-chip-select"
                        value={filters.department_id}
                        onChange={(e) => setFilters({...filters, department_id: e.target.value})}
                    >
                        <option value="">Department (All)</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>

                    <select 
                        className="filter-chip-select"
                        value={filters.tax_regime}
                        onChange={(e) => setFilters({...filters, tax_regime: e.target.value})}
                    >
                        <option value="">Tax Regime (All)</option>
                        <option value="New">New Regime</option>
                        <option value="Old">Old Regime</option>
                        <option value="Not Assigned">Not Assigned</option>
                    </select>

                    <div className="search-input-wrapper">
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input 
                            type="text" 
                            placeholder="Search employee..." 
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>

                    <button className="btn-filter" onClick={fetchData}><Filter size={16}/> Apply Filters</button>
                    <button className="btn-reset" onClick={() => {
                        setFilters({ ...filters, branch_id: '', department_id: '', search: '', tax_regime: '', salary_type: '' });
                    }}><RefreshCw size={16}/> Reset</button>
                </div>

                {/* Bulk Actions Bar */}
                <div className="bulk-actions-bar">
                    <div className="bulk-left">
                        <input 
                            type="checkbox" 
                            checked={selectedRows.length === data.length && data.length > 0}
                            onChange={(e) => {
                                if (e.target.checked) setSelectedRows(data.map(d => d.user_id));
                                else setSelectedRows([]);
                            }}
                        />
                        <span>{selectedRows.length} Selected</span>
                    </div>
                    <div className="bulk-buttons">
                        <button className="btn-bulk-primary" onClick={() => handleBulkUpdate('New')}><CheckSquare size={16}/> Set New Regime</button>
                        <button className="btn-bulk-primary" onClick={() => handleBulkUpdate('Old')}><CheckSquare size={16}/> Set Old Regime</button>
                        <button className="btn-bulk-secondary"><Mail size={16}/> Send Reminder</button>
                        <button className="btn-bulk-secondary"><Download size={16}/> Export</button>
                    </div>
                </div>

                {/* Employee Tax Regime Table */}
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Salary & Tax Regime</th>
                                <th>Metro Type</th>
                                <th>Declaration</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        Loading Data...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No matching employees found.
                                    </td>
                                </tr>
                            ) : data.map((user) => (
                                <tr key={user.user_id}>
                                    <td>
                                        <input 
                                            type="checkbox"
                                            checked={selectedRows.includes(user.user_id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedRows([...selectedRows, user.user_id]);
                                                else setSelectedRows(selectedRows.filter(id => id !== user.user_id));
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div className="employee-info">
                                            <div className="emp-avatar">{user.name.charAt(0)}</div>
                                            <div className="emp-details">
                                                <p>{user.name}</p>
                                                <span>{user.designation}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px' }}>
                                            <Building size={14} color="#64748b" />
                                            {user.department}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600 }}>₹{user.gross_salary.toLocaleString()} / mo</span>
                                            <div className="toggle-group">
                                                <button 
                                                    className={`toggle-btn ${user.tax_regime === 'Old' ? 'active' : ''}`}
                                                    onClick={() => toggleRegime(user, 'Old')}
                                                >Old</button>
                                                <button 
                                                    className={`toggle-btn ${user.tax_regime === 'New' ? 'active' : ''}`}
                                                    onClick={() => toggleRegime(user, 'New')}
                                                >New</button>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="toggle-group">
                                            <button 
                                                className={`toggle-btn ${user.metro_type === 'Metro' ? 'active' : ''}`}
                                                onClick={() => toggleMetro(user, 'Metro')}
                                            >🏙 Metro</button>
                                            <button 
                                                className={`toggle-btn ${user.metro_type === 'Non-Metro' ? 'active' : ''}`}
                                                onClick={() => toggleMetro(user, 'Non-Metro')}
                                            >🌆 Non-Metro</button>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-status ${user.declaration_status.toLowerCase().replace(' ', '-')}`}>
                                            {user.declaration_status === 'Submitted' ? '✅' : user.declaration_status === 'Pending' ? '⏳' : '❌'} {user.declaration_status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn" title="Edit Tax Setup" onClick={() => openDrawer(user)}><Edit2 size={16} /></button>
                                            <button className="action-btn" title="View Declarations"><Eye size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Drawer for Employee Tax Setup */}
            {drawerOpen && editingUser && (
                <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
                    <div className="drawer-content" onClick={e => e.stopPropagation()}>
                        <div className="drawer-header">
                            <h3>Employee Tax Setup</h3>
                            <button className="btn-close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="drawer-body">
                            <div className="employee-info" style={{ marginBottom: '10px' }}>
                                <div className="emp-avatar" style={{ background: '#0f172a', width: '48px', height: '48px', fontSize: '18px' }}>
                                    {editingUser.name.charAt(0)}
                                </div>
                                <div className="emp-details">
                                    <p style={{ fontSize: '16px' }}>{editingUser.name}</p>
                                    <span>{editingUser.email}</span>
                                </div>
                            </div>

                            <div className="form-group-card">
                                <label>Financial Year</label>
                                <input type="text" className="filter-chip-select" style={{ width: '100%', background: '#f1f5f9' }} value={editingUser.financial_year} disabled />
                            </div>

                            <div className="form-group-card">
                                <label>Tax Regime Optimization</label>
                                <div className="huge-toggle">
                                    <button 
                                        className={editingUser.tax_regime === 'Old' ? 'active' : ''}
                                        onClick={() => setEditingUser({...editingUser, tax_regime: 'Old'})}
                                    >Old Regime</button>
                                    <button 
                                        className={editingUser.tax_regime === 'New' ? 'active' : ''}
                                        onClick={() => setEditingUser({...editingUser, tax_regime: 'New'})}
                                    >New Regime</button>
                                </div>
                                
                                {editingUser.gross_salary < 700000 && (
                                    <div className="ai-suggestion">
                                        <AlertCircle size={16} color="#0f766e" style={{ marginTop: '2px' }} />
                                        <p><strong>Smart Suggestion:</strong> Since the employee's gross income is under ₹7 Lakhs, the <strong>New Regime</strong> is generally more beneficial as it results in zero tax liability.</p>
                                    </div>
                                )}
                            </div>

                            <div className="form-group-card">
                                <label>Metro City Type (For HRA)</label>
                                <div className="huge-toggle">
                                    <button 
                                        className={editingUser.metro_type === 'Metro' ? 'active' : ''}
                                        onClick={() => setEditingUser({...editingUser, metro_type: 'Metro'})}
                                    >🏙 Metro</button>
                                    <button 
                                        className={editingUser.metro_type === 'Non-Metro' ? 'active' : ''}
                                        onClick={() => setEditingUser({...editingUser, metro_type: 'Non-Metro'})}
                                    >🌆 Non-Metro</button>
                                </div>
                            </div>

                            <div className="form-group-card">
                                <label>Investment Declaration Status</label>
                                <select 
                                    className="filter-chip-select" 
                                    style={{ width: '100%' }}
                                    value={editingUser.declaration_status}
                                    onChange={(e) => setEditingUser({...editingUser, declaration_status: e.target.value})}
                                >
                                    <option value="Not Submitted">Not Submitted</option>
                                    <option value="Pending">Pending Review</option>
                                    <option value="Submitted">Submitted & Approved</option>
                                </select>
                            </div>

                        </div>
                        <div className="drawer-footer">
                            <button className="btn-reset" onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button className="btn-bulk-primary" onClick={saveRegime}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaxRegimeSetting;
