import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Download, Filter, FileText, Users, MapPin, 
    Calendar, Clock, CheckCircle, RefreshCcw, FileOutput, Briefcase 
} from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Visit {
    id: number;
    user: { name: string; department: { name: string } | null };
    client_name: string;
    company_name: string;
    country: string | null;
    state: string | null;
    city: string | null;
    area: string | null;
    date: string;
    check_in_time: string | null;
    check_out_time: string | null;
    status: string;
}

const VisitReports = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [productivity, setProductivity] = useState<any>({});
    const [loading, setLoading] = useState(false);
    
    // Report Tabs
    const [activeTab, setActiveTab] = useState<'Daily' | 'Employee' | 'Client' | 'Productivity'>('Daily');

    // Filters
    const [filters, setFilters] = useState({
        employee_id: '',
        country: '',
        state: '',
        city: '',
        area: '',
        date_from: '',
        date_to: new Date().toISOString().split('T')[0],
        status: ''
    });

    const [options, setOptions] = useState<any>({ employees: [], countries: [], states: [], cities: [], areas: [] });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await api.get('/visit-reports/filter-options');
                setOptions(res.data);
            } catch (e) {
                console.error("Failed loading filter options", e);
            }
        };
        fetchFilters();
        
        // Auto-set Date_from to 7 days ago initially for better report look
        const start = new Date();
        start.setDate(start.getDate() - 7);
        setFilters(f => ({ ...f, date_from: start.toISOString().split('T')[0] }));
    }, []);

    // Fetch reports when filters or tab changes
    useEffect(() => {
        if (filters.date_from) {
            fetchReport();
        }
    }, [filters, activeTab]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get('/visit-reports', { params: filters });
            setVisits(res.data.data);
            setProductivity(res.data.productivity);
        } catch (error) {
            toast.error("Failed to compile analytics payload");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: any) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        setFilters({
            employee_id: '', country: '', state: '', city: '', area: '', 
            date_from: start.toISOString().split('T')[0], 
            date_to: new Date().toISOString().split('T')[0], 
            status: ''
        });
    };

    // Export utilities
    const exportCSV = () => {
        if (visits.length === 0) return toast.error("No data to export");
        const headers = ["ID", "Employee", "Department", "Client", "Company", "Country", "State", "City", "Area", "Date", "Check In", "Check Out", "Status"];
        const rows = visits.map(v => [
            v.id,
            `"${v.user.name}"`,
            `"${v.user.department?.name || 'N/A'}"`,
            `"${v.client_name}"`,
            `"${v.company_name || 'N/A'}"`,
            `"${v.country || ''}"`,
            `"${v.state || ''}"`,
            `"${v.city || ''}"`,
            `"${v.area || ''}"`,
            new Date(v.date).toLocaleDateString(),
            v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString() : '',
            v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString() : '',
            v.status
        ]);
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Visit_Report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Excel/CSV File Downloaded!");
    };

    const exportPDF = () => {
        window.print();
    };

    const formatMetrics = (val: number, isPercent = false) => {
        if (isNaN(val)) return "0";
        return isPercent ? val.toFixed(1) + "%" : val.toString();
    };

    return (
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }} className="report-container">
            
            {/* Header & Export Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }} className="no-print">
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <BarChart3 color="#4f46e5" /> Reports & Analytics
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                        Monitor field outcomes, extract insights, and measure employee productivity natively.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="export-btn outline" onClick={exportPDF}>
                        <FileText size={16}/> Export PDF
                    </button>
                    <button className="export-btn filled" onClick={exportCSV}>
                        <FileOutput size={16}/> Export Excel
                    </button>
                    <button className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <Filter size={16}/> Smart Filters {Object.values(filters).filter(Boolean).length > 2 && <span className="filter-badge"></span>}
                    </button>
                </div>
            </div>

            {/* Smart Filters Panel */}
            {isFilterOpen && (
                <div className="filter-panel fade-in no-print" style={{ marginBottom: 24, padding: 20, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Advanced Location & Data Filters</h4>
                        <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset All</button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                        <div className="filter-group">
                            <label>Date From</label>
                            <input type="date" name="date_from" value={filters.date_from} onChange={handleFilterChange} />
                        </div>
                        <div className="filter-group">
                            <label>Date To</label>
                            <input type="date" name="date_to" value={filters.date_to} onChange={handleFilterChange} />
                        </div>
                        <div className="filter-group">
                            <label>Employee</label>
                            <select name="employee_id" value={filters.employee_id} onChange={handleFilterChange}>
                                <option value="">All Employees</option>
                                {options.employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Status</label>
                            <select name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">All Statuses</option>
                                <option value="Planned">Planned</option>
                                <option value="Checked-In">Checked-In</option>
                                <option value="Completed">Completed</option>
                                <option value="Pending Approval">Pending Approval</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Country</label>
                            <select name="country" value={filters.country} onChange={handleFilterChange}>
                                <option value="">All Regions</option>
                                {options.countries.map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>State</label>
                            <select name="state" value={filters.state} onChange={handleFilterChange}>
                                <option value="">All States</option>
                                {options.states.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>City</label>
                            <select name="city" value={filters.city} onChange={handleFilterChange}>
                                <option value="">All Cities</option>
                                {options.cities.map((c: string) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Area</label>
                            <select name="area" value={filters.area} onChange={handleFilterChange}>
                                <option value="">All Areas</option>
                                {options.areas.map((a: string) => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Tabs */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }} className="tabs-container no-print">
                <button className={`tab-btn ${activeTab === 'Daily' ? 'active' : ''}`} onClick={() => setActiveTab('Daily')}>
                    <Calendar size={18}/> Daily Visit Report
                </button>
                <button className={`tab-btn ${activeTab === 'Employee' ? 'active' : ''}`} onClick={() => setActiveTab('Employee')}>
                    <Users size={18}/> Employee Visit Report
                </button>
                <button className={`tab-btn ${activeTab === 'Client' ? 'active' : ''}`} onClick={() => setActiveTab('Client')}>
                    <MapPin size={18}/> Client Visit History
                </button>
                <button className={`tab-btn ${activeTab === 'Productivity' ? 'active' : ''}`} onClick={() => setActiveTab('Productivity')}>
                    <BarChart3 size={18}/> Visit Productivity Report
                </button>
            </div>

            {/* Master Report View Area */}
            <div style={{ flex: 1, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Dashboard Print Header */}
                <div className="print-only" style={{ padding: 24, borderBottom: '1px solid #e2e8f0' }}>
                    <h2>{activeTab} Visit Report</h2>
                    <p>Period: {filters.date_from} to {filters.date_to}</p>
                </div>

                {/* Productivity KPI Header (Shows only on Productivity Tab or in Print) */}
                {(activeTab === 'Productivity') && (
                    <div style={{ padding: 24, background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                        <div className="kpi-card">
                            <div className="icon-wrap blue"><Briefcase size={20}/></div>
                            <div className="kpi-info">
                                <span>Total Visits</span>
                                <h3>{formatMetrics(productivity?.total_visits)}</h3>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="icon-wrap green"><CheckCircle size={20}/></div>
                            <div className="kpi-info">
                                <span>Completed</span>
                                <h3>{formatMetrics(productivity?.completed_visits)} / {formatMetrics(productivity?.planned_visits)}</h3>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="icon-wrap orange"><RefreshCcw size={20}/></div>
                            <div className="kpi-info">
                                <span>Execution Rate</span>
                                <h3>{formatMetrics(productivity?.completion_rate, true)}</h3>
                            </div>
                        </div>
                        <div className="kpi-card">
                            <div className="icon-wrap purple"><Clock size={20}/></div>
                            <div className="kpi-info">
                                <span>Total Time Spent</span>
                                <h3>{formatMetrics(productivity?.total_time_spent_minutes)} mins</h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Logic Mapping */}
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                            <tr>
                                {activeTab === 'Client' ? (
                                    <>
                                        <th style={thStyle}>Client / Company</th>
                                        <th style={thStyle}>Date & Status</th>
                                        <th style={thStyle}>Location Node</th>
                                        <th style={thStyle}>Assigned Executive</th>
                                    </>
                                ) : activeTab === 'Employee' || activeTab === 'Productivity' ? (
                                    <>
                                        <th style={thStyle}>Employee Details</th>
                                        <th style={thStyle}>Assigned Visit</th>
                                        <th style={thStyle}>Time Spent</th>
                                        <th style={thStyle}>Status</th>
                                        <th style={thStyle}>Location</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={thStyle}>Date</th>
                                        <th style={thStyle}>Employee</th>
                                        <th style={thStyle}>Retailer</th>
                                        <th style={thStyle}>In/Out Time</th>
                                        <th style={thStyle}>Status</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Compiling Aggregated Analytics...</td></tr>
                            ) : visits.length === 0 ? (
                                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No data points matched the current filter matrix.</td></tr>
                            ) : (
                                visits.map(v => (
                                    <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }} className="table-row">
                                        
                                        {/* Row Output mapped organically to selected paradigm */}
                                        {activeTab === 'Client' ? (
                                            <>
                                                <td style={tdStyle}><span style={stBold}>{v.client_name}</span><br/><span style={stSub}>{v.company_name}</span></td>
                                                <td style={tdStyle}>{new Date(v.date).toDateString()}<br/><span style={stSub}>{v.status}</span></td>
                                                <td style={tdStyle}>{v.city || 'N/A'}{v.state ? `, ${v.state}` : ''}</td>
                                                <td style={tdStyle}>{v.user.name}</td>
                                            </>
                                        ) : activeTab === 'Employee' || activeTab === 'Productivity' ? (
                                            <>
                                                <td style={tdStyle}><span style={stBold}>{v.user.name}</span><br/><span style={stSub}>{v.user.department?.name}</span></td>
                                                <td style={tdStyle}>{v.client_name}</td>
                                                <td style={tdStyle}>
                                                    {v.check_in_time ? (
                                                        <><Clock size={12}/> {new Date(v.check_in_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {v.check_out_time ? new Date(v.check_out_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Active'}</>
                                                    ) : 'Not Started'}
                                                </td>
                                                <td style={tdStyle}>{v.status}</td>
                                                <td style={tdStyle}>{v.city || '--'}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td style={tdStyle}>{new Date(v.date).toDateString()}</td>
                                                <td style={tdStyle}><span style={stBold}>{v.user.name}</span></td>
                                                <td style={tdStyle}>{v.client_name}</td>
                                                <td style={tdStyle}>{v.check_in_time ? new Date(v.check_in_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '---'}</td>
                                                <td style={tdStyle}>{v.status}</td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>
                {`
                    /* Print Mode Styles */
                    @media print {
                        .no-print { display: none !important; }
                        .report-container { background: white !important; padding: 0 !important; }
                        * { box-shadow: none !important; border-color: #000 !important; }
                        .print-only { display: block !important; }
                        table { width: 100% !important; border: 1px solid #000 !important; }
                        th, td { border: 1px solid #000 !important; padding: 8px !important; }
                    }
                    .print-only { display: none; }

                    .export-btn { padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.2s; }
                    .export-btn.outline { border: 1px solid #cbd5e1; background: white; color: #475569; }
                    .export-btn.outline:hover { background: #f8fafc; border-color: #94a3b8; color: #1e293b; }
                    .export-btn.filled { border: none; background: #10b981; color: white; }
                    .export-btn.filled:hover { background: #059669; }

                    .filter-toggle-btn { padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; border: 1px solid #cbd5e1; background: white; color: #0f172a; position: relative; transition: 0.2s; }
                    .filter-toggle-btn.active { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }
                    .filter-badge { position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; background: #ef4444; border-radius: 50%; border: 2px solid white; }

                    .filter-group { display: flex; flex-direction: column; gap: 6px; }
                    .filter-group label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
                    .filter-group input, .filter-group select { padding: 10px 14px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; outline: none; transition: border 0.2s; background: white; color: #334155; }
                    .filter-group input:focus, .filter-group select:focus { border-color: #3b82f6; }

                    .tabs-container { display: flex; border-bottom: 2px solid #e2e8f0; }
                    .tab-btn { background: none; border: none; padding: 12px 20px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: 0.2s; }
                    .tab-btn:hover { color: #0f172a; }
                    .tab-btn.active { color: #4f46e5; border-bottom-color: #4f46e5; }
                    
                    .kpi-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 16px; }
                    .icon-wrap { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                    .icon-wrap.blue { background: #eff6ff; color: #3b82f6; }
                    .icon-wrap.green { background: #ecfdf5; color: #10b981; }
                    .icon-wrap.orange { background: #fff7ed; color: #ea580c; }
                    .icon-wrap.purple { background: #faf5ff; color: #9333ea; }
                    .kpi-info { display: flex; flex-direction: column; }
                    .kpi-info span { font-size: 13px; color: #64748b; font-weight: 500; }
                    .kpi-info h3 { margin: 4px 0 0 0; font-size: 20px; font-weight: 700; color: #0f172a; }

                    .fade-in { animation: fadeIn 0.2s ease-out; }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
                `}
            </style>
        </div>
    );
};

// Inline Styles for Table mapping
const thStyle = { padding: '16px', fontSize: 13, fontWeight: 600, color: '#475569' };
const tdStyle = { padding: '16px', fontSize: 14, color: '#334155' };
const stBold = { fontWeight: 600, color: '#0f172a' };
const stSub = { fontSize: 12, color: '#64748b' };

export default VisitReports;
