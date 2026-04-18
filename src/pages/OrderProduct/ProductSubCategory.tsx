import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  RefreshCcw,
  Tag,
  Trash2
} from "lucide-react";
import { productCategoryAPI, productSubCategoryAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface ProductSubCategoryRecord {
  id: number;
  categoryId?: number;
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

interface CategoryOption {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 10;

export default function ProductSubCategory() {
  const [subCategories, setSubCategories] = useState<ProductSubCategoryRecord[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ categoryId: "", name: "", description: "" });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subCategoryResponse, categoryResponse] = await Promise.all([
        productSubCategoryAPI.getAll(1, 1000),
        productCategoryAPI.getAll(1, 1000)
      ]);

      setSubCategories(extractApiList<ProductSubCategoryRecord>(subCategoryResponse.data).rows);
      setCategories(extractApiList<CategoryOption>(categoryResponse.data).rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load product sub categories." });
    } finally {
      setLoading(false);
    }
  };

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const filteredSubCategories = useMemo(
    () => subCategories.filter((subCategory) => {
      const matchesCategory = !categoryFilter || String(subCategory.categoryId || "") === categoryFilter;
      const matchesSearch = buildSearchText(
        subCategory.name,
        subCategory.description,
        categoryMap.get(subCategory.categoryId || 0),
        subCategory.status
      ).includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    }),
    [categoryFilter, categoryMap, searchTerm, subCategories]
  );

  const totalPages = Math.max(1, Math.ceil(filteredSubCategories.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedSubCategories = useMemo(
    () => filteredSubCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredSubCategories]
  );

  const activeCount = subCategories.filter((subCategory) => subCategory.status === "Active").length;
  const linkedCategoryCount = new Set(subCategories.map((subCategory) => subCategory.categoryId).filter(Boolean)).size;
  const describedCount = subCategories.filter((subCategory) => subCategory.description?.trim()).length;
  const visibleStart = filteredSubCategories.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredSubCategories.length);

  const resetForm = () => {
    setFormData({ categoryId: "", name: "", description: "" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.categoryId || !formData.name.trim()) {
      setMsg({ type: "error", text: "Category and sub category name are required." });
      return;
    }

    const payload = {
      categoryId: Number(formData.categoryId),
      name: formData.name,
      description: formData.description
    };

    try {
      if (editingId) {
        await productSubCategoryAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Sub category updated successfully." });
      } else {
        await productSubCategoryAPI.create(payload);
        setMsg({ type: "success", text: "Sub category created successfully." });
      }

      await fetchData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save sub category." });
    }
  };

  const handleEdit = (subCategory: ProductSubCategoryRecord) => {
    setEditingId(subCategory.id);
    setFormData({
      categoryId: String(subCategory.categoryId || ""),
      name: subCategory.name,
      description: subCategory.description || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await productSubCategoryAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Sub category status updated successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update sub category status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this product sub category?")) {
      return;
    }

    try {
      await productSubCategoryAPI.delete(id);
      setMsg({ type: "success", text: "Sub category deleted successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete sub category." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Tag size={14} /> Catalog depth</span>
          <h2 className="lm-page-title"><Tag size={22} /> Product Sub Categories</h2>
          <p className="lm-page-subtitle">
            Keep secondary catalog grouping clear and maintainable with better category linking, search, and status control.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Category-linked records</span>
            <span className="opw-hero-pill">Focused filtering</span>
            <span className="opw-hero-pill">Cleaner actions</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Sub Categories</span>
            <strong>{subCategories.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Linked Categories</span>
            <strong>{linkedCategoryCount}</strong>
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
            <Tag size={18} />
            <div>
              <h3>Browse Sub Categories</h3>
              <p>Search across names and category links, or narrow the view to a specific parent category.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredSubCategories.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by sub category, description, category, or status"
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
              {showForm ? "Hide Form" : "Add Sub Category"}
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
                <h3>{editingId ? "Edit Sub Category" : "Create Sub Category"}</h3>
                <p>Link each sub category to its parent category so reporting and product setup stay aligned.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Parent Category</label>
              <select
                className="lm-select"
                value={formData.categoryId}
                onChange={(event) => setFormData((current) => ({ ...current, categoryId: event.target.value }))}
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
              <label className="lm-label">Sub Category Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter sub category name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field opw-form-span-2">
              <label className="lm-label">Description</label>
              <textarea
                className="lm-input"
                rows={4}
                placeholder="Add context for this sub category"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Sub Category" : "Save Sub Category"}
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
            <Tag size={18} />
            <div>
              <h3>Sub Category Directory</h3>
              <p>Manage the second level of product classification with better parent-child visibility.</p>
            </div>
          </div>
          <span className={`opw-panel-badge ${activeCount > 0 ? "is-success" : ""}`}>{loading ? "Loading..." : "Live Data"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredSubCategories.length} sub categories</span>
          <span>{linkedCategoryCount} linked categories</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Sub Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="opw-empty">
                      <h4>Loading sub categories</h4>
                      <p>Pulling the latest product sub category records.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSubCategories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="opw-empty">
                      <h4>No sub categories match this view</h4>
                      <p>Clear the search or create a new sub category to expand the catalog structure.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSubCategories.map((subCategory) => (
                <tr key={subCategory.id}>
                  <td>{categoryMap.get(subCategory.categoryId || 0) || "Unlinked"}</td>
                  <td>
                    <div className="opw-entity">
                      <strong>{subCategory.name}</strong>
                      <small>Sub category #{subCategory.id}</small>
                    </div>
                  </td>
                  <td>{subCategory.description || "No description added yet."}</td>
                  <td>
                    <span className={`opw-status-badge ${getStatusTone(subCategory.status)}`}>
                      {subCategory.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <div className="opw-row-actions">
                      <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(subCategory)}>
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button type="button" className="opw-row-btn is-muted" onClick={() => void handleToggleStatus(subCategory.id)}>
                        {subCategory.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(subCategory.id)}>
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubCategories.length > 0 && (
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
