import { useState, useCallback } from "react";
import {
  ShoppingCart, Plus, Trash2, Search, X, Loader2, ChevronLeft, ChevronRight,
  DollarSign, CheckCircle, Download, Package
} from "lucide-react";
import toast from "react-hot-toast";
import "./manage-site.css";

const API = "/api/site-management";

interface Purchase {
  id: number; site_id: number; item_name: string; vendor_name: string;
  quantity: number; unit_price: number; total_amount: number;
  date: string; bill_url?: string; status: string;
  site?: { id: number; name: string; branch?: { name: string } };
}

const STATUS_OPTS = ["Approved", "Pending", "Rejected"];

export default function ManageSitePurchase() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sites, setSites] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSite, setFilterSite] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selected, setSelected] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [form, setForm] = useState({ site_id: "", item_name: "", vendor_name: "", quantity: "", unit_price: "", date: new Date().toISOString().split("T")[0], bill_url: "", status: "Approved" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API}/purchases?start_date=${startDate}&end_date=${endDate}${filterSite ? `&site_id=${filterSite}` : ""}`),
        fetch(`${API}/sites`)
      ]);
      if (pRes.ok) setPurchases(await pRes.json());
      if (sRes.ok) setSites(await sRes.json());
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }, [startDate, endDate, filterSite]);

  const handleAdd = async () => {
    if (!form.site_id || !form.item_name || !form.vendor_name || !form.quantity || !form.unit_price || !form.date) {
      return toast.error("Fill all required fields");
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/purchases`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      const d = await res.json();
      if (!res.ok) return toast.error(d.message || "Failed");
      toast.success("Purchase added!");
      setDrawerOpen(false);
      setForm({ site_id: "", item_name: "", vendor_name: "", quantity: "", unit_price: "", date: new Date().toISOString().split("T")[0], bill_url: "", status: "Approved" });
      fetchData();
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this purchase record?")) return;
    try {
      const res = await fetch(`${API}/purchases/${id}`, { method: "DELETE" });
      if (res.ok) { toast.success("Deleted"); fetchData(); }
    } catch { toast.error("Server error"); }
  };

  const handleExport = () => {
    const headers = ["#", "Site", "Item", "Vendor", "Qty", "Unit Price", "Total", "Date", "Status"];
    const rows = filtered.map((p, i) => [i + 1, p.site?.name || "", p.item_name, p.vendor_name, p.quantity, p.unit_price, p.total_amount, new Date(p.date).toLocaleDateString(), p.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; a.download = "site-purchases.csv"; a.click();
  };

  const totalAmount = purchases.reduce((a, p) => a + p.total_amount, 0);

  const filtered = purchases.filter(p =>
    !search || p.item_name.toLowerCase().includes(search.toLowerCase()) || p.vendor_name.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: number) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const statusColor: Record<string, string> = { Approved: "#10b981", Pending: "#f59e0b", Rejected: "#ef4444" };

  return (
    <div className="sm-page">
      <div className="sm-header">
        <div className="sm-header__left">
          <div className="sm-header__icon"><ShoppingCart size={22} /></div>
          <div>
            <h1 className="sm-header__title">Manage Site Purchases</h1>
            <p className="sm-header__sub">Track purchases and vendor expenses at each site</p>
          </div>
        </div>
        <div className="sm-header__actions">
          {purchases.length > 0 && <button className="sm-btn sm-btn--secondary" onClick={handleExport}><Download size={16} /> Export</button>}
          <button className="sm-btn sm-btn--primary" onClick={() => setDrawerOpen(true)}><Plus size={16} /> Add Purchase</button>
        </div>
      </div>

      {/* Stats */}
      <div className="sm-stats" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div className="sm-stat"><span className="sm-stat__val">{purchases.length}</span><span className="sm-stat__label">Total Entries</span></div>
        <div className="sm-stat"><span className="sm-stat__val" style={{ color: "#10b981" }}>₹{totalAmount.toFixed(0)}</span><span className="sm-stat__label">Total Amount</span></div>
        <div className="sm-stat"><span className="sm-stat__val" style={{ color: "#f59e0b" }}>{purchases.filter(p => p.status === "Pending").length}</span><span className="sm-stat__label">Pending Approvals</span></div>
      </div>

      {/* Filters */}
      <div style={{ background: "var(--sm-surface)", border: "1px solid var(--sm-border)", borderRadius: "var(--sm-radius)", padding: "16px 20px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="sm-field" style={{ minWidth: 170 }}><label>Site</label>
          <select value={filterSite} onChange={e => setFilterSite(e.target.value)}>
            <option value="">All Sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="sm-field" style={{ minWidth: 140 }}><label>From</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="sm-field" style={{ minWidth: 140 }}><label>To</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        <button className="sm-btn sm-btn--primary" onClick={fetchData} disabled={loading}>
          {loading ? <Loader2 className="sm-spin" size={16} /> : <Search size={16} />} Fetch
        </button>
      </div>

      <div className="sm-controls">
        <div className="sm-controls__left">
          <label className="sm-select-wrap">Show <select className="sm-select" value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}><option>25</option><option>50</option><option>100</option></select> entries</label>
          {selected.length > 0 && (
            <button className="sm-btn sm-btn--danger-ghost" onClick={() => {
              if (confirm(`Delete ${selected.length} records?`)) {
                Promise.all(selected.map(id => fetch(`${API}/purchases/${id}`, { method: "DELETE" }))).then(() => { toast.success("Deleted"); setSelected([]); fetchData(); });
              }
            }}><Trash2 size={15} /> Delete ({selected.length})</button>
          )}
        </div>
        <div className="sm-search-wrap">
          <Search size={16} className="sm-search-icon" />
          <input className="sm-search" placeholder="Search item, vendor..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button className="sm-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
      </div>

      <div className="sm-table-wrap">
        {loading ? (
          <div className="sm-loading"><Loader2 className="sm-spin" size={28} /><span>Loading…</span></div>
        ) : (
          <table className="sm-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={() => setSelected(selected.length === paged.length ? [] : paged.map(p => p.id))} /></th>
                <th>#</th><th>Site</th><th>Item Name</th><th>Vendor</th>
                <th>Qty</th><th>Unit Price</th><th>Total Amount</th><th>Date</th><th>Bill</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={12} className="sm-empty">No purchases found. Click Fetch to load or Add to create new.</td></tr>
              ) : paged.map((p, i) => (
                <tr key={p.id} className={selected.includes(p.id) ? "sm-tr--selected" : ""}>
                  <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td className="sm-td-sr">{(page - 1) * perPage + i + 1}</td>
                  <td style={{ color: "#c7d2fe", fontWeight: 500 }}>{p.site?.name || "—"}</td>
                  <td><div className="sm-site-name">{p.item_name}</div></td>
                  <td style={{ color: "var(--sm-text-muted)" }}>{p.vendor_name}</td>
                  <td style={{ color: "var(--sm-text-muted)" }}>{p.quantity}</td>
                  <td style={{ color: "var(--sm-text-muted)" }}>₹{p.unit_price.toFixed(2)}</td>
                  <td style={{ color: "#fcd34d", fontWeight: 700 }}>₹{p.total_amount.toFixed(2)}</td>
                  <td style={{ color: "var(--sm-text-muted)" }}>{new Date(p.date).toLocaleDateString()}</td>
                  <td>{p.bill_url ? <a href={p.bill_url} target="_blank" rel="noreferrer" style={{ color: "#6366f1", fontSize: 12 }}>View ↗</a> : "—"}</td>
                  <td>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${statusColor[p.status]}20`, color: statusColor[p.status] }}>{p.status}</span>
                  </td>
                  <td>
                    <button className="sm-action-btn sm-action-btn--delete" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="sm-pagination">
        <span className="sm-pag-info">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
        <div className="sm-pag-btns">
          <button className="sm-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p2 => (
            <button key={p2} className={`sm-pag-btn ${p2 === page ? "sm-pag-btn--active" : ""}`} onClick={() => setPage(p2)}>{p2}</button>
          ))}
          <button className="sm-pag-btn" disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Add Drawer */}
      {drawerOpen && (
        <div className="sm-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="sm-drawer" style={{ width: 460 }} onClick={e => e.stopPropagation()}>
            <div className="sm-drawer__header">
              <div className="sm-drawer__title"><Package size={20} /> Add Site Purchase</div>
              <button className="sm-drawer__close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="sm-drawer__body">
              <div className="sm-field"><label>Site <span className="sm-req">*</span></label>
                <select value={form.site_id} onChange={e => setForm(p => ({ ...p, site_id: e.target.value }))}>
                  <option value="">Select Site</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="sm-grid-2" style={{ marginTop: 14 }}>
                <div className="sm-field"><label>Item Name <span className="sm-req">*</span></label><input value={form.item_name} onChange={e => setForm(p => ({ ...p, item_name: e.target.value }))} placeholder="e.g. Cement bags" /></div>
                <div className="sm-field"><label>Vendor <span className="sm-req">*</span></label><input value={form.vendor_name} onChange={e => setForm(p => ({ ...p, vendor_name: e.target.value }))} placeholder="Vendor name" /></div>
                <div className="sm-field"><label>Quantity <span className="sm-req">*</span></label><input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} placeholder="0" /></div>
                <div className="sm-field"><label>Unit Price <span className="sm-req">*</span></label><input type="number" value={form.unit_price} onChange={e => setForm(p => ({ ...p, unit_price: e.target.value }))} placeholder="0.00" /></div>
              </div>
              {form.quantity && form.unit_price && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(252,211,77,0.1)", borderRadius: 8, fontSize: 13, color: "#fcd34d", fontWeight: 600 }}>
                  Total: ₹{(Number(form.quantity) * Number(form.unit_price)).toFixed(2)}
                </div>
              )}
              <div className="sm-grid-2" style={{ marginTop: 14 }}>
                <div className="sm-field"><label>Date <span className="sm-req">*</span></label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div className="sm-field"><label>Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm-field sm-field--full"><label>Bill URL</label><input value={form.bill_url} onChange={e => setForm(p => ({ ...p, bill_url: e.target.value }))} placeholder="https://...(document URL)" /></div>
              </div>
            </div>
            <div className="sm-drawer__footer">
              <button className="sm-btn sm-btn--secondary" onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button className="sm-btn sm-btn--primary" onClick={handleAdd} disabled={saving}>
                {saving ? <Loader2 className="sm-spin" size={16} /> : <CheckCircle size={16} />} Save Purchase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
