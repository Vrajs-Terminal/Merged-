import React, { useState, useEffect, useCallback } from 'react';
// Refreshing module index
import { 
    CheckCircle2, XCircle, Clock, Calendar, 
    Search, User, ArrowLeft, Loader2, Save, 
    Video, MapPin, Users
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './meetings.css';

interface Participant {
    id: number;
    meeting_id: number;
    user_id: number;
    attendance_status: 'Present' | 'Absent' | 'Late' | 'Pending';
    join_time: string | null;
    leave_time: string | null;
    user: {
        name: string;
        email: string;
    };
}

const MeetingAttendance: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const meetingId = queryParams.get('id');

    const [participants, setParticipants] = useState<Participant[]>([]);
    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        if (!meetingId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/meetings/details/${meetingId}`);
            setMeeting(res.data);
            setParticipants(res.data.participants);
        } catch (error) {
            toast.error('Failed to load meeting attendance');
        } finally {
            setLoading(false);
        }
    }, [meetingId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAttendanceChange = (userId: number, status: Participant['attendance_status']) => {
        setParticipants(prev => prev.map(p => 
            p.user_id === userId ? { ...p, attendance_status: status } : p
        ));
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            // Save each participant's attendance
            await Promise.all(participants.map(p => 
                api.post(`/meetings/mark-attendance/${meetingId}/${p.user_id}`, {
                    status: p.attendance_status
                })
            ));
            toast.success('Attendance saved successfully');
            navigate(`/meetings/manage`);
        } catch (error) {
            toast.error('Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    if (!meetingId) {
        return (
            <div className="meeting-layout">
                <div className="meeting-container">
                    <div className="meeting-header">
                        <div className="meeting-header-info">
                            <h2><CheckCircle2 size={24} /> Meeting Attendance</h2>
                            <p>Select an ongoing or completed meeting to mark attendance.</p>
                        </div>
                        <button className="btn-primary" onClick={() => navigate('/meetings/manage')}>
                            View Meetings List
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
                        <h2><CheckCircle2 size={32} strokeWidth={2.5} color="var(--meeting-primary)" /> Mark Attendance: {meeting?.title}</h2>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {new Date(meeting?.meeting_date).toLocaleDateString()}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {meeting?.start_time} - {meeting?.end_time}</span>
                        </p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-primary glow-btn" onClick={saveAttendance} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                            {saving ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </div>

                <div className="meeting-grid" style={{ marginBottom: '40px' }}>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                        <div className="silo-icon"><Users size={24} strokeWidth={2} /></div>
                        <div>
                            <h3 style={{ fontSize: '28px', fontWeight: 800 }}>{participants.length}</h3>
                            <p style={{ fontWeight: 600 }}>Total Invited</p>
                        </div>
                    </div>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                        <div className="silo-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}><CheckCircle2 size={24} strokeWidth={2} /></div>
                        <div>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a' }}>{participants.filter(p => p.attendance_status === 'Present').length}</h3>
                            <p style={{ fontWeight: 600 }}>Present</p>
                        </div>
                    </div>
                    <div className="silo-card glass-effect" style={{ cursor: 'default' }}>
                        <div className="silo-icon" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}><XCircle size={24} strokeWidth={2} /></div>
                        <div>
                            <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>{participants.filter(p => p.attendance_status === 'Absent').length}</h3>
                            <p style={{ fontWeight: 600 }}>Absent</p>
                        </div>
                    </div>
                </div>

                <div className="table-container glass-effect">
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Participant Name</th>
                                <th>Email Address</th>
                                <th style={{ textAlign: 'center' }}>Mark Status</th>
                                <th style={{ textAlign: 'right' }}>Current Logic</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '100px' }}>
                                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto', color: 'var(--meeting-primary)' }} />
                                        <p style={{ marginTop: '16px', color: 'var(--meeting-text-muted)', fontWeight: 600 }}>Fetching attendees...</p>
                                    </td>
                                </tr>
                            ) : participants.map((p, idx) => (
                                <tr key={p.id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--meeting-text-main)', fontSize: '15px' }}>{p.user.name}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '14px', color: 'var(--meeting-text-muted)', fontWeight: 500 }}>{p.user.email}</div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="attendance-switch">
                                            <button 
                                                onClick={() => handleAttendanceChange(p.user_id, 'Present')}
                                                className={`attendance-choice ${p.attendance_status === 'Present' ? 'active present' : ''}`}
                                            >
                                                Present
                                            </button>
                                            <button 
                                                onClick={() => handleAttendanceChange(p.user_id, 'Absent')}
                                                className={`attendance-choice ${p.attendance_status === 'Absent' ? 'active absent' : ''}`}
                                            >
                                                Absent
                                            </button>
                                            <button 
                                                onClick={() => handleAttendanceChange(p.user_id, 'Late')}
                                                className={`attendance-choice ${p.attendance_status === 'Late' ? 'active late' : ''}`}
                                            >
                                                Late
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span className={`status-badge status-${p.attendance_status.toLowerCase()}`} style={{ minWidth: '80px', textAlign: 'center' }}>
                                            {p.attendance_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MeetingAttendance;
