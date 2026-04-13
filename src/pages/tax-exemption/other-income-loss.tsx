import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Employee {
    id: number;
    name: string;
}

interface Record {
    id: number;
    user_id: number;
    financial_year: string;
    type: 'Income' | 'Loss';
    source: string;
    amount: number;
    description: string;
    status: string;
    createdAt: string;
    user: { name: string; };
}

const OtherIncomeLoss = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [records, setRecords] = useState<Record[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        user_id: '',
        type: 'Income',
        source: '',
        amount: '',
        description: ''
    });

    useEffect(() => {
        api.get('/users').then(res => setEmployees(res.data)).catch(() => {});
        loadRecords();
    }, [financialYear]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/other-income-loss', {
                params: { financial_year: financialYear }
            });
            setRecords(res.data);
        } catch (error) {
            toast.error("Failed to load records.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.user_id || !formData.source || !formData.amount) {
            return toast.error("Please fill all mandatory fields.");
        }
        if (Number(formData.amount) < 0) {
            return toast.error("Amount must be a positive integer.");
        }

        try {
            await api.post('/payroll/other-income-loss', {
                ...formData,
                financial_year: financialYear,
                amount: Number(formData.amount)
            });
            toast.success(`${formData.type} recorded successfully.`);
            setIsFormOpen(false);
            setFormData({ user_id: '', type: 'Income', source: '', amount: '', description: '' });
            loadRecords();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save record.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await api.delete(`/payroll/other-income-loss/${id}`);
            toast.success("Record deleted.");
            setRecords(r => r.filter(x => x.id !== id));
        } catch (error) {
            toast.error("Failed to delete record.");
        }
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <TrendingUp color="#3b82f6"/> Other Income & Losses Tracking
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Record external incomes (e.g., house property, freelance) or losses to securely adjust taxable income.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <select 
                            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', outline: 'none' }}
                            value={financialYear} 
                            onChange={e => setFinancialYear(e.target.value)}
                        >
                            <option value="2025-26">FY 2025-26</option>
                            <option value="2024-25">FY 2024-25</option>
                        </select>
                        <button 
                            style={{ padding: '10px 20px', borderRadius: 8, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={() => setIsFormOpen(true)}
                        >
                            <Plus size={16}/> Record Entry
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 500, textTransform: 'uppercase' }}>Total Records Logged</p>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: 28, color: '#0f172a' }}>{records.length}</h3>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendingUp size={16} color="#16a34a"/> Total Extra Income
                        </p>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: 28, color: '#0f172a' }}>
                            ₹{records.filter(r => r.type === 'Income').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </h3>
                    </div>
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 13, fontWeight: 500, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendingDown size={16} color="#ef4444"/> Total Declared Losses
                        </p>
                        <h3 style={{ margin: '8px 0 0 0', fontSize: 28, color: '#0f172a' }}>
                            ₹{records.filter(r => r.type === 'Loss').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                        </h3>
                    </div>
                </div>

                {/* Form Drawer / Inline Form */}
                {isFormOpen && (
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: '#0f172a' }}>New Fiscal Entry</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Employee *</label>
                                <select 
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}
                                >
                                    <option value="">-- Choose --</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Entry Type *</label>
                                <select 
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', background: formData.type === 'Income' ? '#f0fdf4' : '#fef2f2', color: formData.type === 'Income' ? '#166534' : '#991b1b', fontWeight: 600 }}
                                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'Income'|'Loss'})}
                                >
                                    <option value="Income">Other Income</option>
                                    <option value="Loss">Reported Loss</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Source / Category *</label>
                                <input 
                                    type="text"
                                    placeholder="e.g., Interest Income, House Property Loss"
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Amount (₹) *</label>
                                <input 
                                    type="number"
                                    placeholder="0"
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 16, fontWeight: 600 }}
                                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'span 2' }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Description / Notes</label>
                                <input 
                                    type="text"
                                    placeholder="Optional context for this entry..."
                                    style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button 
                                style={{ padding: '10px 20px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => setIsFormOpen(false)}
                            >Cancel</button>
                            <button 
                                style={{ padding: '10px 20px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                onClick={handleSave}
                            ><CheckCircle size={16}/> Save to Ledger</button>
                        </div>
                    </div>
                )}

                {/* Table View */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Type</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Source</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Amount (₹)</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Logged On</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading specific fiscal ledger...</td></tr>
                            ) : records.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}><AlertCircle size={24} style={{ display: 'block', margin: '0 auto 12px' }}/> No entries found.</td></tr>
                            ) : records.map(rec => (
                                <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{rec.user.name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, 
                                            background: rec.type === 'Income' ? '#dcfce7' : '#fef2f2',
                                            color: rec.type === 'Income' ? '#16a34a' : '#ef4444' 
                                        }}>
                                            {rec.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#475569' }}>{rec.source}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 700, fontSize: 15, color: rec.type === 'Income' ? '#0f172a' : '#ef4444' }}>
                                        {rec.type === 'Loss' ? '-' : ''}₹{rec.amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: 13 }}>{new Date(rec.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button 
                                            style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 }} 
                                            onClick={() => handleDelete(rec.id)}
                                        ><Trash2 size={14}/> Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default OtherIncomeLoss;
