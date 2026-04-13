import React, { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    Users,
    Clock,
    Navigation,
    CheckCircle,
    ChevronRight,
    FileText,
    MapPin,
    RefreshCcw
, BarChart} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import api from '../../lib/axios';
import './employee-tracking.css';

const DailyWorkReport: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<any[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    const [designations, setDesignations] = useState<string[]>([]);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        employeeName: '',
        department: 'All Departments',
        designation: 'All Designations',
        status: 'All Status',
        location: '',
        workType: 'All Types'
    });

    const [stats, setStats] = useState({
        totalHours: '0h',
        totalDistance: '0 km',
        activeEmployees: 0,
        completedTasks: 0
    });

    const fetchMetadata = async () => {
        try {
            const [deptRes, desigRes] = await Promise.all([
                api.get('/departments'),
                api.get('/designations')
            ]);
            setDepartments(deptRes.data.map((d: any) => d.name));
            setDesignations(desigRes.data.map((d: any) => d.name));
        } catch (error) {
            console.error('Failed to fetch filter metadata', error);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.date) queryParams.append('date', filters.date);
            if (filters.employeeName) queryParams.append('employeeName', filters.employeeName);
            if (filters.department !== 'All Departments') queryParams.append('department', filters.department);
            if (filters.designation !== 'All Designations') queryParams.append('designation', filters.designation);
            if (filters.status !== 'All Status') queryParams.append('status', filters.status);
            if (filters.location) queryParams.append('location', filters.location);
            if (filters.workType !== 'All Types') queryParams.append('workType', filters.workType);

            const res = await api.get(`/daily-work-reports?${queryParams.toString()}`);
            setReports(res.data);

            if (res.data.length > 0) {
                const totalH = res.data.reduce((acc: number, r: any) => acc + parseFloat(r.totalHours || 0), 0);
                const totalD = res.data.reduce((acc: number, r: any) => acc + parseFloat(r.distance || 0), 0);
                const totalT = res.data.reduce((acc: number, r: any) => acc + (r.tasksCompleted || 0), 0);

                setStats({
                    totalHours: `${totalH.toFixed(1)}h`,
                    totalDistance: `${totalD.toFixed(1)} km`,
                    activeEmployees: res.data.length,
                    completedTasks: totalT
                });
            } else {
                setStats({ totalHours: '0h', totalDistance: '0 km', activeEmployees: 0, completedTasks: 0 });
            }
        } catch (error) {
            console.error('Failed to fetch reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetadata();
    }, []);

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return { bg: '#ecfdf5', color: '#10b981' };
            case 'Rejected': return { bg: '#fef2f2', color: '#ef4444' };
            case 'Correction Requested': return { bg: '#fff7ed', color: '#f97316' };
            default: return { bg: '#eff6ff', color: '#3b82f6' };
        }
    };

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h1 className="et-title"><BarChart className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Daily Work Report</h1>
                    <p className="et-subtitle">Comprehensive tracking for employee field and office activities</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        className="et-btn-refresh btn-secondary"
                        onClick={fetchReports}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh
                    </button>
                    <ImportButton
                        onImport={(data) => {
                            console.log('Imported Data:', data);
                            alert(`Imported ${data.length} records. Integration with backend would happen here.`);
                        }}
                        label="Import"
                    />
                    <ExportButtons
                        data={reports.map(r => ({
                            "Employee": r.employeeName,
                            "Dept": r.department,
                            "Date": r.date,
                            "In": r.checkIn,
                            "Out": r.checkOut,
                            "Hours": r.totalHours,
                            "Dist": r.distance,
                            "Tasks": r.tasksCompleted,
                            "Status": r.status
                        }))}
                        fileName={`Daily_Work_Report_${filters.date}`}
                        title={`Daily Work Report - ${filters.date}`}
                    />
                    <button className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                        <Calendar size={18} />
                        Monthly Report
                    </button>
                </div>
            </div>

            {/* Premium KPI Cards */}
            <div className="et-kpi-grid">
                <div className="et-kpi-card">
                    <div className="et-kpi-top">
                        <div className="et-kpi-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="et-kpi-value">{stats.totalHours}</div>
                        <div className="et-kpi-label">Total Work Hours</div>
                    </div>
                </div>
                <div className="et-kpi-card">
                    <div className="et-kpi-top">
                        <div className="et-kpi-icon" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                            <Navigation size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="et-kpi-value">{stats.totalDistance}</div>
                        <div className="et-kpi-label">Total Distance</div>
                    </div>
                </div>
                <div className="et-kpi-card">
                    <div className="et-kpi-top">
                        <div className="et-kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="et-kpi-value">{stats.completedTasks}</div>
                        <div className="et-kpi-label">Tasks Completed</div>
                    </div>
                </div>
                <div className="et-kpi-card">
                    <div className="et-kpi-top">
                        <div className="et-kpi-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                            <Users size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="et-kpi-value">{stats.activeEmployees}</div>
                        <div className="et-kpi-label">Reporting Employees</div>
                    </div>
                </div>
            </div>

            {/* Premium Filter Bar */}
            <div className="et-filters-premium">
                <div className="filters-header-row">
                    <div className="filters-title">
                        <Users size={18} />
                        Advanced Report Filters
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                            Showing results for {filters.date}
                        </div>
                        <button
                            className="et-btn-danger"
                            style={{ padding: '6px 12px', fontSize: '12px', height: 'auto' }}
                            onClick={() => {
                                setFilters({
                                    date: new Date().toISOString().split('T')[0],
                                    employeeName: '',
                                    department: 'All Departments',
                                    designation: 'All Designations',
                                    status: 'All Status',
                                    location: '',
                                    workType: 'All Types'
                                });
                            }}
                        >
                            <RefreshCcw size={12} /> Reset Filters
                        </button>
                    </div>
                </div>

                <div className="filters-grid">
                    <div className="premium-input-group">
                        <label>Employee Name</label>
                        <div className="premium-input-wrapper">
                            <Search className="premium-input-icon" size={16} />
                            <input
                                type="text"
                                placeholder="Search Name..."
                                className="premium-input"
                                value={filters.employeeName}
                                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="premium-input-group">
                        <label>Location</label>
                        <div className="premium-input-wrapper">
                            <MapPin className="premium-input-icon" size={16} />
                            <input
                                type="text"
                                placeholder="Search Location..."
                                className="premium-input"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="premium-input-group">
                        <label>Report Date</label>
                        <input
                            type="date"
                            className="premium-select"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                            style={{ paddingLeft: '12px' }}
                        />
                    </div>

                    <div className="premium-input-group">
                        <label>Department</label>
                        <select
                            className="premium-select"
                            value={filters.department}
                            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        >
                            <option>All Departments</option>
                            {departments.map((dept, i) => <option key={i}>{dept}</option>)}
                        </select>
                    </div>

                    <div className="premium-input-group">
                        <label>Designation</label>
                        <select
                            className="premium-select"
                            value={filters.designation}
                            onChange={(e) => setFilters({ ...filters, designation: e.target.value })}
                        >
                            <option>All Designations</option>
                            {designations.map((desig, i) => <option key={i}>{desig}</option>)}
                        </select>
                    </div>

                    <div className="premium-input-group">
                        <label>Work Type</label>
                        <select
                            className="premium-select"
                            value={filters.workType}
                            onChange={(e) => setFilters({ ...filters, workType: e.target.value })}
                        >
                            <option>All Types</option>
                            <option>Office</option>
                            <option>Field</option>
                        </select>
                    </div>

                    <div className="premium-input-group">
                        <label>Status</label>
                        <select
                            className="premium-select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option>All Status</option>
                            <option>Pending</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                            <option>Correction Requested</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Premium Table Card */}
            <div className="et-card-premium">
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                        <div className="et-loader" style={{ margin: '0 auto 16px' }}></div>
                        <p style={{ fontWeight: 500 }}>Fetching latest reports...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                        <FileText size={64} style={{ margin: '0 auto 20px', opacity: 0.15 }} />
                        <p style={{ fontSize: '16px', fontWeight: 500 }}>No reports matching your criteria</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your filters or date selection</p>
                    </div>
                ) : (
                    <div className="premium-table-container">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Employee Details</th>
                                    <th>Work Date</th>
                                    <th>Punch Times</th>
                                    <th>Work Duration</th>
                                    <th>Distance</th>
                                    <th>Tasks</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-mini">
                                                    {(report.employeeName || 'U').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="user-name-text">{report.employeeName || 'Unknown Employee'}</div>
                                                    <div className="user-dept-text">{report.department || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{report.date}</td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                                                {report.checkIn} - {report.checkOut}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{report.totalHours}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                                                <Navigation size={14} />
                                                {report.distance}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                                {report.tasksCompleted} Tasks
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className="status-badge-premium"
                                                style={{
                                                    backgroundColor: getStatusStyle(report.status).bg,
                                                    color: getStatusStyle(report.status).color
                                                }}
                                            >
                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getStatusStyle(report.status).color }}></span>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn-view-premium"
                                                    onClick={() => navigate(`/daily-work-report/${report.id}`)}
                                                    title="View Full Details"
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyWorkReport;
