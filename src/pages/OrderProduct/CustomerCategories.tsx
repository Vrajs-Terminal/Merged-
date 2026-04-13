import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, CheckCircle, AlertCircle, Search, Tags } from "lucide-react";
import { customerCategoryAPI } from "../../services/apiService";

interface CustomerCategory {
  id: number;
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

export default function CustomerCategories() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await customerCategoryAPI.getAll(currentPage, itemsPerPage);
      setCategories(response.data || []);
      setLoading(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to fetch categories" });
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      setMsg({ type: "error", text: "Category name is required" });
      return;
    }

    try {
      if (editingId) {
        await customerCategoryAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Category updated successfully" });
      } else {
        await customerCategoryAPI.create(formData);
        setMsg({ type: "success", text: "Category added successfully" });
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: "", description: "" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save category" });
    }
  };

  const handleEdit = (cat: CustomerCategory) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, description: cat.description || "" });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await customerCategoryAPI.delete(id);
      fetchData();
      setMsg({ type: "success", text: "Category deleted successfully" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete category" });
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Tags size={22} /> Customer Categories</h2>
          <p className="lm-page-subtitle">Group retailers into different customer categories</p>
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
          <Plus size={16} /> Add
        </button>
        <button style={{ padding: "0.75rem 1.5rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div className="lm-field" style={{ flex: 1 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input type="text" className="lm-input" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Category</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
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
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"} Category</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", description: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Categories ({categories.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Category</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Description</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{cat.description || "—"}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(cat)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(cat.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                    <button style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#4f46e5" }}>
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === 1 ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === 1 ? "default" : "pointer" }}>Prev</button>
          {Array.from({ length: Math.ceil(categories.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(categories.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(categories.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(categories.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
