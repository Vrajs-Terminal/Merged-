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
import { superDistributorAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface SuperDistributorRecord {
  id: number;
  name: string;
  contactPerson: string;
  contactNumber: string;
  orderEmail: string;
  photo?: string;
  status?: "Active" | "Inactive";
}

const ITEMS_PER_PAGE = 10;

export default function ManageSuperDistributor() {
  const [superDistributors, setSuperDistributors] = useState<SuperDistributorRecord[]>([]);
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
    photo: ""
  });

  useEffect(() => {
    void fetchSuperDistributors();
  }, []);

  const fetchSuperDistributors = async () => {
    try {
      setLoading(true);
      const response = await superDistributorAPI.getAll(1, 1000);
      const { rows } = extractApiList<SuperDistributorRecord>(response.data);
      setSuperDistributors(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load super distributors." });
    } finally {
      setLoading(false);
    }
  };

  const filteredSuperDistributors = useMemo(
    () => superDistributors.filter((distributor) =>
      (!statusFilter || distributor.status === statusFilter) &&
      buildSearchText(
        distributor.name,
        distributor.contactPerson,
        distributor.contactNumber,
        distributor.orderEmail,
        distributor.status
      ).includes(searchTerm.toLowerCase())
    ),
    [searchTerm, statusFilter, superDistributors]
  );

  const totalPages = Math.max(1, Math.ceil(filteredSuperDistributors.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedSuperDistributors = useMemo(
    () => filteredSuperDistributors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredSuperDistributors]
  );

  const activeCount = superDistributors.filter((distributor) => distributor.status === "Active").length;
  const photoCount = superDistributors.filter((distributor) => distributor.photo?.trim()).length;
  const emailCount = superDistributors.filter((distributor) => distributor.orderEmail?.trim()).length;
  const visibleStart = filteredSuperDistributors.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredSuperDistributors.length);

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      contactNumber: "",
      orderEmail: "",
      photo: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.contactPerson.trim() || !formData.contactNumber.trim() || !formData.orderEmail.trim()) {
      setMsg({ type: "error", text: "Name, contact person, contact number, and order email are required." });
      return;
    }

    try {
      if (editingId) {
        await superDistributorAPI.update(editingId, formData);
        setMsg({ type: "success", text: "Super distributor updated successfully." });
      } else {
        await superDistributorAPI.create(formData);
        setMsg({ type: "success", text: "Super distributor created successfully." });
      }

      await fetchSuperDistributors();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save super distributor." });
    }
  };

  const handleEdit = (distributor: SuperDistributorRecord) => {
    setEditingId(distributor.id);
    setFormData({
      name: distributor.name,
      contactPerson: distributor.contactPerson,
      contactNumber: distributor.contactNumber,
      orderEmail: distributor.orderEmail,
      photo: distributor.photo || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await superDistributorAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Super distributor status updated successfully." });
      await fetchSuperDistributors();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update super distributor status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this super distributor?")) {
      return;
    }

    try {
      await superDistributorAPI.delete(id);
      setMsg({ type: "success", text: "Super distributor deleted successfully." });
      await fetchSuperDistributors();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete super distributor." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Truck size={14} /> Top-tier supply</span>
          <h2 className="lm-page-title"><Truck size={22} /> Manage Super Distributors</h2>
          <p className="lm-page-subtitle">
            Maintain super distributor accounts with a cleaner operational layout, proper status handling, and no placeholder upload actions.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Account visibility</span>
            <span className="opw-hero-pill">Contact readiness</span>
            <span className="opw-hero-pill">Status control</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Accounts</span>
            <strong>{superDistributors.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Order Emails</span>
            <strong>{emailCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Photo Linked</span>
            <strong>{photoCount}</strong>
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
              <h3>Browse Super Distributors</h3>
              <p>Search across account and contact details, or use one status filter when you need a tighter operational view.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredSuperDistributors.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by account, contact, email, or status"
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
              {showForm ? "Hide Form" : "Add Super Distributor"}
            </button>
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchSuperDistributors()} disabled={loading}>
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
                <h3>{editingId ? "Edit Super Distributor" : "Create Super Distributor"}</h3>
                <p>Capture the account owner, contact line, commercial email, and optional photo URL in one cleaner form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Super Distributor Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter super distributor name"
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
            <div className="lm-field opw-form-span-2">
              <label className="lm-label">Photo URL</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Paste an optional photo URL"
                value={formData.photo}
                onChange={(event) => setFormData((current) => ({ ...current, photo: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Account" : "Save Account"}
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
              <h3>Super Distributor Directory</h3>
              <p>Review master accounts, commercial contacts, and current account status from a clearer operational table.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Accounts"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredSuperDistributors.length} accounts</span>
          <span>{emailCount} order emails configured</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Contact Person</th>
                <th>Contact Number</th>
                <th>Order Email</th>
                <th>Photo</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>Loading super distributors</h4>
                      <p>Pulling the latest super distributor account list.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSuperDistributors.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>No super distributors match this view</h4>
                      <p>Adjust the search or filters, or create a new account to expand the supply network.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedSuperDistributors.map((distributor) => (
                <tr key={distributor.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{distributor.name}</strong>
                      <small>Account #{distributor.id}</small>
                    </div>
                  </td>
                  <td>{distributor.contactPerson || "—"}</td>
                  <td>{distributor.contactNumber || "—"}</td>
                  <td>{distributor.orderEmail || "—"}</td>
                  <td>{distributor.photo ? "Photo linked" : "No photo"}</td>
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
                      <button type="button" className="opw-row-btn is-muted" onClick={() => void handleToggleStatus(distributor.id)}>
                        {distributor.status === "Active" ? "Deactivate" : "Activate"}
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

        {filteredSuperDistributors.length > 0 && (
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
