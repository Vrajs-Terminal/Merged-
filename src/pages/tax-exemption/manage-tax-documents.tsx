import { useState, useEffect } from 'react';
import { Search, FolderOpen, UploadCloud, Eye, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './tax-documents.css';

interface Employee {
    id: number;
    name: string;
    branch_id: number;
    department_id: number;
}

interface Doc {
    id: number;
    user_id: number;
    category_id: number;
    sub_category_id: number;
    financial_year: string;
    declared_amount: number;
    proof_url: string | null;
    status: string;
    category: { category_name: string; section_code: string; max_limit: number; };
    subCategory: { sub_category_name: string; max_limit: number; proof_required: boolean; };
}

const ManageTaxDocuments = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [selectedEmpId, setSelectedEmpId] = useState<number | ''>('');
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch all employees for dropdown
        api.get('/users').then(res => setEmployees(res.data)).catch(() => {});
    }, []);

    const loadEmployeeDocuments = async () => {
        if (!selectedEmpId) return toast.error("Please select an employee first.");
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-documents', {
                params: {
                    user_id: selectedEmpId,
                    financial_year: financialYear
                }
            });
            setDocuments(res.data);
        } catch (error) {
            toast.error("Failed to fetch documents.");
        } finally {
            setLoading(false);
        }
    };

    // Group documents by Category
    const groupedDocs = documents.reduce((acc, doc) => {
        const catName = `${doc.category.section_code} - ${doc.category.category_name}`;
        if (!acc[catName]) {
            acc[catName] = { limit: doc.category.max_limit, docs: [], totalDeclared: 0 };
        }
        acc[catName].docs.push(doc);
        acc[catName].totalDeclared += doc.declared_amount;
        return acc;
    }, {} as Record<string, { limit: number, docs: Doc[], totalDeclared: number }>);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Approved': return <span className="badge approved"><CheckCircle size={12}/> Approved</span>;
            case 'Pending': return <span className="badge pending"><Clock size={12}/> Pending Proof</span>;
            case 'Rejected': return <span className="badge rejected"><AlertTriangle size={12}/> Rejected</span>;
            default: return <span className="badge review"><Search size={12}/> Under Review</span>;
        }
    };

    const selectedEmp = employees.find(e => e.id === Number(selectedEmpId));

    return (
        <div className="tax-doc-layout">
            <div className="tax-doc-container">
                <div className="td-header">
                    <div>
                        <h2>Manage Tax Benefit Documents</h2>
                        <p>Guided flow for viewing and tracking tax declarations and proofs submitted by an employee.</p>
                    </div>
                </div>

                <div className="td-filter-card">
                    <div className="td-filter-group" style={{ flex: 2 }}>
                        <label>Select Employee *</label>
                        <select className="td-select" value={selectedEmpId} onChange={e => setSelectedEmpId(Number(e.target.value))}>
                            <option value="">-- Choose Employee --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div className="td-filter-group">
                        <label>Financial Year</label>
                        <select className="td-select" value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                            <option value="2025-26">2025-26</option>
                            <option value="2024-25">2024-25</option>
                        </select>
                    </div>
                    <button className="btn-primary" onClick={loadEmployeeDocuments} disabled={!selectedEmpId || loading}>
                        {loading ? 'Loading...' : 'Load Documents'}
                    </button>
                </div>

                {selectedEmp && documents.length > 0 && (
                    <div className="td-emp-card">
                        <div className="td-emp-avatar">{selectedEmp.name.charAt(0)}</div>
                        <div className="td-emp-detail" style={{ flex: 1 }}>
                            <h3>{selectedEmp.name}</h3>
                            <p>Submission Tracker for Financial Year {financialYear}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Total Sections Declared</p>
                            <h3 style={{ margin: '4px 0 0 0', color: '#0f172a', fontSize: 24 }}>{Object.keys(groupedDocs).length}</h3>
                        </div>
                    </div>
                )}

                {Object.keys(groupedDocs).length === 0 && selectedEmpId && !loading && (
                    <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                        <FolderOpen size={48} color="#cbd5e1" style={{ margin: '0 auto' }}/>
                        <h3 style={{ margin: '16px 0 8px 0', color: '#0f172a' }}>No Declarations Found</h3>
                        <p style={{ color: '#64748b' }}>This employee has not declared any tax benefits for {financialYear}.</p>
                    </div>
                )}

                {Object.entries(groupedDocs).map(([catName, data]) => (
                    <div key={catName} className="td-category-section">
                        <div className="td-cat-header">
                            <h4><FolderOpen size={18} color="#3b82f6"/> {catName}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ fontSize: 13, color: '#475569' }}>
                                    Declared: <strong style={{ color: '#0f172a' }}>₹{data.totalDeclared.toLocaleString()}</strong> / Max Limit: ₹{data.limit.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <table className="td-table">
                            <thead>
                                <tr>
                                    <th>Sub Category</th>
                                    <th>Declared Amount</th>
                                    <th>Proof Requirement</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.docs.map(doc => (
                                    <tr key={doc.id}>
                                        <td style={{ fontWeight: 500 }}>{doc.subCategory.sub_category_name}</td>
                                        <td>₹{doc.declared_amount.toLocaleString()}</td>
                                        <td>
                                            {doc.subCategory.proof_required ? (
                                                doc.proof_url ? <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 500 }}>Uploaded</span> : <span style={{ color: '#ef4444', fontSize: 13, fontWeight: 500 }}>Missing Required Proof</span>
                                            ) : (
                                                <span style={{ color: '#64748b', fontSize: 13 }}>Not Required</span>
                                            )}
                                        </td>
                                        <td>{getStatusBadge(doc.status)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                <button className="btn-icon" title="View Document" disabled={!doc.proof_url} style={{ opacity: doc.proof_url ? 1 : 0.5 }}>
                                                    <Eye size={16}/>
                                                </button>
                                                <button className="btn-icon" title="Upload Replacement">
                                                    <UploadCloud size={16}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageTaxDocuments;
