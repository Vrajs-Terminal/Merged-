import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Hexagon, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

const TaskPriority: React.FC = () => {
  const [priorities, setPriorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [priorityName, setPriorityName] = useState("");
  const [priorityLevel, setPriorityLevel] = useState("1");
  const [priorityColor, setPriorityColor] = useState("#6366f1");
  const [submitting, setSubmitting] = useState(false);

  const fetchPriorities = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getPriorities();
      const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setPriorities(rows);
    } catch (error) {
      toast.error("Failed to load priorities");
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPriority = async () => {
    const name = priorityName.trim();
    if (!name) {
      toast.info("Priority name is required");
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.createPriority({
        name,
        level: Number(priorityLevel) || 1,
        color: priorityColor,
      });
      toast.success("Priority added successfully");
      setShowAddModal(false);
      setPriorityName("");
      setPriorityLevel("1");
      setPriorityColor("#6366f1");
      fetchPriorities();
    } catch {
      toast.error("Failed to add priority");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchPriorities();
  }, []);

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Task Priority</h1>
          <p className="page-subtitle">Define task urgency levels and visual indicators</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Priority
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
                  <th>Priority Name</th>
                  <th>Priority Level</th>
                  <th>Color Indicator</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {priorities.length > 0 ? (
                  priorities.map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <div className="tasksheet-name-cell">
                          <Hexagon size={16} fill={item.color || "#ccc"} color={item.color || "#ccc"} />
                          <strong style={{ color: item.color }}>{item.name}</strong>
                        </div>
                      </td>
                      <td>Level {item.level}</td>
                      <td>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${item.color}10`, padding: "4px 12px", borderRadius: "12px", border: `1px solid ${item.color}20` }}>
                          <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: item.color }}></div>
                          <span style={{ fontSize: "12px", fontVariantNumeric: "tabular-nums", color: item.color }}>{item.color}</span>
                        </div>
                      </td>
                      <td>
                        <div className="tasksheet-row-actions">
                          <button className="btn btn-secondary tasksheet-icon-btn"><Edit2 size={14} /></button>
                          <button className="btn btn-secondary tasksheet-icon-btn" style={{ color: "var(--danger)" }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="tasksheet-empty">
                      No priorities defined. Click "Add Priority" to create one.
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
              <h3 className="task-modal-title">Add Priority</h3>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label className="task-form-label">Priority Name *</label>
                <input
                  type="text"
                  className="task-form-input"
                  value={priorityName}
                  onChange={(e) => setPriorityName(e.target.value)}
                  placeholder="Enter priority name"
                />
              </div>
              <div className="task-form-grid">
                <div className="task-form-group">
                  <label className="task-form-label">Level</label>
                  <select className="task-form-select" value={priorityLevel} onChange={(e) => setPriorityLevel(e.target.value)}>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                    <option value="5">Level 5</option>
                  </select>
                </div>
                <div className="task-form-group">
                  <label className="task-form-label">Color</label>
                  <input type="color" className="task-form-input" value={priorityColor} onChange={(e) => setPriorityColor(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="task-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddPriority} disabled={submitting}>
                {submitting ? "Saving..." : "Add Priority"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPriority;

