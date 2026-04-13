import { useState } from 'react';
import { Clock, Plus , Timer} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import './attendance.css';
import { useAttendanceRequests, formatDate, timeAgo, getStatusBadge } from './useAttendanceHooks';

const OvertimeRequest = () => {
  const { requests, loading, submitRequest } = useAttendanceRequests('Overtime');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], hours: '', reason: '' });
  const [msg, setMsg] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRequest({ request_type: 'Overtime', date: form.date, requested_data: { hours: form.hours }, reason: form.reason });
      setMsg({ type: 'success', text: 'Overtime request submitted!' });
      setShowForm(false); setForm({ date: new Date().toISOString().split('T')[0], hours: '', reason: '' });
    } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div><h2 className="attendance-title"><Timer className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Overtime Request</h2><p className="attendance-subtitle">Submit overtime work requests for approval.</p></div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ExportButtons
            data={requests.map((r: any) => ({
              "Date": formatDate(r.date),
              "Hours": r.requested_data?.hours || '--',
              "Reason": r.reason,
              "Status": r.status,
              "Submitted": timeAgo(r.createdAt)
            }))}
            fileName="Overtime_Requests_Log"
            title="Overtime Requests Report"
          />
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Request</button>
        </div>
      </div>
      {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}
      {showForm && (
        <div className="attendance-chart-card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'end' }}>
            <div className="filter-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
            <div className="filter-group"><label>Extra Hours</label><input type="number" step="0.5" min="0.5" value={form.hours} onChange={e => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 2" required /></div>
            <div className="filter-group"><label>Reason</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Project deadline..." required /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary">Submit</button></div>
          </form>
        </div>
      )}
      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Date</th><th>Hours</th><th>Reason</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              : requests.length > 0 ? requests.map((r: any) => (
                <tr key={r.id}><td>{formatDate(r.date)}</td><td><Clock size={12} /> {r.requested_data?.hours || '--'}h</td><td style={{ fontSize: 12, color: '#475569' }}>{r.reason}</td><td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td><td style={{ fontSize: 12, color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td></tr>
              )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No overtime requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OvertimeRequest;
