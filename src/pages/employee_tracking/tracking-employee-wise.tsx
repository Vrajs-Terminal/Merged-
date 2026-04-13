import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import {
    Users, Search, Shield, Eye, EyeOff,
    Settings, Bell, Timer, Sun,
    Info, RefreshCcw, Download
, User} from 'lucide-react';
import './employee-tracking.css';

interface TrackedEmployee {
    id: number;
    employeeName: string;
    department: string;
    designation: string;
    trackingEnabled: boolean;
    frequency: number;
    activeHoursOnly: boolean;
    lastUpdate: string;
    status: 'Active' | 'Inactive';
    userId?: number;
}

const TrackingEmployeeWise = () => {
    const [employees, setEmployees] = useState<TrackedEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [globalFrequency, setGlobalFrequency] = useState(5);
    const [globalWorkingHoursOnly, setGlobalWorkingHoursOnly] = useState(true);

    const [departments, setDepartments] = useState<string[]>([]);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (deptFilter) query.append('department', deptFilter);
            if (statusFilter) query.append('status', statusFilter);

            const res = await api.get(`/tracking-config?${query.toString()}`);
            const data = res.data;
            const mappedData: TrackedEmployee[] = (data?.configs || []).map((c: any) => ({
                id: c.userId || c.id || Math.random(),
                userId: c.userId || c.id,
                employeeName: c.name || c.user?.name || 'Unknown',
                department: c.department || c.user?.department || 'N/A',
                designation: c.designation || c.user?.designation || 'N/A',
                trackingEnabled: typeof c.enabled !== 'undefined' ? c.enabled : c.trackingEnabled,
                frequency: c.frequency || 15,
                activeHoursOnly: typeof c.workingHoursOnly !== 'undefined' ? c.workingHoursOnly : c.activeHoursOnly,
                lastUpdate: c.lastUpdate ? new Date(c.lastUpdate).toLocaleString() : new Date().toLocaleString(),
                status: (typeof c.enabled !== 'undefined' ? c.enabled : c.trackingEnabled) ? 'Active' : 'Inactive'
            }));
            setEmployees(mappedData);

            // Extract unique departments for filter
            if (departments.length === 0) {
                const depts = Array.from(new Set(mappedData.map(e => e.department))).filter(Boolean);
                setDepartments(depts as string[]);
            }
        } catch (error) {
            console.error('Failed to fetch configs', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, [deptFilter, statusFilter]);

    const filtered = employees.filter(emp => {
        if (searchQuery && !emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const updateConfig = async (id: number, payload: any) => {
        // Optimistic update
        setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...payload, status: payload.trackingEnabled !== undefined ? (payload.trackingEnabled ? 'Active' : 'Inactive') : e.status } : e));

        try {
            await api.patch(`/tracking-config/${id}`, payload);
            // Silently fail if error, optimistic update stays, could add real error handling later
        } catch (error) {
            console.error('Failed to update config', error);
            fetchConfigs(); // Revert on failure
        }
    };

    const toggleTracking = (id: number, current: boolean) => {
        updateConfig(id, { trackingEnabled: !current });
    };

    const updateFrequency = (id: number, freq: number) => {
        updateConfig(id, { frequency: freq });
    };

    const toggleActiveHours = (id: number, current: boolean) => {
        updateConfig(id, { activeHoursOnly: !current });
    };

    // Note: enableAll/disableAll could be implemented by hitting an endpoint like /api/tracking-config/bulk or looping. 
    // Here we loop for simplicity since it's an admin tool, but ideally needs a bulk endpoint.
    const enableAll = async () => {
        const promises = filtered.map(e => updateConfig(e.id, { trackingEnabled: true }));
        await Promise.all(promises);
    };

    const disableAll = async () => {
        const promises = filtered.map(e => updateConfig(e.id, { trackingEnabled: false }));
        await Promise.all(promises);
    };

    const exportToCSV = async () => {
        try {
            const query = new URLSearchParams();
            if (deptFilter) query.append('department', deptFilter);
            if (statusFilter) query.append('status', statusFilter);

            const res = await api.get(`/tracking-config/export?${query.toString()}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `tracking_config_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed', error);
        }
    };

    const enabledCount = employees.filter(e => e.trackingEnabled).length;
    const disabledCount = employees.filter(e => !e.trackingEnabled).length;

    return (
        <div className="et-container">
            <div className="et-header">
                <div>
                    <h2 className="et-title"><User className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Tracking — Employee Wise</h2>
                    <p className="et-subtitle">Configure per-employee tracking settings, frequency, and privacy rules</p>
                </div>
                <div className="et-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="et-btn-refresh btn-secondary" onClick={fetchConfigs} disabled={loading}>
                        <RefreshCcw size={16} className={loading ? 'fa-spin' : ''} /> Refresh List
                    </button>
                    <button className="btn-secondary" onClick={exportToCSV}>
                        <Download size={16} /> Export
                    </button>
                    <button className="et-btn-success" onClick={enableAll}>
                        <Eye size={16} /> Enable All
                    </button>
                    <button className="et-btn-danger" onClick={disableAll}>
                        <EyeOff size={16} /> Disable All
                    </button>
                </div>
            </div>

            {/* Stats + Global Settings Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Overview Stats */}
                <div className="et-card et-stagger-1">
                    <div className="et-card-header">
                        <h3 className="et-card-title"><Users size={14} style={{ marginRight: 4 }} /> Tracking Overview</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#059669' }}>{enabledCount}</div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Tracking ON</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#dc2626' }}>{disabledCount}</div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Tracking OFF</div>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>{employees.length}</div>
                            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Total</div>
                        </div>
                    </div>
                </div>

                {/* Global Settings */}
                <div className="et-card et-stagger-2">
                    <div className="et-card-header">
                        <h3 className="et-card-title"><Settings size={14} style={{ marginRight: 4 }} /> Global Settings</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Timer size={14} style={{ color: '#3b82f6' }} />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Default Update Frequency</span>
                            </div>
                            <select
                                className="et-form-select"
                                style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
                                value={globalFrequency}
                                onChange={e => setGlobalFrequency(parseInt(e.target.value))}
                            >
                                <option value={5}>Every 5 minutes</option>
                                <option value={10}>Every 10 minutes</option>
                                <option value={15}>Every 15 minutes</option>
                                <option value={30}>Every 30 minutes</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sun size={14} style={{ color: '#f59e0b' }} />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Track only during working hours</span>
                            </div>
                            <label className="et-toggle">
                                <input type="checkbox" checked={globalWorkingHoursOnly} onChange={() => setGlobalWorkingHoursOnly(!globalWorkingHoursOnly)} />
                                <span className="et-toggle-slider"></span>
                            </label>
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Info size={12} /> Recommended: 5 minute interval, working hours only
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Rules Panel */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="et-info-panel et-stagger-3">
                    <h4 className="et-info-title">
                        <Shield size={14} /> Privacy Rules
                    </h4>
                    <ul className="et-info-list">
                        <li>Tracking only during working hours</li>
                        <li>Tracking stops automatically after checkout</li>
                        <li>Employee consent is required before enabling</li>
                        <li>Location data visible only to admin</li>
                        <li>Data retained as per company policy</li>
                    </ul>
                </div>
                <div className="et-info-panel et-info-panel-warning et-stagger-3">
                    <h4 className="et-info-title">
                        <Bell size={14} /> Tracking Update Frequency
                    </h4>
                    <ul className="et-info-list" style={{ listStyle: 'none' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>5 min</span> — Recommended for field employees
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>10 min</span> — Standard for office employees
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>Working hours</span> — Best for battery life
                        </li>
                    </ul>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="et-filters" style={{ marginBottom: 16 }}>
                <div className="et-filter-group" style={{ minWidth: 220 }}>
                    <label>Search Employee</label>
                    <div style={{ position: 'relative' }}>
                        <input type="text" placeholder="Search by name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ paddingLeft: 36, width: '100%', boxSizing: 'border-box' }} />
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    </div>
                </div>
                <div className="et-filter-group">
                    <label>Department</label>
                    <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="et-filter-group">
                    <label>Tracking Status</label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All</option>
                        <option value="Active">Tracking ON</option>
                        <option value="Inactive">Tracking OFF</option>
                    </select>
                </div>
                <div className="et-filter-buttons">
                    <button className="et-btn-danger" onClick={() => { setSearchQuery(''); setDeptFilter(''); setStatusFilter(''); }}>
                        <RefreshCcw size={16} /> Reset All Filters
                    </button>
                </div>
            </div>

            {/* Employee Table */}
            <div className="et-card et-stagger-4">
                <div className="et-card-header">
                    <h3 className="et-card-title">Employee Tracking Configuration ({filtered.length})</h3>
                </div>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading configurations...</div>
                ) : (
                    <div className="et-table-wrap">
                        <table className="et-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Department</th>
                                    <th>Designation</th>
                                    <th>Tracking</th>
                                    <th>Frequency</th>
                                    <th>Working Hours Only</th>
                                    <th>Last Update</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(emp => (
                                    <tr key={emp.id} style={{ opacity: emp.trackingEnabled ? 1 : 0.6 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div className="et-widget-avatar" style={{ background: '#3b82f6', width: 32, height: 32, fontSize: 12 }}>
                                                    {emp.employeeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{emp.employeeName}</div>
                                                    <div style={{ fontSize: 11, color: '#64748b' }}>EMP-{String(emp.userId).padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="et-badge et-badge-blue">{emp.department}</span></td>
                                        <td style={{ fontSize: 12, color: '#475569' }}>{emp.designation}</td>
                                        <td>
                                            <label className="et-toggle">
                                                <input type="checkbox" checked={emp.trackingEnabled} onChange={() => toggleTracking(emp.id, emp.trackingEnabled)} />
                                                <span className="et-toggle-slider"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <select
                                                className="et-form-select"
                                                style={{ width: 'auto', padding: '4px 8px', fontSize: 12, borderRadius: 6 }}
                                                value={emp.frequency}
                                                onChange={e => updateFrequency(emp.id, parseInt(e.target.value))}
                                                disabled={!emp.trackingEnabled}
                                            >
                                                <option value={5}>5 min</option>
                                                <option value={10}>10 min</option>
                                                <option value={15}>15 min</option>
                                                <option value={30}>30 min</option>
                                            </select>
                                        </td>
                                        <td>
                                            <label className="et-toggle">
                                                <input type="checkbox" checked={emp.activeHoursOnly} onChange={() => toggleActiveHours(emp.id, emp.activeHoursOnly)} disabled={!emp.trackingEnabled} />
                                                <span className="et-toggle-slider" style={!emp.trackingEnabled ? { opacity: 0.4 } : {}}></span>
                                            </label>
                                        </td>
                                        <td style={{ fontSize: 12, color: emp.trackingEnabled ? '#475569' : '#94a3b8' }}>
                                            {emp.trackingEnabled && emp.lastUpdate !== 'N/A' ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span className="et-status-dot et-dot-green et-dot-pulse"></span> {emp.lastUpdate}
                                                </div>
                                            ) : 'N/A'}
                                        </td>
                                        <td>
                                            <span className={`et-badge ${emp.trackingEnabled ? 'et-badge-green' : 'et-badge-gray'}`}>
                                                {emp.trackingEnabled ? 'ON' : 'OFF'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                                            No tracking configurations found matching current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackingEmployeeWise;
