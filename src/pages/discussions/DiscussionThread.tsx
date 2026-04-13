import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Send, 
    MessageCircle, 
    ThumbsUp, 
    CornerDownRight, 
    MoreHorizontal,
    Smile,
    Paperclip,
    User,
    Clock,
    Lock,
    Unlock,
    Loader2,
    X,
    FileText,
    Image as ImageIcon,
    Calendar
} from 'lucide-react';
import api from '../../lib/axios';

interface Attachment {
    file_url: string;
    file_name: string;
    file_type: string;
}

interface Comment {
    id: number;
    parent_id?: number;
    comment: string;
    createdAt: string;
    user: { id: number; name: string; role: string };
    reactions: { user_id: number; reaction: string }[];
    replies: Comment[];
    attachments: Attachment[];
}

interface ThreadProps {
    discussion: any;
    onBack: () => void;
}

const DiscussionThread: React.FC<ThreadProps> = ({ discussion: initialDiscussion, onBack }) => {
    const [discussion, setDiscussion] = useState(initialDiscussion);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [newAttachments, setNewAttachments] = useState<any[]>([]);
    const [replyAttachments, setReplyAttachments] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchThread();
    }, [discussion.id]);

    const fetchThread = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/discussions/thread/${discussion.id}/comments`);
            setComments(res.data);
            
            const dRes = await api.get(`/discussions/manage`, {
                params: { id: discussion.id, userId: currentUser.id }
            });
            if (dRes.data && Array.isArray(dRes.data)) {
                const updated = dRes.data.find((d: any) => d.id === discussion.id);
                if (updated) setDiscussion(updated);
            }
        } catch (err) {
            console.error('Failed to fetch thread', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isReply = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (isReply) {
                setReplyAttachments(prev => [...prev, res.data]);
            } else {
                setNewAttachments(prev => [...prev, res.data]);
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('File upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const postComment = async (e: React.FormEvent, parentId?: number) => {
        e.preventDefault();
        const text = parentId ? replyText : newComment;
        const attached = parentId ? replyAttachments : newAttachments;
        
        if (!text.trim() && attached.length === 0) return;

        try {
            setIsSubmitting(true);
            await api.post(`/discussions/thread/${discussion.id}/comments`, {
                user_id: currentUser.id,
                comment: text,
                parent_id: parentId,
                attachments: attached
            });
            
            if (parentId) {
                setReplyTo(null);
                setReplyText('');
                setReplyAttachments([]);
            } else {
                setNewComment('');
                setNewAttachments([]);
            }
            fetchThread();
        } catch (err) {
            console.error('Failed to post comment', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reactToComment = async (commentId: number) => {
        try {
            await api.post(`/discussions/thread/comments/${commentId}/react`, {
                user_id: currentUser.id,
                reaction: '👍'
            });
            fetchThread();
        } catch (err) {
            console.error('Failed to react', err);
        }
    };

    const AttachmentList = ({ files }: { files: Attachment[] }) => {
        if (!files || files.length === 0) return null;
        return (
            <div className="attachment-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
                {files.map((file, i) => {
                    const isImg = file.file_type.startsWith('image/');
                    return (
                        <a key={i} href={file.file_url} target="_blank" rel="noopener noreferrer" style={{ 
                            padding: '10px 14px', 
                            background: '#f8fafc', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                            color: '#475569',
                            fontSize: '13px',
                            transition: 'all 0.2s'
                        }} className="hover-shadow">
                            {isImg ? <ImageIcon size={16} style={{ color: '#3b82f6' }} /> : <FileText size={16} style={{ color: '#64748b' }} />}
                            <span style={{ fontWeight: 600 }}>{file.file_name}</span>
                        </a>
                    );
                })}
            </div>
        );
    };

    const CommentItem = ({ item, isReply = false }: { item: Comment, isReply?: boolean }) => {
        const hasLiked = item.reactions.some(r => r.user_id === currentUser.id);

        return (
            <div className="comment-bubble-wrapper">
                <div className="comment-bubble">
                    <div className="comment-avatar" style={{ 
                        background: item.user.role === 'Admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, #64748b, #475569)',
                        width: '44px',
                        height: '44px'
                    }}>
                        {item.user.name.charAt(0)}
                    </div>
                    <div className="comment-content-wrapper">
                        <div className="comment-header" style={{ marginBottom: '8px' }}>
                            <div className="comment-author">
                                <span className="author-name">{item.user.name}</span>
                                <span className="author-role" style={{ 
                                    background: item.user.role === 'Admin' ? '#eff6ff' : '#f1f5f9',
                                    color: item.user.role === 'Admin' ? '#3b82f6' : '#64748b',
                                    fontWeight: 700
                                }}>{item.user.role}</span>
                            </div>
                            <span className="comment-time" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} />
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className="comment-text" style={{ fontSize: '15px' }}>{item.comment}</div>
                        
                        <AttachmentList files={item.attachments} />
                        
                        <div className="comment-actions" style={{ marginTop: '16px' }}>
                            <div className={`action-btn ${hasLiked ? 'active' : ''}`} onClick={() => reactToComment(item.id)}>
                                <ThumbsUp size={14} />
                                <span style={{ fontWeight: 700 }}>{item.reactions.length || 0}</span>
                            </div>
                            {discussion.status === 'Active' && (
                                <div className="action-btn" onClick={() => setReplyTo(replyTo === item.id ? null : item.id)}>
                                    <MessageCircle size={14} /> Reply
                                </div>
                            )}
                        </div>

                        {replyTo === item.id && (
                            <div className="reply-input-mini" style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                                <form onSubmit={(e) => postComment(e, item.id)}>
                                    <div className="input-box-wrapper" style={{ background: '#f8fafc' }}>
                                        <textarea 
                                            className="comment-textarea" 
                                            placeholder="Write your response..."
                                            value={replyText}
                                            onChange={e => setReplyText(e.target.value)}
                                            style={{ minHeight: '80px', padding: '12px' }}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                                            <label style={{ cursor: 'pointer', color: '#64748b' }}>
                                                <Paperclip size={18} />
                                                <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, true)} disabled={isUploading} />
                                            </label>
                                            {isUploading && <Loader2 size={16} className="spinner" style={{ color: '#3b82f6' }} />}
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                                                <button type="button" className="btn-secondary" onClick={() => setReplyTo(null)}>Cancel</button>
                                                <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading || (!replyText.trim() && replyAttachments.length === 0)}>Post Reply</button>
                                            </div>
                                        </div>
                                        {replyAttachments.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                                                {replyAttachments.map((f, i) => (
                                                    <div key={i} style={{ fontSize: '11px', background: '#e0f2fe', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <FileText size={12} /> {f.name}
                                                        <X size={12} style={{ cursor: 'pointer' }} onClick={() => setReplyAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {item.replies && item.replies.length > 0 && (
                    <div className="reply-thread">
                        {item.replies.map(reply => (
                            <CommentItem key={reply.id} item={reply} isReply />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="discussion-container" style={{ padding: '0' }}>
            <div className="thread-layout">
                <div className="thread-header">
                    <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '24px' }}>
                        <ArrowLeft size={18} /> Back to Conversations
                    </button>
                    
                    <div className="thread-main-topic">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div className="comment-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                    {discussion.user.name.charAt(0)}
                                </div>
                                <div>
                                    <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{discussion.title}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#64748b' }}>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{discussion.user.name}</span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} /> {new Date(discussion.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`topic-status-badge ${discussion.status === 'Active' ? 'status-active' : 'status-closed'}`} style={{ position: 'static' }}>
                                {discussion.status}
                            </span>
                        </div>
                        
                        <div style={{ background: '#f8faff', padding: '32px', borderRadius: '32px', border: '1px solid #e0e7ff' }}>
                            <p style={{ fontSize: '18px', lineHeight: 1.8, color: '#1e293b', margin: 0, whiteSpace: 'pre-wrap' }}>{discussion.description}</p>
                            <AttachmentList files={discussion.attachments} />
                        </div>
                    </div>
                </div>

                <div className="comment-section">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
                        <div style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: '99px', fontSize: '13px', fontWeight: 800 }}>{comments.length} Comments</div>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #e2e8f0, transparent)' }}></div>
                    </div>

                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <Loader2 className="spinner" size={40} style={{ margin: '0 auto', color: '#3b82f6' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {comments.map(c => <CommentItem key={c.id} item={c} />)}
                        </div>
                    )}
                </div>

                {discussion.status === 'Active' ? (
                    <div className="comment-input-area">
                        <form onSubmit={postComment}>
                            <div className="input-box-wrapper">
                                <textarea 
                                    className="comment-textarea" 
                                    placeholder="Add your contribution to this topic..."
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    rows={3}
                                />
                                {newAttachments.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                                        {newAttachments.map((f, i) => (
                                            <div key={i} style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                                                <ImageIcon size={14} /> {f.name}
                                                <X size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => setNewAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="input-footer">
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <label style={{ cursor: 'pointer', color: '#64748b' }}>
                                            <Paperclip size={20} />
                                            <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, false)} disabled={isUploading} />
                                        </label>
                                        <button type="button" className="icon-btn" style={{ color: '#64748b' }}><Smile size={20} /></button>
                                        {isUploading && <Loader2 size={18} className="spinner" style={{ color: '#3b82f6' }} />}
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={isSubmitting || isUploading || (!newComment.trim() && newAttachments.length === 0)}>
                                        {isSubmitting ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
                                        Submit Comment
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div style={{ margin: '0 40px 40px', padding: '40px', background: '#f8fafc', color: '#64748b', textAlign: 'center', borderRadius: '32px', border: '1px solid #e2e8f0' }}>
                        <Lock size={32} style={{ margin: '0 auto 16px', color: '#94a3b8' }} />
                        <h3 style={{ color: '#475569', marginBottom: '4px' }}>Discussion Locked</h3>
                        <p>This topic has been closed for new contributions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscussionThread;
