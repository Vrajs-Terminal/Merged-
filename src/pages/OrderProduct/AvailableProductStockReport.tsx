import { useState, useEffect } from "react";
import axios from "axios";
import {
  Filter,
  CheckCircle,
  AlertCircle,
  BarChart3,
  AlertTriangle
} from "lucide-react";

interface ProductStock {
  id: number;
  productName: string;
  variantName: string;
  availableStocks: number;
  sku: string;
  category: string;
  bulkType: string;
  perBoxPiece: number;
  retailerSellingPrice: number;
  mrp: number;
  manufacturingCost: number;
  unit: string;
  distributor: string;
  distributorNumber: string;
}

export default function AvailableProductStockReport() {
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ distributor: "", category: "", product: "" });
  const [searchTerm] = useState("");
  const [currentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/product-stock');
      const data = res.data.map((st: any) => ({
        id: st.id,
        productName: st.product?.name || 'Unknown',
        variantName: st.variant?.variantName || 'Unknown',
        availableStocks: st.availableStocks,
        sku: st.variant?.sku || '',
        category: 'General',
        bulkType: st.variant?.bulkType || 'Piece',
        perBoxPiece: st.variant?.perBoxPiece || 1,
        retailerSellingPrice: st.variant?.retailerSellingPrice || 0,
        mrp: st.variant?.mrp || 0,
        manufacturingCost: st.variant?.manufacturingCost || 0,
        unit: st.variant?.unit || 'PCS',
        distributor: st.distributor?.name || 'Main Warehouse',
        distributorNumber: st.distributor?.contactNumber || '-'
      }));
      setProductStocks(data);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to fetch stock balances: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const distributors = Array.from(new Set(productStocks.map(p => p.distributor)));
  const products = Array.from(new Set(productStocks.map(p => p.productName)));

  const filteredStocks = productStocks.filter(stock => {
    const matchFilters = (!filters.distributor || stock.distributor === filters.distributor) &&
      (!filters.product || stock.productName === filters.product);

    const matchSearch = stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.distributor.toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilters && matchSearch;
  });

  const paginatedStocks = filteredStocks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totals = {
    totalProducts: filteredStocks.length,
    totalStock: filteredStocks.reduce((sum, s) => sum + s.availableStocks, 0),
    lowStockItems: filteredStocks.filter(s => s.availableStocks < 100).length,
    totalValue: filteredStocks.reduce((sum, s) => sum + (s.availableStocks * s.retailerSellingPrice), 0)
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Available Product Stock Report</h2>
          <p className="lm-page-subtitle">Real-time dynamic inventory monitoring by distributor</p>
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
        <div className="lm-card-title"><Filter size={18} /> Filters</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <select className="lm-select" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })}>
              <option value="">All Distributors</option>
              {distributors.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <select className="lm-select" value={filters.product} onChange={e => setFilters({ ...filters, product: e.target.value })}>
              <option value="">All Products</option>
              {products.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="lm-card" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0284c7", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Product Lines</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0c4a6e", marginTop: "0.5rem" }}>{totals.totalProducts}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Stock Count</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#166534", marginTop: "0.5rem" }}>{totals.totalStock}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>Low Stock Items</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#7f1d1d", marginTop: "0.5rem" }}>{totals.lowStockItems}</div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Live Dynamic Database Items</div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading report API...</div>
        ) : filteredStocks.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            No products found matching filters.
          </div>
        ) : (
          <>
            <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
              <table className="lm-table">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "center", width: "40px" }}>#</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "100px" }}>Product</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "90px" }}>Variant</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right", minWidth: "100px" }}>Available</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "80px" }}>SKU</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right", minWidth: "100px" }}>Retail Price</th>
                    <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "left", minWidth: "100px" }}>Distributor</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStocks.map((stock, idx) => (
                    <tr key={stock.id} style={{ borderBottom: "1px solid #e2e8f0", cursor: "pointer" }}>
                      <td style={{ padding: "1rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem", fontWeight: 500 }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>{stock.productName}</td>
                      <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{stock.variantName}</td>
                      <td style={{ padding: "1rem", textAlign: "right", fontSize: "0.875rem", fontWeight: 600 }}>
                        <span style={{ color: stock.availableStocks < 100 ? "#ef4444" : "#166534" }}>
                          {stock.availableStocks}
                          {stock.availableStocks < 100 && <AlertTriangle size={12} style={{ display: "inline", marginLeft: "4px" }} />}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem", fontFamily: "monospace" }}>{stock.sku}</td>
                      <td style={{ padding: "1rem", textAlign: "right", color: "#1e293b", fontSize: "0.875rem", fontWeight: 600 }}>₹{stock.retailerSellingPrice}</td>
                      <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{stock.distributor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
