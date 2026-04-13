import React, { useState, useEffect } from 'react';
import { 
    Calendar, Clock, User, Users, MapPin, Video, 
    FileText, AlertCircle, Save, X, Plus, Trash2, 
    ChevronRight, ChevronLeft, Check, Loader2,
    Briefcase, Building, Layers
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './meetings.css';

interface Employee {
    id: number;
    name: string;
    email: string;
    department?: { name: string };
    branch?: { name: string };
}

const ScheduleMeeting: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        meeting_type: 'Offline' as 'Online' | 'Offline',
        meeting_date: '',
        start_time: '',
        end_time: '',
        organizer_id: '',
        location: '',
        meeting_link: '',
        priority: 'Medium',
        reminder_before: '30',
        participants: [] as number[],
        attachments: [] as { name: string, file_url: string, file_type: string }[]
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get('/auth/users');
                setEmployees(res.data);
            } catch (error) {
                toast.error('Failed to load employees for selection');
            }
        };
        fetchEmployees();
        
        // Auto-set organizer to current user if available
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setFormData(prev => ({ ...prev, organizer_id: user.id.toString() }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleParticipantToggle = (id: number) => {
        setFormData(prev => {
            const current = [...prev.participants];
            const idx = current.indexOf(id);
            if (idx > -1) current.splice(idx, 1);
            else current.push(id);
            return { ...prev, participants: current };
        });
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.meeting_date || !formData.start_time || !formData.end_time) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.participants.length === 0) {
            toast.error('Please select at least one participant');
            return;
        }

        setLoading(true);
        try {
            await api.post('/meetings/schedule', formData);
            toast.success('Meeting scheduled successfully!');
            navigate('/meetings/manage');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="meeting-layout meeting-fade-in">
            <div className="meeting-container" style={{ maxWidth: '1000px' }}>
                <div className="meeting-header">
                    <div className="meeting-header-info">
                        <button onClick={() => navigate('/meetings/manage')} className="meeting-back-btn">
                            <ChevronLeft size={18} /> Back to Dashboard
                        </button>
                        <h2><Plus size={32} strokeWidth={2.5} color="var(--meeting-primary)" /> New Meeting Schedule</h2>
                        <p>Fill in the details to schedule a professional meeting with automated notifications.</p>
                    </div>
                </div>

                <div className="table-container glass-effect meeting-panel" style={{ padding: '40px' }}>
                    {/* Stepper Header */}
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', background: 'rgba(241, 245, 249, 0.5)', padding: '24px', borderRadius: '16px', border: '1px solid var(--meeting-border)' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: step === s ? 1 : 0.5, flex: 1 }}>
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '10px', background: step >= s ? 'var(--meeting-primary)' : 'var(--meeting-border)', 
                                    color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                    boxShadow: step === s ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {step > s ? <Check size={18} strokeWidth={3} /> : s}
                                </div>
                                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700, fontSize: '14px', color: step === s ? 'var(--meeting-text-main)' : 'var(--meeting-text-muted)' }}>
                                        {s === 1 ? 'Core Details' : s === 2 ? 'Attendees' : 'Finalize'}
                                    </span>
                                    {s < 3 && <ChevronRight size={18} color="#94a3b8" style={{ marginLeft: '12px' }} />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Core Details */}
                    {step === 1 && (
                        <div className="form-grid">
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Meeting Title *</label>
                                <input 
                                    type="text" name="title" className="form-control" 
                                    placeholder="e.g. Weekly Sync, Technical Review, Budget Planning"
                                    value={formData.title} onChange={handleChange} 
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label className="form-label">Agenda / Description</label>
                                <textarea 
                                    name="description" className="form-control" rows={4}
                                    placeholder="What is this meeting about?"
                                    value={formData.description} onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Meeting Type</label>
                                <select name="meeting_type" className="form-control" value={formData.meeting_type} onChange={handleChange}>
                                    <option value="Offline">Offline (In-Person)</option>
                                    <option value="Online">Online (Video Call)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Priority</label>
                                <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Meeting Date *</label>
                                <input 
                                    type="date" name="meeting_date" className="form-control" 
                                    value={formData.meeting_date} onChange={handleChange}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label className="form-label">Start Time *</label>
                                    <input type="time" name="start_time" className="form-control" value={formData.start_time} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="form-label">End Time *</label>
                                    <input type="time" name="end_time" className="form-control" value={formData.end_time} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                {formData.meeting_type === 'Offline' ? (
                                    <>
                                        <label className="form-label">Location (Meeting Room / Branch)</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                            <input 
                                                type="text" name="location" className="form-control" style={{ paddingLeft: '40px' }}
                                                placeholder="e.g. Conference Room A, Main Office"
                                                value={formData.location} onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label className="form-label">Meeting Link (Zoom / G-Meet)</label>
                                        <div style={{ position: 'relative' }}>
                                            <Video size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
                                            <input 
                                                type="text" name="meeting_link" className="form-control" style={{ paddingLeft: '40px' }}
                                                placeholder="e.g. https://meet.google.com/abc-defg-hij"
                                                value={formData.meeting_link} onChange={handleChange}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Participants */}
                    {step === 2 && (
                        <div className="participant-selector">
                             <div className="form-group">
                                <label className="form-label">Select Participants ({formData.participants.length} selected)</label>
                                <div style={{ 
                                    marginTop: '8px', border: '1px solid #e2e8f0', borderRadius: '12px', 
                                    maxHeight: '400px', overflowY: 'auto', background: '#f8fafc' 
                                }}>
                                    {employees.map(emp => (
                                        <div 
                                            key={emp.id} 
                                            onClick={() => handleParticipantToggle(emp.id)}
                                            style={{ 
                                                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                                                cursor: 'pointer', borderBottom: '1px solid #e2e8f0',
                                                background: formData.participants.includes(emp.id) ? '#eff6ff' : 'transparent',
                                            }}
                                        >
                                            <div style={{ 
                                                width: '18px', height: '18px', border: '2px solid #3b82f6', borderRadius: '4px',
                                                background: formData.participants.includes(emp.id) ? '#3b82f6' : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                                            }}>
                                                {formData.participants.includes(emp.id) && <Check size={14} strokeWidth={3} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{emp.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={12} /> {emp.branch?.name || 'Main Branch'}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={12} /> {emp.department?.name || 'General'}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{emp.email}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="review-section">
                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Meeting Summary</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div style={{ fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>TITLE</span>
                                        <span style={{ fontWeight: 600 }}>{formData.title}</span>
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>DATE & TIME</span>
                                        <span style={{ fontWeight: 600 }}>{formData.meeting_date} | {formData.start_time} - {formData.end_time}</span>
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>LOCATION</span>
                                        <span style={{ fontWeight: 600 }}>{formData.meeting_type === 'Online' ? 'Video Conference' : formData.location || 'Not Specified'}</span>
                                    </div>
                                    <div style={{ fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>PARTICIPANTS</span>
                                        <span style={{ fontWeight: 600 }}>{formData.participants.length} Employees Invited</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <label className="form-label">Reminder Notification</label>
                                <select 
                                    name="reminder_before" className="form-control" 
                                    value={formData.reminder_before} onChange={handleChange}
                                >
                                    <option value="15">15 minutes before</option>
                                    <option value="30">30 minutes before</option>
                                    <option value="60">1 hour before</option>
                                    <option value="1440">1 day before</option>
                                </select>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    System will send automated WhatsApp and push notifications to all participants.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer Nav */}
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                        <button className="btn-secondary" onClick={() => step > 1 ? setStep(step - 1) : navigate('/meetings/manage')}>
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {step < 3 ? (
                                <button className="btn-primary glow-btn" onClick={() => setStep(step + 1)}>
                                    Next Step <ChevronRight size={18} strokeWidth={2.5} />
                                </button>
                            ) : (
                                <button className="btn-primary glow-btn" onClick={handleSubmit} disabled={loading}>
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={2.5} />}
                                    {loading ? 'Scheduling...' : 'Finalize Schedule'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleMeeting;
