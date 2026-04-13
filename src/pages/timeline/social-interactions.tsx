'use client';

import React, { useState } from 'react';
import {
    Heart, MessageSquare, Share2,
    Zap, Activity, ShieldAlert,
    ArrowUpRight, Users, MessageCircle
} from 'lucide-react';
import './timeline-design-system.css';

const SocialInteractions: React.FC = () => {
    const [interactions] = useState([
        { type: 'Love', count: '1.2k', label: 'Sentiment', icon: Heart, color: '#f43f5e', bg: '#fff1f2' },
        { type: 'Dialogue', count: '840', label: 'Threaded', icon: MessageCircle, color: '#3b82f6', bg: '#eff6ff' },
        { type: 'Reach', count: '12.4k', label: 'Global', icon: Users, color: '#10b981', bg: '#f0fdf4' },
        { type: 'Export', count: '210', label: 'External', icon: Share2, color: '#f59e0b', bg: '#fffbeb' }
    ]);

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Activity className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#ec4899' }} />
                        Engagement Protocols
                    </h2>
                    <p className="attendance-subtitle">Manage how employees interact and amplify organizational culture.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--spacing-4)' }}>

                {/* --- Settings Card --- */}
                <div className="tm-glass-card" style={{ padding: 'var(--spacing-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)' }}>
                        <div>
                            <h3 className="text-section-title">Interaction Standards</h3>
                            <p className="text-label" style={{ marginTop: 4 }}>Configure social engagement rules.</p>
                        </div>
                        <div style={{ padding: 12, background: '#eef2ff', color: '#6366f1', borderRadius: 12 }}>
                            <Zap size={22} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                        {[
                            { label: 'Reactions', desc: 'Allow employees to use Heart/Like interactions on all social entries.', icon: Heart, color: '#f43f5e', enabled: true },
                            { label: 'Comments', desc: 'Enable multi-threaded comments and organizational discussions.', icon: MessageSquare, color: '#3b82f6', enabled: true },
                            { label: 'External Sharing', desc: 'Allow employees to export/share posts to external platforms.', icon: Share2, color: '#10b981', enabled: false }
                        ].map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: '#f8fafc', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ padding: 10, background: '#fff', borderRadius: 10, boxShadow: 'var(--shadow-sm)', color: s.color }}>
                                        <s.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                                        <div className="text-label" style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{s.desc}</div>
                                    </div>
                                </div>
                                <div className={`tm-toggle-switch ${s.enabled ? 'active' : ''}`}>
                                    <div className="tm-toggle-knob" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Governance Note */}
                    <div style={{ padding: 16, background: '#eef2ff', borderRadius: 12, position: 'relative' }}>
                        <h4 className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShieldAlert size={14} style={{ color: '#f59e0b' }} /> Governance Note
                        </h4>
                        <p className="text-caption">Engagement data is used exclusively for culture benchmarking and is anonymized during administrative exports for privacy compliance.</p>
                    </div>
                </div>

                {/* --- Sidebar --- */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Interaction KPI Tiles */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {interactions.map((it, i) => (
                            <div key={i} className="tm-glass-card" style={{ padding: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: it.bg, color: it.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <it.icon size={13} />
                                    </div>
                                    <span className="text-label" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <ArrowUpRight size={10} strokeWidth={3} /> +12%
                                    </span>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{it.count}</div>
                                <div className="text-label" style={{ marginTop: 2 }}>{it.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Engagement Spark Bar */}
                    <div className="tm-glass-card" style={{ padding: 24, background: '#0f172a', border: 'none', textAlign: 'center' }}>
                        <h3 className="text-label" style={{ color: '#fff', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Engagement Flux</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 20 }}>
                            {[30, 60, 45, 90, 55, 80, 40].map((h, i) => (
                                <div key={i} style={{ width: 6, height: h, background: '#10b981', borderRadius: 4, opacity: 0.3 + (i * 0.1) }} />
                            ))}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#34d399', marginBottom: 4 }}>+24%</div>
                        <div className="text-label" style={{ color: '#64748b' }}>Velocity Surge</div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default SocialInteractions;
