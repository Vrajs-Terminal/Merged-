import { useState, useEffect } from 'react';
import { MessageCircle, Edit2, Trash2, X, Save, Send, Activity, Loader2 , MessageSquare} from 'lucide-react';
import './whatsapp-alerts.css';
import './assign-employee-grade.css'; // Reuse table and modal styles

interface WhatsAppAlert {
    id: string; // db id
    alertName: string;
    triggerEvent: string;
    recipientType: string;
    messageTemplate: string;
    status: 'Active' | 'Inactive';
}

export default function WhatsAppAlerts() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState<WhatsAppAlert | null>(null);

    const [alerts, setAlerts] = useState<WhatsAppAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [testPreviewAlert, setTestPreviewAlert] = useState<WhatsAppAlert | null>(null);
    const [testSent, setTestSent] = useState(false);

    // Form State
    const [alertName, setAlertName] = useState('');
    const [triggerEvent, setTriggerEvent] = useState('');
    const [recipientType, setRecipientType] = useState('Individual');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/whatsapp-alerts');
            if (res.ok) {
                const data = await res.json();
                const mapped: WhatsAppAlert[] = data.map((item: { id: number, alert_name: string, trigger_event: string, recipient_type: string, message_template: string, status: 'Active' | 'Inactive' }) => ({
                    id: item.id.toString(),
                    alertName: item.alert_name,
                    triggerEvent: item.trigger_event,
                    recipientType: item.recipient_type,
                    messageTemplate: item.message_template,
                    status: item.status
                }));
                setAlerts(mapped);
            }
        } catch (error) {
            console.error("Failed to load alerts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingAlert(null);
        setAlertName('');
        setTriggerEvent('');
        setRecipientType('Individual');
        setMessageTemplate('Hello {Employee Name},\n\nYour alert message here.');
        setStatus('Active');
        setIsModalOpen(true);
    };

    const handleEditClick = (alert: WhatsAppAlert) => {
        setEditingAlert(alert);
        setAlertName(alert.alertName);
        setTriggerEvent(alert.triggerEvent);
        setRecipientType(alert.recipientType);
        setMessageTemplate(alert.messageTemplate || 'Hello {Employee Name},\n\nSample loaded template.');
        setStatus(alert.status);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this alert?")) return;
        try {
            const res = await fetch(`/api/whatsapp-alerts/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to delete alert.");
            }
        } catch (error) {
            console.error("Error deleting alert", error);
        }
    };

    const handleSave = async () => {
        if (!alertName || !triggerEvent || !messageTemplate) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                alert_name: alertName,
                trigger_event: triggerEvent,
                recipient_type: recipientType,
                message_template: messageTemplate,
                status
            };

            let res;
            if (editingAlert) {
                res = await fetch(`/api/whatsapp-alerts/${editingAlert.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/whatsapp-alerts', {
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
                alert(err.error || 'Failed to save alert');
            }
        } catch (error) {
            console.error("Error saving alert", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const insertVariable = (variable: string) => {
        setMessageTemplate(prev => prev + ` {${variable}}`);
    };

    const openTestPreview = (alert: WhatsAppAlert) => {
        setTestSent(false);
        setTestPreviewAlert(alert);
    };

    const handleSendTestNotification = () => {
        // Simulate sending — in real-world, this would call WhatsApp API
        setTestSent(true);
        setTimeout(() => {
            setTestPreviewAlert(null);
            setTestSent(false);
        }, 2000);
    };

    return (
        <div className="whatsapp-layout">
            <div className="table-card">
                <div className="table-header-title">
                    <h2><MessageSquare className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />WhatsApp Alerts</h2>
                    <div className="header-actions">
                        <button className="btn-secondary" onClick={() => {
                            const activeAlert = alerts.find(a => a.status === 'Active');
                            if (activeAlert) openTestPreview(activeAlert);
                            else alert('No active alerts to test. Please add one first.');
                        }}>
                            <Send size={16} /> Send Test Alert
                        </button>
                        <button className="btn-whatsapp" onClick={handleAddClick}>
                            <MessageCircle size={16} /> Add Alert
                        </button>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Sr. No</th>
                            <th>Alert Name</th>
                            <th>Trigger Event</th>
                            <th>Recipient Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#10b981', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading alerts...</div>
                                </td>
                            </tr>
                        ) : alerts.length > 0 ? (
                            alerts.map((alert, index) => (
                                <tr key={alert.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{alert.alertName}</strong></td>
                                    <td>
                                        <span className="trigger-badge">
                                            <Activity size={12} /> {alert.triggerEvent}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="recipient-badge">
                                            {alert.recipientType}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${alert.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="Preview & Test Send" onClick={() => openTestPreview(alert)} style={{ color: '#10b981' }}>
                                                <Send size={15} />
                                            </button>
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(alert)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(alert.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No WhatsApp alerts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div className="modal-header">
                                <h3><MessageCircle size={20} className="text-green" /> {editingAlert ? 'Edit WhatsApp Alert' : 'Add WhatsApp Alert'}</h3>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Alert Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Leave Approval Notification"
                                        value={alertName}
                                        onChange={(e) => setAlertName(e.target.value)}
                                    />
                                </div>

                                <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label>Trigger Event <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={triggerEvent}
                                            onChange={(e) => setTriggerEvent(e.target.value)}
                                            style={{ marginTop: '8px' }}
                                        >
                                            <option value="">-- Select Event --</option>
                                            <option value="Attendance (Late In)">Attendance (Late In)</option>
                                            <option value="Attendance (Absent)">Attendance (Absent)</option>
                                            <option value="Leave Approved">Leave Approved</option>
                                            <option value="Payroll Processed">Payroll Processed</option>
                                            <option value="Employee Onboarding">Employee Onboarding</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Recipient Selection <span style={{ color: '#ef4444' }}>*</span></label>
                                        <select
                                            className="form-select"
                                            value={recipientType}
                                            onChange={(e) => setRecipientType(e.target.value)}
                                            style={{ marginTop: '8px' }}
                                        >
                                            <option value="Individual">Individual Employee</option>
                                            <option value="Department">Department</option>
                                            <option value="Branch">Branch</option>
                                            <option value="Employee Level">Employee Level / Grade</option>
                                            <option value="All Employees">All Employees</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Message Template <span style={{ color: '#ef4444' }}>*</span></label>
                                    <textarea
                                        className="form-textarea"
                                        style={{ height: '120px', fontFamily: 'inherit' }}
                                        placeholder="Type your WhatsApp message template here..."
                                        value={messageTemplate}
                                        onChange={(e) => setMessageTemplate(e.target.value)}
                                    ></textarea>

                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b' }}>Click to insert variable:</span>
                                        <div className="template-variables">
                                            <span className="variable-tag" onClick={() => insertVariable('Employee Name')}>Employee Name</span>
                                            <span className="variable-tag" onClick={() => insertVariable('Date')}>Date</span>
                                            <span className="variable-tag" onClick={() => insertVariable('Time')}>Time</span>
                                            <span className="variable-tag" onClick={() => insertVariable('Amount')}>Amount</span>
                                            <span className="variable-tag" onClick={() => insertVariable('Manager Name')}>Manager Name</span>
                                        </div>
                                    </div>

                                    <div className="message-preview">
                                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>Live Preview:</strong>
                                        {messageTemplate || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Message will appear here...</span>}
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
                                <button className="btn-secondary" style={{ marginRight: 'auto' }}>
                                    <Send size={16} /> Test Message
                                </button>
                                <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="btn-whatsapp" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                    {isSaving ? 'Saving...' : 'Save Alert'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Test Preview Modal */}
            {testPreviewAlert && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}
                    onClick={() => { setTestPreviewAlert(null); setTestSent(false); }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#fff', borderRadius: '16px', maxWidth: '420px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
                    >
                        <div style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px' }}>Message Preview</h3>
                            <button onClick={() => { setTestPreviewAlert(null); setTestSent(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1e293b' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alert:</span>
                                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b' }}>{testPreviewAlert.alertName}</p>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trigger:</span>
                                <p style={{ margin: '4px 0 0', color: '#475569' }}>{testPreviewAlert.triggerEvent}</p>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recipients:</span>
                                <p style={{ margin: '4px 0 0', color: '#475569' }}>{testPreviewAlert.recipientType}</p>
                            </div>

                            {/* Message bubble */}
                            <div style={{ background: '#dcf8c6', borderRadius: '12px 12px 0 12px', padding: '14px 16px', fontSize: '14px', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-wrap', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                                {testPreviewAlert.messageTemplate}
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>Preview only – won't actually send</div>

                            <button
                                onClick={handleSendTestNotification}
                                disabled={testSent}
                                style={{
                                    marginTop: '20px', width: '100%', padding: '12px',
                                    background: testSent ? '#22c55e' : 'linear-gradient(135deg, #25d366, #128c7e)',
                                    color: '#1e293b', border: 'none', borderRadius: '10px',
                                    fontWeight: 700, cursor: testSent ? 'default' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    fontSize: '14px', transition: 'all 0.3s'
                                }}
                            >
                                {testSent ? 'Sent to System Log!' : <><Send size={16} /> Send to System Notification Log</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
