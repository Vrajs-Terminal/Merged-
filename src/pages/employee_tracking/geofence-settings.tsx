import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../lib/axios';
import {
    MapPin, Plus, Edit2, Trash2, X, Check, Download,
    Target, Crosshair, Shield, AlertCircle, RefreshCcw
, Focus} from 'lucide-react';
import './employee-tracking.css';

interface Geofence {
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    radius: number;
    status: 'Active' | 'Inactive';
    punchRule: 'inside_only' | 'outside_with_reason';
    employeeCount: number;
}

const GeofenceSettings = () => {
    const [geofences, setGeofences] = useState<Geofence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);

    const [formData, setFormData] = useState({
        name: '', latitude: '', longitude: '', radius: 200, punchRule: 'inside_only' as 'inside_only' | 'outside_with_reason'
    });

    const [stats, setStats] = useState({
        total: 0, active: 0, inactive: 0, totalCoveredEmployees: 0
    });

    const fetchGeofences = async () => {
        setLoading(true);
        try {
            const res = await api.get('/geofences');
            setGeofences(res.data.geofences || res.data); // Adjusting in case the backend returns the array directly
            if (res.data.stats) {
                setStats(res.data.stats);
            } else {
                // Fallback stats calculation if backend doesn't send them wrapped
                const data = res.data.geofences || res.data;
                const active = data.filter((g: any) => g.status === 'Active').length;
                setStats({
                    total: data.length,
                    active,
                    inactive: data.length - active,
                    totalCoveredEmployees: data.reduce((sum: number, g: any) => sum + (g.employeeCount || 0), 0)
                });
            }
        } catch (error) {
            console.error('Failed to fetch geofences', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGeofences();
    }, []);

    const openAddModal = () => {
        setEditMode(false);
        setFormData({ name: '', latitude: '', longitude: '', radius: 200, punchRule: 'inside_only' });
        setShowModal(true);
    };

    const openEditModal = (gf: Geofence) => {
        setEditMode(true);
        setFormData({ name: gf.name, latitude: gf.latitude, longitude: gf.longitude, radius: gf.radius, punchRule: gf.punchRule });
        setSelectedGeofence(gf);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim() || !formData.latitude.trim() || !formData.longitude.trim()) {
            alert('Name, latitude, and longitude are required.');
            return;
        }
        if (isNaN(Number(formData.latitude)) || isNaN(Number(formData.longitude))) {
            alert('Latitude and Longitude must be valid numbers.');
            return;
        }

        try {
            const url = editMode && selectedGeofence
                ? `/geofences/${selectedGeofence.id}`
                : '/geofences';

            const payload = {
                name: formData.name,
                latitude: formData.latitude.toString(),
                longitude: formData.longitude.toString(),
                radius: Number(formData.radius),
                punchRule: formData.punchRule
            };

            let res;
            if (editMode) {
                res = await api.put(url, payload);
            } else {
                res = await api.post(url, payload);
            }

            if (res.status === 200 || res.status === 201) {
                setShowModal(false);
                fetchGeofences();
            }
        } catch (error: any) {
            console.error('Failed to save geofence', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown error';
            alert(`Error saving geofence: ${errorMsg}`);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this geofence?')) {
            try {
                await api.delete(`/geofences/${id}`);
                fetchGeofences();
            } catch (error) {
                console.error('Failed to delete geofence', error);
            }
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            setGeofences(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'Active' ? 'Inactive' : 'Active' } : g));
            await api.patch(`/geofences/${id}/toggle`);
        } catch (error) {
            console.error('Failed to toggle status', error);
            fetchGeofences();
        }
    };

    const exportToCSV = async () => {
        try {
            const res = await api.get('/geofences/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `geofences_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export CSV', error);
        }
    };

    return (
        <>
            <div className="et-container">
                <div className="et-header">
                    <div>
                        <h2 className="et-title"><Focus className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Geo-Fence Settings</h2>
                        <p className="et-subtitle">Configure office locations and geofence boundaries for attendance tracking</p>
                    </div>
                    <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button className="et-btn-refresh btn-secondary" onClick={fetchGeofences} disabled={loading}>
                            <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh
                        </button>
                        <button className="btn-secondary" onClick={exportToCSV}>
                            <Download size={16} /> Export
                        </button>
                        <button className="btn-primary" onClick={openAddModal}>
                            <Plus size={16} /> Add Geofence
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="et-kpi-grid" style={{ marginBottom: 16 }}>
                    {[
                        { title: 'Total Geofences', value: stats.total, icon: Target, color: '#3b82f6', bg: '#eff6ff' },
                        { title: 'Active', value: stats.active, icon: Check, color: '#10b981', bg: '#f0fdf4' },
                        { title: 'Inactive', value: stats.inactive, icon: AlertCircle, color: '#94a3b8', bg: '#f8fafc' },
                        { title: 'Covered Employees', value: stats.totalCoveredEmployees, icon: Shield, color: '#8b5cf6', bg: '#f5f3ff' },
                    ].map((stat, i) => (
                        <div key={i} className={`et-kpi-card et-stagger-${i + 1}`}>
                            <div className="et-kpi-top">
                                <div className="et-kpi-icon" style={{ background: stat.bg, color: stat.color }}>
                                    <stat.icon size={18} />
                                </div>
                            </div>
                            <div className="et-kpi-value">{stat.value}</div>
                            <div className="et-kpi-label">{stat.title}</div>
                        </div>
                    ))}
                </div>

                {/* Map Preview + Table */}
                <div className="et-grid-2" style={{ marginBottom: 16 }}>
                    {/* Map Preview */}
                    <div className="et-card et-stagger-5">
                        <div className="et-card-header">
                            <h3 className="et-card-title">
                                <Crosshair size={14} style={{ marginRight: 4, color: '#3b82f6' }} /> Geofence Map
                            </h3>
                        </div>
                        <div className="et-map-container">
                            <div className="et-map-placeholder">
                                <Target size={48} />
                                <span>Geofence Zones Map</span>
                                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                    {geofences.filter(g => g.status === 'Active').length} active zones with radius circles
                                </span>
                                {/* Simulated geofence indicators */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center', maxWidth: 320 }}>
                                    {geofences.filter(g => g.status === 'Active').map(gf => (
                                        <div key={gf.id} style={{
                                            padding: '4px 10px', borderRadius: 20, background: '#fff', fontSize: 11, fontWeight: 500,
                                            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 4, color: '#374151'
                                        }}>
                                            <MapPin size={10} style={{ color: '#3b82f6' }} /> {gf.name} ({gf.radius}m)
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Punch Rules Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="et-card et-stagger-5">
                            <div className="et-card-header">
                                <h3 className="et-card-title">
                                    <Shield size={14} style={{ marginRight: 4, color: '#10b981' }} /> Punch Rules
                                </h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{
                                    padding: 14, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    display: 'flex', alignItems: 'flex-start', gap: 10
                                }}>
                                    <Check size={16} style={{ color: '#10b981', marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>Inside Geofence Only</div>
                                        <div style={{ fontSize: 12, color: '#475569' }}>
                                            Employee can only punch in/out when inside the defined geofence radius. Punch attempts outside will be blocked.
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: 14, borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a',
                                    display: 'flex', alignItems: 'flex-start', gap: 10
                                }}>
                                    <AlertCircle size={16} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 2 }}>Allow Outside with Reason</div>
                                        <div style={{ fontSize: 12, color: '#475569' }}>
                                            Employee can punch from outside the geofence but must provide a reason. This will be flagged as an exception for admin review.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="et-info-panel">
                            <h4 className="et-info-title">
                                <Shield size={14} /> Geofence Guidelines
                            </h4>
                            <ul className="et-info-list">
                                <li>Set radius based on office area size (100m–500m recommended)</li>
                                <li>Ensure GPS accuracy in the target area before setting</li>
                                <li>Field employees should use "outside with reason" rule</li>
                                <li>Review geofence violations weekly via Exception Management</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Geofence Table */}
                <div className="et-card et-stagger-6">
                    <div className="et-card-header">
                        <h3 className="et-card-title">All Geofence Locations</h3>
                        <span className="et-badge et-badge-blue">{geofences.length} locations</span>
                    </div>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading geofences...</div>
                    ) : (
                        <div className="et-table-wrap">
                            <table className="et-table">
                                <thead>
                                    <tr>
                                        <th>Location Name</th>
                                        <th>Latitude</th>
                                        <th>Longitude</th>
                                        <th>Radius</th>
                                        <th>Punch Rule</th>
                                        <th>Employees</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {geofences.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px' }}>No geofences configured.</td>
                                        </tr>
                                    ) : geofences.map(gf => (
                                        <tr key={gf.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <MapPin size={14} style={{ color: gf.status === 'Active' ? '#3b82f6' : '#94a3b8' }} />
                                                    <span style={{ fontWeight: 600 }}>{gf.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{gf.latitude}</td>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{gf.longitude}</td>
                                            <td>
                                                <span style={{ fontWeight: 600 }}>{gf.radius}m</span>
                                            </td>
                                            <td>
                                                <span className={`et-badge ${gf.punchRule === 'inside_only' ? 'et-badge-green' : 'et-badge-amber'}`}>
                                                    {gf.punchRule === 'inside_only' ? 'Inside Only' : 'Outside + Reason'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{gf.employeeCount || 0}</td>
                                            <td>
                                                <label className="et-toggle" onClick={() => toggleStatus(gf.id)}>
                                                    <input type="checkbox" checked={gf.status === 'Active'} readOnly />
                                                    <span className="et-toggle-slider"></span>
                                                </label>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="et-btn-icon" onClick={() => openEditModal(gf)}>
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button className="et-btn-icon" style={{ color: '#ef4444' }} onClick={() => handleDelete(gf.id)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal - rendered via Portal to bypass transform containing block */}
            {showModal && createPortal(
                <div className="et-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="et-modal" onClick={e => e.stopPropagation()}>
                        <div className="et-modal-header">
                            <h3><MapPin size={18} style={{ color: '#3b82f6' }} /> {editMode ? 'Edit Geofence' : 'Add New Geofence'}</h3>
                            <button className="et-btn-icon" onClick={() => setShowModal(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="et-modal-body">
                            <div className="et-form-group">
                                <label className="et-form-label">Location Name *</label>
                                <input className="et-form-input" type="text" placeholder="e.g., Mumbai Head Office" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="et-grid-2">
                                <div className="et-form-group">
                                    <label className="et-form-label">Latitude *</label>
                                    <input className="et-form-input" type="text" placeholder="e.g., 19.0760" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} />
                                </div>
                                <div className="et-form-group">
                                    <label className="et-form-label">Longitude *</label>
                                    <input className="et-form-input" type="text" placeholder="e.g., 72.8777" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} />
                                </div>
                            </div>
                            <div className="et-form-group">
                                <label className="et-form-label">Radius: {formData.radius}m</label>
                                <input
                                    type="range" className="et-range-slider" min={50} max={1000} step={50}
                                    value={formData.radius} onChange={e => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                                    <span>50m</span>
                                    <span>500m</span>
                                    <span>1000m</span>
                                </div>
                            </div>
                            <div className="et-form-group">
                                <label className="et-form-label">Punch Rule</label>
                                <select className="et-form-select" value={formData.punchRule} onChange={e => setFormData({ ...formData, punchRule: e.target.value as any })}>
                                    <option value="inside_only">Punch allowed inside geofence only</option>
                                    <option value="outside_with_reason">Allow outside punch with reason</option>
                                </select>
                            </div>

                            {/* Map Preview for coordinates */}
                            <div style={{ borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', padding: 16, textAlign: 'center' }}>
                                <Crosshair size={24} style={{ color: '#94a3b8', marginBottom: 8 }} />
                                <div style={{ fontSize: 12, color: '#64748b' }}>Map preview will show here with the geofence circle</div>
                                {formData.latitude && formData.longitude && (
                                    <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 8, fontWeight: 500 }}>
                                        📍 {formData.latitude}, {formData.longitude} • Radius: {formData.radius}m
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="et-modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={!formData.name || !formData.latitude || !formData.longitude}>
                                {editMode ? 'Update Geofence' : 'Create Geofence'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default GeofenceSettings;
