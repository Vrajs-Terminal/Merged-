import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    MessageSquare, 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    MessageCircle, 
    MoreVertical, 
    Users, 
    User, 
    Building, 
    CheckCircle2, 
    XCircle,
    ArrowRight,
    Loader2,
    Calendar,
    Hash,
    TrendingUp,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import api from '../../lib/axios';
import './discussions.css';
import AddDiscussion from './AddDiscussion.tsx';
import DiscussionThread from './DiscussionThread.tsx';

interface Discussion {
    id: number;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    user: { name: string; role: string };
    _count: { comments: number };
    targetsBranch: any[];
    targetsDept: any[];
    targetsUser: any[];
}

const ManageDiscussions: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Closed'>('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}') || {};
        } catch {
            return {};
        }
    })();

    useEffect(() => {
        fetchDiscussions();
    }, []);

    useEffect(() => {
        // Check for 'add' action in URL whenever search changes
        const params = new URLSearchParams(location.search);
        if (params.get('action') === 'add') {
            setIsAddModalOpen(true);
            // Clear the param after opening to allow re-triggering from sidebar
            navigate('/discussions/manage', { replace: true });
        }
    }, [location.search, navigate]);

    const fetchDiscussions = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/discussions/manage', {
                params: {
                    userId: currentUser.id,
                    role: currentUser.role,
                    branchId: currentUser.branch_id,
                    deptId: currentUser.department_id
                }
            });
            setDiscussions(res.data);
        } catch (err) {
            console.error('Failed to fetch discussions', err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Closed' : 'Active';
            await api.put(`/discussions/manage/${id}`, { status: newStatus });
            fetchDiscussions();
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    const deleteDiscussion = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this discussion?')) return;
        try {
            await api.delete(`/discussions/manage/${id}`);
            fetchDiscussions();
        } catch (err) {
            console.error('Failed to delete discussion', err);
        }
    };

    const filteredDiscussions = discussions.filter(d => {
        const matchesSearch = (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (d.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'All' || d.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: discussions.length,
        active: discussions.filter(d => d.status === 'Active').length,
        closed: discussions.filter(d => d.status === 'Closed').length
    };

    if (selectedDiscussion) {
        return (
            <DiscussionThread 
                discussion={selectedDiscussion} 
                onBack={() => {
                    setSelectedDiscussion(null);
                    fetchDiscussions();
                }} 
            />
        );
    }

    return (
        <div className="discussion-container">
            <div className="discussion-header">
                <div className="discussion-title-section">
                    <h1>Community Forum</h1>
                    <p>Connect, share, and solve problems together.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ borderRadius: '16px', padding: '14px 28px', fontSize: '15px', fontWeight: 600 }}>
                    <Plus size={20} />
                    Create New Topic
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="stats-row">
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Total Discussions</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Active Conversations</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{stats.active}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #94a3b8' }}>
                    <div className="stat-icon" style={{ background: '#f8fafc', color: '#64748b' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Closed Topics</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#475569' }}>{stats.closed}</div>
                    </div>
                </div>
            </div>

            {/* Tool Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '20px' }}>
                <div style={{ 
                    flex: 1, 
                    maxWidth: '460px', 
                    position: 'relative', 
                    background: '#fff', 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0',
                    padding: '4px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                }}>
                    <Search size={18} style={{ color: '#94a3b8', marginRight: '10px' }} />
                    <input 
                        type="text" 
                        placeholder="Search topics, author, or keywords..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '100%', height: '40px', outline: 'none', fontSize: '15px' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '14px' }}>
                    {(['All', 'Active', 'Closed'] as const).map((s) => (
                        <button 
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '10px', 
                                fontSize: '13px', 
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: filterStatus === s ? '#fff' : 'transparent',
                                color: filterStatus === s ? '#3b82f6' : '#64748b',
                                boxShadow: filterStatus === s ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div style={{ padding: '100px', textAlign: 'center' }}>
                    <Loader2 className="spinner" size={48} style={{ margin: '0 auto', color: '#3b82f6' }} />
                    <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Initializing Forum Experience...</p>
                </div>
            ) : filteredDiscussions.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', borderRadius: '32px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                        <AlertCircle size={40} style={{ color: '#94a3b8' }} />
                    </div>
                    <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>No Conversations Yet</h2>
                    <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 24px' }}>
                        No topics have been posted yet. Check back later or ask an administrator to start a discussion.
                    </p>
                </div>
            ) : (
                <div className="topics-grid">
                    {filteredDiscussions.map((topic) => (
                        <div key={topic.id} className="topic-card" onClick={() => setSelectedDiscussion(topic)}>
                            <div className={`topic-status-badge ${topic.status === 'Active' ? 'status-active' : 'status-closed'}`}>
                                {topic.status}
                            </div>
                            
                            <div className="topic-category">
                                {topic.targetsBranch.length > 0 || topic.targetsDept.length > 0 || topic.targetsUser.length > 0 ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6' }}>
                                        <Users size={13} /> Targeted Group
                                    </span>
                                ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
                                        <Hash size={13} /> Organization Wide
                                    </span>
                                )}
                            </div>

                            <h3 className="topic-title">{topic.title}</h3>
                            <p className="topic-desc">{topic.description || "No description provided."}</p>

                            <div className="topic-footer">
                                <div className="user-tag">
                                    <div className="user-avatar-sm" style={{ background: topic.user.role === 'Admin' ? '#3b82f6' : '#64748b' }}>
                                        {topic.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{topic.user.name}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(topic.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                                        <MessageCircle size={14} />
                                        {topic._count.comments}
                                    </div>
                                    {currentUser.role === 'Admin' && (
                                        <div className="action-menu" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '8px' }}>
                                            <button className="icon-btn" onClick={() => toggleStatus(topic.id, topic.status)} title="Toggle Status">
                                                {topic.status === 'Active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                            </button>
                                            <button className="icon-btn" onClick={() => deleteDiscussion(topic.id)} style={{ color: '#ef4444' }} title="Delete">
                                                <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isAddModalOpen && (
                <AddDiscussion 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchDiscussions();
                    }} 
                />
            )}
        </div>
    );
};

export default ManageDiscussions;
