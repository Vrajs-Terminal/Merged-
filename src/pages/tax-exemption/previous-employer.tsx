import { useState, useEffect } from 'react';
import { Briefcase, Building2, Banknote, Receipt, CheckCircle, Trash2, Edit2, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Employee {
    id: number;
    name: string;
}

interface Form12B {
    id: number;
    user_id: number;
    financial_year: string;
    previous_company: string;
    tan_no: string;
    period_from: string;
    period_to: string;
    gross_salary: number;
    exemptions: number;
    professional_tax: number;
    standard_deduction: number;
    other_deductions: number;
    tds_deducted: number;
    other_income: number;
    status: string;
    createdAt: string;
    user: { name: string; };
}

const Form12BComponent = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [forms, setForms] = useState<Form12B[]>([]);
    const [loading, setLoading] = useState(false);

    // Form Drawer State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [step, setStep] = useState(1);
    
    const initialFormData = {
        user_id: '',
        previous_company: '',
        tan_no: '',
        period_from: '',
        period_to: '',
        gross_salary: '',
        exemptions: '',
        professional_tax: '',
        standard_deduction: '',
        other_deductions: '',
        tds_deducted: '',
        other_income: ''
    };
    
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        api.get('/users').then(res => setEmployees(res.data)).catch(() => {});
        loadForms();
    }, [financialYear]);

    const loadForms = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/form12b', { params: { financial_year: financialYear } });
            setForms(res.data);
        } catch (error) {
            toast.error("Failed to load Form 12B records.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                ...formData,
                financial_year: financialYear,
                gross_salary: Number(formData.gross_salary),
                exemptions: Number(formData.exemptions || 0),
                professional_tax: Number(formData.professional_tax || 0),
                standard_deduction: Number(formData.standard_deduction || 0),
                other_deductions: Number(formData.other_deductions || 0),
                tds_deducted: Number(formData.tds_deducted || 0),
                other_income: Number(formData.other_income || 0),
            };

            await api.post('/payroll/form12b', payload);
            toast.success('Form 12B declared successfully.');
            setFormData(initialFormData);
            setStep(1);
            setIsFormOpen(false);
            loadForms();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save Form 12B.");
        }
    };

    const handleDelete = async (id: number) => {
        if(!window.confirm("Delete this Form 12B declaration?")) return;
        try {
            await api.delete(`/payroll/form12b/${id}`);
            toast.success("Deleted successfully.");
            setForms(f => f.filter(x => x.id !== id));
        } catch(error) {
            toast.error("Failed to delete.");
        }
    };

    const inputStyle = { padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none', width: '100%', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6, display: 'block' };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Briefcase color="#3b82f6"/> Form 12B Details
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Capture previous employer income and tax deductions to compute accurate current TDS liabilities.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <select 
                            style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
                            value={financialYear} onChange={e => setFinancialYear(e.target.value)}
                        >
                            <option value="2025-26">FY 2025-26</option>
                            <option value="2024-25">FY 2024-25</option>
                        </select>
                        <button 
                            style={{ padding: '10px 20px', borderRadius: 8, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            onClick={() => setIsFormOpen(true)}
                        >Declare Form 12B</button>
                    </div>
                </div>

                {isFormOpen && (
                    <div style={{ background: 'white', padding: 32, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                        
                        {/* Stepper */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 1 ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === 1 ? '#dbeate' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
                                Employer Info
                            </div>
                            <div style={{ width: 40, height: 2, background: '#e2e8f0', alignSelf: 'center' }}/>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 2 ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === 2 ? '#dbeate' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
                                Salary Income
                            </div>
                            <div style={{ width: 40, height: 2, background: '#e2e8f0', alignSelf: 'center' }}/>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: step === 3 ? '#2563eb' : '#94a3b8', fontWeight: 600 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: step === 3 ? '#dbeate' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                                Tax Deducted
                            </div>
                        </div>

                        {step === 1 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={labelStyle}>Employee *</label>
                                    <select style={inputStyle} value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})}>
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Previous Company Name *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Building2 size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }}/>
                                        <input type="text" style={{...inputStyle, paddingLeft: 36}} value={formData.previous_company} onChange={e => setFormData({...formData, previous_company: e.target.value})}/>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Employer TAN</label>
                                    <input type="text" style={inputStyle} placeholder="E.g., BLRP12345E" value={formData.tan_no} onChange={e => setFormData({...formData, tan_no: e.target.value})}/>
                                </div>
                                <div>
                                    <label style={labelStyle}>Employed From Date *</label>
                                    <input type="date" style={inputStyle} value={formData.period_from} onChange={e => setFormData({...formData, period_from: e.target.value})}/>
                                </div>
                                <div>
                                    <label style={labelStyle}>Employed To Date *</label>
                                    <input type="date" style={inputStyle} value={formData.period_to} onChange={e => setFormData({...formData, period_to: e.target.value})}/>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <label style={labelStyle}>Gross Salary Received *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Banknote size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }}/>
                                        <input type="number" style={{...inputStyle, paddingLeft: 36, fontSize: 16, fontWeight: 600}} value={formData.gross_salary} onChange={e => setFormData({...formData, gross_salary: e.target.value})}/>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Standard Deduction Allowed</label>
                                    <input type="number" style={inputStyle} placeholder="50000" value={formData.standard_deduction} onChange={e => setFormData({...formData, standard_deduction: e.target.value})}/>
                                </div>
                                <div>
                                    <label style={labelStyle}>Other Exemptions (HRA, LTA etc.)</label>
                                    <input type="number" style={inputStyle} value={formData.exemptions} onChange={e => setFormData({...formData, exemptions: e.target.value})}/>
                                </div>
                                <div>
                                    <label style={labelStyle}>Other Income Declared (If Any)</label>
                                    <input type="number" style={inputStyle} value={formData.other_income} onChange={e => setFormData({...formData, other_income: e.target.value})}/>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                <div>
                                    <label style={labelStyle}>Total TDS Deducted (By Prev. Employer) *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Receipt size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }}/>
                                        <input type="number" style={{...inputStyle, paddingLeft: 36, fontSize: 16, fontWeight: 600, color: '#0f172a', borderColor: '#3b82f6'}} value={formData.tds_deducted} onChange={e => setFormData({...formData, tds_deducted: e.target.value})}/>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Professional Tax Paid</label>
                                    <input type="number" style={inputStyle} value={formData.professional_tax} onChange={e => setFormData({...formData, professional_tax: e.target.value})}/>
                                </div>
                                <div>
                                    <label style={labelStyle}>Other Deductions (Chap VI-A)</label>
                                    <input type="number" style={inputStyle} placeholder="E.g., 80C, 80D claimed" value={formData.other_deductions} onChange={e => setFormData({...formData, other_deductions: e.target.value})}/>
                                </div>
                                <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 12, gridColumn: 'span 2' }}>
                                    <AlertCircle color="#2563eb" style={{ flexShrink: 0 }}/>
                                    <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a' }}>
                                        Ensure total TDS entered here exactly matches the employee's pending Form 16 Part A/B from the previous organization. The system will offset any tax computations moving forward using this TDS amount.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                            <button 
                                style={{ padding: '10px 20px', borderRadius: 8, background: 'white', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                                onClick={() => { setStep(1); setIsFormOpen(false); }}
                            >Cancel</button>
                            
                            <div style={{ display: 'flex', gap: 12 }}>
                                {step > 1 && (
                                    <button 
                                        style={{ padding: '10px 20px', borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setStep(step - 1)}
                                    >Back</button>
                                )}
                                {step < 3 ? (
                                    <button 
                                        style={{ padding: '10px 24px', borderRadius: 8, background: '#3b82f6', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => {
                                            if (step===1 && (!formData.user_id || !formData.previous_company || !formData.period_from || !formData.period_to)) return toast.error("Fill mandatory fields");
                                            if (step===2 && !formData.gross_salary) return toast.error("Gross Salary is required");
                                            setStep(step + 1);
                                        }}
                                    >Continue</button>
                                ) : (
                                    <button 
                                        style={{ padding: '10px 24px', borderRadius: 8, background: '#10b981', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                                        onClick={handleSave}
                                    ><CheckCircle size={16}/> Finalize Declaration</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Table View */}
                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Previous Org</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Period</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Prev Gross</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Prev TDS</th>
                                <th style={{ background: '#f8fafc', padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading Form 12B databank...</td></tr>
                            ) : forms.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No Form 12B records discovered for this year.</td></tr>
                            ) : forms.map(f => (
                                <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{f.user.name}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ display: 'block', fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{f.previous_company}</span>
                                        <span style={{ display: 'block', color: '#64748b', fontSize: 12 }}>TAN: {f.tan_no || 'N/A'}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>
                                        {new Date(f.period_from).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })} - {new Date(f.period_to).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{f.gross_salary.toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹{f.tds_deducted.toLocaleString()}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button style={{ background: 'none', border: '1px solid #e2e8f0', color: '#64748b', borderRadius: 6, padding: '6px', cursor: 'pointer' }}>
                                                <Edit2 size={16}/>
                                            </button>
                                            <button style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: 6, padding: '6px', cursor: 'pointer' }} onClick={() => handleDelete(f.id)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default Form12BComponent;
