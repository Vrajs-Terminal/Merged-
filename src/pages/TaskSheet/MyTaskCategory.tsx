import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Edit2, User, Tag, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

const MyTaskCategory: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const load = async () => {
    try {
      const [taskRes, categoryRes] = await Promise.all([
        taskAPI.getAll(),
        taskAPI.getCategories(),
      ]);

      const taskRows = Array.isArray(taskRes?.data) ? taskRes.data : Array.isArray(taskRes?.data?.data) ? taskRes.data.data : [];
      const categoryRows = Array.isArray(categoryRes?.data) ? categoryRes.data : Array.isArray(categoryRes?.data?.data) ? categoryRes.data.data : [];

      setTasks(taskRows);
      setCategories(categoryRows);
    } catch {
      toast.error("Failed to load task categories");
      setTasks([]);
      setCategories([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddSubCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      toast.info("Sub category name is required");
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.createCategory({
        name,
        description: categoryDescription.trim(),
        status: "Active",
      });
      toast.success("Sub category added successfully");
      setShowAddModal(false);
      setCategoryName("");
      setCategoryDescription("");
      await load();
    } catch {
      toast.error("Failed to add sub category");
    } finally {
      setSubmitting(false);
    }
  };

  const data = useMemo(() => {
    const usedCategoryIds = new Set(tasks.map((task: any) => task.categoryId).filter(Boolean));
    return categories
      .filter((category: any) => usedCategoryIds.has(category.id))
      .map((category: any, index: number) => {
        const relatedTask = tasks.find((task: any) => task.categoryId === category.id && task.assignedTo);
        const employee = relatedTask?.assignedTo
          ? `${relatedTask.assignedTo.firstName || ""} ${relatedTask.assignedTo.lastName || ""}`.trim() || "Unassigned"
          : "Unassigned";
        return {
          id: category.id || index + 1,
          employee,
          category: category.name || "Uncategorized",
        };
      });
  }, [tasks, categories]);

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> My Task Category</h1>
          <p className="page-subtitle">Employee-specific personalized task classifications</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Sub Category
        </button>
      </div>

      <div className="glass-card tasksheet-main-card">
        <div className="tasksheet-table-wrap">
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee / Self</th>
                <th>Personal Category</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className="tasksheet-name-cell">
                      <User size={16} color="var(--primary)" />
                      <strong>{item.employee}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="tasksheet-name-cell">
                      <Tag size={14} color="var(--text-muted)" />
                      <span>{item.category}</span>
                    </div>
                  </td>
                  <td>
                    <div className="tasksheet-row-actions">
                      <button className="btn btn-secondary tasksheet-icon-btn"><Edit2 size={14} /></button>
                      <button className="btn btn-secondary tasksheet-icon-btn" style={{ color: "var(--danger)" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="tasksheet-empty">No task categories found.</td>
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
              <h3 className="task-modal-title">Add Sub Category</h3>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label className="task-form-label">Sub Category Name *</label>
                <input
                  type="text"
                  className="task-form-input"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter sub category name"
                />
              </div>
              <div className="task-form-group">
                <label className="task-form-label">Description</label>
                <textarea
                  className="task-form-textarea"
                  rows={3}
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="task-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddSubCategory} disabled={submitting}>
                {submitting ? "Saving..." : "Add Sub Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTaskCategory;
