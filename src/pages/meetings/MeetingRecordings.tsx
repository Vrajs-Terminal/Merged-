import React, { useState, useEffect, useCallback } from 'react';
import { 
    Video, ExternalLink, Search,
    Calendar, Clock, User,
    Loader2, Play
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './meetings.css';

interface Meeting {
    id: number;
    title: string;
    meeting_date: string;
    start_time: string;
    organizer: { name: string };
    recording_url: string | null;
}

const MeetingRecordings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/meetings/list');
            setMeetings(res.data.filter((m: any) => m.status === 'Completed' || m.status === 'Ongoing'));
        } catch (error) {
            toast.error('Failed to load meetings for recordings');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveLink = async (id: number, url: string) => {
        // In a real app, this would be a separate API or PATCH to meeting
        try {
            await api.patch(`/meetings/status/${id}`, { recording_url: url });
            toast.success('Recording link saved');
            fetchData();
        } catch (error) {
            toast.error('Failed to save link');
        }
    };

    const filtered = meetings.filter(m => 
        m.title.toLowerCase().includes(search.toLowerCase()) || 
        m.organizer.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="meeting-layout">
            <div className="meeting-container">
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <h2><Video size={30} strokeWidth={2.5} color="var(--meeting-primary)" /> Meeting Recordings</h2>
                        <p>Access archive of previous video meetings and historical discussions.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-secondary" onClick={fetchData}>Refresh</button>
                    </div>
                </div>

                <div className="table-container glass-effect">
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '16px' }}>
                        <div className="search-input-wrapper" style={{ maxWidth: '400px', flex: 1 }}>
                            <Search size={18} />
                            <input 
                                type="text" placeholder="Search by agenda or organizer..." 
                                className="search-input" value={search} onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Meeting Reference</th>
                                <th>Held On</th>
                                <th>Organizer</th>
                                <th>Recording URL / Link</th>
                                <th>Action</th>
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
                                        No recorded meetings found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((m, idx) => (
                                    <tr key={m.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.title}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} /> {new Date(m.meeting_date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                <Clock size={12} /> {m.start_time}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <User size={14} /> {m.organizer.name}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input 
                                                    type="text" className="form-control" defaultValue={m.recording_url || ''} 
                                                    placeholder="Paste cloud link (OneDrive, Google Drive, Zoom)..." 
                                                    style={{ height: '36px', fontSize: '13px', flex: 1 }}
                                                    onBlur={(e) => handleSaveLink(m.id, e.target.value)}
                                                />
                                                {m.recording_url && (
                                                    <a href={m.recording_url} target="_blank" rel="noreferrer" className="action-btn" title="Open Link">
                                                        <ExternalLink size={14} />
                                                    </a >
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-secondary" onClick={() => navigate(`/meetings/details/${m.id}`)}>
                                                <Play size={14} /> View
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

export default MeetingRecordings;
