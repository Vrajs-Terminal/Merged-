import { useState, useEffect } from 'react';
import {
    Plus, Trash2, X, Save, Loader2, Mail, 
    Send, AlertCircle, Info, CheckCircle2
} from 'lucide-react';
import './complaints.css';

interface ReceiptEmail {
    id: number;
    email: string;
    createdAt: string;
}

export default function ComplaintEmailConfig() {
    const [emails, setEmails] = useState<ReceiptEmail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        fetchEmails();
    }, []);

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/complaints/config');
            if (res.ok) setEmails(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const handleAdd = async () => {
        if (!newEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid Email");
        if (emails.length >= 10) return alert("Max 10 recipients allowed");

        setIsSaving(true);
        try {
            const res = await fetch('/api/complaints/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });
            if (res.ok) {
                setNewEmail('');
                setIsModalOpen(false);
                fetchEmails();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to add email");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Remove this recipient?")) return;
        try {
            const res = await fetch(`/api/complaints/config/${id}`, { method: 'DELETE' });
            if (res.ok) fetchEmails();
        } catch (e) { console.error(e); }
    };

    return (
        <div className="complaints-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <Mail size={24} color="#3b82f6" />
                    <h1>Complaint Email Receipt Configuration</h1>
                </div>
                <button className="btn-add" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Add Recipient
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                <div className="table-card" style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b' }}>Active Recipients</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>These emails will receive automated alerts for new complaints and status changes.</p>
                    </div>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Email ID</th>
                                <th>Added On</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spin" size={24} /></td></tr>
                            ) : emails.length > 0 ? emails.map((e, i) => (
                                <tr key={e.id} className="fade-in">
                                    <td>{i + 1}</td>
                                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{e.email}</td>
                                    <td style={{ color: '#64748b', fontSize: '13px' }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-icon-only delete" onClick={() => handleDelete(e.id)}><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No recipients configured yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="fade-in" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '24px', height: 'fit-content' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={18} color="#3b82f6" /> System Behavior
                    </h3>
                    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>New Complaint Alert</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Sent instantly to all recipients when an employee raises a new case.</div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Status Transitions</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Alerts triggered when status moves from 'Open' to 'In Progress' or 'Closed'.</div>
                        </div>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>SLA Warnings</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Daily summary of cases nearing or exceeding their resolution limit.</div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', borderRadius: '24px' }}>
                        <div className="modal-header">
                            <h3>Add Recipient</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Recipient Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="email" 
                                        className="form-input" 
                                        placeholder="admin@minehr.com" 
                                        style={{ paddingLeft: '40px' }}
                                        value={newEmail}
                                        onChange={e => setNewEmail(e.target.value)}
                                    />
                                    <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', background: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
                                <AlertCircle size={16} color="#3b82f6" />
                                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600 }}>Up to 10 emails can be added for multi-admin notifications.</span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleAdd} disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                                Add Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
