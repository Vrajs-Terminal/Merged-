import { useState } from 'react';
import { Clock , AlertCircle} from 'lucide-react';
import './attendance.css';
import { useAttendanceRequests, formatDate, timeAgo, getStatusBadge } from './useAttendanceHooks';

const PunchOutMissingRequest = () => {
  const { requests, loading, submitRequest } = useAttendanceRequests('MissingPunchOut');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], out_time: '', reason: '' });
  const [msg, setMsg] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRequest({ request_type: 'MissingPunchOut', date: form.date, requested_data: { out_time: form.out_time }, reason: form.reason });
      setMsg({ type: 'success', text: 'Request submitted successfully!' });
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], out_time: '', reason: '' });
    } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit' }); }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><AlertCircle className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Punch Out Missing Request</h2>
          <p className="attendance-subtitle">Submit a request to correct a missing punch-out time.</p>
        </div>
        <div className="attendance-actions">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ New Request</button>
        </div>
      </div>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}

      {showForm && (
        <div className="attendance-chart-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px 0' }}>New Request</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'end' }}>
            <div className="filter-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
            <div className="filter-group"><label>Actual Out Time</label><input type="time" value={form.out_time} onChange={e => setForm({ ...form, out_time: e.target.value })} required /></div>
            <div className="filter-group"><label>Reason</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Forgot to punch out" required /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Submit Request</button>
            </div>
          </form>
        </div>
      )}

      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Date</th><th>Requested Out Time</th><th>Reason</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              : requests.length > 0 ? requests.map((r: any) => (
                <tr key={r.id}>
                  <td>{formatDate(r.date)}</td>
                  <td><Clock size={12} style={{ marginRight: 4 }} />{r.requested_data?.out_time || '--'}</td>
                  <td style={{ fontSize: 12, color: '#475569' }}>{r.reason}</td>
                  <td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td>
                  <td style={{ fontSize: 12, color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td>
                </tr>
              )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No requests found. Click "+ New Request" to create one.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PunchOutMissingRequest;
