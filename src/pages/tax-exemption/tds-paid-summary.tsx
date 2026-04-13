import { useState, useEffect } from 'react';
import { Users, Filter, UserPlus, CheckCircle, Search, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TDSPaidSummary = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [summaries, setSummaries] = useState<any[]>([]);
    const [challans, setChallans] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [isLinking, setIsLinking] = useState(false);
    const [linkData, setLinkData] = useState({ challan_id: '', user_id: '', tds_amount: '' });

    useEffect(() => {
        loadData();
    }, [financialYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [sumRes, chRes, empRes] = await Promise.all([
                api.get('/payroll/tds-challan/summary/all', { params: { financial_year: financialYear } }),
                api.get('/payroll/tds-challan', { params: { financial_year: financialYear } }),
                api.get('/users')
            ]);
            setSummaries(sumRes.data);
            setChallans(chRes.data);
            setEmployees(empRes.data);
        } catch (error) {
            toast.error("Failed to load mapping data.");
        } finally {
            setLoading(false);
        }
    };

    const handleLink = async () => {
        if (!linkData.challan_id || !linkData.user_id || !linkData.tds_amount) {
            return toast.error("All fields are mandatory.");
        }
        try {
            const date = challans.find(c => c.id === Number(linkData.challan_id))?.challan_date;
            await api.post('/payroll/tds-challan/summary/bulk', {
                challan_id: Number(linkData.challan_id),
                financial_year: financialYear,
                deposit_date: date,
                employee_maps: [{ user_id: Number(linkData.user_id), tds_amount: Number(linkData.tds_amount) }]
            });
            toast.success("Employee successfully tagged to the Challan.");
            setIsLinking(false);
            setLinkData({ challan_id: '', user_id: '', tds_amount: '' });
            loadData();
        } catch (error) {
            toast.error("Linking failed.");
        }
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Users color="#3b82f6"/> TDS Paid Summary Maps
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Map exact TDS deposit amounts inside registered Challans to the respective employees.
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
                            onClick={() => setIsLinking(true)}
                        ><UserPlus size={16}/> Map Employee to Challan</button>
                    </div>
                </div>

                {isLinking && (
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                        <div style={{ gridColumn: 'span 3', borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                            <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a' }}>New Employee-Challan Binding</h3>
                        </div>

                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Registered Challan *</label>
                            <select style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={linkData.challan_id} onChange={e => setLinkData({...linkData, challan_id: e.target.value})}>
                                <option value="">-- Choose Challan --</option>
                                {challans.map(c => <option key={c.id} value={c.id}>Challan: ₹{c.total_amount} (Date: {new Date(c.challan_date).toLocaleDateString()})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>Employee *</label>
                            <select style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }} value={linkData.user_id} onChange={e => setLinkData({...linkData, user_id: e.target.value})}>
                                <option value="">-- Choose Employee --</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' }}>TDS Mapped Amount (₹) *</label>
                            <input type="number" style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', fontSize: 16, fontWeight: 600, boxSizing: 'border-box' }} value={linkData.tds_amount} onChange={e => setLinkData({...linkData, tds_amount: e.target.value})}/>
                        </div>

                        <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button style={{ padding: '8px 20px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsLinking(false)}>Cancel</button>
                            <button style={{ padding: '8px 24px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleLink}><CheckCircle size={16}/> Connect via BSR Hash</button>
                        </div>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 8 }}><Filter size={16}/> Active Ledger</h4>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Mapped TDS (₹)</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Deposit Date</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Challan Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Calculating distributed maps...</td></tr>
                            ) : summaries.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}><AlertCircle style={{ display: 'block', margin: '0 auto 12px' }}/> No maps defined.</td></tr>
                            ) : summaries.map(s => (
                                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{s.user.name}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#16a34a', fontSize: 15 }}>₹{s.tds_amount.toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 14 }}>{new Date(s.deposit_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {s.challan.bsr_code && s.challan.cin_no ? (
                                            <div style={{ display: 'inline-flex', padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, fontSize: 12, color: '#1d4ed8', fontWeight: 500 }}>
                                                ✅ BSR: {s.challan.bsr_code} | CIN: {s.challan.cin_no}
                                            </div>
                                        ) : (
                                            <div style={{ display: 'inline-flex', padding: '6px 12px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#b45309', fontWeight: 500 }}>
                                                ⚠️ Parent Challan Pending Identifiers
                                            </div>
                                        )}
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

export default TDSPaidSummary;
