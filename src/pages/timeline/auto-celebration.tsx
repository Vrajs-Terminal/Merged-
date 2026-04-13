'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Gift, Calendar, Clock, CheckCircle2,
    Cake, Heart, Target, Zap, Activity, ArrowRight, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import './timeline-design-system.css';

const AutoCelebration: React.FC = () => {
    const [settings, setSettings] = useState<any>({
        auto_birthday: true,
        auto_anniversary: true,
        publish_time: '09:00'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('/api/timeline/settings/celebration');
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
            await axios.post('/api/timeline/settings/celebration', settings);
            toast.success('Celebration protocols saved');
        } catch (err) {
            toast.error('Failed to update protocols');
        }
    };

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Gift className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#ec4899' }} />
                        Celebration Intelligence
                    </h2>
                    <p className="attendance-subtitle">Automated gratitude workflows and milestone protocols for employees.</p>
                </div>
                <div className="attendance-actions">
                    <button className="btn-primary" onClick={handleSave}>
                        <CheckCircle2 size={16} /> Deploy Protocols
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--spacing-4)' }}>

                {/* --- Main Settings Card --- */}
                <div className="tm-glass-card" style={{ padding: 'var(--spacing-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)' }}>
                        <div>
                            <h3 className="text-section-title">Active Protocols</h3>
                            <p className="text-label" style={{ marginTop: 4 }}>Configure your automated social touchpoints.</p>
                        </div>
                        <div style={{ padding: 12, background: '#fdf2f8', color: '#ec4899', borderRadius: 12 }}>
                            <Target size={22} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {/* Birthday Toggle */}
                        <div
                            onClick={() => setSettings({ ...settings, auto_birthday: !settings.auto_birthday })}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: '#f8fafc', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ padding: 10, background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
                                    <Cake size={18} style={{ color: '#ec4899' }} />
                                </div>
                                <div>
                                    <div className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Birthdays</div>
                                    <div className="text-label">Auto-Post Milestone</div>
                                </div>
                            </div>
                            <div className={`tm-toggle-switch ${settings.auto_birthday ? 'active' : ''}`}>
                                <div className="tm-toggle-knob" />
                            </div>
                        </div>

                        {/* Anniversary Toggle */}
                        <div
                            onClick={() => setSettings({ ...settings, auto_anniversary: !settings.auto_anniversary })}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: '#f8fafc', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ padding: 10, background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
                                    <Heart size={18} style={{ color: '#f43f5e' }} />
                                </div>
                                <div>
                                    <div className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Anniversaries</div>
                                    <div className="text-label">Milestone Dispatch</div>
                                </div>
                            </div>
                            <div className={`tm-toggle-switch ${settings.auto_anniversary ? 'active' : ''}`}>
                                <div className="tm-toggle-knob" />
                            </div>
                        </div>

                        {/* Dispatch Window */}
                        <div className="filter-group">
                            <label><Clock size={12} style={{ marginRight: 4 }} /> Dispatch Window</label>
                            <input
                                type="time"
                                className="tm-input"
                                value={settings.publish_time}
                                onChange={(e) => setSettings({ ...settings, publish_time: e.target.value })}
                            />
                        </div>

                        {/* Template Select */}
                        <div className="filter-group">
                            <label><Zap size={12} style={{ marginRight: 4 }} /> Branding Set</label>
                            <select className="tm-select" value={settings.template_id || '1'}>
                                <option value="1">Corporate Gold 🏆</option>
                                <option value="2">Vibrant Modern ✨</option>
                                <option value="3">Minimalist Sky ☁️</option>
                            </select>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div style={{ marginTop: 32, padding: 16, background: '#eef2ff', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <Info size={16} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
                        <p className="text-caption" style={{ color: '#4338ca' }}>
                            Our algorithm scans branch data continuously. Posts are queued exactly at the Dispatch Window to your designated social clusters.
                        </p>
                    </div>
                </div>

                {/* --- Sidebar --- */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Sync Pulse Card */}
                    <div className="tm-glass-card" style={{ padding: 24, background: '#0f172a', border: 'none', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="text-label" style={{ color: '#34d399' }}>
                                <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Sync Pulse
                            </h3>
                            <div className="tm-active-pulse" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>99.9%</div>
                            <div className="text-label" style={{ color: '#64748b' }}>Fidelity Score</div>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>Healthy Flux</span>
                                <div style={{ width: 5, height: 5, background: '#34d399', borderRadius: '50%' }} />
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Celebrations */}
                    <div className="tm-glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
                            <h3 className="text-section-title">Upcoming</h3>
                            <Calendar size={14} style={{ color: '#6366f1' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 16, position: 'relative' }}>
                            {/* Vertical line */}
                            <div style={{ position: 'absolute', left: 3, top: 20, bottom: 12, width: 2, background: 'var(--color-border-light)' }} />

                            {[
                                { name: 'Ananya Verma', type: 'Birthday', date: 'Today', color: '#ec4899' },
                                { name: 'Karthik Raja', type: 'Anniversary', date: 'Tomorrow', color: '#f43f5e' }
                            ].map((d, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', cursor: 'pointer' }}>
                                    {/* Timeline dot */}
                                    <div style={{ position: 'absolute', left: -20, top: 14, width: 8, height: 8, background: '#fff', border: '2px solid #6366f1', borderRadius: '50%', zIndex: 1 }} />
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: d.color }}>
                                        {d.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 700 }}>{d.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                            <span className="text-label" style={{ color: d.color }}>{d.type}</span>
                                            <span className="text-label">·</span>
                                            <span className="text-label" style={{ color: 'var(--color-text)' }}>{d.date}</span>
                                        </div>
                                    </div>
                                    <ArrowRight size={12} style={{ marginLeft: 'auto', color: '#6366f1', opacity: 0.4 }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AutoCelebration;
