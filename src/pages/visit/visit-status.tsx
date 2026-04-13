import React, { useState, useEffect } from 'react';
import { Calendar, Filter, MapPin, Clock, Search, Briefcase, User, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

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
        <div style={{ padding: '24px', background: '#f8fafc', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <MapPin color="#3b82f6" /> Real-time Visit Status Tracker
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                        Monitor employee field activity and track visit progress natively across 5 workflow stages.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}/>
                        <input 
                            type="text" 
                            placeholder="Search client or employee..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ padding: '10px 16px 10px 36px', borderRadius: 8, border: '1px solid #cbd5e1', width: 260, fontSize: 14, outline: 'none' }}
                        />
                    </div>
                    <input 
                        type="date" 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, outline: 'none', background: 'white', color: '#334155' }}
                    />
                    <button style={{ padding: '10px 16px', borderRadius: 8, background: '#1e293b', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }} onClick={fetchVisits}>
                        <RefreshCw size={16} className={loading ? 'spin' : ''}/> Refresh Board
                    </button>
                </div>
            </div>

            {/* Kanban Board Layout */}
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, flex: 1, alignItems: 'flex-start' }}>
                {statusColumns.map((col) => {
                    const cards = filteredGroup(col.key);
                    const Icon = col.icon;
                    return (
                        <div key={col.key} style={{ minWidth: 320, maxWidth: 320, background: col.bg, border: `1px solid ${col.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 160px)' }}>
                            
                            {/* Column Header */}
                            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${col.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon size={18} color={col.color} />
                                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: col.color }}>{col.label}</h3>
                                </div>
                                <span style={{ background: 'white', color: col.color, padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    {cards.length}
                                </span>
                            </div>

                            {/* Cards Container */}
                            <div style={{ padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                                {cards.length === 0 ? (
                                    <div style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <FileText size={24} style={{ opacity: 0.5 }}/>
                                        No visits in this stage
                                    </div>
                                ) : (
                                    cards.map(visit => (
                                        <div key={visit.id} style={{ background: 'white', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(15,23,42,0.04)', display: 'flex', flexDirection: 'column', gap: 12, transition: '0.2s transform' }} className="visit-card">
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, fontSize: 15, color: '#0f172a', fontWeight: 600 }}>{visit.client_name}</h4>
                                                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                                        <Briefcase size={12}/> {visit.company_name || 'Individual'}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700, background: visit.priority_level === 'High' ? '#fef2f2' : visit.priority_level === 'Medium' ? '#fffbeb' : '#f8fafc', color: visit.priority_level === 'High' ? '#ef4444' : visit.priority_level === 'Medium' ? '#f59e0b' : '#64748b', border: `1px solid ${visit.priority_level === 'High' ? '#fecaca' : visit.priority_level === 'Medium' ? '#fde68a' : '#e2e8f0'}` }}>
                                                    {visit.priority_level}
                                                </span>
                                            </div>

                                            <div style={{ height: 1, background: '#f1f5f9' }}/>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}><User size={12}/></div>
                                                    <span style={{ fontWeight: 500 }}>{visit.user?.name}</span>
                                                </div>
                                                
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <MapPin size={12} color="#94a3b8"/> {visit.city || 'Location Pending'}
                                                    </span>
                                                    {visit.check_in_time && (
                                                        <span style={{ fontSize: 12, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                                                            <Clock size={12}/> {new Date(visit.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </span>
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
