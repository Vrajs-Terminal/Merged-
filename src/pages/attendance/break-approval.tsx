import { Check, X, Clock , Coffee} from 'lucide-react';
import './attendance.css';
import { useDocumentRequests, formatDate, timeAgo, getStatusBadge, getAvatarColor, getInitials } from './useAttendanceHooks';

const BreakApproval = () => {
  const { requests, loading, updateStatus } = useDocumentRequests('BreakCorrection');

  const handleAction = async (id: number, status: string) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this break adjustment?`)) return;
    try {
      await updateStatus(id, status);
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Coffee className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Break Approvals</h2>
          <p className="attendance-subtitle">Review and manage manual break adjustment requests from your team.</p>
        </div>
        <div className="attendance-actions">
          <span className="badge badge-late">{pendingRequests.length} Pending Actions</span>
        </div>
      </div>

      <div className="attendance-table-card">
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Correction</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : requests.length > 0 ? (
                requests.map((r: any) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: getAvatarColor(r.user_id), color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getInitials(r.user?.name || '')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{r.user?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Submitted {timeAgo(r.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(r.date)}</td>
                    <td><Clock size={12} style={{ marginRight: 6 }} /> {r.requested_data?.duration} mins</td>
                    <td style={{ fontSize: 13, color: '#4d5c6b' }}>{r.reason}</td>
                    <td>
                      {r.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleAction(r.id, 'Approved')} className="btn-icon text-green" title="Approve"><Check size={20} /></button>
                          <button onClick={() => handleAction(r.id, 'Rejected')} className="btn-icon text-red" title="Reject"><X size={20} /></button>
                        </div>
                      ) : (
                        <span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No adjustment requests awaiting approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BreakApproval;
