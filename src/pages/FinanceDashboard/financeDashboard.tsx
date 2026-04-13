import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { DollarSign } from "lucide-react";
import API_BASE from "../api";
import "./financedashboard.css";
import Chart from "chart.js/auto";
import PageTitle from "../../components/PageTitle";
const FinanceDashboard = () => {
  const [totalExpenses, setTotalExpenses] = useState(0);

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
    <div className="finance-page">

      <PageTitle title="Finance Dashboard" subtitle="Financial operations and analytics overview" />

      {/* FILTERS */}
      <div className="finance-filters">
        <select><option>Select Branch</option></select>
        <select><option>Select Department</option></select>
        <select><option>January</option></select>
        <select><option>2026</option></select>
        <button>Generate</button>
      </div>

      {/* TOP CARDS + DONUT */}
      <div className="finance-layout">
        <div className="finance-left">
          <div className="finance-cards">
            <div className="f-card purple">
              <h4>💰</h4>
              <h4>Salary Expenses</h4>
              <p>₹ {totalExpenses.toLocaleString("en-IN")}</p>
            </div>
            <div className="f-card orange">
              <h4>👥</h4>
              <h4>Employee Expenses</h4>
              <p>₹ 4,38,46,229</p>
            </div>
            <div className="f-card green">
              <h4>🏦</h4>
              <h4>Loan Expenses</h4>
              <p>₹ 5,30,000</p>
            </div>
            <div className="f-card red">
              <h4>📊</h4>
              <h4>Total Expenses</h4>
              <p>₹ {totalExpenses.toLocaleString("en-IN")}</p>
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
      <div className="top-stack">

        <div className="full-width-card">
          <h3>Expense Category Overview</h3>
          <span className="section-total">Total: ₹ 43,84,622</span>
          <canvas ref={categoryRef}></canvas>
        </div>

        <div className="full-width-card">
          <h3>Branch Performance Split</h3>
          <span className="section-total">Total: ₹ 43,84,622</span>
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