import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Layout, Calendar, CheckCircle2, AlertCircle, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

const ManageMainTaskSheet: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskStatus, setTaskStatus] = useState("Pending");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAll();
      const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setTasks(rows);
    } catch (error) {
      toast.error("Failed to load main tasks");
      setTasks([]);
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
        toast.success("Task deleted");
        fetchTasks();
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const handleAddMainTask = async () => {
    const title = taskTitle.trim();
    if (!title) {
      toast.info("Task title is required");
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.create({
        title,
        description: taskDescription.trim(),
        dueDate: taskDueDate || undefined,
        status: taskStatus,
      });
      toast.success("Main task created successfully");
      setShowAddModal(false);
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate("");
      setTaskStatus("Pending");
      await fetchTasks();
    } catch {
      toast.error("Failed to create main task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Manage Main Task Sheet</h1>
          <p className="page-subtitle">Structure and manage high-level projects and task templates</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> New Main Task
        </button>
      </div>

      <div className="glass-card tasksheet-main-card">
        {loading ? (
          <div className="tasksheet-loader">
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <div className="tasksheet-table-wrap">
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
                        <div className="tasksheet-name-cell">
                          <div style={{ background: "var(--primary-light)", padding: "10px", borderRadius: "10px" }}>
                            <Layout size={18} color="var(--primary)" />
                          </div>
                          <strong>{task.title}</strong>
                        </div>
                      </td>
                      <td className="tasksheet-muted" style={{ maxWidth: "250px" }}>{task.description}</td>
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
                        <div className="tasksheet-row-actions">
                          <button className="btn btn-secondary tasksheet-icon-btn"><Edit2 size={14} /></button>
                          <button 
                            className="btn btn-secondary tasksheet-icon-btn" 
                            style={{ color: "var(--danger)" }}
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
                    <td colSpan={6} className="tasksheet-empty">
                      No tasks found. Click "New Main Task" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="task-modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h3 className="task-modal-title">Add Main Task</h3>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label className="task-form-label">Task Title *</label>
                <input
                  type="text"
                  className="task-form-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter main task title"
                />
              </div>

              <div className="task-form-group">
                <label className="task-form-label">Core Objective</label>
                <textarea
                  className="task-form-textarea"
                  rows={3}
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Describe the objective"
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
              <button className="btn btn-primary" onClick={handleAddMainTask} disabled={submitting}>
                {submitting ? "Saving..." : "Create Main Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMainTaskSheet;

