import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    MapPin, Calendar, User, Filter, RefreshCcw,
    Clock, Route, Navigation, ChevronRight
} from 'lucide-react';
import ExportButtons from '../../components/ExportButtons';
import ImportButton from '../../components/ImportButton';
import './employee-tracking.css';

interface HistoryEvent {
    id: number;
    time: string;
    event: string;
    location: string;
    coords: string;
    type: string;
}

interface DailyMovement {
    date: string;
    employee: string;
    department: string;
    distance: string;
    workTime: string;
    locations: number;
    fieldVisits: number;
    timeline: HistoryEvent[];
}

const TrackingHistory = () => {
    // Default to last 7 days
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 6);

    const formatDateObj = (d: Date) => d.toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(formatDateObj(lastWeek));
    const [dateTo, setDateTo] = useState(formatDateObj(today));
    const [employee, setEmployee] = useState('');
    const [department, setDepartment] = useState('');
    const [selectedDayLine, setSelectedDayLine] = useState<DailyMovement | null>(null);

    const [historyData, setHistoryData] = useState<DailyMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [employeesList, setEmployeesList] = useState<string[]>([]);

    const [totals, setTotals] = useState({
        distance: '0 km',
        workTime: '0h 0m',
        locations: 0,
        fieldVisits: 0
    });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFrom) params.append('startDate', dateFrom);
            if (dateTo) params.append('endDate', dateTo);
            if (employee && employee !== 'All Employees') params.append('employeeName', employee);
            if (department && department !== 'All Departments') params.append('department', department);

            const res = await api.get(`/tracking/history?${params.toString()}`);
            const data = res.data;
            const historyRaw = data?.history || data?.logs || [];

            // Defensively map anything that doesn't perfectly match `DailyMovement`
            const history: DailyMovement[] = historyRaw.map((raw: any) => {
                if (raw.timeline && Array.isArray(raw.timeline)) return raw;
                // If it's a raw backend TrackingLog, cast it into a DailyMovement so children don't crash
                return {
                    date: raw.timestamp || raw.createdAt || new Date().toISOString(),
                    employee: raw.user?.name || raw.employee || 'Unknown',
                    department: raw.user?.department?.name || raw.department || 'N/A',
                    distance: '0 km',
                    workTime: '0h',
                    locations: 1,
                    fieldVisits: raw.status === 'Field Visit' ? 1 : 0,
                    timeline: [{
                        id: raw.id || 1,
                        time: new Date(raw.timestamp || new Date()).toLocaleTimeString(),
                        event: raw.status || 'Status Update',
                        location: raw.location || 'Unknown',
                        coords: `${raw.latitude || 0}, ${raw.longitude || 0}`,
                        type: raw.type || 'Event'
                    }]
                };
            });

            setHistoryData(history);
            setTotals(data?.summary || { distance: '0 km', workTime: '0h 0m', locations: 0, fieldVisits: 0 });

            // Extract unique employees for the dropdown if not already set
            if (employeesList.length === 0 && history.length > 0) {
                const uniqueNames = Array.from(new Set(history.map((h: DailyMovement) => h.employee))).filter(Boolean) as string[];
                setEmployeesList(uniqueNames.sort());
            }

            // Select first item by default if available
            if (history.length > 0) {
                setSelectedDayLine(history[0]);
            } else {
                setSelectedDayLine(null);
            }
        } catch (error) {
            console.error('Failed to fetch tracking history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleApplyFilters = () => {
        fetchHistory();
    };

    const resetFilters = () => {
        setDateFrom(formatDateObj(lastWeek));
        setDateTo(formatDateObj(today));
        setEmployee('');
        setDepartment('');
        setTimeout(fetchHistory, 0); // Need to wait for state to update
    };


    const getEventDotColor = (type: string) => {
        const map: Record<string, string> = {
            Working: '#10b981', 'Field Visit': '#8b5cf6', Break: '#f59e0b', Offline: '#94a3b8'
        };
        // Default checkin/checkout colors if type is different
        if (type.toLowerCase().includes('in')) return '#10b981';
        if (type.toLowerCase().includes('out')) return '#ef4444';
        return map[type] || '#3b82f6';
    };

    const summaryStats = [
        { label: 'Total Distance', value: totals.distance, icon: Route, color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Avg Working Time', value: totals.workTime, icon: Clock, color: '#10b981', bg: '#f0fdf4' },
        { label: 'Locations Visited', value: totals.locations, icon: MapPin, color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Field Visits', value: totals.fieldVisits, icon: Navigation, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h2 className="et-title"><MapPin className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Tracking History</h2>
                    <p className="et-subtitle">Employee travel history, daily movement, and distance tracking</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <ImportButton
                        onImport={(imported) => {
                            console.log('Imported History:', imported);
                            alert(`Imported ${imported.length} records. Sync pending.`);
                        }}
                        label="Import"
                    />
                    <ExportButtons
                        data={historyData.map(row => ({
                            "Date": row.date,
                            "Employee": row.employee,
                            "Dept": row.department,
                            "Distance": row.distance,
                            "Work Time": row.workTime,
                            "Locations": row.locations,
                            "Field Visits": row.fieldVisits
                        }))}
                        fileName={`Tracking_History_${dateFrom}_${dateTo}`}
                        title="Tracking History Report"
                    />
                    <button className="et-btn-refresh btn-secondary" onClick={fetchHistory} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
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
                        {employeesList.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Department</label>
                    <select value={department} onChange={e => setDepartment(e.target.value)}>
                        <option value="">All Departments</option>
                        {['Sales', 'Marketing', 'Engineering', 'HR', 'Finance', 'Operations'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="et-filter-buttons">
                    <button className="btn-primary" onClick={handleApplyFilters}>
                        <Filter size={16} /> Apply Filters
                    </button>
                    <button className="et-btn-danger" onClick={resetFilters}>
                        <RefreshCcw size={16} /> Reset Filters
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="et-kpi-grid" style={{ marginBottom: 16 }}>
                {summaryStats.map((stat, i) => (
                    <div key={i} className={`et-kpi-card et-stagger-${i + 1}`}>
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

            {loading && historyData.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading history data...</div>
            ) : historyData.length === 0 ? (
                <div className="et-card" style={{ padding: 40, textAlign: 'center' }}>
                    <div className="et-empty" style={{ margin: 0 }}>
                        <Calendar size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <h3>No Tracking History Found</h3>
                        <p style={{ color: '#64748b' }}>Try adjusting your date range or filters to see results.</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Map + Timeline Row */}
                    {selectedDayLine && (
                        <div className="et-grid-2" style={{ marginBottom: 16 }}>
                            {/* Route Map */}
                            <div className="et-card et-stagger-5">
                                <div className="et-card-header">
                                    <h3 className="et-card-title">
                                        <Route size={14} style={{ marginRight: 4, color: '#3b82f6' }} />
                                        {selectedDayLine.employee}'s Route ({new Date(selectedDayLine.date).toLocaleDateString()})
                                    </h3>
                                </div>
                                <div className="et-map-container">
                                    <div className="et-map-placeholder">
                                        <Navigation size={48} />
                                        <span>Route Visualization</span>
                                        <span style={{ fontSize: 11, color: '#94a3b8' }}>
                                            {selectedDayLine.timeline?.length || 0} waypoints recorded
                                        </span>
                                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                            {[
                                                { label: 'Working', color: '#10b981' },
                                                { label: 'Field Visit', color: '#8b5cf6' },
                                                { label: 'Break', color: '#f59e0b' },
                                            ].map((item, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }}></span>
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="et-card et-stagger-5">
                                <div className="et-card-header">
                                    <h3 className="et-card-title">
                                        <Clock size={14} style={{ marginRight: 4, color: '#8b5cf6' }} /> Day Timeline
                                    </h3>
                                    <span className="et-badge et-badge-blue">{selectedDayLine.timeline?.length || 0} events</span>
                                </div>
                                <div className="et-timeline" style={{ maxHeight: 340, overflowY: 'auto' }}>
                                    {(!selectedDayLine.timeline || selectedDayLine.timeline.length === 0) ? (
                                        <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No timeline events recorded for this day</div>
                                    ) : (selectedDayLine.timeline || []).map((item, i) => (
                                        <div key={i} className="et-timeline-item">
                                            <div className="et-timeline-dot" style={{ background: getEventDotColor(item.type), boxShadow: `0 0 0 2px ${getEventDotColor(item.type)}33` }}></div>
                                            <div className="et-timeline-content">
                                                <div className="et-timeline-time">{item.time}</div>
                                                <div className="et-timeline-title">{item.event}</div>
                                                <div className="et-timeline-desc">
                                                    <MapPin size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                    {item.location}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Daily Movement Table */}
                    <div className="et-card et-stagger-6">
                        <div className="et-card-header">
                            <h3 className="et-card-title">
                                <Calendar size={14} style={{ marginRight: 4, color: '#3b82f6' }} /> Daily Movement Report
                            </h3>
                        </div>
                        <div className="et-table-wrap">
                            <table className="et-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Distance Covered</th>
                                        <th>Working Time</th>
                                        <th>Locations</th>
                                        <th>Field Visits</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {historyData.map((row, i) => (
                                        <tr
                                            key={`${row.date}-${row.employee}-${i}`}
                                            onClick={() => setSelectedDayLine(row)}
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedDayLine?.date === row.date && selectedDayLine?.employee === row.employee ? '#f0f7ff' : ''
                                            }}
                                        >
                                            <td style={{ fontWeight: 500 }}>{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <User size={14} style={{ color: '#64748b' }} />
                                                    <span style={{ fontWeight: 600 }}>{row.employee}</span>
                                                </div>
                                            </td>
                                            <td><span className="et-badge et-badge-blue">{row.department}</span></td>
                                            <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.distance}</td>
                                            <td>{row.workTime}</td>
                                            <td style={{ textAlign: 'center' }}>{row.locations}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                {row.fieldVisits > 0 ? (
                                                    <span className="et-badge et-badge-purple">{row.fieldVisits}</span>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>—</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className={`et-btn-icon ${selectedDayLine?.date === row.date && selectedDayLine?.employee === row.employee ? 'active' : ''}`}>
                                                    <ChevronRight size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TrackingHistory;
