import { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Trash2, Edit2, Eye, Filter, Search, Save, CheckCircle, AlertCircle, MapPin
} from "lucide-react";
import "./ManageArea.css";

interface City { id: number; name: string; state: { name: string; country: { name: string } } }
interface Area {
  id: number; name: string; status: string;
  city: { id: number; name: string; state: { name: string; country: { name: string } } };
}

export default function ManageArea() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [filters, setFilters] = useState({ cityId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({ name: "", cityId: 0, status: "Active" });
  const itemsPerPage = 25;

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [areasRes, citiesRes] = await Promise.all([
        axios.get('/api/geo/areas'),
        axios.get('/api/geo/cities')
      ]);
      const safeAreas = Array.isArray(areasRes?.data)
        ? areasRes.data
        : Array.isArray(areasRes?.data?.data)
          ? areasRes.data.data
          : [];
      const safeCities = Array.isArray(citiesRes?.data)
        ? citiesRes.data
        : Array.isArray(citiesRes?.data?.data)
          ? citiesRes.data.data
          : [];
      setAreas(safeAreas);
      setCities(safeCities);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load: " + err.message });
    }
  };

  const filteredAreas = areas.filter(a =>
    (!filters.cityId || a.city?.id?.toString() === filters.cityId) &&
    (a.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedAreas = filteredAreas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const activeAreas = areas.filter(area => area.status === "Active").length;
  const selectedVisible = checkedRows.filter(id => filteredAreas.some(area => area.id === id)).length;

  const handleSave = async () => {
    if (!formData.name || !formData.cityId) { alert("All fields required!"); return; }
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/geo/areas/${editingId}`, formData);
        await fetchData();
        setMsg({ type: "success", text: "Area updated!" });
      } else {
        await axios.post('/api/geo/areas', formData);
        await fetchData();
        setMsg({ type: "success", text: "Area added!" });
      }
      resetForm(); setShowForm(false);
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to save: " + err.message });
    } finally { setLoading(false); }
  };

  const resetForm = () => { setFormData({ name: "", cityId: 0, status: "Active" }); setEditingId(null); };

  const handleEdit = (area: Area) => {
    setFormData({ name: area.name, cityId: area.city.id, status: area.status });
    setEditingId(area.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this area?")) return;
    try {
      await axios.delete(`/api/geo/areas/${id}`);
      setAreas(areas.filter(a => a.id !== id));
      setMsg({ type: "success", text: "Area deleted!" });
    } catch { setMsg({ type: "error", text: "Failed." }); }
  };

  const handleBulkDelete = async () => {
    if (!checkedRows.length) { alert("Select areas first!"); return; }
    if (!window.confirm(`Delete ${checkedRows.length} areas?`)) return;
    for (const id of checkedRows) { try { await axios.delete(`/api/geo/areas/${id}`); } catch {} }
    await fetchData(); setCheckedRows([]);
    setMsg({ type: "success", text: "Deleted!" });
  };

  return (
    <div className="lm-container lm-fade area-page-shell">
      <div className="area-hero">
        <div className="area-hero-copy">
          <span className="area-eyebrow">Location Operations</span>
          <h2 className="lm-page-title"><MapPin size={22} /> Manage Area</h2>
          <p className="lm-page-subtitle">Dynamic area management via live TiDB API with clearer controls and faster scanning.</p>
        </div>
        <div className="area-hero-stats">
          <div className="area-stat-card">
            <span>Total Areas</span>
            <strong>{areas.length}</strong>
          </div>
          <div className="area-stat-card">
            <span>Active</span>
            <strong>{activeAreas}</strong>
          </div>
          <div className="area-stat-card">
            <span>Selected</span>
            <strong>{selectedVisible}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`area-alert ${msg.type === "error" ? "area-alert-error" : "area-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="area-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="area-filters-card">
        <div className="area-card-head">
          <div className="area-card-title">
            <Filter size={18} />
            <div>
              <h3>Filters</h3>
              <p>Refine by city to focus on the exact area set you need.</p>
            </div>
          </div>
        </div>
        <div className="area-filter-grid">
          <div className="lm-field">
            <label className="lm-label">City</label>
            <select className="lm-select" value={filters.cityId} onChange={e => setFilters({ cityId: e.target.value })}>
              <option value="">All Cities</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="area-toolbar">
        <div className="area-toolbar-actions">
          <button className="area-primary-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Area
          </button>
          {checkedRows.length > 0 && (
            <button onClick={handleBulkDelete} className="area-danger-btn">
              <Trash2 size={16} /> Delete Selected ({checkedRows.length})
            </button>
          )}
        </div>
        <div className="area-search-wrap">
          <Search size={16} className="area-search-icon" />
          <input type="text" className="lm-input area-search-input" placeholder="Search area..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      {showForm && (
        <div className="area-form-card">
          <div className="area-card-head area-card-head-form">
            <div className="area-card-title">
              <Save size={18} />
              <div>
                <h3>{editingId ? "Edit Area" : "Add New Area"}</h3>
                <p>Capture the area details and keep city-level records organized.</p>
              </div>
            </div>
          </div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Area Name*</label>
              <input className="lm-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Area name" />
            </div>
            <div className="lm-field">
              <label className="lm-label">City*</label>
              <select className="lm-select" value={formData.cityId} onChange={e => setFormData({ ...formData, cityId: Number(e.target.value) })}>
                <option value={0}>Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="lm-field">
              <label className="lm-label">Status</label>
              <select className="lm-select" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="area-form-actions lm-col-4">
              <button className="area-primary-btn" onClick={handleSave} disabled={loading}>
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button className="area-secondary-btn" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="area-table-card">
        <div className="area-card-head area-table-head">
          <div className="area-card-title">
            <MapPin size={18} />
            <div>
              <h3>Area Records ({filteredAreas.length} total)</h3>
              <p>Live DB data with bulk selection, quick view, edit, and delete actions.</p>
            </div>
          </div>
          <span className="area-table-badge">Live DB</span>
        </div>
        <div className="lm-table-wrap">
          <table className="lm-table area-table">
            <thead>
              <tr>
                <th className="area-check-col">
                  <input type="checkbox" onChange={e => setCheckedRows(e.target.checked ? areas.map(a => a.id) : [])} checked={checkedRows.length === areas.length && areas.length > 0} />
                </th>
                <th>S.No</th>
                <th>Area Name</th>
                <th>City</th>
                <th>State</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAreas.length === 0 ? (
                <tr><td colSpan={7} className="area-empty-state">No areas in database — add one to start!</td></tr>
              ) : (
                paginatedAreas.map((area, idx) => (
                  <tr key={area.id}>
                    <td className="area-check-col">
                      <input type="checkbox" checked={checkedRows.includes(area.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, area.id] : checkedRows.filter(id => id !== area.id))} />
                    </td>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="area-name-cell">{area.name}</td>
                    <td>{area.city?.name}</td>
                    <td>{area.city?.state?.name}</td>
                    <td>
                      <span className={`area-status-pill ${area.status === "Active" ? "is-active" : "is-inactive"}`}>{area.status}</span>
                    </td>
                    <td>
                      <div className="area-row-actions">
                        <button className="area-icon-btn is-view" onClick={() => { setSelectedArea(area); setShowViewModal(true); }}><Eye size={14} /></button>
                        <button className="area-icon-btn is-edit" onClick={() => handleEdit(area)}><Edit2 size={14} /></button>
                        <button className="area-icon-btn is-delete" onClick={() => handleDelete(area.id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="area-pagination">
            <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredAreas.length)}–{Math.min(currentPage * itemsPerPage, filteredAreas.length)} of {filteredAreas.length}</span>
            <div className="area-pagination-actions">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showViewModal && selectedArea && (
        <div className="area-modal-overlay">
          <div className="area-modal">
            <div className="area-modal-head">
              <div>
                <span className="area-eyebrow">Area Details</span>
                <h3>View Area</h3>
              </div>
            </div>
            <div className="area-modal-body">
              <div className="area-detail-row"><span>Area</span><strong>{selectedArea.name}</strong></div>
              <div className="area-detail-row"><span>City</span><strong>{selectedArea.city?.name}</strong></div>
              <div className="area-detail-row"><span>State</span><strong>{selectedArea.city?.state?.name}</strong></div>
              <div className="area-detail-row"><span>Status</span><strong>{selectedArea.status}</strong></div>
            </div>
            <button onClick={() => setShowViewModal(false)} className="area-modal-close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
