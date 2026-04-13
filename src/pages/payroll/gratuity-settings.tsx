import { useState, useEffect } from 'react';
import { Save, PiggyBank, ShieldCheck, Calculator, Info, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import './gratuity-settings.css';
import { toast } from 'react-hot-toast';

interface EarningType {
    id: number;
    name: string;
}

const GratuitySettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [earningTypes, setEarningTypes] = useState<EarningType[]>([]);
    
    const [formData, setFormData] = useState({
        enabled: false,
        min_service_years: 5,
        formula: "(Last Drawn Salary × 15 × Number of Completed Years) / 26",
        included_components: [] as string[],
        max_limit: 2000000,
        round_off: true,
        applicable_on_resignation: true,
        auto_calculate_fnf: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settingsRes, earningsRes] = await Promise.all([
                api.get('/gratuity-settings'),
                api.get('/earning-deduction-types')
            ]);
            
            if (settingsRes.data) {
                setFormData({
                    ...settingsRes.data,
                    included_components: Array.isArray(settingsRes.data.included_components) 
                        ? settingsRes.data.included_components 
                        : []
                });
            }

            // Only show earnings (not deductions) for gratuity calculation
            const earnings = earningsRes.data
                .filter((t: any) => t.type === 'Earning' && t.status === 'Active')
                .map((t: any) => ({ id: t.id, name: t.name }));
            setEarningTypes(earnings);

        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComponent = (name: string) => {
        setFormData(prev => {
            const current = [...prev.included_components];
            if (current.includes(name)) {
                return { ...prev, included_components: current.filter(c => c !== name) };
            } else {
                return { ...prev, included_components: [...current, name] };
            }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.post('/gratuity-settings', formData);
            toast.success("Settings saved successfully");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="gratuity-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 className="spinner" size={40} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
            </div>
        );
    }

    return (
        <div className="gratuity-layout">
            <div className="gratuity-container">
                <div className="gratuity-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <PiggyBank size={32} className="page-title-icon text-indigo-600" />
                            <h2>Gratuity Settings</h2>
                        </div>
                        <p>Configure gratuity calculation rules for employee settlement</p>
                    </div>
                </div>

                <div className="gratuity-body">
                    {/* General Section */}
                    <div className="settings-section">
                        <div className="section-title"><ShieldCheck size={18} /> Eligibility & Status</div>
                        <div className="settings-grid">
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Enable Gratuity Calculation</p>
                                    <span>Activate or deactivate gratuity in payroll</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.enabled}
                                        onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Minimum Service Years</p>
                                    <span>Required years for eligibility</span>
                                </div>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    style={{ width: '80px' }}
                                    value={formData.min_service_years}
                                    onChange={e => setFormData({ ...formData, min_service_years: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculation Section */}
                    <div className="settings-section">
                        <div className="section-title"><Calculator size={20} /> Calculation Formula & Components</div>
                        
                        <div className="formula-card">
                            <textarea 
                                className="formula-textarea" 
                                rows={2} 
                                value={formData.formula}
                                onChange={e => setFormData({ ...formData, formula: e.target.value })}
                            />
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={12} />
                                Last Drawn Salary = Basic + DA (or selected components below)
                            </div>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <label className="row-label" style={{ marginBottom: '16px', display: 'block' }}>
                                <p>Include in "Last Drawn Salary" Calculation</p>
                                <span>Select components that constitute the base for gratuity</span>
                            </label>
                            <div className="component-selector" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                {earningTypes.map(type => (
                                    <div 
                                        key={type.id}
                                        className={`component-chip ${formData.included_components.includes(type.name) ? 'selected' : ''}`}
                                        onClick={() => handleToggleComponent(type.name)}
                                    >
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: formData.included_components.includes(type.name) ? 'white' : '#cbd5e1' }}></div>
                                        {type.name}
                                    </div>
                                ))}
                                {earningTypes.length === 0 && (
                                    <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                        No active earning types found. Please create them in Earning/Deduction Type module.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="settings-grid" style={{ marginTop: '32px' }}>
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Maximum Limit</p>
                                    <span>Statutory upper cap (₹)</span>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.875rem' }}>₹</span>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        style={{ width: '160px', paddingLeft: '28px' }}
                                        value={formData.max_limit}
                                        onChange={e => setFormData({ ...formData, max_limit: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Round Off Payout</p>
                                    <span>Round to nearest rupee</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.round_off}
                                        onChange={e => setFormData({ ...formData, round_off: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Policy Section */}
                    <div className="settings-section">
                        <div className="section-title"><Info size={18} /> Payout Policies</div>
                        <div className="settings-grid">
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Applicable After Resignation</p>
                                    <span>If employee resigns after min. service</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.applicable_on_resignation}
                                        onChange={e => setFormData({ ...formData, applicable_on_resignation: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-row">
                                <div className="row-label">
                                    <p>Auto-Calculate in F&F</p>
                                    <span>Include in Full & Final Settlement</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.auto_calculate_fnf}
                                        onChange={e => setFormData({ ...formData, auto_calculate_fnf: e.target.checked })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="benefit-card">
                        <strong>Benefits</strong>
                        <ul>
                            <li><CheckCircle2 size={14} /> Ensures compliance with gratuity rules</li>
                            <li><CheckCircle2 size={14} /> Automatic calculation during resignation</li>
                            <li><CheckCircle2 size={14} /> Reduces manual calculation errors</li>
                        </ul>
                    </div>
                </div>

                <div className="save-bar">
                    <button className="btn-save-settings" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="spinner" size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GratuitySettings;
