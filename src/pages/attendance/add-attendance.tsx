import { useState, useEffect } from 'react';
import {
  Clock, CalendarDays, User, Building,
  Save, Watch, AlertTriangle, Info
, PlusCircle} from 'lucide-react';
import './attendance.css';
import api from '../../lib/axios';

const AddAttendance = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [lateReason, setLateReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/attendance/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to fetch employees', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !inTime) {
      setMessage({ type: 'error', text: 'Please select an employee and enter punch-in time' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/attendance/manual', {
        user_id: employeeId,
        date,
        in_time: inTime,
        out_time: outTime || undefined,
        remarks: lateReason || undefined
      });
      setMessage({ type: 'success', text: 'Manual attendance added successfully!' });
      setEmployeeId('');
      setInTime('');
      setOutTime('');
      setLateReason('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to add attendance' });
    } finally {
      setLoading(false);
    }
  };

  const selectedEmp = employees.find(e => e.id === parseInt(employeeId));

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><PlusCircle className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Add Manual Attendance</h2>
          <p className="attendance-subtitle">Manually override or insert a missing punch record for an employee.</p>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', color: message.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13, fontWeight: 500 }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'stretch' }}>
        <div className="attendance-chart-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="filter-group" style={{ width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={14} color="#3b82f6" /> Select Employee *
              </label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required style={{ width: '100%', padding: '12px 14px' }}>
                <option value="">-- Search and Select Employee --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.department?.name || 'No Dept'})</option>
                ))}
              </select>
              {selectedEmp && (
                <span style={{ fontSize: 12, color: '#3b82f6', marginTop: 4 }}>
                  Branch: {selectedEmp.branch?.name || 'N/A'} | Shift: {selectedEmp.shift?.name || 'No shift assigned'} {selectedEmp.shift ? `(${selectedEmp.shift.start_time} - ${selectedEmp.shift.end_time})` : ''}
                </span>
              )}
            </div>

            <div className="filter-group" style={{ width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarDays size={14} color="#10b981" /> Punch Date *
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '12px 14px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="filter-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={14} color="#f59e0b" /> Punch In Time *
                </label>
                <input type="time" value={inTime} onChange={(e) => setInTime(e.target.value)} required style={{ width: '100%', padding: '12px 14px' }} />
              </div>
              <div className="filter-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Watch size={14} color="#ef4444" /> Punch Out Time
                </label>
                <input type="time" value={outTime} onChange={(e) => setOutTime(e.target.value)} style={{ width: '100%', padding: '12px 14px' }} />
                <span style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>(Leave blank if currently working)</span>
              </div>
            </div>

            <div className="filter-group" style={{ width: '100%' }}>
              <label>Admin Remarks / Late Reason</label>
              <textarea value={lateReason} onChange={(e) => setLateReason(e.target.value)} placeholder="Why is this punch being manually added?" style={{ width: '100%', padding: '12px 14px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '8px', outline: 'none', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }} />
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" className="btn-secondary" onClick={() => window.history.back()}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }} disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save Manual Punch'}
              </button>
            </div>
          </form>
        </div>

        <div className="attendance-chart-card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>Help & Guidelines</h3>
          <div>
            <h4 style={{ color: '#2563eb', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Info size={16} /> System Note</h4>
            <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>Adding a manual record automatically calculates <strong>Total Hours</strong>, <strong>Latency</strong>, and standard <strong>Deductions</strong> based on Shift rules.</p>
          </div>
          <div>
            <h4 style={{ color: '#d97706', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><AlertTriangle size={16} /> Warning</h4>
            <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>Manual punches bypass Biometric and Geolocation validation. This action will be securely logged.</p>
          </div>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginTop: 'auto' }}>
            <h4 style={{ color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}><Building size={16} /> Quick Steps</h4>
            <ul style={{ color: '#475569', fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 16 }}>
              <li>Select the employee</li>
              <li>Set the correct date & times</li>
              <li>Add a reason for the audit trail</li>
              <li>Click <strong>Save</strong> to submit</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAttendance;
