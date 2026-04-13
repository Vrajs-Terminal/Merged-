import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, 
    MessageSquare, 
    Send, 
    Paperclip, 
    CheckCircle2, 
    Clock, 
    User, 
    Building, 
    FileText, 
    Image as ImageIcon,
    MoreVertical,
    Loader2,
    Calendar,
    Flag,
    ShieldAlert,
    X,
    Plus
} from 'lucide-react';
import api from '../../lib/axios';

interface EscalationThreadProps {
    escalationId: number;
    onBack: () => void;
}

const EscalationThread: React.FC<EscalationThreadProps> = ({ escalationId, onBack }) => {
    const [escalation, setEscalation] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const currentUser = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}') || {};
        } catch {
            return { id: 1 };
        }
    })();

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEscalationDetails();
    }, [escalationId]);

    const fetchEscalationDetails = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/escalations/${escalationId}`);
            setEscalation(res.data);
            setReplies(res.data.replies || []);
        } catch (err) {
            console.error('Failed to fetch escalation details', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAttachments(prev => [...prev, res.data]);
        } catch (err) {
            console.error('Upload failed', err);
            alert('File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() && attachments.length === 0) return;

        try {
            setIsSubmitting(true);
            const res = await api.post(`/escalations/${escalationId}/reply`, {
                user_id: currentUser.id,
                message: replyMessage,
                attachments: attachments
            });
            setReplies(prev => [...prev, res.data]);
            setReplyMessage('');
            setAttachments([]);
            // Auto scroll to bottom
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            console.error('Failed to send reply', err);
            alert('Error sending reply.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent': return '#ef4444';
            case 'High': return '#f97316';
            case 'Medium': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Loader2 className="spinner" size={48} style={{ color: '#3b82f6' }} />
                <p style={{ marginTop: '20px', color: '#64748b', fontWeight: 500 }}>Loading discussion thread...</p>
            </div>
        );
    }

    if (!escalation) return null;

    return (
        <div className="thread-container" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <button 
                onClick={onBack}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', marginBottom: '24px', fontWeight: 600, fontSize: '14px' }}
            >
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="thread-header-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ padding: '12px', background: `${getPriorityColor(escalation.priority)}15`, color: getPriorityColor(escalation.priority), borderRadius: '16px' }}>
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: getPriorityColor(escalation.priority), textTransform: 'uppercase', marginBottom: '4px' }}>
                                {escalation.priority} PRIORITY • {escalation.category}
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>{escalation.title}</h2>
                        </div>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: escalation.status === 'Closed' ? '#f0fdf4' : '#eff6ff', color: escalation.status === 'Closed' ? '#10b981' : '#3b82f6', fontWeight: 700, fontSize: '13px' }}>
                        {escalation.status === 'Closed' ? 'Resolved' : escalation.status}
                    </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', marginBottom: '24px', color: '#475569', fontSize: '15px', lineHeight: 1.6, border: '1px solid #f1f5f9' }}>
                    {escalation.description}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={18} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>RAISED BY</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{escalation.sender.name}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building size={18} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>BRANCH/DEPT</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{escalation.branch?.name || '--'}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} style={{ color: '#64748b' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>RAISED ON</div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{formatDate(escalation.createdAt)}</div>
                        </div>
                    </div>
                </div>

                {escalation.attachments && escalation.attachments.length > 0 && (
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '12px' }}>ATTACHMENTS ({escalation.attachments.length})</div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {escalation.attachments.map((att: any, idx: number) => (
                                <a 
                                    key={idx} href={att.file_url} target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', textDecoration: 'none', color: '#3b82f6', fontSize: '13px', fontWeight: 600 }}
                                >
                                    <FileText size={14} /> {att.name || `File ${idx+1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="replies-timeline">
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageSquare size={20} /> Resolution History ({replies.length})
                </div>

                {replies.map((reply: any, idx: number) => (
                    <div key={reply.id} className="reply-item">
                        <div className="reply-dot" />
                        <div className="reply-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '30px', height: '30px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '12px', fontWeight: 700 }}>
                                        {reply.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{reply.user.name}</span>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px' }}>({reply.user.role})</span>
                                    </div>
                                </div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(reply.createdAt)}</span>
                            </div>
                            <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {reply.message}
                            </div>
                            {reply.attachments && reply.attachments.length > 0 && (
                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {reply.attachments.map((att: any, aid: number) => (
                                        <a key={aid} href={att.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', textDecoration: 'none', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Paperclip size={12} /> {att.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={scrollRef} />
            </div>

            {escalation.status !== 'Closed' && (
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '24px', marginTop: '32px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: '16px' }}>Add a Reply / Action Detail</div>
                    <form onSubmit={handleSendReply}>
                        <textarea 
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            placeholder="Write your resolution steps or feedback here..."
                            style={{ width: '100%', borderRadius: '16px', padding: '16px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#1e293b', fontSize: '14px', resize: 'none', minHeight: '120px', outline: 'none' }}
                        />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                                    <Paperclip size={16} /> Attach File
                                    <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                                </label>
                                {attachments.length > 0 && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>{attachments.length} file(s) ready</span>}
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSubmitting || isUploading || (!replyMessage.trim() && attachments.length === 0)}
                                style={{ 
                                    padding: '12px 32px', 
                                    borderRadius: '12px', 
                                    background: (isSubmitting || isUploading || (!replyMessage.trim() && attachments.length === 0)) ? '#94a3b8' : '#3b82f6', 
                                    color: '#fff', 
                                    border: 'none', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    fontWeight: 700 
                                }}
                            >
                                {isSubmitting ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
                                Send Reply
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EscalationThread;
