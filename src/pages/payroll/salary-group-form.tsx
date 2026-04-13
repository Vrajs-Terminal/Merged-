import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Loader2, ChevronDown,
    FileText, Calculator, Settings, List, Zap,
    DollarSign, Clock, X, Plus, CheckCircle2
} from 'lucide-react';
import './salary-group-form.css';
import './payroll-tax-settings.css';

interface EarningDeductionType {
    id: number;
    name: string;
    type: 'Earning' | 'Deduction';
    taxable: boolean;
    status: string;
}

interface ComponentEntry {
    earning_deduction_type_id: number;
    amount: number;
    name: string;
    type: string;
}

interface SlipSettings {
    otherEarningLabel: string;
    otherDeductionLabel: string;
    showWorkingHours: boolean;
    showSalaryGeneratedDate: boolean;
    showJoiningDate: boolean;
    showJoiningSalary: boolean;
    totalSalaryListView: boolean;
    showTdsDeductionSummary: boolean;
    showActualEarningsAmount: boolean;
    showEmployeeId: boolean;
    showFatherHusbandName: boolean;
    showGender: boolean;
    showDateOfBirth: boolean;
    showIdProof: boolean;
    showMobileNumber: boolean;
    showEmail: boolean;
    showPanNumber: boolean;
    showTanNumber: boolean;
    showGstNumber: boolean;
    showLeaveBalance: boolean;
    showPaidOtHours: boolean;
    showActualOtHours: boolean;
    overtimeSeparateFromGross: boolean;
    showPenaltyDetails: boolean;
    showTaskDetails: boolean;
    showTotalPaidDays: boolean;
    zeroValueDisplay: boolean;
}

const DEFAULT_SLIP_SETTINGS: SlipSettings = {
    otherEarningLabel: 'Other Earnings',
    otherDeductionLabel: 'Other Deduction',
    showWorkingHours: false,
    showSalaryGeneratedDate: true,
    showJoiningDate: true,
    showJoiningSalary: false,
    totalSalaryListView: false,
    showTdsDeductionSummary: false,
    showActualEarningsAmount: false,
    showEmployeeId: true,
    showFatherHusbandName: false,
    showGender: false,
    showDateOfBirth: false,
    showIdProof: false,
    showMobileNumber: false,
    showEmail: false,
    showPanNumber: false,
    showTanNumber: false,
    showGstNumber: false,
    showLeaveBalance: false,
    showPaidOtHours: false,
    showActualOtHours: false,
    overtimeSeparateFromGross: false,
    showPenaltyDetails: false,
    showTaskDetails: false,
    showTotalPaidDays: true,
    zeroValueDisplay: false
};

