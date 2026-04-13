import { useState } from 'react';
import { Upload, FileText, Save , Users} from 'lucide-react';
import './attendance.css';
import api from '../../lib/axios';
import { useAttendanceData } from './useAttendanceHooks';

const BulkAttendance = () => {
    const { employees } = useAttendanceData();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<any>(null);
    const [entries, setEntries] = useState<any[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Simulate parsing CSV - in real app, use papa-parse or read as text
            setTimeout(() => {
                const dummyEntries = employees.slice(0, 5).map(emp => ({
                    user_id: emp.id,
                    name: emp.name,
                    status: Math.random() > 0.8 ? 'Absent' : 'Present',
                    remarks: 'Bulk Upload'
                }));
                setEntries(dummyEntries);
            }, 500);
        }
    };

    const handleUpload = async () => {
        if (entries.length === 0) return setMsg({ type: 'error', text: 'No entries to upload' });
        setLoading(true); setMsg(null);
        try {
            const res = await api.post('/attendance/bulk', { date, entries: entries.map(e => ({ user_id: e.user_id, status: e.status, remarks: e.remarks })) });
            setMsg({ type: 'success', text: `Success: ${res.data.created} created, ${res.data.skipped} skipped.` });
            setEntries([]); setFile(null);
        } catch (err: any) {
            setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to upload' });
        } finally { setLoading(false); }
    };

    const handleManualAdd = () => {
        setEntries([{ user_id: employees[0]?.id || '', name: employees[0]?.name || '', status: 'Present', remarks: '' }, ...entries]);
    };

    return (
        <div className="attendance-module-container">
            <div className="attendance-header">
                <div>
                    <h2 className="attendance-title"><Users className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Bulk Attendance</h2>
                    <p className="attendance-subtitle">Upload CSV or add multiple attendance records at once.</p>
                </div>
            </div>

            {msg && <div style={{ padding: '12px 16px', borderRadius: 8, marginBottom: 16, background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#dc2626', fontSize: 13 }}>{msg.text}</div>}

            <div className="attendance-chart-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#475569' }}>Attendance Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ flex: 2 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 500, color: '#475569' }}>Upload CSV</label>
                        <div style={{ border: '1px dashed #cbd5e1', borderRadius: 6, padding: '16px', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }} onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload size={20} color="#64748b" style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontSize: 13, color: '#64748b' }}>{file ? file.name : 'Click to select Excel/CSV file'}</div>
                            <input id="file-upload" type="file" accept=".csv, .xlsx" style={{ display: 'none' }} onChange={handleFileChange} />
                        </div>
                        <a href="#" style={{ fontSize: 12, color: '#3b82f6', marginTop: 8, display: 'inline-block' }}><FileText size={12} style={{ display: 'inline', marginRight: 4 }} />Download Template</a>
                    </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                    <button className="btn-secondary" onClick={handleManualAdd}>+ Add Manual Row</button>
                    <button className="btn-primary" onClick={handleUpload} disabled={entries.length === 0 || loading}><Save size={16} /> {loading ? 'Uploading...' : 'Upload & Save Data'}</button>
                </div>
            </div>

            {entries.length > 0 && (
                <div className="attendance-table-card" style={{ padding: 0 }}>
                    <table className="attendance-table">
                        <thead><tr><th>Employee ID</th><th>Name</th><th>Status</th><th>Remarks</th></tr></thead>
                        <tbody>
                            {entries.map((ent, idx) => (
                                <tr key={idx}>
                                    <td>
                                        <select value={ent.user_id} onChange={(e) => {
                                            const newEnt = [...entries];
                                            newEnt[idx].user_id = e.target.value;
                                            newEnt[idx].name = employees.find(emp => emp.id == e.target.value)?.name || '';
                                            setEntries(newEnt);
                                        }} style={{ padding: '6px', width: '100%' }}>
                                            {employees.map(e => <option key={e.id} value={e.id}>EMP-{e.id}</option>)}
                                        </select>
                                    </td>
                                    <td>{ent.name}</td>
                                    <td>
                                        <select value={ent.status} onChange={e => { const newEnt = [...entries]; newEnt[idx].status = e.target.value; setEntries(newEnt); }} style={{ padding: '6px' }}>
                                            <option value="Present">Present</option><option value="Absent">Absent</option><option value="Half Day">Half Day</option><option value="Leave">On Leave</option>
                                        </select>
                                    </td>
                                    <td><input type="text" value={ent.remarks} onChange={e => { const newEnt = [...entries]; newEnt[idx].remarks = e.target.value; setEntries(newEnt); }} style={{ padding: '6px', width: '100%' }} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BulkAttendance;
