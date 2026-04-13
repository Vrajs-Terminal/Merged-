import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    MessageSquare, UserPlus, Filter, Download, AlertCircle,
    CheckCircle2, Clock, ShieldAlert, Star, Calendar, Flag
} from 'lucide-react';
import './complaints.css';

interface Complaint {
    id: number;
    complaint_no: string;
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High';
    status: 'Open' | 'In Progress' | 'Closed' | 'Re-Open';
    assigned_to: number | null;
    createdAt: string;
    last_updated_at: string | null;
    rating: number | null;
    is_anonymous: boolean;
    user: { id: number; name: string; employee_id: string };
    category: { id: number; name: string; sla_limit: number };
    assignee: { id: number; name: string } | null;
    branch: { name: string } | null;
    department: { name: string } | null;
}

export default function ManageComplaints() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState({ all: 0, open: 0, closed: 0, reopened: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

    // Filter Logic
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State (New Complaint)
    const [formUserId, setFormUserId] = useState('');
    const [formCategoryId, setFormCategoryId] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formPriority, setFormPriority] = useState('Medium');
    const [formAnonymous, setFormAnonymous] = useState(false);

    // Dependency Data
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [admins, setAdmins] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        fetchComplaints();
        fetchStats();
        fetchDependencies();
    }, [statusFilter]);

    const fetchComplaints = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/complaints/manage?status=${statusFilter}`);
            if (res.ok) setComplaints(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/complaints/manage/stats');
            if (res.ok) setStats(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchDependencies = async () => {
        try {
            const [empRes, catRes, admRes] = await Promise.all([
                fetch('/api/search/employees'),
                fetch('/api/complaints/categories'),
                fetch('/api/search/employees?role=Admin')
            ]);
            if (empRes.ok) setEmployees(await empRes.json());
            if (catRes.ok) setCategories(await catRes.json());
            if (admRes.ok) setAdmins(await admRes.json());
        } catch (e) { console.error(e); }
    };

    const handleCreate = async () => {
        if (!formUserId || !formCategoryId || !formTitle || !formDesc) return alert("Fields marked * are mandatory");
        setIsSaving(true);
        try {
            const res = await fetch('/api/complaints/manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: formUserId,
                    category_id: formCategoryId,
                    title: formTitle,
                    description: formDesc,
                    priority: formPriority,
                    is_anonymous: formAnonymous
                })
            });
            if (res.ok) {
                fetchComplaints();
                fetchStats();
                setIsModalOpen(false);
                resetForm();
            }
        } catch (e) { console.error(e); }
        finally { setIsSaving(false); }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`/api/complaints/manage/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) { fetchComplaints(); fetchStats(); }
        } catch (e) { console.error(e); }
    };

    const handleAssign = async (id: number, assigned_to: number) => {
        try {
            const res = await fetch(`/api/complaints/manage/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assigned_to })
            });
            if (res.ok) fetchComplaints();
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setFormUserId(''); setFormCategoryId(''); setFormTitle(''); setFormDesc(''); setFormPriority('Medium'); setFormAnonymous(false);
    };

    const isSlaBreached = (complaint: Complaint) => {
        if (complaint.status === 'Closed') return false;
        const createdDate = new Date(complaint.createdAt).getTime();
        const now = new Date().getTime();
        const diffHours = (now - createdDate) / (1000 * 60 * 60);
        return diffHours > complaint.category.sla_limit;
    };

    return (
        <div className="complaints-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <AlertCircle size={24} color="#dc2626" />
                    <h1>Employee Complaints Dashboard</h1>
                </div>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Raise Complaint
                </button>
            </div>

            <div className="c-stats-grid">
                <div className="c-stat-card fade-in" style={{ borderLeft: '4px solid #3b82f6' }}>
                    <div className="c-stat-value">{stats.all}</div>
                    <div className="c-stat-label">Total Complaints</div>
                </div>
                <div className="c-stat-card fade-in" style={{ borderLeft: '4px solid #f97316' }}>
                    <div className="c-stat-value">{stats.open}</div>
                    <div className="c-stat-label">Open Now</div>
                </div>
                <div className="c-stat-card fade-in" style={{ borderLeft: '4px solid #10b981' }}>
                    <div className="c-stat-value">{stats.closed}</div>
                    <div className="c-stat-label">Resolved</div>
                </div>
                <div className="c-stat-card fade-in" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="c-stat-value">{stats.reopened}</div>
                    <div className="c-stat-label">Re-opened Cases</div>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div className="v-filter-row">
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        <div className="bgv-search-box" style={{ maxWidth: '300px' }}>
                            <Search size={16} />
                            <input type="text" placeholder="Search Title / Emp..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="bgv-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                            <option value="Re-Open">Re-Open</option>
                        </select>
                    </div>
                    <button className="btn-icon-only"><Download size={18} /></button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Status/Priority</th>
                            <th>Complaint Info</th>
                            <th>Employee Details</th>
                            <th>Timeline/Assignment</th>
                            <th>Feedback</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}><Loader2 className="spin" size={32} /></td></tr>
                        ) : complaints.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.user.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                            <tr key={c.id} className="fade-in">
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span className={`c-status-badge ${c.status.toLowerCase().replace(' ', '-')}`}>{c.status}</span>
                                        <span className={`c-priority-tag ${c.priority.toLowerCase()}`}>{c.priority} Level</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 800, color: '#1e293b' }}>{c.complaint_no}</div>
                                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{c.title}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.category.name}</div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                                        {c.is_anonymous ? <span style={{ color: '#94a3b8' }}>Anonymous Employee</span> : c.user.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{c.branch?.name} - {c.department?.name}</div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                        <Calendar size={12} color="#3b82f6" /> {new Date(c.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className={`c-sla-status ${isSlaBreached(c) ? 'breached' : 'ok'}`} style={{ marginTop: '4px' }}>
                                        <Clock size={12} /> {isSlaBreached(c) ? 'SLA Breached' : 'Within SLA'}
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <select 
                                            className="bgv-filter-select" 
                                            style={{ height: '32px', fontSize: '11px', padding: '0 8px' }}
                                            value={c.assigned_to || ''}
                                            onChange={e => handleAssign(c.id, Number(e.target.value))}
                                        >
                                            <option value="">Assign To...</option>
                                            {admins.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    {c.status === 'Closed' ? (
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={14} fill={c.rating && c.rating >= star ? "#fbbf24" : "none"} color={c.rating && c.rating >= star ? "#fbbf24" : "#cbd5e1"} />
                                            ))}
                                        </div>
                                    ) : '-'}
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn-icon-only" title="Discussion / Comments" onClick={() => { setSelectedComplaint(c); setIsDetailsOpen(true); }}>
                                            <MessageSquare size={18} />
                                        </button>
                                        <select 
                                            className="bgv-filter-select" 
                                            style={{ height: '32px', fontSize: '11px' }}
                                            value={c.status}
                                            onChange={e => handleUpdateStatus(c.id, e.target.value)}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Re-Open">Re-Open</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Raise Complaint Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '24px' }}>
                        <div className="modal-header">
                            <h3><Flag size={20} color="#dc2626" /> Raise New Complaint</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                            <div className="form-group">
                                <label>Employee <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className="form-select" value={formUserId} onChange={e => setFormUserId(e.target.value)}>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className="form-select" value={formCategoryId} onChange={e => setFormCategoryId(e.target.value)}>
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Complaint Title <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="form-input" placeholder="Summarize the issue..." value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Description <span style={{ color: '#ef4444' }}>*</span></label>
                                <textarea className="form-textarea" rows={4} placeholder="Describe the problem in detail..." value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Priority</label>
                                    <select className="form-select" value={formPriority} onChange={e => setFormPriority(e.target.value)}>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '28px' }}>
                                    <input type="checkbox" id="anon" checked={formAnonymous} onChange={e => setFormAnonymous(e.target.checked)} />
                                    <label htmlFor="anon" style={{ marginBottom: 0, cursor: 'pointer' }}>Anonymous</label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" style={{ background: '#dc2626' }} onClick={handleCreate} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                Register Complaint
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discussion Thread Modal */}
            {isDetailsOpen && selectedComplaint && (
                <ComplaintThreadModal 
                    complaint={selectedComplaint} 
                    onClose={() => setIsDetailsOpen(false)} 
                />
            )}
        </div>
    );
}

function ComplaintThreadModal({ complaint, onClose }: { complaint: Complaint, onClose: () => void }) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const userRole = 'Admin'; // Mocked role
    const currentUserId = 1; // Mocked ID

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/complaints/comments/${complaint.id}?include_internal=true`);
            if (res.ok) setComments(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleSend = async () => {
        if (!newComment.trim()) return;
        setIsSending(true);
        try {
            const res = await fetch('/api/complaints/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    complaint_id: complaint.id,
                    user_id: currentUserId,
                    comment: newComment,
                    is_internal: isInternal
                })
            });
            if (res.ok) {
                setNewComment('');
                fetchComments();
            }
        } catch (e) { console.error(e); }
        finally { setIsSending(false); }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content wide fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', borderRadius: '24px' }}>
                <div className="modal-header">
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>{complaint.complaint_no}</div>
                        <h3>Discussion Thread</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body" style={{ background: '#f8fafc' }}>
                    <div style={{ padding: '16px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{complaint.title}</div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>{complaint.description}</p>
                    </div>

                    <div className="c-discussion-wrap">
                        {comments.length > 0 ? comments.map(c => (
                            <div key={c.id} className={`c-comment-bubble ${c.is_internal ? 'internal' : 'admin'}`}>
                                <div className="c-comment-meta">
                                    <strong>{c.user.name}</strong> • {new Date(c.createdAt).toLocaleTimeString()} 
                                    {c.is_internal && <span style={{ marginLeft: '8px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>INTERNAL</span>}
                                </div>
                                <div style={{ fontSize: '13px', color: '#1e293b' }}>{c.comment}</div>
                            </div>
                        )) : <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>No discussion yet.</div>}
                    </div>
                </div>
                <div className="modal-footer" style={{ display: 'block', padding: '24px' }}>
                    <textarea 
                        className="form-textarea" 
                        placeholder="Type your response / resolution notes here..." 
                        rows={3} 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" id="int" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                            <label htmlFor="int" style={{ marginBottom: 0, fontSize: '12px', cursor: 'pointer' }}>Add as Internal Note</label>
                        </div>
                        <button className="btn-save" onClick={handleSend} disabled={isSending}>
                            {isSending ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                            Post Comment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
