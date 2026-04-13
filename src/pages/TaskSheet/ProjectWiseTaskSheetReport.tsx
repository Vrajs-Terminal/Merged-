import React, { useEffect, useMemo, useState } from "react";
import { Layout, CheckCircle2, Clock, BarChart3, TrendingUp, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const ProjectWiseTaskSheetReport: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await taskAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setTasks(rows);
      } catch {
        toast.error("Failed to load project report");
        setTasks([]);
      }
    };

    load();
  }, []);

  const projects = useMemo(() => {
    const grouped: Record<string, { tasks: number; completed: number; pending: number }> = {};

    for (const task of tasks) {
      const key = task.category?.name || "General";
      if (!grouped[key]) {
        grouped[key] = { tasks: 0, completed: 0, pending: 0 };
      }
      grouped[key].tasks += 1;
      const status = String(task.status || "pending").toLowerCase();
      if (status === "completed") grouped[key].completed += 1;
      if (status === "pending" || status === "overdue" || status === "in progress") grouped[key].pending += 1;
    }

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      tasks: value.tasks,
      completed: value.completed,
      pending: value.pending,
      progress: value.tasks ? Math.round((value.completed / value.tasks) * 100) : 0,
    }));
  }, [tasks]);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header">
        <h1 className="page-title"><CheckSquare size={22} /> Project Wise Task Sheet Report</h1>
        <p className="page-subtitle">Analyze performance and progress benchmarks for major projects</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {projects.map((p, idx) => (
          <div key={idx} className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ background: "var(--primary-light)", padding: "10px", borderRadius: "10px" }}>
                <Layout size={20} color="var(--primary)" />
              </div>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "var(--primary)", borderTopColor: "var(--primary)", transform: `rotate(${p.progress * 3.6}deg)` }}>
                <span style={{ transform: `rotate(-${p.progress * 3.6}deg)` }}>{p.progress}%</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>{p.name}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>{p.tasks} Tasks Tracked</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={12} color="var(--success)" /> Completed</p>
                  <p style={{ fontWeight: "700", fontSize: "16px" }}>{p.completed}</p>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} color="var(--warning)" /> Pending</p>
                  <p style={{ fontWeight: "700", fontSize: "16px" }}>{p.pending}</p>
                </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="glass-card" style={{ padding: "20px", color: "var(--text-muted)" }}>No project task data found.</div>
        )}
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
           <BarChart3 size={20} color="var(--primary)" />
           <h3 style={{ fontSize: "18px" }}>Project Performance Comparison</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Tasks Handled</th>
                <th>Overall Progress</th>
                <th>Status</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: "700" }}>{p.name}</td>
                  <td>{p.tasks}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${p.progress}%`, height: "100%", background: p.progress > 70 ? "var(--success)" : p.progress > 30 ? "var(--primary)" : "var(--warning)" }}></div>
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: "600", width: "35px" }}>{p.progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${p.progress === 100 ? "badge-success" : p.progress > 0 ? "badge-primary" : "badge-gray"}`}>
                      {p.progress === 100 ? "Finalized" : "Ongoing"}
                    </span>
                  </td>
                  <td>
                    <TrendingUp size={16} color={p.progress > 50 ? "var(--success)" : "var(--warning)"} />
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No project report rows available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectWiseTaskSheetReport;
