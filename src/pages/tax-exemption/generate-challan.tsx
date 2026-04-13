import { useState, useEffect } from 'react';
import { CreditCard, FilePlus, Key, Receipt, Building, Calendar, Hash, Check } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Challan {
    id: number;
    financial_year: string;
    month: number;
    tds_type: string;
    payment_mode: string;
    bank_name: string | null;
    challan_date: string;
    total_amount: number;
    bsr_code: string | null;
    cin_no: string | null;
    status: string;
    _count: { summaries: number };
}

const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];

const GenerateChallan = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [challans, setChallans] = useState<Challan[]>([]);
    const [loading, setLoading] = useState(false);

    // Form Modal
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        month: 1,
        tds_type: 'TDS',
        payment_mode: 'Net Banking',
        bank_name: '',
        challan_date: new Date().toISOString().split('T')[0],
        total_amount: '',
        bsr_code: '',
        cin_no: ''
    });

    useEffect(() => {
        loadChallans();
    }, [financialYear]);

    const loadChallans = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tds-challan', { params: { financial_year: financialYear } });
            setChallans(res.data);
        } catch (error) {
            toast.error("Failed to load Challans");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.post('/payroll/tds-challan', {
                ...formData,
                financial_year: financialYear
            });
            toast.success("Challan Record Created.");
            setIsOpen(false);
            setFormData({ ...formData, total_amount: '', bsr_code: '', cin_no: '' });
            loadChallans();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error generating challan.");
        }
    };

    const inputStyle = { padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box' as const, fontSize: 14 };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Receipt color="#3b82f6"/> Generate TDS Challan
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Record TDS deposits sent to the Income Tax Department with BSR and CIN identifiers.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <select 
                            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                            value={financialYear} onChange={e => setFinancialYear(e.target.value)}
                        >
                            <option value="2025-26">FY 2025-26</option>
                            <option value="2024-25">FY 2024-25</option>
                        </select>
                        <button 
                            style={{ padding: '10px 20px', borderRadius: 8, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={() => setIsOpen(true)}
                        ><FilePlus size={16}/> Record Challan</button>
                    </div>
                </div>

                {isOpen && (
                    <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
                            <h3 style={{ margin: 0, color: '#0f172a', fontSize: 18 }}>New Challan Entry</h3>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Deposit Month *</label>
                            <select style={inputStyle} value={formData.month} onChange={e => setFormData({...formData, month: Number(e.target.value)})}>
                                {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Date of Deposit *</label>
                            <div style={{ position: 'relative' }}>
                                <Calendar size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }}/>
                                <input type="date" style={{...inputStyle, paddingLeft: 36}} value={formData.challan_date} onChange={e => setFormData({...formData, challan_date: e.target.value})}/>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Total Paid Amount (₹) *</label>
                            <input type="number" style={{...inputStyle, fontSize: 16, fontWeight: 600}} value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})}/>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Payment Mode *</label>
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }}/>
                                <select style={{...inputStyle, paddingLeft: 36}} value={formData.payment_mode} onChange={e => setFormData({...formData, payment_mode: e.target.value})}>
                                    <option value="Net Banking">Net Banking</option>
                                    <option value="Debit Card">Debit Card</option>
                                    <option value="Counter">UPI</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Bank Name</label>
                            <div style={{ position: 'relative' }}>
                                <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }}/>
                                <input type="text" placeholder="E.g. SBI, HDFC" style={{...inputStyle, paddingLeft: 36}} value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})}/>
                            </div>
                        </div>
                        
                        <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: 20, borderRadius: 12, border: '1px solid #bfdbfe', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <p style={{ margin: 0, fontSize: 13, color: '#1e40af', fontWeight: 500 }}>Challan Identifiers (Fill when received from IT portal)</p>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#1e3a8a', marginBottom: 6, display: 'block' }}>BSR Code</label>
                                <div style={{ position: 'relative' }}>
                                    <Hash size={16} color="#60a5fa" style={{ position: 'absolute', left: 12, top: 12 }}/>
                                    <input type="text" placeholder="7 digit code" style={{...inputStyle, paddingLeft: 36}} value={formData.bsr_code} onChange={e => setFormData({...formData, bsr_code: e.target.value})}/>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: '#1e3a8a', marginBottom: 6, display: 'block' }}>Challan Serial No (CIN)</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={16} color="#60a5fa" style={{ position: 'absolute', left: 12, top: 12 }}/>
                                    <input type="text" placeholder="5 digit code" style={{...inputStyle, paddingLeft: 36}} value={formData.cin_no} onChange={e => setFormData({...formData, cin_no: e.target.value})}/>
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                            <button 
                                style={{ padding: '10px 20px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => setIsOpen(false)}
                            >Cancel</button>
                            <button 
                                style={{ padding: '10px 24px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                onClick={handleSave}
                            ><Check size={16}/> Save Challan Record</button>
                        </div>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Month</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Date & Mode</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Bank</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Total Amount</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>BSR & CIN</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading Challan Registry...</td></tr>
                            ) : challans.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No Challans created for this FY.</td></tr>
                            ) : challans.map(c => (
                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{months[c.month - 1]}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ display: 'block', fontWeight: 500, color: '#1e293b', fontSize: 14 }}>{new Date(c.challan_date).toLocaleDateString()}</span>
                                        <span style={{ display: 'block', color: '#64748b', fontSize: 12 }}>{c.payment_mode}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 14 }}>{c.bank_name || '-'}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#0f172a', fontSize: 15 }}>₹{c.total_amount.toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {c.bsr_code && c.cin_no ? (
                                            <>
                                                <span style={{ display: 'block', color: '#1e293b', fontSize: 13, fontWeight: 500 }}>BSR: {c.bsr_code}</span>
                                                <span style={{ display: 'block', color: '#64748b', fontSize: 12 }}>CIN: {c.cin_no}</span>
                                            </>
                                        ) : (
                                            <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500 }}>Action Required</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, 
                                            background: c.status === 'Paid' ? '#dcfce7' : '#fef3c7',
                                            color: c.status === 'Paid' ? '#16a34a' : '#d97706' 
                                        }}>
                                            {c.status}
                                        </span>
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

export default GenerateChallan;
