import React, { useEffect, useMemo, useState } from "react";
import { User, CheckCircle2, Clock, BarChart3, Star, TrendingUp, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const EmployeeTaskSheetReport: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await taskAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setTasks(rows);
      } catch {
        toast.error("Failed to load employee task report");
        setTasks([]);
      }
    };

    load();
  }, []);

  const employees = useMemo(() => {
    const grouped: Record<string, { tasks: number; completed: number; pending: number }> = {};

    for (const task of tasks) {
      const employee = task.assignedTo
        ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() || "Unassigned"
        : "Unassigned";
      if (!grouped[employee]) {
        grouped[employee] = { tasks: 0, completed: 0, pending: 0 };
      }
      grouped[employee].tasks += 1;
      const status = String(task.status || "pending").toLowerCase();
      if (status === "completed") grouped[employee].completed += 1;
      if (status === "pending" || status === "overdue" || status === "in progress") grouped[employee].pending += 1;
    }

    return Object.entries(grouped)
      .map(([name, value]) => ({
        name,
        tasks: value.tasks,
        completed: value.completed,
        pending: value.pending,
        efficiency: value.tasks ? Math.round((value.completed / value.tasks) * 100) : 0,
      }))
      .sort((a, b) => b.efficiency - a.efficiency);
  }, [tasks]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><CheckSquare size={22} /> Employee Task Sheet Report</h1>
        <p className="page-subtitle">Track individual employee performance and efficiency metrics</p>
      </div>

      <div className="glass-card" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Star size={20} color="var(--warning)" fill="var(--warning)" />
            <h3 style={{ fontSize: "18px" }}>Top Performers</h3>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--success)" }}></div> Exceptional</span>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}><div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--primary)" }}></div> Efficient</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {employees.slice(0, 3).map((e, idx) => (
            <div key={idx} style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px" }}>
                {e.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: "15px", marginBottom: "4px" }}>{e.name}</h4>
                <div style={{ display: "flex", gap: "10px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}><CheckCircle2 size={10} style={{ verticalAlign: "middle", marginRight: "2px" }} /> {e.completed} Complete</p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{e.efficiency}% Efficiency</p>
                </div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: e.efficiency > 90 ? "var(--success)" : "var(--primary)" }}>#{idx+1}</div>
            </div>
          ))}
          {employees.length === 0 && (
            <div style={{ color: "var(--text-muted)" }}>No employee task data found.</div>
          )}
        </div>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Total Assigned</th>
                <th>Completed Tasks</th>
                <th>Pending Tasks</th>
                <th>Performance Score</th>
                <th>Growth Trend</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <User size={16} color="var(--primary)" />
                      <span style={{ fontWeight: "600" }}>{e.name}</span>
                    </div>
                  </td>
                  <td>{e.tasks}</td>
                  <td><span className="badge badge-success">{e.completed}</span></td>
                  <td><span className="badge badge-warning">{e.pending}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${e.efficiency}%`, height: "100%", background: e.efficiency > 90 ? "var(--success)" : "var(--primary)" }}></div>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: e.efficiency > 90 ? "var(--success)" : "var(--primary)" }}>{e.efficiency}%</span>
                    </div>
                  </td>
                  <td>
                    <TrendingUp size={16} color="var(--success)" />
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No employee report rows available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskSheetReport;
