import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, ChevronRight, ChevronLeft,
  Calendar, Clock, Building, MapPin
, Eye} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './attendance.css';
import api from '../../lib/axios';

const ViewAttendance = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const rowsPerPage = 10;

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let url = '/attendance?';
      if (startDate && endDate) url += `start_date=${startDate}&end_date=${endDate}&`;
      else if (startDate) url += `date=${startDate}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return row.user?.name?.toLowerCase().includes(term) || `EMP-${row.user_id}`.toLowerCase().includes(term);
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentRows = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Present': return 'badge-present';
      case 'Absent': return 'badge-absent';
      case 'Late': return 'badge-late';
      case 'Half Day': return 'badge-halfday';
      case 'Leave': return 'badge-leave';
      default: return 'badge-present';
    }
  };

  const formatTime = (dt: string | null) => {
    if (!dt) return '--';
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dt: string) => new Date(dt).toISOString().split('T')[0];

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><Eye className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />View Attendance</h2>
          <p className="attendance-subtitle">Detailed employee punch logs and daily records.</p>
        </div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px' }}>
          <ImportButton
            onImport={(data) => {
              console.log('Imported Attendance:', data);
              alert(`Parsed ${data.length} records. Integration with attendance API would happen here.`);
            }}
            label="Import Attendance"
          />
          <ExportButtons
            data={filteredData.map(r => ({
              "Employee": r.user?.name,
              "ID": `EMP-${r.user_id}`,
              "Dept": r.user?.department?.name || 'N/A',
              "Branch": r.user?.branch?.name || 'N/A',
              "Date": formatDate(r.date),
              "In Time": formatTime(r.in_time),
              "Out Time": formatTime(r.out_time),
              "Work Hours": r.total_working_hours?.toFixed(1) || '0.0',
              "Status": r.status,
              "Source": r.source
            }))}
            fileName={`Attendance_Report_${startDate || 'all'}_${endDate || 'all'}`}
            title="Attendance Report"
          />
          <button className="btn-primary" onClick={() => navigate('/add-attendance')}>+ Add Record</button>
        </div>
      </div>

      <div className="attendance-filters-bar">
        <div className="filter-group" style={{ flex: '1.5' }}>
          <label>Search Employee</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 12, color: '#64748b' }} />
            <input type="text" placeholder="Name or ID..." style={{ paddingLeft: 34, width: '100%' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        <div className="filter-group">
          <label>From Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>To Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="Leave">On Leave</option>
          </select>
        </div>
        <div className="filter-buttons">
          <button className="btn-apply" onClick={fetchAttendance}><Filter size={16} /> Filter</button>
        </div>
      </div>

      <div className="attendance-table-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Location</th>
                <th>Date</th>
                <th>Punch In & Out</th>
                <th>Total Hours</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
              ) : currentRows.length > 0 ? currentRows.map((row) => {
                const initials = row.user?.name?.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) || '??';
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                return (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: colors[row.user_id % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{row.user?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>EMP-{row.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}><Building size={12} color="#64748b" /> {row.user?.department?.name || 'N/A'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#94a3b8', marginTop: 2 }}><MapPin size={10} /> {row.user?.branch?.name || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0f172a' }}><Calendar size={12} color="#64748b" /> {formatDate(row.date)}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> In: {formatTime(row.in_time)}</span>
                        <span style={{ fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span> Out: {formatTime(row.out_time)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13 }}><Clock size={14} color="#64748b" /> {row.total_working_hours?.toFixed(1) || '0.0'}h</div>
                    </td>
                    <td><span className={`badge ${getStatusBadgeClass(row.status)}`}>{row.status}</span></td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{row.source}</td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No attendance records found. Records will appear once employees start punching in.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredData.length)} of {filteredData.length} entries</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ padding: '6px 10px' }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i} className={currentPage === i + 1 ? "btn-primary" : "btn-secondary"} style={{ padding: '6px 12px', minWidth: 36 }} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="btn-secondary" style={{ padding: '6px 10px' }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAttendance;
