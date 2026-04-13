import { useState } from 'react';
import { Plus, Calendar, Edit3 , Settings2} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import './attendance.css';
import { useAttendanceRequests, formatDate, timeAgo, getStatusBadge } from './useAttendanceHooks';

const AttendanceModification = () => {
  const { requests, loading, submitRequest } = useAttendanceRequests('Modification');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], reason: '', requested_data: { type: 'modify_time', details: '' } });
  const [msg, setMsg] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitRequest({ request_type: 'Modification', date: form.date, reason: form.reason, requested_data: form.requested_data });
      setMsg({ type: 'success', text: 'Modification request submitted!' });
      setShowForm(false); setForm({ ...form, reason: '', requested_data: { type: 'modify_time', details: '' } });
    } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div><h2 className="attendance-title"><Settings2 className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Attendance Modification</h2><p className="attendance-subtitle">Request changes to past attendance records.</p></div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ExportButtons
            data={requests.map((r: any) => ({
              "Date": formatDate(r.date),
              "Type": r.requested_data?.type?.replace('_', ' ') || 'Modification',
              "Reason": r.reason,
              "Status": r.status,
              "Submitted": timeAgo(r.createdAt)
            }))}
            fileName="Attendance_Modification_Requests_Log"
            title="Attendance Modification Requests Report"
          />
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Request</button>
        </div>
      </div>
      {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}
      {showForm && (
        <div className="attendance-chart-card" style={{ marginBottom: 16 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'end' }}>
            <div className="filter-group"><label>Record Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required max={new Date().toISOString().split('T')[0]} /></div>
            <div className="filter-group"><label>Modification Type</label>
              <select value={form.requested_data.type} onChange={e => setForm({ ...form, requested_data: { ...form.requested_data, type: e.target.value } })}>
                <option value="modify_time">Change Punch Time</option>
                <option value="change_status">Change Status</option>
                <option value="remove_flag">Remove Flag</option>
              </select>
            </div>
            <div className="filter-group"><label>Reason & Details</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="E.g. Biometric machine error..." required /></div>
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary">Submit</button></div>
          </form>
        </div>
      )}
      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Date</th><th>Type</th><th>Reason</th><th>Status</th><th>Submitted</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
              : requests.length > 0 ? requests.map((r: any) => (
                <tr key={r.id}><td><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{formatDate(r.date)}</td><td><Edit3 size={12} style={{ display: 'inline', marginRight: 4 }} />{r.requested_data?.type?.replace('_', ' ') || 'Modification'}</td><td style={{ fontSize: 12, color: '#475569' }}>{r.reason}</td><td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td><td style={{ fontSize: 12, color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td></tr>
              )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No modification requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceModification;
