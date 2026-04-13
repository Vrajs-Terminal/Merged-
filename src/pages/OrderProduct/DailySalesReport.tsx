import { useState, useEffect } from "react";
import { Download, CheckCircle, AlertCircle, Filter, BarChart3 } from "lucide-react";
import { dailySalesReportAPI } from "../../services/apiService";

interface DailySalesRecord {
  id: number;
  employeeName?: string;
  employeeId?: number;
  orders?: number;
  quantity?: number;
  salesAmount?: number;
  distributor?: string;
  city?: string;
  date?: string;
}

export default function DailySalesReport() {
  const [records, setRecords] = useState<DailySalesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    city: "",
    employee: "",
    distributor: "",
    retailer: "",
    startDate: "",
    endDate: ""
  });

  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await dailySalesReportAPI.getAll(1, 1000);
      setRecords(response.data || []);
      setLoading(false);
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to fetch sales report" });
      setLoading(false);
    }
  };

  const handleSubmitFilters = async () => {
    try {
      const response = await dailySalesReportAPI.getAll(
        1, 
        1000, 
        filters.employee ? parseInt(filters.employee) : undefined,
        filters.city || undefined,
        filters.distributor || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined
      );
      setRecords(response.data.data || []);
      setMsg({ type: "success", text: "Report generated with selected filters" });
    } catch (error: any) {
      setMsg({ type: "error", text: error.response?.data?.message || "Failed to generate report" });
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    try {
      setMsg({ type: "success", text: `Report exported as ${format.toUpperCase()}` });
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to export report" });
    }
  };

  const totalOrders = records.reduce((sum, r) => sum + (r.orders || 0), 0);
  const totalQuantity = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const totalSales = records.reduce((sum, r) => sum + (r.salesAmount || 0), 0);

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Daily Sales Report (Employee Wise)</h2>
          <p className="lm-page-subtitle">Track daily order performance for each employee</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Country</label>
            <select className="lm-select" value={filters.country} onChange={e => setFilters({ ...filters, country: e.target.value })}>
              <option value="">All Countries</option>
              <option value="India">India</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">State</label>
            <select className="lm-select" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })}>
              <option value="">All States</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">City</label>
            <input type="text" className="lm-input" placeholder="Enter city" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Employee</label>
            <input type="text" className="lm-input" placeholder="Enter employee" value={filters.employee} onChange={e => setFilters({ ...filters, employee: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input type="text" className="lm-input" placeholder="Enter distributor" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer</label>
            <input type="text" className="lm-input" placeholder="Enter retailer" value={filters.retailer} onChange={e => setFilters({ ...filters, retailer: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Start Date</label>
            <input type="date" className="lm-input" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">End Date</label>
            <input type="date" className="lm-input" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
        </div>
        <button onClick={handleSubmitFilters} style={{ padding: "0.6rem 1.5rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} /> Apply Filters
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="lm-card" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7" }}>
          <div style={{ color: "#064e3b", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Total Orders</div>
          <div style={{ color: "#0c4a6e", fontSize: "1.875rem", fontWeight: 700 }}>{totalOrders}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e" }}>
          <div style={{ color: "#064e3b", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Total Quantity</div>
          <div style={{ color: "#166534", fontSize: "1.875rem", fontWeight: 700 }}>{totalQuantity}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ color: "#78350f", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>Total Sales</div>
          <div style={{ color: "#92400e", fontSize: "1.875rem", fontWeight: 700 }}>₹{totalSales.toLocaleString()}</div>
        </div>
      </div>

      {/* Export Options */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <button onClick={() => handleExport("csv")} style={{ padding: "0.6rem 1.2rem", backgroundColor: "#22c55e", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          <Download size={16} /> CSV
        </button>
        <button onClick={() => handleExport("excel")} style={{ padding: "0.6rem 1.2rem", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          <Download size={16} /> Excel
        </button>
        <button onClick={() => handleExport("pdf")} style={{ padding: "0.6rem 1.2rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
          <Download size={16} /> PDF
        </button>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Daily Sales ({records.length} records) {loading && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Employee Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Employee ID</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Orders</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Quantity</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Sales Amount</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>Distributor</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left" }}>City</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, idx) => (
                <tr key={record.id} style={{ borderBottom: "1px solid #e2e8f0" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{record.employeeName || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{record.employeeId || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{record.orders || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{record.quantity || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#059669", fontSize: "0.875rem", fontWeight: 600 }}>₹{record.salesAmount ? record.salesAmount.toLocaleString() : "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{record.distributor || "—"}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{record.city || "—"}</td>
                  <td style={{ padding: "1rem", textAlign: "center", color: "#475569", fontSize: "0.875rem" }}>{record.date || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
