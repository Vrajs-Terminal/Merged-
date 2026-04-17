import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { CalendarDays, Building2, Layers3, Sparkles, IndianRupee, Users, Landmark, ChartPie, RotateCcw, Activity, BarChart3 } from "lucide-react";
import API_BASE from "../api";
import "./financedashboard.css";
import Chart from "chart.js/auto";
import PageTitle from "../../components/PageTitle";

const FinanceDashboard = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [branch, setBranch] = useState("all");
  const [department, setDepartment] = useState("all");
  const [month, setMonth] = useState("January");
  const [year, setYear] = useState("2026");

  const financeChartRef = useRef<HTMLCanvasElement | null>(null);
  const yearlyRef = useRef<HTMLCanvasElement | null>(null);
  const categoryRef = useRef<HTMLCanvasElement | null>(null);
  const branchRef = useRef<HTMLCanvasElement | null>(null);
  const loanExpenseRef = useRef<HTMLCanvasElement | null>(null);
  const loanReturnRef = useRef<HTMLCanvasElement | null>(null);
  const advanceReturnRef = useRef<HTMLCanvasElement | null>(null);
  const advanceDeptRef = useRef<HTMLCanvasElement | null>(null);
  const advanceReturnDeptRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    axios.get(`${API_BASE}/finance`).then(res => {
      const total = res.data.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      setTotalExpenses(total);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const charts: Chart[] = [];

    // Branch Wise (Top Right)
    if (financeChartRef.current) {
      charts.push(new Chart(financeChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Ahmedabad", "Jaipur"],
          datasets: [{
            data: [94.5, 5.5],
            backgroundColor: ["#3b82f6", "#10b981"],
            borderWidth: 0
          }]
        },
        options: {
          cutout: "75%",
          plugins: { legend: { position: "top" } }
        }
      }));
    }

    // Yearly Salary
    if (yearlyRef.current) {
      charts.push(new Chart(yearlyRef.current, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [{
            data: [54998, 42000, 38000, 47000, 51000, 46000, 48000, 52000, 50000, 53000, 49000, 60000],
            backgroundColor: "#3b82f6",
            borderRadius: 6
          }]
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { lineWidth: 0.5 } },
            y: { beginAtZero: true, grid: { lineWidth: 0.5 } }
          }
        }
      }));
    }

    if (categoryRef.current) {
      charts.push(new Chart(categoryRef.current, {
        type: "doughnut",
        data: {
          labels: ["Client Meetings", "Travel", "Supplies"],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: ["#3b82f6", "#ef4444", "#10b981"],
            borderWidth: 0
          }]
        },
        options: { cutout: "70%" }
      }));
    }

    if (branchRef.current) {
      charts.push(new Chart(branchRef.current, {
        type: "doughnut",
        data: {
          labels: ["Ahmedabad", "Jaipur", "Surat"],
          datasets: [{
            data: [70, 20, 10],
            backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
            borderWidth: 0
          }]
        },
        options: { cutout: "70%" }
      }));
    }

    if (loanExpenseRef.current) {
      charts.push(new Chart(loanExpenseRef.current, {
        type: "doughnut",
        data: {
          labels: ["15 Dec 2025", "Hyderabad", "Training"],
          datasets: [{
            data: [57.5, 18.9, 23.6],
            backgroundColor: ["#3b82f6", "#10b981", "#f59e0b"],
            borderWidth: 0
          }]
        },
        options: { cutout: "65%" }
      }));
    }

    if (loanReturnRef.current) {
      charts.push(new Chart(loanReturnRef.current, {
        type: "pie",
        data: {
          labels: ["Completed", "Pending"],
          datasets: [{
            data: [93.6, 6.4],
            backgroundColor: ["#3b82f6", "#10b981"],
            borderWidth: 0
          }]
        }
      }));
    }

    if (advanceReturnRef.current) {
      charts.push(new Chart(advanceReturnRef.current, {
        type: "doughnut",
        data: {
          labels: ["Returned", "Remaining"],
          datasets: [{
            data: [100, 0],
            backgroundColor: ["#3b82f6", "#e0e0e0"],
            borderWidth: 0
          }]
        },
        options: { cutout: "75%" }
      }));
    }

    if (advanceDeptRef.current) {
      charts.push(new Chart(advanceDeptRef.current, {
        type: "bar",
        data: {
          labels: ["HR", "Sales", "Support", "Admin"],
          datasets: [{
            data: [33000, 22000, 18000, 15000],
            backgroundColor: "#3b82f6",
            borderRadius: 6
          }]
        },
        options: { plugins: { legend: { display: false } } }
      }));
    }

    if (advanceReturnDeptRef.current) {
      charts.push(new Chart(advanceReturnDeptRef.current, {
        type: "bar",
        data: {
          labels: ["HR", "Sales", "Support", "Admin"],
          datasets: [{
            data: [12000, 9000, 6000, 3000],
            backgroundColor: "#ef4444",
            borderRadius: 6
          }]
        },
        options: { indexAxis: "y", plugins: { legend: { display: false } } }
      }));
    }

    return () => charts.forEach(c => c.destroy());
  }, []);

  return (
    <div className="main-content animate-fade-in finance-page">

      <PageTitle title="Finance Dashboard" subtitle="Financial operations and analytics overview" />

      {/* FILTERS */}
      <div className="finance-filters">
        <div className="finance-filter-field">
          <label>Branch</label>
          <div className="finance-select-wrap">
            <Building2 size={15} />
            <select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="all">All Branches</option>
              <option value="ahmedabad">Ahmedabad</option>
              <option value="jaipur">Jaipur</option>
              <option value="surat">Surat</option>
            </select>
          </div>
        </div>

        <div className="finance-filter-field">
          <label>Department</label>
          <div className="finance-select-wrap">
            <Layers3 size={15} />
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="all">All Departments</option>
              <option value="hr">HR</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="finance-filter-field">
          <label>Month</label>
          <div className="finance-select-wrap">
            <CalendarDays size={15} />
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="finance-filter-field">
          <label>Year</label>
          <div className="finance-select-wrap">
            <Sparkles size={15} />
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {["2024", "2025", "2026", "2027"].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="finance-filter-actions">
          <button className="btn btn-secondary finance-btn-secondary" type="button" onClick={() => {
            setBranch("all");
            setDepartment("all");
            setMonth("January");
            setYear("2026");
          }}>
            <RotateCcw size={15} /> Reset
          </button>
          <button className="btn btn-primary finance-btn-primary" type="button">Generate</button>
        </div>
      </div>

      <div className="finance-overview-strip">
        <div className="finance-overview-pill">
          <span>Branch Scope</span>
          <strong>{branch === "all" ? "All Branches" : branch}</strong>
        </div>
        <div className="finance-overview-pill">
          <span>Department Scope</span>
          <strong>{department === "all" ? "All Departments" : department}</strong>
        </div>
        <div className="finance-overview-pill">
          <span>Period</span>
          <strong>{month} {year}</strong>
        </div>
        <div className="finance-overview-pill is-highlight">
          <Activity size={14} />
          <strong>Live Financial Snapshot</strong>
        </div>
      </div>

      <div className="finance-section-heading">
        <h2><BarChart3 size={18} /> Core Analytics</h2>
        <p>Track expenses, distributions, and yearly momentum in one place.</p>
      </div>

      {/* TOP CARDS + DONUT */}
      <div className="finance-layout">
        <div className="finance-left">
          <div className="finance-cards">
            <div className="f-card purple">
              <span className="f-card-icon"><IndianRupee size={16} /></span>
              <h4>Salary Expenses</h4>
              <p>₹ {totalExpenses.toLocaleString("en-IN")}</p>
              <small className="f-card-note">Auto aggregated from finance ledger</small>
            </div>
            <div className="f-card orange">
              <span className="f-card-icon"><Users size={16} /></span>
              <h4>Employee Expenses</h4>
              <p>₹ 4,38,46,229</p>
              <small className="f-card-note">Cross-branch payroll and allowances</small>
            </div>
            <div className="f-card green">
              <span className="f-card-icon"><Landmark size={16} /></span>
              <h4>Loan Expenses</h4>
              <p>₹ 5,30,000</p>
              <small className="f-card-note">Issued employee loans and support funds</small>
            </div>
            <div className="f-card red">
              <span className="f-card-icon"><ChartPie size={16} /></span>
              <h4>Total Expenses</h4>
              <p>₹ {totalExpenses.toLocaleString("en-IN")}</p>
              <small className="f-card-note">Consolidated operational outflow</small>
            </div>
          </div>
        </div>

        <div className="finance-right">
          <div className="finance-chart-box">
            <h3>Branch Wise Distribution</h3>
            <canvas ref={financeChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* YEARLY */}
      <div className="yearly-section">
        <div className="yearly-header">
          <h3>Yearly Salary Overview (2026)</h3>
          <span className="yearly-total">Total: ₹ {totalExpenses.toLocaleString("en-IN")}</span>
        </div>
        <div className="yearly-chart-box">
          <canvas ref={yearlyRef}></canvas>
        </div>
      </div>

      {/* FULL WIDTH STACK */}
      <div className="finance-section-heading">
        <h2><ChartPie size={18} /> Deep Insights</h2>
        <p>Analyze category concentration and branch-wise spend impact.</p>
      </div>

      <div className="top-stack">

        <div className="full-width-card">
          <div className="section-header">
            <h3>Expense Category Overview</h3>
            <span className="section-total">Total: ₹ 43,84,622</span>
          </div>
          <canvas ref={categoryRef}></canvas>
        </div>

        <div className="full-width-card">
          <div className="section-header">
            <h3>Branch Performance Split</h3>
            <span className="section-total">Total: ₹ 43,84,622</span>
          </div>
          <canvas ref={branchRef}></canvas>
        </div>

      </div>

      {/* 3 IN ONE ROW */}
      <div className="three-row">
        <div className="analytics-card">
          <h3>Loan Expense Distribution</h3>
          <canvas ref={loanExpenseRef}></canvas>
        </div>

        <div className="analytics-card">
          <h3>Loan Return</h3>
          <canvas ref={loanReturnRef}></canvas>
        </div>

        <div className="analytics-card">
          <h3>Advance Return</h3>
          <canvas ref={advanceReturnRef}></canvas>
        </div>
      </div>

      {/* LAST 2 SIDE BY SIDE */}
      <div className="two-grid">
        <div className="analytics-card">
          <h3>Advance Salary – Department</h3>
          <canvas ref={advanceDeptRef}></canvas>
        </div>
        <div className="analytics-card">
          <h3>Advance Return – Department</h3>
          <canvas ref={advanceReturnDeptRef}></canvas>
        </div>
      </div>

    </div>
  );
};

export default FinanceDashboard;