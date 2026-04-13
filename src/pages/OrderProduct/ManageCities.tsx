import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Upload, Trash2, Edit2, Filter, Search, Save, CheckCircle, AlertCircle, Building2
} from "lucide-react";
import API_BASE from "../api";

interface State { id: number; name: string; country: { name: string } }
interface City {
  id: number; name: string; status: string;
  state: { id: number; name: string; country: { name: string } };
}

export default function ManageCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [filters, setFilters] = useState({ stateId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  const [formData, setFormData] = useState({ name: "", stateId: 0, status: "Active" });
  const itemsPerPage = 25;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [citiesRes, statesRes] = await Promise.all([
        axios.get(`${API_BASE}/geo/cities`),
        axios.get(`${API_BASE}/geo/states`)
      ]);
      const safeCities = Array.isArray(citiesRes?.data)
        ? citiesRes.data
        : Array.isArray(citiesRes?.data?.data)
          ? citiesRes.data.data
          : [];
      const safeStates = Array.isArray(statesRes?.data)
        ? statesRes.data
        : Array.isArray(statesRes?.data?.data)
          ? statesRes.data.data
          : [];
      setCities(safeCities);
      setStates(safeStates);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load data: " + err.message });
    }
  };

  const filteredCities = cities.filter(c =>
    (!filters.stateId || c.state?.id?.toString() === filters.stateId) &&
    (c.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCities = filteredCities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCities.length / itemsPerPage);

  const handleSave = async () => {
    if (!formData.name || !formData.stateId) { alert("All fields are required!"); return; }
    setLoading(true);
    try {
      if (editingId) {
        const res = await axios.put(`${API_BASE}/geo/cities/${editingId}`, formData);
        setCities(cities.map(c => c.id === editingId ? { ...c, ...res.data, state: c.state } : c));
        setMsg({ type: "success", text: "City updated!" });
      } else {
        const res = await axios.post(`${API_BASE}/geo/cities`, formData);
        await fetchData();
        setMsg({ type: "success", text: "City added!" });
      }
      resetForm(); setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to save city: " + err.message });
    } finally { setLoading(false); }
  };

  const resetForm = () => { setFormData({ name: "", stateId: 0, status: "Active" }); setEditingId(null); };

  const handleEdit = (city: City) => {
    setFormData({ name: city.name, stateId: city.state.id, status: city.status });
    setEditingId(city.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this city?")) return;
    try {
      await axios.delete(`${API_BASE}/geo/cities/${id}`);
      setCities(cities.filter(c => c.id !== id));
      setMsg({ type: "success", text: "City deleted!" });
    } catch (err: any) { setMsg({ type: "error", text: "Failed to delete." }); }
  };

  const handleBulkDelete = async () => {
    if (!checkedRows.length) { alert("Select cities first!"); return; }
    if (!window.confirm(`Delete ${checkedRows.length} cities?`)) return;
    for (const id of checkedRows) {
      try { await axios.delete(`${API_BASE}/geo/cities/${id}`); } catch {}
    }
    await fetchData(); setCheckedRows([]);
    setMsg({ type: "success", text: "Selected cities deleted!" });
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Building2 size={22} /> Manage Cities</h2>
          <p className="lm-page-subtitle">Dynamic city management via live database — TiDB powered</p>
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
            <label className="lm-label">State</label>
            <select className="lm-select" value={filters.stateId} onChange={e => setFilters({ stateId: e.target.value })}>
              <option value="">All States</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country?.name})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Top Buttons and Search */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button className="lm-btn-primary" onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem" }}>
          <Plus size={16} /> Add City
        </button>
        {checkedRows.length > 0 && (
          <button onClick={handleBulkDelete} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "0.375rem", cursor: "pointer" }}>
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        )}
        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input type="text" className="lm-input" placeholder="Search city name..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} style={{ paddingLeft: "2.5rem" }} />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit City" : "Add New City"}</div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">City Name*</label>
              <input className="lm-input" placeholder="Enter city name" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="lm-field">
              <label className="lm-label">State*</label>
              <select className="lm-select" value={formData.stateId} onChange={e => setFormData({ ...formData, stateId: Number(e.target.value) })}>
                <option value={0}>Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
        <div className="lm-card-title">City Records ({filteredCities.length} total) — Live DB</div>
        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "center", width: "50px" }}>
                  <input type="checkbox" onChange={e => setCheckedRows(e.target.checked ? cities.map(c => c.id) : [])} checked={checkedRows.length === cities.length && cities.length > 0} />
                </th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>S.No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>City Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>State</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Country</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCities.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No cities found in database</td></tr>
              ) : (
                paginatedCities.map((city, idx) => (
                  <tr key={city.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <input type="checkbox" checked={checkedRows.includes(city.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, city.id] : checkedRows.filter(id => id !== city.id))} />
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{city.name}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{city.state?.name}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{city.state?.country?.name}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ padding: "0.3rem 0.7rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600, backgroundColor: city.status === "Active" ? "#d1fae5" : "#fee2e2", color: city.status === "Active" ? "#047857" : "#dc2626" }}>{city.status}</span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => handleEdit(city)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#dbeafe", border: "1px solid #0284c7", borderRadius: "0.375rem", cursor: "pointer" }}><Edit2 size={14} color="#0284c7" /></button>
                        <button onClick={() => handleDelete(city.id)} style={{ padding: "0.4rem 0.7rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "0.375rem", cursor: "pointer" }}><Trash2 size={14} color="#ef4444" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCities.length)} of {filteredCities.length}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: "0.5rem 1rem", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: "0.5rem 1rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
