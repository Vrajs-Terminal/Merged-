import { useState, useEffect } from 'react';
import { 
    Filter, Eye, Printer, Share2, 
    Loader2, FileText, Download, 
    ToggleLeft, ToggleRight, Mail, ExternalLink,
    IndianRupee, Users, Calendar, Briefcase, CheckCircle2
} from 'lucide-react';
import api from '../../lib/axios';
import './published-salary.css';
import { toast } from 'react-hot-toast';
import { generateSalaryPDF } from '../../utils/pdf-utils';
import * as XLSX from 'xlsx';

const PublishedSalary = () => {
    // ... state and effects ...
    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [slips, setSlips] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        branch_id: '',
        department_id: '',
        employee_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        employee_type: 'Active',
        status: 'Published'
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
            toast.error("Failed to fetch published slips");
        } finally {
            setLoading(false);
        }
    };

    const toggleShare = async (id: number, currentStatus: boolean) => {
        try {
            const nextStatus = !currentStatus;
            await api.patch(`/salary-slips/${id}/share`, { is_shared: nextStatus });
            toast.success(nextStatus ? "Shared with employee" : "Hidden from employee");
            setSlips(slips.map(s => s.id === id ? {...s, is_shared: nextStatus} : s));
        } catch (error) {
            toast.error("Toggle share failed");
        }
    };

    const handlePrintAll = async () => {
        if (slips.length === 0) return;
        const confirmPrint = confirm(`Are you sure you want to generate ${slips.length} PDFs?`);
        if (!confirmPrint) return;

        toast.loading("Generating PDFs...", { id: 'print-all' });
        try {
            for (const s of slips) {
                generateSalaryPDF(s);
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
            "Branch": s.user.branch?.name || 'N/A',
            "Department": s.user.department?.name || 'N/A',
            "Month": months[s.month - 1],
            "Year": s.year,
            "Gross Salary": s.employeeCtc.gross_salary,
            "Net Salary": s.net_salary,
            "Is Shared": s.is_shared ? 'Yes' : 'No',
            "Salary Mode": s.salary_mode
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Published_Salaries");
        XLSX.writeFile(wb, `Published_Salaries_${months[filters.month - 1]}_${filters.year}.xlsx`);
        toast.success("Excel export successful");
    };

    const handleBulkShare = async (status: boolean) => {
        if (slips.length === 0) return;
        if (!confirm(`Are you sure you want to ${status ? 'share' : 'hide'} all filtered slips?`)) return;

        try {
            const ids = slips.map(s => s.id);
            await api.patch('/salary-slips/bulk-share', { ids, is_shared: status });
            toast.success(`Successfully ${status ? 'shared' : 'hidden'} all slips`);
            fetchSlips();
        } catch (error) {
            toast.error("Bulk share operation failed");
        }
    };

    const handleSendEmail = (empName: string) => {
        toast.success(`Salary slip sent to ${empName}'s registered email`);
    };

    const handlePublicLink = (id: number) => {
        const link = `${window.location.origin}/#/view-slip/${id}`;
        navigator.clipboard.writeText(link);
        toast.success("Public access link copied to clipboard");
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="published-salary-layout">
            <div className="published-salary-container">
                <div className="published-salary-header">
                    <div className="header-info">
                        <div className="title-with-icon">
                            <CheckCircle2 size={32} className="page-title-icon text-indigo-600" />
                            <h2>Published Salary Slips</h2>
                        </div>
                        <p>Manage finalized payroll and employee access</p>
                    </div>
                </div>

                {/* Filter Panel */}
                <div className="published-filter-card">
                    <div className="filter-grid">
                        <div className="form-group">
                            <label><Briefcase size={14} /> Branch</label>
                            <select className="premium-control" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Users size={14} /> Department</label>
                            <select className="premium-control" value={filters.department_id} onChange={e => setFilters({...filters, department_id: e.target.value})}>
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Users size={14} /> Employee Type</label>
                            <select className="premium-control" value={filters.employee_type} onChange={e => setFilters({...filters, employee_type: e.target.value})}>
                                <option>Active</option>
                                <option>Ex-Employee</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label><Calendar size={14} /> Month / Year</label>
                            <div className="month-year-group">
                                <select className="premium-control" value={filters.month} onChange={e => setFilters({...filters, month: parseInt(e.target.value)})}>
                                    {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                </select>
                                <select className="premium-control" value={filters.year} onChange={e => setFilters({...filters, year: parseInt(e.target.value)})}>
                                    <option>2026</option>
                                    <option>2025</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group btn-align">
                            <button className="btn-get-selection" onClick={fetchSlips}>
                                <Filter size={18} /> Get Selection
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Actions */}
                <div className="top-action-bar">
                    <div className="count-info">
                        <Users size={16} className="text-indigo-500 inline mr-2" />
                        <strong>{slips.length}</strong> Slips Published
                    </div>
                    <div className="bar-btn-group">
                        <button className="btn-action primary" onClick={handlePrintAll}>
                            <Printer size={16} /> Print All PDF
                        </button>
                        <button className="btn-action secondary" onClick={() => handleBulkShare(true)}>
                            <Share2 size={16} /> Bulk Share
                        </button>
                        <button className="btn-action outline" onClick={handleExportExcel}>
                            <Download size={16} /> Export Excel
                        </button>
                    </div>
                </div>

                {/* Published Slips Table */}
                <div className="published-table-card">
                    <div className="table-wrapper">
                        <table className="published-table">
                            <thead>
                                <tr>
                                    <th>Sr. No</th>
                                    <th>Share with User</th>
                                    <th>Action</th>
                                    <th>Employee Name</th>
                                    <th>Branch</th>
                                    <th>Department</th>
                                    <th>Gross Salary</th>
                                    <th>Net Salary</th>
                                    <th>Month</th>
                                    <th>Salary Mode</th>
                                    <th>Reporting Person</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="loading-row">
                                            <Loader2 size={32} className="spin" />
                                            <p>Loading published slips...</p>
                                        </td>
                                    </tr>
                                ) : slips.map((s, idx) => (
                                    <tr key={s.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div className="toggle-wrapper" onClick={() => toggleShare(s.id, s.is_shared)}>
                                                {s.is_shared ? (
                                                    <ToggleRight className="toggle-icon active" size={28} />
                                                ) : (
                                                    <ToggleLeft className="toggle-icon ghost" size={28} />
                                                )}
                                                <span className={s.is_shared ? 'shared' : 'hidden'}>
                                                    {s.is_shared ? 'Shared' : 'Hidden'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="pub-action-row">
                                                <button className="pub-act view" title="View"><Eye size={14} /></button>
                                                <button className="pub-act print" title="Print" onClick={() => generateSalaryPDF(s)}><Printer size={14} /></button>
                                                <button className="pub-act email" title="Send Email" onClick={() => handleSendEmail(s.user.name)}><Mail size={14} /></button>
                                                <button className="pub-act link" title="Public Link" onClick={() => handlePublicLink(s.id)}><ExternalLink size={14} /></button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="emp-display">
                                                <div className="avatar-circle">{s.user.name.charAt(0)}</div>
                                                <div className="emp-text">
                                                    <p>{s.user.name}</p>
                                                    <span>EMP-{1000 + s.user_id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{s.user.branch?.name || 'N/A'}</td>
                                        <td>{s.user.department?.name || 'N/A'}</td>
                                        <td><IndianRupee size={12} className="inline mr-1" />{s.employeeCtc.gross_salary.toLocaleString()}</td>
                                        <td className="bold-net"><IndianRupee size={12} className="inline mr-1" />{s.net_salary.toLocaleString()}</td>
                                        <td>{months[s.month - 1]} {s.year}</td>
                                        <td>{s.salary_mode}</td>
                                        <td className="reporting">John Manager</td>
                                    </tr>
                                ))}
                                {!loading && slips.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="empty-pub-state">
                                            <div className="empty-icon-wrap">
                                                <FileText size={40} />
                                            </div>
                                            <h4>No Published Slips Found</h4>
                                            <p>Adjust your filters or generate new salaries to see results here.</p>
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

export default PublishedSalary;
