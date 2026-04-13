import { useState } from 'react';
import { Filter, ChevronLeft, ChevronRight , Calendar} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import './attendance.css';
import { useAttendanceRecords, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';

const WeeklyAttendance = () => {
  const getMonday = () => {
    const d = new Date(); const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    return d.toISOString().split('T')[0];
  };
  const [weekStart, setWeekStart] = useState(getMonday());
  const weekEnd = (() => { const d = new Date(weekStart); d.setDate(d.getDate() + 6); return d.toISOString().split('T')[0]; })();
  const { records, loading, fetchRecords } = useAttendanceRecords({ start_date: weekStart, end_date: weekEnd });

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d.toISOString().split('T')[0]); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d.toISOString().split('T')[0]); };

  const handleFilter = () => fetchRecords({ start_date: weekStart, end_date: weekEnd });

  // Group by employee
  const grouped: any = {};
  records.forEach((r: any) => {
    if (!grouped[r.user_id]) grouped[r.user_id] = { user: r.user, days: {} };
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(r.date).getDay()];
    grouped[r.user_id].days[dayName] = r;
  });

  const dayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Calendar className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Weekly Attendance</h2>
          <p className="attendance-subtitle">Week: {weekStart} to {weekEnd}</p>
        </div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-secondary" onClick={prevWeek}><ChevronLeft size={16} /> Prev</button>
          <button className="btn-secondary" onClick={nextWeek}>Next <ChevronRight size={16} /></button>
          <ExportButtons
            data={Object.values(grouped).map((g: any) => {
              const row: any = { "Employee": g.user?.name, "Dept": g.user?.department?.name || 'N/A' };
              dayHeaders.forEach(d => {
                row[d] = g.days[d] ? `${g.days[d].status} (${g.days[d].total_working_hours?.toFixed(1) || 0}h)` : '-';
              });
              return row;
            })}
            fileName={`Weekly_Attendance_${weekStart}_${weekEnd}`}
            title="Weekly Attendance Report"
          />
          <button className="btn-apply" onClick={handleFilter}><Filter size={16} /> Refresh</button>
        </div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0, overflow: 'auto' }}>
        <table className="attendance-table">
          <thead>
            <tr>
              <th style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 2, minWidth: 180 }}>Employee</th>
              {dayHeaders.map(d => <th key={d} style={{ textAlign: 'center', minWidth: 90 }}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</td></tr>
            ) : Object.keys(grouped).length > 0 ? Object.values(grouped).map((g: any, idx: number) => (
              <tr key={idx}>
                <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(g.user?.id || idx), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600 }}>{getInitials(g.user?.name || '')}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{g.user?.name}</div>
                  </div>
                </td>
                {dayHeaders.map(d => {
                  const rec = g.days[d];
                  if (!rec) return <td key={d} style={{ textAlign: 'center', color: '#cbd5e1', fontSize: 11 }}>-</td>;
                  return (
                    <td key={d} style={{ textAlign: 'center' }}>
                      <span className={`badge ${getStatusBadge(rec.status)}`} style={{ fontSize: 10 }}>{rec.status}</span>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{rec.total_working_hours?.toFixed(1) || '0'}h</div>
                    </td>
                  );
                })}
              </tr>
            )) : (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No attendance records for this week.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyAttendance;
