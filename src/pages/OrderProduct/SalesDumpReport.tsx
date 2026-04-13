import { useState, useEffect } from "react";
import axios from "axios";
import {
  Filter, Search, CheckCircle, AlertCircle, BarChart3, Download
} from "lucide-react";

interface OrderItem {
  quantity: number;
  variantPrice?: number;
  product?: { productName?: string; productCategory?: { categoryName?: string } };
  variant?: { variantName?: string };
}

interface Order {
  id: number;
  createdAt: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  freightAmount?: number;
  status: string;
  orderSource?: string;
  remarks?: string;
  retailer?: { businessName?: string; contactNumber?: string; address?: string; retailerGst?: string; pincode?: string };
  distributor?: { companyName?: string };
  employee?: { firstName?: string; lastName?: string; employeeId?: string };
  items?: OrderItem[];
  route?: { routeName?: string };
}

export default function SalesDumpReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    employee: "", retailer: "", distributor: "", orderStatus: "", product: "", startDate: "", endDate: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const itemsPerPage = 10;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/orders?page=1&limit=2000');
      setOrders(res.data.orders || res.data || []);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load order dump: " + err.message });
    } finally { setLoading(false); }
  };

  // Explode orders into item-level rows for the "dump" view
  const dumpRows = orders.flatMap(o =>
    (o.items && o.items.length > 0 ? o.items : [null]).map(item => ({ order: o, item }))
  );

  const filteredRows = dumpRows.filter(({ order: o, item }) => {
    const empName = `${o.employee?.firstName || ''} ${o.employee?.lastName || ''}`.toLowerCase();
    const retailerName = (o.retailer?.businessName || '').toLowerCase();
    const distributorName = (o.distributor?.companyName || '').toLowerCase();
    const productName = (item?.product?.productName || '').toLowerCase();
    const orderNo = `#${o.id}`;

    return (
      (!filters.employee || empName.includes(filters.employee.toLowerCase())) &&
      (!filters.retailer || retailerName.includes(filters.retailer.toLowerCase())) &&
      (!filters.distributor || distributorName.includes(filters.distributor.toLowerCase())) &&
      (!filters.orderStatus || o.status === filters.orderStatus) &&
      (!filters.product || productName.includes(filters.product.toLowerCase())) &&
      (!filters.startDate || new Date(o.createdAt) >= new Date(filters.startDate)) &&
      (!filters.endDate || new Date(o.createdAt) <= new Date(filters.endDate)) &&
      (!searchTerm || orderNo.includes(searchTerm) || empName.includes(searchTerm.toLowerCase()) || retailerName.includes(searchTerm.toLowerCase()) || productName.includes(searchTerm.toLowerCase()))
    );
  });

  const paginatedRows = filteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const totals = {
    totalOrders: new Set(filteredRows.map(r => r.order.id)).size,
    totalSales: [...new Set(filteredRows.map(r => r.order.id))].reduce((s, id) => {
      const o = orders.find(ord => ord.id === id); return s + (o?.totalAmount || 0);
    }, 0),
    totalDiscount: [...new Set(filteredRows.map(r => r.order.id))].reduce((s, id) => {
      const o = orders.find(ord => ord.id === id); return s + (o?.discountAmount || 0);
    }, 0),
    totalUnits: filteredRows.reduce((s, r) => s + (r.item?.quantity || 0), 0)
  };

  const handleCsvExport = () => {
    const csvHeader = "Order No,Date,Employee,Retailer,Distributor,Product,Category,Qty,Sales,Discount,Total,Status,Order Via\n";
    const csvData = filteredRows.map(({ order: o, item }) =>
      `#${o.id},${new Date(o.createdAt).toLocaleDateString()},${o.employee?.firstName || ''} ${o.employee?.lastName || ''},${o.retailer?.businessName || ''},${o.distributor?.companyName || ''},${item?.product?.productName || ''},${item?.product?.productCategory?.categoryName || ''},${item?.quantity || ''},${o.totalAmount},${o.discountAmount || 0},${o.totalAmount},${o.status},${o.orderSource || 'App'}`
    ).join('\n');
    const blob = new Blob([csvHeader + csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sales_dump.csv'; a.click();
    URL.revokeObjectURL(url);
    setMsg({ type: "success", text: "CSV exported!" });
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Sales Dump Report</h2>
          <p className="lm-page-subtitle">Live item-level order dump from TiDB — complete raw data for analysis</p>
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
            <label className="lm-label">Employee</label>
            <input className="lm-input" placeholder="Employee name" value={filters.employee} onChange={e => setFilters({ ...filters, employee: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Retailer</label>
            <input className="lm-input" placeholder="Retailer name" value={filters.retailer} onChange={e => setFilters({ ...filters, retailer: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Distributor</label>
            <input className="lm-input" placeholder="Distributor name" value={filters.distributor} onChange={e => setFilters({ ...filters, distributor: e.target.value })} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Order Status</label>
            <select className="lm-select" value={filters.orderStatus} onChange={e => setFilters({ ...filters, orderStatus: e.target.value })}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Product</label>
            <input className="lm-input" placeholder="Product name" value={filters.product} onChange={e => setFilters({ ...filters, product: e.target.value })} />
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
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="lm-btn-primary" onClick={() => { setCurrentPage(1); fetchData(); }} style={{ padding: "0.7rem 2rem" }}>Apply & Refresh</button>
          <button onClick={handleCsvExport} style={{ padding: "0.7rem 2rem", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Download size={16} /> CSV Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.5rem", position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
        <input type="text" className="lm-input" placeholder="Search by order #, employee, retailer, product..."
          value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: "2.5rem", width: "100%" }} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="lm-card" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0284c7", textTransform: "uppercase" }}>Total Orders</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0c4a6e", marginTop: "0.5rem" }}>{loading ? "..." : totals.totalOrders}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #22c55e" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#22c55e", textTransform: "uppercase" }}>Total Revenue</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#166534", marginTop: "0.5rem" }}>₹{loading ? "..." : totals.totalSales.toLocaleString()}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#fef3c7", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f59e0b", textTransform: "uppercase" }}>Total Discount</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#92400e", marginTop: "0.5rem" }}>₹{loading ? "..." : totals.totalDiscount.toLocaleString()}</div>
        </div>
        <div className="lm-card" style={{ backgroundColor: "#fce7f3", borderLeft: "4px solid #ec4899" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#ec4899", textTransform: "uppercase" }}>Total Units</div>
          <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#831843", marginTop: "0.5rem" }}>{loading ? "..." : totals.totalUnits}</div>
        </div>
      </div>

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Sales Dump Data ({filteredRows.length} item-level rows — Live DB) {loading && <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Loading...</span>}</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Order No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Date</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Employee</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Retailer</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Distributor</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Product</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Category</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right" }}>Qty</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem", textAlign: "right" }}>Total</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.75rem" }}>Via</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={12} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading from database...</td></tr>
              ) : paginatedRows.length === 0 ? (
                <tr><td colSpan={12} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No data found. Place orders to see dump data here.</td></tr>
              ) : paginatedRows.map(({ order: o, item }, idx) => (
                <tr key={`${o.id}-${idx}`} style={{ borderBottom: "1px solid #e2e8f0" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = ""}>
                  <td style={{ padding: "1rem", color: "#64748b", fontSize: "0.875rem" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 600, fontSize: "0.875rem" }}>#{o.id}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.875rem" }}>{o.employee?.firstName} {o.employee?.lastName}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{o.retailer?.businessName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{o.distributor?.companyName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 500, fontSize: "0.875rem" }}>{item?.product?.productName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{item?.product?.productCategory?.categoryName || '—'}</td>
                  <td style={{ padding: "1rem", color: "#1e293b", fontWeight: 600, fontSize: "0.875rem", textAlign: "right" }}>{item?.quantity || '—'}</td>
                  <td style={{ padding: "1rem", color: "#059669", fontWeight: 700, fontSize: "0.875rem", textAlign: "right" }}>₹{(o.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, backgroundColor: o.status === "Approved" || o.status === "Delivered" ? "#dcfce7" : o.status === "Pending" ? "#fef3c7" : "#fee2e2", color: o.status === "Approved" || o.status === "Delivered" ? "#166534" : o.status === "Pending" ? "#92400e" : "#7f1d1d" }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>{o.orderSource || 'App'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredRows.length)} of {filteredRows.length}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", opacity: currentPage === 1 ? 0.5 : 1 }}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", opacity: currentPage === totalPages ? 0.5 : 1 }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
