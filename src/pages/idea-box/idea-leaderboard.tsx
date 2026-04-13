import React, { useState, useEffect } from 'react';
import { 
    Award, Trophy, TrendingUp, Lightbulb, 
    ThumbsUp, Star, User, Target, CheckCircle2, 
    Flame, Zap, Crown, Info
} from 'lucide-react';
import api from '../../lib/axios';
import './idea-box.css';

interface LeaderRank {
    id: number;
    name: string;
    approvedIdeas: number;
    totalPoints: number;
}

interface IdeaStats {
    total: number;
    approved: number;
    pending: number;
    implemented: number;
    approvalRate: number;
}

const IdeaLeaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderRank[]>([]);
    const [stats, setStats] = useState<IdeaStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        fetchStats();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/idea-box/analytics/leaderboard');
            setLeaderboard(res.data);
        } catch (err) {
            console.error('Failed to load leaderboard');
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/idea-box/analytics/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (index: number) => {
        switch (index) {
            case 0: return 'ib-rank-1'; // Gold
            case 1: return 'ib-rank-2'; // Silver
            case 2: return 'ib-rank-3'; // Bronze
            default: return '';
        }
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown size={24} color="#facc15" />;
            case 1: return <Trophy size={20} color="#cbd5e1" />;
            case 2: return <Star size={20} color="#fb923c" />;
            default: return <User size={18} color="#94a3b8" />;
        }
    };

    return (
        <div className="ib-layout">
            <div className="ib-container ib-fade-in">
                {/* Header */}
                <div className="ib-header">
                    <div className="ib-header-left">
                        <div className="ib-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                            <Trophy size={32} />
                        </div>
                        <div>
                            <h2>Innovation Leaderboard</h2>
                            <p>Celebrating the top contributors and creative minds</p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="ib-stats-grid">
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box pink">
                            <Lightbulb size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Successful Ideas</h3>
                            <div className="value">{stats?.approved || 0}</div>
                        </div>
                    </div>
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box blue">
                            <Target size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Implementation Rate</h3>
                            <div className="value">{stats?.approvalRate.toFixed(1) || 0}%</div>
                        </div>
                    </div>
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box green">
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Total Innovations</h3>
                            <div className="value">{stats?.total || 0}</div>
                        </div>
                    </div>
                    <div className="ib-stat-card">
                        <div className="ib-stat-icon-box amber">
                            <Award size={24} />
                        </div>
                        <div className="ib-stat-info">
                            <h3>Implemented</h3>
                            <div className="value">{stats?.implemented || 0}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                    
                    {/* Top Contributors List */}
                    <div className="ib-leaderboard-card">
                        <div style={{ display: 'flex', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3, lineClamp: 3, overflow: 'hidden', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Flame size={24} color="#f59e0b" /> Hall of Innovation
                            </h3>
                            <div style={{ fontSize: '13px', opacity: 0.6 }}>Updated in real-time</div>
                        </div>

                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Ranking the innovators...</div>
                        ) : leaderboard.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No rewards given yet. Spark an idea to lead!</div>
                        ) : leaderboard.map((rank, idx) => (
                            <div key={rank.id} className="ib-leader-rank">
                                <div className={`ib-rank-number ${getRankColor(idx)}`}>
                                    {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : idx + 1}
                                </div>
                                <div className="ib-stat-icon-box" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                    {getRankIcon(idx)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{rank.name}</div>
                                    <div style={{ fontSize: '13px', opacity: 0.5 }}>{rank.approvedIdeas} Approved Innovations</div>
                                </div>
                                <div className="ib-leader-score">
                                    <div className="ib-points">{rank.totalPoints} pts</div>
                                    <div style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Score</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* How it works sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="ib-table-card" style={{ padding: '24px', background: '#f8fafc', border: 'none' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex' , alignItems: 'center', gap: '8px' }}>
                                <Info size={16} /> How to Earn Points?
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', marginTop: '6px' }}></div>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                        <strong>Submit Ideas:</strong> Get your ideas approved by management.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ec4899', marginTop: '6px' }}></div>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                        <strong>Implementation:</strong> Extra points for ideas that are successfully put into action.
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '6px' }}></div>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                                        <strong>Community Love:</strong> High popularity (votes) helps ideas get faster review.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="ib-table-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white' }}>
                            <Zap size={32} style={{ marginBottom: '12px' }} />
                            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Start Innovating</h3>
                            <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.5 }}>Every big change starts with a small idea. Submit yours today!</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default IdeaLeaderboard;
