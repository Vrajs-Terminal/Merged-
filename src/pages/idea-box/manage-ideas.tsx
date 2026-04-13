import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, ThumbsUp, MessageSquare, 
    XCircle, Info, Calendar, User, 
    ArrowRight, Filter, Eye, CheckCircle, 
    AlertCircle, Clock, Lightbulb, UserCheck
} from 'lucide-react';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import './idea-box.css';

interface Idea {
    id: number;
    title: string;
    description: string;
    expectedBenefit: string | null;
    status: string;
    isAnonymous: boolean;
    rewardPoints: number;
    createdAt: string;
    category: { name: string };
    user: { id: number, name: string };
    _count: { votes: number, comments: number };
}

const ManageIdeas: React.FC = () => {
    const { user } = useAuthStore();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter State
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Drawer State
    const [showDrawer, setShowDrawer] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        description: '',
        expected_benefit: '',
        is_anonymous: false
    });

    // Detail View State
    const [viewIdea, setViewIdea] = useState<Idea | null>(null);

    useEffect(() => {
        fetchIdeas();
        fetchCategories();
    }, []);

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            const res = await api.get('/idea-box/ideas');
            setIdeas(res.data);
        } catch (err) {
            setError('Failed to load ideas');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/idea-box/categories');
            setCategories(res.data.filter((c: any) => c.status === 'Active'));
        } catch (err) {
            console.error('Failed to load categories');
        }
    };

    const handleOpenDrawer = () => {
        setFormData({ title: '', category_id: '', description: '', expected_benefit: '', is_anonymous: false });
        setShowDrawer(true);
    };

    const handleCloseDrawer = () => {
        setShowDrawer(false);
        setError(null);
    };

    const handleViewIdea = (idea: Idea) => {
        setViewIdea(idea);
    };

    const handleCloseView = () => {
        setViewIdea(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!formData.title.trim() || !formData.category_id || !formData.description.trim()) {
            return setError('Please fill all required fields');
        }

        try {
            await api.post('/idea-box/ideas', {
                ...formData,
                user_id: user?.id
            });
            setSuccess('Idea submitted successfully!');
            fetchIdeas();
            handleCloseDrawer();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit idea');
        }
    };

    const handleVote = async (id: number) => {
        try {
            const res = await api.post(`/idea-box/ideas/${id}/vote`, { user_id: user?.id });
            // Optimistic Update
            setIdeas(ideas.map(i => {
                if (i.id === id) {
                    return { 
                        ...i, 
                        _count: { 
                            ...i._count, 
                            votes: res.data.voted ? i._count.votes + 1 : i._count.votes - 1 
                        } 
                    };
                }
                return i;
            }));
        } catch (err) {
            console.error('Voting failed');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'Pending': return 'ib-badge-pending';
            case 'Under Review': return 'ib-badge-review';
            case 'Approved': return 'ib-badge-approved';
            case 'Rejected': return 'ib-badge-rejected';
            case 'Implemented': return 'ib-badge-implemented';
            default: return 'ib-badge-pending';
        }
    };

    const filteredIdeas = ideas.filter(i => {
        const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || 
                              i.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || i.category.name === categoryFilter;
        const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    return (
        <div className="ib-layout">
            <div className="ib-container ib-fade-in">
                {/* Header */}
                <div className="ib-header">
                    <div className="ib-header-left">
                        <div className="ib-header-icon">
                            <Lightbulb size={32} />
                        </div>
                        <div>
                            <h2>Innovation Box</h2>
                            <p>Share your ideas and help us build the future together</p>
                        </div>
                    </div>
                    <div className="ib-header-actions">
                        <button className="ib-btn ib-btn-primary" onClick={handleOpenDrawer}>
                            <Plus size={18} />
                            Submit Idea
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="ib-table-card" style={{ marginBottom: '32px', padding: '20px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search by idea title or description..." 
                                className="ib-input"
                                style={{ paddingLeft: '48px', height: '48px' }}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="ib-field">
                                <select 
                                    className="ib-select" 
                                    style={{ height: '48px', width: '200px' }}
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="ib-field">
                                <select 
                                    className="ib-select" 
                                    style={{ height: '48px', width: '200px' }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Implemented">Implemented</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ideas Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Loading amazing ideas...</div>
                ) : filteredIdeas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                        <Lightbulb size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                        <h3 style={{ color: '#64748b' }}>No ideas found matching your criteria</h3>
                        <p style={{ color: '#94a3b8' }}>Be the first to spark innovation!</p>
                    </div>
                ) : (
                    <div className="ib-idea-grid">
                        {filteredIdeas.map(idea => (
                            <div key={idea.id} className="ib-idea-card ib-fade-in" onClick={() => handleViewIdea(idea)}>
                                <div className={`ib-idea-badge ${getStatusBadgeClass(idea.status)}`}>
                                    {idea.status}
                                </div>
                                <div className="ib-idea-cat">{idea.category.name}</div>
                                <h3 className="ib-idea-title">{idea.title}</h3>
                                <p className="ib-idea-desc">{idea.description}</p>
                                
                                <div className="ib-idea-footer">
                                    <div className="ib-user-info">
                                        <div className="ib-avatar">
                                            {idea.isAnonymous ? '?' : idea.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="ib-user-name">{idea.isAnonymous ? 'Anonymous Innovator' : idea.user.name}</div>
                                            <div className="ib-user-date">{new Date(idea.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className="ib-idea-stats">
                                        <button 
                                            className="ib-stat-item" 
                                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                            onClick={(e) => { e.stopPropagation(); handleVote(idea.id); }}
                                        >
                                            <ThumbsUp size={16} />
                                            {idea._count.votes}
                                        </button>
                                        <div className="ib-stat-item">
                                            <MessageSquare size={16} />
                                            {idea._count.comments}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submit Drawer */}
            {showDrawer && (
                <div className="ib-overlay" onClick={handleCloseDrawer}>
                    <div className="ib-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">
                                <Plus size={20} /> Submit Your Idea
                            </div>
                            <button className="ib-btn ib-btn-secondary" style={{ padding: '4px' }} onClick={handleCloseDrawer}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 140px)' }}>
                            <div className="ib-drawer-body">
                                <div className="ib-form-group">
                                    <label className="ib-label">Idea Title <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input 
                                        className="ib-input" 
                                        placeholder="Give your idea a clear, bold title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Category <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select 
                                        className="ib-select"
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Description <span style={{ color: '#ef4444' }}>*</span></label>
                                    <textarea 
                                        className="ib-textarea" 
                                        placeholder="Describe your idea in detail..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Expected Benefit</label>
                                    <input 
                                        className="ib-input" 
                                        placeholder="e.g. Saves 5 hours/week, Reduces cost by 10%"
                                        value={formData.expected_benefit}
                                        onChange={(e) => setFormData({ ...formData, expected_benefit: e.target.value })}
                                    />
                                </div>
                                <div className="ib-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input 
                                        type="checkbox" 
                                        id="is_anonymous" 
                                        checked={formData.is_anonymous}
                                        onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                                    />
                                    <label htmlFor="is_anonymous" className="ib-label" style={{ marginBottom: 0 }}>Submit Anonymously</label>
                                </div>

                                {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
                            </div>
                            <div className="ib-drawer-footer">
                                <button type="button" className="ib-btn ib-btn-secondary" onClick={handleCloseDrawer}>Cancel</button>
                                <button type="submit" className="ib-btn ib-btn-primary">Submit Innovation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Idea Drawer */}
            {viewIdea && (
                <div className="ib-overlay" onClick={handleCloseView}>
                    <div className="ib-drawer" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">
                                <Lightbulb size={20} color="#6366f1" /> Idea Details
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span className={`ib-idea-badge ${getStatusBadgeClass(viewIdea.status)}`}>
                                    {viewIdea.status}
                                </span>
                                <button className="ib-btn ib-btn-secondary" style={{ padding: '4px' }} onClick={handleCloseView}>
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="ib-drawer-body">
                            <div className="ib-idea-cat" style={{ marginBottom: '8px' }}>{viewIdea.category.name}</div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', lineHeight: 1.3 }}>{viewIdea.title}</h2>
                            
                            <div style={{ display: 'flex', gap: '32px', marginBottom: '32px' }}>
                                <div className="ib-stat-item">
                                    <User size={16} />
                                    {viewIdea.isAnonymous ? 'Anonymous' : viewIdea.user.name}
                                </div>
                                <div className="ib-stat-item">
                                    <Calendar size={16} />
                                    {new Date(viewIdea.createdAt).toLocaleDateString()}
                                </div>
                                <div className="ib-stat-item">
                                    <ThumbsUp size={16} />
                                    {viewIdea._count.votes} Upvotes
                                </div>
                            </div>

                            <div className="ib-form-group">
                                <label className="ib-label">Detailed Description</label>
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', lineHeight: 1.6, color: '#334155' }}>
                                    {viewIdea.description}
                                </div>
                            </div>

                            {viewIdea.expectedBenefit && (
                                <div className="ib-form-group">
                                    <label className="ib-label">Expected Benefit</label>
                                    <div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '12px', color: '#be185d', fontWeight: 600 }}>
                                        {viewIdea.expectedBenefit}
                                    </div>
                                </div>
                            )}

                            {viewIdea.rewardPoints > 0 && (
                                <div className="ib-form-group">
                                    <label className="ib-label">Rewards Earned</label>
                                    <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px', color: '#92400e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Lightbulb size={20} />
                                        {viewIdea.rewardPoints} Points Awarded
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ib-drawer-footer">
                            <button className="ib-btn ib-btn-secondary" onClick={handleCloseView}>Close</button>
                            <button className="ib-btn ib-btn-primary" onClick={() => handleVote(viewIdea.id)}>
                                <ThumbsUp size={18} />
                                Upvote Idea
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageIdeas;
