import { useState, useEffect } from 'react';
import {
    Save, Settings2, ShieldCheck, MapPin, Camera,
    PenTool, Loader2, Power, UserPlus, FileCheck2, Fingerprint
, Settings} from 'lucide-react';
import './visit.css';

interface VisitSettings {
    enable_module: boolean;
    allow_creation_by_employees: boolean;
    mandatory_checkin_checkout: boolean;
    enable_gps_tracking: boolean;
    enable_photo_upload: boolean;
    enable_customer_signature: boolean;
    visit_approval_required: boolean;
}

export default function VisitSettingsPage() {
    const [settings, setSettings] = useState<VisitSettings>({
        enable_module: true,
        allow_creation_by_employees: true,
        mandatory_checkin_checkout: true,
        enable_gps_tracking: true,
        enable_photo_upload: false,
        enable_customer_signature: false,
        visit_approval_required: true,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/visits/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error("Failed to load visit settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (key: keyof VisitSettings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/visits/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                alert("Settings saved successfully!");
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error("Error saving settings", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                <Loader2 className="spinner" size={40} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 500 }}>Initializing Configurations...</p>
            </div>
        );
    }

    return (
        <div className="visit-layout">
            <div className="visit-header-banner" style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)', padding: '12px',
                        borderRadius: '12px', backdropFilter: 'blur(10px)'
                    }}>
                        <Settings2 size={26} color="#ffffff" />
                    </div>
                    <div>
                        <h2 className="visit-title" style={{ color: '#fff' }}><Settings className="page-title-icon" size="1em" style={{ display: "inline-block", verticalAlign: "middle", marginRight: "8px", marginBottom: "2px" }} />Configure Visit Module</h2>
                        <p className="visit-subtitle" style={{ color: '#e0e7ff' }}>
                            Fine-tune the behavior, tracking rules, and permissions for field operations.
                        </p>
                    </div>
                </div>
                <button
                    className="btn-visit-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                        background: '#ffffff', color: '#4f46e5',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        padding: '10px 20px', fontSize: '14px', fontWeight: 600, borderRadius: '10px'
                    }}
                >
                    {isSaving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Main Enable Toggle - Top Level */}
                <div className={`setting-card-premium ${settings.enable_module ? 'active-module' : 'inactive-module'}`} style={{ marginBottom: '32px', borderLeft: settings.enable_module ? '4px solid #10b981' : '4px solid #ef4444' }}>
                    <div className="setting-card-header" style={{ marginBottom: 0, alignItems: 'center' }}>
                        <div className="setting-card-icon-title">
                            <div className={`setting-icon-wrapper ${settings.enable_module ? 'icon-emerald' : 'icon-rose'}`}>
                                <Power size={22} />
                            </div>
                            <div>
                                <h3 className="setting-title-text" style={{ fontSize: '18px' }}>Module Activation</h3>
                                <p className="setting-description-text" style={{ marginTop: '4px' }}>Turn on or off the entire Visit Management module for all employees.</p>
                            </div>
                        </div>
                        <label className="premium-switch">
                            <input type="checkbox" checked={settings.enable_module} onChange={() => handleToggle('enable_module')} />
                            <span className="premium-slider"></span>
                        </label>
                    </div>
                </div>

                <div className="setting-section-title">
                    <div className="setting-section-title-icon"><ShieldCheck size={18} /></div>
                    Permissions & Workflows
                </div>
                <div className="settings-grid-premium">

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-indigo">
                                    <UserPlus size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">Employee Creation</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.allow_creation_by_employees} onChange={() => handleToggle('allow_creation_by_employees')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Allow field staff to schedule and create their own visit plans. If disabled, only managers will assign visits to them.</p>
                    </div>

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-amber">
                                    <FileCheck2 size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">Manager Approval</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.visit_approval_required} onChange={() => handleToggle('visit_approval_required')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Require managerial review on completed visits. Check-outs will sit in a pending queue until approved by a superior.</p>
                    </div>

                </div>

                <div className="setting-section-title" style={{ marginTop: '40px' }}>
                    <div className="setting-section-title-icon"><Fingerprint size={18} /></div>
                    Check-In & Tracing Rules
                </div>
                <div className="settings-grid-premium">

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-rose">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">Strict Check-In</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.mandatory_checkin_checkout} onChange={() => handleToggle('mandatory_checkin_checkout')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Enforce a strict step-by-step state machine. Users cannot mark visits completed without explicitly doing a digital Check-In and Check-Out punch.</p>
                    </div>

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-blue">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">GPS Geotracking</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.enable_gps_tracking} onChange={() => handleToggle('enable_gps_tracking')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Automatically capture the exact latitude and longitude of the user's mobile device when they trigger check-in button.</p>
                    </div>

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-purple">
                                    <Camera size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">Photo Proof</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.enable_photo_upload} onChange={() => handleToggle('enable_photo_upload')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Require or allow the attachment of camera photos (e.g., storefront, meeting room) during the visit progression.</p>
                    </div>

                    <div className="setting-card-premium">
                        <div className="setting-card-header">
                            <div className="setting-card-icon-title">
                                <div className="setting-icon-wrapper icon-emerald">
                                    <PenTool size={20} />
                                </div>
                                <div>
                                    <h3 className="setting-title-text">Client Signature</h3>
                                </div>
                            </div>
                            <label className="premium-switch">
                                <input type="checkbox" checked={settings.enable_customer_signature} onChange={() => handleToggle('enable_customer_signature')} />
                                <span className="premium-slider"></span>
                            </label>
                        </div>
                        <p className="setting-description-text">Render a digital signature canvas upon check-out for the client to sign with their finger / stylus for verifiable proof of engagement.</p>
                    </div>
                </div>

                {/* Spacer padding for scrolling */}
                <div style={{ height: '40px' }}></div>
            </div>
        </div>
    );
}
