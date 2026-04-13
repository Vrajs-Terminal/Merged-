import { useState, useEffect } from 'react';
import {
    Settings, ChevronDown, Save, Loader2, CheckCircle2,
    FileText, DollarSign, Building2, PenTool, AlertTriangle, Calendar
} from 'lucide-react';
import './payroll-tax-settings.css';
import '../company_settings/assign-employee-grade.css';

interface PayrollSettings {
    payslipFormat: string;
    publishedSlipDurationLimit: number;
    showRoundOff: boolean;
    advanceCarryForwardMonths: number;
    maxEmiMonths: number;
    weekStartDay: string;
    defaultHraAmount: number;
    form16ResponsibleUser: string;
    form16ResponsibleUserFatherName: string;
    form16ResponsibleUserDesignation: string;
    citTdsAddress: string;
    form16SignatureUrl: string;
    salaryStampSignatureUrl: string;
    fnfDeclaration: string;
    fnfAuthorizedPerson: string;
}

const DEFAULT_SETTINGS: PayrollSettings = {
    payslipFormat: 'Standard Payslip',
    publishedSlipDurationLimit: 12,
    showRoundOff: true,
    advanceCarryForwardMonths: 12,
    maxEmiMonths: 12,
    weekStartDay: 'Monday',
    defaultHraAmount: 0,
    form16ResponsibleUser: '',
    form16ResponsibleUserFatherName: '',
    form16ResponsibleUserDesignation: '',
    citTdsAddress: '',
    form16SignatureUrl: '',
    salaryStampSignatureUrl: '',
    fnfDeclaration: 'I, the undersigned, hereby state that I have received the above-said amount as my full and final settlement out of my own free will and choice on tendering my resignation and I assure that I have no grievances, disputes, demands, and claims about my legal dues, back wages, reinstatement, or reemployment against the company.',
    fnfAuthorizedPerson: ''
};

