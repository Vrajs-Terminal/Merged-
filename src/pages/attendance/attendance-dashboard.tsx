import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Clock, CalendarDays,
  Coffee, Home, AlertTriangle,
  Filter, RefreshCcw, ChevronRight, ArrowUpRight
, BarChart2} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './attendance.css';
import api from '../../lib/axios';

const AttendanceDashboard = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [recentPunches, setRecentPunches] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [statsRes, punchesRes, branchRes, deptRes] = await Promise.all([
        api.get(`/attendance/dashboard-stats?date=${date}`),
        api.get(`/attendance?date=${date}`),
        api.get('/branches'),
        api.get('/departments')
      ]);
      setStats(statsRes.data);
      setRecentPunches(punchesRes.data.slice(0, 10));
      setBranches(branchRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error('Failed to fetch attendance data', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApplyFilters = () => {
    fetchData();
  };

  const kpi = {
    total: stats?.total || 0,
    present: stats?.present || 0,
    absent: stats?.absent || 0,
    late: stats?.late || 0,
    onLeave: stats?.onLeave || 0,
    halfDay: stats?.halfDay || 0,
    wfh: stats?.wfh || 0,
    weekOff: stats?.weekOff || 0,
    holiday: stats?.holiday || 0,
    missingPunch: stats?.missingPunch || 0
  };

  const pieData = [
    { name: 'Present', value: kpi.present || 0, color: '#10b981' },
    { name: 'Absent', value: kpi.absent || 0, color: '#ef4444' },
    { name: 'Late', value: kpi.late || 0, color: '#f59e0b' },
    { name: 'On Leave', value: kpi.onLeave || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  if (pieData.length === 0) pieData.push({ name: 'No Data', value: 1, color: '#e2e8f0' });

  const weeklyTrendData = stats?.weeklyTrend || [];

  const formatTime = (dt: string | null) => {
    if (!dt) return '--';
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="attendance-module-container">
      <div className="attendance-header">
        <div>
          <h2 className="attendance-title"><BarChart2 className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Attendance Dashboard</h2>
          <p className="attendance-subtitle">Real-time overview of employee attendance status.</p>
        </div>
        <div className="attendance-actions" style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => navigate('/add-attendance')}>
            Mark Manual Attendance
          </button>
          <ExportButtons
            data={recentPunches.map(r => ({
              "Employee": r.user?.name,
              "ID": `EMP-${r.user_id}`,
              "Dept": r.user?.department?.name || 'N/A',
              "Branch": r.user?.branch?.name || 'N/A',
              "In Time": formatTime(r.in_time),
              "Out Time": formatTime(r.out_time),
              "Status": r.status
            }))}
            fileName={`Attendance_Summary_${date}`}
            title={`Attendance Summary - ${date}`}
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="attendance-filters-bar">
        <div className="filter-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Branch</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Department</label>
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Employee Name</label>
          <input type="text" placeholder="Search..." value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
        </div>
        <div className="filter-buttons">
          <button className="btn-apply" onClick={handleApplyFilters}>
            <Filter size={16} /> Apply
          </button>
          <button className="btn-reset" onClick={() => { setDate(new Date().toISOString().split('T')[0]); setBranch(''); setDepartment(''); setEmployeeName(''); }}>
            <RefreshCcw size={16} /> Reset
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {[
          { title: 'Total Employees', value: kpi.total, icon: Users, color: '#3b82f6', bg: '#eff6ff', changeLabel: 'Active' },
          { title: 'Present', value: kpi.present, icon: UserCheck, color: '#10b981', bg: '#f0fdf4', changeLabel: 'Today' },
          { title: 'Absent', value: kpi.absent, icon: UserX, color: '#ef4444', bg: '#fef2f2', changeLabel: 'Today' },
          { title: 'Late Arrivals', value: kpi.late, icon: Clock, color: '#f59e0b', bg: '#fffbeb', changeLabel: 'Today' },
          { title: 'On Leave', value: kpi.onLeave, icon: CalendarDays, color: '#3b82f6', bg: '#eff6ff', changeLabel: 'Today' },
          { title: 'Half Day', value: kpi.halfDay, icon: Coffee, color: '#f97316', bg: '#fff7ed', changeLabel: 'Today' },
          { title: 'WFH', value: kpi.wfh, icon: Home, color: '#6366f1', bg: '#eef2ff', changeLabel: 'Today' },
          { title: 'Missing Punch', value: kpi.missingPunch, icon: AlertTriangle, color: '#f43f5e', bg: '#fff1f2', changeLabel: 'Alert' },
        ].map((card, index) => (
          <div key={index} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', animation: `fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) ${(index + 1) * 0.08}s forwards`, opacity: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: card.bg, color: card.color }}>
                <card.icon size={16} />
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: 2 }}>
                <ArrowUpRight size={12} strokeWidth={3} /> {card.changeLabel}
              </div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{card.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="attendance-chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Weekly Attendance Trend</h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>Daily present vs absent vs late</p>
            </div>
            <Link to="/view-attendance" style={{ fontSize: 12, color: '#ef4444', textDecoration: 'none', fontWeight: 500 }}>View Report &rarr;</Link>
          </div>
          <div style={{ width: '100%', height: 200, marginTop: 24 }}>
            {weeklyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrendData} stackOffset="sign">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={{ stroke: '#e2e8f0' }} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="Late" fill="#f59e0b" barSize={30} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[0, 0, 4, 4]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 13 }}>No attendance data for this week yet</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20 }}>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span> Present</span>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span> Late</span>
            <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span> Absent</span>
          </div>
        </div>

        <div className="attendance-chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Today's Overview</h3>
            <span style={{ fontSize: 12, color: '#ef4444', textDecoration: 'none', fontWeight: 500 }}>Details &rarr;</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 20, flex: 1 }}>
            <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={42} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
                {kpi.total}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {pieData.filter(d => d.name !== 'No Data').map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                    <span style={{ color: '#475569' }}>{item.name}</span>
                  </div>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            {[
              { label: 'Half Day', value: kpi.halfDay, color: '#f97316' },
              { label: 'WFH', value: kpi.wfh, color: '#6366f1' },
              { label: 'Week Off', value: kpi.weekOff, color: '#64748b' },
              { label: 'Holiday', value: kpi.holiday, color: '#10b981' },
            ].map((b, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: b.color, marginBottom: 2 }}>{b.value}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Punches Table — DYNAMIC */}
      <div className="attendance-table-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Recent Punches</h3>
          <Link to="/view-attendance" style={{ fontSize: 12, color: '#ef4444', textDecoration: 'none', fontWeight: 500 }}>
            View All <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>In Time</th>
                <th>Out Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPunches.length > 0 ? recentPunches.map((r: any) => {
                const initials = r.user?.name?.split(' ').map((p: string) => p[0]).join('').toUpperCase().slice(0, 2) || '??';
                const statusClass = r.status === 'Present' ? 'badge-present' : r.status === 'Late' ? 'badge-late' : r.status === 'Absent' ? 'badge-absent' : 'badge-present';
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{initials}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.user?.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>EMP-{r.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: 12, color: '#475569' }}>{r.user?.department?.name || 'N/A'}</span></td>
                    <td style={{ fontSize: 13 }}>{formatTime(r.in_time)}</td>
                    <td style={{ fontSize: 13 }}>{formatTime(r.out_time)}</td>
                    <td><span className={`badge ${statusClass}`}>{r.status}</span></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    No attendance records for this date. Use "Mark Manual Attendance" to add records.
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

export default AttendanceDashboard;
