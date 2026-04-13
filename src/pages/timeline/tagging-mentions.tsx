'use client';

import React, { useState } from 'react';
import {
    AtSign, Users, Mail, Target, Bell,
    AtSign as MentionIcon, Globe, Activity
} from 'lucide-react';
import './timeline-design-system.css';

const TaggingMentions: React.FC = () => {
    const [rules, setRules] = useState({
        global: true,
        dept: true,
        maxTags: 10
    });

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <AtSign className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#6366f1' }} />
                        Mention Intelligence
                    </h2>
                    <p className="attendance-subtitle">Control organizational visibility and cross-functional tagging protocols.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--spacing-4)' }}>

                {/* --- Settings Card --- */}
                <div className="tm-glass-card" style={{ padding: 'var(--spacing-8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border-light)' }}>
                        <div>
                            <h3 className="text-section-title">Governance Protocols</h3>
                            <p className="text-label" style={{ marginTop: 4 }}>Configure visibility and tagging rules.</p>
                        </div>
                        <div style={{ padding: 12, background: '#eef2ff', color: '#6366f1', borderRadius: 12 }}>
                            <Target size={22} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                        {[
                            { id: 'global', label: 'Company-Wide Pings', desc: 'Allow admins to notify all active members using @everyone.', icon: Globe, color: '#3b82f6' },
                            { id: 'dept', label: 'Departmental Sync', desc: 'Enable tagging of specific functional groups and divisions.', icon: Users, color: '#10b981' }
                        ].map((s, i) => (
                            <div key={i}
                                onClick={() => setRules({ ...rules, [s.id as keyof typeof rules]: !rules[s.id as keyof typeof rules] })}
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
                                <div className={`tm-toggle-switch ${(rules as any)[s.id] ? 'active' : ''}`}>
                                    <div className="tm-toggle-knob" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ paddingTop: 24, borderTop: '1px solid var(--color-border-light)' }}>
                        <div className="filter-group">
                            <label><MentionIcon size={12} style={{ marginRight: 4 }} /> Mention Density Limit</label>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <input
                                    type="number"
                                    className="tm-input"
                                    style={{ maxWidth: 120 }}
                                    value={rules.maxTags}
                                    onChange={(e) => setRules({ ...rules, maxTags: parseInt(e.target.value) })}
                                />
                                <p className="text-caption">Max unique @mentions per post.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Sidebar --- */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Stats Card */}
                    <div className="tm-glass-card" style={{ padding: 24, background: '#0f172a', border: 'none', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 className="text-label" style={{ color: '#34d399' }}>
                                <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Global Flux
                            </h3>
                            <div className="tm-active-pulse" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 4 }}>842K</div>
                            <div className="text-label" style={{ color: '#64748b' }}>Monthly Mentions</div>
                        </div>
                    </div>

                    {/* Alert Config */}
                    <div className="tm-glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
                            <Bell size={14} style={{ color: '#6366f1' }} />
                            <h3 className="text-section-title">Alert Architecture</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'SMTP Forwarding', desc: 'Forward pings to corporate mail.', icon: Mail },
                                { label: 'In-App Highlight', desc: 'Highlight @pings with neon colors.', icon: MentionIcon }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: '#f8fafc', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                                    <div style={{ padding: 6, background: '#fff', borderRadius: 8, boxShadow: 'var(--shadow-sm)', color: '#94a3b8' }}>
                                        <item.icon size={14} />
                                    </div>
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px', fontSize: 11 }}>{item.label}</div>
                                        <div className="text-caption">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TaggingMentions;
