import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Edit2, Filter, Search, Save, CheckCircle, AlertCircle, Route
} from "lucide-react";

interface City { id: number; name: string }
interface Area { id: number; name: string; cityId: number }
interface SalesRoute {
  id: number; routeName: string; status: string;
  city: City; area: { id: number; name: string };
  employeeRoutes: { employee: { firstName?: string; lastName?: string; employeeId: string } }[];
}

export default function ManageRoute() {
  const [routes, setRoutes] = useState<SalesRoute[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCityFilter, setSelectedCityFilter] = useState("");

  const [formData, setFormData] = useState({ routeName: "", cityId: 0, areaId: 0, status: "Active" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [routesRes, citiesRes, areasRes] = await Promise.all([
        axios.get('/api/geo/routes'),
        axios.get('/api/geo/cities'),
        axios.get('/api/geo/areas')
      ]);
      const safeRoutes = Array.isArray(routesRes?.data)
        ? routesRes.data
        : Array.isArray(routesRes?.data?.data)
          ? routesRes.data.data
          : [];
      const safeCities = Array.isArray(citiesRes?.data)
        ? citiesRes.data
        : Array.isArray(citiesRes?.data?.data)
          ? citiesRes.data.data
          : [];
      const safeAreas = Array.isArray(areasRes?.data)
        ? areasRes.data
        : Array.isArray(areasRes?.data?.data)
          ? areasRes.data.data
          : [];
      setRoutes(safeRoutes);
      setCities(safeCities);
      setAreas(safeAreas);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load data: " + err.message });
    }
  };

  const filteredAreas = areas.filter(a => !formData.cityId || a.cityId === formData.cityId);

  const filteredRoutes = routes.filter(r => 
    (!selectedCityFilter || r.city?.id?.toString() === selectedCityFilter) &&
    ((r.routeName || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async () => {
    if (!formData.routeName || !formData.cityId || !formData.areaId) { alert("All fields required!"); return; }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/geo/routes/${editingId}`, formData);
      } else {
        await axios.post('/api/geo/routes', formData);
      }
      await fetchData();
      setMsg({ type: "success", text: editingId ? "Route updated!" : "Route added!" });
      resetForm(); setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed: " + err.message });
    } finally { setLoading(false); }
  };

  const resetForm = () => { setFormData({ routeName: "", cityId: 0, areaId: 0, status: "Active" }); setEditingId(null); };

  const handleEdit = (route: SalesRoute) => {
    setFormData({ routeName: route.routeName, cityId: route.city.id, areaId: route.area.id, status: route.status });
    setEditingId(route.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this route?")) return;
    try {
      await axios.delete(`/api/geo/routes/${id}`);
      setRoutes(routes.filter(r => r.id !== id));
      setMsg({ type: "success", text: "Route deleted!" });
    } catch { setMsg({ type: "error", text: "Failed." }); }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Route size={22} /> Manage Sales Routes</h2>
          <p className="lm-page-subtitle">Dynamic sales route management — live DB powered</p>
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
        <div className="lm-form-grid">
          <div className="lm-field">
            <label className="lm-label">City Filter</label>
            <select className="lm-select" value={selectedCityFilter} onChange={e => setSelectedCityFilter(e.target.value)}>
              <option value="">All Cities</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className="lm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem" }}>
          <Plus size={16} /> Add Route
        </button>
        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input type="text" className="lm-input" placeholder="Search route..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: "2.5rem" }} />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit Route" : "Add New Route"}</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Route Name*</label>
              <input className="lm-input" placeholder="Route name" value={formData.routeName}
                onChange={e => setFormData({ ...formData, routeName: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">City*</label>
              <select className="lm-select" value={formData.cityId} onChange={e => setFormData({ ...formData, cityId: Number(e.target.value), areaId: 0 })}>
                <option value={0}>Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Area*</label>
              <select className="lm-select" value={formData.areaId} onChange={e => setFormData({ ...formData, areaId: Number(e.target.value) })}>
                <option value={0}>Select Area</option>
                {filteredAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Status</label>
              <select className="lm-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="lm-form-footer lm-col-4" style={{ display: "flex", gap: "1rem" }}>
              <button className="lm-btn-primary" onClick={handleSave} disabled={loading} style={{ flex: 1, padding: "0.7rem 1rem" }}>
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button className="lm-btn-secondary" onClick={() => { setShowForm(false); resetForm(); }} style={{ flex: 1, padding: "0.7rem 1rem" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Sales Routes ({filteredRoutes.length}) — Live DB</div>
        <div className="lm-table-wrap" style={{ overflowX: "auto" }}>
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>S.No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Route Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>City</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Area</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Assigned Employees</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No routes found. Add one to begin.</td></tr>
              ) : filteredRoutes.map((route, idx) => (
                <tr key={route.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem", color: "#475569" }}>{idx + 1}</td>
                  <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{route.routeName}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{route.city?.name}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{route.area?.name}</td>
                  <td style={{ padding: "1rem", color: "#475569" }}>{route.employeeRoutes?.length || 0} employees</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ padding: "0.3rem 0.7rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, backgroundColor: route.status === "Active" ? "#d1fae5" : "#fee2e2", color: route.status === "Active" ? "#047857" : "#dc2626" }}>{route.status}</span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleEdit(route)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}><Edit2 size={14} color="#0284c7" /></button>
                      <button onClick={() => handleDelete(route.id)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.375rem", cursor: "pointer" }}><Trash2 size={14} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
