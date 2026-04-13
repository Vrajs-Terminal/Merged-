import { useState, useEffect } from 'react';
import {
    MapPin, Camera, Navigation, CheckCircle, UploadCloud, X, AlertCircle, Loader2
, MapPinned} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import './visit.css';

export default function VisitCheckInOut() {
    const user = useAuthStore(state => state.user);
    const [visits, setVisits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActioning, setIsActioning] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null);

    // Sensors
    const [coords, setCoords] = useState<{ lat: string, lng: string } | null>(null);
    const [locationError, setLocationError] = useState('');

    // Check-Out Form State
    const [workSummary, setWorkSummary] = useState('');
    const [nextFollowUp, setNextFollowUp] = useState('');

    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
        setIsLoading(true);
        try {
            // Get all Planned and Checked-In visits for today or generally active ones
            const res = await fetch(`/api/visits?user_id=${user?.id}`);
            if (res.ok) {
                const data = await res.json();
                const activeVisits = data.filter((v: any) => v.status === 'Planned' || v.status === 'Checked-In');
                setVisits(activeVisits);
            }
        } catch (error) {
            console.error("Failed to load visits", error);
        } finally {
            setIsLoading(false);
        }
    };

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude.toString(),
                    lng: position.coords.longitude.toString()
                });
                setLocationError('');
            },
            () => {
                setLocationError('Unable to retrieve your location');
            }
        );
    };

    const handleActionClick = (visit: any, type: 'checkin' | 'checkout') => {
        setSelectedVisit(visit);
        setActionType(type);
        setCoords(null);
        setLocationError('');
        setWorkSummary('');
        setNextFollowUp('');
        requestLocation();
    };

    const submitAction = async () => {
        if (!coords) {
            alert('Location coordinates are required before proceeding.');
            return;
        }

        if (actionType === 'checkout' && !workSummary) {
            alert('Work summary is required before checking out.');
            return;
        }

        setIsActioning(true);
        try {
            const url = `/api/visits/${selectedVisit.id}/${actionType === 'checkin' ? 'check-in' : 'check-out'}`;
            const payload: any = {
                latitude: coords.lat,
                longitude: coords.lng
            };

            if (actionType === 'checkout') {
                payload.work_summary = workSummary;
                if (nextFollowUp) payload.next_follow_up_date = nextFollowUp;
                // Add mock photo/doc uploads here later
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await fetchVisits();
                setSelectedVisit(null);
                setActionType(null);
            } else {
                const err = await res.json();
                alert(err.error || 'Action failed');
            }
        } catch (error) {
            console.error("Action error", error);
            alert("Network error.");
        } finally {
            setIsActioning(false);
        }
    };

    return (
        <div className="visit-layout">
            <div className="visit-header-banner" style={{ background: 'linear-gradient(135deg, #0f766e, #064e3b)' }}>
                <div>
                    <h2 className="visit-title"><MapPinned className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Field Execution</h2>
                    <p className="visit-subtitle">Record your arrival and departure at client locations.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="visit-loading">
                    <Loader2 className="spinner" size={40} style={{ color: '#0d9488', animation: 'spin 1s linear infinite' }} />
                    <p>Loading active visits...</p>
                </div>
            ) : visits.length > 0 ? (
                <div className="visit-grid">
                    {visits.map(visit => (
                        <div key={visit.id} className="visit-card" style={{ borderLeft: `4px solid ${visit.status === 'Checked-In' ? '#10b981' : '#f59e0b'}` }}>
                            <div className="visit-card-header" style={{ paddingBottom: '12px' }}>
                                <div>
                                    <h3 className="client-name">{visit.client_name}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{visit.company_name || visit.city}</p>
                                </div>
                                <span className={`status-chip status-${visit.status.replace(' ', '-').toLowerCase()}`}>
                                    {visit.status}
                                </span>
                            </div>

                            <div className="visit-card-body" style={{ background: '#f8fafc', margin: '0 16px', padding: '12px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Agenda</div>
                                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b' }}>{visit.purpose || 'No agenda provided'}</p>
                            </div>

                            <div className="visit-card-footer" style={{ borderTop: 'none', paddingTop: '12px' }}>
                                {visit.status === 'Planned' ? (
                                    <button
                                        onClick={() => handleActionClick(visit, 'checkin')}
                                        style={{ width: '100%', padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <MapPin size={18} /> Proceed to Check-In
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleActionClick(visit, 'checkout')}
                                        style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <CheckCircle size={18} /> Complete & Check-Out
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="visit-empty-state">
                    <Navigation size={48} color="#cbd5e1" />
                    <h3>No active visits</h3>
                    <p>You don't have any pending visits to check into today.</p>
                </div>
            )}

            {/* Action Modal */}
            {selectedVisit && actionType && (
                <div className="visit-modal-overlay" onClick={() => { setSelectedVisit(null); setActionType(null); }}>
                    <div className="visit-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="visit-modal-header" style={{ background: actionType === 'checkin' ? '#f59e0b' : '#10b981', color: 'white' }}>
                            <h3 style={{ color: 'white' }}>
                                {actionType === 'checkin' ? 'Check-In' : 'Check-Out'} - {selectedVisit.client_name}
                            </h3>
                            <button className="close-btn" style={{ color: 'white' }} onClick={() => { setSelectedVisit(null); setActionType(null); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="visit-modal-body">

                            {/* GPS Status */}
                            <div style={{ background: coords ? '#dcfce7' : '#fee2e2', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                {coords ? <CheckCircle color="#15803d" size={20} /> : <AlertCircle color="#b91c1c" size={20} />}
                                <div>
                                    <div style={{ fontWeight: 600, color: coords ? '#15803d' : '#b91c1c', fontSize: '14px' }}>
                                        {coords ? 'Location Acquired' : 'Getting Location...'}
                                    </div>
                                    <div style={{ fontSize: '12px', color: coords ? '#166534' : '#991b1b', marginTop: '4px' }}>
                                        {coords ? `${coords.lat}, ${coords.lng}` : locationError || 'Please allow location tracking to proceed.'}
                                    </div>
                                    {!coords && <button onClick={requestLocation} style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #b91c1c', background: 'transparent', color: '#b91c1c', cursor: 'pointer' }}>Retry Location</button>}
                                </div>
                            </div>

                            {/* Check Out Fields */}
                            {actionType === 'checkout' && (
                                <>
                                    <div className="form-group">
                                        <label>Work Summary / Discussion Notes <span className="req">*</span></label>
                                        <textarea
                                            className="visit-input"
                                            placeholder="What was discussed or resolved?"
                                            value={workSummary}
                                            onChange={(e) => setWorkSummary(e.target.value)}
                                            rows={4}
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Next Follow-Up Date</label>
                                        <input
                                            type="date"
                                            className="visit-input"
                                            value={nextFollowUp}
                                            onChange={(e) => setNextFollowUp(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                                        <UploadCloud size={24} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
                                        Upload documents or signatures (Mock disabled)
                                    </div>
                                </>
                            )}

                            {/* Check In Fields */}
                            {actionType === 'checkin' && (
                                <div style={{ border: '1px dashed #cbd5e1', padding: '24px 16px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                                    <Camera size={32} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
                                    Selfie / Site Photo (Mock disabled)
                                </div>
                            )}

                        </div>

                        <div className="visit-modal-footer">
                            <button className="btn-cancel" onClick={() => { setSelectedVisit(null); setActionType(null); }}>Cancel</button>
                            <button
                                className="btn-visit-primary"
                                style={{ background: actionType === 'checkin' ? '#d97706' : '#059669' }}
                                onClick={submitAction}
                                disabled={isActioning || !coords}
                            >
                                {isActioning ? <Loader2 size={16} className="spinner" /> : (actionType === 'checkin' ? <MapPin size={16} /> : <CheckCircle size={16} />)}
                                {isActioning ? 'Processing...' : (actionType === 'checkin' ? 'Submit Check-In' : 'Submit Check-Out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
