import { useState, useEffect } from 'react';
import {
    Users, Map, CheckCircle, Clock, Calendar,
    ArrowUpRight, AlertTriangle, Loader2, RefreshCw
, PieChart} from 'lucide-react';
import './visit.css';

export default function VisitDashboard() {
    // const user = useAuthStore(state => state.user); // Currently unused
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        fetchDashboardStats();
    }, [period]);

    const fetchDashboardStats = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/visits/dashboard?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                // Depending on the backend route implementation, data might be aggregated 
                // globally for admins or individually for employees. Let's assume it returns
                // { total_visits, completed, pending_approval, planned, recent_visits: [] }
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="visit-layout">
            <div className="visit-header-banner" style={{ background: 'linear-gradient(135deg, #1e3a8a, #172554)' }}>
                <div>
                    <h2 className="visit-title"><PieChart className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Visit Management Dashboard</h2>
                    <p className="visit-subtitle">Overview of field operations, client meetings, and approval statuses.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        className="btn-visit-secondary"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="today" style={{ color: 'black' }}>Today</option>
                        <option value="week" style={{ color: 'black' }}>This Week</option>
                        <option value="month" style={{ color: 'black' }}>This Month</option>
                    </select>
                    <button className="btn-visit-primary" onClick={fetchDashboardStats}>
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="visit-loading" style={{ minHeight: '400px' }}>
                    <Loader2 className="spinner" size={40} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    <p>Aggregating visit analytics...</p>
                </div>
            ) : (
                <>
                    {/* Stat Cards Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
                        <div className="visit-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                <Map size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Visits</p>
                                <h3 style={{ margin: '4px 0 0', fontSize: '28px', color: '#1e293b' }}>{stats?.total_visits || 0}</h3>
                            </div>
                        </div>

                        <div className="visit-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                <CheckCircle size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Completed</p>
                                <h3 style={{ margin: '4px 0 0', fontSize: '28px', color: '#1e293b' }}>{stats?.completed || 0}</h3>
                            </div>
                        </div>

                        <div className="visit-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ca8a04' }}>
                                <Clock size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending Approval</p>
                                <h3 style={{ margin: '4px 0 0', fontSize: '28px', color: '#1e293b' }}>{stats?.pending_approval || 0}</h3>
                            </div>
                        </div>

                        <div className="visit-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                <Calendar size={28} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Planned upcoming</p>
                                <h3 style={{ margin: '4px 0 0', fontSize: '28px', color: '#1e293b' }}>{stats?.planned || 0}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                        {/* Recent Activity Table */}
                        <div className="visit-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Recent Field Activity</h3>
                                <button className="btn-visit-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>View All <ArrowUpRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></button>
                            </div>

                            {stats?.recent_visits?.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px', textAlign: 'left' }}>
                                            <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Employee</th>
                                            <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Client / Location</th>
                                            <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Date</th>
                                            <th style={{ paddingBottom: '12px', fontWeight: 600 }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recent_visits.map((visit: any) => (
                                            <tr key={visit.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '16px 0', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>
                                                    {visit.user?.name || 'Unknown User'}
                                                </td>
                                                <td style={{ padding: '16px 0' }}>
                                                    <div style={{ fontSize: '14px', color: '#1e293b' }}>{visit.client_name}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{visit.city || '--'}</div>
                                                </td>
                                                <td style={{ padding: '16px 0', fontSize: '13px', color: '#475569' }}>
                                                    {new Date(visit.date).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '16px 0' }}>
                                                    <span className={`status-chip status-\${visit.status.replace(' ', '-').toLowerCase()}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                                                        {visit.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                    <AlertTriangle size={32} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                                    <p style={{ margin: 0 }}>No recent activity found for this period.</p>
                                </div>
                            )}
                        </div>

                        {/* Top Performers / Activity Feed block */}
                        <div className="visit-card" style={{ padding: '24px', background: 'linear-gradient(to bottom, white, #f8fafc)' }}>
                            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#1e293b' }}>Attention Required</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Example static alerts based on logic */}
                                {stats?.pending_approval > 0 && (
                                    <div style={{ padding: '16px', borderRadius: '12px', background: '#fefce8', border: '1px solid #fef08a', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ background: '#fde047', borderRadius: '50%', padding: '8px', color: '#854d0e' }}>
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#854d0e' }}>{stats.pending_approval} Visits Await Approval</h4>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#a16207', lineHeight: 1.5 }}>Managers need to review employee submitted check-out summaries.</p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ padding: '16px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{ background: '#93c5fd', borderRadius: '50%', padding: '8px', color: '#1e40af' }}>
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#1e3a8a' }}>Active Field Force</h4>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#1d4ed8', lineHeight: 1.5 }}>{stats?.active_users || 0} employees have reported check-ins today.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
