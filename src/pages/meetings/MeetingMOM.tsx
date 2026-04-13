import React, { useState, useEffect, useCallback } from 'react';
import { 
    FileText, Save, Plus, Trash2, ArrowLeft, 
    CheckCircle2, Clock, User, Calendar, 
    Loader2, ClipboardList, Target, AlertCircle
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import './meetings.css';

interface ActionItem {
    assigned_to: string;
    description: string;
    deadline: string;
}

const MeetingMOM: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const meetingId = queryParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [meeting, setMeeting] = useState<any>(null);

    // Form State
    const [discussionPoints, setDiscussionPoints] = useState('');
    const [decisions, setDecisions] = useState('');
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);

    const fetchData = useCallback(async () => {
        if (!meetingId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [meetingRes, empRes] = await Promise.all([
                api.get(`/meetings/details/${meetingId}`),
                api.get('/auth/users')
            ]);
            setMeeting(meetingRes.data);
            setEmployees(empRes.data);
            
            if (meetingRes.data.mom) {
                setDiscussionPoints(meetingRes.data.mom.discussion_points || '');
                setDecisions(meetingRes.data.mom.decisions || '');
            }
        } catch (error) {
            toast.error('Failed to load meeting details');
        } finally {
            setLoading(false);
        }
    }, [meetingId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addActionItem = () => {
        setActionItems([...actionItems, { assigned_to: '', description: '', deadline: '' }]);
    };

    const removeActionItem = (index: number) => {
        setActionItems(actionItems.filter((_, i) => i !== index));
    };

    const handleActionItemChange = (index: number, field: keyof ActionItem, value: string) => {
        const updated = [...actionItems];
        updated[index][field] = value;
        setActionItems(updated);
    };

    const handleSubmit = async () => {
        if (!discussionPoints) {
            toast.error('Please enter discussion points');
            return;
        }

        setSaving(true);
        try {
            await api.post('/meetings/mom', {
                meeting_id: meetingId,
                discussion_points: discussionPoints,
                decisions: decisions,
                action_items: actionItems
            });
            toast.success('MOM saved successfully');
            navigate('/meetings/manage');
        } catch (error) {
            toast.error('Failed to save MOM');
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
                            <h2><FileText size={24} /> Minutes of Meeting (MOM)</h2>
                            <p>Select a meeting to record discussions and decisions.</p>
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
                        <h2><FileText size={32} strokeWidth={2.5} color="var(--meeting-primary)" /> Minutes of Meeting (MOM)</h2>
                        <p>Document the official outcomes, decisions, and future action items for <strong>{meeting?.title}</strong>.</p>
                    </div>
                    <div className="meeting-actions">
                        <button className="btn-primary glow-btn" onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                            {saving ? 'Saving MOM...' : 'Finalize & Save MOM'}
                        </button>
                    </div>
                </div>

                <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: '32px' }}>
                    {/* Discussion Points */}
                    <div className="table-container glass-effect" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div className="silo-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--meeting-primary)' }}>
                                <ClipboardList size={24} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--meeting-text-main)' }}>Key Discussion Points</h3>
                        </div>
                        <textarea 
                            className="form-control" rows={8} 
                            placeholder="Write down the detailed points discussed during the meeting..." 
                            style={{ fontSize: '15px', lineHeight: '1.7', background: 'rgba(255, 255, 255, 0.5)' }}
                            value={discussionPoints} onChange={(e) => setDiscussionPoints(e.target.value)}
                        />
                    </div>

                    {/* Decisions Made */}
                    <div className="table-container glass-effect" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div className="silo-icon" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                                <CheckCircle2 size={24} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--meeting-text-main)' }}>Decisions & Final Outcomes</h3>
                        </div>
                        <textarea 
                            className="form-control" rows={4} 
                            placeholder="State the final decisions and agreements reached..." 
                            style={{ fontSize: '15px', lineHeight: '1.7', background: 'rgba(22, 163, 74, 0.02)', borderColor: 'rgba(22, 163, 74, 0.2)' }}
                            value={decisions} onChange={(e) => setDecisions(e.target.value)}
                        />
                    </div>

                    {/* Action Items */}
                    <div className="table-container glass-effect" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="silo-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                                    <Target size={24} strokeWidth={2.5} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--meeting-text-main)' }}>Action Items & Task Assignments</h3>
                            </div>
                            <button className="btn-secondary" onClick={addActionItem}>
                                <Plus size={18} strokeWidth={2.5} /> Add Task
                            </button>
                        </div>

                        {actionItems.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', border: '2px dashed var(--meeting-border)', borderRadius: '20px', background: 'rgba(248, 250, 252, 0.5)' }}>
                                <AlertCircle size={48} color="var(--meeting-text-muted)" opacity={0.3} style={{ margin: '0 auto 16px' }} />
                                <p style={{ color: 'var(--meeting-text-muted)', fontSize: '15px', fontWeight: 600 }}>No specific action items recorded yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {actionItems.map((item, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'grid', gridTemplateColumns: '220px 1fr 200px 56px', gap: '20px', 
                                        padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid var(--meeting-border)', 
                                        alignItems: 'end', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', animation: 'slideInRight 0.3s ease-out'
                                    }}>
                                        <div>
                                            <label className="form-label">Assignee</label>
                                            <select 
                                                className="form-control" value={item.assigned_to} 
                                                onChange={(e) => handleActionItemChange(idx, 'assigned_to', e.target.value)}
                                            >
                                                <option value="">Select Employee</option>
                                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Task Description</label>
                                            <input 
                                                type="text" className="form-control" placeholder="What needs to be done?" 
                                                value={item.description} onChange={(e) => handleActionItemChange(idx, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Complete By</label>
                                            <input 
                                                type="date" className="form-control" 
                                                value={item.deadline} onChange={(e) => handleActionItemChange(idx, 'deadline', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            className="action-btn delete btn-square"
                                            onClick={() => removeActionItem(idx)}
                                            title="Remove Task"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingMOM;
