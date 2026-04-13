import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE from "../api";
import "./payrollDashboard.css";
import { Plus, FileText, CheckCircle2, IndianRupee, TrendingUp } from "lucide-react";

function PayrollDashboard() {
    const [runs, setRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        fetchRuns();
    }, []);

    const fetchRuns = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/payroll/runs`);
            setRuns(res.data.runs);
        } catch (error) {
            console.error("Failed to fetch payroll runs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedMonth) {
            alert("Please select a month to generate payroll.");
            return;
        }

        try {
            setGenerating(true);
            await axios.post(`${API_BASE}/payroll/generate`, {
                month: selectedMonth,
                year: selectedYear
            });
            alert(`Payroll for ${selectedMonth} ${selectedYear} generated successfully.`);
            fetchRuns();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to generate payroll.");
        } finally {
            setGenerating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this payroll run? All associated payslips will be deleted.")) return;

        try {
            await axios.delete(`${API_BASE}/payroll/runs/${id}`);
            fetchRuns();
        } catch (error) {
            alert("Failed to delete payroll run.");
        }
    };

    const viewPayslips = async (id: number, month: string) => {
        try {
            const res = await axios.get(`${API_BASE}/payroll/runs/${id}/payslips`);
            const slips = res.data.payslips;
            generatePDFs(slips, month);
        } catch (e) {
            alert("Failed to load payslips.");
        }
    };

    const generatePDFs = (slips: any[], month: string) => {
        // Dynamic import to prevent main bundle bloating
        import('jspdf').then(jsPDFModule => {
            import('jspdf-autotable').then(() => {
                const jsPDF = jsPDFModule.default;

                slips.forEach((slip) => {
                    const doc = new jsPDF();

                    // Header
                    doc.setFontSize(22);
                    doc.setTextColor(15, 23, 42); // slate-900
                    doc.text("HRMS Inc.", 14, 20);

                    doc.setFontSize(14);
                    doc.setTextColor(100, 116, 139); // slate-500
                    doc.text(`Payslip for ${month}`, 14, 30);

                    // Employee Info
                    doc.setFontSize(12);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Employee Name: ${slip.employee.firstName} ${slip.employee.lastName}`, 14, 45);
                    doc.text(`Employee ID: ${slip.employee.employeeId}`, 14, 52);
                    doc.text(`Department: ${slip.employee.department}`, 14, 59);

                    // Earnings & Deductions Tables side-by-side simulation
                    (doc as any).autoTable({
                        startY: 70,
                        head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
                        body: [
                            ['Basic Salary', slip.basic.toFixed(2), 'Provident Fund', slip.pfDeduction.toFixed(2)],
                            ['House Rent Allowance', slip.hra.toFixed(2), 'Tax Deducted', slip.taxDeduction.toFixed(2)],
                            ['Special Allowance', slip.allowances.toFixed(2), 'Other Deductions', slip.otherDeductions?.toFixed(2) || '0.00'],
                            ['', '', '', ''],
                            [{ content: 'Gross Earnings', styles: { fontStyle: 'bold' } }, { content: slip.grossSalary.toFixed(2), styles: { fontStyle: 'bold' } },
                            { content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: slip.totalDeductions.toFixed(2), styles: { fontStyle: 'bold' } }]
                        ],
                        theme: 'grid',
                        headStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42] }
                    });

                    // Net Pay
                    const finalY = (doc as any).lastAutoTable.finalY + 15;
                    doc.setFontSize(14);
                    doc.setFont("helvetica", "bold");
                    doc.text(`Net Salary Payable: INR ${slip.netSalary.toFixed(2)}`, 14, finalY);

                    // Save file
                    doc.save(`Payslip_${month}_${slip.employee.firstName}_${slip.employee.lastName}.pdf`);
                });
            });
        });
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="payroll-container fade-in">
            <div className="payroll-header">
                <div>
                    <h2 className="page-title"><TrendingUp size={22} /> Payroll Processing</h2>
                    <p className="page-subtitle">Manage automated salary calculations and payslip generation</p>
                </div>

                <div className="generate-actions">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="month-dropdown"
                    >
                        <option value="">Select Month</option>
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="year-input"
                    />

                    <button
                        className="btn-primary"
                        onClick={handleGenerate}
                        disabled={generating}
                    >
                        {generating ? "Generating..." : <><Plus size={16} /> Run Payroll</>}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading payroll history...</div>
            ) : runs.length === 0 ? (
                <div className="empty-state">No payroll runs found. Generate your first payroll batch above.</div>
            ) : (
                <div className="payroll-grid">
                    {runs.map((run) => (
                        <div key={run.id} className="payroll-card">
                            <div className="card-header">
                                <div className="run-title">
                                    <h3 style={{ margin: 0 }}>{run.month} {run.year}</h3>
                                    <span className={`status-badge ${run.status.toLowerCase()}`}>
                                        {run.status}
                                    </span>
                                </div>
                                <div className="run-summary">
                                    <div className="stat-column">
                                        <span className="stat-label">Employees Proc.</span>
                                        <span className="stat-value">{run.totalEmployees}</span>
                                    </div>
                                    <div className="stat-column right-align">
                                        <span className="stat-label">Total Payout</span>
                                        <span className="stat-value net-cost">
                                            <IndianRupee size={14} style={{ display: 'inline', marginTop: '-2px' }} />
                                            {run.totalCost.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="card-actions">
                                <button className="btn-secondary auto-width" onClick={() => viewPayslips(run.id, run.month)}>
                                    <FileText size={16} /> View Slips
                                </button>
                                <button className="btn-danger-outline" onClick={() => handleDelete(run.id)}>
                                    Delete Draft
                                </button>
                                {run.status === "Draft" && (
                                    <button className="btn-success auto-width">
                                        <CheckCircle2 size={16} /> Finalize
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PayrollDashboard;
