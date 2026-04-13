import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckSquare, Search, Clock,
    Calendar, Loader2,
    CheckCircle2, AlertCircle, ExternalLink,
    ClipboardList, Activity
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './meetings.css';

interface ActionItem {
    id: number;
    meeting_id: number;
    assigned_to: number;
    description: string;
    deadline: string | null;
    status: 'Pending' | 'In Progress' | 'Completed';
    meeting: { title: string, meeting_date: string };
    assignee: { name: string };
}

const ActionItemsTracker: React.FC = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/meetings/action-items');
            setItems(res.data);
        } catch (error) {
            toast.error('Failed to load action items');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/meetings/action-item/${id}`, { status: newStatus });
            toast.success(`Task marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filtered = items.filter(i => {
        const matchesSearch =
            i.description.toLowerCase().includes(search.toLowerCase()) ||
            i.meeting.title.toLowerCase().includes(search.toLowerCase()) ||
            i.assignee.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || i.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="meeting-layout">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><CheckSquare size={30} strokeWidth={2.5} color="var(--meeting-primary)" /> Action Items Tracker</h2>
                        <p>Track accountability and completion of tasks assigned during meetings.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-secondary" onClick={fetchData}>
                            <Activity size={16} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="meeting-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '32px' }}>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                         <div className="silo-icon" style={{ background: '#f8fafc', color: '#64748b' }}><ClipboardList size={22} /></div>
                        <div>
                            <h3 style={{ fontSize: '24px' }}>{items.length}</h3>
                            <p>Total Tasks</p>
                        </div>
                    </div>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                         <div className="silo-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}><Clock size={22} /></div>
                        <div>
                            <h3 style={{ fontSize: '24px' }}>{items.filter(i => i.status === 'Pending').length}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                        <div className="silo-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><CheckCircle2 size={22} /></div>
                        <div>
                            <h3 style={{ fontSize: '24px' }}>{items.filter(i => i.status === 'Completed').length}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                        <div className="silo-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertCircle size={22} /></div>
                        <div>
                            <h3 style={{ fontSize: '24px' }}>{items.filter(i => i.deadline && new Date(i.deadline) < new Date() && i.status !== 'Completed').length}</h3>
                            <p>Overdue</p>
                        </div>
                    </div>
                </div>

                <div className="table-container glass-effect">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="search-input-wrapper" style={{ maxWidth: '500px', flex: 1 }}>
                            <Search size={18} />
                            <input 
                                type="text" placeholder="Search by task, meeting title, or assignee..." 
                                className="search-input" value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <select 
                            className="form-control" style={{ width: '200px' }}
                            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Task Description</th>
                                <th>Assigned To</th>
                                <th>Source Meeting</th>
                                <th>Deadline</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '100px' }}>
                                        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
                                        No action items found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id}>
                                        <td style={{ maxWidth: '300px' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.description}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Task ID: #TASK-{item.id.toString().padStart(4, '0')}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                                    {item.assignee.name.charAt(0)}
                                                </div>
                                                <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.assignee.name}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => navigate(`/meetings/details/${item.meeting_id}`)}>
                                                {item.meeting.title} <ExternalLink size={12} />
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                {new Date(item.meeting.meeting_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ 
                                                fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
                                                color: item.deadline && new Date(item.deadline) < new Date() && item.status !== 'Completed' ? '#dc2626' : '#64748b'
                                            }}>
                                                <Calendar size={14} /> {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No Deadline'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                {item.status !== 'Completed' ? (
                                                    <button className="btn-primary" onClick={() => handleUpdateStatus(item.id, 'Completed')}>
                                                        <CheckCircle2 size={14} style={{ color: '#16a34a' }} /> Mark Done
                                                    </button>
                                                ) : (
                                                    <button className="btn-secondary" onClick={() => handleUpdateStatus(item.id, 'Pending')}>
                                                        Re-open
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActionItemsTracker;
