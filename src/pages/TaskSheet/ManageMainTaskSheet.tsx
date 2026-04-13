import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Layout, Calendar, CheckCircle2, AlertCircle, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";

const ManageMainTaskSheet: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskAPI.delete(id);
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Manage Main Task Sheet</h1>
          <p className="page-subtitle">Structure and manage high-level projects and task templates</p>
        </div>
        <button className="btn btn-primary shadow-glow">
          <Plus size={18} /> New Main Task
        </button>
      </div>

      <div className="glass-card">
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Main Task (Project) Name</th>
                  <th>Core Objective</th>
                  <th>Created Date</th>
                  <th>Current Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length > 0 ? (
                  tasks.map((task, idx) => (
                    <tr key={task.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ background: "var(--primary-light)", padding: "10px", borderRadius: "10px" }}>
                            <Layout size={18} color="var(--primary)" />
                          </div>
                          <span style={{ fontWeight: "700", color: "var(--text-main)" }}>{task.title}</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "13px", maxWidth: "250px" }}>{task.description}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)" }}>
                          <Calendar size={14} />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          task.status === "Completed" ? "badge-success" : 
                          task.status === "Overdue" ? "badge-danger" : "badge-primary"
                        }`} style={{ display: "flex", width: "fit-content", gap: "6px" }}>
                          {task.status === "Completed" ? <CheckCircle2 size={12} /> : 
                           task.status === "Overdue" ? <AlertCircle size={12} /> : null}
                          {task.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: "6px", color: "var(--danger)" }}
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      No tasks found. Click "New Main Task" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMainTaskSheet;

