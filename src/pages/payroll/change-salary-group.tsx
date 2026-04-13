import { useState, useEffect } from 'react';
import { 
    CheckCircle, AlertTriangle, History,
    RefreshCw, ShieldCheck, ChevronRight, 
    ArrowLeftRight, Layout, Users, ChevronLeft,
    Search, Filter, Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css';

const ChangeSalaryGroup = () => {
    const [groups, setGroups] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [activeTab, setActiveTab] = useState('swipe'); // swipe | history

    // Swipe Stepper State
    const [step, setStep] = useState(1);
    const [fromGroupId, setFromGroupId] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [toGroupId, setToGroupId] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/salary-group-swipe/stats');
            setGroups(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Group telemetry synchronization failed");
        }
    };

    const fetchEmployeesByGroup = async (groupId: string) => {
        setFetching(true);
        try {
            const res = await api.get(`/salary-group-swipe/employees?group_id=${groupId}`);
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Staff roster extraction failed");
        } finally {
            setFetching(false);
        }
    };

    const fetchLogs = async () => {
        setFetching(true);
        try {
            const res = await api.get('/salary-group-swipe/logs');
            setLogs(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Transition journal unreachable");
        } finally {
            setFetching(false);
        }
    };

    const handleNextStep = () => {
        if (step === 1 && !fromGroupId) {
            toast.error("Select a source hierarchy first");
            return;
        }
        if (step === 2 && selectedEmployees.length === 0) {
            toast.error("Select at least one staff node for transition");
            return;
        }
        setStep(step + 1);
    };

    const handleSwipe = async () => {
        if (!toGroupId) {
            toast.error("Destination hierarchy required");
            return;
        }
        setLoading(true);
        try {
            await api.post('/salary-group-swipe/swipe', {
                employee_ids: selectedEmployees,
                new_group_id: toGroupId,
                reason
            });
            toast.success("Structural transition executed successfully");
            setStep(1);
            setFromGroupId('');
            setSelectedEmployees([]);
            setToGroupId('');
            setReason('');
            fetchInitialData();
        } catch (error) {
            toast.error("Swipe operation aborted. Protocol mismatch.");
        } finally {
            setLoading(false);
        }
    };

    const toggleEmployee = (empId: number) => {
        setSelectedEmployees(prev => 
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedEmployees.length === employees.length) {
            setSelectedEmployees([]);
        } else {
            setSelectedEmployees(employees.map(e => e.user?.id).filter(id => id !== undefined));
        }
    };

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <ArrowLeftRight className="title-icon" />
                    </div>
                    <div>
                        <h1>Salary Group Swipe</h1>
                        <p className="subtitle">Execute seamless bulk transitions across salary frameworks</p>
                    </div>
                </div>
                <div className="tab-switcher">
                    <button className={activeTab === 'swipe' ? 'active' : ''} onClick={() => { setActiveTab('swipe'); setStep(1); }}>
                        <RefreshCw size={16} /> Swipe Wizard
                    </button>
                    <button className={activeTab === 'history' ? 'active' : ''} onClick={() => { setActiveTab('history'); fetchLogs(); }}>
                        <History size={16} /> Audit Trail
                    </button>
                </div>
            </header>

            {activeTab === 'swipe' ? (
                <div className="swipe-wizard animate-in">
                    <div className="glass-card" style={{ marginBottom: '32px' }}>
                        <div className="stepper-track" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 40px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`step-node ${step >= i ? 'active' : ''} ${step > i ? 'verified' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
                                    <div className="node-circle" style={{ 
                                        width: '40px', height: '40px', borderRadius: '50%', background: step > i ? '#10b981' : (step === i ? '#6366f1' : 'white'), 
                                        border: '2px solid', borderColor: step >= i ? (step > i ? '#10b981' : '#6366f1') : '#e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= i ? 'white' : '#94a3b8', fontWeight: 800,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}>
                                        {step > i ? <CheckCircle size={20} /> : i}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: step >= i ? '#1e293b' : '#94a3b8' }}>
                                        {i === 1 ? 'Archetype' : i === 2 ? 'Population' : 'Finalization'}
                                    </span>
                                </div>
                            ))}
                            <div style={{ position: 'absolute', top: '20px', left: '80px', right: '80px', height: '2px', background: '#e2e8f0', zIndex: 1 }}>
                                <div style={{ width: `${(step - 1) * 50}%`, height: '100%', background: '#6366f1', transition: 'width 0.5s ease' }} />
                            </div>
                        </div>
                    </div>

                    <div className="step-execution-area">
                        {step === 1 && (
                            <div className="animate-in">
                                <div className="section-instruction" style={{ marginBottom: '24px', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Define Source Cluster</h3>
                                    <p style={{ color: '#64748b' }}>Select the salary group you wish to migrate staff from</p>
                                </div>
                                <div className="group-architecture-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {groups.map((g: any) => (
                                        <div 
                                            key={g.id} 
                                            className={`arch-card glass-card ${fromGroupId === String(g.id) ? 'selected' : ''}`}
                                            onClick={() => { setFromGroupId(String(g.id)); fetchEmployeesByGroup(String(g.id)); }}
                                            style={{ cursor: 'pointer', transition: 'all 0.2s', border: fromGroupId === String(g.id) ? '2px solid #6366f1' : '1px solid #e2e8f0', padding: '24px' }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <div style={{ padding: '10px', background: '#f5f3ff', borderRadius: '12px', color: '#6366f1' }}><Layout size={24} /></div>
                                                <div className="badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 800 }}>{g._count?.employeeCTCs || 0} Nodes</div>
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: '18px', color: '#1e293b' }}>{g.name}</div>
                                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{g.payroll_frequency} Disbursement Hub</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="wizard-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                                    <button className="btn-primary" style={{ padding: '16px 48px', fontSize: '16px' }} onClick={handleNextStep} disabled={!fromGroupId}>
                                        <span>Deploy Population Select</span> <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-in">
                                <div className="glass-card" style={{ padding: '0' }}>
                                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontWeight: 800 }}>Population Selection</h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{selectedEmployees.length} of {employees.length} nodes ready for hub-swipe</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-secondary" onClick={toggleSelectAll}>{selectedEmployees.length === employees.length ? 'Discard All' : 'Select Complete Set'}</button>
                                        </div>
                                    </div>
                                    <div className="staff-roster" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {employees.length > 0 ? employees.map((e: any) => (
                                            <div 
                                                key={e.user?.id} 
                                                className={`roster-row ${selectedEmployees.includes(e.user?.id) ? 'active' : ''}`}
                                                onClick={() => toggleEmployee(e.user?.id)}
                                                style={{ 
                                                    padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer',
                                                    borderBottom: '1px solid #f1f5f9', background: selectedEmployees.includes(e.user?.id) ? '#f5f3ff' : 'transparent',
                                                    transition: 'all 0.15s ease'
                                                }}
                                            >
                                                <div style={{ 
                                                    width: '24px', height: '24px', borderRadius: '6px', border: '2px solid #cbd5e1',
                                                    background: selectedEmployees.includes(e.user?.id) ? '#6366f1' : 'white',
                                                    borderColor: selectedEmployees.includes(e.user?.id) ? '#6366f1' : '#cbd5e1',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                                }}>
                                                    {selectedEmployees.includes(e.user?.id) && <CheckCircle size={14} />}
                                                </div>
                                                <div className="avatar" style={{ background: '#e2e8f0', color: '#64748b' }}>{e.user?.name?.charAt(0)}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 800 }}>{e.user?.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{e.user?.email} • {e.user?.department?.name || 'Unassigned'}</div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>₹{e.gross_salary?.toLocaleString()}</div>
                                            </div>
                                        )) : <div style={{ padding: '80px', textAlign: 'center', opacity: 0.5 }}><Users size={48} /><p>No population data available for this cluster.</p></div>}
                                    </div>
                                </div>
                                <div className="wizard-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={20} /> Back to Archetype</button>
                                    <button className="btn-primary" style={{ padding: '16px 32px' }} onClick={handleNextStep} disabled={selectedEmployees.length === 0}>
                                        <span>Initialize Protocol Transition</span> <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-in">
                                <div className="protocol-confirmation glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                        <div style={{ display: 'inline-flex', padding: '20px', background: '#fff7ed', color: '#ea580c', borderRadius: '24px', marginBottom: '20px' }}><AlertTriangle size={48} /></div>
                                        <h3 style={{ fontSize: '24px', fontWeight: 900 }}>Critical Action Confirmation</h3>
                                        <p style={{ color: '#64748b' }}>You are executing a bulk structural transition for <strong>{selectedEmployees.length} staff nodes.</strong></p>
                                    </div>
                                    
                                    <div className="confirmation-form" style={{ display: 'grid', gap: '24px' }}>
                                        <div className="form-group">
                                            <label style={{ color: '#10b981', fontWeight: 800 }}>Destination Cluster *</label>
                                            <select value={toGroupId} onChange={(e) => setToGroupId(e.target.value)} style={{ padding: '16px', fontSize: '16px', fontWeight: 700, border: '2px solid #10b981' }}>
                                                <option value="">Select Target Hierarchy...</option>
                                                {groups.filter(g => String(g.id) !== fromGroupId).map((g: any) => (
                                                    <option key={g.id} value={g.id}>{g.name} ({g.payroll_frequency})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Administrative Reason / Justification</label>
                                            <textarea 
                                                placeholder="Document the protocol shift rationale..." 
                                                value={reason} 
                                                onChange={(e) => setReason(e.target.value)}
                                                rows={4}
                                                style={{ padding: '16px' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="wizard-actions" style={{ marginTop: '48px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                    <button className="btn-secondary" style={{ padding: '0 32px' }} onClick={() => setStep(2)}>Adjust Population</button>
                                    <button className="btn-primary" style={{ padding: '20px 64px', background: '#0f172a', fontSize: '18px' }} onClick={handleSwipe} disabled={!toGroupId || loading}>
                                        <div className="btn-icon-bg">{loading ? <Loader2 size={24} className="spin" /> : <ShieldCheck size={24} />}</div>
                                        <span style={{ marginLeft: '12px' }}>Finalize & Execute Swipe</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="history-journal animate-in">
                    <div className="glass-card">
                        <div className="table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Staff Identity</th>
                                        <th>Source Hub</th>
                                        <th>Target Hub</th>
                                        <th>Rationalization</th>
                                        <th>Timestamp</th>
                                        <th style={{ textAlign: 'right' }}>Ops Admin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.length > 0 ? logs.map((log: any) => (
                                        <tr key={log.id}>
                                            <td>
                                                <div className="employee-info">
                                                    <div className="avatar" style={{ background: '#f8fafc', color: '#64748b' }}>{log.user?.name?.charAt(0)}</div>
                                                    <div style={{ fontWeight: 700 }}>{log.user?.name}</div>
                                                </div>
                                            </td>
                                            <td><span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>{log.oldGroup?.name}</span></td>
                                            <td><span className="badge" style={{ background: '#dcfce7', color: '#166534' }}>{log.newGroup?.name}</span></td>
                                            <td style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px' }} title={log.reason}>{log.reason || 'Auto-Transition'}</td>
                                            <td>{new Date(log.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{log.admin?.name || 'Root System'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="no-data">
                                                <History size={40} style={{opacity: 0.2, marginBottom: '10px'}} />
                                                <p>Log journal is currently empty.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChangeSalaryGroup;
