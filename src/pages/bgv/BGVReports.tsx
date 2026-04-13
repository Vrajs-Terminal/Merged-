import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Filter, Download, FileText, CheckCircle2, AlertCircle, Clock,
    LayoutDashboard, BarChart2, Calendar
} from 'lucide-react';
import './bgv.css';

interface BGVReport {
    id: number;
    employee: { name: string; branch: { name: string }; department: { name: string } };
    verificationType: { name: string };
    verification_way: string;
    status: string;
    verifier: { name: string } | null;
    createdAt: string;
    remarks: string | null;
}

export default function BGVReports() {
    const [reports, setReports] = useState<BGVReport[]>([]);
    const [summary, setSummary] = useState({ total: 0, verified: 0, pending: 0, failed: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Filter Stats
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchSummary();
        fetchHistory();
    }, [statusFilter, dateRange]);

    const fetchSummary = async () => {
        try {
            const res = await fetch('/api/bgv/reports/summary');
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (error) {
            console.error("Failed to fetch summary", error);
        }
    };

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            let url = `/api/bgv/reports/history?status=${statusFilter}`;
            if (dateRange.start) url += `&start_date=${dateRange.start}`;
            if (dateRange.end) url += `&end_date=${dateRange.end}`;

            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to fetch record history", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Verified': return <span className="status-badge verified"><CheckCircle2 size={12} /> Verified</span>;
            case 'Pending': return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
            case 'Failed': return <span className="status-badge failed"><AlertCircle size={12} /> Failed</span>;
            default: return <span className="status-badge not-started">Not Started</span>;
        }
    };

    return (
        <div className="bgv-layout">
            <div className="bgv-header-bar">
                <div className="bgv-header-left">
                    <BarChart2 size={24} color="#3b82f6" />
                    <h1>Verification Reports</h1>
                </div>
                <div className="bgv-header-actions">
                    <button className="btn-save-more" style={{ borderColor: '#22c55e', color: '#16a34a' }}>
                        <Download size={16} /> Export Excel
                    </button>
                    <button className="btn-save-more" style={{ borderColor: '#ef4444', color: '#dc2626' }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="bgv-stats-grid">
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}><LayoutDashboard size={24} /></div>
                    <div className="bgv-stat-info"><h3>Total Verified</h3><p>{summary.verified}</p></div>
                </div>
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}><Clock size={24} /></div>
                    <div className="bgv-stat-info"><h3>Total Pending</h3><p>{summary.pending}</p></div>
                </div>
                <div className="bgv-stat-card">
                    <div className="bgv-stat-icon" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}><AlertCircle size={24} /></div>
                    <div className="bgv-stat-info"><h3>Total Failed</h3><p>{summary.failed}</p></div>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                {/* Filters */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Status</label>
                        <select className="bgv-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Start Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                            <input 
                                type="date" 
                                className="bgv-filter-select" 
                                style={{ paddingLeft: '32px' }}
                                value={dateRange.start}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>End Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                            <input 
                                type="date" 
                                className="bgv-filter-select" 
                                style={{ paddingLeft: '32px' }}
                                value={dateRange.end}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Verification Type</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Verified By</th>
                            <th>Date</th>
                            <th>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 size={24} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Generating reports...</div>
                                </td>
                            </tr>
                        ) : reports.length > 0 ? (
                            reports.map((report) => (
                                <tr key={report.id}>
                                    <td>
                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{report.employee.name}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{report.employee.branch?.name} | {report.employee.department?.name}</div>
                                    </td>
                                    <td>{report.verificationType.name}</td>
                                    <td>{report.verification_way}</td>
                                    <td>{getStatusBadge(report.status)}</td>
                                    <td>{report.verifier?.name || '-'}</td>
                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ maxWidth: '200px', fontSize: '12px', color: '#475569', whiteSpace: 'normal' }}>
                                            {report.remarks || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No reports found for the selected criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
