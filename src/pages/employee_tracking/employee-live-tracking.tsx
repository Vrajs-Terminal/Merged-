import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    MapPin, Search, RefreshCcw,
    Battery, BatteryMedium, BatteryLow,
    Wifi, WifiOff, Clock, User
, Navigation} from 'lucide-react';
import './employee-tracking.css';

interface EmployeeLive {
    id: number;
    name: string;
    department: string;
    branch: string;
    trackingEnabled: boolean;
    status: string;
    lastLocation: string;
    lastUpdate: string | null;
    batteryLevel: number | null;
    latitude: string | null;
    longitude: string | null;
    avatar?: string;
}

const EmployeeLiveTracking = () => {
    const [department, setDepartment] = useState('');
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

    const [employees, setEmployees] = useState<EmployeeLive[]>([]);
    const [statusCounts, setStatusCounts] = useState({ Working: 0, 'Field Visit': 0, Break: 0, Offline: 0 });
    const [loading, setLoading] = useState(true);

    const fetchLiveTracking = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (department && department !== 'All Departments') params.append('department', department);
            if (status && status !== 'All Status') params.append('status', status);
            if (searchQuery) params.append('search', searchQuery);

            const res = await api.get(`/tracking/live?${params.toString()}`);
            const data = res.data;

            // Add consistent avatar color based on name
            const enriched = data.employees.map((emp: EmployeeLive) => ({
                ...emp,
                avatar: getAvatarColor(emp.name || 'User')
            }));

            setEmployees(enriched);
            setStatusCounts(data.statusCounts);
        } catch (error) {
            console.error('Failed to fetch live tracking', error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters change or initially
    useEffect(() => {
        fetchLiveTracking();
    }, [department, status, searchQuery]);

    // Live refresh every 60s
    useEffect(() => {
        const interval = setInterval(fetchLiveTracking, 60000);
        return () => clearInterval(interval);
    }, []);

    const resetFilters = () => {
        setDepartment('');
        setStatus('');
        setSearchQuery('');
        setSelectedEmployee(null);
    };

    const getStatusDot = (s: string) => {
        const map: Record<string, string> = { 'Working': 'et-dot-green', 'Field Visit': 'et-dot-green', 'Break': 'et-dot-amber', 'Outside Geofence': 'et-dot-red', 'Late Check-in': 'et-dot-amber', 'Offline': 'et-dot-gray' };
        return map[s] || 'et-dot-gray';
    };

    const getStatusBadge = (s: string) => {
        const map: Record<string, string> = { 'Working': 'et-badge-green', 'Field Visit': 'et-badge-purple', 'Break': 'et-badge-amber', 'Outside Geofence': 'et-badge-red', 'Late Check-in': 'et-badge-orange', 'Offline': 'et-badge-gray' };
        return map[s] || 'et-badge-gray';
    };

    const getAvatarColor = (name: string) => {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#f97316', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const formatTime = (isoString: string | null) => {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`;
        return date.toLocaleDateString();
    };

    const BatteryIcon = ({ level }: { level: number | null }) => {
        if (level === null) return <WifiOff size={14} style={{ color: '#94a3b8' }} />;
        if (level > 50) return <Battery size={14} style={{ color: '#10b981' }} />;
        if (level > 20) return <BatteryMedium size={14} style={{ color: '#f59e0b' }} />;
        return <BatteryLow size={14} style={{ color: '#ef4444' }} />;
    };

    const selected = selectedEmployee ? employees.find(e => e.id === selectedEmployee) : null;

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h2 className="et-title"><Navigation className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Employee Live Tracking</h2>
                    <p className="et-subtitle">Monitor real-time location and status of all employees</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button className="et-btn-refresh btn-secondary" onClick={fetchLiveTracking} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh Live Data
                    </button>
                    <button className="et-btn-danger btn-secondary" onClick={resetFilters}>
                        <RefreshCcw size={16} /> Reset View
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="et-filters">
                <div className="et-filter-group" style={{ minWidth: 200 }}>
                    <label>Search Employee</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }}
                        />
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>
                </div>
                <div className="et-filter-group">
                    <label>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        {['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Working">Working</option>
                        <option value="Field Visit">Field Visit</option>
                        <option value="Break">Break</option>
                        <option value="Offline">Offline</option>
                    </select>
                </div>
            </div>

            {/* Status Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[
                    { label: 'Working', count: statusCounts.Working || 0, dot: 'et-dot-green', bg: '#f0fdf4', border: '#bbf7d0' },
                    { label: 'Field Visit', count: statusCounts['Field Visit'] || 0, dot: 'et-dot-green', bg: '#f5f3ff', border: '#ddd6fe' },
                    { label: 'On Break', count: statusCounts.Break || 0, dot: 'et-dot-amber', bg: '#fffbeb', border: '#fde68a' },
                    { label: 'Offline', count: statusCounts.Offline || 0, dot: 'et-dot-gray', bg: '#f8fafc', border: '#e2e8f0' },
                ].map((item, i) => (
                    <div key={i} style={{
                        flex: 1, padding: '10px 14px', borderRadius: 10, background: item.bg, border: `1px solid ${item.border}`,
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#374151'
                    }}>
                        <span className={`et-status-dot ${item.dot} et-dot-pulse`}></span>
                        {item.label}: <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.count}</span>
                    </div>
                ))}
            </div>

            {loading && employees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 50, color: '#64748b' }}>Loading map data...</div>
            ) : (
                /* Map + Employee List */
                <div className="et-grid-sidebar">
                    {/* Employee List Panel */}
                    <div className="et-card" style={{ maxHeight: 600, overflowY: 'auto', padding: 0 }}>
                        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
                            <h3 className="et-card-title" style={{ margin: 0 }}>
                                <User size={14} style={{ marginRight: 4 }} /> Employees ({employees.length})
                            </h3>
                        </div>

                        {employees.length === 0 ? (
                            <div className="et-empty" style={{ padding: '40px 20px' }}>
                                <span>No employees match filters</span>
                            </div>
                        ) : employees.map(emp => (
                            <div
                                key={emp.id}
                                onClick={() => setSelectedEmployee(emp.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                    borderBottom: '1px solid #f8fafc', cursor: 'pointer',
                                    background: selectedEmployee === emp.id ? '#eff6ff' : 'transparent',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <div className="et-widget-avatar" style={{ background: emp.avatar }}>
                                    {(emp.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className={`et-status-dot ${getStatusDot(emp.status)} et-dot-pulse`}></span>
                                        <span className="et-widget-name">{emp.name}</span>
                                    </div>
                                    <div className="et-widget-meta">{emp.department} • {emp.branch}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <MapPin size={10} /> {emp.lastLocation || 'Location unavailable'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                    <span className={`et-badge et-btn-sm ${getStatusBadge(emp.status)}`}>{emp.status}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748b' }}>
                                        <BatteryIcon level={emp.batteryLevel} /> {emp.batteryLevel !== null ? `${emp.batteryLevel}%` : '--'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Map View */}
                    <div className="et-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="et-map-container et-map-container-lg" style={{ borderRadius: 12, height: '100%', minHeight: 550 }}>
                            <div className="et-map-placeholder">
                                <MapPin size={48} />
                                <span style={{ fontSize: 15, fontWeight: 600 }}>Live Location Map</span>
                                <span style={{ fontSize: 12, color: '#94a3b8', maxWidth: 280, textAlign: 'center' }}>
                                    Real-time employee pins with status colors. ({employees.filter(e => e.latitude).length} active pins)
                                </span>

                                {selected && (
                                    <div style={{
                                        background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                        width: 280, marginTop: 16, textAlign: 'left'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                            <div className="et-widget-avatar" style={{ background: selected.avatar }}>
                                                {(selected.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{selected.name}</div>
                                                <div style={{ fontSize: 11, color: '#64748b' }}>{selected.department} • {selected.branch}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                                                <MapPin size={12} /> {selected.lastLocation || 'N/A'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                                                <Clock size={12} /> Last update: {formatTime(selected.lastUpdate)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                                                <BatteryIcon level={selected.batteryLevel} /> Battery: {selected.batteryLevel !== null ? `${selected.batteryLevel}%` : 'Unknown'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                                                {selected.status !== 'Offline' ? <Wifi size={12} /> : <WifiOff size={12} />}
                                                Status: <span className={`et-badge ${getStatusBadge(selected.status)}`}>{selected.status}</span>
                                            </div>
                                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                                                Coordinates: {selected.latitude || '--'}, {selected.longitude || '--'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Legend */}
                                <div style={{ display: 'flex', gap: 16, marginTop: selected ? 12 : 24 }}>
                                    {[
                                        { label: 'Working', color: '#10b981' },
                                        { label: 'Field Visit', color: '#8b5cf6' },
                                        { label: 'Break', color: '#f59e0b' },
                                        { label: 'Offline', color: '#94a3b8' },
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeLiveTracking;

