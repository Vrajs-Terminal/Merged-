import React, { useState } from 'react';
import { 
    Plus, XCircle, Flame, ShieldAlert, Layers, 
    AlertTriangle, UserX, Info, HeartPulse, 
    Activity, Thermometer, MessageSquare, CheckSquare, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import './sos.css';

const COMMON_SOS = [
    { name: 'Fire', icon: <Flame size={24} /> },
    { name: 'Thief', icon: <ShieldAlert size={24} /> },
    { name: 'Stuck in Lift', icon: <Layers size={24} /> },
    { name: 'Animal Threat', icon: <AlertTriangle size={24} /> },
    { name: 'Employee Threat', icon: <UserX size={24} /> },
    { name: 'Abuse', icon: <Info size={24} /> },
    { name: 'Medical Emergency', icon: <HeartPulse size={24} /> },
    { name: 'Earthquake', icon: <Activity size={24} /> },
    { name: 'Heat', icon: <Thermometer size={24} /> },
    { name: 'Accident', icon: <AlertCircle size={24} /> },
    { name: 'Gas Leak', icon: <Flame size={24} color="#f59e0b" /> },
    { name: 'Panic', icon: <Activity size={24} color="#ec4899" /> },
    { name: 'Security Breach', icon: <ShieldAlert size={24} color="#1e293b" /> }
];

const ICON_OPTIONS = [
    { name: 'Flame', icon: <Flame size={20} /> },
    { name: 'ShieldAlert', icon: <ShieldAlert size={20} /> },
    { name: 'AlertTriangle', icon: <AlertTriangle size={20} /> },
    { name: 'AlertCircle', icon: <AlertCircle size={20} /> },
    { name: 'HeartPulse', icon: <HeartPulse size={20} /> },
    { name: 'Activity', icon: <Activity size={20} /> },
    { name: 'Thermometer', icon: <Thermometer size={20} /> },
    { name: 'UserX', icon: <UserX size={20} /> },
    { name: 'Layers', icon: <Layers size={20} /> },
    { name: 'MessageSquare', icon: <MessageSquare size={20} /> },
    { name: 'Info', icon: <Info size={20} /> }
];

const AddSos: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        validityMinutes: 60,
        status: 'Active',
        imageUrl: 'lucide:Flame'
    });
    const [selectedSeeds, setSelectedSeeds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.post('/sos/types', formData);
            alert('SOS Type added successfully');
            setFormData({ name: '', validityMinutes: 60, status: 'Active', imageUrl: '' });
        } catch (err: any) {
            alert(err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        if (selectedSeeds.length === 0) return alert('Select at least one SOS type');
        try {
            setLoading(true);
            await api.post('/sos/types/seed', { selectedTypes: selectedSeeds });
            alert('SOS Types added successfully from common bank');
            setSelectedSeeds([]);
        } catch (err) {
            alert('Seeding failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sos-layout">
            <div className="sos-container sos-fade-in">
                {/* Header */}
                <div className="sos-header">
                    <div className="sos-header-left">
                        <div className="sos-header-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f43f5e)' }}>
                            <Plus size={32} color="white" />
                        </div>
                        <div>
                            <h2>Add SOS Configuration</h2>
                            <p>Create custom emergency types or add from common SOS bank</p>
                        </div>
                    </div>
                    <button className="sos-btn" onClick={() => navigate('/sos/manage')} style={{ background: '#f1f5f9', color: '#64748b' }}>
                        <Layers size={18} /> Manage SOS
                    </button>
                </div>

                <div className="sos-report-container" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
                    {/* Custom Add Form */}
                    <div className="sos-table-card" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '24px', fontSize: '18px', fontWeight: 800 }}>Custom SOS Setup</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="sos-form-group">
                                <label className="sos-label">SOS Name *</label>
                                <input 
                                    className="sos-input" 
                                    placeholder="e.g. Fire, Medical Emergency"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="sos-form-group">
                                <label className="sos-label">Select SOS Icon *</label>
                                <div className="sos-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '8px', marginTop: '8px' }}>
                                    {ICON_OPTIONS.map(opt => (
                                        <div 
                                            key={opt.name}
                                            className={`sos-selection-item ${formData.imageUrl === `lucide:${opt.name}` ? 'selected' : ''}`}
                                            onClick={() => setFormData({ ...formData, imageUrl: `lucide:${opt.name}` })}
                                            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            title={opt.name}
                                        >
                                            {opt.icon}
                                        </div>
                                    ))}
                                </div>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>Or provide a custom image URL below:</p>
                                <input 
                                    className="sos-input" 
                                    style={{ marginTop: '4px' }}
                                    placeholder="https://example.com/icon.png"
                                    value={formData.imageUrl.startsWith('lucide:') ? '' : formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                />
                            </div>
                            <div className="sos-form-group">
                                <label className="sos-label">SOS Validity (Minutes) *</label>
                                <input 
                                    type="number"
                                    className="sos-input" 
                                    value={formData.validityMinutes}
                                    onChange={e => setFormData({ ...formData, validityMinutes: Number(e.target.value) })}
                                    required
                                />
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Duration for which the SOS alert remains active on the dashboard.</p>
                            </div>
                            <div className="sos-form-group">
                                <label className="sos-label">Initial Status</label>
                                <select className="sos-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <button type="submit" className="sos-btn sos-btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                                {loading ? 'Processing...' : 'Create SOS Type'}
                            </button>
                        </form>
                    </div>

                    {/* Common Bank Section */}
                    <div className="sos-table-card" style={{ padding: '30px', background: '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Add From Common SOS</h3>
                            <CheckSquare size={20} color="#64748b" />
                        </div>
                        
                        <div className="sos-selection-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                            {COMMON_SOS.map(item => (
                                <div 
                                    key={item.name}
                                    className={`sos-selection-item ${selectedSeeds.includes(item.name) ? 'selected' : ''}`}
                                    onClick={() => {
                                        if (selectedSeeds.includes(item.name)) {
                                            setSelectedSeeds(selectedSeeds.filter(s => s !== item.name));
                                        } else {
                                            setSelectedSeeds([...selectedSeeds, item.name]);
                                        }
                                    }}
                                    style={{ padding: '12px' }}
                                >
                                    <div style={{ color: selectedSeeds.includes(item.name) ? '#ef4444' : '#94a3b8', marginBottom: '8px' }}>
                                        {item.icon}
                                    </div>
                                    <div className="sos-selection-name" style={{ fontSize: '11px' }}>{item.name}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '30px' }}>
                            <button 
                                className="sos-btn sos-btn-primary" 
                                style={{ width: '100%', background: '#1e293b' }} 
                                onClick={handleSeed}
                                disabled={loading || selectedSeeds.length === 0}
                            >
                                {loading ? 'Adding...' : `Add Selected SOS (${selectedSeeds.length})`}
                            </button>
                            <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                                Selected types will be added with standard durations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddSos;
