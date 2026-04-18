import React, { useEffect, useState } from "react";
import { ListTodo, Calendar, CheckCircle2, Circle, AlertCircle, Edit2, Trash2, Plus, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

const ManageTaskSheet: React.FC = () => {
  const [dailyTasks, setDailyTasks] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [taskObjective, setTaskObjective] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");

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

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddSubTask = async () => {
    const title = taskName.trim();
    if (!title) {
      toast.info("Sub task name is required");
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.create({
        title,
        description: taskObjective.trim(),
        dueDate: taskDueDate || undefined,
        status: taskStatus,
      });
      toast.success("Sub task created successfully");
      setShowAddModal(false);
      setTaskName("");
      setTaskObjective("");
      setTaskDueDate("");
      setTaskStatus("Pending");
      await loadTasks();
    } catch {
      toast.error("Failed to create sub task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Manage Task Sheet</h1>
          <p className="page-subtitle">Manage granular sub-tasks and operational workflows</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Sub Task
        </button>
      </div>

      <div className="glass-card tasksheet-main-card">
        <div className="tasksheet-table-wrap">
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
                    <div className="tasksheet-name-cell">
                      <ListTodo size={16} color="var(--primary)" />
                      <strong>{task.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="tasksheet-chip">
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
                    <div className="tasksheet-row-actions">
                      <button className="btn btn-secondary tasksheet-icon-btn"><Edit2 size={14} /></button>
                      <button className="btn btn-secondary tasksheet-icon-btn" style={{ color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {dailyTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="tasksheet-empty">No tasks found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="task-modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h3 className="task-modal-title">Add Sub Task</h3>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label className="task-form-label">Sub-Task Name *</label>
                <input
                  type="text"
                  className="task-form-input"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Enter sub-task name"
                />
              </div>

              <div className="task-form-group">
                <label className="task-form-label">Objective / Notes</label>
                <textarea
                  className="task-form-textarea"
                  rows={3}
                  value={taskObjective}
                  onChange={(e) => setTaskObjective(e.target.value)}
                  placeholder="Describe this sub-task"
                />
              </div>

              <div className="task-form-grid">
                <div className="task-form-group">
                  <label className="task-form-label">Due Date</label>
                  <input
                    type="date"
                    className="task-form-input"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
                <div className="task-form-group">
                  <label className="task-form-label">Status</label>
                  <select className="task-form-select" value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="task-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSubTask} disabled={submitting}>
                {submitting ? "Saving..." : "Create Sub Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTaskSheet;
