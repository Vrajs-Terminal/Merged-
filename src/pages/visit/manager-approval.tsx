import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, RefreshCcw, Eye, MessageSquare, Briefcase, MapPin, Clock, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Visit {
    id: number;
    user: { name: string; email: string };
    client_name: string;
    company_name: string;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
    approval_status: string | null;
    approval_comments: string | null;
    approver: { name: string } | null;
}

const ManagerApproval = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Search
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal
    const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
    const [actionType, setActionType] = useState<'Approve' | 'Reject' | 'Resubmit' | null>(null);
    const [comments, setComments] = useState('');

    useEffect(() => {
        fetchVisits();
    }, [page, search]);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const res = await api.get('/manager-approval', { 
                params: { search, page, limit: 25 } 
            });
            setVisits(res.data.data);
            setTotalPages(res.data.meta.last_page || 1);
            setTotalItems(res.data.meta.total || 0);
            
            // If empty array and first time, mock just for visual test (Wait, the user wants 100% dynamic, but it's safe to load real ones!)
        } catch (error) {
            toast.error("Failed to load visit approvals");
        } finally {
            setLoading(false);
        }
    };

    const submitDecision = async () => {
        if (!selectedVisit || !actionType) return;
        if ((actionType === 'Reject' || actionType === 'Resubmit') && !comments.trim()) {
            toast.error(`Please provide comments detailing why you chose to ${actionType}`);
            return;
        }

        try {
            await api.post(`/manager-approval/${selectedVisit.id}/decision`, {
                decision: actionType,
                comments: comments
            });
            toast.success(`Visit successfully marked as ${actionType}`);
            setSelectedVisit(null);
            setActionType(null);
            setComments('');
            fetchVisits();
        } catch (e) {
            toast.error("An error occurred while saving the decision");
        }
    };

    const getStatusBadge = (status: string, approvalStatus: string | null) => {
        if (approvalStatus === 'Approved') return <span className="badge badge-success"><CheckCircle size={12}/> Approved</span>;
        if (approvalStatus === 'Rejected') return <span className="badge badge-danger"><XCircle size={12}/> Rejected</span>;
        if (approvalStatus === 'Resubmission Requested') return <span className="badge badge-warning"><RefreshCcw size={12}/> Needs Resubmit</span>;
        return <span className="badge badge-neutral"><ShieldCheck size={12}/> Pending Review</span>;
    };

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <ShieldCheck color="#6366f1" /> Manager Approvals
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                        Review, verify, and greenlight employee field visit reports (25 entries per page).
                    </p>
                </div>
                
                <div style={{ position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
                    <input 
                        type="text" 
                        placeholder="Search employee or retailer..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ padding: '10px 16px 10px 36px', borderRadius: 8, border: '1px solid #cbd5e1', width: 300, fontSize: 14, outline: 'none' }}
                    />
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#475569' }}>#</th>
                                <th style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Employee Name</th>
                                <th style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Retailer / Client</th>
                                <th style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Visit Date</th>
                                <th style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Timing (In - Out)</th>
                                <th style={{ padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 600, color: '#475569', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && visits.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading Approvals...</td></tr>
                            ) : visits.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No visits pending approval or matching your search.</td></tr>
                            ) : (
                                visits.map((visit, idx) => (
                                    <tr key={visit.id} style={{ borderBottom: '1px solid #e2e8f0', transition: '0.2s background' }} className="table-row">
                                        <td style={{ padding: '16px 24px', color: '#64748b', fontSize: 14 }}>
                                            {(page - 1) * 25 + idx + 1}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{visit.user.name}</span>
                                                <span style={{ fontSize: 12, color: '#64748b' }}>{visit.user.email}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{visit.client_name}</span>
                                                <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={12}/> {visit.company_name || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', color: '#334155', fontSize: 14, fontWeight: 500 }}>
                                            {new Date(visit.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} color="#10b981"/> {visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '---'}</div>
                                                <span style={{ color: '#cbd5e1' }}>→</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} color="#ef4444"/> {visit.check_out_time ? new Date(visit.check_out_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '---'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {getStatusBadge(visit.status, visit.approval_status)}
                                            {visit.approver && (
                                                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                                                    By: {visit.approver.name}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <button 
                                                className="review-btn"
                                                onClick={() => { setSelectedVisit(visit); setActionType(null); }}
                                                disabled={visit.approval_status === 'Approved'}
                                            >
                                                {visit.approval_status === 'Approved' ? <><CheckCircle size={14}/> Reviewed</> : <><Eye size={14}/> Review</>}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Max 25 as requested) */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '0 0 12px 12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                        Showing {visits.length > 0 ? (page - 1) * 25 + 1 : 0} to {Math.min(page * 25, totalItems)} of {totalItems} Entries
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: page === 1 ? '#f1f5f9' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        ><ChevronLeft size={16}/></button>
                        <button 
                            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: page === totalPages ? '#f1f5f9' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: '#475569', display: 'flex', alignItems: 'center' }}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        ><ChevronRight size={16}/></button>
                    </div>
                </div>
            </div>

            {/* Smart Action Modal */}
            {selectedVisit && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="modal-content fade-in-up" style={{ background: 'white', width: 500, borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
                        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
                            <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a', fontWeight: 700 }}>Review Visit Report</h3>
                            <p style={{ margin: '4px 0 0 0', fontSize: 14, color: '#64748b' }}>Approve, reject, or request changes from {selectedVisit.user.name}</p>
                        </div>
                        
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, color: '#64748b' }}>Client</span>
                                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{selectedVisit.client_name}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, color: '#64748b' }}>Company</span>
                                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{selectedVisit.company_name || '--'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 13, color: '#64748b' }}>Date</span>
                                    <span style={{ fontSize: 14, color: '#0f172a', fontWeight: 600 }}>{new Date(selectedVisit.date).toDateString()}</span>
                                </div>
                            </div>

                            {/* Action Switcher */}
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12, display: 'block' }}>Select Action *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                    <button className={`action-btn approve ${actionType === 'Approve' ? 'active' : ''}`} onClick={() => setActionType('Approve')}>
                                        <CheckCircle size={16}/> Approve
                                    </button>
                                    <button className={`action-btn resubmit ${actionType === 'Resubmit' ? 'active' : ''}`} onClick={() => setActionType('Resubmit')}>
                                        <RefreshCcw size={16}/> Resubmit
                                    </button>
                                    <button className={`action-btn reject ${actionType === 'Reject' ? 'active' : ''}`} onClick={() => setActionType('Reject')}>
                                        <XCircle size={16}/> Reject
                                    </button>
                                </div>
                            </div>

                            {(actionType === 'Reject' || actionType === 'Resubmit' || actionType === 'Approve') && (
                                <div className="fade-in">
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <MessageSquare size={14} color="#64748b"/> Manager Comments {(actionType === 'Reject' || actionType === 'Resubmit') && <span style={{ color: '#ef4444' }}>*</span>}
                                    </label>
                                    <textarea 
                                        rows={4}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder={`Add your feedback or reasons for ${actionType.toLowerCase()}...`}
                                        style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', resize: 'none' }}
                                    />
                                </div>
                            )}

                        </div>
                        
                        <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer' }} onClick={() => setSelectedVisit(null)}>Cancel</button>
                            <button 
                                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: actionType ? '#4f46e5' : '#cbd5e1', color: 'white', fontWeight: 600, cursor: actionType ? 'pointer' : 'not-allowed', transition: '0.2s' }}
                                disabled={!actionType}
                                onClick={submitDecision}
                            >
                                Confirm & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>
                {`
                    .badge { display: inline-flex; alignItems: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
                    .badge-success { background: #dcfce7; color: #16a34a; }
                    .badge-danger { background: #fef2f2; color: #dc2626; }
                    .badge-warning { background: #fef3c7; color: #d97706; }
                    .badge-neutral { background: #f1f5f9; color: #475569; }
                    
                    .table-row:hover { background: #f8fafc; }
                    
                    .review-btn { padding: 8px 16px; border-radius: 6px; background: white; border: 1px solid #cbd5e1; color: #475569; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s; }
                    .review-btn:hover:not(:disabled) { border-color: #94a3b8; background: #f8fafc; }
                    .review-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                    .action-btn { padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; color: #64748b; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.2s; }
                    .action-btn:hover { background: #f8fafc; }
                    
                    .action-btn.approve.active { background: #eff6ff; border-color: #3b82f6; color: #2563eb; }
                    .action-btn.resubmit.active { background: #fefce8; border-color: #eab308; color: #ca8a04; }
                    .action-btn.reject.active { background: #fef2f2; border-color: #ef4444; color: #dc2626; }

                    .fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
                    @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    .fade-in { animation: fadeIn 0.2s ease-out forwards; }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                `}
            </style>
        </div>
    );
};

export default ManagerApproval;
