import "./dashboard.css";
import {
    PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar
} from 'recharts';
import {
    UserCheck, Clock, UserX, CalendarOff, FileQuestion, MapPinOff, LogOut,
    Receipt, Shuffle, Landmark, Smartphone, Home, History, ScanFace, UserCog,
    PlusCircle, Hourglass, FileText, Users, Briefcase, IndianRupee, ArrowUpRight,
    CheckCircle2, Plus, FileBarChart, Building, Layers
    , LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

const DEPT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#94a3b8', '#8b5cf6', '#ec4899'];

function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchStats();
    }, []);

    // Derive chart data from API response
    const deptData = stats?.departmentSplit || [{ name: 'No Data', value: 100 }];
    const recentEmployees = stats?.recentEmployees || [];
    const recentActivities = stats?.recentActivities || [];
    const totalInDepts = stats?.totalInDepts || stats?.overview?.totalEmployees || 0;

    // Real Data from API
    const hiringData = stats?.hiringTrend || [];
    const attendanceTrend = stats?.attendanceTrend || [];
    const expenseCategories = stats?.expenseAnalysis || [];

    return (
        <div className="dashboard-container">
            {/* Main Content Area */}
            <div className="dashboard-main">
                {/* Dashboard Header */}
                <div className="dashboard-header-title">
                    <div>
                        <h1><LayoutDashboard className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Dashboard Overview</h1>
                        <p>Welcome back! Here is what's happening today across your organization.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="main-stats-grid">
                    <div className="new-stat-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <div className="ns-header">
                            <div className="ns-icon ns-blue"><Users size={16} /></div>
                            <div className="ns-change positive"><ArrowUpRight size={12} strokeWidth={3} /> Active</div>
                        </div>
                        <div className="ns-body">
                            <div className="ns-value">{stats?.overview?.totalEmployees || 0}</div>
                            <div className="ns-title">Total Employees</div>
                        </div>
                        <div className="ns-progress"><div className="ns-progress-fill bg-blue" style={{ width: '100%' }}></div></div>
                    </div>

                    <div className="new-stat-card animate-fade-up" style={{ animationDelay: '0.2s' }}>
                        <div className="ns-header">
                            <div className="ns-icon ns-green"><UserCheck size={16} /></div>
                            <div className="ns-change positive"><ArrowUpRight size={12} strokeWidth={3} /> Today</div>
                        </div>
                        <div className="ns-body">
                            <div className="ns-value">{stats?.overview?.presentToday || 0}</div>
                            <div className="ns-title">Present Today</div>
                        </div>
                        <div className="ns-progress"><div className="ns-progress-fill bg-green" style={{ width: '100%' }}></div></div>
                    </div>

                    <div className="new-stat-card animate-fade-up" style={{ animationDelay: '0.3s' }}>
                        <div className="ns-header">
                            <div className="ns-icon ns-orange"><Building size={16} /></div>
                            <div className="ns-change positive"><ArrowUpRight size={12} strokeWidth={3} /> Active</div>
                        </div>
                        <div className="ns-body">
                            <div className="ns-value">{stats?.counts?.branches || 0}</div>
                            <div className="ns-title">Total Branches</div>
                        </div>
                        <div className="ns-progress"><div className="ns-progress-fill bg-orange" style={{ width: '100%' }}></div></div>
                    </div>

                    <div className="new-stat-card animate-fade-up" style={{ animationDelay: '0.4s' }}>
                        <div className="ns-header">
                            <div className="ns-icon ns-red"><Layers size={16} /></div>
                            <div className="ns-change positive"><ArrowUpRight size={12} strokeWidth={3} /> Active</div>
                        </div>
                        <div className="ns-body">
                            <div className="ns-value">{stats?.counts?.departments || 0}</div>
                            <div className="ns-title">Total Departments</div>
                        </div>
                        <div className="ns-progress"><div className="ns-progress-fill bg-red" style={{ width: '100%' }}></div></div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                    <div className="chart-card hiring-card">
                        <div className="chart-header-new">
                            <div className="ch-info">
                                <h3>Employee Growth</h3>
                                <p>Hiring vs Attrition Trends</p>
                            </div>
                            <a href="#" className="ch-link">Monthly &rarr;</a>
                        </div>
                        <div style={{ width: '100%', height: 220, marginTop: '16px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={hiringData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="hires" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHires)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="exits" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card split-card department-split-card">
                        <div className="chart-header-new">
                            <div className="ch-info">
                                <h3>Department Split</h3>
                                <p>Employee Distribution</p>
                            </div>
                            <a href="#" className="ch-link">Details &rarr;</a>
                        </div>
                        <div className="split-body">
                            <div className="donut-container">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={deptData}
                                            innerRadius={40}
                                            outerRadius={52}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="#fff"
                                            strokeWidth={3}
                                            startAngle={90}
                                            endAngle={-270}
                                            animationDuration={1000}
                                        >
                                            {deptData.map((_entry: any, index: number) => {
                                                const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="donut-center">
                                    <span className="center-value">{totalInDepts}</span>
                                </div>
                            </div>
                            <div className="split-legend">
                                {deptData.slice(0, 3).map((dept: any, i: number) => (
                                    <div className="split-legend-item" key={i}>
                                        <div className="sl-left">
                                            <span className="sl-dot" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}></span>
                                            <span className="sl-name">{dept.name}</span>
                                        </div>
                                        <span className="sl-val">{dept.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <hr className="chart-divider" />

                        <div className="split-status-grid">
                            <div className="status-item">
                                <div className="si-value blue-text">{stats?.overview?.onLeave || 0}</div>
                                <div className="si-label">On Leave</div>
                            </div>
                            <div className="status-item">
                                <div className="si-value green-text">{stats?.overview?.presentToday || 0}</div>
                                <div className="si-label">Present</div>
                            </div>
                            <div className="status-item">
                                <div className="si-value orange-text">{stats?.overview?.lateToday || 0}</div>
                                <div className="si-label">Late</div>
                            </div>
                            <div className="status-item">
                                <div className="si-value red-text">{stats?.overview?.absentToday || 0}</div>
                                <div className="si-label">Absent</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Second Row of Charts */}
                <div className="charts-row" style={{ marginTop: '24px' }}>
                    <div className="chart-card hiring-card">
                        <div className="chart-header-new">
                            <div className="ch-info">
                                <h3>Attendance Trend</h3>
                                <p>Weekly Participation</p>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 220, marginTop: '16px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                                    <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                                    <Bar dataKey="late" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card split-card">
                        <div className="chart-header-new">
                            <div className="ch-info">
                                <h3>Expense Analysis</h3>
                                <p>Weekly Disbursement</p>
                            </div>
                        </div>
                        <div className="split-body" style={{ height: '220px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseCategories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={0}
                                        outerRadius={70}
                                        fill="#8884d8"
                                        paddingAngle={0}
                                        dataKey="value"
                                    >
                                        {expenseCategories.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="bottom-row">
                    {/* Recent Employees — DYNAMIC */}
                    <div className="bottom-card recent-employees-card">
                        <div className="chart-header-new">
                            <h3>Recent Employees</h3>
                            <a href="#" className="ch-link">View All &rarr;</a>
                        </div>
                        <div className="re-table-wrapper">
                            <table className="re-table">
                                <thead>
                                    <tr>
                                        <th>EMPLOYEE</th>
                                        <th>DEPT</th>
                                        <th>STATUS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEmployees.length > 0 ? recentEmployees.map((emp: any) => (
                                        <tr key={emp.id}>
                                            <td>
                                                <div className="emp-info">
                                                    <div className="emp-avatar" style={{ backgroundColor: emp.avatarColor }}>{emp.initials}</div>
                                                    <div className="emp-name-role">
                                                        <div className="emp-name">{emp.name}</div>
                                                        <div className="emp-role">{emp.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="emp-dept">{emp.dept}</span></td>
                                            <td><span className="emp-status" style={{ color: emp.statusColor }}>{emp.status}</span></td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No employees added yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payroll Summary */}
                    <div className="bottom-card payroll-card">
                        <div className="chart-header-new">
                            <h3>Payroll Summary</h3>
                            <a href="#" className="ch-link">Run Payroll &rarr;</a>
                        </div>
                        <div className="ps-list">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
                                <div>
                                    <IndianRupee size={28} style={{ marginBottom: 8, opacity: 0.3 }} />
                                    <p>Payroll module coming soon</p>
                                    <p style={{ fontSize: 11, marginTop: 4 }}>{stats?.overview?.totalEmployees || 0} employees on roster</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity — DYNAMIC */}
                    <div className="bottom-card activity-card">
                        <div className="chart-header-new" style={{ marginBottom: '16px' }}>
                            <h3>Recent Activity</h3>
                        </div>
                        <div className="ra-list">
                            {recentActivities.length > 0 ? recentActivities.map((activity: any) => (
                                <div className="ra-item" key={activity.id}>
                                    <div className="ra-icon bg-light-blue"><CheckCircle2 size={14} color="#3b82f6" /></div>
                                    <div className="ra-info">
                                        <p><strong>{activity.action}</strong></p>
                                        <span>{activity.user} · {activity.time}</span>
                                    </div>
                                </div>
                            )) : (
                                <p style={{ color: '#94a3b8', fontSize: '13px' }}>No recent activity.</p>
                            )}
                        </div>
                    </div>

                    <div className="bottom-card quick-actions-card">
                        <div className="chart-header-new" style={{ marginBottom: '16px' }}>
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="qa-grid">
                            <button className="qa-btn" onClick={() => navigate('/admin-rights')}>
                                <Plus size={16} color="#64748b" />
                                <span>Add Employee</span>
                            </button>
                            <button className="qa-btn" onClick={() => navigate('/payroll/run')}>
                                <IndianRupee size={16} color="#64748b" />
                                <span>Run Payroll</span>
                            </button>
                            <button className="qa-btn" onClick={() => navigate('/add-attendance')}>
                                <Briefcase size={16} color="#64748b" />
                                <span>Add Attendance</span>
                            </button>
                            <button className="qa-btn" onClick={() => navigate('/tracking-reports')}>
                                <FileBarChart size={16} color="#64748b" />
                                <span>Reports</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Right Panel: Attendance Status — DYNAMIC */}
            <div className="dashboard-right">
                <div className="section-header">Today Attendance Status & Pending Status</div>
                <div className="attendance-grid">
                    {[
                        { label: "Present", value: stats?.overview?.presentToday || 0, icon: UserCheck },
                        { label: "Late In", value: stats?.overview?.lateToday || 0, icon: Clock },
                        { label: "Absent", value: stats?.overview?.absentToday || 0, icon: UserX },
                        { label: "On Leave", value: stats?.overview?.onLeave || 0, icon: CalendarOff },
                        { label: "Half Day", value: stats?.overview?.halfDay || 0, icon: FileQuestion },
                        { label: "Missing Punch", value: stats?.overview?.missingPunch || 0, icon: MapPinOff },
                        { label: "Punch Out Missing", value: stats?.overview?.missingPunch || 0, icon: LogOut },
                        { label: "Pending Expenses", value: stats?.overview?.pendingExpenses || 0, icon: Receipt },
                        { label: "Shift Change", value: stats?.overview?.shiftChanges || 0, icon: Shuffle },
                        { label: "Bank Change", value: stats?.overview?.bankChanges || 0, icon: Landmark },
                        { label: "Device Change", value: stats?.overview?.deviceChanges || 0, icon: Smartphone },
                        { label: "WFH Request", value: stats?.overview?.wfhRequests || 0, icon: Home },
                        { label: "Past Attendance", value: stats?.overview?.pastAttendance || 0, icon: History },
                        { label: "Face Change", value: stats?.overview?.faceChanges || 0, icon: ScanFace },
                        { label: "Profile Change", value: stats?.overview?.profileChanges || 0, icon: UserCog },
                        { label: "Overtime Request", value: stats?.overview?.overtimeRequests || 0, icon: PlusCircle },
                        { label: "Short Leave", value: stats?.overview?.shortLeaves || 0, icon: Hourglass },
                        { label: "Tax Document", value: stats?.overview?.taxDocs || 0, icon: FileText },
                    ].map((item, index) => (
                        <div key={index} className="attendance-card" onClick={() => {
                            const currentMonth = new Date().toLocaleString('default', { month: '2-digit' });
                            const currentYear = new Date().getFullYear();
                            navigate(`/attendance/pending-attendance?month=${currentYear}-${currentMonth}&filter=${encodeURIComponent(item.label)}`);
                        }} style={{ cursor: 'pointer' }}>
                            <div className="attn-icon-box">
                                <item.icon size={16} />
                            </div>
                            <div className="attn-info">
                                <div className="attn-label">{item.label} ({new Date().toLocaleString('default', { month: 'short' })})</div>
                                <div className="attn-value">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
