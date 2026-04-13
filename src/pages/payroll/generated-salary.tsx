import { useState, useEffect } from 'react';
import { 
    Eye, Edit, Trash2, Printer, 
    CheckCircle, Loader2, FileText, CheckSquare, Trash,
    Calendar, Users, IndianRupee, FileSpreadsheet
} from 'lucide-react';
import api from '../../lib/axios';
import './generated-salary.css';
import { toast } from 'react-hot-toast';
import { generateSalaryPDF } from '../../utils/pdf-utils';
import * as XLSX from 'xlsx';

const GeneratedSalary = () => {
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [slips, setSlips] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'Generated'
    });

    useEffect(() => {
        fetchInitialData();
        fetchSlips();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [bRes, dRes] = await Promise.all([
                api.get('/branches'),
                api.get('/departments')
            ]);
            setBranches(bRes.data);
            setDepartments(dRes.data);
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const fetchSlips = async () => {
        setLoading(true);
        try {
            const res = await api.get('/salary-slips/list', { params: filters });
            setSlips(res.data);
        } catch (error) {
            toast.error("Failed to fetch salary slips");
        } finally {
            setLoading(false);
        }
    };

    const handlePublishAll = async () => {
        if (slips.length === 0) return;
        if (!confirm(`Are you sure you want to publish all ${slips.length} slips?`)) return;

        try {
            const ids = slips.map(s => s.id);
            await api.patch('/salary-slips/publish', { ids });
            toast.success("All slips published successfully");
            fetchSlips();
        } catch (error) {
            toast.error("Publishing failed");
        }
    };

    const handleDeleteAll = async () => {
        if (slips.length === 0) return;
        if (!confirm(`Are you sure you want to delete all ${slips.length} slips?`)) return;

        try {
            const ids = slips.map((s: any) => s.id);
            await api.post('/salary-slips/bulk-delete', { ids });
            toast.success("All slips deleted successfully");
            fetchSlips();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this salary slip?")) return;
        try {
            await api.delete(`/salary-slips/${id}`);
            toast.success("Slip deleted");
            fetchSlips();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Delete failed");
        }
    };

    const handlePublishSingle = async (id: number) => {
        try {
            await api.patch('/salary-slips/publish', { ids: [id] });
            toast.success("Slip published");
            fetchSlips();
        } catch (error) {
            toast.error("Publish failed");
        }
    };

    const handlePrintAll = async () => {
        if (slips.length === 0) return;
        const confirmPrint = confirm(`Are you sure you want to generate ${slips.length} PDFs? This might take a moment.`);
        if (!confirmPrint) return;

        toast.loading("Generating PDFs...", { id: 'print-all' });
        try {
            // Process in small batches or sequence to avoid browser hanging
            for (const s of slips) {
                generateSalaryPDF(s);
                // Minimal delay to ensure browser handles downloads
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            toast.success("PDF Generation completed", { id: 'print-all' });
        } catch (error) {
            toast.error("Error generating some PDFs", { id: 'print-all' });
        }
    };

    const handleExportExcel = () => {
        if (slips.length === 0) return;
        
        const data = slips.map((s, idx) => ({
            "Sr No": idx + 1,
            "Employee Name": s.user.name,
            "Employee Email": s.user.email,
            "Branch": s.user.branch?.name || 'Main',
            "Department": s.user.department?.name || 'N/A',
            "Month": months[s.month - 1],
            "Year": s.year,
            "Gross Salary": s.employeeCtc.gross_salary,
            "Net Salary": s.net_salary,
            "Status": s.status,
            "Generated On": new Date(s.createdAt).toLocaleDateString()
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Generated_Salaries");
        XLSX.writeFile(wb, `Generated_Salaries_${months[filters.month - 1]}_${filters.year}.xlsx`);
        toast.success("Excel export successful");
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="generated-salary-layout">
            <div className="generated-salary-container">
                <div className="generated-salary-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <FileSpreadsheet size={32} className="page-title-icon text-indigo-600" />
                            <h2>Generated Salary Slips</h2>
                        </div>
                        <p>Review and finalize salary slips before publishing</p>
                    </div>
                </div>

                {/* Filter Panel */}
                <div className="slips-filter-card">
                    <div className="filter-grid">
                        <div className="form-group">
                            <label>Branch</label>
                            <select className="premium-control" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
                                <option value="">All Branches</option>
                                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <select className="premium-control" value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})}>
                                <option value="">All Departments</option>
                                {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Month</label>
                            <select className="premium-control" value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
                                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Year</label>
                            <select className="premium-control" value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
                                <option>2026</option>
                                <option>2025</option>
                            </select>
                        </div>
                        <div className="form-group btn-align">
                            <button className="btn-view-report" onClick={fetchSlips}>
                                <Eye size={18} /> View Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Header */}
                <div className="bulk-action-bar">
                    <div className="selection-info">
                        <Users size={16} className="text-indigo-500" />
                        <span>{slips.length} Salaries Found</span>
                    </div>
                    <div className="bar-actions">
                        <button className="btn-print-all" onClick={handlePrintAll} disabled={slips.length === 0}>
                            <Printer size={16} /> Print All
                        </button>
                        <button className="btn-publish-all" onClick={handlePublishAll} disabled={slips.length === 0}>
                            <CheckSquare size={16} /> Publish All
                        </button>
                        <button className="btn-export-all" onClick={handleExportExcel} disabled={slips.length === 0} style={{
                             background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                             color: 'white',
                             padding: '10px 20px',
                             borderRadius: '12px',
                             display: 'flex',
                             alignItems: 'center',
                             gap: '8px',
                             fontWeight: '600',
                             border: 'none',
                             cursor: 'pointer'
                        }}>
                            <FileSpreadsheet size={16} /> Export Excel
                        </button>
                        <button className="btn-delete-all" onClick={handleDeleteAll} disabled={slips.length === 0}>
                            <Trash size={16} /> Delete All
                        </button>
                    </div>
                </div>

                {/* Slips Table */}
                <div className="slips-table-card">
                    <div className="table-wrapper">
                        <table className="slips-table">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                    <th>Employee Name</th>
                                    <th>Branch</th>
                                    <th>Gross Salary</th>
                                    <th>Net Salary</th>
                                    <th>Month</th>
                                    <th>Salary Mode</th>
                                    <th>Generated On</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={10} className="loading-state">
                                            <Loader2 size={32} className="spin" />
                                            <p>Loading salary slips...</p>
                                        </td>
                                    </tr>
                                ) : slips.map((s: any, idx: number) => (
                                    <tr key={s.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <span className="badge-generated">{s.status}</span>
                                        </td>
                                        <td>
                                            <div className="action-row">
                                                <button className="act-btn print" title="Print PDF" onClick={() => generateSalaryPDF(s)}><Printer size={14} /></button>
                                                <button className="act-btn publish" title="Publish" onClick={() => handlePublishSingle(s.id)}><CheckCircle size={14} /></button>
                                                <button className="act-btn view" title="View Detail"><Eye size={14} /></button>
                                                <button className="act-btn edit" title="Edit"><Edit size={14} /></button>
                                                <button className="act-btn delete" title="Delete" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="emp-tag">
                                                <div className="tag-avatar">{s.user.name.charAt(0)}</div>
                                                <span>{s.user.name}</span>
                                            </div>
                                        </td>
                                        <td>{s.user.branch?.name || 'Main'}</td>
                                        <td className="bold"><IndianRupee size={12} className="inline mr-1" /> {s.employeeCtc.gross_salary.toLocaleString()}</td>
                                        <td className="net-val"><IndianRupee size={12} className="inline mr-1" /> {s.net_salary.toLocaleString()}</td>
                                        <td>{months[s.month - 1]} {s.year}</td>
                                        <td>{s.salary_mode}</td>
                                        <td className="date-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {!loading && slips.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="empty-state">
                                            <FileText size={48} />
                                            <p>No generated salary slips found for the selected period.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneratedSalary;
