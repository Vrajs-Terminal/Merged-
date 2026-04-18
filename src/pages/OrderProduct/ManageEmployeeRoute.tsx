import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Navigation,
  Plus,
  RefreshCcw,
  Save,
  Search
} from "lucide-react";
import "./OrderProductWorkspace.css";

interface Employee {
  id: number;
  firstName?: string;
  lastName?: string;
  employeeId: string;
}

interface SalesRoute {
  id: number;
  routeName: string;
  city: { name: string };
  area: { name: string };
}

interface EmployeeRoute {
  id: number;
  status: string;
  assignedDate: string;
  route: SalesRoute;
  employee: Employee;
}

const ITEMS_PER_PAGE = 10;

export default function ManageEmployeeRoute() {
  const [assignments, setAssignments] = useState<EmployeeRoute[]>([]);
  const [routes, setRoutes] = useState<SalesRoute[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({ routeId: 0, employeeId: 0 });

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setFetching(true);
      const [assignRes, routesRes, employeesRes] = await Promise.all([
        axios.get("/api/geo/employee-routes"),
        axios.get("/api/geo/routes"),
        axios.get("/api/employees")
      ]);
      const safeAssignments = Array.isArray(assignRes?.data)
        ? assignRes.data
        : Array.isArray(assignRes?.data?.data)
          ? assignRes.data.data
          : [];
      const safeRoutes = Array.isArray(routesRes?.data)
        ? routesRes.data
        : Array.isArray(routesRes?.data?.data)
          ? routesRes.data.data
          : [];
      const rawEmployees = employeesRes?.data?.employees ?? employeesRes?.data?.data ?? employeesRes?.data;
      const safeEmployees = Array.isArray(rawEmployees) ? rawEmployees : [];

      setAssignments(safeAssignments);
      setRoutes(safeRoutes);
      setEmployees(safeEmployees);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to load assignment data: " + error.message });
    } finally {
      setFetching(false);
    }
  };

  const filteredAssignments = useMemo(
    () => assignments.filter((assignment) => {
      const employeeName = `${assignment.employee?.firstName || ""} ${assignment.employee?.lastName || ""}`.trim().toLowerCase();
      const routeName = assignment.route?.routeName?.toLowerCase() || "";
      const cityArea = `${assignment.route?.city?.name || ""} ${assignment.route?.area?.name || ""}`.toLowerCase();
      const query = searchTerm.toLowerCase();

      return (
        (!routeFilter || String(assignment.route?.id) === routeFilter) &&
        (!searchTerm
          || employeeName.includes(query)
          || assignment.employee?.employeeId?.toLowerCase().includes(query)
          || routeName.includes(query)
          || cityArea.includes(query))
      );
    }),
    [assignments, routeFilter, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedAssignments = useMemo(
    () => filteredAssignments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredAssignments]
  );

  const activeAssignments = assignments.filter((assignment) => assignment.status === "Active").length;
  const assignedRoutes = new Set(assignments.map((assignment) => assignment.route?.id).filter(Boolean)).size;
  const assignedEmployees = new Set(assignments.map((assignment) => assignment.employee?.id).filter(Boolean)).size;
  const visibleStart = filteredAssignments.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredAssignments.length);

  const handleAssign = async () => {
    if (!formData.routeId || !formData.employeeId) {
      setMsg({ type: "error", text: "Select both a route and an employee before assigning." });
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/geo/employee-routes", formData);
      await fetchData();
      setMsg({ type: "success", text: "Employee assigned to route successfully." });
      setFormData({ routeId: 0, employeeId: 0 });
      setShowForm(false);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to assign route: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><Navigation size={14} /> Assignment control</span>
          <h2 className="lm-page-title"><Navigation size={22} /> Employee Route Assignments</h2>
          <p className="lm-page-subtitle">
            Assign employees to sales routes from a cleaner control surface with search, filtering, and live assignment visibility.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Employee mapping</span>
            <span className="opw-hero-pill">Route visibility</span>
            <span className="opw-hero-pill">Live assignment tracking</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Assignments</span>
            <strong>{assignments.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Active</span>
            <strong>{activeAssignments}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Employees</span>
            <strong>{assignedEmployees}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Routes Covered</span>
            <strong>{assignedRoutes}</strong>
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
                <h3>Filter Assignments</h3>
                <p>Focus on one route or search across employees, route names, and locations.</p>
              </div>
            </div>
            <span className="opw-panel-badge">{filteredAssignments.length} visible</span>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Route Filter</label>
              <select
                className="lm-select"
                value={routeFilter}
                onChange={(event) => {
                  setRouteFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Routes</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName} ({route.city?.name} / {route.area?.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="opw-form-actions">
              <button
                type="button"
                className="opw-secondary-btn"
                onClick={() => {
                  setRouteFilter("");
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
                <p>Search the live assignment list, refresh data, or open the assign form.</p>
              </div>
            </div>
          </div>

          <div className="opw-toolbar">
            <div className="opw-toolbar-actions">
              <button type="button" className="opw-primary-btn" onClick={() => setShowForm((value) => !value)}>
                <Plus size={16} />
                {showForm ? "Hide Form" : "Assign Route"}
              </button>
              <button type="button" className="opw-secondary-btn" onClick={() => void fetchData()} disabled={fetching}>
                <RefreshCcw size={16} />
                {fetching ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            <div className="opw-search">
              <Search size={16} />
              <div>
                <label htmlFor="employee-route-search">Search assignments</label>
                <input
                  id="employee-route-search"
                  type="text"
                  className="lm-input"
                  placeholder="Search employee, route, city, or area"
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
                <h3>Assign Employee to Route</h3>
                <p>Pick an employee and a route, then create the live assignment record.</p>
              </div>
            </div>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Employee*</label>
              <select
                className="lm-select"
                value={formData.employeeId}
                onChange={(event) => setFormData((current) => ({ ...current, employeeId: Number(event.target.value) }))}
              >
                <option value={0}>Pick Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName || ""} {employee.lastName || ""} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Sales Route*</label>
              <select
                className="lm-select"
                value={formData.routeId}
                onChange={(event) => setFormData((current) => ({ ...current, routeId: Number(event.target.value) }))}
              >
                <option value={0}>Pick Route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.routeName} ({route.city?.name} / {route.area?.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={handleAssign} disabled={loading}>
                <Save size={16} />
                {loading ? "Assigning..." : "Assign Route"}
              </button>
              <button type="button" className="opw-secondary-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Navigation size={18} />
            <div>
              <h3>Assignment Directory</h3>
              <p>Review the live employee-route mapping with location and date context.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{fetching ? "Refreshing..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredAssignments.length} assignments</span>
          <span>{assignedRoutes} unique routes</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Route</th>
                <th>City / Area</th>
                <th>Assigned On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="opw-empty">
                      <h4>No assignments found</h4>
                      <p>Create an assignment or adjust the route filter to widen the list.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedAssignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{`${assignment.employee?.firstName || ""} ${assignment.employee?.lastName || ""}`.trim() || "—"}</strong>
                      <small>{assignment.employee?.employeeId || "No employee code"}</small>
                    </div>
                  </td>
                  <td>{assignment.route?.routeName}</td>
                  <td>{assignment.route?.city?.name} / {assignment.route?.area?.name}</td>
                  <td>{new Date(assignment.assignedDate).toLocaleDateString("en-IN")}</td>
                  <td>
                    <span className={`opw-status-badge ${assignment.status === "Active" ? "is-success" : "is-danger"}`}>
                      {assignment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length > 0 && (
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
