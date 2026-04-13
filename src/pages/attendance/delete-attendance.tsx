import { useState } from 'react';
import { Filter, Trash2 } from 'lucide-react';
import './attendance.css';
import { useAttendanceRecords, useAttendanceData, formatTime, formatDate, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';
import api from '../../lib/axios';

const DeleteAttendance = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { employees } = useAttendanceData();
  const [empId, setEmpId] = useState('');
  const { records, loading, fetchRecords } = useAttendanceRecords({ date, user_id: empId });
  const [msg, setMsg] = useState<any>(null);

  const handleFilter = () => fetchRecords({ date, user_id: empId });

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete attendance for ${name}?`)) return;
    try {
      await api.delete(`/attendance/${id}`);
      setMsg({ type: 'success', text: `Deleted attendance record successfully.` });
      fetchRecords({ date, user_id: empId });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete' });
    }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Trash2 className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Delete Attendance</h2>
          <p className="attendance-subtitle">Permanently remove invalid punch records.</p>
        </div>
      </div>

      {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}

      <div className="attendance-filters-bar">
        <div className="filter-group"><label>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        <div className="filter-group"><label>Employee</label>
          <select value={empId} onChange={e => setEmpId(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="filter-buttons"><button className="btn-apply" onClick={handleFilter}><Filter size={16} /> Filter List</button></div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Employee</th><th>Date</th><th>In Time</th><th>Out Time</th><th>Status</th><th>Source</th><th>Delete</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              : records.length > 0 ? records.map(row => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(row.user_id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(row.user?.name || '')}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{row.user?.name}</span></div></td>
                  <td style={{ fontSize: 13 }}>{formatDate(row.date)}</td>
                  <td style={{ fontSize: 13 }}>{formatTime(row.in_time)}</td>
                  <td style={{ fontSize: 13 }}>{formatTime(row.out_time)}</td>
                  <td><span className={`badge ${getStatusBadge(row.status)}`}>{row.status}</span></td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{row.source}</td>
                  <td><button className="btn-secondary" style={{ padding: '6px', color: '#ef4444' }} onClick={() => handleDelete(row.id, row.user?.name)}><Trash2 size={16} /></button></td>
                </tr>
              )) : <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeleteAttendance;
