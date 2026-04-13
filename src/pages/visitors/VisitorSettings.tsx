import { useState, useEffect } from 'react';
import {
    Save, Loader2, Info, LayoutDashboard,
    ToggleLeft, ToggleRight, ShieldAlert, Clock,
    Monitor, CheckCircle2, XCircle
} from 'lucide-react';
import './visitors.css';

interface VisitorSetting {
    key: string;
    value: string;
    type: string;
}

export default function VisitorSettings() {
    const [settings, setSettings] = useState<VisitorSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/visitors/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.length === 0) {
                    await fetch('/api/visitors/settings/initialize-defaults', { method: 'POST' });
                    const resRefreshed = await fetch('/api/visitors/settings');
                    setSettings(await resRefreshed.json());
                } else {
                    setSettings(data);
                }
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleToggle = (key: string) => {
        setSettings(prev => prev.map(s => {
            if (s.key === key) {
                return { ...s, value: s.value === 'Yes' ? 'No' : 'Yes' };
            }
            return s;
        }));
    };

    const handleInputChange = (key: string, value: string) => {
        setSettings(prev => prev.map(s => {
            if (s.key === key) return { ...s, value };
            return s;
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/visitors/settings/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert("Settings saved successfully!");
        } catch (e) {
            console.error(e);
            alert("Error saving settings.");
        } finally { setIsSaving(false); }
    };

    const renderSetting = (s: VisitorSetting) => {
        if (s.type === 'Boolean') {
            return (
                <button 
                    className="status-toggle-btn" 
                    onClick={() => handleToggle(s.key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    {s.value === 'Yes' ? <ToggleRight size={32} color="#22c55e" /> : <ToggleLeft size={32} color="#94a3b8" />}
                </button>
            );
        }
        return (
            <input 
                type={s.type === 'Number' ? 'number' : 'text'} 
                className="form-input" 
                style={{ width: '120px', textAlign: 'center', height: '40px' }}
                value={s.value}
                onChange={e => handleInputChange(s.key, e.target.value)}
            />
        );
    };

    const getIcon = (key: string) => {
        if (key.includes('TIME')) return <Clock size={18} color="#3b82f6" />;
        if (key.includes('AUTO')) return <ShieldAlert size={18} color="#f59e0b" />;
        return <Monitor size={18} color="#6366f1" />;
    };

    return (
        <div className="visitors-layout">
            <div className="v-header-bar">
                <div className="v-header-left">
                    <LayoutDashboard size={24} color="#3b82f6" />
                    <h1>Visitors System Settings</h1>
                </div>
                <div className="bgv-header-actions">
                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>

            <div className="table-card" style={{ background: '#fff', borderRadius: '24px', padding: '30px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', padding: '16px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                    <Info size={20} color="#0284c7" />
                    <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 500 }}>Settings defined here will control mandatory fields in the visitor check-in form.</span>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <Loader2 size={32} className="spin" style={{ margin: '0 auto', color: '#3b82f6' }} />
                        <div style={{ marginTop: '14px', color: '#64748b' }}>Consulting system parameters...</div>
                    </div>
                ) : (
                    <div className="v-settings-list fade-in">
                        {settings.map((s) => (
                            <div className="v-setting-row" key={s.key}>
                                <div className="v-setting-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {getIcon(s.key)}
                                        <h4>{s.key.replace(/_/g, ' ')}</h4>
                                    </div>
                                    <p>Configure {s.key.toLowerCase().replace(/_/g, ' ')} requirement/value.</p>
                                </div>
                                <div className="v-setting-action">
                                    {renderSetting(s)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
