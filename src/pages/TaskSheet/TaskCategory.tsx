import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Search, Loader2, CheckSquare } from "lucide-react";
import { taskAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./TaskSheet.css";

const TaskCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getCategories();
      const rows = Array.isArray(response?.data) ? response.data : Array.isArray(response?.data?.data) ? response.data.data : [];
      setCategories(rows);
    } catch (error) {
      toast.error("Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      toast.info("Category name is required");
      return;
    }

    try {
      setSubmitting(true);
      await taskAPI.createCategory({
        name,
        description: newCategoryDescription.trim(),
        status: "Active",
      });
      toast.success("Category added successfully");
      setShowAddModal(false);
      setNewCategoryName("");
      setNewCategoryDescription("");
      fetchCategories();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="main-content animate-fade-in tasksheet-page-container">
      <div className="tasksheet-header">
        <div className="tasksheet-header-text">
          <h1 className="page-title"><CheckSquare size={22} /> Task Category</h1>
          <p className="page-subtitle">Organize your tasks into logical categories</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      <div className="glass-card tasksheet-main-card">
        <div className="tasksheet-toolbar">
          <div className="tasksheet-search-wrap">
            <Search size={18} className="tasksheet-search-icon" />
            <input 
              type="text" 
              className="input-modern" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tasksheet-actions">
            <button className="btn btn-secondary shadow-sm">Export</button>
            <button className="btn btn-danger shadow-sm"><Trash2 size={16} /> Delete Selected</button>
          </div>
        </div>

        <div className="tasksheet-table-wrap">
          {loading ? (
            <div className="tasksheet-loader">
              <Loader2 className="animate-spin" size={32} color="var(--primary)" />
            </div>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th><input type="checkbox" /></th>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, idx) => (
                    <tr key={cat.id}>
                      <td><input type="checkbox" /></td>
                      <td>{idx + 1}</td>
                      <td><strong>{cat.name}</strong></td>
                      <td className="tasksheet-muted">{cat.description}</td>
                      <td>
                        <span className={`badge ${cat.status === "Active" ? "badge-success" : "badge-gray"}`}>
                          {cat.status}
                        </span>
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
                    <td colSpan={6} className="tasksheet-empty">
                      No categories found. Click "Add Category" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="task-modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-modal-header">
              <h3 className="task-modal-title">Add Category</h3>
            </div>
            <div className="task-modal-body">
              <div className="task-form-group">
                <label className="task-form-label">Category Name *</label>
                <input
                  type="text"
                  className="task-form-input"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </div>
              <div className="task-form-group">
                <label className="task-form-label">Description</label>
                <textarea
                  className="task-form-textarea"
                  rows={3}
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <div className="task-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddCategory} disabled={submitting}>
                {submitting ? "Saving..." : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCategory;

