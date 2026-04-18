import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Layers,
  Plus,
  RefreshCcw,
  Trash2
} from "lucide-react";
import { productAPI, productVariantAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { formatCurrency } from "./orderProductReportHelpers";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface ProductOption {
  id: number;
  name: string;
}

interface ProductVariantRecord {
  id: number;
  status?: "Active" | "Inactive";
  productId?: number;
  product?: { id: number; name: string };
  name?: string;
  variantName?: string;
  sku?: string;
  bulkType?: string;
  perBoxPiece?: number;
  retailerSellingPrice?: number;
  mrp?: number;
  manufacturingCost?: number;
  unit?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ManageProductVariant() {
  const [variants, setVariants] = useState<ProductVariantRecord[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    sku: "",
    bulkType: "",
    perBoxPiece: "",
    retailerSellingPrice: "",
    mrp: "",
    manufacturingCost: "",
    unit: ""
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [variantResponse, productResponse] = await Promise.all([
        productVariantAPI.getAll(1, 1000),
        productAPI.getAll(1, 1000)
      ]);

      setVariants(extractApiList<ProductVariantRecord>(variantResponse.data).rows);
      setProducts(extractApiList<ProductOption>(productResponse.data).rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load product variants." });
    } finally {
      setLoading(false);
    }
  };

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product.name])),
    [products]
  );

  const filteredVariants = useMemo(
    () => variants.filter((variant) => {
      const productId = variant.productId || variant.product?.id;
      const productName = variant.product?.name || productMap.get(productId || 0);
      const variantName = variant.variantName || variant.name || "";

      return (
        (!productFilter || String(productId || "") === productFilter) &&
        buildSearchText(
          variantName,
          variant.sku,
          variant.bulkType,
          productName,
          variant.unit,
          variant.status
        ).includes(searchTerm.toLowerCase())
      );
    }),
    [productFilter, productMap, searchTerm, variants]
  );

  const totalPages = Math.max(1, Math.ceil(filteredVariants.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedVariants = useMemo(
    () => filteredVariants.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredVariants]
  );

  const activeCount = variants.filter((variant) => variant.status === "Active").length;
  const skuCount = variants.filter((variant) => variant.sku?.trim()).length;
  const linkedProductCount = new Set(variants.map((variant) => variant.productId || variant.product?.id).filter(Boolean)).size;
  const visibleStart = filteredVariants.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredVariants.length);

  const resetForm = () => {
    setFormData({
      productId: "",
      name: "",
      sku: "",
      bulkType: "",
      perBoxPiece: "",
      retailerSellingPrice: "",
      mrp: "",
      manufacturingCost: "",
      unit: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.name.trim()) {
      setMsg({ type: "error", text: "Product and variant name are required." });
      return;
    }

    const payload = {
      productId: Number(formData.productId),
      name: formData.name,
      sku: formData.sku,
      bulkType: formData.bulkType,
      perBoxPiece: formData.perBoxPiece ? Number(formData.perBoxPiece) : undefined,
      retailerSellingPrice: formData.retailerSellingPrice ? Number(formData.retailerSellingPrice) : undefined,
      mrp: formData.mrp ? Number(formData.mrp) : undefined,
      manufacturingCost: formData.manufacturingCost ? Number(formData.manufacturingCost) : undefined,
      unit: formData.unit
    };

    try {
      if (editingId) {
        await productVariantAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Product variant updated successfully." });
      } else {
        await productVariantAPI.create(payload);
        setMsg({ type: "success", text: "Product variant created successfully." });
      }

      await fetchData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save product variant." });
    }
  };

  const handleEdit = (variant: ProductVariantRecord) => {
    setEditingId(variant.id);
    setFormData({
      productId: String(variant.productId || variant.product?.id || ""),
      name: variant.variantName || variant.name || "",
      sku: variant.sku || "",
      bulkType: variant.bulkType || "",
      perBoxPiece: variant.perBoxPiece ? String(variant.perBoxPiece) : "",
      retailerSellingPrice: variant.retailerSellingPrice ? String(variant.retailerSellingPrice) : "",
      mrp: variant.mrp ? String(variant.mrp) : "",
      manufacturingCost: variant.manufacturingCost ? String(variant.manufacturingCost) : "",
      unit: variant.unit || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await productVariantAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Product variant status updated successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update product variant status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product variant?")) {
      return;
    }

    try {
      await productVariantAPI.delete(id);
      setMsg({ type: "success", text: "Product variant deleted successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete product variant." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Layers size={14} /> Sellable variations</span>
          <h2 className="lm-page-title"><Layers size={22} /> Manage Product Variants</h2>
          <p className="lm-page-subtitle">
            Manage packaging, SKU, and price-level variation data from one cleaner workspace that keeps each variant tied to its parent product.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Product-linked variants</span>
            <span className="opw-hero-pill">Pricing visibility</span>
            <span className="opw-hero-pill">Cleaner lifecycle control</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Variants</span>
            <strong>{variants.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Products Linked</span>
            <strong>{linkedProductCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>SKU Ready</span>
            <strong>{skuCount}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert opw-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{msg.text}</span>
          <button type="button" className="opw-alert-close" onClick={() => setMsg(null)} aria-label="Close message">
            ×
          </button>
        </div>
      )}

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Layers size={18} />
            <div>
              <h3>Browse Variants</h3>
              <p>Use a slim product filter and search to find packaging or pricing variants quickly without adding unnecessary controls.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredVariants.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by variant, SKU, product, packaging, or status"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Product Filter</label>
            <select
              className="lm-select"
              value={productFilter}
              onChange={(event) => {
                setProductFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
              <Plus size={16} />
              {showForm ? "Hide Form" : "Add Variant"}
            </button>
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchData()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              className="opw-secondary-btn"
              onClick={() => {
                setSearchTerm("");
                setProductFilter("");
                setCurrentPage(1);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <Plus size={18} />
              <div>
                <h3>{editingId ? "Edit Product Variant" : "Create Product Variant"}</h3>
                <p>Capture the sellable unit, packaging, and commercial pricing details in one cleaner variant form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Product</label>
              <select
                className="lm-select"
                value={formData.productId}
                onChange={(event) => setFormData((current) => ({ ...current, productId: event.target.value }))}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Variant Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter variant name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">SKU</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter SKU"
                value={formData.sku}
                onChange={(event) => setFormData((current) => ({ ...current, sku: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Bulk Type</label>
              <select
                className="lm-select"
                value={formData.bulkType}
                onChange={(event) => setFormData((current) => ({ ...current, bulkType: event.target.value }))}
              >
                <option value="">Select bulk type</option>
                <option value="Box">Box</option>
                <option value="Case">Case</option>
                <option value="Packet">Packet</option>
                <option value="Bottle">Bottle</option>
                <option value="Jar">Jar</option>
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Per Box Piece</label>
              <input
                type="number"
                className="lm-input"
                placeholder="Enter quantity"
                value={formData.perBoxPiece}
                onChange={(event) => setFormData((current) => ({ ...current, perBoxPiece: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Unit</label>
              <input
                type="text"
                className="lm-input"
                placeholder="e.g. PCS, Box, Pack"
                value={formData.unit}
                onChange={(event) => setFormData((current) => ({ ...current, unit: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Retailer Selling Price</label>
              <input
                type="number"
                className="lm-input"
                placeholder="Enter selling price"
                value={formData.retailerSellingPrice}
                onChange={(event) => setFormData((current) => ({ ...current, retailerSellingPrice: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">MRP</label>
              <input
                type="number"
                className="lm-input"
                placeholder="Enter MRP"
                value={formData.mrp}
                onChange={(event) => setFormData((current) => ({ ...current, mrp: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Manufacturing Cost</label>
              <input
                type="number"
                className="lm-input"
                placeholder="Enter cost"
                value={formData.manufacturingCost}
                onChange={(event) => setFormData((current) => ({ ...current, manufacturingCost: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Variant" : "Save Variant"}
              </button>
              <button
                type="button"
                className="opw-secondary-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Layers size={18} />
            <div>
              <h3>Variant Directory</h3>
              <p>Review SKU and pricing setup with clearer product links, packaging data, and status handling.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Catalog"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredVariants.length} variants</span>
          <span>{linkedProductCount} linked products</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>SKU</th>
                <th>Packaging</th>
                <th className="opw-value-cell">Retail Price</th>
                <th className="opw-value-cell">MRP</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="opw-empty">
                      <h4>Loading product variants</h4>
                      <p>Pulling the latest SKU and packaging setup from the catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedVariants.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="opw-empty">
                      <h4>No variants match this view</h4>
                      <p>Clear the search or create a new product variant to expand the sellable catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedVariants.map((variant) => {
                const productName = variant.product?.name || productMap.get(variant.productId || 0) || "Unlinked";
                const variantName = variant.variantName || variant.name || "Unnamed Variant";
                const packaging = [
                  variant.bulkType,
                  variant.perBoxPiece ? `${variant.perBoxPiece}/box` : null,
                  variant.unit
                ].filter(Boolean).join(" • ");

                return (
                  <tr key={variant.id}>
                    <td>{productName}</td>
                    <td>
                      <div className="opw-entity">
                        <strong>{variantName}</strong>
                        <small>Variant #{variant.id}</small>
                      </div>
                    </td>
                    <td><code>{variant.sku || "—"}</code></td>
                    <td>{packaging || "—"}</td>
                    <td className="opw-value-cell">{formatCurrency(variant.retailerSellingPrice || 0)}</td>
                    <td className="opw-value-cell">{formatCurrency(variant.mrp || 0)}</td>
                    <td>
                      <span className={`opw-status-badge ${getStatusTone(variant.status)}`}>
                        {variant.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="opw-row-actions">
                        <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(variant)}>
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button type="button" className="opw-row-btn is-muted" onClick={() => void handleToggleStatus(variant.id)}>
                          {variant.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(variant.id)}>
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredVariants.length > 0 && (
          <div className="opw-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="opw-pagination-controls">
              <button
                type="button"
                className="opw-pagination-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                className="opw-pagination-btn"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
