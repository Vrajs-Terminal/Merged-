import { useState } from 'react';
import { Filter, Download , Edit2} from 'lucide-react';
import './attendance.css';
import { useAttendanceRecords, useAttendanceData, formatTime, formatDate, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';
import api from '../../lib/axios';

const UpdateAttendance = () => {
  const { employees } = useAttendanceData();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [empId, setEmpId] = useState('');
  const { records, loading, fetchRecords } = useAttendanceRecords({ date, user_id: empId });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ in_time: '', out_time: '', status: '', remarks: '' });
  const [msg, setMsg] = useState<any>(null);

  const handleFilter = () => fetchRecords({ date, user_id: empId });

  const startEdit = (row: any) => {
    setEditingId(row.id);
    setEditForm({
      in_time: row.in_time ? new Date(row.in_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
      out_time: row.out_time ? new Date(row.out_time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '',
      status: row.status,
      remarks: row.remarks || ''
    });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/attendance/${editingId}`, editForm);
      setMsg({ type: 'success', text: 'Attendance updated globally' });
      setEditingId(null);
      fetchRecords({ date, user_id: empId });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update' });
    }
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div><h2 className="attendance-title"><Edit2 className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Update Attendance</h2><p className="attendance-subtitle">Modify existing punch records or status.</p></div>
        <div className="attendance-actions"><button className="btn-secondary"><Download size={16} /> Export Logs</button></div>
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
        <div className="filter-buttons"><button className="btn-apply" onClick={handleFilter}><Filter size={16} /> Fetch</button></div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Employee</th><th>Date</th><th>In Time</th><th>Out Time</th><th>Status</th><th>Remarks</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              : records.length > 0 ? records.map(row => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(row.user_id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(row.user?.name || '')}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{row.user?.name}</span></div></td>
                  <td>{formatDate(row.date)}</td>
                  {editingId === row.id ? (
                    <>
                      <td><input type="time" value={editForm.in_time} onChange={e => setEditForm({ ...editForm, in_time: e.target.value })} style={{ width: 100, padding: 4 }} /></td>
                      <td><input type="time" value={editForm.out_time} onChange={e => setEditForm({ ...editForm, out_time: e.target.value })} style={{ width: 100, padding: 4 }} /></td>
                      <td><select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} style={{ padding: 4 }}><option>Present</option><option>Late</option><option>Absent</option><option>Half Day</option></select></td>
                      <td><input type="text" value={editForm.remarks} onChange={e => setEditForm({ ...editForm, remarks: e.target.value })} style={{ width: 100, padding: 4 }} /></td>
                      <td><div style={{ display: 'flex', gap: 6 }}><button className="btn-primary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={handleUpdate}>Save</button><button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setEditingId(null)}>Cancel</button></div></td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontSize: 13 }}>{formatTime(row.in_time)}</td>
                      <td style={{ fontSize: 13 }}>{formatTime(row.out_time)}</td>
                      <td><span className={`badge ${getStatusBadge(row.status)}`}>{row.status}</span></td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{row.remarks}</td>
                      <td><button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => startEdit(row)}>Edit</button></td>
                    </>
                  )}
                </tr>
              )) : <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No records found to update.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdateAttendance;
