import { useState, useEffect } from 'react';
import { BarChart3, PieChart, Users, FileText, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const TaxAnalytics = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [financialYear]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-reports', { params: { financial_year: financialYear } });
            setStats(res.data);
        } catch (error) {
            toast.error("Failed to fetch analytics.");
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Calculating massive fiscal aggregates...</div>;
    }

    const unassignedCount = stats.under_tax.count;
    const f16 = stats.form16;
    const doc = stats.benefits;
    const drill = stats.drill_down;

    const exportReport = (reportName: string) => {
        toast.success(`Exporting ${reportName} to CSV...`);
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <BarChart3 color="#3b82f6"/> Core Tax Analytics (Module 14)
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Four high-level overview reports of organizational tax footprints and pending compliances.
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
                            onClick={() => exportReport('Master Tax Aggregation')}
                        ><Download size={16}/> Master CSV Export</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    
                    {/* Report 1: Under Tax Employees */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} color="#ef4444"/> Under Tax Tracking</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Employees missing regimen assignments or baseline docs</p>
                            </div>
                            <button onClick={() => exportReport('Under Tax')} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', color: '#475569', fontSize: 12, cursor: 'pointer' }}>CSV</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(#ef4444 0% ${(unassignedCount/drill.total_active)*100 || 0}%, #e2e8f0 ${(unassignedCount/drill.total_active)*100 || 0}% 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: 80, height: 80, background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{unassignedCount}</span>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>Missing</span>
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                {stats.under_tax.samples.length > 0 ? (
                                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                                        {stats.under_tax.samples.map((s: any) => (
                                            <li key={s.user.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px dashed #e2e8f0', fontSize: 13, color: '#334155' }}>
                                                <Users size={14} color="#94a3b8"/> {s.user.name} 
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ margin: 0, fontSize: 13, color: '#10b981', fontWeight: 500 }}><CheckCircle size={16} style={{ verticalAlign: 'middle' }}/> 100% Tax Regimens Assigned</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Report 2: Form 16 Tracking */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} color="#2563eb"/> Form 16 Compliance</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Generation and publication matrices</p>
                            </div>
                            <button onClick={() => exportReport('Form 16 Tracker')} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', color: '#475569', fontSize: 12, cursor: 'pointer' }}>CSV</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 14, color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}><Clock size={16} color="#f59e0b"/> Pending Computations</span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{f16.Pending}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${(f16.Pending/drill.total_active)*100 || 0}%`, height: '100%', background: '#f59e0b' }}/></div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <span style={{ fontSize: 14, color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}><PieChart size={16} color="#3b82f6"/> Generated (Drafts)</span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{f16.Generated}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${(f16.Generated/drill.total_active)*100 || 0}%`, height: '100%', background: '#3b82f6' }}/></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <span style={{ fontSize: 14, color: '#475569', display: 'flex', gap: 8, alignItems: 'center' }}><CheckCircle size={16} color="#10b981"/> Sent to Inboxes</span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{f16.Sent}</span>
                            </div>
                            <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${(f16.Sent/drill.total_active)*100 || 0}%`, height: '100%', background: '#10b981' }}/></div>
                        </div>
                    </div>

                    {/* Report 3: Tax Benefit Fulfillment */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} color="#8b5cf6"/> Documents Lifecycle</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Review funnel across entire organization</p>
                            </div>
                            <button onClick={() => exportReport('Documents Lifecycle')} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', color: '#475569', fontSize: 12, cursor: 'pointer' }}>CSV</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 16, borderRadius: 8 }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Unsubmitted</p>
                                <h4 style={{ margin: 0, fontSize: 24, color: '#0f172a' }}>{doc.Pending}</h4>
                            </div>
                            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 16, borderRadius: 8 }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#1e40af', textTransform: 'uppercase', fontWeight: 600 }}>In Review Queue</p>
                                <h4 style={{ margin: 0, fontSize: 24, color: '#1d4ed8' }}>{doc['Under Review']}</h4>
                            </div>
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 8 }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#166534', textTransform: 'uppercase', fontWeight: 600 }}>Approved Proofs</p>
                                <h4 style={{ margin: 0, fontSize: 24, color: '#15803d' }}>{doc.Approved}</h4>
                            </div>
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 16, borderRadius: 8 }}>
                                <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#991b1b', textTransform: 'uppercase', fontWeight: 600 }}>Fix Required (Rejected)</p>
                                <h4 style={{ margin: 0, fontSize: 24, color: '#b91c1c' }}>{doc.Rejected}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Report 4: Complete Income Tax Drill-Down */}
                    <div style={{ background: 'white', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: 16, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}><PieChart size={18} color="#ec4899"/> Deep Drill-Down</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>Atypical income declarations overview</p>
                            </div>
                            <button onClick={() => exportReport('IT Drill Down')} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 8px', color: '#475569', fontSize: 12, cursor: 'pointer' }}>CSV</button>
                        </div>
                        <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#334155' }}>
                            Out of <strong style={{ color: '#0f172a' }}>{drill.total_active} active employees</strong> tracked this year, the following specialized declarations have been logged into the fiscal ledger:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>Employees Reporting Additional Income</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>{drill.declared_other_income}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: '#1e293b' }}>Employees Declaring Form 12B (Prev Job)</span>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>{drill.declared_previous_employer}</span>
                            </div>
                        </div>
                        <button 
                            style={{ width: '100%', marginTop: 20, padding: 12, background: 'transparent', border: '1px dashed #cbd5e1', color: '#64748b', borderRadius: 8, cursor: 'pointer', fontWeight: 500 }}
                            onClick={() => toast('Detailed modal opens showing complete granular logs')}
                        >
                            Open Detailed Matrix View
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default TaxAnalytics;
