import { useState, useEffect } from 'react';
import { Search, AlertCircle, RefreshCw, Eye, FileText } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './tax-documents.css';

interface Doc {
    id: number;
    user_id: number;
    category_id: number;
    sub_category_id: number;
    financial_year: string;
    declared_amount: number;
    rejection_reason: string;
    action_date: string;
    user: { id: number; name: string; };
    category: { category_name: string; section_code: string; };
    subCategory: { sub_category_name: string; };
}

const RejectedTaxDocuments = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadRejectedDocuments();
    }, [financialYear]);

    const loadRejectedDocuments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-documents', {
                params: { financial_year: financialYear, status: 'Rejected' }
            });
            setDocuments(res.data);
        } catch (error) {
            toast.error("Failed to load rejected documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleReminder = (doc: Doc) => {
        toast.success(`Reminder sent to ${doc.user.name} to re-upload ${doc.subCategory.sub_category_name}.`);
    };

    return (
        <div className="tax-doc-layout">
            <div className="tax-doc-container">
                <div className="td-header">
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertCircle color="#ef4444"/> Rejected Tax Documents</h2>
                        <p>Track documents rejected by HR and send automated re-upload reminders to employees.</p>
                    </div>
                    <select className="td-select" style={{ width: 150 }} value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                        <option value="2025-26">FY 2025-26</option>
                        <option value="2024-25">FY 2024-25</option>
                    </select>
                </div>

                <div className="td-category-section" style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                    <table className="td-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Category Detail</th>
                                <th>Declared</th>
                                <th style={{ width: '30%' }}>Rejection Reason (HR)</th>
                                <th>Rejected On</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading rejected history...</td></tr>
                            ) : documents.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No rejected documents found.</td></tr>
                            ) : documents.map(doc => (
                                <tr key={doc.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                                                {doc.user.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>{doc.user.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: '#1e293b' }}>{doc.category.section_code}</p>
                                        <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{doc.subCategory.sub_category_name}</p>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 13 }}>₹{doc.declared_amount.toLocaleString()}</span>
                                    </td>
                                    <td>
                                        <span style={{ display: 'inline-block', background: '#fff1f2', color: '#be123c', padding: '6px 12px', borderRadius: 6, fontSize: 12, lineHeight: 1.4 }}>
                                            {doc.rejection_reason || "No reason specified."}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: 13, color: '#64748b' }}>
                                        {doc.action_date ? new Date(doc.action_date).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleReminder(doc)}>
                                            <RefreshCw size={12}/> Ping Employee
                                        </button>
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

export default RejectedTaxDocuments;
