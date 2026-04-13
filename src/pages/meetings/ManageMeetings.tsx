import React, { useState, useEffect, useCallback } from 'react';
import { 
    Calendar, Plus, Search, Filter, Download, MoreVertical, 
    Video, MapPin, Clock, Users, CheckCircle2, XCircle, 
    AlertCircle, Loader2, ArrowRight, ClipboardList, 
    FileText, CheckSquare, Bell, BarChart3, Settings, 
    VideoIcon
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import './meetings.css';

interface Meeting {
    id: number;
    title: string;
    description: string | null;
    meeting_type: 'Online' | 'Offline';
    meeting_date: string;
    start_time: string;
    end_time: string;
    location: string | null;
    meeting_link: string | null;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
    organizer: { name: string };
    _count: { participants: number };
}

const ManageMeetings: React.FC = () => {
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/meetings/list');
            setMeetings(res.data);
        } catch (error) {
            console.error('Failed to load meetings', error);
            toast.error('Failed to load meetings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (id: number, newStatus: string) => {
        try {
            await api.patch(`/meetings/status/${id}`, { status: newStatus });
            toast.success(`Meeting marked as ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filtered = meetings.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                             (m.description?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = !statusFilter || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const subModules = [
        { name: "Schedule", icon: Plus, path: "/meetings/schedule", desc: "Create new meeting" },
        { name: "Participants", icon: Users, path: "/meetings/participants", desc: "Manage attendees" },
        { name: "Attendance", icon: CheckCircle2, path: "/meetings/attendance", desc: "Track participation" },
        { name: "MOM", icon: FileText, path: "/meetings/mom", desc: "Meeting minutes" },
        { name: "Action Items", icon: CheckSquare, path: "/meetings/action-items", desc: "Task tracker" },
        { name: "Reports", icon: BarChart3, path: "/meetings/reports", desc: "Analytics" },
    ];

    return (
        <div className="meeting-layout meeting-fade-in">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><Calendar size={32} strokeWidth={2.5} color="#3b82f6" /> Meeting Management</h2>
                        <p>Schedule, track, and manage all organizational meetings.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-primary glow-btn" onClick={() => navigate('/meetings/schedule')}>
                            <Plus size={20} strokeWidth={2.5} /> Schedule Meeting
                        </button>
                    </div>
                </div>

                {/* Sub-module Quick Links */}
                <div className="meeting-grid">
                    {subModules.map((silo, idx) => (
                        <Link key={idx} to={silo.path} className="silo-card glass-effect">
                            <div className="silo-icon"><silo.icon size={24} strokeWidth={2} /></div>
                            <div>
                                <h3>{silo.name}</h3>
                                <p>{silo.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Main Meetings Table */}
                <div className="table-container glass-effect" style={{ marginTop: '40px' }}>
                    <div style={{ padding: '32px', borderBottom: '1px solid var(--meeting-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                            <div className="search-input-wrapper" style={{ maxWidth: '450px', flex: 1, position: 'relative' }}>
                                <Search size={20} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search meetings by title or agenda..." 
                                    className="form-control"
                                    style={{ paddingLeft: '48px', height: '48px' }}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <select 
                                className="form-control" 
                                style={{ width: '200px', height: '48px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <button className="btn-secondary" onClick={fetchData}>
                            Refresh
                        </button>
                    </div>

                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Meeting Details</th>
                                <th>Date & Time</th>
                                <th>Organizer / Team</th>
                                <th>Type & Location</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '100px' }}>
                                        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                            <Calendar size={48} opacity={0.2} />
                                            <span>No meetings found. Click "Schedule Meeting" to create one.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m, idx) => (
                                    <tr key={m.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>{m.title}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                                {m.priority && (
                                                    <span className={`priority-badge priority-${m.priority.toLowerCase()}`}>
                                                        <AlertCircle size={12} /> {m.priority} Priority
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                                <Calendar size={14} color="#3b82f6" />
                                                {new Date(m.meeting_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                                <Clock size={12} /> {m.start_time} - {m.end_time}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{m.organizer.name}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                <Users size={12} /> {m._count.participants} Participants
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {m.meeting_type === 'Online' ? (
                                                    <><Video size={16} color="#0ea5e9" /> <span style={{ fontSize: '13px', color: '#0369a1' }}>Online</span></>
                                                ) : (
                                                    <><MapPin size={16} color="#f43f5e" /> <span style={{ fontSize: '13px', color: '#be123c' }}>Offline</span></>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {m.meeting_type === 'Online' ? m.meeting_link : m.location || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${m.status.toLowerCase()}`}>
                                                {m.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                {m.status === 'Scheduled' && (
                                                    <button className="action-btn" onClick={() => handleStatusUpdate(m.id, 'Ongoing')} title="Start Meeting">
                                                        <VideoIcon size={14} /> Start
                                                    </button>
                                                )}
                                                {m.status === 'Ongoing' && (
                                                    <button className="action-btn" onClick={() => navigate(`/meetings/mom?id=${m.id}`)} title="Complete & Add MOM">
                                                        <CheckCircle2 size={14} /> Finish
                                                    </button>
                                                )}
                                                <button className="action-btn" onClick={() => navigate(`/meetings/details/${m.id}`)} title="View Details">
                                                    <MoreVertical size={14} />
                                                </button>
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

export default ManageMeetings;
