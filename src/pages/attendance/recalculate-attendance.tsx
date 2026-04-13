import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle , Calculator} from 'lucide-react';
import './attendance.css';
import { useAttendanceData } from './useAttendanceHooks';
import api from '../../lib/axios';

const RecalculateAttendance = () => {
  const { employees } = useAttendanceData();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [empId, setEmpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<any>(null);

  const handleRecalculate = async () => {
    if (!startDate || !endDate) return setMsg({ type: 'error', text: 'Select start and end dates' });
    if (new Date(startDate) > new Date(endDate)) return setMsg({ type: 'error', text: 'Start date must be before end date' });

    setLoading(true); setMsg(null);
    try {
      const payload: any = { start_date: startDate, end_date: endDate };
      if (empId) payload.user_id = empId;

      const res = await api.post('/attendance/recalculate', payload);
      setMsg({ type: 'success', text: res.data.message });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to recalculate' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Calculator className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Recalculate Attendance</h2>
          <p className="attendance-subtitle">Re-evaluate working hours, late minutes, and overtime based on latest shift rules.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div className="attendance-chart-card">
          {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="filter-group"><label>From Date *</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
              <div className="filter-group"><label>To Date *</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} /></div>
            </div>

            <div className="filter-group"><label>Specific Employee (Optional)</label>
              <select value={empId} onChange={e => setEmpId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
                <option value="">All Employees</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} (EMP-{e.id})</option>)}
              </select>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="btn-secondary" onClick={() => window.history.back()}>Cancel</button>
              <button className="btn-primary" onClick={handleRecalculate} disabled={loading}><RefreshCw size={16} /> {loading ? 'Recalculating...' : 'Start Recalculation'}</button>
            </div>
          </div>
        </div>

        <div className="attendance-chart-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>How it Works</h3>
          <div><h4 style={{ color: '#2563eb', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><CheckCircle size={16} /> Automation</h4><p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>The system will fetch all punch records in the date range and re-apply the employee's <strong>current shift rules</strong>.</p></div>
          <div><h4 style={{ color: '#d97706', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><AlertTriangle size={16} /> Impact</h4><p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>This will overwrite existing calculated Total Hours, Late status, and Overtime values. Use carefully after fixing shift configurations.</p></div>
        </div>
      </div>
    </div>
  );
};

export default RecalculateAttendance;
