import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, XCircle, Clock, Info, 
    MoreVertical, Eye, ArrowRight, User, 
    Calendar, Layers, Filter, Search, 
    ThumbsUp, Award, CheckSquare
} from 'lucide-react';
import api from '../../lib/axios';
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
    _count: { votes: number };
}

const ApproveIdeas: React.FC = () => {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Review Modal State
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
    const [reviewData, setReviewData] = useState({
        status: '',
        remarks: '',
        reward_points: 0
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState('Pending');

    useEffect(() => {
        fetchPendingIdeas();
    }, [statusFilter]);

    const fetchPendingIdeas = async () => {
        try {
            setLoading(true);
            const endpoint = statusFilter === 'Pending' ? '/idea-box/approvals/pending' : '/idea-box/ideas';
            const res = await api.get(endpoint);
            
            if (statusFilter === 'Pending') {
                setIdeas(res.data);
            } else {
                setIdeas(res.data.filter((i: Idea) => i.status === statusFilter));
            }
        } catch (err) {
            setError('Failed to load ideas for review');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenReview = (idea: Idea) => {
        setSelectedIdea(idea);
        setReviewData({
            status: idea.status === 'Pending' ? 'Under Review' : idea.status,
            remarks: '',
            reward_points: idea.rewardPoints || 0
        });
    };

    const handleCloseReview = () => {
        setSelectedIdea(null);
        setError(null);
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!reviewData.status) return setError('Please select a status');

        try {
            await api.post(`/idea-box/approvals/${selectedIdea?.id}/review`, reviewData);
            setSuccess(`Idea ${reviewData.status} successfully`);
            fetchPendingIdeas();
            handleCloseReview();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update idea status');
        }
    };

    const handleMarkImplemented = async (id: number) => {
        try {
            await api.post(`/idea-box/approvals/${id}/implement`, { implementation_date: new Date() });
            setSuccess('Idea marked as Implemented!');
            fetchPendingIdeas();
        } catch (err) {
            alert('Failed to mark implemented');
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

    return (
        <div className="ib-layout">
            <div className="ib-container ib-fade-in">
                {/* Header */}
                <div className="ib-header">
                    <div className="ib-header-left">
                        <div className="ib-header-icon" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                            <CheckSquare size={32} />
                        </div>
                        <div>
                            <h2>Review Board</h2>
                            <p>Evaluate and reward employee innovation</p>
                        </div>
                    </div>
                </div>

                {/* Tabs / Filters */}
                <div className="ib-tabs" style={{ marginBottom: '24px' }}>
                    <button className={`ib-tab ${statusFilter === 'Pending' ? 'ib-tab-active' : ''}`} onClick={() => setStatusFilter('Pending')}>Pending Review</button>
                    <button className={`ib-tab ${statusFilter === 'Under Review' ? 'ib-tab-active' : ''}`} onClick={() => setStatusFilter('Under Review')}>Under Review</button>
                    <button className={`ib-tab ${statusFilter === 'Approved' ? 'ib-tab-active' : ''}`} onClick={() => setStatusFilter('Approved')}>Approved</button>
                    <button className={`ib-tab ${statusFilter === 'Implemented' ? 'ib-tab-active' : ''}`} onClick={() => setStatusFilter('Implemented')}>Implemented</button>
                </div>

                {/* Approvals Table */}
                <div className="ib-table-card">
                    <table className="ib-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>Sr No</th>
                                <th>Idea Title</th>
                                <th>Category</th>
                                <th>Submitted By</th>
                                <th>Votes</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading requests...</td></tr>
                            ) : ideas.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No ideas in this queue</td></tr>
                            ) : ideas.map((idea, idx) => (
                                <tr key={idea.id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{idea.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{new Date(idea.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div className="ib-idea-cat">{idea.category.name}</div>
                                    </td>
                                    <td>
                                        <div className="ib-user-info">
                                            <div className="ib-avatar">
                                                {idea.isAnonymous ? '?' : idea.user.name.charAt(0)}
                                            </div>
                                            <div className="ib-user-name">{idea.isAnonymous ? 'Anonymous' : idea.user.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="ib-stat-item">
                                            <ThumbsUp size={14} color="#f59e0b" />
                                            {idea._count.votes}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`ib-idea-badge ${getStatusBadgeClass(idea.status)}`}>
                                            {idea.status}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className="ib-btn ib-btn-secondary ib-btn-sm" onClick={() => handleOpenReview(idea)}>
                                                Review & Action
                                            </button>
                                            {idea.status === 'Approved' && (
                                                <button className="ib-btn ib-btn-primary ib-btn-sm" onClick={() => handleMarkImplemented(idea.id)}>
                                                    Mark Implemented
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Drawer */}
            {selectedIdea && (
                <div className="ib-overlay" onClick={handleCloseReview}>
                    <div className="ib-drawer" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="ib-drawer-header">
                            <div className="ib-drawer-title">Reviewing: {selectedIdea.title}</div>
                            <button className="ib-drawer-close" onClick={handleCloseReview}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="ib-drawer-body">
                                <div className="ib-form-group">
                                    <label className="ib-label">Summary of Idea</label>
                                    <p style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.5 }}>
                                        {selectedIdea.description}
                                    </p>
                                </div>
                                <div className="ib-form-group">
                                    <label className="ib-label">Expected Benefit</label>
                                    <p style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>
                                        {selectedIdea.expectedBenefit || 'No benefit specified'}
                                    </p>
                                </div>

                                <hr style={{ border: 'none', borderBottom: '1px solid #f1f5f9', margin: '24px 0' }} />

                                <div className="ib-form-group">
                                    <label className="ib-label">Action <span style={{ color: '#ef4444' }}>*</span></label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            type="button" 
                                            className={`ib-tab ${reviewData.status === 'Approved' ? 'ib-tab-active' : ''}`}
                                            onClick={() => setReviewData({ ...reviewData, status: 'Approved' })}
                                        >Approve</button>
                                        <button 
                                            type="button" 
                                            className={`ib-tab ${reviewData.status === 'Under Review' ? 'ib-tab-active' : ''}`}
                                            onClick={() => setReviewData({ ...reviewData, status: 'Under Review' })}
                                        >Under Review</button>
                                        <button 
                                            type="button" 
                                            className={`ib-tab ${reviewData.status === 'Rejected' ? 'ib-tab-active' : ''}`}
                                            onClick={() => setReviewData({ ...reviewData, status: 'Rejected' })}
                                        >Reject</button>
                                    </div>
                                </div>

                                <div className="ib-form-group">
                                    <label className="ib-label">Review Remarks / Feedback</label>
                                    <textarea 
                                        className="ib-textarea" 
                                        placeholder="Add your feedback for the employee..."
                                        value={reviewData.remarks}
                                        onChange={(e) => setReviewData({ ...reviewData, remarks: e.target.value })}
                                        required
                                    />
                                </div>

                                {reviewData.status === 'Approved' && (
                                    <div className="ib-form-group ib-fade-in">
                                        <label className="ib-label" style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Award size={16} /> Reward Points
                                        </label>
                                        <input 
                                            type="number" 
                                            className="ib-input" 
                                            placeholder="Assign innovation points (e.g. 50)"
                                            value={reviewData.reward_points}
                                            onChange={(e) => setReviewData({ ...reviewData, reward_points: Number(e.target.value) })}
                                        />
                                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Points will be added to the employee's Innovation Leaderboard rank.</p>
                                    </div>
                                )}

                                {error && <div style={{ color: '#ef4444', padding: '12px', background: '#fef2f2', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
                            </div>
                            <div className="ib-drawer-footer">
                                <button type="button" className="ib-btn ib-btn-secondary" onClick={handleCloseReview}>Cancel</button>
                                <button type="submit" className="ib-btn ib-btn-primary">Save Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveIdeas;
