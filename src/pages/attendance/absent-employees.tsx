import { useState } from 'react';
import { Filter, Calendar, MapPin, Building , UserMinus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './attendance.css';
import { useAttendanceRecords, useAttendanceData, formatDate, getInitials, getAvatarColor, getStatusBadge } from './useAttendanceHooks';

const AbsentEmployees = () => {
  const today = new Date().toISOString().split('T')[0];
  const navigate = useNavigate();
  const [date, setDate] = useState(today);
  useAttendanceData();
  const { records, loading, fetchRecords } = useAttendanceRecords({ date, status: 'Absent' });

  const handleFilter = () => fetchRecords({ date, status: 'Absent' });

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><UserMinus className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Absent Employees</h2>
          <p className="attendance-subtitle">View and manage employees who are absent on a specific date.</p>
        </div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ImportButton
            onImport={(data) => {
              console.log('Imported Absentees:', data);
              alert(`Imported ${data.length} records.`);
            }}
            label="Import"
          />
          <ExportButtons
            data={records.map(r => ({
              "Employee": r.user?.name,
              "ID": `EMP-${r.user_id}`,
              "Dept": r.user?.department?.name || 'N/A',
              "Branch": r.user?.branch?.name || 'N/A',
              "Date": formatDate(r.date),
              "Status": r.status
            }))}
            fileName={`Absent_Employees_${date}`}
            title="Absent Employees Report"
          />
          <button className="btn-primary" onClick={() => navigate('/add-attendance')}>Mark Attendance</button>
        </div>
      </div>

      <div className="attendance-filters-bar">
        <div className="filter-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="filter-buttons">
          <button className="btn-apply" onClick={handleFilter}><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0 }}>
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Location & Dept</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              ) : records.length > 0 ? records.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: getAvatarColor(row.user_id), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>
                        {getInitials(row.user?.name || '')}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.user?.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>EMP-{row.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                      <Building size={12} color="#64748b" /> {row.user?.department?.name || 'N/A'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      <MapPin size={10} /> {row.user?.branch?.name || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0f172a' }}>
                      <Calendar size={12} color="#64748b" /> {formatDate(row.date)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(row.status)}`}>{row.status}</span>
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate('/update-attendance')}>
                      Update
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No absent employees found for {date}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AbsentEmployees;
