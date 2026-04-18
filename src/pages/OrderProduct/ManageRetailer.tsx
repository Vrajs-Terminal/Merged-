import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Plus,
  RefreshCcw,
  Store,
  Trash2
} from "lucide-react";
import { distributorAPI, retailerAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface DistributorOption {
  id: number;
  name: string;
}

interface RetailerRecord {
  id: number;
  name: string;
  contactNumber?: string;
  distributorId?: number;
  distributor?: { id: number; name: string };
  area?: string;
  city?: string;
  retailerType?: string;
  state?: string;
  status?: "Active" | "Inactive";
}

const DEFAULT_RETAILER_TYPES = ["Grocery Store", "Super Market", "Medical Store", "Electronics Shop"];
const ITEMS_PER_PAGE = 10;

export default function ManageRetailer() {
  const [retailers, setRetailers] = useState<RetailerRecord[]>([]);
  const [distributors, setDistributors] = useState<DistributorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [distributorFilter, setDistributorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    distributorId: "",
    area: "",
    city: "",
    retailerType: "",
    state: ""
  });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [retailerResponse, distributorResponse] = await Promise.all([
        retailerAPI.getAll(1, 1000),
        distributorAPI.getAll(1, 1000)
      ]);

      setRetailers(extractApiList<RetailerRecord>(retailerResponse.data).rows);
      setDistributors(extractApiList<DistributorOption>(distributorResponse.data).rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load retailers." });
    } finally {
      setLoading(false);
    }
  };

  const distributorMap = useMemo(
    () => new Map(distributors.map((distributor) => [distributor.id, distributor.name])),
    [distributors]
  );

  const retailerTypes = useMemo(
    () => Array.from(new Set([...DEFAULT_RETAILER_TYPES, ...retailers.map((retailer) => retailer.retailerType).filter(Boolean) as string[]])).sort(),
    [retailers]
  );

  const filteredRetailers = useMemo(
    () => retailers.filter((retailer) => {
      const linkedDistributorId = retailer.distributorId || retailer.distributor?.id;
      const distributorName = retailer.distributor?.name || distributorMap.get(linkedDistributorId || 0);

      return (
        (!distributorFilter || String(linkedDistributorId || "") === distributorFilter) &&
        (!typeFilter || retailer.retailerType === typeFilter) &&
        (!statusFilter || retailer.status === statusFilter) &&
        buildSearchText(
          retailer.name,
          retailer.contactNumber,
          retailer.area,
          retailer.city,
          retailer.state,
          retailer.retailerType,
          distributorName
        ).includes(searchTerm.toLowerCase())
      );
    }),
    [distributorFilter, distributorMap, retailers, searchTerm, statusFilter, typeFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRetailers.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRetailers = useMemo(
    () => filteredRetailers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredRetailers]
  );

  const activeCount = retailers.filter((retailer) => retailer.status === "Active").length;
  const cityCount = new Set(retailers.map((retailer) => retailer.city).filter(Boolean)).size;
  const linkedDistributorCount = new Set(retailers.map((retailer) => retailer.distributorId || retailer.distributor?.id).filter(Boolean)).size;
  const visibleStart = filteredRetailers.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRetailers.length);

  const resetForm = () => {
    setFormData({
      name: "",
      contactNumber: "",
      distributorId: "",
      area: "",
      city: "",
      retailerType: "",
      state: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMsg({ type: "error", text: "Retailer name is required." });
      return;
    }

    const payload = {
      name: formData.name,
      contactNumber: formData.contactNumber,
      distributorId: formData.distributorId ? Number(formData.distributorId) : undefined,
      area: formData.area,
      city: formData.city,
      retailerType: formData.retailerType,
      state: formData.state
    };

    try {
      if (editingId) {
        await retailerAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Retailer updated successfully." });
      } else {
        await retailerAPI.create(payload);
        setMsg({ type: "success", text: "Retailer created successfully." });
      }

      await fetchData();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save retailer." });
    }
  };

  const handleEdit = (retailer: RetailerRecord) => {
    setEditingId(retailer.id);
    setFormData({
      name: retailer.name,
      contactNumber: retailer.contactNumber || "",
      distributorId: String(retailer.distributorId || retailer.distributor?.id || ""),
      area: retailer.area || "",
      city: retailer.city || "",
      retailerType: retailer.retailerType || "",
      state: retailer.state || ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await retailerAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Retailer status updated successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update retailer status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this retailer?")) {
      return;
    }

    try {
      await retailerAPI.delete(id);
      setMsg({ type: "success", text: "Retailer deleted successfully." });
      await fetchData();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete retailer." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Store size={14} /> Retail network</span>
          <h2 className="lm-page-title"><Store size={22} /> Manage Retailers</h2>
          <p className="lm-page-subtitle">
            Maintain the retailer network with only the filters that matter, clearer distributor linking, and row actions that all do real work.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Distributor-linked records</span>
            <span className="opw-hero-pill">Status control</span>
            <span className="opw-hero-pill">Operational search</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Retailers</span>
            <strong>{retailers.length}</strong>
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
            <span>Distributors Linked</span>
            <strong>{linkedDistributorCount}</strong>
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
            <Store size={18} />
            <div>
              <h3>Browse Retailers</h3>
              <p>Search across retailer details, or narrow the list with the few filters that actually help day-to-day operations.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredRetailers.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by retailer, location, distributor, contact, or type"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <select
              className="lm-select"
              value={distributorFilter}
              onChange={(event) => {
                setDistributorFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Distributors</option>
              {distributors.map((distributor) => (
                <option key={distributor.id} value={distributor.id}>
                  {distributor.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer Type</label>
            <select
              className="lm-select"
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Types</option>
              {retailerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
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
              {showForm ? "Hide Form" : "Add Retailer"}
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
                setDistributorFilter("");
                setTypeFilter("");
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
                <h3>{editingId ? "Edit Retailer" : "Create Retailer"}</h3>
                <p>Capture core retailer and distributor-linking details without overloading the page with unnecessary fields or actions.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Retailer Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter retailer name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
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
              <label className="lm-label">Distributor</label>
              <select
                className="lm-select"
                value={formData.distributorId}
                onChange={(event) => setFormData((current) => ({ ...current, distributorId: event.target.value }))}
              >
                <option value="">Select distributor</option>
                {distributors.map((distributor) => (
                  <option key={distributor.id} value={distributor.id}>
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Retailer Type</label>
              <select
                className="lm-select"
                value={formData.retailerType}
                onChange={(event) => setFormData((current) => ({ ...current, retailerType: event.target.value }))}
              >
                <option value="">Select type</option>
                {retailerTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Area</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter area"
                value={formData.area}
                onChange={(event) => setFormData((current) => ({ ...current, area: event.target.value }))}
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
              <label className="lm-label">State</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter state"
                value={formData.state}
                onChange={(event) => setFormData((current) => ({ ...current, state: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Retailer" : "Save Retailer"}
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
            <Store size={18} />
            <div>
              <h3>Retailer Directory</h3>
              <p>Review retailer coverage, distributor mapping, and activation status from a cleaner operational table.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Network"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredRetailers.length} retailers</span>
          <span>{linkedDistributorCount} distributors linked</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Retailer</th>
                <th>Distributor</th>
                <th>Location</th>
                <th>Contact</th>
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
                      <h4>Loading retailers</h4>
                      <p>Pulling the latest retailer network from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRetailers.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>No retailers match this view</h4>
                      <p>Adjust the search or filters, or create a new retailer to expand the network.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRetailers.map((retailer) => {
                const distributorName = retailer.distributor?.name || distributorMap.get(retailer.distributorId || 0) || "Unlinked";

                return (
                  <tr key={retailer.id}>
                    <td>
                      <div className="opw-entity">
                        <strong>{retailer.name}</strong>
                        <small>Retailer #{retailer.id}</small>
                      </div>
                    </td>
                    <td>{distributorName}</td>
                    <td>
                      <div className="opw-entity">
                        <strong>{retailer.city || "—"}</strong>
                        <small>{[retailer.area, retailer.state].filter(Boolean).join(", ") || "No area/state"}</small>
                      </div>
                    </td>
                    <td>{retailer.contactNumber || "—"}</td>
                    <td>{retailer.retailerType || "—"}</td>
                    <td>
                      <span className={`opw-status-badge ${getStatusTone(retailer.status)}`}>
                        {retailer.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <div className="opw-row-actions">
                        <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(retailer)}>
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button type="button" className="opw-row-btn is-muted" onClick={() => void handleToggleStatus(retailer.id)}>
                          {retailer.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(retailer.id)}>
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

        {filteredRetailers.length > 0 && (
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
