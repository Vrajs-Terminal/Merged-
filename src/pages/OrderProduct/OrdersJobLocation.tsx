import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RefreshCcw,
  Search
} from "lucide-react";
import { jobLocationAPI } from "../../services/apiService";
import "./OrderProductWorkspace.css";
import { buildSearchText, extractApiList } from "./orderProductWorkspaceHelpers";

interface JobLocation {
  id: number;
  employeeId?: number;
  branch?: string;
  department?: string;
  states?: string;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersJobLocation() {
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    void fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await jobLocationAPI.getAll(1, 1000);
      const { rows } = extractApiList<JobLocation>(response.data);
      setLocations(rows);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to load job locations." });
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = useMemo(
    () => locations.filter((location) =>
      buildSearchText(
        location.employeeId,
        location.branch,
        location.department,
        location.states
      ).includes(searchTerm.toLowerCase())
    ),
    [locations, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredLocations.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedLocations = useMemo(
    () => filteredLocations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredLocations]
  );

  const uniqueEmployees = new Set(locations.map((location) => location.employeeId).filter(Boolean)).size;
  const uniqueBranches = new Set(locations.map((location) => location.branch).filter(Boolean)).size;
  const uniqueStates = new Set(
    locations
      .flatMap((location) => (location.states || "").split(","))
      .map((state) => state.trim())
      .filter(Boolean)
  ).size;
  const visibleStart = filteredLocations.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredLocations.length);

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><MapPin size={14} /> Operational coverage</span>
          <h2 className="lm-page-title"><MapPin size={22} /> Orders Job Location</h2>
          <p className="lm-page-subtitle">
            Review the branches, departments, and service-state assignments used for order operations from one cleaner location register.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Read-only reference</span>
            <span className="opw-hero-pill">Fast search</span>
            <span className="opw-hero-pill">Branch visibility</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Locations</span>
            <strong>{locations.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Employees</span>
            <strong>{uniqueEmployees}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Branches</span>
            <strong>{uniqueBranches}</strong>
          </div>
          <div className="opw-stat-card">
            <span>States</span>
            <strong>{uniqueStates}</strong>
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
              <label htmlFor="job-location-search">Search locations</label>
              <input
                id="job-location-search"
                type="text"
                className="lm-input"
                placeholder="Search by employee, branch, department, or state"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="opw-toolbar-actions">
            <button type="button" className="opw-secondary-btn" onClick={() => void fetchLocations()} disabled={loading}>
              <RefreshCcw size={16} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <MapPin size={18} />
            <div>
              <h3>Location Register</h3>
              <p>Track which branches and state assignments are attached to the operational order team.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{loading ? "Loading..." : `${filteredLocations.length} visible`}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredLocations.length} locations</span>
          <span>{uniqueStates} unique states covered</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Branch</th>
                <th>Department</th>
                <th>States</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>
                    <div className="opw-empty">
                      <h4>Loading job locations</h4>
                      <p>Pulling the latest operational coverage entries.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLocations.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="opw-empty">
                      <h4>No matching locations</h4>
                      <p>Try a broader search term or refresh the latest location register.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLocations.map((location) => (
                <tr key={location.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{location.employeeId || "—"}</strong>
                      <small>Employee ID</small>
                    </div>
                  </td>
                  <td>{location.branch || "—"}</td>
                  <td>{location.department || "—"}</td>
                  <td>{location.states || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLocations.length > 0 && (
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
