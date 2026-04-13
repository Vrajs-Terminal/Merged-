import { useState, useEffect } from 'react';
import {
    MapPin, Calendar as CalendarIcon, Phone, Building, Flag, AlignLeft,
    Plus, Search, Edit2, X, Save, Clock, Loader2
, Route} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import './visit.css'; // New shared visit CSS file we'll create

export default function VisitPlanning() {
    const user = useAuthStore(state => state.user);
    const [visits, setVisits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [visitData, setVisitData] = useState({
        id: null as number | null,
        date: new Date().toISOString().split('T')[0],
        client_name: '',
        client_contact: '',
        company_name: '',
        city: '',
        address: '',
        purpose: '',
        priority_level: 'Medium',
        remarks: ''
    });

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/visits?status=Planned&user_id=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                setVisits(data);
            }
        } catch (error) {
            console.error("Failed to load visits", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVisitData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddClick = () => {
        setVisitData({
            id: null,
            date: new Date().toISOString().split('T')[0],
            client_name: '',
            client_contact: '',
            company_name: '',
            city: '',
            address: '',
            purpose: '',
            priority_level: 'Medium',
            remarks: ''
        });
        setIsModalOpen(true);
    };

    const handleEditClick = (visit: any) => {
        setVisitData({
            id: visit.id,
            date: new Date(visit.date).toISOString().split('T')[0],
            client_name: visit.client_name,
            client_contact: visit.client_contact || '',
            company_name: visit.company_name || '',
            city: visit.city || '',
            address: visit.address || '',
            purpose: visit.purpose || '',
            priority_level: visit.priority_level || 'Medium',
            remarks: visit.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (statusOverride?: string) => {
        if (!visitData.client_name || !visitData.date) {
            alert('Client Name and Date are required.');
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...visitData,
                status: statusOverride || 'Planned' // Submit as Planned by default from this UI
            };

            const url = visitData.id ? `/api/visits/${visitData.id}` : '/api/visits';
            const method = visitData.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchVisits();
                setIsModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save visit');
            }
        } catch (error) {
            console.error("Error saving visit", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const getPriorityColor = (level: string) => {
        switch (level) {
            case 'High': return '#ef4444'; // Red
            case 'Medium': return '#f59e0b'; // Orange
            case 'Low': return '#3b82f6'; // Blue
            default: return '#64748b'; // Slate
        }
    };

    return (
        <div className="visit-layout">

            <div className="visit-header-banner">
                <div>
                    <h2 className="visit-title"><Route className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Visit Planning</h2>
                    <p className="visit-subtitle">Schedule and organize your upcoming field visits and client meetings.</p>
                </div>
                <button className="btn-visit-primary" onClick={handleAddClick}>
                    <Plus size={18} /> Schedule New Visit
                </button>
            </div>

            <div className="visit-filters">
                <div className="search-group">
                    <Search size={16} color="#64748b" />
                    <input type="text" placeholder="Search by client or company..." />
                </div>

                <input type="month" className="date-filter-input" defaultValue={new Date().toISOString().slice(0, 7)} />
            </div>

            {isLoading ? (
                <div className="visit-loading">
                    <Loader2 className="spinner" size={40} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
                    <p>Loading your schedule...</p>
                </div>
            ) : visits.length > 0 ? (
                <div className="visit-grid">
                    {visits.map((visit) => (
                        <div key={visit.id} className="visit-card">
                            <div className="visit-card-header">
                                <div className="client-info">
                                    <h3 className="client-name">{visit.client_name}</h3>
                                    {visit.company_name && <span className="company-badge"><Building size={12} /> {visit.company_name}</span>}
                                </div>
                                <span className="priority-ring" style={{ border: `2px solid ${getPriorityColor(visit.priority_level)}` }}>
                                    <Flag size={12} color={getPriorityColor(visit.priority_level)} /> {visit.priority_level}
                                </span>
                            </div>

                            <div className="visit-card-body">
                                <div className="info-row">
                                    <CalendarIcon size={14} className="info-icon" />
                                    <span>{new Date(visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {visit.city && (
                                    <div className="info-row">
                                        <MapPin size={14} className="info-icon" />
                                        <span>{visit.city}</span>
                                    </div>
                                )}
                                {visit.client_contact && (
                                    <div className="info-row">
                                        <Phone size={14} className="info-icon" />
                                        <span>{visit.client_contact}</span>
                                    </div>
                                )}
                                {visit.purpose && (
                                    <p className="visit-purpose"><AlignLeft size={14} /> {visit.purpose}</p>
                                )}
                            </div>

                            <div className="visit-card-footer">
                                <span className={`status-chip status-${visit.status.replace(' ', '-').toLowerCase()}`}>
                                    <Clock size={12} /> {visit.status}
                                </span>
                                <button className="btn-icon-soft" onClick={() => handleEditClick(visit)} title="Edit Plan">
                                    <Edit2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="visit-empty-state">
                    <CalendarIcon size={48} color="#cbd5e1" />
                    <h3>No visits planned</h3>
                    <p>You don't have any upcoming visits scheduled yet.</p>
                    <button className="btn-visit-outline" onClick={handleAddClick} style={{ marginTop: '16px' }}>
                        Start Planning
                    </button>
                </div>
            )
            }

            {/* Schedule Visit Modal */}
            {
                isModalOpen && (
                    <div className="visit-modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="visit-modal-content" onClick={e => e.stopPropagation()}>
                            <div className="visit-modal-header">
                                <h3>{visitData.id ? 'Edit Visit Plan' : 'Schedule New Visit'}</h3>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="visit-modal-body">
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Client Name <span className="req">*</span></label>
                                        <input type="text" name="client_name" value={visitData.client_name} onChange={handleFormChange} className="visit-input" placeholder="Enter contact person" />
                                    </div>
                                    <div className="form-group">
                                        <label>Date <span className="req">*</span></label>
                                        <input type="date" name="date" value={visitData.date} onChange={handleFormChange} className="visit-input" />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Company Name</label>
                                        <input type="text" name="company_name" value={visitData.company_name} onChange={handleFormChange} className="visit-input" placeholder="e.g. Acme Corp" />
                                    </div>
                                    <div className="form-group">
                                        <label>Contact Number</label>
                                        <input type="text" name="client_contact" value={visitData.client_contact} onChange={handleFormChange} className="visit-input" placeholder="Phone or Mobile" />
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" name="city" value={visitData.city} onChange={handleFormChange} className="visit-input" placeholder="e.g. Mumbai" />
                                    </div>
                                    <div className="form-group">
                                        <label>Priority Level</label>
                                        <select name="priority_level" value={visitData.priority_level} onChange={handleFormChange} className="visit-input">
                                            <option value="High">High Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="Low">Low Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Full Address</label>
                                    <textarea name="address" value={visitData.address} onChange={handleFormChange} className="visit-input" rows={2} placeholder="Meeting location details..."></textarea>
                                </div>

                                <div className="form-group">
                                    <label>Purpose of Visit</label>
                                    <textarea name="purpose" value={visitData.purpose} onChange={handleFormChange} className="visit-input" rows={2} placeholder="What is the agenda for this meeting?"></textarea>
                                </div>
                            </div>

                            <div className="visit-modal-footer">
                                <button className="btn-visit-secondary" onClick={() => handleSubmit('Draft')} disabled={isSaving}>
                                    Save as Draft
                                </button>
                                <div className="footer-actions-right">
                                    <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn-visit-primary" onClick={() => handleSubmit('Planned')} disabled={isSaving}>
                                        {isSaving ? <Loader2 size={16} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                                        {isSaving ? 'Saving...' : (visitData.id ? 'Update Plan' : 'Submit Plan')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
