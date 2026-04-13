import { useState, useEffect } from 'react';
import { Search, Download, Printer, Filter, Calendar, Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import api from '../../lib/axios';
import './work-allocation-report.css';
import { toast } from 'react-hot-toast';

const WorkAllocationReport = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filters, setFilters] = useState({
        search: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        fetchReport();
    }, [filters.start_date, filters.end_date]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (filters.start_date) query.append('start_date', filters.start_date);
            if (filters.end_date) query.append('end_date', filters.end_date);

            const res = await api.get(`/work-allocation/reports?${query.toString()}`);
            setReportData(res.data);
        } catch (error) {
            toast.error("Failed to fetch report data");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        toast.error("Export to Excel feature is a premium add-on.", { icon: '💎' });
    };

    const getStatusColor = (status: string, delay: boolean) => {
        if (status === 'Completed') return '#10b981'; // Green
        if (delay) return '#ef4444'; // Red if delayed
        if (status === 'In Progress') return '#3b82f6'; // Blue
        return '#f59e0b'; // Yellow for Pending
    };

    if (loading && !reportData) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Generating Report Analytics...</div>;
    }

    const { summary, employeeStats, details } = reportData || { summary: {}, employeeStats: [], details: [] };

    // Apply client-side search across employee name, task titles etc to the detail table
    const displayTasks = details.filter((t: any) => 
        t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.task_id.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.assignedTo?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.project_sr_no?.toLowerCase().includes(filters.search.toLowerCase())
    );

    return (
        <div className="wa-layout report-mode">
            <div className="wa-container">
                <div className="wa-header hide-print">
                    <div>
                        <h2>Work Allocation Report</h2>
                        <p>Comprehensive analytics on task completion, SLA adherence, and employee true productivity.</p>
                    </div>
                    <div className="header-actions">
                        <div className="date-filter">
                            <Calendar size={14} />
                            <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
                            <span>to</span>
                            <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
                        </div>
                        <button className="btn-secondary" onClick={handleExport}><Download size={16}/> Export</button>
                        <button className="btn-secondary" onClick={handlePrint}><Printer size={16}/> Print</button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="wa-stats-grid">
                    <div className="wa-stat-card r-card">
                        <div className="stat-icon-wrapper i-blue"><Activity size={20}/></div>
                        <div>
                            <p className="stat-title">Total Tasks Assigned</p>
                            <p className="stat-value">{summary?.total || 0}</p>
                        </div>
                    </div>
                    <div className="wa-stat-card r-card">
                        <div className="stat-icon-wrapper i-green"><CheckCircle size={20}/></div>
                        <div>
                            <p className="stat-title">Completed Tasks</p>
                            <div className="split-val">
                                <p className="stat-value">{summary?.completed || 0}</p>
                                <span className="productivity-badge">{summary?.productivity || 0}% Done</span>
                            </div>
                        </div>
                    </div>
                    <div className="wa-stat-card r-card">
                        <div className="stat-icon-wrapper i-red"><AlertTriangle size={20}/></div>
                        <div>
                            <p className="stat-title">Overdue Deliveries</p>
                            <p className="stat-value" style={{color: '#ef4444'}}>{summary?.overdue || 0}</p>
                        </div>
                    </div>
                    <div className="wa-stat-card r-card">
                        <div className="stat-icon-wrapper" style={{background: '#f3e8ff', color: '#9333ea'}}><Clock size={20}/></div>
                        <div>
                            <p className="stat-title">Avg. Turnaround Time</p>
                            <p className="stat-value" style={{fontSize: 20}}>{summary?.avg_time || '0h 0m'}</p>
                        </div>
                    </div>
                </div>

                <div className="report-sections-grid">
                    {/* Employee Performance Leaderboard */}
                    <div className="report-card">
                        <div className="rc-header">
                            <h3>Employee Productivity</h3>
                        </div>
                        <div className="rc-body">
                            <table className="mini-table">
                                <thead>
                                    <tr>
                                        <th>Employee</th>
                                        <th>Assigned / Done</th>
                                        <th>Delay</th>
                                        <th>Avg Time</th>
                                        <th style={{textAlign: 'right'}}>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employeeStats.length === 0 ? (
                                        <tr><td colSpan={5} className="table-loading">No activity found.</td></tr>
                                    ) : employeeStats.map((emp: any) => (
                                        <tr key={emp.employee.id}>
                                            <td>
                                                <div className="emp-row">
                                                    <div className="avatar-xs">{emp.employee.name.charAt(0)}</div>
                                                    <div>
                                                        <div className="e-name">{emp.employee.name}</div>
                                                        <div className="e-role">{emp.employee.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="count-badge">{emp.total} / <span style={{color: '#16a34a'}}>{emp.completed}</span></span></td>
                                            <td>{emp.overdue > 0 ? <span className="delay-badge">{emp.overdue} Tasks</span> : '-'}</td>
                                            <td><span className="time-badge">{emp.avg_time}</span></td>
                                            <td style={{textAlign: 'right'}}>
                                                <div className="prod-score">
                                                    <div className="ps-bar" style={{width: `${emp.productivity}%`, background: emp.productivity > 80 ? '#10b981' : emp.productivity > 50 ? '#f59e0b' : '#ef4444'}}></div>
                                                    <span>{emp.productivity_str}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Detailed Log Table */}
                <div className="wa-table-wrapper" style={{ marginTop: 24 }}>
                    <div className="table-toolbar hide-print">
                        <h3>Detailed Assignment Log</h3>
                        <div className="search-wrapper" style={{ maxWidth: 350 }}>
                            <Search size={14} className="search-icon" />
                            <input 
                                type="text" 
                                className="wa-input search-input" 
                                placeholder="Filter specifics..." 
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                                style={{ padding: '8px 14px 8px 32px', fontSize: 13 }}
                            />
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="wa-table report-table">
                            <thead>
                                <tr>
                                    <th>Sr No / Project</th>
                                    <th>Task ID & Title</th>
                                    <th>Category & SLA</th>
                                    <th>Assignee</th>
                                    <th>Due Date</th>
                                    <th>Completion Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayTasks.length === 0 ? (
                                    <tr><td colSpan={7} className="table-loading">No detailed logs found.</td></tr>
                                ) : displayTasks.map((t: any) => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className="meta-tag">{t.project_sr_no || 'N/A'}</span>
                                            {t.site && <div style={{fontSize: 11, color: '#64748b', marginTop: 4}}>{t.site}</div>}
                                        </td>
                                        <td>
                                            <p className="row-title" style={{fontSize: 13}}>{t.task_id}</p>
                                            <p className="row-desc" style={{fontSize: 13, color: '#1e293b'}}>{t.title}</p>
                                        </td>
                                        <td>
                                            <span className="code-badge">{t.category.code}</span>
                                            <div style={{fontSize: 11, color: '#64748b', marginTop: 4}}>SLA: {t.category.sla_hours} Hrs</div>
                                        </td>
                                        <td>
                                            <div className="emp-row">
                                                <div className="avatar-xs">{t.assignedTo.name.charAt(0)}</div>
                                                <span className="e-name">{t.assignedTo.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: 13, fontWeight: 500, color: t.delay_flag && t.status !== 'Completed' ? '#ef4444' : '#334155' }}>
                                                {new Date(t.due_date).toLocaleDateString('en-GB')}
                                            </span>
                                        </td>
                                        <td>
                                            {t.completion_date ? (
                                                <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>{new Date(t.completion_date).toLocaleDateString('en-GB')}</span>
                                            ) : '-'}
                                        </td>
                                        <td>
                                            <div className="task-status inline" style={{ background: getStatusColor(t.status, t.delay_flag) + '1A', color: getStatusColor(t.status, t.delay_flag) }}>
                                                <span className="dot" style={{ background: getStatusColor(t.status, t.delay_flag) }}></span>
                                                {t.status}
                                            </div>
                                            {t.delay_flag && t.status !== 'Completed' && (
                                                <div style={{fontSize: 10, color: '#ef4444', fontWeight: 700, marginTop: 4, textTransform: 'uppercase'}}>Overdue SLA</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WorkAllocationReport;
