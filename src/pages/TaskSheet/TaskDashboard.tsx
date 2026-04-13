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
  Briefcase, 
  Tag, 
  BarChart3, 
  TrendingUp 
} from "lucide-react";
import { taskAPI } from "../../services/apiService";
import PageTitle from "../../components/PageTitle";

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
    { label: "Total Tasks", value: tasks.length, icon: LayoutDashboard, color: "var(--primary)", bg: "#eef2ff" },
    { label: "Completed Tasks", value: tasks.filter(t => t.status === "Completed").length, icon: CheckCircle2, color: "var(--success)", bg: "#ecfdf5" },
    { label: "Pending Tasks", value: tasks.filter(t => t.status === "Pending").length, icon: Clock, color: "var(--warning)", bg: "#fffbeb" },
    { label: "Overdue Tasks", value: tasks.filter(t => t.status === "Overdue" || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed")).length, icon: AlertCircle, color: "var(--danger)", bg: "#fef2f2" },
    { label: "In Progress", value: tasks.filter(t => t.status === "In Progress").length, icon: Loader2, color: "#6366f1", bg: "#f5f3ff" },
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

  if (loading) {
    return (
      <div className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>Loading task analytics...</p>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <PageTitle title="Task Dashboard" subtitle="Real-time task monitoring and productivity tracking" />
      </div>

      {/* Metrics Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {metrics.map((metric, index) => (
          <div key={index} className="glass-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              background: metric.bg, 
              padding: "12px", 
              borderRadius: "12px", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <metric.icon size={24} color={metric.color} />
            </div>
            <div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>{metric.label}</p>
              <h3 style={{ fontSize: "24px", margin: "4px 0 0 0" }}>{metric.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card" style={{ marginBottom: "32px", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <Filter size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "18px" }}>Quick Filters</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label className="input-label"><Users size={14} style={{ marginRight: "4px" }} /> Employee</label>
            <select className="select-modern">
               <option>All Employees</option>
            </select>
          </div>
          <div>
            <label className="input-label"><Calendar size={14} style={{ marginRight: "4px" }} /> Date Range</label>
            <select className="select-modern">
              <option>All Time</option>
              <option>This Month</option>
              <option>Today</option>
            </select>
          </div>
          <div>
            <label className="input-label"><Tag size={14} style={{ marginRight: "4px" }} /> Task Category</label>
            <select className="select-modern">
               <option>All Categories</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <Users size={20} color="var(--primary)" />
          <h3 style={{ fontSize: "18px" }}>Task Summary (Employee-wise)</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "12px" }}>
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
                    <div style={{ width: "100%", background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(stat.completed / stat.total) * 100}%`, background: "var(--success)", height: "100%" }}></div>
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                      {Math.round((stat.completed / stat.total) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
              {statsArray.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No task data available.</td>
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

