import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Search, Briefcase, User, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import '../visit_management/visit.css';

interface Visit {
    id: number;
    client_name: string;
    company_name: string;
    city: string;
    priority_level: string;
    status: string;
    date: string;
    user: { name: string; department: { name: string } };
    check_in_time: string | null;
    check_out_time: string | null;
}

const VisitStatus = () => {
    const [visits, setVisits] = useState<Visit[]>([]);
    const [grouped, setGrouped] = useState<Record<string, Visit[]>>({
        'Planned': [], 'Checked-In': [], 'Completed': [], 'Pending Approval': [], 'Cancelled': []
    });
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchVisits();
    }, [dateFilter]);

    const fetchVisits = async () => {
        setLoading(true);
        try {
            const res = await api.get('/visits/visit-status', { params: { date: dateFilter } });
            setVisits(res.data.raw);
            setGrouped(res.data.grouped);
        } catch (error) {
            toast.error("Failed to load visit statuses.");
            // Scaffold fallback grouping for UX design testing
            setGrouped({ 'Planned': [], 'Checked-In': [], 'Completed': [], 'Pending Approval': [], 'Cancelled': [] });
        } finally {
            setLoading(false);
        }
    };

    const statusColumns = [
        { key: 'Planned', label: 'Planned', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', icon: Calendar },
        { key: 'Checked-In', label: 'Checked-In', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', icon: MapPin },
        { key: 'Completed', label: 'Completed', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircle2 },
        { key: 'Pending Approval', label: 'Pending Approval', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: AlertCircle },
        { key: 'Cancelled', label: 'Cancelled', color: '#ef4444', bg: '#fef2f2', border: '#fecaca', icon: RefreshCw }
    ];

    const filteredGroup = (key: string) => {
        return grouped[key]?.filter(v => 
            v.client_name.toLowerCase().includes(search.toLowerCase()) || 
            (v.user?.name || '').toLowerCase().includes(search.toLowerCase())
        ) || [];
    };

    return (
        <div className="visit-layout">
            <div className="visit-header-banner" style={{ marginBottom: 20 }}>
                <div>
                    <h2 className="visit-title">
                        <MapPin color="#c7d2fe" /> Real-time Visit Status Tracker
                    </h2>
                    <p className="visit-subtitle">
                        Monitor employee field activity and track visit progress across workflow stages.
                    </p>
                </div>
                <div className="visit-filters" style={{ gap: 12, flexWrap: 'wrap' }}>
                    <div className="search-group" style={{ maxWidth: 320 }}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search client or employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="date-filter-input"
                        style={{ minWidth: 180 }}
                    />
                    <button className="btn-visit-primary" style={{ minWidth: 140 }} onClick={fetchVisits}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Board
                    </button>
                </div>
            </div>

            <div className="visit-grid" style={{ marginTop: 16 }}>
                {statusColumns.map((col) => {
                    const cards = filteredGroup(col.key);
                    const Icon = col.icon;
                    return (
                        <div key={col.key} className="visit-card" style={{ background: col.bg, borderColor: col.border, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
                            <div className="visit-card-header" style={{ background: 'transparent', borderBottom: '1px solid rgba(226,232,240,0.9)', padding: '18px 20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'white', display: 'grid', placeItems: 'center', color: col.color }}>
                                        <Icon size={18} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{col.label}</h3>
                                        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569' }}>{cards.length} visits</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', minHeight: 0 }}>
                                {cards.length === 0 ? (
                                    <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, borderRadius: 14, background: 'rgba(255,255,255,0.8)' }}>
                                        <FileText size={20} style={{ marginBottom: 10, opacity: 0.55 }} />
                                        No visits in this stage yet.
                                    </div>
                                ) : (
                                    cards.map(visit => (
                                        <div key={visit.id} className="visit-card" style={{ padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 10px 18px -10px rgba(15,23,42,0.08)', background: 'white' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{visit.client_name}</h4>
                                                    <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Briefcase size={12} /> {visit.company_name || 'Individual'}
                                                    </p>
                                                </div>
                                                <span style={{ fontSize: 11, padding: '6px 10px', borderRadius: 999, fontWeight: 700, background: visit.priority_level === 'High' ? '#fee2e2' : visit.priority_level === 'Medium' ? '#fef3c7' : '#f8fafc', color: visit.priority_level === 'High' ? '#b91c1c' : visit.priority_level === 'Medium' ? '#b45309' : '#475569', border: `1px solid ${visit.priority_level === 'High' ? '#fecaca' : visit.priority_level === 'Medium' ? '#fde68a' : '#e2e8f0'}` }}>
                                                    {visit.priority_level}
                                                </span>
                                            </div>
                                            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569', fontSize: 13 }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f8fafc', display: 'grid', placeItems: 'center', color: '#475569' }}><User size={12} /></div>
                                                    {visit.user?.name || 'Unassigned'}
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#475569', fontSize: 13, gap: 10 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={12} color="#94a3b8" /> {visit.city || 'Location pending'}</span>
                                                    {visit.check_in_time ? (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#0f172a' }}><Clock size={12} /> {new Date(visit.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>Awaiting check-in</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <style>
                {`
                    .visit-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 10px 15px -3px rgba(15,23,42,0.1);
                    }
                    .spin {
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                    /* Scrollbar styling for Kanban */
                    ::-webkit-scrollbar { height: 8px; width: 6px; }
                    ::-webkit-scrollbar-track { background: transparent; }
                    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
                `}
            </style>
        </div>
    );
};

export default VisitStatus;
