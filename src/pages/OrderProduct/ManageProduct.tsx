import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Trash2
} from "lucide-react";
import { productAPI, productCategoryAPI, productSubCategoryAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList } from "./orderProductWorkspaceHelpers";

interface ProductRecord {
  id: number;
  name: string;
  categoryId?: number;
  subCategoryId?: number;
  hsnCode?: string;
  description?: string;
  category?: { id: number; name: string };
  subCategory?: { id: number; name: string };
}

interface CategoryOption {
  id: number;
  name: string;
}

interface SubCategoryOption {
  id: number;
  name: string;
  categoryId?: number;
  category?: { id: number };
}

const ITEMS_PER_PAGE = 10;

export default function ManageProduct() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    hsnCode: "",
    description: ""
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productResponse, categoryResponse, subCategoryResponse] = await Promise.all([
        productAPI.getAll(1, 1000),
        productCategoryAPI.getAll(1, 1000),
        productSubCategoryAPI.getAll(1, 1000)
      ]);

      setProducts(extractApiList<ProductRecord>(productResponse.data).rows);
      setCategories(extractApiList<CategoryOption>(categoryResponse.data).rows);
      setSubCategories(extractApiList<SubCategoryOption>(subCategoryResponse.data).rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load products." });
    } finally {
      setLoading(false);
    }
  };

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const subCategoryMap = useMemo(
    () => new Map(subCategories.map((subCategory) => [subCategory.id, subCategory.name])),
    [subCategories]
  );

  const filteredSubCategories = useMemo(
    () => subCategories.filter((subCategory) => {
      const linkedCategoryId = subCategory.categoryId || subCategory.category?.id;
      return !formData.categoryId || String(linkedCategoryId || "") === formData.categoryId;
    }),
    [formData.categoryId, subCategories]
  );

  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const productCategoryId = product.categoryId || product.category?.id;
      const categoryName = product.category?.name || categoryMap.get(productCategoryId || 0);
      const subCategoryName = product.subCategory?.name || subCategoryMap.get(product.subCategoryId || 0);

      return (
        (!categoryFilter || String(productCategoryId || "") === categoryFilter) &&
        buildSearchText(
          product.name,
          product.hsnCode,
          product.description,
          categoryName,
          subCategoryName
        ).includes(searchTerm.toLowerCase())
      );
    }),
    [categoryFilter, categoryMap, products, searchTerm, subCategoryMap]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(
    () => filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredProducts]
  );

  const categorizedCount = products.filter((product) => product.categoryId || product.category?.id).length;
  const hsnCount = products.filter((product) => product.hsnCode?.trim()).length;
  const describedCount = products.filter((product) => product.description?.trim()).length;
  const visibleStart = filteredProducts.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  const resetForm = () => {
    setFormData({
      name: "",
      categoryId: "",
      subCategoryId: "",
      hsnCode: "",
      description: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMsg({ type: "error", text: "Product name is required." });
      return;
    }

    const payload = {
      name: formData.name,
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      subCategoryId: formData.subCategoryId ? Number(formData.subCategoryId) : undefined,
      hsnCode: formData.hsnCode,
      description: formData.description
    };

    try {
      if (editingId) {
        await productAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Product updated successfully." });
      } else {
        await productAPI.create(payload);
        setMsg({ type: "success", text: "Product created successfully." });
      }

      await fetchData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save product." });
    }
  };

  const handleEdit = (product: ProductRecord) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      categoryId: String(product.categoryId || product.category?.id || ""),
      subCategoryId: String(product.subCategoryId || product.subCategory?.id || ""),
      hsnCode: product.hsnCode || "",
      description: product.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {
      await productAPI.delete(id);
      setMsg({ type: "success", text: "Product deleted successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete product." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Package size={14} /> Product catalog</span>
          <h2 className="lm-page-title"><Package size={22} /> Manage Products</h2>
          <p className="lm-page-subtitle">
            Maintain the core product catalog with better category mapping, cleaner detail entry, and a more professional table workflow.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Category-linked records</span>
            <span className="opw-hero-pill">Catalog search</span>
            <span className="opw-hero-pill">Clean product editing</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Categorized</span>
            <strong>{categorizedCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>HSN Tagged</span>
            <strong>{hsnCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Described</span>
            <strong>{describedCount}</strong>
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
            <Package size={18} />
            <div>
              <h3>Browse Products</h3>
              <p>Use search and a single category filter to scan the catalog without cluttering the page with unnecessary controls.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredProducts.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by product, category, sub category, HSN, or description"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Category Filter</label>
            <select
              className="lm-select"
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
              <Plus size={16} />
              {showForm ? "Hide Form" : "Add Product"}
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
                setCategoryFilter("");
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
                <h3>{editingId ? "Edit Product" : "Create Product"}</h3>
                <p>Capture category, sub category, and tax code data in one cleaner product setup form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Product Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Category</label>
              <select
                className="lm-select"
                value={formData.categoryId}
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  categoryId: event.target.value,
                  subCategoryId: ""
                }))}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Sub Category</label>
              <select
                className="lm-select"
                value={formData.subCategoryId}
                onChange={(event) => setFormData((current) => ({ ...current, subCategoryId: event.target.value }))}
              >
                <option value="">Select sub category</option>
                {filteredSubCategories.map((subCategory) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {subCategory.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">HSN Code</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter HSN code"
                value={formData.hsnCode}
                onChange={(event) => setFormData((current) => ({ ...current, hsnCode: event.target.value }))}
              />
            </div>
            <div className="lm-field opw-form-span-2">
              <label className="lm-label">Description</label>
              <textarea
                className="lm-input"
                rows={4}
                placeholder="Write a short product description"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Product" : "Save Product"}
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
            <Package size={18} />
            <div>
              <h3>Product Directory</h3>
              <p>Review product structure, tax code, and category alignment from one polished catalog table.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Catalog"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredProducts.length} products</span>
          <span>{categorizedCount} linked to categories</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Sub Category</th>
                <th>HSN</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="opw-empty">
                      <h4>Loading products</h4>
                      <p>Pulling the latest product catalog from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="opw-empty">
                      <h4>No products match this view</h4>
                      <p>Clear the search or create a new product to expand the catalog.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.map((product) => {
                const categoryName = product.category?.name || categoryMap.get(product.categoryId || 0) || "Unlinked";
                const subCategoryName = product.subCategory?.name || subCategoryMap.get(product.subCategoryId || 0) || "Unlinked";

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="opw-entity">
                        <strong>{product.name}</strong>
                        <small>Product #{product.id}</small>
                      </div>
                    </td>
                    <td>{categoryName}</td>
                    <td>{subCategoryName}</td>
                    <td><code>{product.hsnCode || "—"}</code></td>
                    <td>{product.description || "No description added yet."}</td>
                    <td>
                      <div className="opw-row-actions">
                        <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(product)}>
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(product.id)}>
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

        {filteredProducts.length > 0 && (
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
