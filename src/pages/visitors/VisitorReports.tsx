import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Filter, Download, FileText, CheckCircle2, AlertCircle, Clock,
    LayoutDashboard, BarChart2, Calendar, UserCheck, LogOut
} from 'lucide-react';
import './visitors.css';

interface VisitorLog {
    id: number;
    visitor: { name: string; mobile: string; company: string | null; city: string | null };
    subType: { name: string } | null;
    employee: { name: string } | null;
    in_time: string;
    out_time: string | null;
    status: string;
    purpose: string | null;
}

export default function VisitorReports() {
    const [reports, setReports] = useState<VisitorLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter Stats
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchReports();
    }, [statusFilter, dateRange]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            let url = `/api/visitors/reports/common?status=${statusFilter}`;
            if (dateRange.start) url += `&start_date=${dateRange.start}`;
            if (dateRange.end) url += `&end_date=${dateRange.end}`;
            if (searchQuery) url += `&search=${searchQuery}`;

            const res = await fetch(url);
            if (res.ok) {
                setReports(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Inside': return <span className="v-status-badge inside"><Clock size={12} /> Inside</span>;
            case 'Checked-Out': return <span className="v-status-badge checked-out"><CheckCircle2 size={12} /> Checked-Out</span>;
            case 'Rejected': return <span className="v-status-badge rejected"><AlertCircle size={12} /> Rejected</span>;
            default: return <span className="status-badge not-started">{status}</span>;
        }
    };

    return (
        <div className="visitors-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <BarChart2 size={24} color="#3b82f6" />
                    <h1>Common Visitors Report</h1>
                </div>
                <div className="bgv-header-actions" style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-add" style={{ background: '#ffffff', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        <Download size={16} /> Export Excel
                    </button>
                    <button className="btn-add" style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca' }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div className="v-filter-row" style={{ padding: '24px' }}>
                    <div className="bgv-search-box" style={{ maxWidth: '300px' }}>
                        <Search size={16} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Enter Name / Mobile..." 
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); fetchReports(); }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <select className="bgv-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Inside">Inside Only</option>
                            <option value="Checked-Out">Completed Visits</option>
                            <option value="Rejected">Rejected Hits</option>
                        </select>
                        <input 
                            type="date" 
                            className="bgv-filter-select" 
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <input 
                            type="date" 
                            className="bgv-filter-select" 
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Name</th>
                            <th>Mobile Number</th>
                            <th>Visitor From (Company)</th>
                            <th>Visit Date & Time</th>
                            <th>Status</th>
                            <th>Host (Employee)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                    <Loader2 size={32} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '14px', color: '#64748b' }}>Consulting server logs...</div>
                                </td>
                            </tr>
                        ) : reports.length > 0 ? (
                            reports.map(log => (
                                <tr key={log.id} className="fade-in">
                                    <td><strong>{log.visitor.name}</strong></td>
                                    <td>{log.visitor.mobile}</td>
                                    <td>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{log.visitor.company || 'Private'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{log.visitor.city || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#1e293b' }}>{new Date(log.in_time).toLocaleString()}</div>
                                        {log.out_time && <div style={{ fontSize: '11px', color: '#16a34a' }}>Out: {new Date(log.out_time).toLocaleTimeString()}</div>}
                                    </td>
                                    <td>{getStatusBadge(log.status)}</td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>{log.employee?.name || 'Reception'}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{log.purpose}</div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                    No visitor data found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
