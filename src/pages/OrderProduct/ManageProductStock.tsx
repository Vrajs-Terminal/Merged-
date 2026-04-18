import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  Save,
  Search,
  X
} from "lucide-react";
import API_BASE from "../api";
import "./ManageProductStock.css";

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

interface StockTableRow {
  stockId: number;
  productId: number;
  variantId: number;
  distributorId: number | null;
  productName: string;
  variantName: string;
  distributorName: string;
  availableStocks: number;
  sku: string;
  category: string;
  bulkType: string;
  perBoxPiece: number;
  retailerSellingPrice: number;
  mrp: number;
  manufacturingCost: number;
  unit: string;
}

const ITEMS_PER_PAGE = 25;

const INITIAL_STOCK_FORM = {
  productId: 0,
  variantId: 0,
  distributorId: 0,
  quantity: "",
  changeType: "Add" as "Add" | "Less"
};

const getStockTone = (quantity: number) => {
  if (quantity <= 0) {
    return "empty";
  }

  if (quantity < 10) {
    return "low";
  }

  return "healthy";
};

const getStockLabel = (quantity: number) => {
  if (quantity <= 0) {
    return "Out of stock";
  }

  if (quantity < 10) {
    return "Low stock";
  }

  return "Healthy";
};

const formatHistoryDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
};

