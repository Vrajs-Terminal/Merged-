import React, { useState, useEffect, useCallback } from 'react';
import { 
    Calendar, Clock, User, Users, MapPin, Video, 
    FileText, CheckSquare, Target, ArrowLeft, 
    Loader2, Download, ExternalLink, AlertCircle,
    CheckCircle2, XCircle, MoreVertical, Paperclip,
    Bell, Mail, MessageSquare
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './meetings.css';

interface MeetingDetailsData {
    id: number;
    title: string;
    description: string | null;
    meeting_type: 'Online' | 'Offline';
    meeting_date: string;
    start_time: string;
    end_time: string;
    location: string | null;
    meeting_link: string | null;
    status: 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
    priority: 'Low' | 'Medium' | 'High';
    organizer: { name: string };
    participants: Array<{
        id: number;
        user_id: number;
        attendance_status: string;
        user: { name: string, email: string };
    }>;
    mom: {
        discussion_points: string;
        decisions: string;
    } | null;
    actionItems: Array<{
        id: number;
        description: string;
        status: string;
        deadline: string | null;
        assignee: { name: string };
    }>;
    attachments: Array<{
        id: number;
        name: string;
        file_url: string;
        file_type: string;
    }>;
}

const MeetingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState<MeetingDetailsData | null>(null);

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`/meetings/details/${id}`);
            setMeeting(res.data);
        } catch (error) {
            toast.error('Failed to load meeting details');
            navigate('/meetings/manage');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="meeting-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" color="#3b82f6" />
            </div>
        );
    }

    if (!meeting) return null;

    return (
        <div className="meeting-layout meeting-fade-in">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <button onClick={() => navigate('/meetings/manage')} className="meeting-back-btn">
                            <ArrowLeft size={18} /> Back to Dashboard
                        </button>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em' }}>{meeting.title}</h2>
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                            <span className={`status-badge status-${meeting.status.toLowerCase()}`}>{meeting.status}</span>
                            <span className={`priority-badge priority-${meeting.priority.toLowerCase()}`} style={{ fontSize: '13px', fontWeight: 600 }}><AlertCircle size={16} /> {meeting.priority} Priority</span>
                        </div>
                    </div>
                    <div className="meeting-actions">
                        {meeting.status === 'Scheduled' && (
                            <button className="btn-primary glow-btn" onClick={() => navigate(`/meetings/attendance?id=${meeting.id}`)}>
                                <Users size={18} strokeWidth={2.5} /> Mark Attendance
                            </button>
                        )}
                        {(meeting.status === 'Ongoing' || meeting.status === 'Completed') && (
                            <button className="btn-primary glow-btn" onClick={() => navigate(`/meetings/mom?id=${meeting.id}`)}>
                                <FileText size={18} strokeWidth={2.5} /> Manage MOM
                            </button>
                        )}
                        <button className="action-btn" title="More options">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Left Column: Information & MOM */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Main Info Card */}
                        <div className="table-container glass-effect" style={{ padding: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0' }}>Meeting Overview</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>ORGANIZER</label>
                                    <div style={{ fontWeight: 500 }}>{meeting.organizer.name}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>DATE & TIME</label>
                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={14} /> {new Date(meeting.meeting_date).toLocaleDateString()}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Clock size={14} /> {meeting.start_time} - {meeting.end_time}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>TYPE & LOCATION</label>
                                    <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {meeting.meeting_type === 'Online' ? <Video size={14} /> : <MapPin size={14} />}
                                        {meeting.meeting_type}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#3b82f6', marginTop: '4px' }}>
                                        {meeting.meeting_type === 'Online' ? (
                                            <a href={meeting.meeting_link || '#'} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Join Meeting <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <span>{meeting.location || 'Meeting Room'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>AGENDA / DESCRIPTION</label>
                                <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#334155' }}>
                                    {meeting.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>

                        {/* MOM Section */}
                        {meeting.mom && (
                            <div className="table-container glass-effect" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                    <div className="silo-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><FileText size={22} /></div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Minutes of Meeting (MOM)</h3>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '12px' }}>DISCUSSION POINTS</label>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        {meeting.mom.discussion_points}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '12px' }}>DECISIONS</label>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                        {meeting.mom.decisions}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Items */}
                        {meeting.actionItems && meeting.actionItems.length > 0 && (
                            <div className="table-container glass-effect" style={{ padding: '32px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div className="silo-icon" style={{ background: '#fef2f2', color: '#dc2626', width: '36px', height: '36px' }}><Target size={18} /></div>
                                    Action Items
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {meeting.actionItems.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.description}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'flex', gap: '12px' }}>
                                                    <span>Assigned to: <strong>{item.assignee.name}</strong></span>
                                                    {item.deadline && <span>Deadline: {new Date(item.deadline).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Participants & Attachments */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Participants Stats */}
                        <div className="table-container glass-effect" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Users size={18} color="#3b82f6" /> Attendance Stats
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span>Total Participants</span>
                                    <span style={{ fontWeight: 700 }}>{meeting.participants.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#16a34a' }}>
                                    <span>Present</span>
                                    <span style={{ fontWeight: 700 }}>{meeting.participants.filter(p => p.attendance_status === 'Present').length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626' }}>
                                    <span>Absent</span>
                                    <span style={{ fontWeight: 700 }}>{meeting.participants.filter(p => p.attendance_status === 'Absent').length}</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                                    <div style={{ 
                                        height: '100%', 
                                        width: `${(meeting.participants.filter(p => p.attendance_status === 'Present').length / meeting.participants.length) * 100}%`, 
                                        background: '#16a34a' 
                                    }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Participant List */}
                        <div className="table-container glass-effect" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0' }}>Invited Team</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                                {meeting.participants.map(p => (
                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                                            {p.user.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.user.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{p.attendance_status}</div>
                                        </div>
                                        {p.attendance_status === 'Present' ? <CheckCircle2 size={14} color="#16a34a" /> : p.attendance_status === 'Absent' ? <XCircle size={14} color="#dc2626" /> : null}
                                    </div>
                                ))}
                            </div>
                            <button className="action-btn btn-full" onClick={() => navigate(`/meetings/participants?id=${meeting.id}`)}>
                                View Full List
                            </button>
                        </div>

                        {/* Attachments Section */}
                        <div className="table-container glass-effect" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Paperclip size={18} color="#3b82f6" /> Attachments
                            </h3>
                            {meeting.attachments && meeting.attachments.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {meeting.attachments.map(att => (
                                        <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                            <FileText size={16} color="#64748b" />
                                            <div style={{ flex: 1, fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.name}</div>
                                            <a href={att.file_url} target="_blank" rel="noreferrer" title="Download">
                                                <Download size={14} color="#3b82f6" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '16px' }}>
                                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>No attachments found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingDetails;
