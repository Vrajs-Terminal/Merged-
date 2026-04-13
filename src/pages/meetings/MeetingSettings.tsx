import React, { useState, useEffect, useCallback } from 'react';
import { 
    Settings, Plus, Trash2, Loader2,
    Bell, MapPin, Video, Monitor,
    AppWindow, Database
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './meetings.css';

interface Setting {
    id: number;
    key: string;
    value: string;
}

const MeetingSettings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Setting[]>([]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/meetings/settings');
            setSettings(res.data);
        } catch (error) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdate = async (key: string, value: string) => {
        setSaving(true);
        try {
            await api.post('/meetings/settings', { key, value });
            toast.success('Setting updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update setting');
        } finally {
            setSaving(false);
        }
    };

    const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';
    const whatsappEnabled = getSetting('whatsapp_reminders') === 'true';
    const emailMomEnabled = getSetting('email_mom') === 'true';

    return (
        <div className="meeting-layout">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><Settings size={30} strokeWidth={2.5} color="var(--meeting-primary)" /> Meeting Module Settings</h2>
                        <p>Configure default behaviors, notification rules, and workspace resources.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-secondary" onClick={fetchData}>Refresh</button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                        <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                    </div>
                ) : (
                    <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
                        {/* Notification Settings */}
                        <div className="table-container glass-effect" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div className="silo-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><Bell size={22} /></div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Notification Rules</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="meeting-setting-row">
                                    <div className="meeting-setting-copy">
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Send WhatsApp Reminders</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Automated message to all participants when meeting starts.</div>
                                    </div>
                                    <div className="meeting-toggle-wrap">
                                        <button
                                            type="button"
                                            className={`meeting-toggle-switch ${whatsappEnabled ? 'is-on' : 'is-off'}`}
                                            onClick={() => handleUpdate('whatsapp_reminders', whatsappEnabled ? 'false' : 'true')}
                                            disabled={saving}
                                            aria-pressed={whatsappEnabled}
                                            title={whatsappEnabled ? 'Disable WhatsApp reminders' : 'Enable WhatsApp reminders'}
                                        >
                                            <span className="meeting-toggle-knob" aria-hidden="true" />
                                            <span className="meeting-toggle-label">{whatsappEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="meeting-setting-row">
                                    <div className="meeting-setting-copy">
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>Auto-Email Minutes (MOM)</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Automatically email the MOM report to all participants once finalized.</div>
                                    </div>
                                    <div className="meeting-toggle-wrap">
                                        <button
                                            type="button"
                                            className={`meeting-toggle-switch ${emailMomEnabled ? 'is-on' : 'is-off'}`}
                                            onClick={() => handleUpdate('email_mom', emailMomEnabled ? 'false' : 'true')}
                                            disabled={saving}
                                            aria-pressed={emailMomEnabled}
                                            title={emailMomEnabled ? 'Disable MOM email' : 'Enable MOM email'}
                                        >
                                            <span className="meeting-toggle-knob" aria-hidden="true" />
                                            <span className="meeting-toggle-label">{emailMomEnabled ? 'Enabled' : 'Disabled'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room & Resource Management */}
                        <div className="table-container glass-effect" style={{ padding: '32px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="silo-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><MapPin size={22} /></div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Meeting Room Resources</h3>
                                </div>
                                <button className="btn-secondary">
                                    <Plus size={16} /> Add Room
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {['Conference Room A', 'Discussion Room 1', 'Board Room'].map(room => (
                                    <div key={room} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{room}</div>
                                        <Trash2 size={16} color="#dc2626" style={{ cursor: 'pointer' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Platform Configuration */}
                        <div className="table-container glass-effect" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div className="silo-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><Monitor size={22} /></div>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Default Video Provider</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {['Google Meet', 'Zoom', 'Microsoft Teams'].map(platform => (
                                    <button
                                        key={platform} 
                                        className={getSetting('default_video') === platform ? 'btn-primary' : 'btn-secondary'}
                                        onClick={() => handleUpdate('default_video', platform)}
                                        style={{ flex: 1, padding: '20px', display: 'flex', flexWrap: 'wrap', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                                    >
                                        {platform === 'Google Meet' && <Video size={24} />}
                                        {platform === 'Zoom' && <AppWindow size={24} />}
                                        {platform === 'Microsoft Teams' && <Database size={24} />}
                                        <div style={{ fontWeight: 600 }}>{platform}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MeetingSettings;
