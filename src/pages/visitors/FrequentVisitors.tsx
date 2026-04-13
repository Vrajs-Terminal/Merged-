import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    Filter, Download, FileText, CheckCircle2, AlertCircle, Clock,
    LayoutDashboard, BarChart2, Calendar, UserCheck, ShieldAlert
} from 'lucide-react';
import './visitors.css';

interface FrequentVisitor {
    id: number;
    name: string;
    mobile: string;
    company: string | null;
    visit_count: number;
    is_blacklisted: boolean;
    last_visit: { in_time: string; subType: { name: string } | null } | null;
}

export default function FrequentVisitors() {
    const [visitors, setVisitors] = useState<FrequentVisitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [minVisits, setMinVisits] = useState(3);

    useEffect(() => {
        fetchFrequent();
    }, [minVisits]);

    const fetchFrequent = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/visitors/reports/frequent?min_visits=${minVisits}`);
            if (res.ok) {
                setVisitors(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch frequent visitors", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleBlacklist = async (id: number) => {
        if (!window.confirm("Are you sure you want to change the blacklist status of this visitor?")) return;
        try {
            const res = await fetch(`/api/visitors/manage/profile/${id}/blacklist`, { method: 'PATCH' });
            if (res.ok) fetchFrequent();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="visitors-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <ShieldAlert size={24} color="#f59e0b" />
                    <h1>Frequent Visitor Analysis</h1>
                </div>
                <div className="bgv-header-actions">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '8px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Show visitors with visits ≥ </span>
                        <input 
                            type="number" 
                            style={{ width: '60px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', fontWeight: 'bold' }}
                            value={minVisits}
                            onChange={e => setMinVisits(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', background: '#fff9f0', borderRadius: '24px 24px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShieldAlert size={20} color="#d97706" />
                        <span style={{ fontSize: '14px', color: '#92400e', fontWeight: 600 }}>Frequent visitors are identified for security auditing and delivery partner monitoring.</span>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Details</th>
                            <th>Total Visits</th>
                            <th>Last Visit Info</th>
                            <th>Security Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '60px' }}>
                                    <Loader2 size={32} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '14px', color: '#64748b' }}>Analyzing visitor frequency...</div>
                                </td>
                            </tr>
                        ) : visitors.length > 0 ? (
                            visitors.map(visitor => (
                                <tr key={visitor.id} className="fade-in">
                                    <td>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{visitor.name}</div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{visitor.mobile} | {visitor.company || 'Private'}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontWeight: 800 }}>
                                            {visitor.visit_count}
                                        </div>
                                    </td>
                                    <td>
                                        {visitor.last_visit ? (
                                            <>
                                                <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{new Date(visitor.last_visit.in_time).toLocaleDateString()}</div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{visitor.last_visit.subType?.name || 'General'}</div>
                                            </>
                                        ) : 'N/A'}
                                    </td>
                                    <td>
                                        {visitor.is_blacklisted ? (
                                            <span className="v-status-badge rejected"><ShieldAlert size={12} /> Blacklisted</span>
                                        ) : (
                                            <span className="v-status-badge checked-out"><CheckCircle2 size={12} /> Clear</span>
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            className={`btn-add ${visitor.is_blacklisted ? '' : 'delete'}`} 
                                            style={{ fontSize: '12px', padding: '6px 12px' }}
                                            onClick={() => toggleBlacklist(visitor.id)}
                                        >
                                            {visitor.is_blacklisted ? 'Remove Blacklist' : 'Blacklist Visitor'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                    No frequent visitors found meeting the threshold ({minVisits}).
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
