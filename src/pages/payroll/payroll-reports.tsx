import { useState, useEffect } from 'react';
import { 
    FileText, Download, PieChart, BarChart, Search, 
    Calendar, Filter, Loader2, CreditCard, Users, 
    Landmark, FileSpreadsheet, AlertCircle, History,
    ShieldCheck, Briefcase
} from 'lucide-react';
import api from '../../lib/axios';
import './payroll-modules.css';
import './reports.css';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';

const Gift = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8V4.5a2.5 2.5 0 0 0-5 0V8"/><path d="M12 8V4.5a2.5 2.5 0 0 1 5 0V8"/><path d="M7 12v9h10v-9"/><path d="M5 12h14"/><path d="M12 12v9"/></svg>
);

const UserMinus = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
);

const CalendarSync = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);

const Bookmark = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
);

const reportsList = [
    { id: 'bank-statement', name: 'Bank Statement', icon: Landmark, description: 'Direct transfer details with A/C info', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'bulk-report', name: 'Bulk Salary Report', icon: FileSpreadsheet, description: 'Consolidated view of all employees', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'pf-esic', name: 'PF & ESIC Report', icon: ShieldCheck, description: 'Compliance deductions summary', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'summary', name: 'Payroll Summary', icon: PieChart, description: 'Gross to Net reconciliation', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'hold-salary', name: 'Hold Salary Report', icon: AlertCircle, description: 'List of blocked/held payments', color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'allowances', name: 'Allowance Report', icon: CreditCard, description: 'Detail on components & earnings', color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { id: 'ctc-audit', name: 'CTC Audit Report', icon: History, description: 'Salary group change history', color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'payment-mode', name: 'Payment Mode Report', icon: Bookmark, description: 'Cash vs Bank transfer list', color: 'text-slate-600', bg: 'bg-slate-50' },
    { id: 'incentives', name: 'Incentive Report', icon: Gift, description: 'Performance & Sales bonuses', color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'ff-settlement', name: 'F&F Settlement Report', icon: UserMinus, description: 'Full & Final payment summary', color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'attendance-sync', name: 'Attendance Sync', icon: CalendarSync, description: 'Salary days vs Attendance days', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'yearly-statement', name: 'Yearly Statement', icon: Briefcase, description: 'Annual earning summary', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { id: 'compliance', name: 'PT & Tax Report', icon: ShieldCheck, description: 'Professional Tax & TDS audit', color: 'text-teal-600', bg: 'bg-teal-50' }
];


const PayrollReports = () => {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        branch_id: '',
        department_id: '',
        mode: 'Bank Transfer'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (error) {
            toast.error("Failed to load metadata");
        }
    };

    const handleGenerate = async () => {
        if (!selectedReport) {
            toast.error("Please select a report type first");
            return;
        }

        setLoading(true);
        setData([]);
        try {
            const endpoint = `/payroll-reports/${selectedReport}`;
            const res = await api.get(endpoint, { params: filters });
            setData(Array.isArray(res.data) ? res.data : [res.data]);
            if (res.data.length === 0) toast("No records found for this period", { icon: 'ℹ️' });
        } catch (error) {
            toast.error("Failed to generate report");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (data.length === 0) return;
        const reportName = reportsList.find(r => r.id === selectedReport)?.name || 'Report';
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `MineHR_${reportName.replace(/\s+/g, '_')}_${filters.month}_${filters.year}.xlsx`);
        toast.success("Excel exported successfully");
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="reports-module-container animate-in">
            <div className="module-header">
                <div className="header-title">
                    <div className="header-icon-box">
                        <BarChart className="text-white" />
                    </div>
                    <div>
                        <h1>Advanced Payroll Reporting</h1>
                        <p>Comprehensive financial insights and compliance auditing</p>
                    </div>
                </div>
            </div>

            <div className="reporting-layout">
                {/* Left: Report Selection Cards */}
                <div className="reports-sidebar">
                    <div className="reports-sidebar-header">
                        <h3>Select Report Type</h3>
                    </div>
                    <div className="report-cards-grid">
                        {reportsList.map((rep) => {
                            const Icon = rep.icon;
                            const isActive = selectedReport === rep.id;
                            return (
                                <div 
                                    key={rep.id} 
                                    className={`report-selector-card ${isActive ? 'active' : ''}`}
                                    onClick={() => setSelectedReport(rep.id)}
                                >
                                    <div className={`rep-icon-wrapper ${rep.bg} ${rep.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="rep-info">
                                        <h4>{rep.name}</h4>
                                        <p>{rep.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Filters and Preview */}
                <div className="report-main-content">
                    <div className="glass-card filter-bar">
                        <div className="filter-inner">
                            <div className="filter-item">
                                <label><Calendar size={14} /> Month</label>
                                <select value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
                                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div className="filter-item">
                                <label><Calendar size={14} /> Year</label>
                                <select value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
                                    <option>2026</option>
                                    <option>2025</option>
                                </select>
                            </div>
                            {selectedReport === 'payment-mode' && (
                                <div className="filter-item">
                                    <label><CreditCard size={14} /> Mode</label>
                                    <select value={filters.mode} onChange={e => setFilters({...filters, mode: e.target.value})}>
                                        <option>Bank Transfer</option>
                                        <option>Cash</option>
                                        <option>External Transfer</option>
                                    </select>
                                </div>
                            )}
                            <div className="filter-actions">
                                <button className="btn-generate" onClick={handleGenerate} disabled={loading || !selectedReport}>
                                    {loading ? <Loader2 className="spin" size={18} /> : <PlayIcon size={18} />}
                                    <span>{loading ? 'Processing...' : 'Generate Report'}</span>
                                </button>
                                {data.length > 0 && (
                                    <button className="btn-export-excel" onClick={handleExport}>
                                        <Download size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="report-preview-card glass-card">
                        {selectedReport && !loading && data.length > 0 ? (
                            <div className="preview-table-container">
                                <table className="report-data-table">
                                    <thead>
                                        <tr>
                                            {Object.keys(data[0] || {}).map(key => (
                                                <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((row, i) => (
                                            <tr key={i}>
                                                {Object.keys(row).map((key, j) => {
                                                    const val = row[key];
                                                    let displayVal = val;
                                                    
                                                    // Handle nested objects (like user: { name: '...' })
                                                    if (val && typeof val === 'object') {
                                                        if (val.name) displayVal = val.name;
                                                        else if (val.id) displayVal = `#${val.id}`;
                                                        else displayVal = JSON.stringify(val);
                                                    }

                                                    // Format dates if key contains 'date' or 'At'
                                                    if ((key.toLowerCase().includes('date') || key.includes('At')) && typeof val === 'string') {
                                                        try {
                                                            displayVal = new Date(val).toLocaleDateString();
                                                        } catch {}
                                                    }

                                                    // Format currency for amount fields
                                                    if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('salary') || key.toLowerCase().includes('gross') || key.toLowerCase().includes('net')) {
                                                        if (typeof val === 'number') displayVal = `₹ ${val.toLocaleString()}`;
                                                    }

                                                    return <td key={j}>{String(displayVal)}</td>;
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-preview-state">
                                {loading ? (
                                    <div className="loading-state">
                                        <Loader2 size={48} className="spin text-indigo-500" />
                                        <p>Aggregating records and building report...</p>
                                    </div>
                                ) : (
                                    <div className="initial-state">
                                        <FileText size={48} className="text-slate-300 mb-4" />
                                        <h3>Ready to Generate</h3>
                                        <p>Select a report type and click generate to view the live preview</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlayIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);

export default PayrollReports;
