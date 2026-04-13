import { useState } from 'react';
import { Filter , CalendarDays} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import './attendance.css';
import { useAttendanceRecords, getInitials, getAvatarColor } from './useAttendanceHooks';

const MonthWiseAttendance = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { records, loading, fetchRecords } = useAttendanceRecords();


  const handleFilter = () => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const days = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${days}`;
    fetchRecords({ start_date: startDate, end_date: endDate });
  };

  // Group records by employee
  const grouped: any = {};
  records.forEach((r: any) => {
    if (!grouped[r.user_id]) {
      grouped[r.user_id] = { user: r.user, records: [], summary: { present: 0, absent: 0, late: 0, halfDay: 0, totalHours: 0 } };
    }
    grouped[r.user_id].records.push(r);
    if (r.status === 'Present' || r.status === 'Late') grouped[r.user_id].summary.present++;
    if (r.status === 'Absent') grouped[r.user_id].summary.absent++;
    if (r.status === 'Late') grouped[r.user_id].summary.late++;
    if (r.status === 'Half Day') grouped[r.user_id].summary.halfDay++;
    grouped[r.user_id].summary.totalHours += r.total_working_hours || 0;
  });


  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><CalendarDays className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Month Wise Attendance</h2>
          <p className="attendance-subtitle">Monthly attendance summary per employee for {monthNames[month]} {year}.</p>
        </div>
        <div className="attendance-actions">
          <ExportButtons
            data={Object.values(grouped).map((g: any) => ({
              "Employee": g.user?.name,
              "Dept": g.user?.department?.name || 'N/A',
              "Present": g.summary.present,
              "Absent": g.summary.absent,
              "Late": g.summary.late,
              "Half Day": g.summary.halfDay,
              "Total Hours": g.summary.totalHours.toFixed(1)
            }))}
            fileName={`MonthWise_Attendance_${year}_${month}`}
            title="Monthly Attendance Summary"
          />
        </div>
      </div>

      <div className="attendance-filters-bar">
        <div className="filter-group">
          <label>Year</label>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Month</label>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {monthNames.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="filter-buttons">
          <button className="btn-apply" onClick={handleFilter}><Filter size={16} /> Apply</button>
        </div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0, overflow: 'auto' }}>
        <div className="table-responsive">
          <table className="attendance-table" style={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 2 }}>Employee</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Half Day</th>
                <th>Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              ) : Object.keys(grouped).length > 0 ? Object.values(grouped).map((g: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(g.user?.id || idx), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(g.user?.name || '')}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{g.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{g.user?.department?.name || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{g.summary.present}</td>
                  <td style={{ color: '#ef4444', fontWeight: 600 }}>{g.summary.absent}</td>
                  <td style={{ color: '#f59e0b', fontWeight: 600 }}>{g.summary.late}</td>
                  <td style={{ color: '#f97316', fontWeight: 600 }}>{g.summary.halfDay}</td>
                  <td style={{ fontWeight: 600 }}>{g.summary.totalHours.toFixed(1)}h</td>
                </tr>
              )) : (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No records for this month. Click "Apply" to search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MonthWiseAttendance;
