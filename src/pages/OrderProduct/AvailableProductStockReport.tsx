import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCcw,
  Search,
  TriangleAlert
} from "lucide-react";
import "./OrderProductWorkspace.css";
import {
  copyRowsToClipboard,
  downloadRowsAsCsv,
  exportRowsToExcel,
  exportRowsToPdf,
  formatCurrency
} from "./orderProductReportHelpers";

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

const ITEMS_PER_PAGE = 10;

const getStockTone = (stock: number) => {
  if (stock <= 0) {
    return "is-danger";
  }

  if (stock < 100) {
    return "is-warning";
  }

  return "is-success";
};

const getStockLabel = (stock: number) => {
  if (stock <= 0) {
    return "Out";
  }

  if (stock < 100) {
    return "Low";
  }

  return "Healthy";
};

export default function AvailableProductStockReport() {
  const [productStocks, setProductStocks] = useState<ProductStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ distributor: "", product: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    void fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/product-stock");
      const rawStocks = Array.isArray(response.data) ? response.data : response.data?.data || [];
      const nextStocks = rawStocks.map((stock: any) => ({
        id: stock.id,
        productName: stock.variant?.product?.name || "Unknown Product",
        variantName: stock.variant?.variantName || "Unknown Variant",
        availableStocks: stock.availableStocks || 0,
        sku: stock.variant?.sku || "",
        category: stock.variant?.product?.category?.name || "General",
        bulkType: stock.variant?.bulkType || "Piece",
        perBoxPiece: stock.variant?.perBoxPiece || 1,
        retailerSellingPrice: stock.variant?.retailerSellingPrice || 0,
        mrp: stock.variant?.mrp || 0,
        manufacturingCost: stock.variant?.manufacturingCost || 0,
        unit: stock.variant?.unit || "PCS",
        distributor: stock.distributor?.name || "Main Warehouse",
        distributorNumber: stock.distributor?.contactNumber || "—"
      }));
      setProductStocks(nextStocks);
    } catch (error: any) {
      setMsg({ type: "error", text: "Failed to fetch stock balances: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const distributors = useMemo(
    () => Array.from(new Set(productStocks.map((stock) => stock.distributor))).sort(),
    [productStocks]
  );

  const products = useMemo(
    () => Array.from(new Set(productStocks.map((stock) => stock.productName))).sort(),
    [productStocks]
  );

  const filteredStocks = useMemo(
    () => productStocks.filter((stock) => {
      const query = searchTerm.toLowerCase();

      return (
        (!filters.distributor || stock.distributor === filters.distributor) &&
        (!filters.product || stock.productName === filters.product) &&
        (!searchTerm
          || stock.productName.toLowerCase().includes(query)
          || stock.variantName.toLowerCase().includes(query)
          || stock.sku.toLowerCase().includes(query)
          || stock.distributor.toLowerCase().includes(query))
      );
    }),
    [filters, productStocks, searchTerm]
  );

  const totals = useMemo(() => ({
    totalProducts: filteredStocks.length,
    totalStock: filteredStocks.reduce((sum, stock) => sum + stock.availableStocks, 0),
    lowStockItems: filteredStocks.filter((stock) => stock.availableStocks < 100).length,
    totalValue: filteredStocks.reduce((sum, stock) => sum + (stock.availableStocks * stock.retailerSellingPrice), 0)
  }), [filteredStocks]);

  const totalPages = Math.max(1, Math.ceil(filteredStocks.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedStocks = useMemo(
    () => filteredStocks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredStocks]
  );

  const exportRows = useMemo(
    () => filteredStocks.map((stock) => ({
      product: stock.productName,
      variant: stock.variantName,
      distributor: stock.distributor,
      available_stock: stock.availableStocks,
      unit: stock.unit,
      sku: stock.sku,
      category: stock.category,
      retail_price: stock.retailerSellingPrice,
      mrp: stock.mrp,
      inventory_value: stock.availableStocks * stock.retailerSellingPrice
    })),
    [filteredStocks]
  );

  const exportKeys = [
    "product",
    "variant",
    "distributor",
    "available_stock",
    "unit",
    "sku",
    "category",
    "retail_price",
    "mrp",
    "inventory_value"
  ];

  const visibleStart = filteredStocks.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredStocks.length);

  const handleCopy = async () => {
    const copied = await copyRowsToClipboard(exportRows, exportKeys);
    setMsg({
      type: copied ? "success" : "error",
      text: copied ? "Available stock report copied to clipboard." : "No stock data available to copy."
    });
  };

  const handleCsvExport = () => {
    const exported = downloadRowsAsCsv(exportRows, "available_product_stock", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Available stock report exported as CSV." : "No stock data available to export."
    });
  };

  const handleExcelExport = () => {
    const exported = exportRowsToExcel(exportRows, "available_product_stock", "Available Stock");
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Available stock report exported to Excel." : "No stock data available to export."
    });
  };

  const handlePdfExport = () => {
    const exported = exportRowsToPdf(exportRows, "available_product_stock", "Available Product Stock Report", exportKeys);
    setMsg({
      type: exported ? "success" : "error",
      text: exported ? "Available stock report exported to PDF." : "No stock data available to export."
    });
  };

  const handleClearFilters = () => {
    setFilters({ distributor: "", product: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="lm-container lm-fade opw-page">
      <div className="lm-card opw-hero">
        <div className="opw-hero-copy">
          <span className="opw-eyebrow"><BarChart3 size={14} /> Live inventory visibility</span>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Available Product Stock Report</h2>
          <p className="lm-page-subtitle">
            Monitor real-time stock balances by product, variant, and distributor from a cleaner operational inventory report.
          </p>
          <div className="opw-hero-pills">
            <span className="opw-hero-pill">Low-stock visibility</span>
            <span className="opw-hero-pill">Distributor filtering</span>
            <span className="opw-hero-pill">Inventory value export</span>
          </div>
        </div>

        <div className="opw-stats">
          <div className="opw-stat-card">
            <span>Product Lines</span>
            <strong>{totals.totalProducts}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Total Units</span>
            <strong>{totals.totalStock}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Low Stock</span>
            <strong>{totals.lowStockItems}</strong>
          </div>
          <div className="opw-stat-card">
            <span>Inventory Value</span>
            <strong>{formatCurrency(totals.totalValue)}</strong>
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
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Filter size={18} />
            <div>
              <h3>Filter Stock Balance</h3>
              <p>Focus on one distributor or product while keeping the live inventory picture clear.</p>
            </div>
          </div>
          <span className="opw-panel-badge">{filteredStocks.length} items</span>
        </div>

        <div className="opw-form-grid">
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <select
              className="lm-select"
              value={filters.distributor}
              onChange={(event) => setFilters((current) => ({ ...current, distributor: event.target.value }))}
            >
              <option value="">All Distributors</option>
              {distributors.map((distributor) => (
                <option key={distributor} value={distributor}>
                  {distributor}
                </option>
              ))}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <select
              className="lm-select"
              value={filters.product}
              onChange={(event) => setFilters((current) => ({ ...current, product: event.target.value }))}
            >
              <option value="">All Products</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
          <div className="opw-form-actions">
            <button type="button" className="opw-primary-btn" onClick={() => { setCurrentPage(1); void fetchStock(); }}>
              <RefreshCcw size={16} />
              Refresh
            </button>
            <button type="button" className="opw-secondary-btn" onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="opw-metric-grid">
        <div className="opw-metric-card is-info">
          <span className="opw-metric-label">Product Lines</span>
          <strong className="opw-metric-value">{totals.totalProducts}</strong>
          <span className="opw-metric-note">Visible stock positions after filtering.</span>
        </div>
        <div className="opw-metric-card is-success">
          <span className="opw-metric-label">Available Units</span>
          <strong className="opw-metric-value">{totals.totalStock}</strong>
          <span className="opw-metric-note">All available units across the current stock view.</span>
        </div>
        <div className="opw-metric-card is-warning">
          <span className="opw-metric-label">Low Stock Items</span>
          <strong className="opw-metric-value">{totals.lowStockItems}</strong>
          <span className="opw-metric-note">Products below the low-stock threshold of 100 units.</span>
        </div>
        <div className="opw-metric-card is-danger">
          <span className="opw-metric-label">Inventory Value</span>
          <strong className="opw-metric-value">{formatCurrency(totals.totalValue)}</strong>
          <span className="opw-metric-note">Retail-value estimate for the visible stock balance.</span>
        </div>
      </div>

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <Search size={18} />
            <div>
              <h3>Search & Export</h3>
              <p>Search variants and distributors, then export the exact inventory subset you are reviewing.</p>
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
              <label htmlFor="available-stock-search">Search stock lines</label>
              <input
                id="available-stock-search"
                type="text"
                className="lm-input"
                placeholder="Search product, variant, SKU, or distributor"
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

      <div className="lm-card opw-panel">
        <div className="opw-panel-head">
          <div className="opw-panel-title">
            <BarChart3 size={18} />
            <div>
              <h3>Available Stock Table</h3>
              <p>Review product balances with clearer stock health and pricing context.</p>
            </div>
          </div>
          <span className="opw-panel-badge is-success">{loading ? "Loading..." : "Live DB"}</span>
        </div>

        <div className="opw-table-summary">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredStocks.length} stock lines</span>
          <span>{formatCurrency(totals.totalValue)} total value</span>
        </div>

        <div className="lm-table-wrap opw-table-wrap">
          <table className="lm-table opw-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Distributor</th>
                <th>SKU</th>
                <th className="opw-value-cell">Available</th>
                <th className="opw-value-cell">Retail Price</th>
                <th className="opw-value-cell">Value</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>Loading stock balance</h4>
                      <p>Pulling the latest available inventory from the database.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedStocks.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="opw-empty">
                      <h4>No stock records found</h4>
                      <p>Adjust the filters or refresh the inventory feed to broaden the result set.</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedStocks.map((stock) => (
                <tr key={stock.id}>
                  <td>
                    <div className="opw-entity">
                      <strong>{stock.productName}</strong>
                      <small>{stock.category}</small>
                    </div>
                  </td>
                  <td>
                    <div className="opw-entity">
                      <strong>{stock.variantName}</strong>
                      <small>{stock.bulkType} • {stock.perBoxPiece}/box</small>
                    </div>
                  </td>
                  <td>
                    <div className="opw-entity">
                      <strong>{stock.distributor}</strong>
                      <small>{stock.distributorNumber}</small>
                    </div>
                  </td>
                  <td><code>{stock.sku || "—"}</code></td>
                  <td className="opw-value-cell">
                    <div className="opw-entity" style={{ alignItems: "flex-end" }}>
                      <strong>{stock.availableStocks} {stock.unit}</strong>
                      <small>
                        <span className={`opw-status-badge ${getStockTone(stock.availableStocks)}`}>
                          {getStockLabel(stock.availableStocks)}
                        </span>
                      </small>
                    </div>
                  </td>
                  <td className="opw-value-cell">{formatCurrency(stock.retailerSellingPrice)}</td>
                  <td className="opw-value-cell">
                    {stock.availableStocks < 100 ? <TriangleAlert size={14} style={{ marginRight: 6, color: "#d97706", verticalAlign: "text-bottom" }} /> : null}
                    {formatCurrency(stock.availableStocks * stock.retailerSellingPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStocks.length > 0 && (
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
