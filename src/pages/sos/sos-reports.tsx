import React, { useState, useEffect } from 'react';
import { 
    Search, MapPin, Eye, Phone, CheckCircle2, 
    XCircle, Clock, Calendar, User, 
    Filter, AlertCircle, ExternalLink, 
    Image as ImageIcon, MoreVertical, 
    ShieldAlert, Navigation2, LogIn, Activity, Flame, AlertTriangle, 
    HeartPulse, Thermometer, UserX, Layers, MessageSquare, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import './sos.css';

interface SosAlert {
    id: number;
    userId: number;
    message: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    status: string;
    resolvedAt: string | null;
    closedAt: string | null;
    createdAt: string;
    user: { name: string, employee_level_id: number };
    sosType: { name: string, imageUrl: string | null };
}

const SosReports: React.FC = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<SosAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    // Detail View
    const [selectedAlert, setSelectedAlert] = useState<SosAlert | null>(null);
    const [showProofModal, setShowProofModal] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
        // Auto-refresh every 30 seconds for real-time monitoring
        const interval = setInterval(fetchAlerts, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/sos/alerts');
            setAlerts(res.data);
            // Auto-select first alert if none selected
            if (res.data.length > 0 && !selectedAlert) {
                setSelectedAlert(res.data[0]);
            }
            setError(null);
        } catch (err) {
            setError('Failed to load SOS reports');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'resolve' | 'close') => {
        try {
            await api.post(`/sos/actions/${id}/${action}`);
            fetchAlerts();
            alert(`SOS ${action === 'resolve' ? 'Resolved' : 'Closed'} successfully`);
        } catch (err) {
            alert('Action failed');
        }
    };

    const openMap = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return 'sos-badge-active';
            case 'Resolved': return 'sos-badge-resolved';
            case 'Closed': return 'sos-badge-closed';
            default: return 'sos-badge-closed';
        }
    };

    const renderSosIcon = (imageUrl: string | null, size = 18) => {
        if (!imageUrl) return <AlertCircle size={size} />;
        if (imageUrl.startsWith('lucide:')) {
            const iconName = imageUrl.split(':')[1];
            switch (iconName) {
                case 'Flame': return <Flame size={size} />;
                case 'ShieldAlert': return <ShieldAlert size={size} />;
                case 'AlertTriangle': return <AlertTriangle size={size} />;
                case 'AlertCircle': return <AlertCircle size={size} />;
                case 'HeartPulse': return <HeartPulse size={size} />;
                case 'Activity': return <Activity size={size} />;
                case 'Thermometer': return <Thermometer size={size} />;
                case 'UserX': return <UserX size={size} />;
                case 'Layers': return <Layers size={size} />;
                case 'MessageSquare': return <MessageSquare size={size} />;
                case 'Info': return <Info size={size} />;
                default: return <AlertCircle size={size} />;
            }
        }
        return <img src={imageUrl} alt="SOS" style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} />;
    };

    const filteredAlerts = alerts.filter(a => {
        const matchesSearch = a.user.name.toLowerCase().includes(search.toLowerCase()) || 
                              (a.message || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
        const matchesType = typeFilter === 'All' || a.sosType.name === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const sosTypes = Array.from(new Set(alerts.map(a => a.sosType.name)));

    const calculateAvgResponse = () => {
        const resolvedAlerts = alerts.filter(a => a.status !== 'Active' && a.resolvedAt);
        if (resolvedAlerts.length === 0) return '0m';
        
        const totalMinutes = resolvedAlerts.reduce((acc, curr) => {
            const start = new Date(curr.createdAt).getTime();
            const end = new Date(curr.resolvedAt!).getTime();
            return acc + (end - start) / (1000 * 60);
        }, 0);
        
        const avg = Math.round(totalMinutes / resolvedAlerts.length);
        return avg > 60 ? `${Math.floor(avg / 60)}h ${avg % 60}m` : `${avg}m`;
    };

    return (
        <div className="sos-layout">
            <div className="sos-container sos-fade-in">
                {/* Header */}
                <div className="sos-header">
                    <div className="sos-header-left">
                        <div className="sos-header-icon" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                            <ShieldAlert size={32} />
                        </div>
                        <div>
                            <h2>SOS Incident Command Center</h2>
                            <p>Real-time monitoring and emergency response management</p>
                        </div>
                    </div>
                    <button className="sos-btn" onClick={() => navigate('/sos/manage')} style={{ background: '#f1f5f9', color: '#64748b' }}>
                        <ShieldAlert size={18} /> Manage Configurations
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div className="sos-stats">
                    <div className="sos-stat-card">
                        <div className="sos-stat-icon-box blue">
                            <Activity size={24} />
                        </div>
                        <div className="sos-stat-info">
                            <h3>Total Alerts</h3>
                            <div className="value">{alerts.length}</div>
                        </div>
                    </div>
                    <div className="sos-stat-card">
                        <div className="sos-stat-icon-box red" style={{ position: 'relative' }}>
                            <ShieldAlert size={24} />
                            {alerts.some(a => a.status === 'Active') && (
                                <div style={{ 
                                    position: 'absolute', top: -4, right: -4, 
                                    width: 12, height: 12, background: '#ef4444', 
                                    borderRadius: '50%', border: '2px solid white',
                                    animation: 'sos-pulse 1.5s infinite'
                                }}></div>
                            )}
                        </div>
                        <div className="sos-stat-info">
                            <h3>Active Emergencies</h3>
                            <div className="value" style={{ color: '#ef4444' }}>
                                {alerts.filter(a => a.status === 'Active').length}
                            </div>
                        </div>
                    </div>
                    <div className="sos-stat-card">
                        <div className="sos-stat-icon-box green">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="sos-stat-info">
                            <h3>Resolved Today</h3>
                            <div className="value">
                                {alerts.filter(a => a.status === 'Resolved' && new Date(a.createdAt).toDateString() === new Date().toDateString()).length}
                            </div>
                        </div>
                    </div>
                    <div className="sos-stat-card">
                        <div className="sos-stat-icon-box orange">
                            <Clock size={24} />
                        </div>
                        <div className="sos-stat-info">
                            <h3>Avg. Response</h3>
                            <div className="value">{calculateAvgResponse()}</div>
                        </div>
                    </div>
                </div>

                <div className="sos-report-container">
                    {/* List Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Filters Bar */}
                        <div className="sos-table-card" style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by employee or message..." 
                                        className="sos-input"
                                        style={{ paddingLeft: '40px' }}
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <select className="sos-select" style={{ width: '160px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                    <option value="All">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                                <select className="sos-select" style={{ width: '160px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                                    <option value="All">All SOS Types</option>
                                    {sosTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Table View */}
                        <div className="sos-table-card">
                            <table className="sos-table">
                                <thead>
                                    <tr>
                                        <th>Sr No</th>
                                        <th>Emergency Info</th>
                                        <th>Alert By</th>
                                        <th>Proof / Msg</th>
                                        <th>Created Date</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Scanning reports...</td></tr>
                                    ) : filteredAlerts.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No incidents logged</td></tr>
                                    ) : filteredAlerts.map((a, idx) => (
                                        <tr key={a.id} style={{ cursor: 'pointer', background: selectedAlert?.id === a.id ? '#fef2f2' : 'transparent' }} onClick={() => setSelectedAlert(a)}>
                                            <td style={{ fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ color: a.status === 'Active' ? '#ef4444' : '#10b981' }}>
                                                        {renderSosIcon(a.sosType.imageUrl, 18)}
                                                    </div>
                                                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{a.sosType.name}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{a.user.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>EID: {a.user.employee_level_id}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {a.imageUrl ? <ImageIcon size={14} color="#3b82f6" /> : <Clock size={14} color="#94a3b8" />}
                                                    <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {a.message || 'No custom message'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '13px' }}>{new Date(a.createdAt).toLocaleString()}</td>
                                            <td>
                                                <span className={`sos-badge ${getStatusClass(a.status)}`}>{a.status}</span>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button className="sos-btn-edit" style={{ border: 'none', background: 'transparent', padding: '4px' }}>
                                                    <Eye size={18} color="#6366f1" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dashboard Detail / Map Section */}
                    <div>
                        {selectedAlert ? (
                            <div className="sos-map-card sos-fade-in" key={selectedAlert.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="sos-type-cat" style={{ color: '#ef4444', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{selectedAlert.sosType.name} Alert</div>
                                        <h3 style={{ margin: '4px 0', fontSize: '18px', fontWeight: 900 }}>By: {selectedAlert.user.name}</h3>
                                    </div>
                                    <span className={`sos-badge ${getStatusClass(selectedAlert.status)}`}>{selectedAlert.status}</span>
                                </div>

                                {/* Placeholder Map View */}
                                <div className="sos-map-placeholder">
                                    <MapPin size={48} style={{ marginBottom: '12px', color: '#ef4444' }} />
                                    {selectedAlert.latitude && selectedAlert.longitude ? (
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Coordinates Located</div>
                                            <div style={{ fontSize: '12px', opacity: 0.6 }}>{selectedAlert.latitude}, {selectedAlert.longitude}</div>
                                            <button className="sos-btn sos-btn-outline" style={{ marginTop: '16px', padding: '8px 16px' }} onClick={() => openMap(selectedAlert.latitude!, selectedAlert.longitude!)}>
                                                <ExternalLink size={14} /> View Alert Map
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '13px', color: '#94a3b8' }}>Location Data Unavailable</div>
                                    )}
                                </div>

                                <div className="sos-map-info">
                                    <div className="sos-label">Additional Message</div>
                                    <p style={{ fontSize: '14px', color: '#475569', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        {selectedAlert.message || 'The user did not provide a custom message.'}
                                    </p>

                                    {selectedAlert.imageUrl && (
                                        <div style={{ marginTop: '16px' }}>
                                            <div className="sos-label">Visual Proof</div>
                                            <div 
                                                className="sos-proof-box" 
                                                style={{ width: '100%', height: 'auto', maxHeight: '200px' }}
                                                onClick={() => setShowProofModal(selectedAlert.imageUrl)}
                                            >
                                                <img src={selectedAlert.imageUrl} alt="Proof" className="sos-proof-img" />
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button className="sos-btn sos-btn-primary" style={{ width: '100%' }} onClick={() => window.alert('Initiating call to ' + selectedAlert.user.name)}>
                                            <Phone size={18} /> Call Employee
                                        </button>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <button 
                                                className="sos-btn sos-btn-outline" 
                                                style={{ borderColor: '#10b981', color: '#10b981' }}
                                                onClick={() => handleAction(selectedAlert.id, 'resolve')}
                                                disabled={selectedAlert.status !== 'Active'}
                                            >
                                                <CheckCircle2 size={16} /> Resolve
                                            </button>
                                            <button 
                                                className="sos-btn sos-btn-outline" 
                                                onClick={() => handleAction(selectedAlert.id, 'close')}
                                                disabled={selectedAlert.status === 'Closed'}
                                            >
                                                <XCircle size={16} /> Close SOS
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sos-map-card" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
                                <p>Select an incident to view live map and take actions</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Proof Zoom Modal */}
            {showProofModal && (
                <div className="ib-overlay" onClick={() => setShowProofModal(null)}>
                    <div className="sos-fade-in" style={{ maxWidth: '90vw', maxHeight: '90vh', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <img 
                            src={showProofModal} 
                            alt="SOS Proof Zoom" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
                        />
                        <button 
                            className="sos-btn" 
                            style={{ position: 'absolute', top: '-40px', right: '0', color: 'white', background: 'transparent' }}
                            onClick={() => setShowProofModal(null)}
                        >
                            <XCircle size={32} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SosReports;
