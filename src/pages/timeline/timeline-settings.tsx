'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Settings, Shield, Bell, Globe, Users, Save,
    Zap, Trash2, Smartphone, Monitor, Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import './timeline-design-system.css';

const TimelineSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>({
        allow_global: true,
        mod_required: false,
        retention_days: 365,
        social_notifications: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/timeline/settings');
                setSettings(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            await axios.post('/api/timeline/settings', settings);
            toast.success('Settings saved successfully');
        } catch (err) {
            toast.error('Failed to update settings');
        }
    };

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Settings className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#64748b' }} />
                        Engine Settings
                    </h2>
                    <p className="attendance-subtitle">Configure core platform behavior and data governance rules.</p>
                </div>
                <div className="attendance-actions">
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={14} /> Save Changes
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--spacing-4)' }}>

                {/* --- Main Settings --- */}
                <div className="tm-glass-card" style={{ padding: 'var(--spacing-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)' }}>
                        <div>
                            <h3 className="text-section-title">Platform Governance</h3>
                            <p className="text-label" style={{ marginTop: 4 }}>Core social engine configuration.</p>
                        </div>
                        <div style={{ padding: 12, background: '#f1f5f9', color: '#64748b', borderRadius: 12 }}>
                            <Shield size={22} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                        {[
                            { id: 'allow_global', label: 'Public Broadcasting', desc: 'Allow general employees to publish timeline posts publicly.', icon: Globe, color: '#3b82f6' },
                            { id: 'mod_required', label: 'Moderation Required', desc: 'All posts require admin approval before becoming visible.', icon: Shield, color: '#f59e0b' },
                            { id: 'social_notifications', label: 'Push Notifications', desc: 'Send in-app alerts when tagged or mentioned in posts.', icon: Bell, color: '#10b981' }
                        ].map((s, i) => (
                            <div key={i}
                                onClick={() => setSettings({ ...settings, [s.id]: !settings[s.id] })}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: '#f8fafc', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ padding: 10, background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-sm)', color: s.color }}>
                                        <s.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                                        <div className="text-label" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{s.desc}</div>
                                    </div>
                                </div>
                                <div className={`tm-toggle-switch ${settings[s.id] ? 'active' : ''}`}>
                                    <div className="tm-toggle-knob" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Retention */}
                    <div style={{ paddingTop: 24, borderTop: '1px solid var(--color-border-light)' }}>
                        <div className="filter-group">
                            <label><Database size={12} style={{ marginRight: 4 }} /> Retention Period (Days)</label>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="tm-input"
                                    style={{ maxWidth: 120 }}
                                    value={settings.retention_days}
                                    onChange={(e) => setSettings({ ...settings, retention_days: e.target.value })}
                                />
                                <p className="text-caption">Automatic lifecycle cleanup for archived entries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Sidebar --- */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Platform Sync */}
                    <div className="tm-glass-card" style={{ padding: 24, background: '#0f172a', border: 'none', position: 'relative', overflow: 'hidden' }}>
                        <h3 className="text-label" style={{ color: '#34d399', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={14} /> Platform Sync
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>ACTIVE</div>
                            <span className="badge badge-emerald" style={{ fontSize: 9 }}>HEALTHY</span>
                        </div>
                        <p className="text-caption" style={{ color: '#64748b' }}>
                            Real-time connection maintaining 4,204 active listeners across all branches.
                        </p>
                    </div>

                    {/* Administrative Actions */}
                    <div className="tm-glass-card" style={{ padding: 24 }}>
                        <h3 className="text-section-title" style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>Administrative Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                <Trash2 size={14} /> Flush Social Cache
                            </button>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                <Monitor size={14} /> Diagnostic Logs
                            </button>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                                <Smartphone size={14} /> Deploy Push Token
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TimelineSettings;
