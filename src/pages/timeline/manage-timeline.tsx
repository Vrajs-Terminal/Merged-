'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield, CheckCircle, Search, Filter, Trash2,
    ChevronRight, ChevronLeft, MoreVertical,
    Zap, RefreshCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import './timeline-design-system.css';

const ManageTimeline: React.FC = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const fetchAllPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/timeline/posts');
            setPosts(res.data);
        } catch (err) {
            setPosts([
                { id: 1, content: 'Mumbai branch grand opening ceremony!', author: { name: 'Aarav Mehta' }, createdAt: new Date(), type: 'Announcement', status: 'Approved', sentiment: 'Positive' },
                { id: 2, content: 'Incredible quarter results! Thanks team.', author: { name: 'Sania Khan' }, createdAt: new Date(), type: 'Achievement', status: 'Pending', sentiment: 'Professional' },
                { id: 3, content: 'Critical issue in the cafeteria reported.', author: { name: 'Vikram Bose' }, createdAt: new Date(), type: 'General', status: 'Approved', sentiment: 'Negative' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllPosts(); }, []);

    const toggleSelect = (id: number) => {
        setSelectedPosts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleAction = async (id: number | number[], action: string) => {
        const ids = Array.isArray(id) ? id : [id];
        try {
            if (action === 'delete') {
                if (!window.confirm('Delete these social entries permanently?')) return;
                await Promise.all(ids.map(i => axios.delete(`/api/timeline/posts/${i}`)));
                toast.success('Batch removal completed');
            } else {
                await Promise.all(ids.map(i => axios.patch(`/api/timeline/posts/${i}`, { status: action })));
                toast.success(`Marked as ${action}`);
            }
            setSelectedPosts([]);
            fetchAllPosts();
        } catch (err) {
            toast.error('Action failed');
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesFilter = filter === 'All' || post.status === filter;
        const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalPages = Math.ceil(filteredPosts.length / rowsPerPage);
    const currentRows = filteredPosts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="tm-fade-up-entry stagger-1 tm-standard-page">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title">
                        <Shield className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px", color: '#ef4444' }} />
                        Moderator Studio
                    </h2>
                    <p className="attendance-subtitle">Maintain organizational standards and social cultural integrity.</p>
                </div>
            </div>

            {/* --- Filter Bar --- */}
            <div className="attendance-filters-bar">
                <div className="filter-group" style={{ flex: 2 }}>
                    <label>Search</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Keywords, Authors, or Sentiments..."
                            className="tm-input"
                            style={{ paddingLeft: 36 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="filter-group" style={{ maxWidth: 220 }}>
                    <label><Filter size={12} style={{ marginRight: 4 }} /> Status</label>
                    <select className="tm-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="All">All Posts</option>
                        <option value="Approved">Approved</option>
                        <option value="Pending">Pending</option>
                        <option value="Hidden">Archived</option>
                    </select>
                </div>
                <div className="filter-buttons">
                    <button className="btn-secondary" onClick={() => { setSearchQuery(''); setFilter('All'); }}><RefreshCcw size={14} /></button>
                    <button className="btn-primary" onClick={fetchAllPosts}>Fetch Queue</button>
                </div>
            </div>

            {/* --- Table --- */}
            <div className="tm-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-responsive">
                    <table className="tm-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <input type="checkbox" onChange={(e) => setSelectedPosts(e.target.checked ? currentRows.map(r => r.id) : [])} />
                                </th>
                                <th>Author & Content</th>
                                <th>Sentiment</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: 60, textAlign: 'center' }}>
                                    <div className="text-caption" style={{ fontStyle: 'italic' }}>Loading moderation queue...</div>
                                </td></tr>
                            ) : currentRows.map((post, idx) => (
                                <tr key={idx} style={{ background: selectedPosts.includes(post.id) ? '#eef2ff' : undefined }}>
                                    <td>
                                        <input type="checkbox" checked={selectedPosts.includes(post.id)} onChange={() => toggleSelect(post.id)} />
                                    </td>
                                    <td style={{ maxWidth: 360 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, border: '1px solid #e0e7ff', flexShrink: 0 }}>
                                                {post.author.name[0]}
                                            </div>
                                            <div style={{ overflow: 'hidden' }}>
                                                <div className="text-body" style={{ fontWeight: 700 }}>{post.author.name}</div>
                                                <div className="text-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.content}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${post.sentiment === 'Positive' ? 'badge-emerald' : post.sentiment === 'Negative' ? 'badge-rose' : 'badge-amber'}`}>
                                            {post.sentiment}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase' }}>
                                            <Zap size={12} style={{ color: '#f59e0b' }} /> {post.type}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div className="status-dot" style={{ background: post.status === 'Approved' ? '#10b981' : '#f59e0b' }} />
                                            <span className="text-label" style={{ color: post.status === 'Approved' ? '#10b981' : '#f59e0b' }}>{post.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }} onClick={() => handleAction(post.id, 'Approved')} title="Approve"><CheckCircle size={14} style={{ color: '#10b981' }} /></button>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }} onClick={() => handleAction(post.id, 'delete')} title="Delete"><Trash2 size={14} style={{ color: '#ef4444' }} /></button>
                                            <button className="btn-secondary" style={{ padding: 6, border: 'none' }} title="More"><MoreVertical size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- Batch Bar --- */}
            {selectedPosts.length > 0 && (
                <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 20, padding: '14px 28px', background: '#0f172a', borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 50, color: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 20, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                        <Shield size={18} style={{ color: '#818cf8' }} />
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedPosts.length} selected</div>
                            <div className="text-label" style={{ color: '#64748b' }}>Batch Operations</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-primary" style={{ background: '#10b981' }} onClick={() => handleAction(selectedPosts, 'Approved')}>Approve</button>
                        <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => handleAction(selectedPosts, 'delete')}>Delete</button>
                        <button className="btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }} onClick={() => setSelectedPosts([])}>Cancel</button>
                    </div>
                </div>
            )}

            {/* --- Pagination --- */}
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="text-label">Page {currentPage} of {totalPages || 1}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-secondary" style={{ padding: 8 }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}><ChevronLeft size={14} /></button>
                    <button className="btn-secondary" style={{ padding: 8 }} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}><ChevronRight size={14} /></button>
                </div>
            </div>
        </div>
    );
};

export default ManageTimeline;
