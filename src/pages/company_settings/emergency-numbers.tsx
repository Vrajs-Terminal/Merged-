import { useState, useEffect } from 'react';
import { Phone, Plus, Edit2, Trash2, X, Save, AlertTriangle, Shield, Flame, Info, Loader2 , PhoneCall} from 'lucide-react';
import './emergency-numbers.css';
import './assign-employee-grade.css'; // Reuse table and modal styles

interface EmergencyContact {
    id: string; // db id
    contactName: string;
    number: string;
    type: 'Medical' | 'Security' | 'Fire' | 'Other';
    status: 'Active' | 'Inactive';
}

export default function EmergencyNumbers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [contactName, setContactName] = useState('');
    const [number, setNumber] = useState('');
    const [type, setType] = useState<'Medical' | 'Security' | 'Fire' | 'Other'>('Medical');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/emergency-numbers');
            if (res.ok) {
                const data = await res.json();
                const mapped: EmergencyContact[] = data.map((item: { id: number, contact_name: string, number: string, type: 'Medical' | 'Security' | 'Fire' | 'Other', status: 'Active' | 'Inactive' }) => ({
                    id: item.id.toString(),
                    contactName: item.contact_name,
                    number: item.number,
                    type: item.type,
                    status: item.status
                }));
                setContacts(mapped);
            }
        } catch (error) {
            console.error("Failed to load emergency contacts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddClick = () => {
        setEditingContact(null);
        setContactName('');
        setNumber('');
        setType('Medical');
        setStatus('Active');
        setIsModalOpen(true);
    };

    const handleEditClick = (contact: EmergencyContact) => {
        setEditingContact(contact);
        setContactName(contact.contactName);
        setNumber(contact.number);
        setType(contact.type);
        setStatus(contact.status);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this emergency number?")) return;
        try {
            const res = await fetch(`/api/emergency-numbers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                alert("Failed to delete contact.");
            }
        } catch (error) {
            console.error("Error deleting contact", error);
        }
    };

    const handleSave = async () => {
        if (!contactName || !number || !type) {
            alert('Please fill out all required fields.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                contact_name: contactName,
                number,
                type,
                status
            };

            let res;
            if (editingContact) {
                res = await fetch(`/api/emergency-numbers/${editingContact.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch('/api/emergency-numbers', {
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
                alert(err.error || 'Failed to save emergency contact');
            }
        } catch (error) {
            console.error("Error saving contact", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const getTypeIcon = (cType: string) => {
        switch (cType) {
            case 'Medical': return <AlertTriangle size={14} />;
            case 'Security': return <Shield size={14} />;
            case 'Fire': return <Flame size={14} />;
            default: return <Info size={14} />;
        }
    };

    const getTypeClass = (cType: string) => {
        switch (cType) {
            case 'Medical': return 'type-medical';
            case 'Security': return 'type-security';
            case 'Fire': return 'type-fire';
            default: return 'type-other';
        }
    };

    return (
        <div className="emergency-layout">
            <div className="table-card">
                <div className="table-header-title">
                    <h2><PhoneCall className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Emergency Contact Numbers</h2>
                    <button className="btn-primary" onClick={handleAddClick}>
                        <Plus size={16} /> Add Emergency Number
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '80px' }}>Sr. No</th>
                            <th>Contact Name / Department</th>
                            <th>Number</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                                    <Loader2 className="spinner" size={24} style={{ margin: '0 auto', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                                    <div style={{ marginTop: '10px', color: '#64748b' }}>Loading contacts...</div>
                                </td>
                            </tr>
                        ) : contacts.length > 0 ? (
                            contacts.map((contact, index) => (
                                <tr key={contact.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{contact.contactName}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Phone size={14} className="text-gray" />
                                            <span className="number-display">{contact.number}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-badge ${getTypeClass(contact.type)}`}>
                                            {getTypeIcon(contact.type)} {contact.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${contact.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon-only" title="Edit" onClick={() => handleEditClick(contact)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon-only delete" title="Delete" onClick={() => handleDelete(contact.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                    No emergency contacts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3><Phone size={20} className="text-blue" /> {editingContact ? 'Edit Emergency Number' : 'Add Emergency Number'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label>Contact Name / Department <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. City Hospital, HR Manager..."
                                    value={contactName}
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g. +91 98765 43210"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label>Emergency Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    className="form-select"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as 'Medical' | 'Security' | 'Fire' | 'Other')}
                                >
                                    <option value="Medical">Medical</option>
                                    <option value="Security">Security</option>
                                    <option value="Fire">Fire</option>
                                    <option value="Other">Other</option>
                                </select>
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
                                {isSaving ? 'Saving...' : 'Save Contact'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
