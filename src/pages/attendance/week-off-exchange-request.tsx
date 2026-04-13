import { useState } from 'react';
import { Plus, Calendar, RefreshCw } from 'lucide-react';
import './attendance.css';
import { useAttendanceRequests, formatDate, timeAgo, getStatusBadge } from './useAttendanceHooks';

const WeekOffExchangeRequest = () => {
    const { requests, loading, submitRequest } = useAttendanceRequests('WeekOffExchange');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], requested_data: { exchange_with_date: '' }, reason: '' });
    const [msg, setMsg] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitRequest({ request_type: 'WeekOffExchange', date: form.date, reason: form.reason, requested_data: form.requested_data });
            setMsg({ type: 'success', text: 'Week-off exchange requested!' });
            setShowForm(false); setForm({ ...form, reason: '', requested_data: { exchange_with_date: '' } });
        } catch (err: any) { setMsg({ type: 'error', text: err.response?.data?.error || 'Failed' }); }
    };

    return (
        <div className="attendance-module-container">
            <div className="attendance-header">
                <div><h2 className="attendance-title"><RefreshCw className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Week-Off Exchange</h2><p className="attendance-subtitle">Request to work on a week-off and take another day off.</p></div>
                <div className="attendance-actions"><button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={16} /> New Exchange</button></div>
            </div>
            {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}
            {showForm && (
                <div className="attendance-chart-card" style={{ marginBottom: 16 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 16, alignItems: 'end' }}>
                        <div className="filter-group"><label>Original Week-Off Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                        <div className="filter-group"><label>New Requested Day Off</label><input type="date" value={form.requested_data.exchange_with_date} onChange={e => setForm({ ...form, requested_data: { exchange_with_date: e.target.value } })} required /></div>
                        <div className="filter-group"><label>Reason</label><input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Working on weekend for a release..." required /></div>
                        <div style={{ gridColumn: '1/-1', display: 'flex', gap: 12, justifyContent: 'flex-end' }}><button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="btn-primary">Submit request</button></div>
                    </form>
                </div>
            )}
            <div className="attendance-table-card" style={{ padding: 0 }}>
                <table className="attendance-table">
                    <thead><tr><th>Original Day Off</th><th>Requested Day Off</th><th>Reason</th><th>Status</th><th>Submitted</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
                            : requests.length > 0 ? requests.map((r: any) => (
                                <tr key={r.id}><td><Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />{formatDate(r.date)}</td><td><RefreshCw size={12} style={{ display: 'inline', marginRight: 4, color: '#3b82f6' }} />{formatDate(r.requested_data?.exchange_with_date || '')}</td><td style={{ fontSize: 12, color: '#475569' }}>{r.reason}</td><td><span className={`badge ${getStatusBadge(r.status)}`}>{r.status}</span></td><td style={{ fontSize: 12, color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td></tr>
                            )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No week-off exchange requests.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WeekOffExchangeRequest;
