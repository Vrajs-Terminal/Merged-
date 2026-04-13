import { useState, useEffect } from 'react';
import { 
    FileText, User, Printer, Save, Plus, Trash2, 
    TrendingUp, TrendingDown, Wallet, RefreshCw,
    Calendar, Info, ChevronRight, Briefcase
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './payroll-modules.css';

const FFSettlement = () => {
    const [employees, setEmployees] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('process'); // process | history
    const [loading, setLoading] = useState(false);
    
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [settlementData, setSettlementData] = useState({
        resignation_date: '',
        last_working_day: '',
        items: [] as any[],
        remarks: ''
    });

    useEffect(() => {
        fetchInitialData();
        fetchHistory();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/auth/users');
            setEmployees(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/ff-settlement');
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            toast.error("Failed to fetch settlement history");
        } finally {
            setLoading(false);
        }
    };

    const handleEmployeeSelect = async (userId: string) => {
        if (!userId) {
            setSelectedEmployee(null);
            return;
        }
        setLoading(true);
        try {
            const emp = (employees as any).find((e: any) => e.id === parseInt(userId));
            setSelectedEmployee(emp);
            
            // Auto-calculate components
            const res = await api.get(`/ff-settlement/calculate/${userId}`);
            setSettlementData({
                ...settlementData,
                items: res.data.findings || []
            });
        } catch (error) {
            toast.error("Failed to auto-calculate settlement");
            setSettlementData({...settlementData, items: []});
        } finally {
            setLoading(false);
        }
    };

    const addItem = (type: 'Earning' | 'Deduction') => {
        setSettlementData({
            ...settlementData,
            items: [...settlementData.items, { name: '', type, amount: 0, remarks: '' }]
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...settlementData.items];
        newItems.splice(index, 1);
        setSettlementData({ ...settlementData, items: newItems });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...settlementData.items];
        newItems[index][field] = value;
        setSettlementData({ ...settlementData, items: newItems });
    };

    const calculateTotals = () => {
        let earnings = 0;
        let deductions = 0;
        settlementData.items.forEach(item => {
            if (item.type === 'Earning') earnings += parseFloat(item.amount) || 0;
            else deductions += parseFloat(item.amount) || 0;
        });
        return { earnings, deductions, net: earnings - deductions };
    };

    const handleSubmit = async () => {
        if (!selectedEmployee || !settlementData.resignation_date || !settlementData.last_working_day) {
            toast.error("Please fill all required resignation fields");
            return;
        }
        setLoading(true);
        try {
            await api.post('/ff-settlement', {
                user_id: selectedEmployee.id,
                ...settlementData
            });
            toast.success("Full & Final Settlement completed");
            setActiveTab('history');
            fetchHistory();
            // Reset form
            setSelectedEmployee(null);
            setSettlementData({ resignation_date: '', last_working_day: '', items: [], remarks: '' });
        } catch (error) {
            toast.error("Process execution stalled. Please retry.");
        } finally {
            setLoading(false);
        }
    };

    const { earnings, deductions, net } = calculateTotals();

    return (
        <div className="payroll-module-container animate-in">
            <header className="module-header">
                <div className="header-title-section">
                    <div className="title-icon-wrapper">
                        <FileText className="title-icon" />
                    </div>
                    <div>
                        <h1>F&F Settlement</h1>
                        <p className="subtitle">Automate final payouts and clearance for exits</p>
                    </div>
                </div>
                <div className="tab-switcher">
                    <button className={activeTab === 'process' ? 'active' : ''} onClick={() => setActiveTab('process')}>
                        <RefreshCw size={16} /> Process Workspace
                    </button>
                    <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                        <FileText size={16} /> Settlement Journal
                    </button>
                </div>
            </header>

            {activeTab === 'process' ? (
                <div className="settlement-workspace animate-in">
                    <div className="glass-card">
                        <div className="filter-grid" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr' }}>
                            <div className="filter-item">
                                <label><User size={12} /> Exiting Staff member *</label>
                                <select onChange={(e) => handleEmployeeSelect(e.target.value)} value={selectedEmployee?.id || ''}>
                                    <option value="">Search for resigning staff...</option>
                                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name} ({e.email})</option>)}
                                </select>
                            </div>
                            <div className="filter-item">
                                <label><Calendar size={12} /> Resignation date *</label>
                                <input type="date" value={settlementData.resignation_date} onChange={(e) => setSettlementData({...settlementData, resignation_date: e.target.value})} />
                            </div>
                            <div className="filter-item">
                                <label><Calendar size={12} /> Last working day *</label>
                                <input type="date" value={settlementData.last_working_day} onChange={(e) => setSettlementData({...settlementData, last_working_day: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    {selectedEmployee && (
                        <div className="settlement-details-grid grid-2 animate-in">
                            <div className="earnings-section">
                                <div className="section-header">
                                    <h3 style={{color: '#166534'}}><TrendingUp size={18} /> Exit Earnings</h3>
                                    <button className="action-btn" onClick={() => addItem('Earning')} title="Add Credit Component"><Plus size={16} /></button>
                                </div>
                                <div className="glass-card" style={{ padding: '0 16px' }}>
                                    {settlementData.items.filter(i => i.type === 'Earning').length > 0 ? settlementData.items.filter(i => i.type === 'Earning').map((item, idx) => (
                                        <div key={idx} className="settlement-item-row" style={{ padding: '16px 0', borderBottom: idx === settlementData.items.filter(i => i.type === 'Earning').length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                            <input className="item-name" style={{ flex: 3 }} placeholder="Head (e.g. Gratuity)" value={item.name} onChange={(e) => updateItem(settlementData.items.indexOf(item), 'name', e.target.value)} />
                                            <div className="item-amount-wrapper">
                                                <span>₹</span>
                                                <input type="number" value={item.amount} onChange={(e) => updateItem(settlementData.items.indexOf(item), 'amount', e.target.value)} />
                                            </div>
                                            <button className="action-btn delete" onClick={() => removeItem(settlementData.items.indexOf(item))}><Trash2 size={14} /></button>
                                        </div>
                                    )) : <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No earning components</div>}
                                    <div className="total-row" style={{ padding: '20px 0', borderTop: '2px solid #f1f5f9', fontWeight: 800, fontSize: '16px' }}>
                                        <span style={{ color: '#64748b' }}>Subtotal Credits</span>
                                        <span style={{ color: '#166534' }}>₹{earnings.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="deductions-section">
                                <div className="section-header">
                                    <h3 style={{color: '#991b1b'}}><TrendingDown size={18} /> Exit Deductions</h3>
                                    <button className="action-btn" onClick={() => addItem('Deduction')} title="Add Debit Component"><Plus size={16} /></button>
                                </div>
                                <div className="glass-card" style={{ padding: '0 16px' }}>
                                    {settlementData.items.filter(i => i.type === 'Deduction').length > 0 ? settlementData.items.filter(i => i.type === 'Deduction').map((item, idx) => (
                                        <div key={idx} className="settlement-item-row" style={{ padding: '16px 0', borderBottom: idx === settlementData.items.filter(i => i.type === 'Deduction').length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                            <input className="item-name" style={{ flex: 3 }} placeholder="Head (e.g. Notice Pay)" value={item.name} onChange={(e) => updateItem(settlementData.items.indexOf(item), 'name', e.target.value)} />
                                            <div className="item-amount-wrapper">
                                                <span>₹</span>
                                                <input type="number" value={item.amount} onChange={(e) => updateItem(settlementData.items.indexOf(item), 'amount', e.target.value)} />
                                            </div>
                                            <button className="action-btn delete" onClick={() => removeItem(settlementData.items.indexOf(item))}><Trash2 size={14} /></button>
                                        </div>
                                    )) : <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No deduction components</div>}
                                    <div className="total-row" style={{ padding: '20px 0', borderTop: '2px solid #f1f5f9', fontWeight: 800, fontSize: '16px' }}>
                                        <span style={{ color: '#64748b' }}>Subtotal Debits</span>
                                        <span style={{ color: '#991b1b' }}>₹{deductions.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section grid-span-2 glass-card animate-in" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                                <div className="summary-grid" style={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
                                    <div className="summary-card" style={{ background: 'white', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <Wallet size={32} style={{ color: '#6366f1' }} />
                                            <div>
                                                <label style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 800, color: '#64748b' }}>Net Disbursement</label>
                                                <div className="net-amount" style={{ fontSize: '28px', fontWeight: 900 }}>₹{net.toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="remarks-box">
                                        <textarea style={{ background: 'white' }} placeholder="Provide internal notes or policy references for this settlement..." rows={2} value={settlementData.remarks} onChange={(e) => setSettlementData({...settlementData, remarks: e.target.value})}></textarea>
                                    </div>
                                    <div className="summary-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
                                            <div className="btn-icon-bg">{loading ? <RefreshCw size={18} className="spin" /> : <Save size={18} />}</div>
                                            <span>Finalize Settlement</span>
                                        </button>
                                        <button className="btn-secondary" style={{ width: '100%' }} disabled={loading}><Printer size={16} /> Print Voucher</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="history-view animate-in">
                    <div className="glass-card">
                        <div className="table-container">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Settled Employee</th>
                                        <th>LWD Date</th>
                                        <th>Total Earnings</th>
                                        <th>Total Deductions</th>
                                        <th>Net Settled</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.length > 0 ? history.map((record: any) => (
                                        <tr key={record.id}>
                                            <td>
                                                <div className="employee-info">
                                                    <div className="avatar" style={{ background: '#f1f5f9', color: '#475569' }}>{record.user?.name?.charAt(0)}</div>
                                                    <div>
                                                        <div style={{fontWeight: 700}}>{record.user?.name}</div>
                                                        <div style={{fontSize: '11px', color: '#64748b'}}>{record.user?.id || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{new Date(record.last_working_day).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>₹{record.total_earnings?.toLocaleString()}</td>
                                            <td>₹{record.total_deductions?.toLocaleString()}</td>
                                            <td><div style={{fontWeight: 800, color: '#0f172a'}}>₹{record.net_settlement?.toLocaleString() || record.net_payable?.toLocaleString()}</div></td>
                                            <td><span className={`status-pill ${record.status?.toLowerCase() === 'settled' ? 'approved' : 'pending'}`}>{record.status}</span></td>
                                            <td>
                                                <div className="actions" style={{ justifyContent: 'flex-end' }}>
                                                    <button className="action-btn" title="View Settlement Info"><Info size={16} /></button>
                                                    <button className="action-btn" title="Download Statement"><Printer size={16} /></button>
                                                    <button className="action-btn" title="Details"><ChevronRight size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="no-data">
                                                <Briefcase size={40} style={{opacity: 0.2, marginBottom: '10px'}} />
                                                <p>No processed settlements found in the journal.</p>
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

export default FFSettlement;
