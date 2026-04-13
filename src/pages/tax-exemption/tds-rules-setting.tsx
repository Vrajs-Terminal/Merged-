import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, CheckSquare, Settings2, Users, IndianRupee, AlertTriangle, Briefcase, Eye, Edit2, Download, CheckCircle2, ShieldAlert, Check, X } from 'lucide-react';
import api from '../../lib/axios';
import './tds-rules-setting.css'; /* Include shared CSS paradigms from tax-regime-setting.css */
import { toast } from 'react-hot-toast';

interface EmployeeTdsData {
    user_id: number;
    name: string;
    email: string;
    department: string;
    annual_ctc: number;
    tax_regime: string;
    deduction_rule: string;
    status: string;
    estimated_yearly_tds: number;
}

const TdsRulesSetting = () => {
    const [data, setData] = useState<EmployeeTdsData[]>([]);
    const [globalRule, setGlobalRule] = useState<any>({});
    const [stats, setStats] = useState({ total: 0, monthly_tds: 0, low_ctc: 0, rule_missing: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingRules, setLoadingRules] = useState(true);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        search: '',
        financial_year: '2025-26',
        min_ctc: '',
        max_ctc: ''
    });

    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<EmployeeTdsData | null>(null);

    useEffect(() => {
        fetchPreferences();
        fetchGlobalRules();
        fetchData();
    }, [filters.financial_year]);

    const fetchPreferences = async () => {
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchGlobalRules = async () => {
        setLoadingRules(true);
        try {
            const res = await api.get(`/payroll/tds-rules/global-rules/${filters.financial_year}`);
            setGlobalRule(res.data);
        } catch (error) {
            toast.error("Failed to load global rules");
        } finally {
            setLoadingRules(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tds-rules/employee-rules', { params: filters });
            setData(res.data.data);
            setStats(res.data.stats);
            setSelectedRows([]);
        } catch (error) {
            toast.error("Failed to fetch Employee rules");
        } finally {
            setLoading(false);
        }
    };

    const saveGlobalRules = async () => {
        try {
            await api.put(`/payroll/tds-rules/global-rules/${filters.financial_year}`, globalRule);
            toast.success("Global rules updated successfully");
            fetchData(); // Refresh table since auto-apply might trigger changes in backend context
        } catch (error) {
            toast.error("Failed to update global rules");
        }
    };

    const handleBulkUpdate = async (rule: string) => {
        if (selectedRows.length === 0) return toast.error("Select employees first");
        try {
            await api.put('/payroll/tds-rules/employee-rules/bulk', {
                user_ids: selectedRows,
                financial_year: filters.financial_year,
                deduction_rule: rule
            });
            toast.success(`Bulk updated selected employees to ${rule} deduction`);
            fetchData();
        } catch (error) {
            toast.error("Failed to bulk update");
        }
    };

    const saveUserRule = async () => {
        if (!editingUser) return;
        try {
            await api.put(`/payroll/tds-rules/employee-rules/${editingUser.user_id}`, {
                financial_year: filters.financial_year,
                deduction_rule: editingUser.deduction_rule,
                estimated_yearly_tds: editingUser.estimated_yearly_tds
            });
            toast.success("TDS rule updated");
            setDrawerOpen(false);
            fetchData();
        } catch (error) {
            toast.error("Failed to update user rule");
        }
    };

    const getRecommendation = (ctc: number) => {
        if (ctc < 500000) return "No TDS required (Below Threshold)";
        if (ctc < 1000000) return "Suggest Quarterly Deductions to ease burden";
        return "Suggest Monthly Deductions";
    };

    const getFrequencyText = (rule: string) => {
        if (rule === 'Monthly') return '12 Deductions / Year';
        if (rule === 'Quarterly') return '4 Deductions / Year';
        if (rule === 'Year-End') return '1 Deduction / Year';
        return 'Not Set';
    };

    return (
        <div className="tds-layout">
            <div className="tds-container">
                <div className="tds-header">
                    <div>
                        <h2>TDS Deduction Rules Setting</h2>
                        <p>Configure tax deduction cycles and rules for Financial Year {filters.financial_year}</p>
                    </div>
                </div>

                {/* Global Rule Setup Panel */}
                <div className="global-rules-panel">
                    <div className="global-rules-header">
                        <h3><Settings2 size={18} /> Global Rule Configuration</h3>
                        <button className="save-btn" onClick={saveGlobalRules}>Save Config</button>
                    </div>
                    {!loadingRules && (
                        <div className="rules-grid">
                            <div className="rule-input-group">
                                <label>Min. CTC (New Regime)</label>
                                <div className="input-wrapper">
                                    <span className="input-prefix">₹</span>
                                    <input 
                                        type="number" 
                                        className="rule-input has-prefix" 
                                        value={globalRule.min_ctc_new_regime || ''}
                                        onChange={e => setGlobalRule({...globalRule, min_ctc_new_regime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="rule-input-group">
                                <label>Min. CTC (Old Regime)</label>
                                <div className="input-wrapper">
                                    <span className="input-prefix">₹</span>
                                    <input 
                                        type="number" 
                                        className="rule-input has-prefix" 
                                        value={globalRule.min_ctc_old_regime || ''}
                                        onChange={e => setGlobalRule({...globalRule, min_ctc_old_regime: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="rule-input-group">
                                <label>Default Deduction Cycle</label>
                                <select 
                                    className="rule-input"
                                    value={globalRule.default_cycle || 'Monthly'}
                                    onChange={e => setGlobalRule({...globalRule, default_cycle: e.target.value})}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Year-End">Year-End</option>
                                </select>
                            </div>
                            <div className="rule-input-group">
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Auto-Apply Rules Based on CTC</label>
                                <div 
                                    style={{ 
                                        width: 50, height: 26, background: globalRule.auto_apply_ctc_rules ? '#10b981' : '#cbd5e1', 
                                        borderRadius: 20, position: 'relative', cursor: 'pointer', transition: '0.3s',
                                        display: 'flex', alignItems: 'center', padding: '0 4px'
                                    }}
                                    onClick={() => setGlobalRule({...globalRule, auto_apply_ctc_rules: !globalRule.auto_apply_ctc_rules})}
                                >
                                    <div style={{ 
                                        width: 20, height: 20, background: 'white', borderRadius: '50%', 
                                        transform: globalRule.auto_apply_ctc_rules ? 'translateX(24px)' : 'translateX(0)',
                                        transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }} />
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: globalRule.auto_apply_ctc_rules ? '#10b981' : '#64748b', marginTop: 8, display: 'inline-block' }}>
                                    {globalRule.auto_apply_ctc_rules ? 'Rules Auto-Apply ON' : 'Rules Auto-Apply OFF'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligent Summary Cards */}
                <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#475569' }}><Users size={24} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Employees</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{stats.total}</p>
                        </div>
                    </div>
                    <div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7', color: '#16a34a' }}><IndianRupee size={24} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Est. Monthly TDS Pool</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>₹{Math.round(stats.monthly_tds).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#2563eb' }}><ShieldAlert size={24} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Low CTC (No TDS)</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{stats.low_ctc}</p>
                        </div>
                    </div>
                    <div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', color: '#ef4444' }}><AlertTriangle size={24} /></div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Rule Missing</h4>
                            <p style={{ margin: '4px 0 0 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{stats.rule_missing}</p>
                        </div>
                    </div>
                </div>

                {/* Smart Filter Panel */}
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <select className="filter-chip-select" value={filters.financial_year} onChange={e => setFilters({...filters, financial_year: e.target.value})}>
                        <option value="2025-26">FY 2025–26</option>
                        <option value="2024-25">FY 2024–25</option>
                    </select>

                    <select className="filter-chip-select" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
                        <option value="">Branch (All)</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>CTC Range:</span>
                        <input type="number" placeholder="Min ₹" style={{ width: '80px', border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }} value={filters.min_ctc} onChange={e => setFilters({...filters, min_ctc: e.target.value})} />
                        <span style={{ color: '#cbd5e1' }}>-</span>
                        <input type="number" placeholder="Max ₹" style={{ width: '80px', border: 'none', background: 'transparent', outline: 'none', fontSize: 13 }} value={filters.max_ctc} onChange={e => setFilters({...filters, max_ctc: e.target.value})} />
                    </div>

                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input type="text" placeholder="Search employee..." style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: 13, outline: 'none', background: '#f8fafc' }} value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
                    </div>

                    <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: '#1e293b', color: 'white' }} onClick={fetchData}><Filter size={16}/> Filter</button>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', background: '#f1f5f9', color: '#475569' }} onClick={() => setFilters({ ...filters, branch_id: '', department_id: '', search: '', min_ctc: '', max_ctc: '' })}><RefreshCw size={16}/> Reset</button>
                </div>

                {/* Bulk Actions */}
                <div style={{ background: 'white', padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        <input type="checkbox" checked={selectedRows.length === data.length && data.length > 0} onChange={e => e.target.checked ? setSelectedRows(data.map(d => d.user_id)) : setSelectedRows([])} style={{ width: 16, height: 16, accentColor: '#3b82f6' }} />
                        <span>{selectedRows.length} Selected</span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid transparent', background: '#3b82f6', color: 'white' }} onClick={() => handleBulkUpdate('Monthly')}><CheckSquare size={16}/> Set Monthly</button>
                        <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid transparent', background: '#3b82f6', color: 'white' }} onClick={() => handleBulkUpdate('Quarterly')}><CheckSquare size={16}/> Set Quarterly</button>
                        <button style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#475569' }}><Download size={16}/> Export Rules</button>
                    </div>
                </div>

                {/* Employee Table */}
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: 40 }}></th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>CTC & Regime</th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Deduction Rule</th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Est. Yearly TDS</th>
                                <th style={{ background: '#f8fafc', padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No employees found.</td></tr>
                            ) : data.map(user => (
                                <tr key={user.user_id}>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <input type="checkbox" checked={selectedRows.includes(user.user_id)} onChange={e => {
                                            if (e.target.checked) setSelectedRows([...selectedRows, user.user_id]);
                                            else setSelectedRows(selectedRows.filter(id => id !== user.user_id));
                                        }} style={{ width: 16, height: 16, accentColor: '#3b82f6' }} />
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>{user.name.charAt(0)}</div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{user.name}</p>
                                                <span style={{ fontSize: 12, color: '#64748b' }}><Briefcase size={12} style={{ display: 'inline', marginRight: 4 }}/>{user.department}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 13 }}>₹{user.annual_ctc.toLocaleString()}</p>
                                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, marginTop: 4, background: user.tax_regime === 'New' ? '#dcfce7' : user.tax_regime === 'Old' ? '#dbeafe' : '#f1f5f9', color: user.tax_regime === 'New' ? '#16a34a' : user.tax_regime === 'Old' ? '#2563eb' : '#64748b' }}>
                                            {user.tax_regime} Regime
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <span className="td-freq">{user.deduction_rule}</span><br />
                                        <span className="td-sub-freq">{getFrequencyText(user.deduction_rule)}</span>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: user.status === 'Active' ? '#dcfce7' : user.status === 'Locked' ? '#e5e7eb' : '#fef3c7', color: user.status === 'Active' ? '#16a34a' : user.status === 'Locked' ? '#4b5563' : '#d97706' }}>
                                            {user.status === 'Active' ? <CheckCircle2 size={12}/> : user.status === 'Not Configured' ? <AlertTriangle size={12}/> : <ShieldAlert size={12}/>} {user.status}
                                        </span>
                                        {user.status === 'Not Configured' && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>Rule missing</div>}
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>
                                        <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{user.estimated_yearly_tds.toLocaleString()}</span>
                                    </td>
                                    <td style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }} onClick={() => {setEditingUser({...user}); setDrawerOpen(true);}}><Edit2 size={16} /></button>
                                            <button style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><Eye size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Smart Drawer for Edit Rule */}
            {drawerOpen && editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(2px)' }} onClick={() => setDrawerOpen(false)}>
                    <div style={{ background: 'white', width: 450, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: 24, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Employee TDS Setup</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }} onClick={() => setDrawerOpen(false)}><X size={20} /></button>
                        </div>
                        <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>{editingUser.name.charAt(0)}</div>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: '#1e293b', fontSize: 16 }}>{editingUser.name}</p>
                                    <span style={{ fontSize: 12, color: '#64748b' }}>CTC: ₹{editingUser.annual_ctc.toLocaleString()} | {editingUser.tax_regime} Regime</span>
                                </div>
                            </div>

                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Deduction Rule Frequency</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['Monthly', 'Quarterly', 'Year-End'].map(r => (
                                        <button 
                                            key={r}
                                            className={`freq-chip ${editingUser.deduction_rule === r ? 'active' : ''}`}
                                            onClick={() => setEditingUser({...editingUser, deduction_rule: r})}
                                        >
                                            {r === editingUser.deduction_rule && <Check size={14} style={{ marginRight: 4 }}/>} {r}
                                        </button>
                                    ))}
                                </div>
                                
                                <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <AlertTriangle size={16} color="#3b82f6" style={{ marginTop: 2 }} />
                                    <div>
                                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#0f172a' }}>Auto TDS Suggestion</p>
                                        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{getRecommendation(editingUser.annual_ctc)}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 12 }}>Estimated Yearly TDS</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 500 }}>₹</span>
                                    <input 
                                        type="number" 
                                        style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                        value={editingUser.estimated_yearly_tds}
                                        onChange={e => setEditingUser({...editingUser, estimated_yearly_tds: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                                {editingUser.estimated_yearly_tds > 0 && editingUser.deduction_rule !== 'Not Set' && (
                                    <p style={{ margin: '12px 0 0 0', fontSize: 12, color: '#10b981', fontWeight: 500 }}>
                                        Per Deduction Est: ₹
                                        {editingUser.deduction_rule === 'Monthly' 
                                            ? Math.round(editingUser.estimated_yearly_tds / 12).toLocaleString()
                                            : editingUser.deduction_rule === 'Quarterly'
                                            ? Math.round(editingUser.estimated_yearly_tds / 4).toLocaleString()
                                            : editingUser.estimated_yearly_tds.toLocaleString()}
                                    </p>
                                )}
                            </div>

                        </div>
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f8fafc' }}>
                            <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#f1f5f9', color: '#475569' }} onClick={() => setDrawerOpen(false)}>Cancel</button>
                            <button style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#3b82f6', color: 'white' }} onClick={saveUserRule}>Save TDS Rule</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TdsRulesSetting;
