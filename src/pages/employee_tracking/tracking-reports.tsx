import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    FileText, Filter, RefreshCcw,
    Route, MapPin, AlertTriangle, Navigation, Clock,
    Building2, BarChart2
} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './employee-tracking.css';

type ReportType = 'movement' | 'distance' | 'field_visit' | 'geofence_violation' | 'travel_summary' | 'branch_inout' | 'timeline';

const reportTypes: { key: ReportType; label: string; icon: any; desc: string }[] = [
    { key: 'movement', label: 'Employee Movement', icon: Route, desc: 'Track employee movement patterns' },
    { key: 'distance', label: 'Distance Report', icon: Navigation, desc: 'Total distance covered by employees' },
    { key: 'field_visit', label: 'Field Visit', icon: MapPin, desc: 'Field visit location and duration' },
    { key: 'geofence_violation', label: 'Geofence Violation', icon: AlertTriangle, desc: 'GPS/Internet On/Off summary' },
    { key: 'travel_summary', label: 'Travel Summary', icon: BarChart2, desc: 'Overall travel analytics' },
    { key: 'branch_inout', label: 'Branch In/Out', icon: Building2, desc: 'Branch-wise entry and exit log' },
    { key: 'timeline', label: 'Timeline Report', icon: Clock, desc: 'Detailed daily timeline' },
];

