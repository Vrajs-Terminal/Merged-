import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, CheckCircle, AlertCircle, Package } from "lucide-react";
import { productAPI } from "../../services/apiService";

interface Product {
  id: number;
  name: string;
  categoryId?: number;
  subCategoryId?: number;
  hsnCode?: string;
  description?: string;
}

export default function ManageProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const currentPage = 1;
  const itemsPerPage = 25;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", categoryId: "", subCategoryId: "", hsnCode: "", description: "" });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll(currentPage, itemsPerPage);
      setProducts(response.data.data || []);
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load products" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Product Name is required" });
      return;
    }
    try {
      const payload = {
        name: formData.name,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : undefined,
        hsnCode: formData.hsnCode,
        description: formData.description
      };
      if (editingId) {
        await productAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Product updated successfully" });
        setEditingId(null);
      } else {
        await productAPI.create(payload);
        setMsg({ type: "success", text: "Product added successfully" });
      }
      fetchData();
      setFormData({ name: "", categoryId: "", subCategoryId: "", hsnCode: "", description: "" });
      setShowForm(false);
    } catch (error) {
      setMsg({ type: "error", text: editingId ? "Failed to update product" : "Failed to add product" });
      console.error(error);
    }
  };

  const handleEdit = (prod: Product) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name,
      categoryId: prod.categoryId?.toString() || "",
      subCategoryId: prod.subCategoryId?.toString() || "",
      hsnCode: prod.hsnCode || "",
      description: prod.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await productAPI.delete(id);
      setMsg({ type: "success", text: "Product deleted successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete product" });
      console.error(error);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Package size={22} /> Manage Products</h2>
          <p className="lm-page-subtitle">Create and manage products linked with categories and sub categories</p>
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
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Product</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Product Name</label>
              <input type="text" className="lm-input" placeholder="Enter product name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">HSN Code</label>
              <input type="text" className="lm-input" placeholder="Enter HSN code" value={formData.hsnCode} onChange={e => setFormData({ ...formData, hsnCode: e.target.value })} />
            </div>
            <div className="lm-field" style={{ gridColumn: "1 / -1" }}>
              <label className="lm-label">Description</label>
              <textarea className="lm-input" placeholder="Enter description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ minHeight: "80px" }}></textarea>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"} Product</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: "", categoryId: "", subCategoryId: "", hsnCode: "", description: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Products ({products.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Product Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>HSN Code</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod, idx) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(prod)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(prod.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                    <button style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#4f46e5" }}>
                      <Eye size={12} /> View
                    </button>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{prod.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{prod.hsnCode || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
