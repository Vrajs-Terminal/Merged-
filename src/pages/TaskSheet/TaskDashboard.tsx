import React, { useEffect, useState } from "react";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Filter, 
  Calendar, 
  Users, 
  Tag, 
  Sparkles 
} from "lucide-react";
import { taskAPI } from "../../services/apiService";
import PageTitle from "../../components/PageTitle";
import "./TaskSheet.css";

const TaskDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const metrics = [
    { label: "Total Tasks", value: tasks.length, icon: LayoutDashboard, color: "var(--color-primary-700)", bg: "#eef2ff", tone: "primary" },
    { label: "Completed Tasks", value: tasks.filter(t => t.status === "Completed").length, icon: CheckCircle2, color: "var(--color-success-700)", bg: "#ecfdf5", tone: "success" },
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "Pending").length, icon: Clock, color: "var(--color-warning-700)", bg: "#fffbeb", tone: "warning" },
    { label: "Overdue Tasks", value: tasks.filter(t => t.status === "Overdue" || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed")).length, icon: AlertCircle, color: "var(--color-danger-700)", bg: "#fef2f2", tone: "danger" },
    { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: Loader2, color: "var(--color-primary-700)", bg: "#f5f3ff", tone: "indigo" },
  ];

  // Group by employee for the summary table
  const employeeStats = tasks.reduce((acc: any, task) => {
    const empName = task.assignedTo ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}` : "Unassigned";
    if (!acc[empName]) {
      acc[empName] = { name: empName, total: 0, completed: 0, pending: 0 };
    }
    acc[empName].total += 1;
    if (task.status === "Completed") acc[empName].completed += 1;
    else acc[empName].pending += 1;
    return acc;
  }, {});

  const statsArray = Object.values(employeeStats);
  const avgEfficiency = statsArray.length
    ? Math.round(
        statsArray.reduce((acc: number, stat: any) => {
          return acc + (stat.total ? (stat.completed / stat.total) * 100 : 0);
        }, 0) / statsArray.length,
      )
    : 0;

  if (loading) {
    return (
      <div className="main-content tasksheet-page-container" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>Loading task analytics...</p>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <PageTitle title="Task Dashboard" subtitle="Real-time task monitoring and productivity tracking" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="taskdash-kpi-grid">
        {metrics.map((metric, index) => (
          <div key={index} className={`taskdash-kpi-card is-${metric.tone}`}>
            <div className="taskdash-kpi-head">
              <div
                className="taskdash-kpi-icon"
                style={{
                  background: metric.bg,
                  color: metric.color,
                }}
              >
                <metric.icon size={18} />
              </div>
              <span className="taskdash-kpi-tag">Live</span>
            </div>
            <div className="taskdash-kpi-copy">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card tasksheet-main-card taskdash-filter-card">
        <div className="taskdash-section-head">
          <div className="taskdash-section-title">
            <Filter size={18} />
            <h3>Quick Filters</h3>
          </div>
          <span className="taskdash-section-note">Narrow down task performance instantly</span>
        </div>
        <div className="taskdash-filter-grid">
          <div className="taskdash-filter-item">
            <label className="taskdash-field-label"><Users size={14} /> Employee</label>
            <select className="select-modern">
               <option>All Employees</option>
            </select>
          </div>
          <div className="taskdash-filter-item">
            <label className="taskdash-field-label"><Calendar size={14} /> Date Range</label>
            <select className="select-modern">
              <option>All Time</option>
              <option>This Month</option>
              <option>Today</option>
            </select>
          </div>
          <div className="taskdash-filter-item">
            <label className="taskdash-field-label"><Tag size={14} /> Task Category</label>
            <select className="select-modern">
               <option>All Categories</option>
            </select>
          </div>
          <button className="btn btn-primary taskdash-filter-cta" type="button">
            <Sparkles size={16} /> Apply Filters
          </button>
        </div>
      </div>

      <div className="glass-card tasksheet-main-card taskdash-summary-card">
        <div className="taskdash-section-head is-summary">
          <div className="taskdash-section-title">
            <Users size={18} />
            <h3>Task Summary (Employee-wise)</h3>
          </div>
          <div className="taskdash-summary-meta">
            <span>{statsArray.length} Employees</span>
            <span>{avgEfficiency}% Avg Efficiency</span>
          </div>
        </div>
        <div className="tasksheet-table-wrap">
          <table className="table-modern taskdash-summary-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {statsArray.map((stat: any, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="tasksheet-name-cell">
                      <div className="taskdash-avatar">
                        {stat.name.split(' ').map((n:any)=>n[0]).join('')}
                      </div>
                      <span>{stat.name}</span>
                    </div>
                  </td>
                  <td>{stat.total}</td>
                  <td>
                    <span className="badge badge-success">{stat.completed}</span>
                  </td>
                  <td>
                    <span className="badge badge-warning">{stat.pending}</span>
                  </td>
                  <td>
                    <div className="tasksheet-progress">
                      <span style={{ width: `${stat.total ? (stat.completed / stat.total) * 100 : 0}%` }}></span>
                    </div>
                    <span className="tasksheet-muted" style={{ marginTop: "4px", display: "block" }}>
                      {Math.round(stat.total ? (stat.completed / stat.total) * 100 : 0)}%
                    </span>
                  </td>
                </tr>
              ))}
              {statsArray.length === 0 && (
                <tr>
                  <td colSpan={5} className="tasksheet-empty">No task data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;