export default function ManageProductStock() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);

  const [filters, setFilters] = useState({ distributor: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showInitForm, setShowInitForm] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [stockFormData, setStockFormData] = useState(INITIAL_STOCK_FORM);

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    setIsFetching(true);

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
      setMsg((current) => current?.type === "error" ? null : current);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to fetch stock data: " + err.message });
    } finally {
      setIsFetching(false);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);

    try {
      const res = await axios.get(`${API_BASE}/product-stock/logs`);
      const historyRows = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setStockHistory(historyRows);
    } catch {
      setMsg({ type: "error", text: "Failed to fetch history." });
    } finally {
      setHistoryLoading(false);
    }
  };

  const tableData = useMemo<StockTableRow[]>(
    () => stocks.map((stock) => ({
      stockId: stock.id,
      productId: stock.productId,
      variantId: stock.variantId,
      distributorId: stock.distributorId,
      productName: stock.variant?.product?.name || "Unknown Product",
      variantName: stock.variant?.variantName || "Unknown Variant",
      distributorName: stock.distributor?.name || "Main Warehouse",
      availableStocks: stock.availableStocks,
      sku: stock.variant?.sku || "",
      category: stock.variant?.product?.category?.name || "",
      bulkType: stock.variant?.bulkType || "",
      perBoxPiece: stock.variant?.perBoxPiece || 0,
      retailerSellingPrice: stock.variant?.retailerSellingPrice || 0,
      mrp: stock.variant?.mrp || 0,
      manufacturingCost: stock.variant?.manufacturingCost || 0,
      unit: stock.variant?.unit || ""
    })),
    [stocks]
  );

  const filteredData = useMemo(
    () => tableData.filter((item) => {
      const matchesDistributor = !filters.distributor
        || (filters.distributor === "warehouse"
          ? !item.distributorId
          : item.distributorId?.toString() === filters.distributor);
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || [
        item.productName,
        item.variantName,
        item.sku,
        item.distributorName,
        item.category
      ].some((value) => value.toLowerCase().includes(query));

      return matchesDistributor && matchesSearch;
    }),
    [filters.distributor, searchTerm, tableData]
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(
    () => filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredData]
  );

  const totalUnitsOnHand = useMemo(
    () => tableData.reduce((sum, item) => sum + item.availableStocks, 0),
    [tableData]
  );

  const lowStockCount = useMemo(
    () => tableData.filter((item) => item.availableStocks < 10).length,
    [tableData]
  );

  const historyInCount = useMemo(
    () => stockHistory.filter((entry) => entry.type === "Stock In").length,
    [stockHistory]
  );

  const historyOutCount = useMemo(
    () => stockHistory.filter((entry) => entry.type === "Stock Out").length,
    [stockHistory]
  );

  const distributorLabel = useMemo(() => {
    if (!filters.distributor) {
      return "All distributors";
    }

    if (filters.distributor === "warehouse") {
      return "Main Warehouse";
    }

    return distributors.find((item) => item.id === Number(filters.distributor))?.name || "Selected distributor";
  }, [distributors, filters.distributor]);

  const selectedVariant = useMemo(
    () => variants.find((item) => item.id === stockFormData.variantId) || null,
    [stockFormData.variantId, variants]
  );

  const selectedDistributor = useMemo(
    () => distributors.find((item) => item.id === stockFormData.distributorId) || null,
    [distributors, stockFormData.distributorId]
  );

  const stockContext = useMemo(
    () => tableData.find((item) =>
      item.variantId === stockFormData.variantId &&
      (item.distributorId || 0) === stockFormData.distributorId
    ) || null,
    [stockFormData.distributorId, stockFormData.variantId, tableData]
  );

  const visibleStart = filteredData.length === 0 ? 0 : ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length);

  const resetStockForm = () => {
    setStockFormData(INITIAL_STOCK_FORM);
  };

  const closeStockEditor = () => {
    setShowStockForm(false);
    setShowInitForm(false);
    resetStockForm();
  };

  const openInitForm = () => {
    resetStockForm();
    setShowStockForm(false);
    setShowInitForm(true);
  };

  const handleOpenStockForm = (item: StockTableRow, type: "Add" | "Less") => {
    setStockFormData({
      productId: item.productId,
      variantId: item.variantId,
      distributorId: item.distributorId || 0,
      quantity: "",
      changeType: type
    });
    setShowStockForm(true);
    setShowInitForm(false);
  };

  const handleSaveStock = async () => {
    const quantity = Number(stockFormData.quantity);

    if (showInitForm && !stockFormData.variantId) {
      setMsg({ type: "error", text: "Select a variant before initializing stock." });
      return;
    }

    if (!quantity || quantity <= 0) {
      setMsg({ type: "error", text: "Enter a valid quantity greater than zero." });
      return;
    }

    setIsSavingStock(true);

    try {
      await axios.post(`${API_BASE}/product-stock/logs`, {
        type: stockFormData.changeType === "Add" ? "Stock In" : "Stock Out",
        quantity,
        performBy: "Admin",
        productId: stockFormData.productId,
        variantId: stockFormData.variantId,
        distributorId: stockFormData.distributorId || null,
        stockDate: new Date().toISOString()
      });

      setMsg({
        type: "success",
        text: showInitForm ? "Stock initialized successfully." : "Stock updated successfully."
      });
      closeStockEditor();
      await fetchData();
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to update stock: " + err.message });
    } finally {
      setIsSavingStock(false);
    }
  };

  const handleViewHistory = async () => {
    setShowHistoryModal(true);
    await fetchHistory();
  };

  const clearFilters = () => {
    setFilters({ distributor: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="lm-container lm-fade manage-product-stock-page">
      <div className="mps-hero lm-card">
        <div className="mps-hero-copy">
          <div className="mps-kicker">
            <Package size={16} />
            Inventory command center
          </div>
          <h2 className="lm-page-title"><Package size={22} /> Manage Product Stock & Variants</h2>
          <p className="lm-page-subtitle">
            Control warehouse and distributor inventory from one polished workspace with faster search,
            clearer actions, and easier daily stock operations.
          </p>
          <div className="mps-hero-pills">
            <span className="mps-hero-pill">Live stock visibility</span>
            <span className="mps-hero-pill">Distributor filtering</span>
            <span className="mps-hero-pill">Global audit logs</span>
          </div>
        </div>

        <div className="mps-stats">
          <div className="mps-stat-card">
            <span>Live records</span>
            <strong>{tableData.length.toLocaleString()}</strong>
          </div>
          <div className="mps-stat-card">
            <span>Units on hand</span>
            <strong>{totalUnitsOnHand.toLocaleString()}</strong>
          </div>
          <div className="mps-stat-card">
            <span>Low stock</span>
            <strong>{lowStockCount.toLocaleString()}</strong>
          </div>
          <div className="mps-stat-card">
            <span>Distributors</span>
            <strong>{distributors.length.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert mps-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          <span>{msg.text}</span>
          <button type="button" className="mps-alert-close" onClick={() => setMsg(null)} aria-label="Close message">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="mps-control-grid">
        <div className="mps-filter-card lm-card">
          <div className="mps-card-head">
            <div className="mps-card-title">
              <Filter size={18} />
              <div>
                <h3>Filter Inventory</h3>
                <p>Focus on one distributor or keep the full network in view.</p>
              </div>
            </div>
            <span className="mps-card-badge">{distributorLabel}</span>
          </div>

          <div className="mps-filter-grid">
            <div className="lm-field">
              <label className="lm-label">Distributor</label>
              <select
                className="lm-select"
                value={filters.distributor}
                onChange={(event) => {
                  setFilters({ distributor: event.target.value });
                  setCurrentPage(1);
                }}
              >
                <option value="">All Distributors</option>
                <option value="warehouse">Main Warehouse</option>
                {distributors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mps-toolbar-card lm-card">
          <div className="mps-card-head">
            <div className="mps-card-title">
              <Search size={18} />
              <div>
                <h3>Search & Actions</h3>
                <p>Search by product, variant, distributor, category, or SKU.</p>
              </div>
            </div>
            <span className="mps-card-badge">{filteredData.length} visible</span>
          </div>

          <div className="mps-toolbar">
            <div className="mps-search">
              <Search size={16} />
              <div>
                <span>Search inventory</span>
                <input
                  type="text"
                  className="lm-input"
                  placeholder="Search product, variant, distributor, or SKU"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="mps-toolbar-actions">
              <button
                type="button"
                className="mps-secondary-btn"
                onClick={() => void fetchData()}
                disabled={isFetching}
              >
                <RefreshCcw size={16} className={isFetching ? "mps-spin" : ""} />
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
              <button
                type="button"
                className="mps-secondary-btn"
                onClick={() => void handleViewHistory()}
                disabled={historyLoading}
              >
                <History size={16} />
                {historyLoading && !showHistoryModal ? "Loading..." : "Stock Logs"}
              </button>
              <button type="button" className="mps-primary-btn" onClick={openInitForm}>
                <Plus size={16} />
                Initialize Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      {(showStockForm || showInitForm) && (
        <div className="mps-editor-card lm-card">
          <div className="mps-card-head">
            <div className="mps-card-title">
              {showInitForm ? <Plus size={18} /> : stockFormData.changeType === "Add" ? <Plus size={18} /> : <Minus size={18} />}
              <div>
                <h3>
                  {showInitForm
                    ? "Initialize New Stock Position"
                    : stockFormData.changeType === "Add"
                      ? "Add Inventory"
                      : "Reduce Inventory"}
                </h3>
                <p>
                  {showInitForm
                    ? "Create a warehouse or distributor stock position for a product variant."
                    : "Update the selected stock record with a cleaner, more controlled inventory action."}
                </p>
              </div>
            </div>

            <button type="button" className="mps-icon-btn" onClick={closeStockEditor} aria-label="Close stock editor">
              <X size={16} />
            </button>
          </div>

          <div className="mps-editor-summary">
            <div className="mps-summary-pill">
              <span>Mode</span>
              <strong>
                {showInitForm
                  ? "New stock"
                  : stockFormData.changeType === "Add"
                    ? "Stock in"
                    : "Stock out"}
              </strong>
            </div>
            <div className="mps-summary-pill">
              <span>Variant</span>
              <strong>{selectedVariant?.variantName || stockContext?.variantName || "Choose variant"}</strong>
            </div>
            <div className="mps-summary-pill">
              <span>Location</span>
              <strong>{selectedDistributor?.name || stockContext?.distributorName || "Main Warehouse"}</strong>
            </div>
            <div className="mps-summary-pill">
              <span>Current balance</span>
              <strong>{stockContext ? `${stockContext.availableStocks} ${stockContext.unit}` : "New position"}</strong>
            </div>
          </div>

          <div className="mps-form-grid">
            {showInitForm ? (
              <>
                <div className="lm-field">
                  <label className="lm-label">Variant*</label>
                  <select
                    className="lm-select"
                    value={stockFormData.variantId || ""}
                    onChange={(event) => {
                      const variant = variants.find((item) => item.id === Number(event.target.value));
                      setStockFormData((current) => ({
                        ...current,
                        variantId: variant?.id || 0,
                        productId: variant?.productId || 0,
                        changeType: "Add"
                      }));
                    }}
                  >
                    <option value="">Choose Variant</option>
                    {variants.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.variantName} ({item.sku || "No SKU"})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lm-field">
                  <label className="lm-label">Distributor</label>
                  <select
                    className="lm-select"
                    value={stockFormData.distributorId || ""}
                    onChange={(event) => setStockFormData((current) => ({
                      ...current,
                      distributorId: Number(event.target.value) || 0
                    }))}
                  >
                    <option value="">Main Warehouse</option>
                    {distributors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="lm-field">
                  <label className="lm-label">Product / Variant</label>
                  <input
                    className="lm-input"
                    value={`${stockContext?.productName || selectedVariant?.product?.name || "Product"} / ${stockContext?.variantName || selectedVariant?.variantName || "Variant"}`}
                    readOnly
                  />
                </div>

                <div className="lm-field">
                  <label className="lm-label">Location</label>
                  <input
                    className="lm-input"
                    value={stockContext?.distributorName || selectedDistributor?.name || "Main Warehouse"}
                    readOnly
                  />
                </div>
              </>
            )}

            <div className="lm-field">
              <label className="lm-label">Quantity*</label>
              <input
                type="number"
                min="1"
                className="lm-input"
                placeholder="Enter quantity"
                value={stockFormData.quantity}
                onChange={(event) => setStockFormData((current) => ({ ...current, quantity: event.target.value }))}
              />
            </div>

            <div className="lm-field">
              <label className="lm-label">Movement</label>
              <input
                className="lm-input"
                value={showInitForm ? "Stock In" : stockFormData.changeType === "Add" ? "Stock In" : "Stock Out"}
                readOnly
              />
            </div>

            <div className="mps-form-actions">
              <button type="button" className="mps-primary-btn" onClick={handleSaveStock} disabled={isSavingStock}>
                <Save size={14} />
                {isSavingStock ? "Saving..." : "Confirm & Save"}
              </button>
              <button type="button" className="mps-secondary-btn" onClick={closeStockEditor}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mps-inventory-card lm-card">
        <div className="mps-card-head">
          <div className="mps-card-title">
            <Package size={18} />
            <div>
              <h3>Live Dynamic Inventory</h3>
              <p>Review every stock position, spot low inventory, and update balances in place.</p>
            </div>
          </div>

          <div className="mps-card-badges">
            <span className="mps-card-badge">{filteredData.length} records</span>
            <span className="mps-card-badge is-warning">{lowStockCount} low stock</span>
          </div>
        </div>

        <div className="mps-table-summary">
          <span>
            Showing {visibleStart}-{visibleEnd} of {filteredData.length}
          </span>
          <span>{distributorLabel}</span>
        </div>

        <div className="lm-table-wrap mps-table-wrap">
          <table className="lm-table mps-table">
            <thead>
              <tr>
                <th>Product / Variant</th>
                <th>Location</th>
                <th>SKU / Packaging</th>
                <th className="mps-stock-column">Available Stock</th>
                <th className="mps-action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="mps-empty-state">
                      <h4>
                        {isFetching && tableData.length === 0
                          ? "Loading inventory"
                          : tableData.length === 0
                            ? "No stock records yet"
                            : "No records match these filters"}
                      </h4>
                      <p>
                        {isFetching && tableData.length === 0
                          ? "Fetching live stock records from the server."
                          : tableData.length === 0
                            ? "Start by initializing a stock position for a variant and distributor."
                            : "Try another distributor selection or clear the search to broaden the result set."}
                      </p>
                      {isFetching && tableData.length === 0 ? null : tableData.length === 0 ? (
                        <button type="button" className="mps-primary-btn" onClick={openInitForm}>
                          <Plus size={16} />
                          Initialize Stock
                        </button>
                      ) : (
                        <button type="button" className="mps-secondary-btn" onClick={clearFilters}>
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const stockTone = getStockTone(item.availableStocks);
                  const packagingText = item.bulkType
                    ? `${item.bulkType}${item.perBoxPiece ? ` • ${item.perBoxPiece}/box` : ""}`
                    : item.unit || "Standard unit";

                  return (
                    <tr key={item.stockId}>
                      <td>
                        <div className="mps-product-cell">
                          <strong>{item.productName}</strong>
                          <span>{item.variantName}</span>
                          <small>{item.category || "Uncategorized product"}</small>
                        </div>
                      </td>
                      <td>
                        <div className="mps-location-cell">
                          <strong>{item.distributorName}</strong>
                          <span>{item.distributorId ? "Distributor inventory" : "Main warehouse"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="mps-sku-cell">
                          <code>{item.sku || "No SKU"}</code>
                          <span>{packagingText}</span>
                        </div>
                      </td>
                      <td>
                        <div className="mps-stock-cell">
                          <strong className={`mps-stock-value is-${stockTone}`}>
                            {item.availableStocks} {item.unit}
                          </strong>
                          <span className={`mps-stock-badge is-${stockTone}`}>
                            {getStockLabel(item.availableStocks)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="mps-row-actions">
                          <button
                            type="button"
                            className="mps-row-btn mps-row-btn-in"
                            onClick={() => handleOpenStockForm(item, "Add")}
                          >
                            <Plus size={14} />
                            Stock In
                          </button>
                          <button
                            type="button"
                            className="mps-row-btn mps-row-btn-out"
                            onClick={() => handleOpenStockForm(item, "Less")}
                          >
                            <Minus size={14} />
                            Stock Out
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <div className="mps-pagination">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="mps-pagination-controls">
              <button
                type="button"
                className="mps-pagination-btn"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                className="mps-pagination-btn"
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

      {showHistoryModal && (
        <div className="lm-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="lm-modal-content mps-history-modal" onClick={(event) => event.stopPropagation()}>
            <div className="lm-modal-header mps-history-header">
              <div>
                <h3>Global Stock Logs</h3>
                <p>Review stock-in and stock-out activity across every location.</p>
              </div>
              <button
                type="button"
                className="mps-icon-btn"
                onClick={() => setShowHistoryModal(false)}
                aria-label="Close stock logs"
              >
                <X size={16} />
              </button>
            </div>

            <div className="lm-modal-body">
              <div className="mps-history-stats">
                <div className="mps-history-stat">
                  <span>Total logs</span>
                  <strong>{stockHistory.length}</strong>
                </div>
                <div className="mps-history-stat">
                  <span>Stock in</span>
                  <strong>{historyInCount}</strong>
                </div>
                <div className="mps-history-stat">
                  <span>Stock out</span>
                  <strong>{historyOutCount}</strong>
                </div>
              </div>

              <div className="lm-table-wrap mps-history-table-wrap">
                <table className="lm-table mps-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Product / Variant</th>
                      <th>Distributor</th>
                      <th>Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="mps-empty-state is-compact">
                            <p>Loading stock history...</p>
                          </div>
                        </td>
                      </tr>
                    ) : stockHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="mps-empty-state is-compact">
                            <p>No stock history found yet.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      stockHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td>{formatHistoryDate(entry.stockDate)}</td>
                          <td>
                            <span className={`mps-history-type ${entry.type === "Stock In" ? "is-in" : "is-out"}`}>
                              {entry.type}
                            </span>
                          </td>
                          <td>{entry.quantity}</td>
                          <td>{entry.product?.name} ({entry.variant?.variantName})</td>
                          <td>{entry.distributor?.name || "Main Warehouse"}</td>
                          <td>{entry.performBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
