import { useState } from 'react';
import { Download, RefreshCcw, AlertTriangle , Flag} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './attendance.css';
import { useAttendanceRecords, formatDate, getInitials, getAvatarColor } from './useAttendanceHooks';

const PendingFlags = () => {
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today);
    const { records, loading, fetchRecords } = useAttendanceRecords({ start_date: startDate, end_date: endDate, status: 'Pending' });

    return (
        <div className="attendance-module-container">
            <div className="attendance-header">
                <div><h2 className="attendance-title"><Flag className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Pending Flags & Exceptions</h2><p className="attendance-subtitle">Review attendance exceptions, flags and system warnings.</p></div>
                <div className="attendance-actions"><button className="btn-secondary"><Download size={16} /> Export Issue Log</button><button className="btn-primary" onClick={() => fetchRecords({ start_date: startDate, end_date: endDate, status: 'Pending' })}><RefreshCcw size={16} /> Refresh</button></div>
            </div>

            <div className="attendance-filters-bar">
                <div className="filter-group"><label>From</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div className="filter-group"><label>To</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            </div>

            <div className="attendance-table-card" style={{ padding: 0 }}>
                <table className="attendance-table">
                    <thead><tr><th>Employee</th><th>Date</th><th>Flag Reason</th><th>Severity</th><th>Action</th></tr></thead>
                    <tbody>
                        {loading ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>Loading...</td></tr>
                            : records.length > 0 ? records.map(row => (
                                <tr key={row.id}>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: getAvatarColor(row.user_id), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>{getInitials(row.user?.name || '')}</div><span style={{ fontSize: 13, fontWeight: 600 }}>{row.user?.name}</span></div></td>
                                    <td>{formatDate(row.date)}</td>
                                    <td><AlertTriangle size={14} style={{ color: '#ef4444', display: 'inline', marginRight: 6 }} />{row.remarks || 'Suspicious Punch Location / Device Check'}</td>
                                    <td><span className={`badge badge-absent`}>High</span></td>
                                    <td><button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => navigate('/update-attendance')}>Resolve</button></td>
                                </tr>
                            )) : <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>No pending flags found.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PendingFlags;
