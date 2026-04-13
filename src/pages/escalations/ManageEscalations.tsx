import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Eye, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    ChevronRight,
    Loader2,
    Building,
    User,
    ArrowUpRight,
    AlertCircle,
    Flag,
    CheckCircle
} from 'lucide-react';
import api from '../../lib/axios';
import AddEscalation from './AddEscalation';
import EscalationThread from './EscalationThread';
import './escalations.css';

interface Escalation {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    reply_date: string | null;
    sender: { id: number; name: string; role: string };
    receiver: { id: number; name: string; role: string } | null;
    branch: { id: number; name: string } | null;
    _count?: { replies: number };
}

const ManageEscalations: React.FC = () => {
    const [escalations, setEscalations] = useState<Escalation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);

    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchEscalations();
    }, [filterStatus]);

    const fetchEscalations = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/escalations', {
                params: { status: filterStatus }
            });
            const data = res.data;
            setEscalations(data);
            
            // Calculate Stats Local
            const total = data.length;
            const open = data.filter((e: any) => e.status === 'Open').length;
            const inProgress = data.filter((e: any) => e.status === 'In Progress').length;
            const resolved = data.filter((e: any) => e.status === 'Closed').length;
            
            setStats({ total, open, inProgress, resolved });
        } catch (err) {
            console.error('Failed to fetch escalations', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseEscalation = async (id: number) => {
        if (!window.confirm('Are you sure you want to resolve and close this escalation?')) return;
        try {
            await api.put(`/escalations/${id}/status`, { status: 'Closed' });
            fetchEscalations();
        } catch (err) {
            console.error('Failed to close escalation', err);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Open': return <span className="badge badge-open"><Clock size={12}/> Open</span>;
            case 'In Progress': return <span className="badge badge-progress"><AlertTriangle size={12}/> In Progress</span>;
            case 'Closed': return <span className="badge badge-closed"><CheckCircle2 size={12}/> Resolved</span>;
            default: return <span className="badge">{status}</span>;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return 'priority-urgent';
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            default: return 'priority-low';
        }
    };

    const filteredEscalations = escalations.filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.sender.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedEscalation) {
        return (
            <EscalationThread 
                escalationId={selectedEscalation.id} 
                onBack={() => {
                    setSelectedEscalation(null);
                    fetchEscalations();
                }} 
            />
        );
    }

    return (
        <div className="escalation-container">
            <div className="escalation-header">
                <div className="escalation-title-section">
                    <h1>Manage Escalations</h1>
                    <p>Track organizational issues and ensure timely resolution.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ borderRadius: '16px', padding: '14px 28px', fontSize: '15px' }}>
                    <Plus size={20} />
                    Raise New Escalation
                </button>
            </div>

            <div className="stats-row">
                <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <AlertCircle size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Open Escalations</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b' }}>{stats.open}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #f97316' }}>
                    <div className="stat-icon" style={{ background: '#fff7ed', color: '#f97316' }}>
                        <Clock size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>In Progress</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316' }}>{stats.inProgress}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="stat-icon" style={{ background: '#f0fdf4', color: '#10b981' }}>
                        <CheckCircle size={28} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Resolved Tasks</div>
                        <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>{stats.resolved}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px' }}>
                <div style={{ 
                    flex: 1, 
                    maxWidth: '400px', 
                    position: 'relative', 
                    background: '#fff', 
                    borderRadius: '14px', 
                    border: '1px solid #e2e8f0', 
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Search size={18} style={{ color: '#94a3b8', marginRight: '10px' }} />
                    <input 
                        type="text" 
                        placeholder="Search by title or sender..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '14px' }}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['All', 'Open', 'In Progress', 'Closed'].map(s => (
                        <button 
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '12px', 
                                fontSize: '13px', 
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: filterStatus === s ? '#3b82f6' : '#e2e8f0',
                                background: filterStatus === s ? '#3b82f6' : '#fff',
                                color: filterStatus === s ? '#fff' : '#64748b',
                                transition: 'all 0.2s'
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="escalation-table-container">
                {isLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Loader2 className="spinner" size={40} style={{ margin: '0 auto', color: '#3b82f6' }} />
                        <p style={{ marginTop: '12px', color: '#64748b' }}>Fetching escalations...</p>
                    </div>
                ) : filteredEscalations.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <AlertCircle size={48} style={{ color: '#94a3b8', margin: '0 auto 16px' }} />
                        <h3 style={{ color: '#1e293b' }}>No Escalations Found</h3>
                        <p style={{ color: '#64748b', fontSize: '14px' }}>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <table className="escalation-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Escalation Title</th>
                                <th>Raised By</th>
                                <th>Branch</th>
                                <th>Receiver</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Raised Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEscalations.map((e, idx) => (
                                <tr key={e.id}>
                                    <td style={{ fontWeight: 600, color: '#94a3b8' }}>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{e.title}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>Ref: #{e.id}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '30px', height: '30px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#3b82f6', fontWeight: 700 }}>
                                                {e.sender.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{e.sender.name}</div>
                                                <div style={{ fontSize: '11px', color: '#64748b' }}>{e.sender.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{e.branch?.name || '--'}</td>
                                    <td>{e.receiver?.name || 'Unassigned'}</td>
                                    <td>{getStatusBadge(e.status)}</td>
                                    <td>
                                        <span className={`badge ${getPriorityColor(e.priority)}`}>
                                            <Flag size={12}/> {e.priority}
                                        </span>
                                    </td>
                                    <td style={{ color: '#64748b' }}>{formatDate(e.createdAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                title="View Thread"
                                                onClick={() => setSelectedEscalation(e)}
                                                style={{ padding: '8px', borderRadius: '10px', background: '#eff6ff', color: '#3b82f6', border: 'none', cursor: 'pointer' }}
                                            >
                                                <MessageSquare size={16} />
                                            </button>
                                            {e.status !== 'Closed' && (
                                                <button 
                                                    title="Mark as Resolved"
                                                    onClick={() => handleCloseEscalation(e.id)}
                                                    style={{ padding: '8px', borderRadius: '10px', background: '#f0fdf4', color: '#10b981', border: 'none', cursor: 'pointer' }}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isAddModalOpen && (
                <AddEscalation 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchEscalations();
                    }} 
                />
            )}
        </div>
    );
};

export default ManageEscalations;
