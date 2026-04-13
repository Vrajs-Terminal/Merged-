import React, { useState, useRef } from "react";
import axios from "axios";
import API_BASE from "../api";
import "./bulkUpdate.css";
import { Upload, Download, CheckCircle, FileSpreadsheet, ArrowRight, ArrowLeft, Filter } from "lucide-react";
import PageTitle from "../../components/PageTitle";

const UPDATE_TYPES = [
    "Job Information",
    "Contact Details",
    "Personal Information",
    "Bank Details",
    "Employee Status"
];

function BulkUpdate() {
    const [step, setStep] = useState(1);
    const [updateType, setUpdateType] = useState(UPDATE_TYPES[0]);
    const [branchId, setBranchId] = useState("");
    const [departmentId, setDepartmentId] = useState("");

    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({ success: 0, fail: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [branchRes, deptRes] = await Promise.all([
                    axios.get(`${API_BASE}/branches`),
                    axios.get(`${API_BASE}/departments`)
                ]);
                setBranches(branchRes.data);
                setDepartments(deptRes.data);
            } catch (error) {
                console.error("Failed to load filters", error);
            }
        };
        fetchFilters();
    }, []);

    // Dependency-free CSV Parser
    const parseCSV = (csvText: string): Promise<any[]> => {
        return new Promise((resolve) => {
            const lines = csvText.trim().split(/\r?\n/);
            if (lines.length === 0) return resolve([]);

            const headers = lines[0].split(',').map(h => h.trim());
            const result = [];

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue; // skip empty lines

                // Simple regex to handle commas inside quotes, though for HR templates basic splitting is usually fine
                const rowRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
                const values = lines[i].split(rowRegex).map(v => v.replace(/^"|"$/g, '').trim());

                const obj: any = {};
                headers.forEach((header, index) => {
                    obj[header] = values[index];
                });
                result.push(obj);
            }
            resolve(result);
        });
    };

    const handleDownloadTemplate = async () => {
        try {
            const res = await axios.get(`${API_BASE}/bulk-update/template?updateType=${updateType}&branchId=${branchId}&departmentId=${departmentId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${updateType.replace(/\s+/g, "_")}_Template.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert("Failed to download template");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (!selectedFile.name.endsWith('.csv')) {
                alert("Please upload a CSV file");
                return;
            }
            // Read & Parse File immediately for preview validation
            setLoading(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
                const text = event.target?.result as string;
                const parsedData = await parseCSV(text);

                // Send to backend for business rule validation
                validateWithBackend(parsedData);
            };
            reader.readAsText(selectedFile);
        }
    };

    const validateWithBackend = async (data: any[]) => {
        try {
            const res = await axios.post(`${API_BASE}/bulk-update/validate`, {
                updateType,
                data
            });
            setPreviewData(res.data.results);
            setStep(3); // Move to review step
        } catch (error) {
            alert("Failed to validate data");
        } finally {
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/bulk-update/apply`, {
                updateType,
                validatedData: previewData
            });
            setSummary({ success: res.data.successCount, fail: res.data.failCount });
            setStep(4);
        } catch (error) {
            alert("Failed to apply updates");
        } finally {
            setLoading(false);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setPreviewData([]);
    };

    return (
        <div className="bulk-update-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Bulk Operations" 
                    subtitle="Effortlessly modify mass employee records via automated CSV workflows" 
                />
            </div>

            <div className="wizard-nav glass-card mb-8 px-8 py-4">
                <div className={`wizard-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <div className="wizard-step-circle">1</div>
                    <div className="wizard-step-label">Select Type</div>
                    <div className="wizard-step-line"></div>
                </div>
                <div className={`wizard-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <div className="wizard-step-circle">2</div>
                    <div className="wizard-step-label">Upload CSV</div>
                    <div className="wizard-step-line"></div>
                </div>
                <div className={`wizard-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
                    <div className="wizard-step-circle">3</div>
                    <div className="wizard-step-label">Validate</div>
                    <div className="wizard-step-line"></div>
                </div>
                <div className={`wizard-step ${step >= 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}`}>
                    <div className="wizard-step-circle">4</div>
                    <div className="wizard-step-label">Complete</div>
                </div>
            </div>

            <div className="step-content-card">
                {step === 1 && (
                    <div className="step-1-content text-center mx-auto" style={{ maxWidth: '500px' }}>
                        <FileSpreadsheet size={48} color="#3b82f6" className="mx-auto mb-4" />
                        <h3>1. Select Filters & Type</h3>
                        <p className="mb-6 text-gray-500 text-sm">Choose the type of employee data you want to update.</p>

                        <div className="mb-4">
                            <label className="text-sm font-semibold text-left block mb-2" style={{ color: '#64748b' }}>Update Type <span style={{ color: 'red' }}>*</span></label>
                            <select
                                value={updateType}
                                onChange={(e) => setUpdateType(e.target.value)}
                            >
                                {UPDATE_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="text-sm font-semibold text-left block mb-2" style={{ color: '#64748b' }}>Branch Filter (Optional)</label>
                            <select
                                value={branchId}
                                onChange={(e) => setBranchId(e.target.value)}
                            >
                                <option value="">All Branches</option>
                                {branches.map(b => (
                                    <option key={b.id} value={b.id}>{b.branchName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-left block mb-2" style={{ color: '#64748b' }}>Department Filter (Optional)</label>
                            <select
                                value={departmentId}
                                onChange={(e) => setDepartmentId(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {departments.map(d => (
                                    <option key={d.id} value={d.id}>{d.departmentName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-center mt-6 gap-4" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={handleDownloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Download size={18} /> Download Template
                            </button>
                            <button className="btn-primary" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Next Step <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-2-content text-center mx-auto" style={{ maxWidth: '500px', paddingTop: '40px' }}>
                        <Upload size={48} color="#6366f1" className="mx-auto mb-4" />
                        <h3>Upload Data</h3>
                        <p className="mb-6">Upload the populated CSV file for <strong>{updateType}</strong></p>

                        <input
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />

                        {loading ? (
                            <div className="loading-state">Analyzing Document...</div>
                        ) : (
                            <div
                                style={{ background: '#f8fafc', padding: '40px', border: '2px dashed #93c5fd', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s', ...(fileInputRef.current ? { background: '#eff6ff', borderColor: '#3b82f6' } : {}) }}
                                onClick={() => fileInputRef.current?.click()}
                                onMouseOver={(e) => e.currentTarget.style.background = '#eff6ff'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                            >
                                <Upload size={32} color="#3b82f6" className="mx-auto mb-4" />
                                <h4 style={{ color: '#1e293b', margin: '0 0 8px 0' }}>Select CSV File</h4>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Drag and drop or click to browse</p>
                            </div>
                        )}

                        <div className="mt-6" style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={() => setStep(1)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeft size={18} /> Back
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-3-content">
                        <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3>Validation Preview</h3>
                            <div className="validation-summary" style={{ display: 'flex', gap: '12px' }}>
                                <span className="valid-count" style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
                                    {previewData.filter(d => d.status === 'Valid').length} Valid
                                </span>
                                <span className="error-count" style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '13px' }}>
                                    {previewData.filter(d => d.status === 'Error').length} Errors
                                </span>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Employee ID</th>
                                        <th>Changes Detected</th>
                                        <th>Messages</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((item) => (
                                        <tr key={item.row["Employee ID"] || Math.random()} className={item.status === 'Error' ? 'row-error' : ''} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td>
                                                <span className={`status-badge ${item.status === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: item.status === 'Valid' ? '#dcfce7' : '#fee2e2', color: item.status === 'Valid' ? '#166534' : '#991b1b' }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '600', color: '#1e293b' }}>{item.row["Employee ID"]}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {Object.keys(item.mappedData || {}).map(field => (
                                                        <div key={field} className="change-item">
                                                            <span className="field-name" style={{ color: '#475569' }}>{field}: </span>
                                                            <span style={{ textDecoration: 'line-through', color: '#ef4444' }}>{String(item.oldData?.[field]) || 'None'}</span>
                                                            <ArrowRight size={12} style={{ display: 'inline', margin: '0 8px', color: '#94a3b8' }} />
                                                            <span style={{ color: '#10b981', fontWeight: '600' }}>{item.mappedData[field]}</span>
                                                        </div>
                                                    ))}
                                                    {!Object.keys(item.mappedData || {}).length && <span style={{ color: '#94a3b8', fontSize: '13px' }}>No changes</span>}
                                                </div>
                                            </td>
                                            <td style={{ color: item.status === 'Error' ? '#ef4444' : '#64748b', fontSize: '13px' }}>
                                                {item.errors?.join(", ") || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                    {previewData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No data to preview.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="actions justify-between mt-6" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                            <button className="btn-secondary" onClick={() => { setStep(2); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Upload size={18} /> Re-Upload
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleCommit}
                                disabled={previewData.filter(d => d.status === 'Valid').length === 0 || loading}
                            >
                                {loading ? "Applying..." : "Confirm & Apply Updates"}
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="step-4-content text-center mx-auto" style={{ maxWidth: '500px', paddingTop: '40px' }}>
                        <CheckCircle size={64} color="#10b981" className="mx-auto mb-4" />
                        <h3 className="text-xl mb-2" style={{ fontSize: '24px', marginBottom: '8px' }}>Update Complete</h3>
                        <p style={{ color: '#64748b', marginBottom: '32px' }}>The bulk operation has been successfully processed.</p>

                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginBottom: '40px' }}>
                            <div className="stat-item" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', minWidth: '150px' }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>{summary.success}</div>
                                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Records Updated</div>
                            </div>
                            <div className="stat-item" style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', minWidth: '150px' }}>
                                <div style={{ fontSize: '36px', fontWeight: 'bold', color: summary.fail > 0 ? '#ef4444' : '#64748b' }}>{summary.fail}</div>
                                <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Records Failed</div>
                            </div>
                        </div>

                        <button className="btn-primary" onClick={resetFlow} style={{ width: '100%' }}>
                            Start New Bulk Update
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BulkUpdate;
