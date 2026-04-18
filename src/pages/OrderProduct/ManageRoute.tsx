import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Filter,
  Plus,
  RefreshCcw,
  Route,
  Save,
  Search,
  Trash2
} from "lucide-react";
import "./OrderProductWorkspace.css";

interface City {
  id: number;
  name: string;
}

interface Area {
  id: number;
  name: string;
  cityId: number;
}

interface SalesRoute {
  id: number;
  routeName: string;
  status: string;
  city: City;
  area: { id: number; name: string };
  employeeRoutes: { employee: { firstName?: string; lastName?: string; employeeId: string } }[];
}

const ITEMS_PER_PAGE = 10;

export default function ManageRoute() {
  const [routes, setRoutes] = useState<SalesRoute[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCityFilter, setSelectedCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({ routeName: "", cityId: 0, areaId: 0, status: "Active" });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [routesRes, citiesRes, areasRes] = await Promise.all([
        axios.get("/api/geo/routes"),
        axios.get("/api/geo/cities"),
        axios.get("/api/geo/areas")
      ]);
      const safeRoutes = Array.isArray(routesRes?.data)
        ? routesRes.data
        : Array.isArray(routesRes?.data?.data)
          ? routesRes.data.data
          : [];
      const safeCities = Array.isArray(citiesRes?.data)
        ? citiesRes.data
        : Array.isArray(citiesRes?.data?.data)
          ? citiesRes.data.data
          : [];
      const safeAreas = Array.isArray(areasRes?.data)
        ? areasRes.data
        : Array.isArray(areasRes?.data?.data)
          ? areasRes.data.data
          : [];
      setRoutes(safeRoutes);
      setCities(safeCities);
      setAreas(safeAreas);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to load route data: " + error.message });
    } finally {
      setFetching(false);
    }
  };

  const filteredAreas = useMemo(
    () => areas.filter((area) => !formData.cityId || area.cityId === formData.cityId),
    [areas, formData.cityId]
  );

  const filteredRoutes = useMemo(
    () => routes.filter((route) =>
      (!selectedCityFilter || route.city?.id?.toString() === selectedCityFilter) &&
      ((route.routeName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.area?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (route.city?.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [routes, searchTerm, selectedCityFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedRoutes = useMemo(
    () => filteredRoutes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredRoutes]
  );

  const activeRoutes = routes.filter((route) => route.status === "Active").length;
  const citiesCovered = new Set(routes.map((route) => route.city?.name).filter(Boolean)).size;
  const assignedEmployees = routes.reduce((sum, route) => sum + (route.employeeRoutes?.length || 0), 0);
  const visibleStart = filteredRoutes.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRoutes.length);

  const resetForm = () => {
    setFormData({ routeName: "", cityId: 0, areaId: 0, status: "Active" });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.routeName || !formData.cityId || !formData.areaId) {
      setMsg({ type: "error", text: "Route name, city, and area are required." });
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`/api/geo/routes/${editingId}`, formData);
      } else {
        await axios.post("/api/geo/routes", formData);
      }
      await fetchData();
      setMsg({ type: "success", text: editingId ? "Route updated successfully." : "Route created successfully." });
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to save route: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (route: SalesRoute) => {
    setFormData({ routeName: route.routeName, cityId: route.city.id, areaId: route.area.id, status: route.status });
    setEditingId(route.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this route?")) {
      return;
    }

    try {
      await axios.delete(`/api/geo/routes/${id}`);
      setRoutes((current) => current.filter((route) => route.id !== id));
      setMsg({ type: "success", text: "Route deleted successfully." });
    } catch {
      setMsg({ type: "error", text: "Failed to delete route." });
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Route size={14} /> Route operations</span>
          <h2 className="lm-page-title"><Route size={22} /> Manage Sales Routes</h2>
          <p className="lm-page-subtitle">
            Create, update, search, and review live route records with a clearer operational layout for day-to-day route management.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Route setup</span>
            <span className="opw-hero-pill">City and area coverage</span>
            <span className="opw-hero-pill">Assignment visibility</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Total Routes</span>
            <strong>{routes.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active Routes</span>
            <strong>{activeRoutes}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Cities Covered</span>
            <strong>{citiesCovered}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Assigned Employees</span>
            <strong>{assignedEmployees}</strong>
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

      <div className="opw-grid">
        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <Filter size={18} />
              <div>
                <h3>Filter Routes</h3>
                <p>Focus on one city or keep the entire route network visible.</p>
              </div>
            </div>
            <span className="opw-panel-badge">{filteredRoutes.length} visible</span>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">City Filter</label>
              <select
                className="lm-select"
                value={selectedCityFilter}
                onChange={(event) => {
                  setSelectedCityFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="opw-form-actions">
              <button
                type="button"
                className="opw-secondary-btn"
                onClick={() => {
                  setSelectedCityFilter("");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <Search size={18} />
              <div>
                <h3>Quick Actions</h3>
                <p>Search routes, refresh live data, or open the route form.</p>
              </div>
            </div>
          </div>

          <div className="opw-toolbar">
            <div className="opw-toolbar-actions">
              <button
                type="button"
                className="opw-primary-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                <Plus size={16} />
                Add Route
              </button>
              <button type="button" className="opw-secondary-btn" onClick={() => void fetchData()} disabled={fetching}>
                <RefreshCcw size={16} />
                {fetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="opw-search">
              <Search size={16} />
              <div>
                <label htmlFor="manage-route-search">Search routes</label>
                <input
                  id="manage-route-search"
                  type="text"
                  className="lm-input"
                  placeholder="Search by route, city, or area"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <Save size={18} />
              <div>
                <h3>{editingId ? "Edit Route" : "Create Route"}</h3>
                <p>Define the route name, city, area, and status from one clean form.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field opw-form-span-2">
              <label className="lm-label">Route Name*</label>
              <input
                className="lm-input"
                placeholder="Enter route name"
                value={formData.routeName}
                onChange={(event) => setFormData((current) => ({ ...current, routeName: event.target.value }))}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">City*</label>
              <select
                className="lm-select"
                value={formData.cityId}
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  cityId: Number(event.target.value),
                  areaId: 0
                }))}
              >
                <option value={0}>Select City</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Area*</label>
              <select
                className="lm-select"
                value={formData.areaId}
                onChange={(event) => setFormData((current) => ({ ...current, areaId: Number(event.target.value) }))}
              >
                <option value={0}>Select Area</option>
                {filteredAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Status</label>
              <select
                className="lm-select"
                value={formData.status}
                onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={handleSave} disabled={loading}>
                <Save size={16} />
                {loading ? "Saving..." : editingId ? "Update Route" : "Save Route"}
              </button>
              <button
                type="button"
                className="opw-secondary-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
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
            <Route size={18} />
            <div>
              <h3>Route Directory</h3>
              <p>Review route coverage, assigned headcount, and route status from the live database.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{fetching ? "Refreshing..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredRoutes.length} routes</span>
          <span>{assignedEmployees} employee assignments</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table opw-admin-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>City</th>
                <th>Area</th>
                <th>Assigned Employees</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRoutes.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="opw-empty">
                      <h4>No routes found</h4>
                      <p>Create a new route or adjust the active city filter to widen the directory.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRoutes.map((route) => (
                <tr key={route.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{route.routeName}</strong>
                      <small>{route.employeeRoutes?.length || 0} employees linked</small>
                    </div>
                  </td>
                  <td>{route.city?.name}</td>
                  <td>{route.area?.name}</td>
                  <td>
                    {route.employeeRoutes?.length
                      ? route.employeeRoutes
                        .slice(0, 2)
                        .map((entry) => `${entry.employee?.firstName || ""} ${entry.employee?.lastName || ""}`.trim())
                        .join(", ")
                      : "No assignments"}
                    {route.employeeRoutes?.length > 2 ? ` +${route.employeeRoutes.length - 2} more` : ""}
                  </td>
                  <td>
                    <span className={`opw-status-badge ${route.status === "Active" ? "is-success" : "is-danger"}`}>
                      {route.status}
                    </span>
                  </td>
                  <td>
                    <div className="opw-row-actions">
                      <button type="button" className="opw-row-btn is-info" onClick={() => handleEdit(route)}>
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button type="button" className="opw-row-btn is-danger" onClick={() => void handleDelete(route.id)}>
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

        {filteredRoutes.length > 0 && (
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
