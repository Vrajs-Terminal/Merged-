import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Upload, Trash2, Edit2, Filter, Search, Save, CheckCircle, AlertCircle, Building2
} from "lucide-react";
import API_BASE from "../api";
import "./ManageCities.css";

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
  const activeCities = cities.filter(city => city.status === "Active").length;
  const selectedVisible = checkedRows.filter(id => filteredCities.some(city => city.id === id)).length;

  const handleSave = async () => {
    if (!formData.name || !formData.stateId) { alert("All fields are required!"); return; }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/geo/cities/${editingId}`, formData);
        setMsg({ type: "success", text: "City updated!" });
      } else {
        await axios.post(`${API_BASE}/geo/cities`, formData);
        setMsg({ type: "success", text: "City added!" });
      }
      await fetchData();
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
    <div className="lm-container lm-fade city-page-shell">
      <div className="city-hero">
        <div className="city-hero-copy">
          <span className="city-eyebrow">Location Operations</span>
          <h2 className="lm-page-title"><Building2 size={22} /> Manage Cities</h2>
          <p className="lm-page-subtitle">Dynamic city management via live database — TiDB powered, cleaner, and easier to scan.</p>
        </div>
        <div className="city-hero-stats">
          <div className="city-stat-card">
            <span>Total Cities</span>
            <strong>{cities.length}</strong>
          </div>
          <div className="city-stat-card">
            <span>Active</span>
            <strong>{activeCities}</strong>
          </div>
          <div className="city-stat-card">
            <span>Selected</span>
            <strong>{selectedVisible}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`city-alert ${msg.type === "error" ? "city-alert-error" : "city-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="city-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="city-filters-card">
        <div className="city-card-head">
          <div className="city-card-title">
            <Filter size={18} />
            <div>
              <h3>Filters</h3>
              <p>Refine by state to focus on the city records you need.</p>
            </div>
          </div>
        </div>
        <div className="city-filter-grid">
          <div className="lm-field">
            <label className="lm-label">State</label>
            <select className="lm-select" value={filters.stateId} onChange={e => setFilters({ stateId: e.target.value })}>
              <option value="">All States</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country?.name})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="city-toolbar">
        <div className="city-toolbar-actions">
          <button className="city-primary-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add City
          </button>
          {checkedRows.length > 0 && (
            <button onClick={handleBulkDelete} className="city-danger-btn">
              <Trash2 size={16} /> Delete Selected ({checkedRows.length})
            </button>
          )}
        </div>
        <div className="city-search-wrap">
          <Search size={16} className="city-search-icon" />
          <input type="text" className="lm-input city-search-input" placeholder="Search city name..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {showForm && (
        <div className="city-form-card">
          <div className="city-card-head city-card-head-form">
            <div className="city-card-title">
              <Save size={18} />
              <div>
                <h3>{editingId ? "Edit City" : "Add New City"}</h3>
                <p>Create or update city records with a cleaner and more structured form.</p>
              </div>
            </div>
          </div>
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
            <div className="city-form-actions lm-col-4">
              <button className="city-primary-btn" onClick={handleSave} disabled={loading}>
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button className="city-secondary-btn" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="city-table-card">
        <div className="city-card-head city-table-head">
          <div className="city-card-title">
            <Building2 size={18} />
            <div>
              <h3>City Records ({filteredCities.length} total)</h3>
              <p>Live DB data with bulk selection, edit, and delete actions.</p>
            </div>
          </div>
          <span className="city-table-badge">Live DB</span>
        </div>
        <div className="lm-table-wrap">
          <table className="lm-table city-table">
            <thead>
              <tr>
                <th className="city-check-col">
                  <input type="checkbox" onChange={e => setCheckedRows(e.target.checked ? cities.map(c => c.id) : [])} checked={checkedRows.length === cities.length && cities.length > 0} />
                </th>
                <th>S.No</th>
                <th>City Name</th>
                <th>State</th>
                <th>Country</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCities.length === 0 ? (
                <tr><td colSpan={7} className="city-empty-state">No cities found in database</td></tr>
              ) : (
                paginatedCities.map((city, idx) => (
                  <tr key={city.id}>
                    <td className="city-check-col">
                      <input type="checkbox" checked={checkedRows.includes(city.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, city.id] : checkedRows.filter(id => id !== city.id))} />
                    </td>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="city-name-cell">{city.name}</td>
                    <td>{city.state?.name}</td>
                    <td>{city.state?.country?.name}</td>
                    <td>
                      <span className={`city-status-pill ${city.status === "Active" ? "is-active" : "is-inactive"}`}>{city.status}</span>
                    </td>
                    <td>
                      <div className="city-row-actions">
                        <button onClick={() => handleEdit(city)} className="city-icon-btn is-edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(city.id)} className="city-icon-btn is-delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="city-pagination">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredCities.length)} of {filteredCities.length}</span>
            <div className="city-pagination-actions">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
