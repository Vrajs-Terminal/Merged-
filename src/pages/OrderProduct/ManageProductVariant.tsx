import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Layers } from "lucide-react";
import { productVariantAPI } from "../../services/apiService";

interface ProductVariant {
  id: number;
  status: "Active" | "Inactive";
  productId?: number;
  name: string;
  variantName?: string;
  sku: string;
  bulkType?: string;
  perBoxPiece?: number;
  retailerSellingPrice?: number;
  mrp?: number;
  manufacturingCost?: number;
  unit?: string;
}

export default function ManageProductVariant() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", product: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ productId: "", name: "", sku: "", bulkType: "", perBoxPiece: "", retailerSellingPrice: "", mrp: "", manufacturingCost: "", unit: "" });

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await productVariantAPI.getAll(currentPage, itemsPerPage);
      const rows = response.data.data || [];
      setVariants(rows.map((item: any) => ({
        ...item,
        name: item.name || item.variantName || "",
        variantName: item.variantName || item.name || ""
      })));
    } catch (error) {
      setMsg({ type: "error", text: "Failed to load product variants" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formData.name) {
      setMsg({ type: "error", text: "Variant Name is required" });
      return;
    }
    try {
      const payload = {
        productId: formData.productId ? parseInt(formData.productId) : undefined,
        name: formData.name,
        sku: formData.sku,
        bulkType: formData.bulkType,
        perBoxPiece: formData.perBoxPiece ? parseInt(formData.perBoxPiece) : undefined,
        retailerSellingPrice: formData.retailerSellingPrice ? parseFloat(formData.retailerSellingPrice) : undefined,
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        manufacturingCost: formData.manufacturingCost ? parseFloat(formData.manufacturingCost) : undefined,
        unit: formData.unit
      };
      if (editingId) {
        await productVariantAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Variant updated successfully" });
        setEditingId(null);
      } else {
        await productVariantAPI.create(payload);
        setMsg({ type: "success", text: "Variant added successfully" });
      }
      fetchData();
      setFormData({ productId: "", name: "", sku: "", bulkType: "", perBoxPiece: "", retailerSellingPrice: "", mrp: "", manufacturingCost: "", unit: "" });
      setShowForm(false);
    } catch (error) {
      setMsg({ type: "error", text: editingId ? "Failed to update variant" : "Failed to add variant" });
      console.error(error);
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setFormData({
      productId: variant.productId?.toString() || "",
      name: variant.name,
      sku: variant.sku,
      bulkType: variant.bulkType || "",
      perBoxPiece: variant.perBoxPiece?.toString() || "",
      retailerSellingPrice: variant.retailerSellingPrice?.toString() || "",
      mrp: variant.mrp?.toString() || "",
      manufacturingCost: variant.manufacturingCost?.toString() || "",
      unit: variant.unit || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await productVariantAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Status updated successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to update status" });
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productVariantAPI.delete(id);
      setMsg({ type: "success", text: "Variant deleted successfully" });
      fetchData();
    } catch (error) {
      setMsg({ type: "error", text: "Failed to delete variant" });
      console.error(error);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Layers size={22} /> Manage Product Variants</h2>
          <p className="lm-page-subtitle">Define product variants like size, packaging, or type</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Category</label>
            <select className="lm-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
              <option value="">All Categories</option>
              <option value="Snacks">Snacks</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <input type="text" className="lm-input" placeholder="Search product" value={filters.product} onChange={e => setFilters({ ...filters, product: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: "0.75rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Add Variant
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit" : "Add"} Product Variant</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div className="lm-field">
              <label className="lm-label">Variant Name</label>
              <input type="text" className="lm-input" placeholder="e.g., 100g Pack" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">SKU</label>
              <input type="text" className="lm-input" placeholder="Enter SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Bulk Type</label>
              <select className="lm-select" value={formData.bulkType} onChange={e => setFormData({ ...formData, bulkType: e.target.value })}>
                <option value="">Select Type</option>
                <option value="Box">Box</option>
                <option value="Case">Case</option>
                <option value="Packet">Packet</option>
                <option value="Bottle">Bottle</option>
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Per Box Piece</label>
              <input type="number" className="lm-input" placeholder="Enter quantity" value={formData.perBoxPiece} onChange={e => setFormData({ ...formData, perBoxPiece: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Retailer Selling Price</label>
              <input type="number" className="lm-input" placeholder="Enter price" value={formData.retailerSellingPrice} onChange={e => setFormData({ ...formData, retailerSellingPrice: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">MRP</label>
              <input type="number" className="lm-input" placeholder="Enter MRP" value={formData.mrp} onChange={e => setFormData({ ...formData, mrp: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Manufacturing Cost</label>
              <input type="number" className="lm-input" placeholder="Enter cost" value={formData.manufacturingCost} onChange={e => setFormData({ ...formData, manufacturingCost: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">Unit</label>
              <input type="text" className="lm-input" placeholder="e.g., Pack, Box" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={handleAdd} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>{editingId ? "Update" : "Add"} Variant</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ productId: "", name: "", sku: "", bulkType: "", perBoxPiece: "", retailerSellingPrice: "", mrp: "", manufacturingCost: "", unit: "" }); }} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#e2e8f0", color: "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Product Variants ({variants.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Action</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Variant Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>SKU</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Bulk Type</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Per Box</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>RSP</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>MRP</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => (
                <tr key={variant.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => handleEdit(variant)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#0c4a6e" }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => handleToggleStatus(variant.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#e0e7ff", border: "1px solid #6366f1", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#4f46e5" }}>
                      {variant.status === "Active" ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                    </button>
                    <button onClick={() => handleDelete(variant.id)} style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.25rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 500, color: "#7f1d1d" }}>
                      <Trash2 size={12} /> Del
                    </button>
                  </td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {variant.status === "Active" ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      <span style={{ color: variant.status === "Active" ? "#166534" : "#64748b", fontWeight: 600, fontSize: "0.75rem" }}>{variant.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem" }}>{variant.variantName || variant.name}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{variant.sku}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{variant.bulkType || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>{variant.perBoxPiece || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#059669", fontSize: "0.875rem", fontWeight: 600 }}>₹{variant.retailerSellingPrice || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>₹{variant.mrp || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === 1 ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === 1 ? "default" : "pointer" }}>Prev</button>
          {Array.from({ length: Math.ceil(variants.length / itemsPerPage) }, (_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === i + 1 ? "#6366f1" : "#f1f5f9", color: currentPage === i + 1 ? "white" : "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === Math.ceil(variants.length / itemsPerPage)} style={{ padding: "0.4rem 0.8rem", backgroundColor: currentPage === Math.ceil(variants.length / itemsPerPage) ? "#f1f5f9" : "#e0e7ff", color: "#4f46e5", fontSize: "0.875rem", border: "1px solid #c7d2fe", borderRadius: "0.25rem", cursor: currentPage === Math.ceil(variants.length / itemsPerPage) ? "default" : "pointer" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
