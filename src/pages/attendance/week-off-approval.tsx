import { useState } from 'react';
import { CheckCircle, XCircle, Calendar, RefreshCw , ThumbsUp} from 'lucide-react';
import './attendance.css';
import { useAttendanceRequests, formatDate, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';

const WeekOffApproval = () => {
    const { requests, loading, reviewRequest } = useAttendanceRequests('WeekOffExchange');
    const [filter, setFilter] = useState('Pending');
    const [remarks, setRemarks] = useState('');
    const [activeId, setActiveId] = useState<number | null>(null);
    const filtered = requests.filter((r: any) => filter ? r.status === filter : true);

    const handleReview = async (id: number, status: string) => {
        try { await reviewRequest(id, status, remarks); setActiveId(null); setRemarks(''); } catch (err) { console.error(err); }
    };

    return (
        <div className="attendance-module-container">
            <div className="attendance-header">
                <div><h2 className="attendance-title"><ThumbsUp className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Week-Off Exchange Approval</h2><p className="attendance-subtitle">Review employee week-off exchange requests.</p></div>
            </div>
            <div className="attendance-filters-bar">
                <div className="filter-group"><label>Status</label><select value={filter} onChange={e => setFilter(e.target.value)}><option value="">All</option><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
            </div>
            <div className="attendance-table-card" style={{ padding: 0 }}>
                <table className="attendance-table">
                    <thead><tr><th>Employee</th><th>Original Day Off</th><th>Requested Day Off</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
                            : filtered.length > 0 ? filtered.map((r: any) => (
                                <tr key={r.id}>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(r.user_id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(r.user?.name || '')}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{r.user?.name}</span></div></td>
                                    <td><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{formatDate(r.date)}</td>
                                    <td><RefreshCw size={12} style={{ display: 'inline', marginRight: 4, color: '#3b82f6' }} />{formatDate(r.requested_data?.exchange_with_date || '')}</td>
                                    <td style={{ fontSize: 12, color: '#475569', maxWidth: 200 }}>{r.reason}</td>
                                    <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                                    <td>
                                        {r.status === 'Pending' ? (activeId === r.id ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><input type="text" placeholder="Remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} style={{ padding: '6px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }} /><div style={{ display: 'flex', gap: 6 }}><button className="btn-primary" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => handleReview(r.id, 'Approved')}><CheckCircle size={12} /> Approve</button><button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 11, color: '#ef4444' }} onClick={() => handleReview(r.id, 'Rejected')}><XCircle size={12} /> Reject</button></div></div>) : (<button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setActiveId(r.id)}>Review</button>)) : <span style={{ fontSize: 11, color: '#94a3b8' }}>{r.approver?.name ? `By ${r.approver.name}` : '--'}</span>}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No exchange requests to review.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeekOffApproval;
