import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import { Search, Calendar, Download, Users } from "lucide-react";
import "./upcomingRetirements.css";
import PageTitle from "../../components/PageTitle";

function UpcomingRetirements() {
    const [retirements, setRetirements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState("");
    const [timeframe, setTimeframe] = useState("6"); // default 6 months
    const [branchId, setBranchId] = useState("");
    const [departmentId, setDepartmentId] = useState("");

    const [branches, setBranches] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    useEffect(() => {
        // Fetch filter options
        const fetchOptions = async () => {
            try {
                const [bRes, dRes] = await Promise.all([
                    axios.get(`${API_BASE}/branches`),
                    axios.get(`${API_BASE}/departments`)
                ]);
                setBranches(bRes.data);
                setDepartments(dRes.data);
            } catch (err) {
                console.error("Failed to load options", err);
            }
        };
        fetchOptions();
    }, []);

    const fetchRetirements = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/retirements`, {
                params: { timeframe, branchId, departmentId, search }
            });
            setRetirements(res.data);
        } catch (error) {
            console.error("Failed to fetch retirements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRetirements();
    }, [timeframe, branchId, departmentId, search]);

    const handleExport = () => {
        // CSV Export
        if (retirements.length === 0) return alert("No data to export.");
        const headers = ["Employee ID", "Name", "Designation", "Department", "Branch", "DOB", "Retirement Date", "Days Until Retirement"];
        const rows = retirements.map(r => [
            r.employeeId,
            `"${r.name}"`,
            `"${r.designation}"`,
            `"${r.department}"`,
            `"${r.branch}"`,
            new Date(r.dob).toLocaleDateString(),
            new Date(r.retirementDate).toLocaleDateString(),
            r.daysUntil
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Upcoming_Retirements_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="retirements-container animate-fade-in">
            <div className="page-header">
                <PageTitle 
                    title="Upcoming Retirements" 
                    subtitle="Monitor and manage employees approaching their retirement age for proactive planning" 
                />
                <div className="header-actions">
                    <button className="btn btn-success" onClick={handleExport}>
                        <Download size={18} /> Export List
                    </button>
                </div>
            </div>

            <div className="glass-card mb-6">
                <div className="form-grid">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search Name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="form-grid-3">
                        <div className="form-group">
                            <select className="form-group-select" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                                <option value="1">Within 1 Month</option>
                                <option value="3">Within 3 Months</option>
                                <option value="6">Within 6 Months</option>
                                <option value="12">Within 1 Year</option>
                                <option value="">All Time</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <select className="form-group-select" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                                <option value="">All Branches</option>
                                {branches.map(b => <option key={b.id} value={b.id}>{b.branchName}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <select className="form-group-select" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                                <option value="">All Departments</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-wrapper glass-card">
                <table className="table-modern">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role & Department</th>
                            <th>Branch</th>
                            <th>Retirement Date</th>
                            <th>Time Left</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex-col flex-center py-12">
                                        <div className="spinner mb-4"></div>
                                        <p className="text-muted">Analyzing retirement schedules...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : retirements.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="flex-col flex-center py-12 text-muted">
                                        <Users size={48} className="mb-4 opacity-20" />
                                        <h3 className="text-lg font-bold">No upcoming retirements</h3>
                                        <p>There are no employees retiring within the selected timeframe.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            retirements.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <div className="font-bold text-base">{r.name}</div>
                                        <div className="text-xs text-muted font-mono bg-gray-50 px-2 py-1 rounded inline-block mt-1">{r.employeeId}</div>
                                    </td>
                                    <td>
                                        <div className="font-semibold">{r.designation}</div>
                                        <div className="text-xs text-muted mt-1">{r.department}</div>
                                    </td>
                                    <td className="font-medium">{r.branch}</td>
                                    <td>
                                        <div className="font-bold">{new Date(r.retirementDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                        <div className="text-xs text-muted mt-1">DOB: {new Date(r.dob).toLocaleDateString()}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${r.daysUntil <= 30 ? 'failed' : r.daysUntil <= 90 ? 'pending' : 'completed'}`}>
                                            {r.daysUntil} Days Left
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button className="btn btn-secondary btn-sm">
                                            View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UpcomingRetirements;
