import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, Tags } from "lucide-react";
import { productCategoryAPI } from "../../services/apiService";

interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

export default function ProductCategory() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCategories = async (page = 1) => {
    try {
      setLoading(true);
      const response = await productCategoryAPI.getAll(page, 25);
      if (response.data.success) {
        setCategories(response.data.data);
        setTotalPages(response.data.pagination.pages);
        setCurrentPage(page);
      }
    } catch (error) {
      setMsg({ type: "error", text: "Failed to fetch categories" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Category Name is required" });
      return;
    }

    try {
      if (editingId) {
        const response = await productCategoryAPI.update(editingId, formData);
        if (response.data.success) {
          setMsg({ type: "success", text: "Category updated successfully" });
        }
      } else {
        const response = await productCategoryAPI.create(formData);
        if (response.data.success) {
          setMsg({ type: "success", text: "Category added successfully" });
        }
      }
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCategories(currentPage);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save category" });
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setFormData({ name: category.name, description: category.description || "" });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const response = await productCategoryAPI.toggleStatus(id);
      if (response.data.success) {
        setMsg({ type: "success", text: "Category status updated successfully" });
        fetchCategories(currentPage);
      }
    } catch (error) {
      setMsg({ type: "error", text: "Failed to update category status" });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await productCategoryAPI.delete(id);
      if (response.data.success) {
        setMsg({ type: "success", text: "Category deleted successfully" });
        fetchCategories(currentPage);
      }
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete category" });
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Tags size={22} /> Product Categories</h2>
          <p className="lm-page-subtitle">Create and manage product categories</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add Category
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit Category" : "Add New Category"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Category Name</label>
              <input type="text" className="lm-input" placeholder="Enter category name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Description</label>
              <textarea className="lm-input" placeholder="Enter description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: "80px" }}></textarea>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAddCategory} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>
              {editingId ? "Update Category" : "Add Category"}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", description: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Categories ({categories.length} total)</div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading...</div>
        ) : (
          <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
            <table className="lm-table">
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Category Name</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Description</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                    <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{idx + 1}</td>
                    <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{cat.name}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{cat.description || "-"}</td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      <span style={{ padding: "0.25rem 0.75rem", borderRadius: "0.25rem", backgroundColor: cat.status === "Active" ? "#dcfce7" : "#fee2e2", color: cat.status === "Active" ? "#166534" : "#991b1b", fontWeight: 600, fontSize: "0.75rem" }}>
                        {cat.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleEdit(cat)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                        <Trash2 size={12} /> Del
                      </button>
                      <button onClick={() => handleToggleStatus(cat.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: cat.status === "Active" ? "#fecaca" : "#d1d5db", border: "1px solid #cbd5e1", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 500, color: "#475569" }}>
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => fetchCategories(i + 1)}
                style={{
                  padding: "0.4rem 0.8rem",
                  backgroundColor: currentPage === i + 1 ? "#6366f1" : "#e2e8f0",
                  color: currentPage === i + 1 ? "white" : "#475569",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
