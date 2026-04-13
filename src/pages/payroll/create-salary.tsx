import { useState, useEffect } from 'react';
import { 
    Filter, Calculator, 
    Loader2, CheckCircle, Save, X, FileText,
    Database as DatabaseIcon, Users, Calendar, Briefcase,
    UserPlus
} from 'lucide-react';
import api from '../../lib/axios';
import './create-salary.css';
import { toast } from 'react-hot-toast';

const CreateSalary = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [calculating, setCalculating] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        employee_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [salaryData, setSalaryData] = useState<any>(null);
    const [calcForm, setCalcForm] = useState<any>({
        month_working_days: 30,
        employee_working_days: 0,
        paid_leave: 0,
        unpaid_leave: 0,
        paid_holidays: 0,
        paid_week_off: 0,
        extra_days: 0,
        advance_deduction: 0,
        loan_emi_deduction: 0,
        penalty_deduction: 0,
        deduct_advance: 'No',
        deduct_loan: 'No',
        deduct_penalty: 'No',
        salary_mode: 'Bank Transfer',
        status: 'Generate',
        description: ''
    });

    // Helper to get month name
    const getMonthName = (m: number) => {
        return new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' });
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes, eRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments'),
                api.get('/employee-ctc/users-list')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
            setEmployees(eRes.data);
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const handleGetData = async () => {
        if (!filters.employee_id) {
            toast.error("Please select an employee first");
            return;
        }
        setCalculating(true);
        try {
            const res = await api.get(`/salary-slips/calculate/${filters.employee_id}`, {
                params: { month: filters.month, year: filters.year }
            });
            setSalaryData(res.data);
            
            // Set initial calculation values
            const daysInMonth = new Date(filters.year, filters.month, 0).getDate();
            setCalcForm({
                ...calcForm,
                month_working_days: daysInMonth,
                employee_working_days: res.data.attendance.present + res.data.attendance.leave,
                paid_leave: res.data.attendance.leave,
                unpaid_leave: 0,
                description: `Salary for ${getMonthName(filters.month)} ${filters.year}`
            });
        } catch (error: any) {
            if (error.response?.data?.error?.includes("SALARY ON HOLD")) {
                toast.error(error.response.data.error, { duration: 5000 });
                if (error.response.data.reason) {
                    toast( `Reason: ${error.response.data.reason}`, { icon: 'ℹ️' });
                }
            } else {
                toast.error(error.response?.data?.error || "Failed to fetch salary data");
            }
            setSalaryData(null);
        } finally {
            setCalculating(false);
        }
    };

    const calculateTotals = () => {
        if (!salaryData) return { gross: 0, earnings: 0, deductions: 0, net: 0, perDay: 0 };

        const ctc = salaryData.currentCTC;
        const gross = ctc.gross_salary;
        const perDay = gross / calcForm.month_working_days;
        
        const thisMonthGross = (calcForm.employee_working_days * perDay) + (calcForm.extra_days * perDay);
        
        const ctcEarnings = salaryData.earnings.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const totalEarnings = thisMonthGross + (ctcEarnings - gross > 0 ? ctcEarnings - gross : 0); // Simplified logic

        let totalDeductions = salaryData.deductions.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        
        if (calcForm.deduct_advance === 'Yes') totalDeductions += calcForm.advance_deduction;
        if (calcForm.deduct_loan === 'Yes') totalDeductions += calcForm.loan_emi_deduction;
        if (calcForm.deduct_penalty === 'Yes') totalDeductions += calcForm.penalty_deduction;

        return {
            gross: thisMonthGross,
            earnings: totalEarnings,
            deductions: totalDeductions,
            net: totalEarnings - totalDeductions,
            perDay
        };
    };

    const totals = calculateTotals();

    const handleGenerate = async (generateStatus: string) => {
        setGenerating(true);
        try {
            const payload = {
                user_id: parseInt(filters.employee_id),
                employee_ctc_id: salaryData.currentCTC.id,
                month: filters.month,
                year: filters.year,
                salary_type: salaryData.currentCTC.salary_type,
                month_working_days: calcForm.month_working_days,
                employee_working_days: calcForm.employee_working_days,
                paid_leaves: calcForm.paid_leave,
                unpaid_leaves: calcForm.unpaid_leave,
                total_leaves: calcForm.paid_leave + calcForm.unpaid_leave,
                paid_holidays: calcForm.paid_holidays,
                paid_week_offs: calcForm.paid_week_off,
                extra_days: calcForm.extra_days,
                joining_net_salary: totals.net, // Simplified for now
                joining_gross_salary: salaryData.currentCTC.gross_salary,
                this_month_gross: totals.gross,
                per_day_salary: totals.perDay,
                total_earnings: totals.earnings,
                total_deductions: totals.deductions,
                net_salary: totals.net,
                salary_mode: calcForm.salary_mode,
                status: generateStatus,
                description: calcForm.description,
                items: [
                    ...salaryData.earnings.map((e: any) => ({ name: e.earningDeductionType.name, amount: e.amount, type: 'Earning' })),
                    ...salaryData.deductions.map((d: any) => ({ name: d.earningDeductionType.name, amount: d.amount, type: 'Deduction' })),
                    ...(calcForm.deduct_advance === 'Yes' ? [{ name: 'Advance Deduction', amount: calcForm.advance_deduction, type: 'Deduction', category: 'Advance' }] : []),
                    ...(calcForm.deduct_penalty === 'Yes' ? [{ name: 'Penalty', amount: calcForm.penalty_deduction, type: 'Deduction', category: 'Penalty' }] : [])
                ]
            };

            await api.post('/salary-slips/generate', payload);
            toast.success("Salary Slip Generated Successfully");
            setSalaryData(null);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to generate salary slip");
        } finally {
            setGenerating(false);
        }
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="salary-calc-layout">
            <div className="salary-calc-container">
                <div className="salary-calc-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <UserPlus size={32} className="page-title-icon text-indigo-600" />
                            <h2>Generate Monthly Salary Slip</h2>
                        </div>
                        <p>Individual Employee Payroll Processing</p>
                    </div>
                </div>

                {/* 1️⃣ Selection Panel */}
                <div className="filter-card">
                    <div className="card-header">
                        <Filter size={18} className="text-indigo-500" />
                        <span>Selection Panel</span>
                    </div>
                    <div className="filter-grid">
                        <div className="form-group">
                            <label><Briefcase size={14} /> Branch *</label>
                            <select 
                                className="premium-control"
                                value={filters.branch_id}
                                onChange={e => setFilters({ ...filters, branch_id: e.target.value })}
                            >
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Users size={14} /> Department *</label>
                            <select 
                                className="premium-control"
                                value={filters.department_id}
                                onChange={e => setFilters({ ...filters, department_id: e.target.value })}
                            >
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Users size={14} /> Employee Name *</label>
                            <select 
                                className="premium-control"
                                value={filters.employee_id}
                                onChange={e => setFilters({ ...filters, employee_id: e.target.value })}
                            >
                                <option value="">Search Employee</option>
                                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Month *</label>
                            <select 
                                className="premium-control"
                                value={filters.month}
                                onChange={e => setFilters({ ...filters, month: parseInt(e.target.value) })}
                            >
                                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Year *</label>
                            <select 
                                className="premium-control"
                                value={filters.year}
                                onChange={e => setFilters({ ...filters, year: parseInt(e.target.value) })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="form-group btn-align">
                            <button className="btn-get-data" onClick={handleGetData} disabled={calculating}>
                                {calculating ? <Loader2 size={18} className="spin" /> : <DatabaseIcon size={18} />}
                                Get Data
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2️⃣ Salary Calculation Form */}
                {salaryData && (
                    <div className="calculation-form">
                        <div className="form-section-header">
                            <Calculator size={24} className="text-indigo-600" />
                            <h3>Salary Calculation for {salaryData.employee.name}</h3>
                        </div>

                        <div className="main-form-grid">
                            {/* Employee Details Section */}
                            <div className="salary-info-card">
                                <div className="card-sub-header">
                                    <Users size={16} /> Employee Details
                                </div>
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <label>Branch</label>
                                        <p>{salaryData.employee.branch?.name || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Department</label>
                                        <p>{salaryData.employee.department?.name || 'N/A'}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Month Year</label>
                                        <p>{getMonthName(filters.month)} {filters.year}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>Salary Type</label>
                                        <span className="badge-type">{salaryData.currentCTC.salary_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Working Days Section */}
                            <div className="days-card">
                                <div className="card-sub-header">Working Days Section</div>
                                <div className="input-grid">
                                    <div className="form-group">
                                        <label>Month Working Days *</label>
                                        <input type="number" className="premium-control" value={calcForm.month_working_days} onChange={e => setCalcForm({...calcForm, month_working_days: parseInt(e.target.value)})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Employee Working Days *</label>
                                        <input type="number" className="premium-control" value={calcForm.employee_working_days} onChange={e => setCalcForm({...calcForm, employee_working_days: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Paid Leave</label>
                                        <input type="number" className="premium-control" value={calcForm.paid_leave} onChange={e => setCalcForm({...calcForm, paid_leave: parseFloat(e.target.value)})} />
                                    </div>
                                    <div className="form-group">
                                        <label>Unpaid Leave</label>
                                        <input type="number" className="premium-control" value={calcForm.unpaid_leave} onChange={e => setCalcForm({...calcForm, unpaid_leave: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Salary Info Summary */}
                            <div className="summary-card">
                                <div className="card-sub-header">Salary Information</div>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span>Joining Gross Salary</span>
                                        <p>₹ {salaryData.currentCTC.gross_salary.toLocaleString()}</p>
                                    </div>
                                    <div className="summary-item highlight">
                                        <span>This Month Gross Salary</span>
                                        <p>₹ {totals.gross.toLocaleString()}</p>
                                    </div>
                                    <div className="summary-item">
                                        <span>Per Day Salary</span>
                                        <p>₹ {totals.perDay.toFixed(2)}</p>
                                    </div>
                                    <div className="summary-item">
                                        <span>Extra Days</span>
                                        <input type="number" className="mini-input" value={calcForm.extra_days} onChange={e => setCalcForm({...calcForm, extra_days: parseFloat(e.target.value)})} />
                                    </div>
                                </div>
                            </div>

                            {/* Earnings & Deductions Split */}
                            <div className="split-grid">
                                <div className="earnings-section">
                                    <div className="card-sub-header green">Earnings Section</div>
                                    <div className="component-list">
                                        {salaryData.earnings.map((e: any) => (
                                            <div key={e.id} className="component-row">
                                                <span>{e.earningDeductionType.name}</span>
                                                <p>₹ {e.amount.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        <div className="total-row">
                                            <span>Total Earnings</span>
                                            <p>₹ {totals.earnings.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="deductions-section">
                                    <div className="card-sub-header red">Deduction Section</div>
                                    <div className="component-list">
                                        {salaryData.deductions.map((d: any) => (
                                            <div key={d.id} className="component-row">
                                                <span>{d.earningDeductionType.name}</span>
                                                <p>₹ {d.amount.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        
                                        {/* Dynamic Deductions (Advances/Penalty etc) */}
                                        {salaryData.otherDeductions && salaryData.otherDeductions.map((od: any) => (
                                            <div key={od.id} className="dynamic-deduction">
                                                <div className="deduction-info">
                                                    <span>{od.name} (₹ {od.amount.toLocaleString()})</span>
                                                    <div className="toggle-group">
                                                        <button 
                                                            className={calcForm[`deduct_${od.id}`] !== 'No' ? 'active' : ''} 
                                                            onClick={() => {
                                                                setCalcForm({
                                                                    ...calcForm, 
                                                                    [`deduct_${od.id}`]: 'Yes',
                                                                    [`amount_${od.id}`]: od.amount
                                                                });
                                                            }}
                                                        >Yes</button>
                                                        <button 
                                                            className={calcForm[`deduct_${od.id}`] === 'No' ? 'active' : ''} 
                                                            onClick={() => {
                                                                setCalcForm({
                                                                    ...calcForm, 
                                                                    [`deduct_${od.id}`]: 'No',
                                                                    [`amount_${od.id}`]: 0
                                                                });
                                                            }}
                                                        >No</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {salaryData.otherDeductions.length === 0 && (
                                            <p className="no-data-hint">No extra deductions for this period</p>
                                        )}

                                        <div className="total-row red-text">
                                            <span>Total Deduction</span>
                                            <p>₹ {totals.deductions.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net Salary Display */}
                            <div className="net-salary-banner">
                                <div className="net-label">
                                    <CheckCircle size={24} />
                                    <span>Net Salary Payable</span>
                                </div>
                                <div className="net-amount">
                                    ₹ {totals.net.toLocaleString()}
                                </div>
                            </div>

                            {/* Final Actions */}
                            <div className="action-card">
                                <div className="action-grid">
                                    <div className="form-group">
                                        <label>Salary Mode *</label>
                                        <select className="premium-control" value={calcForm.salary_mode} onChange={e => setCalcForm({...calcForm, salary_mode: e.target.value})}>
                                            <option>Bank Transfer</option>
                                            <option>Cheque</option>
                                            <option>Cash</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Salary Status *</label>
                                        <select className="premium-control" value={calcForm.status} onChange={e => setCalcForm({...calcForm, status: e.target.value})}>
                                            <option value="Generated">Generate</option>
                                            <option value="Published">Publish</option>
                                            <option value="Generated & Published">Generate & Publish</option>
                                        </select>
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Description</label>
                                        <textarea className="premium-control no-icon-input" value={calcForm.description} onChange={e => setCalcForm({...calcForm, description: e.target.value})} />
                                    </div>
                                </div>
                                <div className="button-group">
                                    <button className="btn-generate" onClick={() => handleGenerate('Generated')} disabled={generating}>
                                        <FileText size={18} /> Generate Salary Slip
                                    </button>
                                    <button className="btn-save dark" onClick={() => handleGenerate('Draft')} disabled={generating}>
                                        <Save size={18} /> Save Draft
                                    </button>
                                    <button className="btn-cancel" onClick={() => setSalaryData(null)}>
                                        <X size={18} /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateSalary;
