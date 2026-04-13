import { useState } from 'react';
import { Plus, Clock , Coffee} from 'lucide-react';
import './attendance.css';
import { useDocumentRequests, formatDate, timeAgo, getStatusBadge } from './useAttendanceHooks';

const UpdateBreak = () => {
  // We'll use DocumentRequests for manual break correction entries which need approval
  const { requests, loading, submitRequest } = useDocumentRequests('BreakCorrection');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], duration: '', reason: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRequest({
        request_type: 'BreakCorrection',
        requested_data: { duration: form.duration },
        date: form.date,
        reason: form.reason
      });
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], duration: '', reason: '' });
    } catch (err) {
      console.error('Failed to submit break correction request');
    }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Coffee className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Break Adjustment</h2>
          <p className="attendance-subtitle">Request manual adjustments for missed or incorrect break logs.</p>
        </div>
        <div className="attendance-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> Request Adjustment
          </button>
        </div>
      </div>

      {showForm && (
        <div className="attendance-chart-card" style={{ marginBottom: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div className="filter-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="filter-group">
              <label>Actual Duration (Minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 45" required />
            </div>
            <div className="filter-group">
              <label>Reason*</label>
              <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Forgot to punch out/in..." required />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit for Approval</button>
            </div>
          </form>
        </div>
      )}

      <div className="attendance-table-card">
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Requested Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : requests.length > 0 ? (
                requests.map((r: any) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date)}</td>
                    <td><Clock size={12} style={{ marginRight: 6 }} /> {r.requested_data?.duration} mins</td>
                    <td style={{ fontSize: 13, color: '#4d5c6b' }}>{r.reason}</td>
                    <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                    <td style={{ fontSize: 13, color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No adjustment requests found.
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

export default UpdateBreak;
