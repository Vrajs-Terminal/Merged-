import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Minus,
  Search,
  Save,
  CheckCircle,
  AlertCircle,
  History,
  Filter,
  Package
} from "lucide-react";
import API_BASE from "../api";

interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  sku: string;
  bulkType: string | null;
  perBoxPiece: number | null;
  retailerSellingPrice: number;
  mrp: number;
  manufacturingCost: number;
  unit: string | null;
  status: string;
  product: { id: number; name: string; category: { name: string } };
}

interface ProductStock {
  id: number;
  productId: number;
  variantId: number;
  distributorId: number | null;
  availableStocks: number;
  variant: ProductVariant;
  distributor: { id: number; name: string } | null;
}

interface Distributor {
  id: number;
  name: string;
}

interface StockHistory {
  id: number;
  stockDate: string;
  type: string;
  quantity: number;
  performBy: string;
  product: { name: string };
  variant: { variantName: string };
  distributor: { name: string } | null;
}

export default function ManageProductStock() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  const [filters, setFilters] = useState({ distributor: "", variantType: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [loading, setLoading] = useState(false);

  // New toggle for "Add New Distributor Stock"
  const [showInitForm, setShowInitForm] = useState(false);

  const [stockFormData, setStockFormData] = useState({
    productId: 0,
    variantId: 0,
    distributorId: 0,
    quantity: "",
    changeType: "Add" as "Add" | "Less",
    remark: ""
  });

  const itemsPerPage = 25;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [variantsRes, stocksRes, distRes] = await Promise.all([
        axios.get(`${API_BASE}/product-variants`),
        axios.get(`${API_BASE}/product-stock`),
        axios.get(`${API_BASE}/distributors`)
      ]);
      const variantRows = Array.isArray(variantsRes.data) ? variantsRes.data : (variantsRes.data?.data || []);
      const stockRows = Array.isArray(stocksRes.data) ? stocksRes.data : (stocksRes.data?.data || []);
      const distributorRows = Array.isArray(distRes.data) ? distRes.data : (distRes.data?.data || []);

      setVariants(variantRows.map((item: any) => ({
        ...item,
        variantName: item.variantName || item.name || "Unknown"
      })));
      setStocks(stockRows);
      setDistributors(distributorRows);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to fetch stock data: " + err.message });
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/product-stock/logs`);
      setStockHistory(res.data);
    } catch {
      setMsg({ type: "error", text: "Failed to fetch history." });
    }
  };

  // Build the unified table data integrating known stocks
  const tableData = stocks.map(st => ({
    stockId: st.id,
    productId: st.productId,
    variantId: st.variantId,
    distributorId: st.distributorId,
    productName: st.variant?.product?.name || "Unknown",
    variantName: st.variant?.variantName || "Unknown",
    distributorName: st.distributor?.name || "No Distributor",
    availableStocks: st.availableStocks,
    sku: st.variant?.sku || "",
    category: st.variant?.product?.category?.name || "",
    bulkType: st.variant?.bulkType || "",
    perBoxPiece: st.variant?.perBoxPiece || 0,
    retailerSellingPrice: st.variant?.retailerSellingPrice || 0,
    mrp: st.variant?.mrp || 0,
    manufacturingCost: st.variant?.manufacturingCost || 0,
    unit: st.variant?.unit || ""
  }));

  const filteredData = tableData.filter(prod => {
    const matchFilters = (!filters.distributor || prod.distributorId?.toString() === filters.distributor) &&
      (!filters.variantType || filters.variantType === "All");
    const matchSearch = prod.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.variantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilters && matchSearch;
  });

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleOpenStockForm = (item: any, type: "Add" | "Less") => {
    setStockFormData({
      productId: item.productId,
      variantId: item.variantId,
      distributorId: item.distributorId || 0,
      quantity: "",
      changeType: type,
      remark: ""
    });
    setShowStockForm(true);
    setShowInitForm(false);
  };

  const handleSaveStock = async () => {
    if (!stockFormData.quantity || Number(stockFormData.quantity) <= 0) {
      alert("Please enter a valid quantity!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/product-stock/logs`, {
        type: stockFormData.changeType === "Add" ? "Stock In" : "Stock Out",
        quantity: stockFormData.quantity,
        performBy: "Admin", // Should be derived from logged in user ideally
        productId: stockFormData.productId,
        variantId: stockFormData.variantId,
        distributorId: stockFormData.distributorId || null,
        stockDate: new Date().toISOString()
      });

      setMsg({ type: "success", text: `Stock updated successfully!` });
      setShowStockForm(false);
      setShowInitForm(false);
      fetchData(); // Refresh grid
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to update stock: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    await fetchHistory();
    setShowHistoryModal(true);
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Package size={22} /> Manage Product Stock & Variants</h2>
          <p className="lm-page-subtitle">Update live inventory via API dynamically integrated with TiDB</p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="lm-field">
            <label className="lm-label">Distributor*</label>
            <select className="lm-select" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })}>
              <option value="">All Distributors</option>
              {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Top Buttons and Search */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button
          className="lm-btn-primary"
          onClick={() => { setShowInitForm(true); setShowStockForm(false); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", transition: "all 0.3s ease" }}
        >
          <Plus size={16} /> Initialize New Stock
        </button>
        <button
          className="lm-btn-secondary"
          onClick={handleViewHistory}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", backgroundColor: "#e2e8f0" }}
        >
          <History size={16} /> Global Stock Logs
        </button>

        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="lm-input"
            placeholder="Search SKUs or variants..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Init Form / Add Stock Modal */}
      {(showStockForm || showInitForm) && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{showInitForm ? "Initialize New Variant Stock" : (stockFormData.changeType === "Add" ? "Add Stock" : "Reduce Stock")}</div>
          <div className="lm-form-grid">
            
            {showInitForm && (
              <>
                <div className="lm-field lm-col-2">
                  <label className="lm-label">Select Variant</label>
                  <select 
                    className="lm-select" 
                    onChange={e => {
                        const variant = variants.find(v => v.id === Number(e.target.value));
                        setStockFormData({ ...stockFormData, variantId: variant?.id || 0, productId: variant?.productId || 0, changeType: "Add" });
                    }}
                  >
                    <option value="">-- Choose Variant --</option>
                    {variants.map(v => <option key={v.id} value={v.id}>{v.variantName} (SKU: {v.sku})</option>)}
                  </select>
                </div>
                <div className="lm-field lm-col-2">
                  <label className="lm-label">Select Distributor</label>
                  <select 
                    className="lm-select" 
                    onChange={e => setStockFormData({ ...stockFormData, distributorId: Number(e.target.value) })}
                  >
                    <option value="">-- Main Warehouse (None) --</option>
                    {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {!showInitForm && (
              <div className="lm-field lm-col-4" style={{ marginBottom: "1rem" }}>
                <p style={{ fontWeight: 600 }}>Modifying Stock For: <span style={{ color: "#6366f1" }}>Variant ID #{stockFormData.variantId}</span> at <span style={{ color: "#6366f1" }}>Distributor #{stockFormData.distributorId}</span></p>
              </div>
            )}

            <div className="lm-field">
              <label className="lm-label">Quantity*</label>
              <input
                type="number"
                className="lm-input"
                placeholder="amount"
                value={stockFormData.quantity}
                onChange={e => setStockFormData({ ...stockFormData, quantity: e.target.value })}
              />
            </div>
            
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button className="lm-btn-primary" onClick={handleSaveStock} disabled={loading} style={{ flex: 1 }}>
                <Save size={14} /> {loading ? "Processing..." : "Confirm & Save"}
              </button>
              <button className="lm-btn-secondary" onClick={() => { setShowStockForm(false); setShowInitForm(false); }} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showHistoryModal && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #10b981", backgroundColor: "#f0fdf4" }}>
          <div className="lm-card-title"><History size={18} /> Global Stock History</div>
          <div className="lm-table-wrap" style={{ overflowX: "auto", maxHeight: "400px", overflowY: "auto" }}>
            <table className="lm-table">
              <thead>
                <tr style={{ backgroundColor: "#dcfce7", borderBottom: "2px solid #86efac" }}>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Date</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Type</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Quantity</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Product/Variant</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Distributor</th>
                  <th style={{ padding: "1rem", fontWeight: 600, color: "#166534" }}>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {stockHistory.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>No history found</td></tr>}
                {stockHistory.map(entry => (
                  <tr key={entry.id} style={{ backgroundColor: "white", borderBottom: "1px solid #dbeafe" }}>
                    <td style={{ padding: "1rem" }}>{new Date(entry.stockDate).toLocaleDateString()}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "0.2rem 0.6rem", borderRadius: "0.25rem",
                        backgroundColor: entry.type === "Stock In" ? "#d1fae5" : "#fee2e2",
                        color: entry.type === "Stock In" ? "#065f46" : "#991b1b"
                      }}>
                        {entry.type}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{entry.quantity}</td>
                    <td style={{ padding: "1rem" }}>{entry.product?.name} ({entry.variant?.variantName})</td>
                    <td style={{ padding: "1rem" }}>{entry.distributor?.name || "Main Warehouse"}</td>
                    <td style={{ padding: "1rem" }}>{entry.performBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="lm-btn-secondary" onClick={() => setShowHistoryModal(false)} style={{ marginTop: "1rem", padding: "0.7rem 1.5rem" }}>Close</button>
        </div>
      )}

      {/* Grid */}
      <div className="lm-card">
        <div className="lm-card-title">Live Dynamic Inventory</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "left", width: "120px" }}>Action</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Product / Variant</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Distributor</th>
                <th style={{ padding: "1rem", textAlign: "right" }}>Available Stocks</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>SKU</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No live stocks setup yet. Click Initialize!</td></tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.stockId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button className="lm-btn-primary" onClick={() => handleOpenStockForm(item, "Add")} style={{ padding: "0.3rem 0.5rem", fontSize: "0.7rem", backgroundColor: "#10b981", border: "none" }}><Plus size={12}/> In</button>
                        <button className="lm-btn-secondary" onClick={() => handleOpenStockForm(item, "Less")} style={{ padding: "0.3rem 0.5rem", fontSize: "0.7rem", backgroundColor: "#ef4444", color: "white", border: "none" }}><Minus size={12}/> Out</button>
                      </div>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>{item.productName} ({item.variantName})</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{item.distributorName}</td>
                    <td style={{ padding: "1rem", textAlign: "right", fontWeight: 600, color: item.availableStocks < 10 ? "#dc2626" : "#16a34a" }}>{item.availableStocks} {item.unit}</td>
                    <td style={{ padding: "1rem", color: "#64748b" }}>{item.sku}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
