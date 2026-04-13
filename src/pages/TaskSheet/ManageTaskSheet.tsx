import React, { useEffect, useState } from "react";
import { ListTodo, Calendar, CheckCircle2, Circle, AlertCircle, Edit2, Trash2, Plus, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const ManageTaskSheet: React.FC = () => {
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await taskAPI.getAll();
        const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        setDailyTasks(rows.map((task: any) => ({
          id: task.id,
          name: task.title || "Untitled Task",
          mainTask: task.category?.name || "General",
          user: task.assignedTo ? `${task.assignedTo.firstName || ""} ${task.assignedTo.lastName || ""}`.trim() || "Unassigned" : "Unassigned",
          dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "--",
          status: task.status || "Pending",
        })));
      } catch {
        toast.error("Failed to load task sheet");
        setDailyTasks([]);
      }
    };

    loadTasks();
  }, []);

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><CheckSquare size={22} /> Manage Task Sheet</h1>
          <p className="page-subtitle">Manage granular sub-tasks and operational workflows</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Add Sub Task
        </button>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Sub-Task Name</th>
                <th>Main Project</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dailyTasks.map((task, idx) => (
                <tr key={task.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <ListTodo size={16} color="var(--primary)" />
                      <span style={{ fontWeight: "600" }}>{task.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", color: "var(--text-muted)" }}>
                      {task.mainTask}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "var(--primary)" }}>
                        {task.user.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <span style={{ fontSize: "13px" }}>{task.user}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
                      <Calendar size={14} />
                      {task.dueDate}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      task.status === "Completed" ? "badge-success" : 
                      task.status === "Overdue" ? "badge-danger" : 
                      task.status === "Pending" ? "badge-warning" : "badge-primary"
                    }`}>
                      {task.status === "Completed" ? <CheckCircle2 size={12} style={{ marginRight: "4px" }} /> : 
                       task.status === "Pending" ? <Circle size={12} style={{ marginRight: "4px" }} /> :
                       task.status === "Overdue" ? <AlertCircle size={12} style={{ marginRight: "4px" }} /> : null}
                      {task.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={14} /></button>
                      <button className="btn btn-secondary" style={{ padding: "6px", color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {dailyTasks.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageTaskSheet;
