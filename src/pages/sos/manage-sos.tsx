import React, { useState, useEffect } from 'react';
import { 
    Trash2, Edit3, XCircle, Info, 
    ShieldAlert, AlertTriangle, Clock, 
    Image as ImageIcon, CheckCircle2,
    Activity, Flame, Layers, UserX, HeartPulse,
    Thermometer, MessageSquare, Plus, RefreshCw, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import './sos.css';

interface SosType {
    id: number;
    name: string;
    imageUrl: string | null;
    validityMinutes: number;
    status: string;
    isPredefined: boolean;
    _count?: { alerts: number };
}

const ManageSos: React.FC = () => {
    const navigate = useNavigate();
    const [sosTypes, setSosTypes] = useState<SosType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingType, setEditingType] = useState<SosType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        validityMinutes: 60,
        status: 'Active',
        imageUrl: ''
    });
    const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

    useEffect(() => {
        fetchSosTypes();
    }, []);

    const fetchSosTypes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/sos/types');
            setSosTypes(res.data);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            alert('Failed to load SOS configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setEditingType(null);
        setFormData({ name: '', validityMinutes: 60, status: 'Active', imageUrl: '' });
        setShowAddModal(true);
    };

    const handleOpenEdit = (type: SosType) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            validityMinutes: type.validityMinutes,
            status: type.status,
            imageUrl: type.imageUrl || ''
        });
        setShowEditModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await api.put(`/sos/types/${editingType.id}`, formData);
            } else {
                await api.post('/sos/types', formData);
            }
            fetchSosTypes();
            setShowEditModal(false);
            setShowAddModal(false);
        } catch (err: any) {
            alert(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this SOS type? This cannot be undone if no alerts are linked.')) return;
        try {
            await api.delete(`/sos/types/${id}`);
            fetchSosTypes();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Delete failed');
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            await api.patch(`/sos/types/${id}/toggle`);
            setSosTypes(sosTypes.map(t => t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t));
        } catch (err) {
            alert('Toggle failed');
        }
    };

    const renderSosIcon = (imageUrl: string | null, size = 32) => {
        if (!imageUrl) return <AlertTriangle size={size} />;
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
                default: return <AlertTriangle size={size} />;
            }
        }
        return <img src={imageUrl} alt="SOS" style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }} />;
    };

    const ICON_OPTIONS = ['Flame', 'ShieldAlert', 'AlertTriangle', 'AlertCircle', 'HeartPulse', 'Activity', 'Thermometer', 'UserX', 'Layers', 'MessageSquare', 'Info'];

    return (
        <div className="sos-layout">
            <div className="sos-container sos-fade-in">
                {/* Header */}
                <div className="sos-header">
                    <div className="sos-header-left">
                        <div className="sos-header-icon" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                            <ShieldAlert size={32} color="white" />
                        </div>
                        <div>
                            <h2>Manage SOS Types</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                                <span>View, edit, or toggle emergency configurations</span>
                                <span style={{ color: '#cbd5e1' }}>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} /> Last synced: {lastUpdated}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="sos-btn" onClick={() => navigate('/sos/reports')} title="View Incident Reports" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <Activity size={18} /> Reports
                        </button>
                        <button className="sos-btn" onClick={fetchSosTypes} title="Refresh Data" style={{ background: '#f1f5f9', width: '45px', padding: '0' }}>
                            <RefreshCw size={18} />
                        </button>
                        <button className="sos-btn sos-btn-primary" onClick={handleOpenAdd}>
                            <Plus size={18} /> Create New SOS
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px' }}>Scanning configurations...</div>
                ) : sosTypes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <ShieldAlert size={40} color="#94a3b8" />
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>No SOS Protocols Found</h3>
                        <p style={{ color: '#64748b', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                            Configure standard emergency response types to enable safety features for your employees on the mobile application.
                        </p>
                        <button className="sos-btn sos-btn-primary" onClick={() => navigate('/sos/add')}>
                            <Plus size={18} /> Initialize First SOS
                        </button>
                    </div>
                ) : (
                    <div className="sos-type-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                        {sosTypes.map(type => (
                            <div key={type.id} className="sos-type-card sos-fade-in">
                                <div className="sos-status-toggle">
                                    <button 
                                        onClick={() => toggleStatus(type.id)}
                                        className={`sos-badge ${type.status === 'Active' ? 'sos-badge-resolved' : 'sos-badge-closed'}`}
                                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                                    >
                                        {type.status}
                                    </button>
                                </div>
                                <div className="sos-type-icon-circle">
                                    {renderSosIcon(type.imageUrl)}
                                </div>
                                <div className="sos-type-name" style={{ fontSize: '18px', fontWeight: 900 }}>{type.name}</div>
                                <div className="sos-type-duration" style={{ fontSize: '13px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center' }}>
                                    <Clock size={14} style={{ marginRight: '8px' }} />
                                    Duration: {type.validityMinutes} mins
                                </div>
                                <div className="sos-type-actions" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                    <button className="sos-type-btn sos-btn-edit" onClick={() => handleOpenEdit(type)} style={{ color: '#6366f1' }}>
                                        <Edit3 size={16} /> Edit
                                    </button>
                                    <button className="sos-type-btn sos-btn-delete" onClick={() => handleDelete(type.id)} style={{ color: '#ef4444' }}>
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="ib-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="ib-drawer" onClick={e => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">Modify SOS Identity</div>
                            <button className="sos-btn" onClick={() => setShowEditModal(false)}><XCircle /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '30px' }}>
                            <div className="ib-drawer-body">
                                <div className="sos-form-group">
                                    <label className="sos-label">SOS Name *</label>
                                    <input 
                                        className="sos-input" 
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">Minutes Validity *</label>
                                    <input 
                                        type="number"
                                        className="sos-input" 
                                        value={formData.validityMinutes}
                                        onChange={e => setFormData({ ...formData, validityMinutes: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">SOS Icon</label>
                                    <div className="sos-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))', gap: '8px', marginTop: '8px' }}>
                                        {ICON_OPTIONS.map(name => (
                                            <div 
                                                key={name}
                                                className={`sos-selection-item ${formData.imageUrl === `lucide:${name}` ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, imageUrl: `lucide:${name}` })}
                                                style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                {renderSosIcon(`lucide:${name}`, 20)}
                                            </div>
                                        ))}
                                    </div>
                                    <input 
                                        className="sos-input" 
                                        style={{ marginTop: '12px' }}
                                        placeholder="Custom Image URL"
                                        value={formData.imageUrl.startsWith('lucide:') ? '' : formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">Status Visibility</label>
                                    <select className="sos-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active (Visible in App)</option>
                                        <option value="Inactive">Inactive (Hidden)</option>
                                    </select>
                                </div>
                            </div>
                        <div className="ib-drawer-footer">
                                <button type="button" className="sos-btn sos-btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                                <button type="submit" className="sos-btn sos-btn-primary" style={{ background: '#6366f1' }}>Update Configuration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="ib-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="ib-drawer" onClick={e => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">Add New SOS Protocol</div>
                            <button className="sos-btn" onClick={() => setShowAddModal(false)}><XCircle /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '30px' }}>
                            <div className="ib-drawer-body">
                                <div className="sos-form-group">
                                    <label className="sos-label">SOS Name * (e.g. Fire, Medical)</label>
                                    <input 
                                        className="sos-input" 
                                        placeholder="Enter emergency name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">Minutes Validity * (How long alert stays active)</label>
                                    <input 
                                        type="number"
                                        className="sos-input" 
                                        value={formData.validityMinutes}
                                        onChange={e => setFormData({ ...formData, validityMinutes: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">Icon Image URL (Optional)</label>
                                    <input 
                                        className="sos-input" 
                                        placeholder="https://example.com/icon.png"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="sos-form-group">
                                    <label className="sos-label">Status</label>
                                    <select className="sos-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option value="Active">Active (Public)</option>
                                        <option value="Inactive">Inactive (Draft)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="ib-drawer-footer">
                                <button type="button" className="sos-btn sos-btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="sos-btn sos-btn-primary">Save Configuration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSos;
