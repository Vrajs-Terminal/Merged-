import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    AlertTriangle, Clock, MapPin, WifiOff,
    Activity, Check, X, MessageCircle,
    RefreshCcw, Shield, Eye, Download
, ShieldAlert} from 'lucide-react';
import './employee-tracking.css';



interface Exception {
    id: number;
    employeeName: string;
    department: string;
    type: string;
    description: string | null;
    status: string;
    severity: string;
    timestamp: string;
    date: string;
    location: string;
}

const ExceptionManagement = () => {
    const [exceptions, setExceptions] = useState<Exception[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [alertCounts, setAlertCounts] = useState({
        late: 0,
        geofence: 0,
        gps: 0,
        noMovement: 0,
        pending: 0
    });

    const fetchExceptions = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filterType && filterType !== 'All') query.append('type', filterType);
            if (filterStatus && filterStatus !== 'All') query.append('status', filterStatus);
            if (filterDate) query.append('date', filterDate);

            const res = await api.get(`/tracking-exceptions?${query.toString()}`);

            // Defensively map whatever comes from backend to expected Exception interface format
            const rawExceptions = res.data?.exceptions || [];
            const mappedExceptions = rawExceptions.map((ex: any) => ({
                id: ex.id || `temp-${Math.random()}`,
                employeeName: ex.user?.name || ex.employeeName || 'Unknown User',
                department: ex.user?.department?.name || ex.department || 'N/A',
                type: ex.type || 'Alert',
                description: ex.description || 'No specific description provided.',
                status: ex.status || 'Pending',
                severity: ex.severity || 'Medium',
                timestamp: ex.createdAt ? new Date(ex.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
                date: ex.createdAt ? ex.createdAt : new Date().toISOString(), // Store raw date for safe parsing
                location: ex.location || 'Unknown Location'
            }));

            setExceptions(mappedExceptions);
            setAlertCounts({
                late: res.data?.typeCounts?.latePunch || 0,
                geofence: res.data?.typeCounts?.geofenceViolation || 0,
                gps: res.data?.typeCounts?.gpsOff || 0,
                noMovement: res.data?.typeCounts?.internetOff || 0, // Using internetOff as proxy if noMovement missing
                pending: res.data?.stats?.pending || 0
            });
        } catch (error) {
            console.error('Failed to fetch exceptions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExceptions();
    }, [filterType, filterStatus, filterDate]);

    const handleAction = async (id: number, action: string) => {
        try {
            let endpoint = '';
            if (action === 'Approved') endpoint = 'approve';
            else if (action === 'Rejected') endpoint = 'reject';
            else if (action === 'Reason Requested') endpoint = 'ask-reason';

            await api.patch(`/tracking-exceptions/${id}/${endpoint}`);
            fetchExceptions(); // Refresh to get updated counts & list
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update exception status');
        }
    };

    const exportToCSV = async () => {
        try {
            const query = new URLSearchParams();
            if (filterType) query.append('type', filterType);
            if (filterStatus) query.append('status', filterStatus);
            if (filterDate) query.append('date', filterDate);

            const res = await api.get(`/tracking-exceptions/export?${query.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `exceptions_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export CSV', error);
        }
    };

    const getTypeIcon = (type: string) => {
        const map: Record<string, React.ReactNode> = {
            'Late Punch': <Clock size={14} />,
            'Outside Geofence': <MapPin size={14} />,
            'GPS Off': <WifiOff size={14} />,
            'No Movement': <Activity size={14} />,
        };
        return map[type] || <AlertTriangle size={14} />;
    };

    const getTypeBadge = (type: string) => {
        const map: Record<string, string> = {
            'Late Punch': 'et-badge-amber',
            'Outside Geofence': 'et-badge-red',
            'GPS Off': 'et-badge-gray',
            'No Movement': 'et-badge-orange',
        };
        return map[type] || 'et-badge-gray';
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            'Pending': 'et-badge-amber',
            'Approved': 'et-badge-green',
            'Rejected': 'et-badge-red',
            'Reason Requested': 'et-badge-blue',
        };
        return map[status] || 'et-badge-gray';
    };

    const getSeverityBadge = (severity: string) => {
        const map: Record<string, string> = { 'High': 'et-badge-red', 'Medium': 'et-badge-amber', 'Low': 'et-badge-gray' };
        return map[severity] || 'et-badge-gray';
    };

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h2 className="et-title"><ShieldAlert className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Exception Management</h2>
                    <p className="et-subtitle">Review and manage tracking alerts, violations, and exceptions</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {alertCounts.pending > 0 && (
                        <span className="et-badge et-badge-red" style={{ padding: '8px 14px', fontSize: 13, marginRight: 8 }}>
                            <AlertTriangle size={14} /> {alertCounts.pending} Pending Actions
                        </span>
                    )}
                    <button className="et-btn-refresh btn-secondary" onClick={fetchExceptions} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh Alert List
                    </button>
                    <button className="btn-primary" onClick={exportToCSV}>
                        <Download size={16} /> Export Reports
                    </button>
                </div>
            </div>

            {/* Alert Type Cards */}
            <div className="et-kpi-grid">
                {[
                    { title: 'Late Punch', value: alertCounts.late, icon: Clock, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
                    { title: 'Outside Geofence', value: alertCounts.geofence, icon: MapPin, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
                    { title: 'GPS Off', value: alertCounts.gps, icon: WifiOff, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
                    { title: 'No Movement', value: alertCounts.noMovement, icon: Activity, color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                ].map((card, i) => (
                    <div key={i} className={`et-kpi-card et-stagger-${i + 1}`} style={{ borderLeft: `3px solid ${card.color}` }}>
                        <div className="et-kpi-top">
                            <div className="et-kpi-icon" style={{ background: card.bg, color: card.color }}>
                                <card.icon size={18} />
                            </div>
                            <span className="et-badge" style={{ background: card.bg, color: card.color, border: `1px solid ${card.border}` }}>
                                Alert
                            </span>
                        </div>
                        <div className="et-kpi-value">{card.value}</div>
                        <div className="et-kpi-label">{card.title}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="et-filters">
                <div className="et-filter-group">
                    <label>Exception Type</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="Late Punch">Late Punch</option>
                        <option value="Outside Geofence">Outside Geofence</option>
                        <option value="GPS Off">GPS Off</option>
                        <option value="No Movement">No Movement</option>
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Reason Requested">Reason Requested</option>
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Date</label>
                    <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
                <div className="et-filter-buttons">
                    <button className="et-btn-danger" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterDate(''); }}>
                        <RefreshCcw size={16} /> Reset All Filters
                    </button>
                </div>
            </div>

            {/* Exception Table */}
            <div className="et-card et-stagger-5">
                <div className="et-card-header">
                    <h3 className="et-card-title">All Exceptions ({exceptions.length})</h3>
                </div>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading exceptions...</div>
                ) : (
                    <div className="et-table-wrap">
                        <table className="et-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Date & Time</th>
                                    <th>Location</th>
                                    <th>Severity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exceptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={8}>
                                            <div className="et-empty">
                                                <Shield size={32} />
                                                <span>No exceptions found matching your filters</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : exceptions.map((exc: any) => (
                                    <tr key={exc.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="et-widget-avatar" style={{ background: '#3b82f6', width: 32, height: 32, fontSize: 12 }}>
                                                    {(exc.employeeName || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{exc.employeeName || 'Unknown'}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b' }}>{exc.department || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`et-badge ${getTypeBadge(exc.type)}`}>
                                                {getTypeIcon(exc.type)} {exc.type}
                                            </span>
                                        </td>
                                        <td style={{ maxWidth: 200, fontSize: 12, color: '#475569' }}>{exc.description || 'No description provided'}</td>
                                        <td>
                                            <div style={{ fontSize: 12 }}>
                                                <div style={{ fontWeight: 500 }}>
                                                    {(() => {
                                                        const d = new Date(exc.date);
                                                        return isNaN(d.getTime()) ? 'Invalid Date' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                                                    })()}
                                                </div>
                                                <div style={{ color: '#94a3b8', fontSize: 11 }}>{exc.timestamp}</div>
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <MapPin size={10} style={{ color: '#94a3b8' }} /> {exc.location}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`et-badge ${getSeverityBadge(exc.severity)}`}>{exc.severity}</span>
                                        </td>
                                        <td>
                                            <span className={`et-badge ${getStatusBadge(exc.status)}`}>{exc.status}</span>
                                        </td>
                                        <td>
                                            {exc.status === 'Pending' ? (
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button className="et-btn-icon" style={{ color: '#10b981', borderColor: '#bbf7d0' }} title="Approve" onClick={() => handleAction(exc.id, 'Approved')}>
                                                        <Check size={14} />
                                                    </button>
                                                    <button className="et-btn-icon" style={{ color: '#ef4444', borderColor: '#fecaca' }} title="Reject" onClick={() => handleAction(exc.id, 'Rejected')}>
                                                        <X size={14} />
                                                    </button>
                                                    <button className="et-btn-icon" style={{ color: '#3b82f6', borderColor: '#bfdbfe' }} title="Ask Reason" onClick={() => handleAction(exc.id, 'Reason Requested')}>
                                                        <MessageCircle size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="et-btn-icon" title="View Details">
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExceptionManagement;
