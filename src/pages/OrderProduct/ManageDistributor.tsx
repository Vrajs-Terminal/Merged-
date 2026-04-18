import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  RefreshCcw,
  Trash2,
  Truck
} from "lucide-react";
import { distributorAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface DistributorRecord {
  id: number;
  name: string;
  contactPerson?: string;
  contactNumber?: string;
  orderEmail?: string;
  email?: string;
  country?: string;
  state?: string;
  city?: string;
  distributorType?: string;
  status?: "Active" | "Inactive";
}

const ITEMS_PER_PAGE = 10;

export default function ManageDistributor() {
  const [distributors, setDistributors] = useState<DistributorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    contactNumber: "",
    orderEmail: "",
    email: "",
    country: "",
    state: "",
    city: "",
    distributorType: ""
  });

  useEffect(() => {
    void fetchDistributors();
  }, []);

  const fetchDistributors = async () => {
    try {
      setLoading(true);
      const response = await distributorAPI.getAll(1, 1000);
      const { rows } = extractApiList<DistributorRecord>(response.data);
      setDistributors(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load distributors." });
    } finally {
      setLoading(false);
    }
  };

  const filteredDistributors = useMemo(
    () => distributors.filter((distributor) =>
      (!statusFilter || distributor.status === statusFilter) &&
      buildSearchText(
        distributor.name,
        distributor.contactPerson,
        distributor.contactNumber,
        distributor.email,
        distributor.orderEmail,
        distributor.city,
        distributor.state,
        distributor.distributorType
      ).includes(searchTerm.toLowerCase())
    ),
    [distributors, searchTerm, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredDistributors.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedDistributors = useMemo(
    () => filteredDistributors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredDistributors]
  );

  const activeCount = distributors.filter((distributor) => distributor.status === "Active").length;
  const cityCount = new Set(distributors.map((distributor) => distributor.city).filter(Boolean)).size;
  const orderEmailCount = distributors.filter((distributor) => distributor.orderEmail?.trim()).length;
  const visibleStart = filteredDistributors.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredDistributors.length);

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      contactNumber: "",
      orderEmail: "",
      email: "",
      country: "",
      state: "",
      city: "",
      distributorType: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMsg({ type: "error", text: "Distributor name is required." });
      return;
    }

    try {
      if (editingId) {
        await distributorAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Distributor updated successfully." });
      } else {
        await distributorAPI.create(formData);
        setMsg({ type: "success", text: "Distributor created successfully." });
      }

      await fetchDistributors();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save distributor." });
    }
  };

  const handleEdit = (distributor: DistributorRecord) => {
    setEditingId(distributor.id);
    setFormData({
      name: distributor.name,
      contactPerson: distributor.contactPerson || "",
      contactNumber: distributor.contactNumber || "",
      orderEmail: distributor.orderEmail || "",
      email: distributor.email || "",
      country: distributor.country || "",
      state: distributor.state || "",
      city: distributor.city || "",
      distributorType: distributor.distributorType || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this distributor?")) {
      return;
    }

    try {
      await distributorAPI.delete(id);
      setMsg({ type: "success", text: "Distributor deleted successfully." });
      await fetchDistributors();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete distributor." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Truck size={14} /> Supply network</span>
          <h2 className="lm-page-title"><Truck size={22} /> Manage Distributors</h2>
          <p className="lm-page-subtitle">
            Maintain distributor coverage and commercial contact details from a cleaner network-management workspace without placeholder actions.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Commercial contacts</span>
            <span className="opw-hero-pill">Location visibility</span>
            <span className="opw-hero-pill">Search-first workflow</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Distributors</span>
            <strong>{distributors.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Cities</span>
            <strong>{cityCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Order Emails</span>
            <strong>{orderEmailCount}</strong>
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
            <Truck size={18} />
            <div>
              <h3>Browse Distributors</h3>
              <p>Search across location and contact details, or use one status filter when you need a cleaner operational view.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredDistributors.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by distributor, contact, email, city, or type"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Status</label>
            <select
              className="lm-select"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
              <Plus size={16} />
              {showForm ? "Hide Form" : "Add Distributor"}
            </button>
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchDistributors()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              className="opw-secondary-btn"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
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
                <h3>{editingId ? "Edit Distributor" : "Create Distributor"}</h3>
                <p>Capture core distributor identity, communication, and location data in one practical form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Distributor Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter distributor name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Contact Person</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter contact person"
                value={formData.contactPerson}
                onChange={(event) => setFormData((current) => ({ ...current, contactPerson: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Contact Number</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={(event) => setFormData((current) => ({ ...current, contactNumber: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Order Email</label>
              <input
                type="email"
                className="lm-input"
                placeholder="Enter order email"
                value={formData.orderEmail}
                onChange={(event) => setFormData((current) => ({ ...current, orderEmail: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Email</label>
              <input
                type="email"
                className="lm-input"
                placeholder="Enter email"
                value={formData.email}
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Country</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter country"
                value={formData.country}
                onChange={(event) => setFormData((current) => ({ ...current, country: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">State</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter state"
                value={formData.state}
                onChange={(event) => setFormData((current) => ({ ...current, state: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">City</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter city"
                value={formData.city}
                onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Distributor Type</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter distributor type"
                value={formData.distributorType}
                onChange={(event) => setFormData((current) => ({ ...current, distributorType: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Distributor" : "Save Distributor"}
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
            <Truck size={18} />
            <div>
              <h3>Distributor Directory</h3>
              <p>Review distributor details, geography, and commercial contact channels from a cleaner network table.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Network"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredDistributors.length} distributors</span>
          <span>{orderEmailCount} order emails configured</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Distributor</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Location</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>Loading distributors</h4>
                      <p>Pulling the latest distributor network records.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedDistributors.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>No distributors match this view</h4>
                      <p>Adjust the search or filters, or create a new distributor to expand the network.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedDistributors.map((distributor) => (
                <tr key={distributor.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{distributor.name}</strong>
                      <small>Distributor #{distributor.id}</small>
                    </div>
                  </td>
                  <td>
                    <div className="opw-entity">
                      <strong>{distributor.contactPerson || "—"}</strong>
                      <small>{distributor.contactNumber || "No contact number"}</small>
                    </div>
                  </td>
                  <td>
                    <div className="opw-entity">
                      <strong>{distributor.email || "—"}</strong>
                      <small>{distributor.orderEmail || "No order email"}</small>
                    </div>
                  </td>
                  <td>{[distributor.city, distributor.state, distributor.country].filter(Boolean).join(", ") || "—"}</td>
                  <td>{distributor.distributorType || "—"}</td>
                  <td>
                    <span className={`opw-status-badge ${getStatusTone(distributor.status)}`}>
                      {distributor.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <div className="opw-row-actions">
                      <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(distributor)}>
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(distributor.id)}>
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

        {filteredDistributors.length > 0 && (
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
