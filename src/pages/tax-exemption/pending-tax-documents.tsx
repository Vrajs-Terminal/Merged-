import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './tax-documents.css'; // Shared layout

interface Doc {
    id: number;
    user_id: number;
    category_id: number;
    sub_category_id: number;
    financial_year: string;
    declared_amount: number;
    proof_url: string | null;
    status: string;
    submitted_date: string;
    user: { id: number; name: string; };
    category: { category_name: string; section_code: string; };
    subCategory: { sub_category_name: string; proof_required: boolean; };
}

const PendingTaxDocuments = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Quick Action Tracking
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadPendingDocuments();
    }, [financialYear]);

    const loadPendingDocuments = async () => {
        setLoading(true);
        try {
            // Include 'Pending' and 'Under Review'
            const res = await api.get('/payroll/tax-documents', {
                params: { financial_year: financialYear, status: 'Pending,Under Review' }
            });
            setDocuments(res.data);
        } catch (error) {
            toast.error("Failed to load pending documents.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, status: 'Approved' | 'Rejected', reason?: string) => {
        setProcessingId(id);
        try {
            await api.put(`/payroll/tax-documents/${id}/status`, {
                status,
                rejection_reason: reason || null
            });
            toast.success(`Document ${status} successfully.`);
            setDocuments(docs => docs.filter(d => d.id !== id));
        } catch (error: any) {
            toast.error(error.response?.data?.error || `Failed to mark as ${status}`);
        } finally {
            setProcessingId(null);
        }
    };

    const requestRejectReason = (id: number) => {
        const reason = window.prompt("Enter rejection reason (mandatory):");
        if (reason && reason.trim()) {
            handleAction(id, 'Rejected', reason.trim());
        } else if (reason !== null) {
            toast.error("Rejection reason cannot be empty.");
        }
    };

    const isOldPending = (dateStr: string) => {
        const submitted = new Date(dateStr);
        const diff = (new Date().getTime() - submitted.getTime()) / (1000 * 3600 * 24);
        return diff > 7;
    };

    return (
        <div className="tax-doc-layout">
            <div className="tax-doc-container">
                <div className="td-header">
                    <div>
                        <h2>Pending Tax Documents</h2>
                        <p>Rapidly review and approve or reject outstanding tax benefit proofs submitted by employees.</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total Pending</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: 28, color: '#0f172a' }}>{documents.length}</h3>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>High Priority (&gt; 7 Days)</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: 28, color: '#ef4444' }}>{documents.filter(d => isOldPending(d.submitted_date)).length}</h3>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Missing Proofs</p>
                        <h3 style={{ margin: '4px 0 0 0', fontSize: 28, color: '#d97706' }}>{documents.filter(d => !d.proof_url).length}</h3>
                    </div>
                    <div style={{ background: 'white', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>Financial Year</p>
                        <select className="td-select" style={{ marginTop: 8, padding: 8 }} value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                            <option value="2025-26">2025-26</option>
                            <option value="2024-25">2024-25</option>
                        </select>
                    </div>
                </div>

                {/* Pending Table */}
                <div className="td-category-section" style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
                    <table className="td-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Category / Sub Category</th>
                                <th>Declared</th>
                                <th>Proof Document</th>
                                <th>Submission Date</th>
                                <th>Quick Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading pending documents...</td></tr>
                            ) : documents.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No pending documents found! 🎉</td></tr>
                            ) : documents.map(doc => (
                                <tr key={doc.id} style={{ background: isOldPending(doc.submitted_date) ? '#fff1f2' : 'white' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                                                {doc.user.name.charAt(0)}
                                            </div>
                                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{doc.user.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{doc.category.section_code}</p>
                                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{doc.subCategory.sub_category_name}</p>
                                    </td>
                                    <td><span style={{ fontWeight: 600, color: '#0f172a' }}>₹{doc.declared_amount.toLocaleString()}</span></td>
                                    <td>
                                        {doc.proof_url ? (
                                            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}><Eye size={12}/> View Proof</button>
                                        ) : doc.subCategory.proof_required ? (
                                            <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={14}/> Not Uploaded</span>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: 12 }}>Not Required</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOldPending(doc.submitted_date) ? '#ef4444' : '#64748b', fontSize: 13, fontWeight: isOldPending(doc.submitted_date) ? 600 : 400 }}>
                                            <Clock size={14}/> {new Date(doc.submitted_date).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button 
                                                className="btn-primary" 
                                                style={{ padding: '8px 12px', fontSize: 12, background: '#16a34a' }}
                                                onClick={() => handleAction(doc.id, 'Approved')}
                                                disabled={processingId === doc.id}
                                            >
                                                <CheckCircle size={14}/> {processingId === doc.id ? 'Wait...' : 'Approve'}
                                            </button>
                                            <button 
                                                className="btn-secondary" 
                                                style={{ padding: '8px 12px', fontSize: 12, color: '#ef4444', borderColor: '#fca5a5', background: '#fef2f2' }}
                                                onClick={() => requestRejectReason(doc.id)}
                                                disabled={processingId === doc.id}
                                            >
                                                <XCircle size={14}/> Reject
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

export default PendingTaxDocuments;
