'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Image as ImageIcon, Video, AtSign, Sparkles, Target, Zap, Save, PlusCircle,
    ShieldCheck, Heart, MessageSquare, Share2, Globe
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import './timeline-design-system.css';

const CreatePost: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [content, setContent] = useState('');
    const [type, setType] = useState('General');
    const [audience, setAudience] = useState('All');
    const [isLoading, setIsLoading] = useState(false);

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsLoading(true);
        try {
            await axios.post('/api/timeline/posts', {
                type,
                content,
                audience_type: audience
            });
            setContent('');
            toast.success('Social entry published successfully!');
            navigate('/timeline');
        } catch (err) {
            toast.error('Failed to publish');
        } finally {
            setIsLoading(false);
        }
    };

    const userName = typeof user?.name === 'string' ? user.name.split(' ')[0] : 'Admin';

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <PlusCircle className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#6366f1' }} />
                        Content Studio
                    </h2>
                    <p className="attendance-subtitle">Draft and visualize high-impact organizational broadcasts.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--spacing-4)' }}>
                {/* --- Editor --- */}
                <div className="tm-glass-card" style={{ padding: 'var(--spacing-8)' }}>
                    <form onSubmit={handlePublish}>
                        <div className="filter-group" style={{ marginBottom: 24 }}>
                            <label><Sparkles size={12} style={{ marginRight: 4 }} /> Narrative</label>
                            <textarea
                                className="tm-textarea"
                                placeholder={`Broadcast your milestone, ${userName}...`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            <div className="filter-group">
                                <label><Target size={12} style={{ marginRight: 4 }} /> Post Type</label>
                                <select className="tm-select" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="General">General Dialogue</option>
                                    <option value="Announcement">Global Broadcast</option>
                                    <option value="Achievement">Team Milestone</option>
                                    <option value="Event">Organizational Event</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label><Globe size={12} style={{ marginRight: 4 }} /> Visibility</label>
                                <select className="tm-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                                    <option value="All">Global Organization</option>
                                    <option value="Branch">Local Clusters Only</option>
                                    <option value="Department">Functional Group Only</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--color-border-light)' }}>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="button" className="btn-secondary" style={{ padding: '10px' }}><ImageIcon size={18} /></button>
                                <button type="button" className="btn-secondary" style={{ padding: '10px' }}><Video size={18} /></button>
                                <button type="button" className="btn-secondary" style={{ padding: '10px' }}><AtSign size={18} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="button" className="btn-secondary" onClick={() => window.history.back()}>Discard</button>
                                <button type="submit" className="btn-primary" disabled={isLoading || !content.trim()}>
                                    <Save size={16} /> {isLoading ? 'Broadcasting...' : 'Launch Entry'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* --- Intelligence Sidebar --- */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                    {/* Live Preview */}
                    <div className="tm-glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--color-border-light)' }}>
                            <h3 className="text-section-title">Live Preview</h3>
                            <span className="badge badge-indigo">DRAFT</span>
                        </div>
                        <div className="tm-glass-card tm-grad-indigo" style={{ padding: 16, border: '2px dashed var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>
                                    {userName[0]}
                                </div>
                                <div>
                                    <div className="text-body" style={{ fontWeight: 700 }}>{userName}</div>
                                    <div className="text-label">{type} · JUST NOW</div>
                                </div>
                            </div>
                            <div className="text-body" style={{ minHeight: 40, color: content ? '#1e293b' : '#94a3b8' }}>
                                {content || "Draft rendering will appear here in real-time..."}
                            </div>
                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Heart size={14} style={{ color: '#cbd5e1' }} />
                                    <MessageSquare size={14} style={{ color: '#cbd5e1' }} />
                                </div>
                                <Share2 size={14} style={{ color: '#cbd5e1' }} />
                            </div>
                        </div>
                    </div>

                    {/* Content Intelligence */}
                    <div className="tm-glass-card" style={{ padding: 24 }}>
                        <h3 className="text-section-title" style={{ marginBottom: 16 }}>
                            <Zap size={14} style={{ color: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} /> Intelligence
                        </h3>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span className="text-label">Sentiment Index</span>
                                <span className="text-body" style={{ fontWeight: 700, color: '#10b981' }}>PROFESSIONAL</span>
                            </div>
                            <div style={{ width: '100%', height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                                <div style={{ width: '70%', height: '100%', background: '#6366f1' }} />
                                <div style={{ width: '10%', height: '100%', background: '#10b981' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span className="text-label">Estimated Reach</span>
                                <span className="text-body" style={{ fontWeight: 700, color: '#6366f1' }}>1.2K EMP</span>
                            </div>
                            <div style={{ width: '100%', height: 4, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                                <div style={{ width: '84%', height: '100%', background: '#10b981' }} />
                            </div>
                        </div>
                    </div>

                    {/* Audit Policy */}
                    <div className="tm-glass-card" style={{ padding: 24, background: '#0f172a', border: 'none', position: 'relative', overflow: 'hidden' }}>
                        <h3 className="text-label" style={{ color: '#818cf8', marginBottom: 8 }}>
                            <ShieldCheck size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Audit Policy
                        </h3>
                        <p className="text-caption" style={{ color: '#94a3b8' }}>Global broadcasts (All Organization) are subject to mandatory sentiment auditing and branch-lead verification.</p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CreatePost;
