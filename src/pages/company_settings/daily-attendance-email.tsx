import { useState, useEffect } from 'react';
import { Mail, Plus, Edit2, Trash2, X, Save, Clock, Filter, Send, Loader2 } from 'lucide-react';
import './daily-attendance-email.css';
import './assign-employee-grade.css'; // Reuse table and modal styles

interface EmailSetting {
    id: string; // db id
    reportName: string;
    recipientType: string;
    filter: string;
    scheduleTime: string;
    emailTemplate: string;
    status: 'Active' | 'Inactive';
}

export default function DailyAttendanceEmail() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSetting, setEditingSetting] = useState<EmailSetting | null>(null);

    const [settings, setSettings] = useState<EmailSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [testEmailSetting, setTestEmailSetting] = useState<EmailSetting | null>(null);
    const [testEmailSent, setTestEmailSent] = useState(false);

    // Form State
    const [reportName, setReportName] = useState('');
    const [recipientType, setRecipientType] = useState('Manager');
    const [filterVal, setFilterVal] = useState('All Branches');
    const [scheduleTime, setScheduleTime] = useState('18:00');
    const [emailTemplate, setEmailTemplate] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/daily-attendance-email');
            if (res.ok) {
                const data = await res.json();
                const mapped: EmailSetting[] = data.map((item: { id: number, report_name: string, recipient_type: string, filter_value: string, schedule_time: string, email_template: string, status: 'Active' | 'Inactive' }) => ({
                    id: item.id.toString(),
                    reportName: item.report_name,
                    recipientType: item.recipient_type,
                    filter: item.filter_value || 'All Branches',
                    scheduleTime: item.schedule_time ? item.schedule_time.slice(0, 5) : '00:00', // Assuming TIME format comes back as HH:mm:ss
                    emailTemplate: item.email_template || '',
                    status: item.status
                }));
                setSettings(mapped);
            }
        } catch (error) {
            console.error("Failed to load email settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingSetting(null);
        setReportName('');
        setRecipientType('Manager');
        setFilterVal('All Branches');
        setScheduleTime('18:00');
        setEmailTemplate('Hello {Employee Name},\n\nHere is the attendance report for {Date}.\n\nIn Time: {In Time}\nOut Time: {Out Time}\nStatus: {Status}');
        setStatus('Active');
        setIsModalOpen(true);
    };

    const handleEditClick = (setting: EmailSetting) => {
        setEditingSetting(setting);
        setReportName(setting.reportName);
        setRecipientType(setting.recipientType);
        setFilterVal(setting.filter);
        setScheduleTime(setting.scheduleTime);
        setEmailTemplate(setting.emailTemplate || 'Hello {Employee Name},\n\nLoaded template sample.');
        setStatus(setting.status);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this setting?")) return;
        try {
            const res = await fetch(`/api/daily-attendance-email/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to delete setting.");
            }
        } catch (error) {
            console.error("Error deleting setting", error);
        }
    };

    const handleSave = async () => {
        if (!reportName || !recipientType || !scheduleTime) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                report_name: reportName,
                recipient_type: recipientType,
                filter_value: filterVal,
                schedule_time: scheduleTime + ':00', // ensure format logic fits your db
                email_template: emailTemplate,
                status
            };

            let res;
            if (editingSetting) {
                res = await fetch(`/api/daily-attendance-email/${editingSetting.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/daily-attendance-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                await fetchData();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save email setting');
            }
        } catch (error) {
            console.error("Error saving email setting", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const insertVariable = (variable: string) => {
        setEmailTemplate(prev => prev + ` {${variable}}`);
    };

    const openEmailPreview = (setting: EmailSetting) => {
        setTestEmailSent(false);
        setTestEmailSetting(setting);
    };

    const handleSendTestEmail = () => {
        setTestEmailSent(true);
        setTimeout(() => {
            setTestEmailSetting(null);
            setTestEmailSent(false);
        }, 2500);
    };

    return (
        <div className="email-setting-layout">
            <div className="table-card">
                <div className="table-header-title">
                    <h2><Mail className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Daily Attendance Email Settings</h2>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => {
                            const activeSetting = settings.find(s => s.status === 'Active');
                            if (activeSetting) openEmailPreview(activeSetting);
                            else alert('No active email settings to test. Please add one first.');
                        }}>
                            <Send size={16} /> Test Emails Now
                        </button>
                        <button className="btn-primary" onClick={handleAddClick}>
                            <Plus size={16} /> Add Email Setting
                        </button>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Sr. No</th>
                            <th>Report Name</th>
                            <th>Recipient Type</th>
                            <th>Filter</th>
                            <th>Schedule Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#10b981', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading settings...</div>
                                </td>
                            </tr>
                        ) : settings.length > 0 ? (
                            settings.map((setting, index) => (
                                <tr key={setting.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{setting.reportName}</strong></td>
                                    <td>{setting.recipientType}</td>
                                    <td>
                                        <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Filter size={12} /> {setting.filter}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="cron-badge">
                                            <Clock size={14} className="text-blue" />
                                            <span className="time-display">{setting.scheduleTime}</span>
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${setting.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                            {setting.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="Preview & Send Test Email" onClick={() => openEmailPreview(setting)} style={{ color: '#3b82f6' }}>
                                                <Send size={15} />
                                            </button>
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(setting)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(setting.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No email settings configured.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3><Mail size={20} className="text-blue" /> {editingSetting ? 'Edit Email Setting' : 'Add Email Setting'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Report Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. Daily Late In Report"
                                    value={reportName}
                                    onChange={(e) => setReportName(e.target.value)}
                                />
                            </div>

                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label>Recipient Type <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select
                                        className="form-select"
                                        value={recipientType}
                                        onChange={(e) => setRecipientType(e.target.value)}
                                        style={{ marginTop: '8px' }}
                                    >
                                        <option value="Employee">Individual Employee</option>
                                        <option value="Manager">Manager / Dept Head</option>
                                        <option value="Branch Head">Branch Head</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Custom Email">Custom Email Array</option>
                                    </select>
                                </div>
                                <div>
                                    <label>Schedule Time <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        style={{ marginTop: '8px' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Branch / Department Filter (Optional)</label>
                                <select
                                    className="form-select"
                                    value={filterVal}
                                    onChange={(e) => setFilterVal(e.target.value)}
                                >
                                    <option value="All Branches">All Branches & Departments</option>
                                    <option value="Mumbai Head Office">Mumbai Head Office</option>
                                    <option value="Engineering">Engineering Department</option>
                                    <option value="Late In Only">Filters: Late In Only</option>
                                    <option value="Absent Staff">Filters: Absent Staff</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Email Template (Optional)</label>
                                <textarea
                                    className="form-textarea"
                                    style={{ height: '100px', fontFamily: 'inherit' }}
                                    placeholder="Type your email message template here..."
                                    value={emailTemplate}
                                    onChange={(e) => setEmailTemplate(e.target.value)}
                                ></textarea>

                                <div style={{ marginTop: '8px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Click to insert variable:</span>
                                    <div className="template-variables" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                        <span className="variable-tag" style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px dashed #bfdbfe' }} onClick={() => insertVariable('Employee Name')}>Employee Name</span>
                                        <span className="variable-tag" style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px dashed #bfdbfe' }} onClick={() => insertVariable('Date')}>Date</span>
                                        <span className="variable-tag" style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px dashed #bfdbfe' }} onClick={() => insertVariable('In Time')}>In Time</span>
                                        <span className="variable-tag" style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px dashed #bfdbfe' }} onClick={() => insertVariable('Out Time')}>Out Time</span>
                                        <span className="variable-tag" style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', border: '1px dashed #bfdbfe' }} onClick={() => insertVariable('Status')}>Status</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-select"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                {isSaving ? 'Saving...' : 'Save Email Setting'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Preview Modal */}
            {testEmailSetting && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
                    onClick={() => { setTestEmailSetting(null); setTestEmailSent(false); }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '90%', boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
                    >
                        {/* Email client header */}
                        <div style={{ background: '#f1f5f9', borderBottom: '1px solid #1e293b', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Mail size={20} color="#3b82f6" />
                                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }}>Email Preview</span>
                            </div>
                            <button onClick={() => { setTestEmailSetting(null); setTestEmailSent(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Email headers */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', rowGap: '6px', fontSize: '13px' }}>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>To:</span>
                                <span style={{ color: '#475569' }}>{testEmailSetting.recipientType} — {testEmailSetting.filter}</span>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Subject:</span>
                                <span style={{ color: '#1e293b', fontWeight: 600 }}>{testEmailSetting.reportName}</span>
                                <span style={{ color: '#64748b', fontWeight: 600 }}>Scheduled:</span>
                                <span style={{ color: '#3b82f6', fontWeight: 600 }}>Daily at {testEmailSetting.scheduleTime}</span>
                            </div>
                        </div>

                        {/* Email body */}
                        <div style={{ padding: '20px', maxHeight: '200px', overflowY: 'auto' }}>
                            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '16px', fontSize: '14px', lineHeight: 1.7, color: '#1e293b', whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif' }}>
                                {testEmailSetting.emailTemplate || 'No email template configured for this report.'}
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleSendTestEmail}
                                disabled={testEmailSent}
                                style={{
                                    flex: 1, padding: '11px',
                                    background: testEmailSent ? '#22c55e' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                    color: '#1e293b', border: 'none', borderRadius: '10px',
                                    fontWeight: 700, cursor: testEmailSent ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '14px', transition: 'all 0.3s'
                                }}
                            >
                                {testEmailSent ? 'Email queued to system log!' : <><Send size={15} /> Send Test Email</>}
                            </button>
                            <button
                                onClick={() => { setTestEmailSetting(null); setTestEmailSent(false); }}
                                style={{ padding: '11px 20px', background: '#f1f5f9', border: '1px solid #1e293b', borderRadius: '10px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

