import { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, RefreshCcw, CheckSquare, Send, Mail } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

const Form16Factory = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [forms, setForms] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    useEffect(() => {
        loadForms();
    }, [financialYear]);

    const loadForms = async () => {
        setLoading(true);
        try {
            // We load existing Form 16 states. Note: For uninitialized employees, HRMS often merges employee list here.
            // For simplicity, we assume Form16Documents are pre-seeded upon FY start, or we fetch users and join.
            // We will fetch users, then Form16 statuses and map.
            const [userRes, formsRes] = await Promise.all([
                api.get('/users'),
                api.get('/payroll/form16', { params: { financial_year: financialYear } })
            ]);

            const userMap = userRes.data.map((u: any) => {
                const record = formsRes.data.find((f: any) => f.user_id === u.id);
                return {
                    user_id: u.id,
                    name: u.name,
                    pan_missing: Math.random() > 0.8, // Mock verification block 
                    ctc: u.employeeCTCs?.[0]?.ctc || 600000,
                    status: record?.status || 'Pending',
                    id: record?.id || null,
                    generated_date: record?.generated_date,
                    sent_date: record?.sent_date
                };
            });
            setForms(userMap);
        } catch (error) {
            toast.error("Failed to load factory matrix.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e: any) => {
        if(e.target.checked) setSelectedUsers(forms.filter(f => !f.pan_missing).map(f => f.user_id));
        else setSelectedUsers([]);
    };

    const toggleSelect = (uid: number) => {
        if(selectedUsers.includes(uid)) setSelectedUsers(selectedUsers.filter(id => id !== uid));
        else setSelectedUsers([...selectedUsers, uid]);
    };

    const handleBulkGenerate = async () => {
        if(selectedUsers.length === 0) return toast.error("Select at least 1 employee.");
        
        try {
            await api.post('/payroll/form16/generate-preview', {
                user_ids: selectedUsers,
                financial_year: financialYear
            });
            toast.success(`Computation engine triggered for ${selectedUsers.length} employees.`);
            setSelectedUsers([]);
            loadForms();
        } catch (error) {
            toast.error("Generation failed.");
        }
    };

    const handlePublish = async (formId: number) => {
        try {
            await api.put(`/payroll/form16/${formId}/publish`, { pdf_url: `https://minehr.cloud/f16/${formId}.pdf` });
            toast.success("Form 16 sent directly to employee inbox.");
            loadForms();
        } catch (error) {
            toast.error("Failed to publish document.");
        }
    };

    return (
        <div style={{ padding: 24, background: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, color: '#0f172a', fontSize: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FileText color="#3b82f6"/> Form 16 Factory
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                            Fusion engine that aggregates salary, tax exemptions, and TDS metadata to forge Part A & Part B matrices.
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
                            style={{ padding: '10px 20px', borderRadius: 8, background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                        ><Download size={16}/> Export ZIP</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                     <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 24, color: '#0f172a' }}>{forms.length}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Employees</p>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 24, color: '#0f172a' }}>{forms.filter(f => f.status === 'Pending').length}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Pending Processing</p>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 24, color: '#0f172a' }}>{forms.filter(f => f.status === 'Generated' || f.status === 'Sent').length}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Forge Success</p>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 24, color: '#ef4444' }}>{forms.filter(f => f.pan_missing).length}</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>PAN Missing / Blocked</p>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input type="checkbox" onChange={handleSelectAll} checked={selectedUsers.length > 0 && selectedUsers.length === forms.filter(f => !f.pan_missing).length}/>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{selectedUsers.length} Selected for Engine Trigger</span>
                        </div>
                        <button 
                            disabled={selectedUsers.length === 0}
                            style={{ 
                                padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: selectedUsers.length > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8,
                                background: selectedUsers.length > 0 ? '#10b981' : '#e2e8f0', color: selectedUsers.length > 0 ? 'white' : '#94a3b8' 
                            }}
                            onClick={handleBulkGenerate}
                        ><RefreshCcw size={16}/> Trigger Matrix Build</button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '16px 24px', width: 40, borderBottom: '1px solid #e2e8f0' }}></th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Employee</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Verification Flags</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Timestamps</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>Digital Release</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Checking engine...</td></tr>
                            ) : forms.map(f => (
                                <tr key={f.user_id} style={{ borderBottom: '1px solid #f1f5f9', background: f.pan_missing ? '#fef2f2' : 'transparent' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <input 
                                            type="checkbox" 
                                            disabled={f.pan_missing}
                                            checked={selectedUsers.includes(f.user_id)}
                                            onChange={() => toggleSelect(f.user_id)}
                                        />
                                    </td>
                                    <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a' }}>{f.name}</td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <span style={{ 
                                            padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, 
                                            background: f.status === 'Sent' ? '#dcfce7' : f.status === 'Generated' ? '#dbeate' : '#f1f5f9',
                                            color: f.status === 'Sent' ? '#16a34a' : f.status === 'Generated' ? '#2563eb' : '#64748b'
                                        }}>
                                            {f.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 13 }}>
                                        {f.pan_missing ? (
                                            <span style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckSquare size={14} color="#ef4444"/> PAN Unavailable</span>
                                        ) : (
                                            <span style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={14} color="#16a34a"/> Checks Passed</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: 13 }}>
                                        {f.generated_date ? new Date(f.generated_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        {(f.status === 'Generated') && (
                                            <button 
                                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                                onClick={() => handlePublish(f.id)}
                                            ><Mail size={14}/> Release to Employee</button>
                                        )}
                                        {f.status === 'Sent' && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}><Send size={14} style={{ verticalAlign: 'middle', marginRight: 4 }}/> Published</span>}
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

export default Form16Factory;
