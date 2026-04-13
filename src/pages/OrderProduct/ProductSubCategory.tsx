import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Tag } from "lucide-react";
import { productSubCategoryAPI } from "../../services/apiService";

interface ProductSubCategory {
  id: number;
  categoryId?: number;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

export default function ProductSubCategory() {
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ categoryId: "", name: "", description: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await productSubCategoryAPI.getAll(1, itemsPerPage);
      setSubCategories(response.data.data || []);
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load sub categories" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Sub Category Name is required" });
      return;
    }
    try {
      const payload = {
        name: formData.name,
        description: formData.description
      };
      if (editingId) {
        await productSubCategoryAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Sub category updated successfully" });
        setEditingId(null);
      } else {
        await productSubCategoryAPI.create(payload);
        setMsg({ type: "success", text: "Sub category added successfully" });
      }
      fetchData();
      setFormData({ categoryId: "", name: "", description: "" });
      setShowForm(false);
    } catch (error) {
      setMsg({ type: "error", text: editingId ? "Failed to update sub category" : "Failed to add sub category" });
      console.error(error);
    }
  };

  const handleEdit = (sub: ProductSubCategory) => {
    setEditingId(sub.id);
    setFormData({
      categoryId: sub.categoryId?.toString() || "",
      name: sub.name,
      description: sub.description || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await productSubCategoryAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Status updated successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to update status" });
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productSubCategoryAPI.delete(id);
      setMsg({ type: "success", text: "Sub category deleted successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete sub category" });
      console.error(error);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Tag size={22} /> Product Sub Categories</h2>
          <p className="lm-page-subtitle">Manage product sub categories linked to main categories</p>
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
          <Plus size={16} /> Add Sub Category
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Sub Category</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Sub Category Name</label>
              <input type="text" className="lm-input" placeholder="Enter sub category name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Description</label>
              <input type="text" className="lm-input" placeholder="Enter description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ categoryId: "", name: "", description: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Sub Categories ({subCategories.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Sub Category</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Description</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subCategories.map((sub, idx) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{sub.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{sub.description || "—"}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <button onClick={() => handleToggleStatus(sub.id)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}>
                      {sub.status === "Active" ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      <span style={{ color: sub.status === "Active" ? "#166534" : "#64748b", fontWeight: 600 }}>{sub.status}</span>
                    </button>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(sub)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(sub.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