export default function PayrollTaxSettings() {
    const [settings, setSettings] = useState<PayrollSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Collapsible sections
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        payroll: true,
        hra: true,
        signatures: false,
        fnf: false
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/payroll-settings');
            if (res.ok) {
                const data = await res.json();
                setSettings({ ...DEFAULT_SETTINGS, ...data });
            }
        } catch (error) {
            console.error("Failed to load payroll settings", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setShowSaved(false);
        try {
            const res = await fetch('/api/payroll-settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setShowSaved(true);
                setTimeout(() => setShowSaved(false), 3000);
            } else {
                alert('Failed to save settings');
            }
        } catch (error) {
            console.error("Error saving settings", error);
            alert('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateField = (field: keyof PayrollSettings, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (isLoading) {
        return (
            <div className="payroll-settings-layout">
                <div className="settings-loading">
                    <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading Payroll Settings...
                </div>
            </div>
        );
    }

    return (
        <div className="payroll-settings-layout">
            {/* Page Title */}
            <div className="page-title-bar">
                <div className="title-icon-box">
                    <Settings size={28} />
                </div>
                <div>
                    <h1>Payroll & Tax Settings</h1>
                    <div className="subtitle">Configure salary processing, payslip format, tax details, and FnF settlement</div>
                </div>
            </div>

            {/* Section 1: Payroll Settings */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('payroll')}>
                    <div className="section-header-left">
                        <div className="section-icon blue">
                            <DollarSign size={22} />
                        </div>
                        <div>
                            <div className="section-title">Payroll Settings</div>
                            <div className="section-subtitle">Payslip format, advance limits, and processing rules</div>
                        </div>
                    </div>
                    <ChevronDown size={22} className={`chevron-icon ${openSections.payroll ? 'open' : ''}`} />
                </div>

                {openSections.payroll && (
                    <div className="section-body">
                        <div className="settings-grid">
                            <div className="field-group">
                                <label>Payslip Format <span className="required">*</span></label>
                                <div className="input-container">
                                    <FileText className="input-icon" size={18} />
                                    <select
                                        className="premium-select"
                                        value={settings.payslipFormat}
                                        onChange={e => updateField('payslipFormat', e.target.value)}
                                    >
                                        <option value="Standard Payslip">Standard Payslip</option>
                                        <option value="Detailed Payslip">Detailed Payslip</option>
                                        <option value="Custom Format">Custom Format</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field-group">
                                <label>Published Salary Slip Duration Limit <span className="required">*</span></label>
                                <div className="input-container">
                                    <ChevronDown className="input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="premium-input"
                                        min={1}
                                        max={60}
                                        value={settings.publishedSlipDurationLimit}
                                        onChange={e => updateField('publishedSlipDurationLimit', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="field-hint">Months before a published payslip moves to generated records</div>
                            </div>
                        </div>

                        <div className="premium-toggle-card">
                            <div className="toggle-info">
                                <h4>Display Round-Off Amount</h4>
                                <p>Show round-off adjustments on the employee salary slip</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={settings.showRoundOff}
                                    onChange={e => updateField('showRoundOff', e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="settings-grid three-col">
                            <div className="field-group">
                                <label>Advance Carry Forward</label>
                                <div className="input-container">
                                    <ChevronDown className="input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="premium-input"
                                        min={1}
                                        max={60}
                                        value={settings.advanceCarryForwardMonths}
                                        onChange={e => updateField('advanceCarryForwardMonths', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="field-hint">Max months for carry forward</div>
                            </div>
                            <div className="field-group">
                                <label>Maximum EMI Months</label>
                                <div className="input-container">
                                    <ChevronDown className="input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="premium-input"
                                        min={1}
                                        max={60}
                                        value={settings.maxEmiMonths}
                                        onChange={e => updateField('maxEmiMonths', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="field-hint">Max repayment months</div>
                            </div>
                            <div className="field-group">
                                <label>Week Start Day</label>
                                <div className="input-container">
                                    <Calendar className="input-icon" size={18} />
                                    <select
                                        className="premium-select"
                                        value={settings.weekStartDay}
                                        onChange={e => updateField('weekStartDay', e.target.value)}
                                    >
                                        <option value="Monday">Monday</option>
                                        <option value="Tuesday">Tuesday</option>
                                        <option value="Wednesday">Wednesday</option>
                                        <option value="Thursday">Thursday</option>
                                        <option value="Friday">Friday</option>
                                        <option value="Saturday">Saturday</option>
                                        <option value="Sunday">Sunday</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="premium-warning">
                            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
                            <span>Frequently changing the Week Start Day after payroll processing may cause salary calculation issues. Proceed with caution.</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: HRA & Tax Details */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('hra')}>
                    <div className="section-header-left">
                        <div className="section-icon green">
                            <Building2 size={22} />
                        </div>
                        <div>
                            <div className="section-title">HRA & Tax Details</div>
                            <div className="section-subtitle">House Rent Allowance and Form 16 configuration</div>
                        </div>
                    </div>
                    <ChevronDown size={22} className={`chevron-icon ${openSections.hra ? 'open' : ''}`} />
                </div>

                {openSections.hra && (
                    <div className="section-body">
                        <div className="settings-grid">
                            <div className="field-group">
                                <label>Default HRA Amount</label>
                                <div className="input-container">
                                    <DollarSign className="input-icon" size={18} />
                                    <input
                                        type="number"
                                        className="premium-input"
                                        min={0}
                                        value={settings.defaultHraAmount}
                                        onChange={e => updateField('defaultHraAmount', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="field-hint">Default House Rent Allowance for calculations</div>
                            </div>
                        </div>

                        <div style={{ padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FileText size={18} color="#2563eb" />
                                Form 16 Responsible Person Details
                            </div>

                            <div className="settings-grid">
                                <div className="field-group">
                                    <label>Full Name</label>
                                    <div className="input-container">
                                        <CheckCircle2 className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="Enter responsible person name"
                                            value={settings.form16ResponsibleUser}
                                            onChange={e => updateField('form16ResponsibleUser', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Father's Name</label>
                                    <div className="input-container">
                                        <CheckCircle2 className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="Father/Husband name"
                                            value={settings.form16ResponsibleUserFatherName}
                                            onChange={e => updateField('form16ResponsibleUserFatherName', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>Designation</label>
                                    <div className="input-container">
                                        <Settings className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="e.g. HR Manager"
                                            value={settings.form16ResponsibleUserDesignation}
                                            onChange={e => updateField('form16ResponsibleUserDesignation', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="field-group">
                                    <label>CIT (TDS) Address</label>
                                    <div className="input-container">
                                        <Building2 className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="premium-input"
                                            placeholder="Enter full TDS address"
                                            value={settings.citTdsAddress}
                                            onChange={e => updateField('citTdsAddress', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 3: Signature Settings */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('signatures')}>
                    <div className="section-header-left">
                        <div className="section-icon purple">
                            <PenTool size={22} />
                        </div>
                        <div>
                            <div className="section-title">Signature Settings</div>
                            <div className="section-subtitle">Upload signatures for Form 16 and salary slips</div>
                        </div>
                    </div>
                    <ChevronDown size={22} className={`chevron-icon ${openSections.signatures ? 'open' : ''}`} />
                </div>

                {openSections.signatures && (
                    <div className="section-body">
                        <div className="signature-grid">
                            <div className="premium-sig-card">
                                <div className="sig-preview-container">
                                    {settings.form16SignatureUrl ? (
                                        <img src={settings.form16SignatureUrl} alt="Form16 Signature" className="sig-preview-img" />
                                    ) : (
                                        <div className="no-sig-placeholder">
                                            <PenTool size={40} />
                                            <span>No signature found</span>
                                        </div>
                                    )}
                                </div>
                                <div className="field-group" style={{ width: '100%' }}>
                                    <label>Form 16 Signature URL</label>
                                    <input
                                        type="text"
                                        className="premium-input no-icon-input"
                                        placeholder="Paste image URL..."
                                        value={settings.form16SignatureUrl}
                                        onChange={e => updateField('form16SignatureUrl', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="premium-sig-card">
                                <div className="sig-preview-container">
                                    {settings.salaryStampSignatureUrl ? (
                                        <img src={settings.salaryStampSignatureUrl} alt="Salary Stamp" className="sig-preview-img" />
                                    ) : (
                                        <div className="no-sig-placeholder">
                                            <FileText size={40} />
                                            <span>No stamp found</span>
                                        </div>
                                    )}
                                </div>
                                <div className="field-group" style={{ width: '100%' }}>
                                    <label>Salary Stamp URL</label>
                                    <input
                                        type="text"
                                        className="premium-input no-icon-input"
                                        placeholder="Paste image URL..."
                                        value={settings.salaryStampSignatureUrl}
                                        onChange={e => updateField('salaryStampSignatureUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 4: Full & Final Settlement */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('fnf')}>
                    <div className="section-header-left">
                        <div className="section-icon amber">
                            <FileText size={22} />
                        </div>
                        <div>
                            <div className="section-title">Full & Final Settlement (FnF)</div>
                            <div className="section-subtitle">Configure FnF declaration text and authorized person</div>
                        </div>
                    </div>
                    <ChevronDown size={22} className={`chevron-icon ${openSections.fnf ? 'open' : ''}`} />
                </div>

                {openSections.fnf && (
                    <div className="section-body">
                        <div className="field-group">
                            <label>Declaration Text</label>
                            <textarea
                                className="premium-textarea no-icon-input"
                                rows={4}
                                value={settings.fnfDeclaration}
                                onChange={e => updateField('fnfDeclaration', e.target.value)}
                                placeholder="Enter settlement declaration..."
                            />
                        </div>

                        <div className="settings-grid">
                            <div className="field-group">
                                <label>Authorized Signatory</label>
                                <div className="input-container">
                                    <PenTool className="input-icon" size={18} />
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="Name of authorized person"
                                        value={settings.fnfAuthorizedPerson}
                                        onChange={e => updateField('fnfAuthorizedPerson', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save Footer */}
            <div className="premium-save-footer">
                {showSaved && (
                    <div className="status-toast">
                        <CheckCircle2 size={18} />
                        All changes saved successfully!
                    </div>
                )}
                <button className="btn-premium-save" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                        <Save size={20} />
                    )}
                    {isSaving ? 'Updating...' : 'Save Configuration'}
                </button>
            </div>
        </div>
    );
}
