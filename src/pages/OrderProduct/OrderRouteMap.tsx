import { useState, useEffect } from "react";
import axios from "axios";
import {
  MapPin,
  Play,
  Pause,
  Search,
  CheckCircle,
  AlertCircle,
  Copy,
  FileText
} from "lucide-react";

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

interface Employee { id: number; firstName?: string; lastName?: string; employeeId: string }

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
  const [activityStats, setActivityStats] = useState({ visits: 0, orders: 0 });

  useEffect(() => {
    axios.get('/api/employees').then(r => setEmployees(r.data.employees || r.data || [])).catch(() => {});
  }, []);

  const itemsPerPage = 10;
  const filteredVisits = routeVisits.filter(v =>
    v.retailer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.route.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedVisits = filteredVisits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);

  const handleGetData = async () => {
    if (!selectedEmployee || !selectedDate) {
      setMsg({ type: "error", text: "Please select both employee and date!" });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders?page=1&limit=1000&employeeId=${selectedEmployee}&date=${selectedDate}`);
      const orders = res.data.orders || res.data || [];
      // Map orders into route visits display format
      const mapped: RouteVisit[] = orders.map((o: any) => ({
        id: o.id,
        retailer: o.retailer?.businessName || '—',
        visitScheduledDate: selectedDate,
        visitStartDate: new Date(o.createdAt).toLocaleString(),
        visitEndDate: '—',
        totalTime: '—',
        status: o.status === 'Delivered' || o.status === 'Approved' ? 'Completed' : 'Pending' as "Completed" | "Pending" | "Cancelled",
        inRange: 'Yes' as "Yes" | "No",
        remark: o.remarks || '—',
        purpose: 'Sales',
        route: o.route?.routeName || '—',
        employeeName: `${o.employee?.firstName || ''} ${o.employee?.lastName || ''}`.trim()
      }));
      setRouteVisits(mapped);
      setActivityStats({ visits: mapped.length, orders: orders.filter((o: any) => o.status !== 'Cancelled').length });
      setMsg({ type: "success", text: `Loaded ${mapped.length} orders for selected employee on ${selectedDate}` });
    } catch (e: any) {
      setMsg({ type: "error", text: "Failed to load route data: " + e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><MapPin size={22} /> Order Route Map</h2>
          <p className="lm-page-subtitle">Track employee movement, visits, orders, and route activity on map</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters and Employee Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Left: Filters and Map */}
        <div>
          {/* Filters */}
          <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
            <div className="lm-card-title">Filters</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="lm-field">
                <label className="lm-label">Employee*</label>
                <select
                  className="lm-select"
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>
              <div className="lm-field">
                <label className="lm-label">Date*</label>
                <input
                  type="date"
                  className="lm-input"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              <button
                className="lm-btn-primary"
                onClick={handleGetData}
                disabled={loading}
                style={{
                  gridColumn: "1 / -1",
                  padding: "0.7rem 1rem",
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#4f46e5";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#6366f1";
                  }
                }}
              >
                {loading ? "Loading..." : "Get Data"}
              </button>
            </div>
          </div>

          {/* Map Area */}
          <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
            <div className="lm-card-title">Route Map</div>
            <div style={{
              width: "100%",
              height: "400px",
              backgroundColor: "#f3f4f6",
              borderRadius: "0.375rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #cbd5e1",
              position: "relative"
            }}>
              <div style={{ textAlign: "center", color: "#6b7280" }}>
                <MapPin size={48} style={{ margin: "0 auto 1rem" }} />
                <p style={{ fontSize: "0.875rem" }}>Google Map Integration</p>
                <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Select employee and date to view route</p>
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
            <div className="lm-card-title">Map Activity Indicators</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#3b82f6", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>Visit</span>
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#10b981", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>Order Placed</span>
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#f59e0b", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>No Order</span>
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#06b6d4", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>Punch In</span>
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#ec4899", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>Punch Out</span>
              </div>
              <div style={{ fontSize: "0.85rem" }}>
                <span style={{ display: "inline-block", width: "20px", height: "20px", backgroundColor: "#8b5cf6", borderRadius: "50%", marginRight: "0.5rem" }}></span>
                <span>Last Location</span>
              </div>
            </div>
          </div>

          {/* Route Playback Control */}
          <div className="lm-card">
            <div className="lm-card-title">Route Playback Control</div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  padding: "0.7rem 1.2rem",
                  backgroundColor: isPlaying ? "#ef4444" : "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                {isPlaying ? "Pause" : "Play"}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "#475569" }}>Speed:</label>
                <select
                  className="lm-select"
                  value={playSpeed}
                  onChange={e => setPlaySpeed(Number(e.target.value))}
                  style={{ width: "100px" }}
                >
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Employee Activity Summary */}
        <div>
          {/* Activity Summary Card */}
          <div className="lm-card" style={{ marginBottom: "1.5rem", backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7" }}>
            <div className="lm-card-title">Employee Activity Summary</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ borderBottom: "1px solid #e0e7ff", paddingBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>EMPLOYEE</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937" }}>Harshad</div>
              </div>
              <div style={{ borderBottom: "1px solid #e0e7ff", paddingBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>DESIGNATION</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937" }}>Sr. BDM</div>
              </div>
              <div style={{ borderBottom: "1px solid #e0e7ff", paddingBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>PUNCH IN</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>Not Available</div>
              </div>
              <div style={{ borderBottom: "1px solid #e0e7ff", paddingBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>PUNCH OUT</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#ef4444" }}>Not Available</div>
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>DEVICE</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1f2937" }}>Android</div>
              </div>
            </div>
          </div>

          {/* Daily Activity Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            <div className="lm-card" style={{ backgroundColor: "#f3f4f6" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>VISITS (Live DB)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#3b82f6" }}>{activityStats.visits}</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Total orders fetched</div>
            </div>
            <div className="lm-card" style={{ backgroundColor: "#f3f4f6" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>ORDERS (Live DB)</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>{activityStats.orders}</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Orders placed</div>
            </div>
            <div className="lm-card" style={{ backgroundColor: "#f3f4f6" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>TRAVEL</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f59e0b" }}>—</div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>GPS tracking required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Summary Table */}
      <div className="lm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div className="lm-card-title">Route Summary ({filteredVisits.length} visits)</div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={{ padding: "0.5rem 0.75rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}>
              <Copy size={14} />
            </button>
            <button style={{ padding: "0.5rem 0.75rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}>
              CSV
            </button>
            <button style={{ padding: "0.5rem 0.75rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}>
              <FileText size={14} />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "1rem", position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="lm-input"
            placeholder="Search retailer or route..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: "2.5rem", width: "100%" }}
          />
        </div>

        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Retailer</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Visit Scheduled</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Visit Start</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Visit End</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Total Time</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>In Range</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Purpose</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Route</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisits.length === 0 ? (
                <tr><td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No visits found</td></tr>
              ) : (
                paginatedVisits.map((visit, idx) => (
                  <tr
                    key={visit.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "white" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0"
                    }}
                  >
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{visit.retailer}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.visitScheduledDate}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.visitStartDate}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.visitEndDate}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontWeight: 500 }}>{visit.totalTime}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "0.375rem",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        backgroundColor: visit.status === "Completed" ? "#d1fae5" : "#fee2e2",
                        color: visit.status === "Completed" ? "#065f46" : "#991b1b"
                      }}>
                        {visit.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center", fontWeight: 600, color: visit.inRange === "Yes" ? "#16a34a" : "#dc2626" }}>{visit.inRange}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.purpose}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.route}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.85rem" }}>{visit.remark}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVisits.length)} of {filteredVisits.length} entries
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} style={{ backgroundColor: currentPage === page ? "#6366f1" : "#e2e8f0", color: currentPage === page ? "white" : "#475569", border: "none", borderRadius: "0.375rem", cursor: "pointer", padding: "0.5rem 0.75rem" }}>{page}</button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #10b981", marginTop: "2rem" }}>
        <div className="lm-card-title" style={{ color: "#047857" }}>✓ Benefits</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Track field employee movement</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Real-time GPS tracking on map</p></div>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Monitor visit productivity</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>View time spent at each location</p></div>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Detect fake visits</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>GPS verification prevents false data</p></div>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Analyze travel routes</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Optimize employee route planning</p></div>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Improve sales management</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Better field team oversight</p></div>
          <div><h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Route playback & analysis</h4><p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Replay routes at different speeds</p></div>
        </div>
      </div>
    </div>
  );
}
