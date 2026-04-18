import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  RefreshCcw,
  Search,
  Tags,
  Trash2
} from "lucide-react";
import { customerCategoryAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList } from "./orderProductWorkspaceHelpers";

interface CustomerCategory {
  id: number;
  name: string;
  description?: string;
  status?: "Active" | "Inactive";
}

const ITEMS_PER_PAGE = 10;

export default function CustomerCategories() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    void fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await customerCategoryAPI.getAll(1, 1000);
      const { rows } = extractApiList<CustomerCategory>(response.data);
      setCategories(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load customer categories." });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(
    () => categories.filter((category) =>
      buildSearchText(category.name, category.description, category.status).includes(searchTerm.toLowerCase())
    ),
    [categories, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedCategories = useMemo(
    () => filteredCategories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredCategories]
  );

  const describedCount = categories.filter((category) => category.description?.trim()).length;
  const activeCount = categories.filter((category) => category.status === "Active").length;
  const visibleStart = filteredCategories.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length);

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMsg({ type: "error", text: "Category name is required." });
      return;
    }

    try {
      if (editingId) {
        await customerCategoryAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Customer category updated successfully." });
      } else {
        await customerCategoryAPI.create(formData);
        setMsg({ type: "success", text: "Customer category created successfully." });
      }

      await fetchCategories();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save customer category." });
    }
  };

  const handleEdit = (category: CustomerCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this customer category?")) {
      return;
    }

    try {
      await customerCategoryAPI.delete(id);
      setMsg({ type: "success", text: "Customer category deleted successfully." });
      await fetchCategories();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete customer category." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Tags size={14} /> Customer grouping</span>
          <h2 className="lm-page-title"><Tags size={22} /> Customer Categories</h2>
          <p className="lm-page-subtitle">
            Group retailers into cleaner business segments with a more professional classification workspace and clearer maintenance flow.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Segment structure</span>
            <span className="opw-hero-pill">Fast search</span>
            <span className="opw-hero-pill">Focused CRUD</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Categories</span>
            <strong>{categories.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Visible</span>
            <strong>{filteredCategories.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
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
        <div className="opw-toolbar">
          <div className="opw-search">
            <Search size={16} />
            <div>
              <label htmlFor="customer-category-search">Search customer categories</label>
              <input
                id="customer-category-search"
                type="text"
                className="lm-input"
                placeholder="Search by category name, description, or status"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="opw-toolbar-actions">
            <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
              <Plus size={16} />
              {showForm ? "Hide Form" : "Add Category"}
            </button>
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchCategories()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
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
                <h3>{editingId ? "Edit Customer Category" : "Create Customer Category"}</h3>
                <p>Define clean customer segments so retailer mapping and planning stay understandable.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Category Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter customer category name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field opw-form-span-2">
              <label className="lm-label">Description</label>
              <textarea
                className="lm-input"
                rows={4}
                placeholder="Add a short business description"
                value={formData.description}
                onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Category" : "Save Category"}
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
            <Tags size={18} />
            <div>
              <h3>Category Directory</h3>
              <p>Maintain retailer segmentation with a cleaner list, stronger scanning, and direct row-level editing.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredCategories.length} visible</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredCategories.length} categories</span>
          <span>{describedCount} with descriptions</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="opw-empty">
                      <h4>Loading customer categories</h4>
                      <p>Pulling the latest customer segmentation records.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="opw-empty">
                      <h4>No categories match this view</h4>
                      <p>Try a broader search or create a new customer category to start grouping retailers.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{category.name}</strong>
                      <small>Category #{category.id}</small>
                    </div>
                  </td>
                  <td>{category.description || "No description added yet."}</td>
                  <td>
                    <span className={`opw-status-badge ${category.status === "Active" ? "is-success" : "is-neutral"}`}>
                      {category.status || "Not set"}
                    </span>
                  </td>
                  <td>
                    <div className="opw-row-actions">
                      <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(category)}>
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(category.id)}>
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

        {filteredCategories.length > 0 && (
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
