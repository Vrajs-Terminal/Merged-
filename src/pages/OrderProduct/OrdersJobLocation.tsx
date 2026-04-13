import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, MapPin } from "lucide-react";
import { jobLocationAPI } from "../../services/apiService";

interface JobLocation {
  id: number;
  employeeId?: number;
  branch?: string;
  department?: string;
  states?: string;
}

export default function OrdersJobLocation() {
  const [locations, setLocations] = useState<JobLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: "", state: "" });
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await jobLocationAPI.getAll(1, 1000);
      setLocations(response.data || []);
      setLoading(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to fetch job locations" });
      setLoading(false);
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><MapPin size={22} /> Orders Job Location</h2>
          <p className="lm-page-subtitle">Define working countries and states for order operations</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="lm-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Country</label>
            <select className="lm-select" value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
              <option value="">All Countries</option>
              <option value="India">India</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">State</label>
            <input type="text" className="lm-input" placeholder="Enter state" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Job Locations ({locations.length} total) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Employee ID</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Branch</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Department</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>States</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, idx) => (
                <tr key={loc.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{loc.employeeId || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{loc.branch || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{loc.department || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{loc.states || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
