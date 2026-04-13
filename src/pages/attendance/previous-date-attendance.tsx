import { useState } from 'react';
import { Download, RefreshCcw, History } from 'lucide-react';
import './attendance.css';
import { useAttendanceRecords, useAttendanceData, formatTime, formatDate, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';

const PreviousDateAttendance = () => {
  const { employees } = useAttendanceData();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const [date, setDate] = useState(yesterday.toISOString().split('T')[0]);
  const [empId, setEmpId] = useState('');
  const { records, loading, fetchRecords } = useAttendanceRecords({ date, user_id: empId });

  const handleFilter = () => fetchRecords({ date, user_id: empId });

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><History className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Previous Date Attendance</h2>
          <p className="attendance-subtitle">Review historical attendance logs for any past date.</p>
        </div>
        <div className="attendance-actions">
          <button className="btn-secondary"><Download size={16} /> Export CSV</button>
          <button className="btn-primary" onClick={handleFilter}><RefreshCcw size={16} /> Reload</button>
        </div>
      </div>

      <div className="attendance-filters-bar">
        <div className="filter-group"><label>Historical Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} /></div>
        <div className="filter-group"><label>Employee</label>
          <select value={empId} onChange={e => setEmpId(e.target.value)}>
            <option value="">All Employees</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="filter-buttons"><button className="btn-apply" onClick={handleFilter}><History size={16} /> Load History</button></div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0 }}>
        <table className="attendance-table">
          <thead><tr><th>Employee</th><th>Date</th><th>In Time</th><th>Out Time</th><th>Source</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              : records.length > 0 ? records.map(row => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(row.user_id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(row.user?.name || '')}</div><div><div style={{ fontSize: 13, fontWeight: 600 }}>{row.user?.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>EMP-{row.user_id}</div></div></div></td>
                  <td>{formatDate(row.date)}</td>
                  <td style={{ fontSize: 13 }}>{formatTime(row.in_time)}</td>
                  <td style={{ fontSize: 13 }}>{formatTime(row.out_time)}</td>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{row.source}</td>
                  <td><span className={`badge ${getStatusBadge(row.status)}`}>{row.status}</span></td>
                </tr>
              )) : <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No historical records found for {date}.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviousDateAttendance;
