import { useState, useEffect } from "react";
import axios from "axios";
import {
  Filter,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react";

interface StockRecord {
  id: number;
  stockDate: string;
  stockTime: string;
  quantity: number;
  type: string;
  performBy: string;
  category: string;
  product: string;
  distributor: string;
  orderId: string;
}

export default function StockInOutReport() {
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    distributor: "",
    stockType: "",
    product: "",
    startDate: "",
    endDate: ""
  });

  const [searchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/product-stock/logs');
      const data = res.data.map((log: any) => ({
        id: log.id,
        stockDate: new Date(log.stockDate).toISOString().split('T')[0],
        stockTime: log.stockTime || '-',
        quantity: log.quantity,
        type: log.type,
        performBy: log.performBy || 'System',
        category: "General", 
        product: log.variant?.variantName ? `${log.product?.name} (${log.variant?.variantName})` : log.product?.name || 'Unknown',
        distributor: log.distributor?.name || 'Main Warehouse',
        orderId: log.orderId || '-'
      }));
      setStockRecords(data);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to fetch stock logs: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = stockRecords.filter(record => {
    const matchFilters = (!filters.distributor || record.distributor === filters.distributor) &&
      (!filters.stockType || record.type === filters.stockType) &&
      (!filters.product || record.product.toLowerCase().includes(filters.product.toLowerCase())) &&
      (!filters.startDate || new Date(record.stockDate) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(record.stockDate) <= new Date(filters.endDate));

    const matchSearch = record.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.distributor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.orderId.includes(searchTerm) ||
      record.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilters && matchSearch;
  });

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const totals = {
    stockIn: filteredRecords.filter(r => r.type === "Stock In").reduce((sum, r) => sum + r.quantity, 0),
    stockOut: filteredRecords.filter(r => r.type === "Stock Out").reduce((sum, r) => sum + r.quantity, 0),
    adjustment: filteredRecords.filter(r => r.type === "Adjustment").reduce((sum, r) => sum + r.quantity, 0)
  };

  const handleSubmitFilters = () => {
    setCurrentPage(1);
    setMsg({ type: "success", text: "Report generated with selected filters" });
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Stock In/Out Report</h2>
          <p className="lm-page-subtitle">Track live stock movements, additions, and reductions directly from the database</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Filters */}
      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div className="lm-card-title"><Filter size={18} /> Advanced Filters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input
              className="lm-input"
              placeholder="Search distributor"
              value={filters.distributor}
              onChange={e => setFilters({ ...filters, distributor: e.target.value })}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Stock Type</label>
            <select
              className="lm-select"
              value={filters.stockType}
              onChange={e => setFilters({ ...filters, stockType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="Stock In">Stock In</option>
              <option value="Stock Out">Stock Out</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <input
              className="lm-input"
              placeholder="Search product name"
              value={filters.product}
              onChange={e => setFilters({ ...filters, product: e.target.value })}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Start Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.startDate}
              onChange={e => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">End Date</label>
            <input
              type="date"
              className="lm-input"
              value={filters.endDate}
              onChange={e => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
        </div>
        <button
          className="lm-btn-primary"
          onClick={handleSubmitFilters}
          style={{ padding: "0.7rem 2rem", backgroundColor: "#6366f1", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, transition: "all 0.3s ease" }}
        >
          Submit
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Stock In</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#166534", marginTop: "0.5rem" }}>{totals.stockIn}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#fca5a5", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Stock Out</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#7f1d1d", marginTop: "0.5rem" }}>{totals.stockOut}</div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Live Dynamic Stock Logs ({filteredRecords.length} total)</div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading dynamic logs...</div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            No log data found in database. Add stock to see logs here!
          </div>
        ) : (
          <>
            <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
              <table className="lm-table">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "80px" }}>Stock Date</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "70px" }}>Stock Time</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right", minWidth: "80px" }}>Quantity</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "100px" }}>Type</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "90px" }}>Perform By</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "90px" }}>Product</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "120px" }}>Distributor</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map((record, idx) => (
                    <tr key={record.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem", fontWeight: 500 }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 500 }}>{record.stockDate}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem" }}>{record.stockTime}</td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{record.quantity}</td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                        <span style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: record.type === "Stock In" ? "#dcfce7" : record.type === "Stock Out" ? "#fee2e2" : "#fef3c7",
                          color: record.type === "Stock In" ? "#166534" : record.type === "Stock Out" ? "#7f1d1d" : "#92400e"
                        }}>
                          {record.type}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{record.performBy}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 500 }}>{record.product}</td>
                      <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{record.distributor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls... */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ padding: "0.5rem 1rem", backgroundColor: currentPage === 1 ? "#f1f5f9" : "#e0f2fe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: currentPage === 1 ? "default" : "pointer" }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ padding: "0.5rem 1rem", backgroundColor: currentPage === totalPages ? "#f1f5f9" : "#e0f2fe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: currentPage === totalPages ? "default" : "pointer" }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
