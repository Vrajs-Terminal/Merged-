import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  MapPin,
  Pause,
  Play,
  RefreshCcw,
  Search
} from "lucide-react";
import "./OrderProductWorkspace.css";
import {
  copyRowsToClipboard,
  downloadRowsAsCsv,
  exportRowsToExcel,
  exportRowsToPdf,
  formatDate,
  formatDateTime
} from "./orderProductReportHelpers";

interface RouteVisit {
  id: number;
  retailer: string;
  visitScheduledDate: string;
  visitStartDate: string;
  visitEndDate: string;
  totalTime: string;
  status: "Completed" | "Pending" | "Cancelled";
  inRange: "Yes" | "No";
  remark: string;
  purpose: string;
  route: string;
  employeeName: string;
}

interface Employee {
  id: number;
  firstName?: string;
  lastName?: string;
  employeeId: string;
}

const ITEMS_PER_PAGE = 8;

export default function OrderRouteMap() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [routeVisits, setRouteVisits] = useState<RouteVisit[]>([]);

  useEffect(() => {
    axios.get("/api/employees")
      .then((response) => setEmployees(response.data.employees || response.data || []))
      .catch(() => {
        setMsg({ type: "error", text: "Failed to load employees." });
      });
  }, []);

  const selectedEmployeeData = useMemo(
    () => employees.find((employee) => employee.id === Number(selectedEmployee)) || null,
    [employees, selectedEmployee]
  );

  const filteredVisits = useMemo(
    () => routeVisits.filter((visit) =>
      visit.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [routeVisits, searchTerm]
  );

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedVisits = useMemo(
    () => filteredVisits.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredVisits]
  );

  const completedVisits = filteredVisits.filter((visit) => visit.status === "Completed").length;
  const pendingVisits = filteredVisits.filter((visit) => visit.status === "Pending").length;
  const coveredRoutes = new Set(filteredVisits.map((visit) => visit.route)).size;
  const visibleStart = filteredVisits.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredVisits.length);

  const exportRows = useMemo(
    () => filteredVisits.map((visit) => ({
      retailer: visit.retailer,
      route: visit.route,
      scheduled_date: visit.visitScheduledDate,
      visit_start: visit.visitStartDate,
      visit_end: visit.visitEndDate,
      total_time: visit.totalTime,
      status: visit.status,
      in_range: visit.inRange,
      purpose: visit.purpose,
      remark: visit.remark,
      employee: visit.employeeName
    })),
    [filteredVisits]
  );

  const exportKeys = [
    "retailer",
    "route",
    "scheduled_date",
    "visit_start",
    "visit_end",
    "total_time",
    "status",
    "in_range",
    "purpose",
    "remark",
    "employee"
  ];

  const handleGetData = async () => {
    if (!selectedEmployee || !selectedDate) {
      setMsg({ type: "error", text: "Select both an employee and a date to load route activity." });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`/api/orders?page=1&limit=1000&employeeId=${selectedEmployee}&date=${selectedDate}`);
      const orders = response.data.orders || response.data || [];
      const mappedVisits: RouteVisit[] = orders.map((order: any) => ({
        id: order.id,
        retailer: order.retailer?.businessName || "—",
        visitScheduledDate: formatDate(selectedDate),
        visitStartDate: formatDateTime(order.createdAt),
        visitEndDate: "—",
        totalTime: "—",
        status: order.status === "Delivered" || order.status === "Approved" ? "Completed" : "Pending",
        inRange: "Yes",
        remark: order.remarks || "—",
        purpose: order.orderSource || "Sales",
        route: order.route?.routeName || "Unassigned Route",
        employeeName: `${order.employee?.firstName || ""} ${order.employee?.lastName || ""}`.trim() || "—"
      }));

      setRouteVisits(mappedVisits);
      setCurrentPage(1);
      setMsg({
        type: "success",
        text: `Loaded ${mappedVisits.length} route activities for ${selectedEmployeeData?.firstName || "the selected employee"} on ${formatDate(selectedDate)}.`
      });
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to load route data: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedEmployee("");
    setSelectedDate("");
    setSearchTerm("");
    setCurrentPage(1);
    setRouteVisits([]);
    setIsPlaying(false);
    setMsg(null);
  };

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Route summary copied to clipboard." : "No route activity available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "order_route_map", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Route summary exported as CSV." : "No route activity available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "order_route_map", "Route Map");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Route summary exported to Excel." : "No route activity available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "order_route_map", "Order Route Map", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Route summary exported to PDF." : "No route activity available to export."
    });
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><MapPin size={14} /> Field movement intelligence</span>
          <h2 className="lm-page-title"><MapPin size={22} /> Order Route Map</h2>
          <p className="lm-page-subtitle">
            Review employee route activity, visit outcomes, and order coverage from one cleaner route-ops workspace.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Playback controls</span>
            <span className="opw-hero-pill">Visit summary export</span>
            <span className="opw-hero-pill">Employee day view</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Visits Loaded</span>
            <strong>{filteredVisits.length}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Completed</span>
            <strong>{completedVisits}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Pending</span>
            <strong>{pendingVisits}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Routes Covered</span>
            <strong>{coveredRoutes}</strong>
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
              <RefreshCcw size={18} />
              <div>
                <h3>Load Route Activity</h3>
                <p>Select an employee and date, then pull the day’s route-driven order activity.</p>
              </div>
            </div>
            <span className="opw-panel-badge">{employees.length} employees</span>
          </div>

          <div className="opw-form-grid">
            <div className="lm-field">
              <label className="lm-label">Employee*</label>
              <select
                className="lm-select"
                value={selectedEmployee}
                onChange={(event) => setSelectedEmployee(event.target.value)}
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Date*</label>
              <input
                type="date"
                className="lm-input"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>

            <div className="opw-form-actions">
              <button type="button" className="opw-primary-btn" onClick={handleGetData} disabled={loading}>
                <RefreshCcw size={16} />
                {loading ? "Loading..." : "Get Route Data"}
              </button>
              <button type="button" className="opw-secondary-btn" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <MapPin size={18} />
              <div>
                <h3>Route Snapshot</h3>
                <p>A focused summary of the employee and day currently under review.</p>
              </div>
            </div>
          </div>

          <div className="orm-summary-list">
            <div className="orm-summary-item">
              <span>Employee</span>
              <strong>{selectedEmployeeData ? `${selectedEmployeeData.firstName || ""} ${selectedEmployeeData.lastName || ""}`.trim() : "Not selected"}</strong>
            </div>
            <div className="orm-summary-item">
              <span>Employee ID</span>
              <strong>{selectedEmployeeData?.employeeId || "—"}</strong>
            </div>
            <div className="orm-summary-item">
              <span>Report Date</span>
              <strong>{selectedDate ? formatDate(selectedDate) : "Choose a date"}</strong>
            </div>
            <div className="orm-summary-item">
              <span>Playback</span>
              <strong>{isPlaying ? `Playing at ${playSpeed}x` : "Paused"}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="orm-layout">
        <div className="lm-card opw-panel">
          <div className="opw-panel-head">
            <div className="opw-panel-title">
              <MapPin size={18} />
              <div>
                <h3>Route Map Canvas</h3>
                <p>This screen is ready for Google Maps or GPS playback when live location data is connected.</p>
              </div>
            </div>
            <span className="opw-panel-badge is-info">{filteredVisits.length} stops</span>
          </div>

          <div className="orm-map-shell">
            <div className="orm-map-placeholder">
              <div className="orm-map-placeholder-content">
                <MapPin size={52} />
                <h4>{filteredVisits.length > 0 ? "Route data loaded" : "Map waiting for route data"}</h4>
                <p>
                  {filteredVisits.length > 0
                    ? `Showing ${filteredVisits.length} visit records for ${selectedEmployeeData?.firstName || "the selected employee"} on ${formatDate(selectedDate)}.`
                    : "Select an employee and date, then load the day view to populate the route playback workspace."}
                </p>
                <div className="orm-route-hints">
                  <span className="orm-route-hint">Employee route tracking</span>
                  <span className="orm-route-hint">Visit verification</span>
                  <span className="orm-route-hint">Order-linked map points</span>
                </div>
              </div>
            </div>

            <div className="opw-panel">
              <div className="opw-panel-head">
                <div className="opw-panel-title">
                  <Play size={18} />
                  <div>
                    <h3>Playback Controls</h3>
                    <p>Pause or resume route playback and change the simulation speed.</p>
                  </div>
                </div>
              </div>
              <div className="orm-playback">
                <button
                  type="button"
                  className={isPlaying ? "opw-danger-btn" : "opw-primary-btn"}
                  onClick={() => setIsPlaying((value) => !value)}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? "Pause Playback" : "Start Playback"}
                </button>
                <div className="lm-field">
                  <label className="lm-label">Speed</label>
                  <select
                    className="lm-select"
                    value={playSpeed}
                    onChange={(event) => setPlaySpeed(Number(event.target.value))}
                  >
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="opw-panel">
              <div className="opw-panel-head">
                <div className="opw-panel-title">
                  <MapPin size={18} />
                  <div>
                    <h3>Map Indicators</h3>
                    <p>Legend placeholders for future GPS or Google Maps marker states.</p>
                  </div>
                </div>
              </div>
              <div className="orm-legend">
                <div className="orm-legend-item"><span className="orm-legend-dot is-visit" /> Visit</div>
                <div className="orm-legend-item"><span className="orm-legend-dot is-order" /> Order Placed</div>
                <div className="orm-legend-item"><span className="orm-legend-dot is-no-order" /> No Order</div>
                <div className="orm-legend-item"><span className="orm-legend-dot is-punch-in" /> Punch In</div>
                <div className="orm-legend-item"><span className="orm-legend-dot is-punch-out" /> Punch Out</div>
                <div className="orm-legend-item"><span className="orm-legend-dot is-last-location" /> Last Location</div>
              </div>
            </div>
          </div>
        </div>

        <div className="orm-side-stack">
          <div className="opw-metric-grid">
            <div className="opw-metric-card is-info">
              <span className="opw-metric-label">Visits</span>
              <strong className="opw-metric-value">{filteredVisits.length}</strong>
              <span className="opw-metric-note">Records loaded for the selected employee/date.</span>
            </div>
            <div className="opw-metric-card is-success">
              <span className="opw-metric-label">Orders</span>
              <strong className="opw-metric-value">{completedVisits}</strong>
              <span className="opw-metric-note">Completed order-related stops.</span>
            </div>
            <div className="opw-metric-card is-warning">
              <span className="opw-metric-label">Pending Stops</span>
              <strong className="opw-metric-value">{pendingVisits}</strong>
              <span className="opw-metric-note">Route points still awaiting completion.</span>
            </div>
          </div>

          <div className="lm-card opw-panel">
            <div className="opw-panel-head">
              <div className="opw-panel-title">
                <Search size={18} />
                <div>
                  <h3>Why This View Helps</h3>
                  <p>Keep route ops, productivity tracking, and field visibility aligned.</p>
                </div>
              </div>
            </div>
            <div className="orm-benefits">
              <div className="orm-benefit-card">
                <h4>Track field movement</h4>
                <p>Understand where employees worked and which routes were actually covered.</p>
              </div>
              <div className="orm-benefit-card">
                <h4>Monitor visit productivity</h4>
                <p>See completed versus pending retail visits in one scan-friendly report.</p>
              </div>
              <div className="orm-benefit-card">
                <h4>Validate field execution</h4>
                <p>Prepare this screen for stronger GPS validation when location data is connected.</p>
              </div>
              <div className="orm-benefit-card">
                <h4>Replay route activity</h4>
                <p>Playback controls support route storytelling during reviews and audits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <MapPin size={18} />
            <div>
              <h3>Route Summary</h3>
              <p>Search, export, and review the loaded visit records with clearer status visibility.</p>
            </div>
          </div>
          <div className="opw-toolbar-actions">
            <button type="button" className="opw-secondary-btn" onClick={() => void handleCopy()}>
              <Copy size={16} />
              Copy
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleCsvExport}>
              CSV
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleExcelExport}>
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button type="button" className="opw-primary-btn" onClick={handlePdfExport}>
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

        <div className="opw-toolbar">
          <div className="opw-search">
            <Search size={16} />
            <div>
              <label htmlFor="order-route-map-search">Search route visits</label>
              <input
                id="order-route-map-search"
                type="text"
                className="lm-input"
                placeholder="Search retailer, route, or employee"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredVisits.length} route records</span>
          <span>{selectedEmployeeData ? `${selectedEmployeeData.firstName || ""} ${selectedEmployeeData.lastName || ""}`.trim() : "No employee selected"}</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Retailer</th>
                <th>Route</th>
                <th>Scheduled Date</th>
                <th>Visit Start</th>
                <th>Total Time</th>
                <th>Status</th>
                <th>In Range</th>
                <th>Purpose</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisits.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="opw-empty">
                      <h4>No route activity loaded</h4>
                      <p>Select an employee and date, then load the route view to review field activity.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedVisits.map((visit) => (
                <tr key={visit.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{visit.retailer}</strong>
                      <small>{visit.employeeName}</small>
                    </div>
                  </td>
                  <td>{visit.route}</td>
                  <td>{visit.visitScheduledDate}</td>
                  <td>{visit.visitStartDate}</td>
                  <td>{visit.totalTime}</td>
                  <td>
                    <span className={`opw-status-badge ${visit.status === "Completed" ? "is-success" : visit.status === "Pending" ? "is-warning" : "is-danger"}`}>
                      {visit.status}
                    </span>
                  </td>
                  <td>
                    <span className={`opw-status-badge ${visit.inRange === "Yes" ? "is-success" : "is-danger"}`}>
                      {visit.inRange}
                    </span>
                  </td>
                  <td>{visit.purpose}</td>
                  <td>{visit.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVisits.length > 0 && (
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
