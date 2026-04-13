import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3,
  Filter,
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  employee?: { firstName?: string; lastName?: string; employeeId: string };
  items?: { quantity: number }[];
}

interface DailySalesAggregate {
  id: number;
  employeeName?: string;
  employeeId?: number;
  orders?: number;
  quantity?: number;
  salesAmount?: number;
  distributor?: string;
  city?: string;
  date?: string;
  employee?: { firstName?: string; lastName?: string };
}

export default function SalesDashboard() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState("today");
  const [productTab, setProductTab] = useState("today");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [salesAggregates, setSalesAggregates] = useState<DailySalesAggregate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [ordersRes, salesRes] = await Promise.all([
        axios.get('/api/orders?page=1&limit=1000'),
        axios.get('/api/daily-sales-report?page=1&limit=200')
      ]);
      setOrders(ordersRes.data.orders || ordersRes.data || []);
      setSalesAggregates(salesRes.data.data || salesRes.data || []);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load dashboard: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  // KPI calculations from live data
  const totalOrders = orders.length;
  const orderRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const orderQuantities = orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);

  // Employee summary from aggregates
  const employeeGroups: Record<string, { name: string; orderValue: number; quantity: number; ordersCount: number }> = {};
  salesAggregates.forEach(s => {
    const key = s.employeeId?.toString() || s.employeeName || 'Unknown';
    const name = s.employeeName || `${s.employee?.firstName || ''} ${s.employee?.lastName || ''}`.trim() || 'Unknown';
    if (!employeeGroups[key]) employeeGroups[key] = { name, orderValue: 0, quantity: 0, ordersCount: 0 };
    employeeGroups[key].orderValue += s.salesAmount || 0;
    employeeGroups[key].quantity += s.quantity || 0;
    employeeGroups[key].ordersCount += s.orders || 0;
  });

  const employeeRows = Object.values(employeeGroups);
  const employeeTotalValue = employeeRows.reduce((s, e) => s + e.orderValue, 0);
  const employeeTotalQty = employeeRows.reduce((s, e) => s + e.quantity, 0);
  const employeeTotalOrders = employeeRows.reduce((s, e) => s + e.ordersCount, 0);

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><BarChart3 size={22} /> Sales Dashboard</h2>
          <p className="lm-page-subtitle">Real-time live overview of sales performance, orders, and employee productivity</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Date Filters */}
      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div className="lm-card-title"><Filter size={18} /> Date Filters</div>
        <div className="lm-form-grid">
          <div className="lm-field">
            <label className="lm-label">Date Filter</label>
            <input type="date" className="lm-input" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Month Filter</label>
            <input type="month" className="lm-input" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
          </div>
          <div className="lm-field">
            <label className="lm-label">Year Filter</label>
            <input type="number" className="lm-input" min="2020" max="2050" value={yearFilter} onChange={e => setYearFilter(e.target.value)} />
          </div>
          <div className="lm-field" style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="lm-btn-primary" onClick={fetchDashboard} style={{ width: "100%", padding: "0.7rem 1rem" }}>
              {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #0284c7", padding: "1.5rem", borderRadius: "0.5rem", transition: "all 0.3s ease" }}>
          <div style={{ fontSize: "0.85rem", color: "#0c4a6e", marginBottom: "0.5rem", fontWeight: 600 }}>Total Orders (DB)</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#0284c7", marginBottom: "0.5rem" }}>{loading ? "..." : totalOrders}</div>
          <div style={{ fontSize: "0.75rem", color: "#075985" }}>Live from database</div>
        </div>
        <div style={{ backgroundColor: "#fdf2f8", borderLeft: "4px solid #db2777", padding: "1.5rem", borderRadius: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#500724", marginBottom: "0.5rem", fontWeight: 600 }}>Order Revenue (DB)</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#db2777", marginBottom: "0.5rem" }}>₹{loading ? "..." : orderRevenue.toLocaleString()}</div>
          <div style={{ fontSize: "0.75rem", color: "#831843" }}>Sum of all order amounts</div>
        </div>
        <div style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #16a34a", padding: "1.5rem", borderRadius: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#14532d", marginBottom: "0.5rem", fontWeight: 600 }}>Total Employees Tracked</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#16a34a", marginBottom: "0.5rem" }}>{loading ? "..." : employeeRows.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#166534" }}>Active in sales aggregates</div>
        </div>
        <div style={{ backgroundColor: "#fffbeb", borderLeft: "4px solid #f59e0b", padding: "1.5rem", borderRadius: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#78350f", marginBottom: "0.5rem", fontWeight: 600 }}>Sales Aggregate Records</div>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#f59e0b", marginBottom: "0.5rem" }}>{loading ? "..." : salesAggregates.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#92400e" }}>Total log entries</div>
        </div>
      </div>

      {/* Order Summary (Employee Wise) */}
      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div className="lm-card-title"><Users size={18} /> Order Summary – Employee Wise (Live DB)</div>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", borderBottom: "2px solid #e2e8f0", paddingBottom: "0.5rem" }}>
          {["today", "thisWeek", "thisMonth"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "0.6rem 1.2rem", backgroundColor: activeTab === tab ? "#6366f1" : "transparent", color: activeTab === tab ? "white" : "#64748b", border: "none", borderRadius: "0.375rem", cursor: "pointer", fontWeight: activeTab === tab ? 600 : 500, fontSize: "0.85rem", transition: "all 0.3s ease" }}>
              {tab === "today" ? "Today" : tab === "thisWeek" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>#</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Employee Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Order Value</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>QTY</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>No. of Orders</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading live data...</td></tr>
              ) : employeeRows.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No sales data found in database</td></tr>
              ) : employeeRows.map((emp, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem", color: "#475569" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{emp.name}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>₹{emp.orderValue.toFixed(2)}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{emp.quantity}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{emp.ordersCount}</td>
                </tr>
              ))}
              {employeeRows.length > 0 && (
                <tr style={{ backgroundColor: "#eff6ff", fontWeight: 600, borderTop: "2px solid #e2e8f0" }}>
                  <td colSpan={2} style={{ padding: "1rem", color: "#0c4a6e" }}>Total</td>
                  <td style={{ padding: "1rem", color: "#0c4a6e" }}>₹{employeeTotalValue.toFixed(2)}</td>
                  <td style={{ padding: "1rem", color: "#0c4a6e" }}>{employeeTotalQty}</td>
                  <td style={{ padding: "1rem", color: "#0c4a6e" }}>{employeeTotalOrders}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart placeholders */}
      <div className="lm-card" style={{ marginBottom: "2rem", backgroundColor: "#f8fafc", padding: "1.5rem" }}>
        <div className="lm-card-title"><TrendingUp size={18} /> Orders Summary Chart – {monthFilter}</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", backgroundColor: "white", borderRadius: "0.5rem", border: "1px dashed #cbd5e1" }}>
          <div style={{ textAlign: "center", color: "#94a3b8" }}>
            <BarChart3 size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
            <p>Chart integration with Recharts/Chart.js</p>
            <p style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "0.5rem" }}>📊 {totalOrders} live orders loaded from DB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
