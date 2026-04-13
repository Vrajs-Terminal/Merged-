import React, { useState, useEffect, useCallback } from 'react';
import { 
    Users, Search, User, Filter, ArrowLeft, 
    MoreVertical, Mail, Phone, Building, Layers, 
    CheckCircle, XCircle, Clock, Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './meetings.css';

interface Participant {
    id: number;
    meeting_id: number;
    user_id: number;
    attendance_status: string;
    join_time: string | null;
    leave_time: string | null;
    user: {
        name: string;
        email: string;
        branch?: { name: string };
        department?: { name: string };
    };
}

const MeetingParticipants: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const meetingId = queryParams.get('id');

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [meetingTitle, setMeetingTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        if (!meetingId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/meetings/details/${meetingId}`);
            setParticipants(res.data.participants);
            setMeetingTitle(res.data.title);
        } catch (error) {
            toast.error('Failed to load participants');
        } finally {
            setLoading(false);
        }
    }, [meetingId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = participants.filter(p => 
        p.user.name.toLowerCase().includes(search.toLowerCase()) || 
        p.user.email.toLowerCase().includes(search.toLowerCase())
    );

    if (!meetingId) {
        return (
            <div className="meeting-layout">
                <div className="meeting-container">
                    <div className="meeting-header">
                        <div className="meeting-header-info">
                            <h2><Users size={24} /> Meeting Participants</h2>
                            <p>Select a meeting from the management list to view participants.</p>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/meetings/manage')}>
                            Go to Manage Meetings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="meeting-layout meeting-fade-in">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <button onClick={() => navigate('/meetings/manage')} className="meeting-back-btn">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </button>
                        <h2><Users size={32} strokeWidth={2.5} color="var(--meeting-primary)" /> Participants: {meetingTitle}</h2>
                        <p>Detailed list of all invited employees, department info, and attendance logs.</p>
                    </div>
                    <div className="meeting-actions">
                        <div className="search-input-wrapper" style={{ position: 'relative', minWidth: '350px' }}>
                            <Search size={20} color="var(--meeting-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input 
                                type="text" placeholder="Search by name or email..." 
                                className="form-control" style={{ paddingLeft: '48px', height: '48px' }}
                                value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="table-container glass-effect">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee / Profile</th>
                                <th>Department & Branch</th>
                                <th>Invite Status</th>
                                <th style={{ textAlign: 'center' }}>Attendance</th>
                                <th>Activity Logs</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '100px' }}>
                                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--meeting-primary)' }} />
                                        <p style={{ marginTop: '16px', color: 'var(--meeting-text-muted)', fontWeight: 600 }}>Loading participants list...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '100px', color: 'var(--meeting-text-muted)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <Users size={48} opacity={0.3} />
                                            <span style={{ fontWeight: 600, fontSize: '16px' }}>No participants found for this meeting.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p, idx) => (
                                    <tr key={p.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ 
                                                    width: '44px', height: '44px', borderRadius: '12px', 
                                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                                                    color: 'var(--meeting-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    fontWeight: 800, fontSize: '16px', border: '1px solid var(--meeting-glass-border)'
                                                }}>
                                                    {p.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, color: 'var(--meeting-text-main)', fontSize: '15px' }}>{p.user.name}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--meeting-text-muted)', fontWeight: 500 }}>{p.user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--meeting-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Layers size={14} color="var(--meeting-accent)" strokeWidth={2.5} />
                                                    {p.user.department?.name || 'General'}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--meeting-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Building size={14} strokeWidth={2} />
                                                    {p.user.branch?.name || 'Main Branch'}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 700 }}>
                                                <CheckCircle size={16} strokeWidth={2.5} /> Invited
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <span className={`status-badge status-${p.attendance_status.toLowerCase()}`} style={{ minWidth: '100px', display: 'inline-block' }}>
                                                {p.attendance_status}
                                            </span>
                                        </td>
                                        <td>
                                            {p.join_time ? (
                                                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div style={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Clock size={12} /> IN: {new Date(p.join_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {p.leave_time && (
                                                        <div style={{ color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <Clock size={12} /> OUT: {new Date(p.leave_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--meeting-text-muted)', fontStyle: 'italic' }}>No entry tracked</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="action-btn" title="More options">
                                                <MoreVertical size={18} />
                                            </button>
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

export default MeetingParticipants;
