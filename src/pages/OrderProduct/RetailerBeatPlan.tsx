import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Map,
  Plus,
  RefreshCcw,
  Trash2
} from "lucide-react";
import { beatPlanAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList, getStatusTone } from "./orderProductWorkspaceHelpers";

interface BeatPlanRecord {
  id: number;
  employeeId?: number;
  name: string;
  weekDay: string;
  retailerCount?: number;
  city?: string;
  status?: "Active" | "Inactive";
}

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const ITEMS_PER_PAGE = 10;

export default function RetailerBeatPlan() {
  const [beatPlans, setBeatPlans] = useState<BeatPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [weekDayFilter, setWeekDayFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    weekDay: "",
    city: "",
    retailerCount: ""
  });

  useEffect(() => {
    void fetchBeatPlans();
  }, []);

  const fetchBeatPlans = async () => {
    try {
      setLoading(true);
      const response = await beatPlanAPI.getAll(1, 1000);
      const { rows } = extractApiList<BeatPlanRecord>(response.data);
      setBeatPlans(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load retailer beat plans." });
    } finally {
      setLoading(false);
    }
  };

  const filteredBeatPlans = useMemo(
    () => beatPlans.filter((plan) =>
      (!weekDayFilter || plan.weekDay === weekDayFilter) &&
      (!cityFilter || (plan.city || "").toLowerCase().includes(cityFilter.toLowerCase())) &&
      buildSearchText(plan.name, plan.city, plan.weekDay, plan.status).includes(searchTerm.toLowerCase())
    ),
    [beatPlans, cityFilter, searchTerm, weekDayFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBeatPlans.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedBeatPlans = useMemo(
    () => filteredBeatPlans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredBeatPlans]
  );

  const activeCount = beatPlans.filter((plan) => plan.status === "Active").length;
  const coveredCities = new Set(beatPlans.map((plan) => plan.city).filter(Boolean)).size;
  const retailerCoverage = beatPlans.reduce((sum, plan) => sum + (plan.retailerCount || 0), 0);
  const visibleStart = filteredBeatPlans.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredBeatPlans.length);

  const resetForm = () => {
    setFormData({
      name: "",
      weekDay: "",
      city: "",
      retailerCount: ""
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.weekDay) {
      setMsg({ type: "error", text: "Beat plan name and week day are required." });
      return;
    }

    const payload = {
      name: formData.name,
      weekDay: formData.weekDay,
      city: formData.city,
      retailerCount: formData.retailerCount ? Number(formData.retailerCount) : 0
    };

    try {
      if (editingId) {
        await beatPlanAPI.update(editingId, payload);
        setMsg({ type: "success", text: "Retailer beat plan updated successfully." });
      } else {
        await beatPlanAPI.create(payload);
        setMsg({ type: "success", text: "Retailer beat plan created successfully." });
      }

      await fetchBeatPlans();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to save retailer beat plan." });
    }
  };

  const handleEdit = (plan: BeatPlanRecord) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      weekDay: plan.weekDay,
      city: plan.city || "",
      retailerCount: plan.retailerCount ? String(plan.retailerCount) : ""
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await beatPlanAPI.toggleStatus(id);
      setMsg({ type: "success", text: "Retailer beat plan status updated successfully." });
      await fetchBeatPlans();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to update retailer beat plan status." });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this retailer beat plan?")) {
      return;
    }

    try {
      await beatPlanAPI.delete(id);
      setMsg({ type: "success", text: "Retailer beat plan deleted successfully." });
      await fetchBeatPlans();
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to delete retailer beat plan." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Map size={14} /> Visit planning</span>
          <h2 className="lm-page-title"><Map size={22} /> Retailer Beat Plan</h2>
          <p className="lm-page-subtitle">
            Manage city-wise visit plans with weekday scheduling, retailer coverage counts, and cleaner status handling in one workspace.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Weekday planning</span>
            <span className="opw-hero-pill">City coverage</span>
            <span className="opw-hero-pill">Retailer count visibility</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Plans</span>
            <strong>{beatPlans.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Cities Covered</span>
            <strong>{coveredCities}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Retailer Coverage</span>
            <strong>{retailerCoverage}</strong>
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
            <Map size={18} />
            <div>
              <h3>Browse Beat Plans</h3>
              <p>Use one weekday selector, one city field, and search to keep the page fast and operationally focused.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredBeatPlans.length} visible</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field opw-form-span-2">
            <label className="lm-label">Search</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Search by plan name, city, week day, or status"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Week Day</label>
            <select
              className="lm-select"
              value={weekDayFilter}
              onChange={(event) => {
                setWeekDayFilter(event.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Days</option>
              {WEEK_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">City</label>
            <input
              type="text"
              className="lm-input"
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(event) => {
                setCityFilter(event.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
              <Plus size={16} />
              {showForm ? "Hide Form" : "Add Beat Plan"}
            </button>
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchBeatPlans()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              className="opw-secondary-btn"
              onClick={() => {
                setSearchTerm("");
                setWeekDayFilter("");
                setCityFilter("");
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
                <h3>{editingId ? "Edit Beat Plan" : "Create Beat Plan"}</h3>
                <p>Define the visit day, city, and retailer volume in a much cleaner beat-plan form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Beat Plan Name</label>
              <input
                type="text"
                className="lm-input"
                placeholder="Enter beat plan name"
                value={formData.name}
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Week Day</label>
              <select
                className="lm-select"
                value={formData.weekDay}
                onChange={(event) => setFormData((current) => ({ ...current, weekDay: event.target.value }))}
              >
                <option value="">Select day</option>
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
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
              <label className="lm-label">Retailer Count</label>
              <input
                type="number"
                className="lm-input"
                placeholder="Enter retailer count"
                value={formData.retailerCount}
                onChange={(event) => setFormData((current) => ({ ...current, retailerCount: event.target.value }))}
              />
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={() => void handleSave()}>
                {editingId ? "Update Beat Plan" : "Save Beat Plan"}
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
            <Map size={18} />
            <div>
              <h3>Beat Plan Directory</h3>
              <p>Review weekday planning, retailer volume, and operational status from one cleaner table.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : "Live Plans"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredBeatPlans.length} plans</span>
          <span>{retailerCoverage} retailers mapped</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Beat Plan</th>
                <th>Week Day</th>
                <th>City</th>
                <th className="opw-value-cell">Retailers</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="opw-empty">
                      <h4>Loading retailer beat plans</h4>
                      <p>Pulling the latest day-wise visit planning records.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedBeatPlans.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="opw-empty">
                      <h4>No beat plans match this view</h4>
                      <p>Clear the filters or create a new beat plan to expand route planning.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedBeatPlans.map((plan) => (
                <tr key={plan.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{plan.name}</strong>
                      <small>Plan #{plan.id}</small>
                    </div>
                  </td>
                  <td>{plan.weekDay || "—"}</td>
                  <td>{plan.city || "—"}</td>
                  <td className="opw-value-cell">{plan.retailerCount || 0}</td>
                  <td>
                    <span className={`opw-status-badge ${getStatusTone(plan.status)}`}>
                      {plan.status || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <div className="opw-row-actions">
                      <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(plan)}>
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button type="button" className="opw-row-btn is-muted" onClick={() => void handleToggleStatus(plan.id)}>
                        {plan.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(plan.id)}>
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

        {filteredBeatPlans.length > 0 && (
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