export default function SalaryGroupForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);

    // Main fields
    const [name, setName] = useState('');
    const [payrollFrequency, setPayrollFrequency] = useState('Monthly');
    const [workingDaysType, setWorkingDaysType] = useState('Calendar Days');
    const [salaryCalcType, setSalaryCalcType] = useState('Per Day');

    // Payout formulas
    const [payoutWeekDays, setPayoutWeekDays] = useState(1);
    const [payoutWeekOff, setPayoutWeekOff] = useState(0);
    const [payoutHolidays, setPayoutHolidays] = useState(0);

    // Slip display settings
    const [slipSettings, setSlipSettings] = useState<SlipSettings>(DEFAULT_SLIP_SETTINGS);

    // Common settings
    const [salaryCycleStartDate, setSalaryCycleStartDate] = useState(1);
    const [calcPaidLeaveInGross, setCalcPaidLeaveInGross] = useState(false);
    const [modifySalaryDays, setModifySalaryDays] = useState(false);
    const [modifyGrossSalary, setModifyGrossSalary] = useState(false);
    const [roundedSalary, setRoundedSalary] = useState(false);
    const [calcOvertimeInGross, setCalcOvertimeInGross] = useState(false);

    // Incentive
    const [incentiveEnabled, setIncentiveEnabled] = useState(false);
    const [attendanceBasedIncentive, setAttendanceBasedIncentive] = useState(false);

    // Calculation rules (stored as simple JSON)
    const [allowExtraDayPayout, setAllowExtraDayPayout] = useState(false);
    const [deductLunchBreak, setDeductLunchBreak] = useState(false);
    const [deductTeaBreak, setDeductTeaBreak] = useState(false);
    const [deductOtherBreak, setDeductOtherBreak] = useState(false);

    // Components
    const [components, setComponents] = useState<ComponentEntry[]>([]);
    const [availableTypes, setAvailableTypes] = useState<EarningDeductionType[]>([]);

    // Section collapse
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        info: true,
        payout: false,
        slip: false,
        common: false,
        calc: false,
        incentive: false,
        components: true
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load available earning/deduction types
            const typesRes = await fetch('/api/earning-deduction-types?status=Active');
            if (typesRes.ok) {
                const types = await typesRes.json();
                setAvailableTypes(types);
            }

            // Load existing group if editing
            if (isEditing && id) {
                const res = await fetch(`/api/salary-groups/${id}`);
                if (res.ok) {
                    const group = await res.json();
                    setName(group.name);
                    setPayrollFrequency(group.payroll_frequency);
                    setWorkingDaysType(group.working_days_type);
                    setSalaryCalcType(group.salary_calc_type);

                    if (group.payout_formulas) {
                        setPayoutWeekDays(group.payout_formulas.weekDays ?? 1);
                        setPayoutWeekOff(group.payout_formulas.weekOff ?? 0);
                        setPayoutHolidays(group.payout_formulas.holidays ?? 0);
                    }

                    if (group.slip_display_settings) {
                        setSlipSettings({ ...DEFAULT_SLIP_SETTINGS, ...group.slip_display_settings });
                    }

                    if (group.common_settings) {
                        const cs = group.common_settings;
                        setSalaryCycleStartDate(cs.salaryCycleStartDate ?? 1);
                        setCalcPaidLeaveInGross(cs.calcPaidLeaveInGross ?? false);
                        setModifySalaryDays(cs.modifySalaryDays ?? false);
                        setModifyGrossSalary(cs.modifyGrossSalary ?? false);
                        setRoundedSalary(cs.roundedSalary ?? false);
                        setCalcOvertimeInGross(cs.calcOvertimeInGross ?? false);
                    }

                    if (group.incentive_settings) {
                        setIncentiveEnabled(group.incentive_settings.enabled ?? false);
                        setAttendanceBasedIncentive(group.incentive_settings.attendanceBased ?? false);
                    }

                    if (group.calculation_rules) {
                        const cr = group.calculation_rules;
                        setAllowExtraDayPayout(cr.allowExtraDayPayout ?? false);
                        setDeductLunchBreak(cr.deductLunchBreak ?? false);
                        setDeductTeaBreak(cr.deductTeaBreak ?? false);
                        setDeductOtherBreak(cr.deductOtherBreak ?? false);
                    }

                    if (group.components) {
                        setComponents(group.components.map((c: { earningDeductionType: EarningDeductionType; earning_deduction_type_id: number; amount: number }) => ({
                            earning_deduction_type_id: c.earning_deduction_type_id,
                            amount: c.amount,
                            name: c.earningDeductionType.name,
                            type: c.earningDeductionType.type
                        })));
                    }
                }
            }
        } catch (error) {
            console.error("Error loading data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert('Salary Group Name is required.');
            return;
        }

        setIsSaving(true);
        setShowSaved(false);
        try {
            const payload = {
                name: name.trim(),
                payroll_frequency: payrollFrequency,
                working_days_type: workingDaysType,
                salary_calc_type: salaryCalcType,
                payout_formulas: { weekDays: payoutWeekDays, weekOff: payoutWeekOff, holidays: payoutHolidays },
                slip_display_settings: slipSettings,
                common_settings: {
                    salaryCycleStartDate,
                    calcPaidLeaveInGross,
                    modifySalaryDays,
                    modifyGrossSalary,
                    roundedSalary,
                    calcOvertimeInGross
                },
                calculation_rules: {
                    allowExtraDayPayout,
                    deductLunchBreak,
                    deductTeaBreak,
                    deductOtherBreak
                },
                incentive_settings: {
                    enabled: incentiveEnabled,
                    attendanceBased: attendanceBasedIncentive
                },
                components: components.map(c => ({
                    earning_deduction_type_id: c.earning_deduction_type_id,
                    amount: c.amount
                }))
            };

            const url = isEditing ? `/api/salary-groups/${id}` : '/api/salary-groups';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowSaved(true);
                setTimeout(() => {
                    navigate('/salary-groups');
                }, 1000);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save salary group');
            }
        } catch (error) {
            console.error("Error saving salary group", error);
            alert("Network error.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSection = (key: string) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const updateSlipSetting = (key: keyof SlipSettings, value: boolean | string) => {
        setSlipSettings(prev => ({ ...prev, [key]: value }));
    };

    const addComponent = (typeId: number) => {
        const edType = availableTypes.find(t => t.id === typeId);
        if (!edType) return;
        if (components.some(c => c.earning_deduction_type_id === typeId)) {
            alert('This component is already added.');
            return;
        }
        setComponents(prev => [...prev, {
            earning_deduction_type_id: typeId,
            amount: 0,
            name: edType.name,
            type: edType.type
        }]);
    };

    const removeComponent = (typeId: number) => {
        setComponents(prev => prev.filter(c => c.earning_deduction_type_id !== typeId));
    };

    const updateComponentAmount = (typeId: number, amount: number) => {
        setComponents(prev => prev.map(c =>
            c.earning_deduction_type_id === typeId ? { ...c, amount } : c
        ));
    };

    if (isLoading) {
        return (
            <div className="sg-form-layout">
                <div className="settings-loading">
                    <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
                    Loading Salary Group...
                </div>
            </div>
        );
    }

    const slipSettingLabels: { key: keyof SlipSettings; label: string }[] = [
        { key: 'showWorkingHours', label: 'Show Working Hours In Salary Slip' },
        { key: 'showSalaryGeneratedDate', label: 'Show Salary Generated Date' },
        { key: 'showJoiningDate', label: 'Show Joining Date' },
        { key: 'showJoiningSalary', label: 'Show Joining Salary' },
        { key: 'totalSalaryListView', label: 'Total Salary List View' },
        { key: 'showTdsDeductionSummary', label: 'Show TDS Deduction Summary' },
        { key: 'showActualEarningsAmount', label: 'Show Actual Earnings Amount' },
        { key: 'showEmployeeId', label: 'Show Employee ID' },
        { key: 'showFatherHusbandName', label: 'Show Father / Husband Name' },
        { key: 'showGender', label: 'Show Gender' },
        { key: 'showDateOfBirth', label: 'Show Date of Birth' },
        { key: 'showIdProof', label: 'Show ID Proof' },
        { key: 'showMobileNumber', label: 'Show Mobile Number' },
        { key: 'showEmail', label: 'Show Email' },
        { key: 'showPanNumber', label: 'Show PAN Number' },
        { key: 'showTanNumber', label: 'Show TAN Number' },
        { key: 'showGstNumber', label: 'Show GST Number' },
        { key: 'showLeaveBalance', label: 'Show Leave Balance' },
        { key: 'showPaidOtHours', label: 'Show Paid OT Hours' },
        { key: 'showActualOtHours', label: 'Show Actual OT Hours' },
        { key: 'overtimeSeparateFromGross', label: 'Overtime Separate From Gross Earning' },
        { key: 'showPenaltyDetails', label: 'Show Penalty Details' },
        { key: 'showTaskDetails', label: 'Show Task Details' },
        { key: 'showTotalPaidDays', label: 'Show Total Paid Days' },
        { key: 'zeroValueDisplay', label: 'Zero Value Display for Earnings & Deductions' }
    ];

    return (
        <div className="sg-form-layout">
            {/* Back + Title */}
            <div className="sg-back-row">
                <button className="btn-back" onClick={() => navigate('/salary-groups')}>
                    <ArrowLeft size={16} /> Back
                </button>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        {isEditing ? 'Edit Salary Group' : 'Add New Salary Group'}
                    </h1>
                </div>
            </div>

            {/* Section 1: Basic Info */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('info')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon blue"><FileText size={18} /></div>
                        <div>
                            <div className="sg-section-title">Salary Group Information</div>
                            <div className="sg-section-sub">Name, frequency, and working days type</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.info ? 'open' : ''}`} />
                </div>
                {openSections.info && (
                    <div className="sg-section-body">
                        <div className="sg-form-grid">
                            <div className="sg-field">
                                <label>Salary Group Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter group name..." />
                            </div>
                            <div className="sg-field">
                                <label>Payroll Frequency <span style={{ color: '#ef4444' }}>*</span></label>
                                <select value={payrollFrequency} onChange={e => setPayrollFrequency(e.target.value)}>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Bi-Weekly">Bi-Weekly</option>
                                </select>
                            </div>
                            <div className="sg-field">
                                <label>Working Days Type <span style={{ color: '#ef4444' }}>*</span></label>
                                <select value={workingDaysType} onChange={e => setWorkingDaysType(e.target.value)}>
                                    <option value="Calendar Days">Calendar Days</option>
                                    <option value="Working Days">Working Days</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Payout Formulas */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('payout')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon green"><DollarSign size={18} /></div>
                        <div>
                            <div className="sg-section-title">Extra Day / Hours Payout Formula</div>
                            <div className="sg-section-sub">Multiplier rules for week days, week off, and holidays</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.payout ? 'open' : ''}`} />
                </div>
                {openSections.payout && (
                    <div className="sg-section-body">
                        <div className="sg-form-grid">
                            <div className="sg-field">
                                <label>Week Days Formula</label>
                                <select value={payoutWeekDays} onChange={e => setPayoutWeekDays(Number(e.target.value))}>
                                    <option value={0}>No Payout (0×)</option>
                                    <option value={0.5}>Half Salary (0.5×)</option>
                                    <option value={1}>Normal Salary (1×)</option>
                                    <option value={1.5}>1.5× Salary</option>
                                    <option value={2}>Double Salary (2×)</option>
                                </select>
                            </div>
                            <div className="sg-field">
                                <label>Week Off Formula</label>
                                <select value={payoutWeekOff} onChange={e => setPayoutWeekOff(Number(e.target.value))}>
                                    <option value={0}>No Payout (0×)</option>
                                    <option value={0.5}>Half Salary (0.5×)</option>
                                    <option value={1}>Normal Salary (1×)</option>
                                    <option value={1.5}>1.5× Salary</option>
                                    <option value={2}>Double Salary (2×)</option>
                                </select>
                            </div>
                            <div className="sg-field">
                                <label>Holidays Formula</label>
                                <select value={payoutHolidays} onChange={e => setPayoutHolidays(Number(e.target.value))}>
                                    <option value={0}>No Payout (0×)</option>
                                    <option value={0.5}>Half Salary (0.5×)</option>
                                    <option value={1}>Normal Salary (1×)</option>
                                    <option value={1.5}>1.5× Salary</option>
                                    <option value={2}>Double Salary (2×)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 3: Slip Display Settings */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('slip')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon purple"><List size={18} /></div>
                        <div>
                            <div className="sg-section-title">Salary Slip Display Settings</div>
                            <div className="sg-section-sub">Toggle visibility of fields on the salary slip</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.slip ? 'open' : ''}`} />
                </div>
                {openSections.slip && (
                    <div className="sg-section-body">
                        <div className="sg-form-grid two-col">
                            <div className="sg-field">
                                <label>Other Earning Label</label>
                                <input type="text" value={slipSettings.otherEarningLabel} onChange={e => updateSlipSetting('otherEarningLabel', e.target.value)} />
                            </div>
                            <div className="sg-field">
                                <label>Other Deduction Label</label>
                                <input type="text" value={slipSettings.otherDeductionLabel} onChange={e => updateSlipSetting('otherDeductionLabel', e.target.value)} />
                            </div>
                        </div>
                        <div className="sg-toggle-grid">
                            {slipSettingLabels.map(({ key, label }) => (
                                <div className="sg-toggle-item" key={key}>
                                    <label>{label}</label>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={slipSettings[key] as boolean}
                                            onChange={e => updateSlipSetting(key, e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Section 4: Common Settings */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('common')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon amber"><Settings size={18} /></div>
                        <div>
                            <div className="sg-section-title">Common Settings</div>
                            <div className="sg-section-sub">Salary cycle, leave allowance, and overtime rules</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.common ? 'open' : ''}`} />
                </div>
                {openSections.common && (
                    <div className="sg-section-body">
                        <div className="sg-form-grid">
                            <div className="sg-field">
                                <label>Salary Cycle Start Date</label>
                                <input type="number" min={1} max={31} value={salaryCycleStartDate} onChange={e => setSalaryCycleStartDate(parseInt(e.target.value) || 1)} />
                            </div>
                        </div>
                        <div className="sg-toggle-grid">
                            <div className="sg-toggle-item">
                                <label>Calculate Paid Leave Allowance In Gross Salary</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={calcPaidLeaveInGross} onChange={e => setCalcPaidLeaveInGross(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Modify Salary Days</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={modifySalaryDays} onChange={e => setModifySalaryDays(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Modify Gross Salary</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={modifyGrossSalary} onChange={e => setModifyGrossSalary(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Rounded Salary</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={roundedSalary} onChange={e => setRoundedSalary(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Calculate Overtime Allowance in Gross Salary</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={calcOvertimeInGross} onChange={e => setCalcOvertimeInGross(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 5: Calculation Type */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('calc')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon rose"><Calculator size={18} /></div>
                        <div>
                            <div className="sg-section-title">Salary Calculation Type</div>
                            <div className="sg-section-sub">Per Day, Per Hour, or Fixed Salary options</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.calc ? 'open' : ''}`} />
                </div>
                {openSections.calc && (
                    <div className="sg-section-body">
                        <div className="calc-type-selector">
                            {['Per Day', 'Per Hour', 'Fixed'].map(type => (
                                <button
                                    key={type}
                                    className={`calc-type-btn ${salaryCalcType === type ? 'active' : ''}`}
                                    onClick={() => setSalaryCalcType(type)}
                                >
                                    {type === 'Per Day' && <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />}
                                    {type === 'Per Hour' && <Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />}
                                    {type === 'Fixed' && <DollarSign size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />}
                                    {type} Salary
                                </button>
                            ))}
                        </div>

                        <div className="sg-toggle-grid">
                            <div className="sg-toggle-item">
                                <label>Allow Extra Day / Hour Payout</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={allowExtraDayPayout} onChange={e => setAllowExtraDayPayout(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Deduct Lunch / Dinner Break</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={deductLunchBreak} onChange={e => setDeductLunchBreak(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Deduct Tea Break</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={deductTeaBreak} onChange={e => setDeductTeaBreak(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Deduct Other Break Time</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={deductOtherBreak} onChange={e => setDeductOtherBreak(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 6: Incentive */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('incentive')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon teal"><Zap size={18} /></div>
                        <div>
                            <div className="sg-section-title">Incentive Settings</div>
                            <div className="sg-section-sub">Incentive and attendance-based bonus rules</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.incentive ? 'open' : ''}`} />
                </div>
                {openSections.incentive && (
                    <div className="sg-section-body">
                        <div className="sg-toggle-grid">
                            <div className="sg-toggle-item">
                                <label>Enable Incentive</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={incentiveEnabled} onChange={e => setIncentiveEnabled(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                            <div className="sg-toggle-item">
                                <label>Attendance Based Incentive</label>
                                <label className="toggle-switch">
                                    <input type="checkbox" checked={attendanceBasedIncentive} onChange={e => setAttendanceBasedIncentive(e.target.checked)} />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 7: Flexible Salary Components */}
            <div className="sg-form-section">
                <div className="sg-section-header" onClick={() => toggleSection('components')}>
                    <div className="sg-section-left">
                        <div className="sg-section-icon indigo"><DollarSign size={18} /></div>
                        <div>
                            <div className="sg-section-title">Flexible Salary Earning Heads</div>
                            <div className="sg-section-sub">Assign earning and deduction components with amounts</div>
                        </div>
                    </div>
                    <ChevronDown size={18} className={`chevron-icon ${openSections.components ? 'open' : ''}`} />
                </div>
                {openSections.components && (
                    <div className="sg-section-body">
                        {/* Add Component Selector */}
                        <div className="comp-editor-header">
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                                {components.length} Component(s) Added
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <select
                                    id="comp-selector"
                                    style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', minWidth: '200px' }}
                                    defaultValue=""
                                    onChange={e => {
                                        if (e.target.value) {
                                            addComponent(parseInt(e.target.value));
                                            e.target.value = '';
                                        }
                                    }}
                                >
                                    <option value="" disabled>Select component to add...</option>
                                    {availableTypes
                                        .filter(t => !components.some(c => c.earning_deduction_type_id === t.id))
                                        .map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name} ({t.type})
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>

                        {/* Components List */}
                        {components.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '14px' }}>
                                <Plus size={24} style={{ margin: '0 auto 8px' }} />
                                <div>No components added yet. Select from dropdown above.</div>
                            </div>
                        ) : (
                            <>
                                {/* Earnings */}
                                {components.filter(c => c.type === 'Earning').length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Earnings
                                        </div>
                                        {components.filter(c => c.type === 'Earning').map(comp => (
                                            <div className="comp-row" key={comp.earning_deduction_type_id}>
                                                <span className="comp-name">{comp.name}</span>
                                                <span className="comp-type-tag earning">Earning</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={comp.amount}
                                                    onChange={e => updateComponentAmount(comp.earning_deduction_type_id, parseFloat(e.target.value) || 0)}
                                                    placeholder="Amount"
                                                />
                                                <button className="comp-remove-btn" onClick={() => removeComponent(comp.earning_deduction_type_id)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Deductions */}
                                {components.filter(c => c.type === 'Deduction').length > 0 && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Deductions
                                        </div>
                                        {components.filter(c => c.type === 'Deduction').map(comp => (
                                            <div className="comp-row" key={comp.earning_deduction_type_id}>
                                                <span className="comp-name">{comp.name}</span>
                                                <span className="comp-type-tag deduction">Deduction</span>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={comp.amount}
                                                    onChange={e => updateComponentAmount(comp.earning_deduction_type_id, parseFloat(e.target.value) || 0)}
                                                    placeholder="Amount"
                                                />
                                                <button className="comp-remove-btn" onClick={() => removeComponent(comp.earning_deduction_type_id)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Save Footer */}
            <div className="sg-form-footer">
                {showSaved && (
                    <div className="save-status">
                        <CheckCircle2 size={16} />
                        Saved! Redirecting...
                    </div>
                )}
                <button className="btn-cancel" onClick={() => navigate('/salary-groups')}>Cancel</button>
                <button className="btn-primary-save" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : (isEditing ? 'Update Group' : 'Add Group')}
                </button>
            </div>
        </div>
    );
}
