import React, { useState, useEffect, useCallback } from 'react';
import { 
    BarChart3, PieChart, TrendingUp, Calendar, 
    Users, CheckCircle2, XCircle, Clock, 
    Download, Filter, Search, Loader2,
    CalendarDays, Activity, Target
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './meetings.css';

const MeetingReports: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/meetings/reports');
            setStats(res.data);
        } catch (error) {
            toast.error('Failed to load meeting reports');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const exportToCSV = () => {
        toast.success('Report generation started...');
        // Logic to generate CSV
    };

    return (
        <div className="meeting-layout">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><BarChart3 size={30} strokeWidth={2.5} color="var(--meeting-primary)" /> Meeting Analytics & Reports</h2>
                        <p>Analyze meeting effectiveness, employee attendance, and task completion rates.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-secondary" onClick={exportToCSV}>
                            <Download size={16} /> Export Report
                        </button>
                        <button className="btn-primary glow-btn" onClick={fetchData}>
                            <Activity size={16} /> Refresh Analytics
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                    </div>
                ) : (
                    <>
                        <div className="meeting-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
                            <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                                <div className="silo-icon" style={{ background: '#f8fafc', color: '#64748b' }}><CalendarDays size={22} /></div>
                                <div>
                                    <h3 style={{ fontSize: '24px' }}>{stats?.totalMeetings || 0}</h3>
                                    <p>Total Meetings</p>
                                </div>
                            </div>
                            <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                                <div className="silo-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><CheckCircle2 size={22} /></div>
                                <div>
                                    <h3 style={{ fontSize: '24px' }}>{stats?.statusCounts?.find((s: any) => s.status === 'Completed')?._count || 0}</h3>
                                    <p>Completed Successfully</p>
                                </div>
                            </div>
                            <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                                <div className="silo-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><Users size={22} /></div>
                                <div>
                                    <h3 style={{ fontSize: '24px' }}>{stats?.attendanceStats?.find((s: any) => s.attendance_status === 'Present')?._count || 0}</h3>
                                    <p>Attendance (Present)</p>
                                </div>
                            </div>
                            <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                                <div className="silo-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><Target size={22} /></div>
                                <div>
                                    <h3 style={{ fontSize: '24px' }}>{stats?.attendanceStats?.find((s: any) => s.attendance_status === 'Absent')?._count || 0}</h3>
                                    <p>Absence Rate</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid" style={{ gridTemplateColumns: '3fr 2fr', gap: '24px' }}>
                            <div className="table-container glass-effect" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={20} color="#3b82f6" /> Monthly Meeting Overview
                                </h3>
                                <div style={{ height: '300px', width: '100%', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                    Visual chart would render here (Monthly Frequency)
                                </div>
                            </div>

                            <div className="table-container glass-effect" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <PieChart size={20} color="#3b82f6" /> Status Distribution
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {stats?.statusCounts?.map((s: any) => (
                                        <div key={s.status} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.status === 'Completed' ? '#16a34a' : s.status === 'Cancelled' ? '#dc2626' : '#3b82f6' }}></div>
                                            <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{s.status}</div>
                                            <div style={{ fontWeight: 700 }}>{s._count}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="table-container glass-effect" style={{ marginTop: '32px', padding: '32px' }}>
                             <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 24px 0' }}>Recent Meeting Summaries</h3>
                             <table className="premium-table">
                                 <thead>
                                     <tr>
                                         <th>Meeting Date</th>
                                         <th>Meeting Title</th>
                                         <th>Organizer</th>
                                         <th>Participants</th>
                                         <th>Action Items</th>
                                         <th>MOM Status</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {/* This would be another fetch for summarized data */}
                                     <tr>
                                         <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                                             No summarized report data available for the current selection.
                                         </td>
                                     </tr>
                                 </tbody>
                             </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MeetingReports;
