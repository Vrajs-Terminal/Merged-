import { useState, useEffect } from 'react';
import {
    CheckSquare, XSquare, MapPin, Building, Search,
    MessageSquare, AlertTriangle, Loader2, Navigation, X
, ClipboardCheck} from 'lucide-react';
import './visit.css';

export default function VisitApprovals() {
    const [visits, setVisits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);

    // Modal
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [approvalComments, setApprovalComments] = useState('');

    useEffect(() => {
        fetchPendingVisits();
    }, []);

    const fetchPendingVisits = async () => {
        setIsLoading(true);
        try {
            // Fetch all Pending Approval visits directly
            const res = await fetch(`/api/visits?status=Pending Approval`);
            if (res.ok) {
                const data = await res.json();
                setVisits(data);
            }
        } catch (error) {
            console.error("Failed to load approvals", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionClick = (visit: any) => {
        setSelectedVisit(visit);
        setApprovalComments('');
    };

    const submitApproval = async (statusOverride: string) => {
        setIsActioning(true);
        try {
            const url = `/api/visits/${selectedVisit.id}/approval`;
            const payload = {
                approval_status: statusOverride, // 'Approved', 'Rejected', 'Resubmit'
                approval_comments: approvalComments
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchPendingVisits();
                setSelectedVisit(null);
            } else {
                const err = await res.json();
                alert(err.error || 'Approval action failed');
            }
        } catch (error) {
            console.error("Action error", error);
            alert("Network error.");
        } finally {
            setIsActioning(false);
        }
    };

    return (
        <div className="visit-layout">
            <div className="visit-header-banner" style={{ background: 'linear-gradient(135deg, #a16207, #713f12)' }}>
                <div>
                    <h2 className="visit-title"><ClipboardCheck className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Manager Approvals</h2>
                    <p className="visit-subtitle">Review completed field visits and summaries.</p>
                </div>
            </div>

            <div className="visit-filters">
                <div className="search-group">
                    <Search size={16} color="#64748b" />
                    <input type="text" placeholder="Search employee or client..." />
                </div>
            </div>

            {isLoading ? (
                <div className="visit-loading">
                    <Loader2 className="spinner" size={40} style={{ color: '#ca8a04', animation: 'spin 1s linear infinite' }} />
                    <p>Loading pending reviews...</p>
                </div>
            ) : visits.length > 0 ? (
                <div className="visit-grid">
                    {visits.map(visit => (
                        <div key={visit.id} className="visit-card" style={{ borderTop: '4px solid #eab308' }}>
                            <div className="visit-card-header" style={{ paddingBottom: '12px', display: 'block' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6', background: '#eff6ff', padding: '4px 8px', borderRadius: '4px' }}>
                                        {visit.user?.name || 'Unknown User'}
                                    </span>
                                    <span className={`status-chip status-pending-approval`}>
                                        Awaiting Review
                                    </span>
                                </div>
                                <h3 className="client-name" style={{ margin: '8px 0 4px 0' }}>{visit.client_name}</h3>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}><Building size={12} style={{ marginRight: '4px' }} />{visit.company_name || visit.city}</p>
                            </div>

                            <div className="visit-card-body" style={{ padding: '0 20px 16px 20px', gap: '8px' }}>
                                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '13px', color: '#334155', border: '1px solid #e2e8f0' }}>
                                    <span style={{ display: 'block', fontWeight: 600, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>Work Summary</span>
                                    {visit.work_summary || 'No summary provided.'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                    <span><strong>In:</strong> {visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                                    <span><strong>Out:</strong> {visit.check_out_time ? new Date(visit.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                                </div>
                            </div>

                            <div className="visit-card-footer">
                                <button className="btn-visit-secondary" onClick={() => handleActionClick(visit)} style={{ width: '100%', borderColor: '#eab308', color: '#a16207' }}>
                                    Review Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="visit-empty-state">
                    <CheckSquare size={48} color="#cbd5e1" />
                    <h3>Up to date!</h3>
                    <p>There are no pending visit reviews at the moment.</p>
                </div>
            )}

            {/* Approval Modal */}
            {selectedVisit && (
                <div className="visit-modal-overlay" onClick={() => setSelectedVisit(null)}>
                    <div className="visit-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="visit-modal-header" style={{ background: '#ca8a04', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>Visit Review: {selectedVisit.user?.name}</h3>
                            <button className="close-btn" style={{ color: 'white' }} onClick={() => setSelectedVisit(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="visit-modal-body">
                            <div className="form-grid-2">
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Client</label>
                                    <div style={{ fontSize: '15px', fontWeight: 500, color: '#1e293b' }}>{selectedVisit.client_name}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Company / City</label>
                                    <div style={{ fontSize: '14px', color: '#334155' }}>{selectedVisit.company_name || '--'} / {selectedVisit.city || '--'}</div>
                                </div>
                            </div>

                            <hr style={{ border: 0, borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

                            <div className="form-grid-2">
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                                        <MapPin size={14} color="#10b981" /> Check-In
                                    </label>
                                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedVisit.check_in_time ? new Date(selectedVisit.check_in_time).toLocaleTimeString() : '--'}</div>
                                    <a href={`https://maps.google.com/?q=${selectedVisit.check_in_latitude},${selectedVisit.check_in_longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                        <Navigation size={12} /> View Location
                                    </a>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                                        <MapPin size={14} color="#ef4444" /> Check-Out
                                    </label>
                                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{selectedVisit.check_out_time ? new Date(selectedVisit.check_out_time).toLocaleTimeString() : '--'}</div>
                                    <a href={`https://maps.google.com/?q=${selectedVisit.check_out_latitude},${selectedVisit.check_out_longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                                        <Navigation size={12} /> View Location
                                    </a>
                                </div>
                            </div>

                            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px' }}>
                                <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Submitted Work Summary</label>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.6 }}>{selectedVisit.work_summary || 'No summary entered.'}</p>
                            </div>

                            <div className="form-group" style={{ marginTop: '8px' }}>
                                <label><MessageSquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Manager Comments (Optional)</label>
                                <textarea
                                    className="visit-input"
                                    rows={2}
                                    placeholder="Leave feedback for the employee..."
                                    value={approvalComments}
                                    onChange={(e) => setApprovalComments(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="visit-modal-footer" style={{ gap: '12px' }}>
                            <button className="btn-cancel" onClick={() => setSelectedVisit(null)}>Cancel</button>
                            <div className="footer-actions-right">
                                <button className="btn-visit-secondary" onClick={() => submitApproval('Resubmit')} disabled={isActioning} style={{ color: '#d97706', borderColor: '#d97706' }}>
                                    <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} /> Request Resubmit
                                </button>
                                <button className="btn-visit-primary" onClick={() => submitApproval('Rejected')} disabled={isActioning} style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                                    <XSquare size={16} /> Reject
                                </button>
                                <button className="btn-visit-primary" onClick={() => submitApproval('Approved')} disabled={isActioning} style={{ background: '#10b981', borderColor: '#10b981' }}>
                                    {isActioning ? <Loader2 size={16} className="spinner" /> : <CheckSquare size={16} />}
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
