'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PlusCircle, LayoutDashboard, BarChart2,
    Settings, Shield, MessageSquare,
    Heart, Share2, MoreVertical,
    ChevronRight, ArrowUpRight, TrendingUp, Gift, Award, Megaphone
} from 'lucide-react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './timeline-design-system.css';

const Timeline: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const isMainFeed = location.pathname === '/timeline';

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/timeline/posts');
            setPosts(res.data);
        } catch (err) {
            setPosts([
                { id: 1, type: 'Announcement', accent: '#f59e0b', content: 'Welcome to the Ultra-Premium Social Hub. High-fidelity culture starts here.', author: { name: 'HR Department', online: true }, createdAt: new Date(), likes: 24, comments: 4 },
                { id: 2, type: 'Achievement', accent: '#10b981', content: 'Engineering Team just crossed the 1M lines of code milestone for Q1! 🚀', author: { name: 'Vikram Bose', online: false }, createdAt: new Date(), likes: 82, comments: 12 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const navItems = [
        { id: 'all', label: 'Global Feed', icon: LayoutDashboard, path: '/timeline', badge: null },
        { id: 'ann', label: 'Announcements', icon: Megaphone, path: '/timeline/announcements', badge: '3' },
        { id: 'ach', label: 'Achievements', icon: Award, path: '/timeline/achievements', badge: null },
        { id: 'cel', label: 'Celebrations', icon: Gift, path: '/timeline/auto-celebration', badge: 'New' },
    ];

    const adminItems = [
        { id: 'mod', label: 'Moderator Queue', icon: Shield, path: '/timeline/manage-timeline' },
        { id: 'set', label: 'Engine Settings', icon: Settings, path: '/timeline/settings' },
    ];

    return (
        <div className="attendance-module-container">
            {/* Header */}
            <header className="attendance-header tm-fade-up-entry stagger-1">
                <div>
                    <h1 className="attendance-title">
                        <div className="tm-active-pulse" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 10, marginBottom: 2 }} />
                        Timeline Intelligence
                    </h1>
                    <p className="attendance-subtitle">Real-time organizational vitality and communication velocity.</p>
                </div>
                <div className="attendance-actions">
                    <button className="btn-secondary" onClick={() => navigate('/timeline/reports')}>
                        <TrendingUp size={16} /> Analytics
                    </button>
                    <button className="btn-primary" onClick={() => navigate('/timeline/create')}>
                        <PlusCircle size={16} /> New Entry
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: 16 }}>

                {/* --- Navigation Sidebar --- */}
                <aside className="tm-fade-up-entry stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="tm-glass-card" style={{ padding: 12 }}>
                        <div className="text-label" style={{ padding: '8px 12px', marginBottom: 4 }}>Feed Logic</div>
                        {navItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: isActive ? '#0f172a' : 'transparent',
                                        color: isActive ? '#fff' : '#64748b',
                                        marginBottom: 2,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <item.icon size={16} style={{ color: isActive ? '#818cf8' : undefined }} />
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="badge badge-indigo" style={{ fontSize: 9 }}>{item.badge}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="tm-glass-card" style={{ padding: 12 }}>
                        <div className="text-label" style={{ padding: '8px 12px', marginBottom: 4 }}>Architect Studio</div>
                        {adminItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                                    transition: 'all 0.2s', color: '#64748b', marginBottom: 2,
                                }}
                            >
                                <item.icon size={16} />
                                <span style={{ fontSize: 13, fontWeight: 700 }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* --- Dynamic Feed / Outlet --- */}
                <main className="tm-fade-up-entry stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {isMainFeed ? (
                        <>
                            {/* Composer Bar */}
                            <div className="tm-glass-card" style={{ padding: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>SA</div>
                                        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, background: '#10b981', border: '2px solid #fff', borderRadius: '50%' }} />
                                    </div>
                                    <input
                                        className="tm-input"
                                        style={{ border: 'none', boxShadow: 'none', fontWeight: 600, background: 'transparent' }}
                                        placeholder="Share a milestone or broadcast an update..."
                                        onFocus={() => navigate('/timeline/create')}
                                    />
                                    <div
                                        onClick={() => navigate('/timeline/create')}
                                        style={{ padding: 10, borderRadius: 10, background: '#eef2ff', color: '#6366f1', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    >
                                        <PlusCircle size={20} />
                                    </div>
                                </div>
                            </div>

                            {/* Posts */}
                            {loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="tm-skeleton skeleton-card" />
                                    ))}
                                </div>
                            ) : posts.map((post, idx) => (
                                <article key={post.id} className="tm-glass-card tm-fade-up-entry" style={{ padding: 0, overflow: 'hidden', animationDelay: `${(idx + 5) * 0.05}s` }}>
                                    {/* Accent Top Bar */}
                                    <div style={{ height: 3, background: post.accent || '#6366f1' }} />

                                    <div style={{ padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#6366f1', border: '1px solid #e2e8f0' }}>
                                                        {post.author.name[0]}
                                                    </div>
                                                    {post.author.online && <div className="tm-active-pulse" style={{ position: 'absolute', top: -2, right: -2, border: '2px solid #fff' }} />}
                                                </div>
                                                <div>
                                                    <h4 className="text-body" style={{ fontWeight: 700 }}>{post.author.name}</h4>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                        <span className="text-label">{post.type}</span>
                                                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                                                        <span className="text-caption">Just Now</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button style={{ padding: 6, border: 'none', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', borderRadius: 6 }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>

                                        <p className="text-body" style={{ marginBottom: 16, lineHeight: 1.6 }}>{post.content}</p>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border-light)' }}>
                                            <div style={{ display: 'flex', gap: 16 }}>
                                                <button className="tm-reaction-btn">
                                                    <Heart size={16} /> <span>{post.likes}</span>
                                                </button>
                                                <button className="tm-reaction-btn">
                                                    <MessageSquare size={16} /> <span>{post.comments}</span>
                                                </button>
                                            </div>
                                            <button className="tm-reaction-btn">
                                                <Share2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </>
                    ) : <Outlet />}
                </main>

                {/* --- Intelligence Sidebar --- */}
                <aside className="tm-fade-up-entry stagger-4" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Vitality Index */}
                    <div className="tm-glass-card tm-grad-indigo" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 className="text-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <TrendingUp size={14} /> Vitality Index
                            </h3>
                            <ArrowUpRight size={14} style={{ color: '#10b981' }} />
                        </div>
                        <div style={{ fontSize: 40, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>84%</div>
                        <p className="text-caption">Total organizational engagement flux is up +12% this week.</p>
                    </div>

                    {/* Digital Pulse */}
                    <div className="tm-glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 className="text-section-title">Digital Pulse</h3>
                            <span className="badge badge-emerald" style={{ fontSize: 9 }}>ACTIVE</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>1.2k</div>
                            <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                                <div style={{ width: '74%', height: '100%', background: '#10b981', borderRadius: 6 }} />
                            </div>
                        </div>
                        <p className="text-caption">Total active participants across 4 branch clusters.</p>
                    </div>

                    {/* Celebration Stream */}
                    <div className="tm-glass-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 className="text-section-title">Celebration Stream</h3>
                            <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { name: 'Rahul Sharma', sub: 'Birthday Today', bg: '#fff1f2', color: '#f43f5e' },
                                { name: 'Priya Singh', sub: 'Anniversary Tomorrow', bg: '#eef2ff', color: '#6366f1' }
                            ].map((c, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, background: c.bg, color: c.color }}>
                                        {c.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-body" style={{ fontWeight: 700 }}>{c.name}</div>
                                        <div className="text-label">{c.sub}</div>
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

export default Timeline;
