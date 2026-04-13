import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Edit2, X, Save, Loader2, Search,
    UserCheck, UserMinus, Clock, LayoutDashboard,
    Camera, Phone, MapPin, Building, Info, CheckCircle2,
    Filter, Download, LogIn, LogOut, ShieldAlert
} from 'lucide-react';
import './visitors.css';

interface VisitorLog {
    id: number;
    visitor: { id: number; name: string; mobile: string; photo_url: string | null; is_blacklisted: boolean; company?: string; city?: string };
    employee: { name: string } | null;
    subType: { name: string; category: string } | null;
    in_time: string;
    out_time: string | null;
    status: string;
    purpose: string | null;
    vehicle_number: string | null;
}

interface VisitorSetting {
    key: string;
    value: string;
    type: string;
}

export default function VisitorsInOut() {
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [insideCount, setInsideCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Inside');

    // Dependencies for Form
    const [employees, setEmployees] = useState<{ id: number; name: string }[]>([]);
    const [subTypes, setSubTypes] = useState<{ id: number; name: string; category: string }[]>([]);

    // Form State
    const [formName, setFormName] = useState('');
    const [formMobile, setFormMobile] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formCompany, setFormCompany] = useState('');
    const [formCity, setFormCity] = useState('');
    const [formSubTypeId, setFormSubTypeId] = useState('');
    const [formEmployeeId, setFormEmployeeId] = useState('');
    const [formPurpose, setFormPurpose] = useState('');
    const [formVehicle, setFormVehicle] = useState('');

    useEffect(() => {
        fetchData();
        fetchSettings();
        fetchDependencies();
    }, [statusFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [logsRes, countRes] = await Promise.all([
                fetch(`/api/visitors/manage/logs?status=${statusFilter}`),
                fetch('/api/visitors/manage/inside-count')
            ]);
            if (logsRes.ok) setLogs(await logsRes.json());
            if (countRes.ok) {
                const data = await countRes.json();
                setInsideCount(data.count);
            }
        } catch (error) {
            console.error("Failed to fetch visitors", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/visitors/settings');
            if (res.ok) {
                const data: VisitorSetting[] = await res.json();
                const settingsMap = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
                setSettings(settingsMap);
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    };

    const fetchDependencies = async () => {
        try {
            const [empRes, typeRes] = await Promise.all([
                fetch('/api/search/employees'),
                fetch('/api/visitors/sub-types')
            ]);
            if (empRes.ok) setEmployees(await empRes.json());
            if (typeRes.ok) setSubTypes(await typeRes.json());
        } catch (e) { console.error(e); }
    };

    const handleCheckIn = async () => {
        if (!formName || !formMobile) return alert("Name and Mobile are mandatory!");
        if (settings.VISITOR_CITY_REQUIRED === 'Yes' && !formCity) return alert("City is mandatory!");
        if (settings.VISITOR_REASON_REQUIRED === 'Yes' && !formPurpose) return alert("Visit Purpose is mandatory!");

        setIsSaving(true);
        try {
            const res = await fetch('/api/visitors/manage/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formName,
                    mobile: formMobile,
                    email: formEmail,
                    company: formCompany,
                    city: formCity,
                    sub_type_id: formSubTypeId,
                    employee_id: formEmployeeId,
                    purpose: formPurpose,
                    vehicle_number: formVehicle
                })
            });

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
                resetForm();
            } else {
                const err = await res.json();
                alert(err.message || 'Check-in failed');
            }
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleCheckOut = async (id: number) => {
        if (!window.confirm("Check-out this visitor?")) return;
        try {
            const res = await fetch(`/api/visitors/manage/check-out/${id}`, { method: 'PUT' });
            if (res.ok) fetchData();
        } catch (e) { console.error(e); }
    };

    const resetForm = () => {
        setFormName(''); setFormMobile(''); setFormEmail(''); setFormCompany('');
        setFormCity(''); setFormSubTypeId(''); setFormEmployeeId(''); setFormPurpose('');
        setFormVehicle('');
    };

    const isFieldRequired = (key: string) => settings[key] === 'Yes';

    return (
        <div className="visitors-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <LogIn size={24} color="#3b82f6" />
                    <h1>Visitors Management</h1>
                </div>
                <div className="bgv-header-actions" style={{ display: 'flex', gap: '12px' }}>
                    <div className="bgv-stat-chip total" style={{ padding: '8px 16px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '14px', border: '1px solid #bfdbfe' }}>
                        Live Inside: {insideCount}
                    </div>
                    <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                        <Plus size={16} /> Add Visitor
                    </button>
                </div>
            </div>

            <div className="v-stats-grid">
                <div className="v-stat-card">
                    <div className="v-stat-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                        <LogIn size={24} />
                    </div>
                    <div className="v-stat-info">
                        <h3>Inside Right Now</h3>
                        <p>{insideCount}</p>
                    </div>
                </div>
                <div className="v-stat-card">
                    <div className="v-stat-icon-box" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="v-stat-info">
                        <h3>Today's Footfall</h3>
                        <p>{logs.length + (statusFilter !== 'Inside' ? insideCount : 0)}</p>
                    </div>
                </div>
                <div className="v-stat-card">
                    <div className="v-stat-icon-box" style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div className="v-stat-info">
                        <h3>Blacklisted Hits</h3>
                        <p>0</p>
                    </div>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                <div className="v-filter-row">
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                        <div className="bgv-search-box" style={{ maxWidth: '360px' }}>
                            <Search size={16} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by name, mobile, or company..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select className="bgv-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="Inside">Inside (Checked-In)</option>
                            <option value="Checked-Out">Checked-Out History</option>
                        </select>
                    </div>
                    <button className="btn-icon-only" title="Export Today's Logs"><Download size={18} /></button>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Visitor Details</th>
                            <th>Category</th>
                            <th>Entry Info</th>
                            <th>Purpose / Whom to Meet</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '60px' }}>
                                    <Loader2 size={32} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                                    <div style={{ marginTop: '14px', color: '#64748b', fontWeight: 500 }}>Live scanning log...</div>
                                </td>
                            </tr>
                        ) : logs.length > 0 ? (
                            logs.filter(l => 
                                l.visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                l.visitor.mobile.includes(searchQuery) ||
                                l.visitor.company?.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((log) => (
                                <tr key={log.id} className="fade-in">
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {log.visitor.photo_url ? <img src={log.visitor.photo_url} style={{ width: '100%', height: '100%', borderRadius: '10px' }} /> : <Camera size={16} color="#94a3b8" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{log.visitor.name}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{log.visitor.mobile}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#475569' }}>{log.subType?.name || 'Visitor'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{log.subType?.category || 'General'}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1e293b' }}>
                                            <Clock size={12} color="#3b82f6" /> {new Date(log.in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{new Date(log.in_time).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>{log.purpose || 'Official'}</div>
                                        <div style={{ fontSize: '11px', color: '#2563eb' }}>To Meet: {log.employee?.name || 'N/A'}</div>
                                    </td>
                                    <td>
                                        <span className={`v-status-badge ${log.status.toLowerCase()}`}>
                                            {log.status === 'Inside' ? <LogIn size={12} /> : <CheckCircle2 size={12} />}
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>
                                        {log.status === 'Inside' ? (
                                            <button className="btn-add" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '12px', padding: '6px 12px' }} onClick={() => handleCheckOut(log.id)}>
                                                <LogOut size={14} /> Check-Out
                                            </button>
                                        ) : (
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                Left: {log.out_time ? new Date(log.out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                    {statusFilter === 'Inside' ? "No active visitors inside right now." : "No historical visitor logs found for today."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Check-In Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content wide fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', borderRadius: '24px', maxHeight: '95vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="v-form-header">
                            <Plus size={20} color="#3b82f6" />
                            Visitor Entry / Check-In
                        </div>

                        <div className="v-form-body">
                            <div className="v-photo-upload">
                                <Camera size={24} color="#64748b" style={{ margin: '0 auto 8px' }} />
                                <div style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Click to capture or upload visitor photo</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Resolution requirements matched (Mandatory level: {settings.VISITOR_PHOTO_REQUIRED})</div>
                            </div>

                            <div className="form-group">
                                <label>Visitor Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="form-input" placeholder="Full Name" value={formName} onChange={e => setFormName(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="form-input" placeholder="10-digit number" value={formMobile} onChange={e => setFormMobile(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Company / Organization {isFieldRequired('VISITOR_ADDRESS_REQUIRED') && <span>*</span>}</label>
                                <input type="text" className="form-input" placeholder="e.g. Google, Zomato..." value={formCompany} onChange={e => setFormCompany(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>City {isFieldRequired('VISITOR_CITY_REQUIRED') && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <input type="text" className="form-input" placeholder="Visitor coming from?" value={formCity} onChange={e => setFormCity(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Visitor Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className="form-select" value={formSubTypeId} onChange={e => setFormSubTypeId(e.target.value)}>
                                    <option value="">Select Category</option>
                                    {subTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.category})</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Whom To Meet (Employee) <span style={{ color: '#ef4444' }}>*</span></label>
                                <select className="form-select" value={formEmployeeId} onChange={e => setFormEmployeeId(e.target.value)}>
                                    <option value="">Select Employee</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Reason for Visit {isFieldRequired('VISITOR_REASON_REQUIRED') && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <textarea className="form-textarea" rows={2} placeholder="Briefly state why they are here..." value={formPurpose} onChange={e => setFormPurpose(e.target.value)} />
                            </div>

                            <div className="form-group">
                                <label>Vehicle Number {isFieldRequired('VEHICLE_NO_REQUIRED') && <span style={{ color: '#ef4444' }}>*</span>}</label>
                                <input type="text" className="form-input" placeholder="e.g. DL-1C-A1234" value={formVehicle} onChange={e => setFormVehicle(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
                                <input type="checkbox" checked />
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Send real-time alert to employee</span>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ background: '#f8fafc', padding: '20px 30px' }}>
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-add" style={{ padding: '12px 32px' }} onClick={handleCheckIn} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <UserCheck size={18} />}
                                {isSaving ? 'Registering...' : 'Perform Check-In'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
