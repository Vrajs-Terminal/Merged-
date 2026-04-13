import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Link } from 'react-router-dom';
import {
    Users, UserCheck, MapPin, Briefcase, Clock,
    AlertTriangle, ArrowUpRight, ChevronRight,
    RefreshCcw, Map
, Activity} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import './employee-tracking.css';

interface DashboardData {
    totalEmployees: number;
    trackingEnabled: number;
    activeEmployees: number;
    workingCount: number;
    fieldVisitCount: number;
    breakCount: number;
    offlineCount: number;
    todayExceptions: number;
    geofenceViolations: number;
    recentCheckIns: any[];
    lateCheckIns: number;
    fieldEmployees: any[];
}

const TrackingDashboard = () => {
    const [date] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tracking/dashboard');
            setData(res.data);
        } catch (error) {
            console.error('Failed to fetch dashboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
        // Refresh every minute
        const interval = setInterval(fetchDashboard, 60000);
        return () => clearInterval(interval);
    }, []);

    const kpis = [
        { title: 'Total Tracked', value: data?.trackingEnabled || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff', badge: 'Active', badgeBg: '#dcfce7', badgeColor: '#059669' },
        { title: 'Currently Working', value: data?.workingCount || 0, icon: UserCheck, color: '#10b981', bg: '#f0fdf4', badge: 'Live', badgeBg: '#f0fdf4', badgeColor: '#059669' },
        { title: 'Geofence Alerts', value: data?.geofenceViolations || 0, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', badge: 'Today', badgeBg: '#fef2f2', badgeColor: '#dc2626' },
        { title: 'On Field Visit', value: data?.fieldVisitCount || 0, icon: Briefcase, color: '#8b5cf6', bg: '#f5f3ff', badge: 'Live', badgeBg: '#eff6ff', badgeColor: '#2563eb' },
    ];



    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Color generator based on name
    const getAvatarColor = (name: string) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="et-container">
            {/* Header */}
            <div className="et-header">
                <div>
                    <h2 className="et-title"><Activity className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Tracking Dashboard</h2>
                    <p className="et-subtitle">Real-time overview of employee location & activity • {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="btn-secondary" onClick={fetchDashboard} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh
                    </button>
                    <Link to="/employee-live-tracking" className="btn-primary" style={{ textDecoration: 'none' }}>
                        <Map size={16} /> Open Full Map
                    </Link>
                </div>
            </div>

            {loading && !data ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading live data...</div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="et-kpi-grid">
                        {kpis.map((kpi, i) => (
                            <div key={i} className={`et-kpi-card et-stagger-${i + 1}`} style={{ ['--accent' as any]: kpi.color }}>
                                <div className="et-kpi-top">
                                    <div className="et-kpi-icon" style={{ background: kpi.bg, color: kpi.color }}>
                                        <kpi.icon size={18} />
                                    </div>
                                    <span className="et-kpi-badge" style={{ background: kpi.badgeBg, color: kpi.badgeColor }}>
                                        <ArrowUpRight size={10} strokeWidth={3} /> {kpi.badge}
                                    </span>
                                </div>
                                <div className="et-kpi-value">{kpi.value}</div>
                                <div className="et-kpi-label">{kpi.title}</div>
                            </div>
                        ))}
                    </div>

                    {/* Map + Widgets Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginBottom: 16 }}>
                        {/* Live Map */}
                        <div className="et-card et-stagger-5">
                            <div className="et-card-header">
                                <h3 className="et-card-title">
                                    <span className="et-status-dot et-dot-green et-dot-pulse" style={{ marginRight: 6 }}></span>
                                    Live Employee Map
                                </h3>
                                <Link to="/employee-live-tracking" className="et-card-link">
                                    Full Screen <ChevronRight size={12} />
                                </Link>
                            </div>
                            <div className="et-map-container">
                                <div className="et-map-placeholder">
                                    <MapPin size={48} />
                                    <span>Interactive Map View</span>
                                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                        {data?.activeEmployees || 0} employees pinned • Last updated: just now
                                    </span>
                                    {/* Map pin indicators */}
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                        {[
                                            { label: 'Working', color: '#10b981', count: data?.workingCount || 0 },
                                            { label: 'Field', color: '#8b5cf6', count: data?.fieldVisitCount || 0 },
                                            { label: 'Alert', color: '#ef4444', count: data?.geofenceViolations || 0 },
                                            { label: 'Break', color: '#f59e0b', count: data?.breakCount || 0 },
                                        ].map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                                                <span>{item.label}: {item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Widgets Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Today's Check-ins */}
                            <div className="et-card et-stagger-5" style={{ flex: 1 }}>
                                <div className="et-card-header">
                                    <h3 className="et-card-title">
                                        <Clock size={14} style={{ marginRight: 4, color: '#3b82f6' }} /> Recent Check-ins
                                    </h3>
                                    <span className="et-badge et-badge-blue">{data?.recentCheckIns?.length || 0}</span>
                                </div>
                                {data?.recentCheckIns?.length ? data.recentCheckIns.map(emp => (
                                    <div key={emp.id} className="et-widget-item">
                                        <div className="et-widget-avatar" style={{ background: getAvatarColor(emp.name || 'U') }}>
                                            {(emp.name || 'User').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="et-widget-info">
                                            <div className="et-widget-name">{emp.name}</div>
                                            <div className="et-widget-meta">{emp.department || 'N/A'} • {emp.location}</div>
                                        </div>
                                        <div className="et-widget-right">
                                            <span style={{ fontSize: 11, fontWeight: 600, color: emp.isLate ? '#f59e0b' : '#0f172a' }}>
                                                {formatTime(emp.time)}
                                            </span>
                                            <span className={`et-status-dot ${emp.isLate ? 'et-dot-amber' : 'et-dot-green'} et-dot-pulse`}></span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="et-empty" style={{ padding: '20px 0' }}>
                                        <span>No check-ins today</span>
                                    </div>
                                )}
                            </div>

                            {/* Late Check-ins */}
                            <div className="et-card et-stagger-6" style={{ flex: 'none' }}>
                                <div className="et-card-header">
                                    <h3 className="et-card-title">
                                        <AlertTriangle size={14} style={{ marginRight: 4, color: '#f59e0b' }} /> Late Check-ins
                                    </h3>
                                    <span className="et-badge et-badge-amber">{data?.lateCheckIns || 0}</span>
                                </div>
                                {data?.recentCheckIns?.filter(e => e.isLate).length ? data.recentCheckIns.filter(e => e.isLate).slice(0, 3).map(emp => (
                                    <div key={emp.id} className="et-widget-item">
                                        <div className="et-widget-avatar" style={{ background: getAvatarColor(emp.name || 'U') }}>
                                            {(emp.name || 'User').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="et-widget-info">
                                            <div className="et-widget-name">{emp.name}</div>
                                            <div className="et-widget-meta">{emp.department} • After 09:30 AM</div>
                                        </div>
                                        <span className="et-badge et-badge-orange">{formatTime(emp.time)}</span>
                                    </div>
                                )) : (
                                    <div className="et-empty" style={{ padding: '20px 0' }}>
                                        <span>No late check-ins today</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Field Employees Table */}
                    <div className="et-card et-stagger-6">
                        <div className="et-card-header">
                            <h3 className="et-card-title">
                                <Briefcase size={14} style={{ marginRight: 4, color: '#8b5cf6' }} /> Field Employees
                            </h3>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <ExportButtons
                                    data={data?.fieldEmployees?.map(emp => ({
                                        "Name": emp.name,
                                        "ID": `EMP-${String(emp.id).padStart(4, '0')}`,
                                        "Location": emp.location || 'Unknown',
                                        "Last Update": formatTime(emp.lastUpdate),
                                        "Battery": emp.batteryLevel ? `${emp.batteryLevel}%` : 'N/A'
                                    })) || []}
                                    fileName="Field_Employees_Live_Status"
                                    title="Field Employees Live Status Report"
                                />
                                <Link to="/employee-live-tracking" className="et-card-link">
                                    View All <ChevronRight size={12} />
                                </Link>
                            </div>
                        </div>
                        <div className="et-table-wrap">
                            <table className="et-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Current Location</th>
                                        <th>Last Update Time</th>
                                        <th>Battery</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.fieldEmployees?.length ? data.fieldEmployees.map(emp => (
                                        <tr key={emp.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div className="et-widget-avatar" style={{ background: getAvatarColor(emp.name || 'U'), width: 32, height: 32, fontSize: 12 }}>
                                                        {(emp.name || 'User').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{emp.name}</div>
                                                        <div style={{ fontSize: 11, color: '#64748b' }}>EMP-{String(emp.id).padStart(4, '0')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <MapPin size={12} style={{ color: '#64748b' }} /> {emp.location || 'Unknown'}
                                                </div>
                                            </td>
                                            <td>{formatTime(emp.lastUpdate)}</td>
                                            <td>
                                                {emp.batteryLevel ? (
                                                    <span style={{ color: emp.batteryLevel < 20 ? '#ef4444' : '#10b981', fontWeight: 500 }}>
                                                        {emp.batteryLevel}%
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td><span className={`et-badge et-badge-purple`}>Field Visit</span></td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="et-empty" style={{ padding: '30px 0' }}>
                                                No employees currently on field visit
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrackingDashboard;