const TrackingReports = () => {
    const [selectedReport, setSelectedReport] = useState<ReportType>('movement');
    const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
    const [employee, setEmployee] = useState('');
    const [department, setDepartment] = useState('');

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalRecords: 0, totalDistance: 0, alertsCount: 0 });

    const [employeeList, setEmployeeList] = useState<string[]>([]);
    const [departmentList, setDepartmentList] = useState<string[]>([]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (dateFrom) query.append('startDate', dateFrom);
            if (dateTo) query.append('endDate', dateTo);
            if (employee) query.append('employee', employee);
            if (department) query.append('department', department);

            let endpoint = '';
            if (selectedReport === 'geofence_violation') {
                endpoint = `/tracking-exceptions?${query.toString()}`;
            } else {
                endpoint = `/tracking/history?${query.toString()}`;
            }

            const res = await api.get(endpoint);
            const responseData = res.data;

            if (selectedReport === 'geofence_violation') {
                const rawExceptions = responseData?.exceptions || [];
                const exceptions = rawExceptions.map((ex: any) => ({
                    id: ex.id || Math.random(),
                    employeeName: ex.user?.name || ex.employeeName || 'Unknown User',
                    department: ex.user?.department?.name || ex.department || 'N/A',
                    type: ex.type || 'Alert',
                    status: ex.status || 'Pending',
                    severity: ex.severity || 'Medium',
                    timestamp: ex.createdAt ? new Date(ex.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
                    date: ex.createdAt ? new Date(ex.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
                }));

                const uniqueExceptions = exceptions.filter((obj: any, pos: number, arr: any[]) => {
                    const key = obj.id && !obj.id.toString().startsWith('temp-') ? obj.id : `${obj.employeeName}-${obj.date}-${obj.timestamp}-${obj.type}`;
                    return arr.findIndex(m => (m.id && !m.id.toString().startsWith('temp-') ? m.id : `${m.employeeName}-${m.date}-${m.timestamp}-${m.type}`) === key) === pos;
                });

                setData(uniqueExceptions);
                setStats({
                    totalRecords: uniqueExceptions.length,
                    totalDistance: 0,
                    alertsCount: responseData?.counts?.pending || uniqueExceptions.length
                });
            } else {
                const rawLogs = responseData?.dailyMovements || responseData?.logs || [];
                const movements = rawLogs.map((log: any) => ({
                    id: log.id || Math.random(),
                    employeeName: log.user?.name || log.employee || log.employeeName || 'Unknown User',
                    department: log.user?.department?.name || log.department || 'N/A',
                    date: log.timestamp ? new Date(log.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
                    distance: log.distance || '0 km',
                    firstPingTime: log.firstPingTime || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--'),
                    lastPingTime: log.lastPingTime || (log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--:--'),
                    workingTime: log.workingTime || null
                }));

                const uniqueMovements = movements.filter((obj: any, pos: number, arr: any[]) => {
                    const key = obj.id && !obj.id.toString().startsWith('temp-') ? obj.id : `${obj.employeeName}-${obj.date}-${obj.firstPingTime}-${obj.lastPingTime}`;
                    return arr.findIndex(m => (m.id && !m.id.toString().startsWith('temp-') ? m.id : `${m.employeeName}-${m.date}-${m.firstPingTime}-${m.lastPingTime}`) === key) === pos;
                });

                setData(uniqueMovements);

                const distSum = uniqueMovements.reduce((acc: number, curr: any) => {
                    return acc + (parseFloat(curr.distance) || 0);
                }, 0);

                const uniqueDepts = Array.from(new Set(uniqueMovements.map((m: any) => m.department))).filter(Boolean) as string[];
                const uniqueEmps = Array.from(new Set(uniqueMovements.map((m: any) => m.employeeName))).filter(Boolean) as string[];

                if (departmentList.length === 0) setDepartmentList(uniqueDepts);
                if (employeeList.length === 0) setEmployeeList(uniqueEmps);

                setStats({
                    totalRecords: uniqueMovements.length,
                    totalDistance: distSum,
                    alertsCount: 0
                });
            }
        } catch (error) {
            console.error('Failed to fetch report data', error);
            setData([]);
            setStats({ totalRecords: 0, totalDistance: 0, alertsCount: 0 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [selectedReport]);

    const handleGenerate = () => {
        fetchReportData();
    };

    const handleReset = () => {
        setDateFrom(new Date().toISOString().split('T')[0]);
        setDateTo(new Date().toISOString().split('T')[0]);
        setEmployee('');
        setDepartment('');
        setTimeout(fetchReportData, 0);
    };

    const currentReport = reportTypes.find(r => r.key === selectedReport)!;

    const renderTable = () => {
        if (loading) {
            return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Generating report...</div>;
        }

        if (data.length === 0) {
            return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No data found for given parameters.</div>;
        }

        if (selectedReport === 'geofence_violation') {
            return (
                <table className="et-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Date</th>
                            <th>Violation Type</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{row.employeeName}</td>
                                <td><span className="et-badge et-badge-blue">{row.department}</span></td>
                                <td>{row.date}</td>
                                <td>
                                    <span className={`et-badge ${row.type.includes('GPS') ? 'et-badge-gray' : 'et-badge-red'}`}>
                                        {row.type}
                                    </span>
                                </td>
                                <td>{row.timestamp}</td>
                                <td>
                                    <span className={`et-badge ${row.status === 'Approved' ? 'et-badge-green' : row.status === 'Rejected' ? 'et-badge-red' : 'et-badge-amber'}`}>
                                        {row.status}
                                    </span>
                                </td>
                                <td>{row.severity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <table className="et-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Date</th>
                        <th>First Ping</th>
                        <th>Last Ping</th>
                        <th>Distance</th>
                        <th>Locations Visited</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{row.employeeName}</td>
                            <td><span className="et-badge et-badge-blue">{row.department}</span></td>
                            <td>{row.date}</td>
                            <td>{row.firstPingTime}</td>
                            <td>{row.lastPingTime}</td>
                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.distance}</td>
                            <td style={{ textAlign: 'center' }}>{row.workingTime ? 'Multiple' : '0'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h2 className="et-title"><FileText className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Tracking Reports</h2>
                    <p className="et-subtitle">Generate and export employee tracking reports</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ImportButton
                        onImport={(imported) => {
                            console.log('Imported Tracking:', imported);
                            alert(`Imported ${imported.length} records. Backend sync pending.`);
                        }}
                        label="Import Data"
                    />
                    <ExportButtons
                        data={data.map(row => selectedReport === 'geofence_violation' ? ({
                            "Employee": row.employeeName,
                            "Dept": row.department,
                            "Date": row.date,
                            "Type": row.type,
                            "Time": row.timestamp,
                            "Status": row.status,
                            "Severity": row.severity
                        }) : ({
                            "Employee": row.employeeName,
                            "Dept": row.department,
                            "Date": row.date,
                            "First Ping": row.firstPingTime,
                            "Last Ping": row.lastPingTime,
                            "Distance": row.distance
                        }))}
                        fileName={`${selectedReport}_report_${dateFrom}_${dateTo}`}
                        title={`${currentReport.label} Report`}
                    />
                </div>
            </div>

            <div className="et-report-type">
                {reportTypes.map(report => (
                    <div
                        key={report.key}
                        className={`et-report-card ${selectedReport === report.key ? 'active' : ''}`}
                        onClick={() => setSelectedReport(report.key)}
                    >
                        <div className="et-report-card-icon">
                            <report.icon size={18} />
                        </div>
                        <div>
                            <div className="et-report-card-label">{report.label}</div>
                            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{report.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="et-filters">
                <div className="et-filter-group">
                    <label>Date From</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="et-filter-group">
                    <label>Date To</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
                <div className="et-filter-group">
                    <label>Employee</label>
                    <select value={employee} onChange={e => setEmployee(e.target.value)}>
                        <option value="">All Employees</option>
                        {employeeList.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        {departmentList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="et-filter-buttons">
                    <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
                        <Filter size={16} /> {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                    <button className="et-btn-danger" onClick={handleReset}>
                        <RefreshCcw size={16} /> Reset Filters
                    </button>
                </div>
            </div>

            <div className="et-card" style={{ marginBottom: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <currentReport.icon size={20} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{currentReport.label} Report</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>
                            {currentReport.desc} • {dateFrom} to {dateTo}
                        </p>
                    </div>
                </div>
            </div>

            <div className="et-kpi-grid" style={{ marginBottom: 16, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total Records', value: stats.totalRecords, icon: FileText, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Total Distance', value: `${stats.totalDistance.toFixed(2)} km`, icon: Route, color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Avg per Employee', value: stats.totalRecords > 0 ? `${(stats.totalDistance / stats.totalRecords).toFixed(2)} km` : '0 km', icon: Navigation, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Alerts/Violations', value: stats.alertsCount, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
                ].map((stat, i) => (
                    <div key={i} className="et-kpi-card et-stagger-1">
                        <div className="et-kpi-top">
                            <div className="et-kpi-icon" style={{ background: stat.bg, color: stat.color }}>
                                <stat.icon size={18} />
                            </div>
                        </div>
                        <div className="et-kpi-value">{stat.value}</div>
                        <div className="et-kpi-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="et-card et-stagger-2">
                <div className="et-card-header">
                    <h3 className="et-card-title">Report Data</h3>
                </div>
                <div className="et-table-wrap">
                    {renderTable()}
                </div>
            </div>
        </div>
    );
};

export default TrackingReports;
