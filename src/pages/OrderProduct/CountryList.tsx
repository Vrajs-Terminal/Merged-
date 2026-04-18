import { useState } from "react";
import {
  Plus,
  Upload,
  Trash2,
  Edit2,
  Search,
  Save,
  CheckCircle,
  AlertCircle,
  Globe
} from "lucide-react";
import "./CountryList.css";

interface Country {
  id: number;
  countryName: string;
  countryCode: string;
  currency: string;
  phoneCode: string;
  status: "Active" | "Inactive";
  createdAt?: string;
}

export default function CountryList() {
  const [countries, setCountries] = useState<Country[]>([
    { id: 1, countryName: "India", countryCode: "IN", currency: "INR", phoneCode: "+91", status: "Active" },
    { id: 2, countryName: "United Arab Emirates", countryCode: "AE", currency: "AED", phoneCode: "+971", status: "Active" },
    { id: 3, countryName: "United States", countryCode: "US", currency: "USD", phoneCode: "+1", status: "Active" },
    { id: 4, countryName: "United Kingdom", countryCode: "GB", currency: "GBP", phoneCode: "+44", status: "Inactive" }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  const [formData, setFormData] = useState<Omit<Country, "id" | "createdAt">>({
    countryName: "",
    countryCode: "",
    currency: "",
    phoneCode: "",
    status: "Active"
  });

  const itemsPerPage = 25;

  const filteredCountries = countries.filter(country =>
    country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCountries = filteredCountries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCountries.length / itemsPerPage);
  const activeCountries = countries.filter(country => country.status === "Active").length;
  const selectedVisible = checkedRows.filter(id => filteredCountries.some(country => country.id === id)).length;

  const handleSave = async () => {
    if (!formData.countryName || !formData.countryCode || !formData.currency || !formData.phoneCode) {
      alert("All fields are required!");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        setCountries(countries.map(c => c.id === editingId ? { ...c, ...formData } : c));
        setMsg({ type: "success", text: "Country updated successfully!" });
      } else {
        const newCountry = { id: Math.max(...countries.map(c => c.id), 0) + 1, ...formData };
        setCountries([...countries, newCountry]);
        setMsg({ type: "success", text: "Country added successfully!" });
      }
      resetForm();
      setShowForm(false);
    } catch {
      setMsg({ type: "error", text: "Failed to save country." });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ countryName: "", countryCode: "", currency: "", phoneCode: "", status: "Active" });
    setEditingId(null);
  };

  const handleEdit = (country: Country) => {
    setFormData(country);
    setEditingId(country.id);
    setShowForm(true);
  };

  const handleToggleStatus = (id: number) => {
    setCountries(countries.map(c =>
      c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
    ));
    setMsg({ type: "success", text: "Country status updated!" });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this country?")) {
      setCountries(countries.filter(c => c.id !== id));
      setMsg({ type: "success", text: "Country deleted successfully!" });
    }
  };

  const handleBulkDelete = () => {
    if (checkedRows.length === 0) {
      alert("Select countries to delete!");
      return;
    }
    if (window.confirm(`Delete ${checkedRows.length} country(ies)?`)) {
      setCountries(countries.filter(c => !checkedRows.includes(c.id)));
      setCheckedRows([]);
      setMsg({ type: "success", text: "Countries deleted successfully!" });
    }
  };

  const handleImportBulk = () => {
    const csvHeader = "Country Name,Country Code,Currency,Phone Code,Status\n";
    const csvExample = "India,IN,INR,+91,Active\nUSA,US,USD,+1,Active";
    const csvContent = csvHeader + csvExample;
    
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
    element.setAttribute("download", "countries_template.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setMsg({ type: "success", text: "CSV template downloaded!" });
  };

  return (
    <div className="lm-container lm-fade country-page-shell">
      <div className="country-hero">
        <div className="country-hero-copy">
          <span className="country-eyebrow">Location Operations</span>
          <h2 className="lm-page-title"><Globe size={22} /> Country List</h2>
          <p className="lm-page-subtitle">Manage countries and control availability across all location-based modules.</p>
        </div>
        <div className="country-hero-stats">
          <div className="country-stat-card">
            <span>Total Countries</span>
            <strong>{countries.length}</strong>
          </div>
          <div className="country-stat-card">
            <span>Active</span>
            <strong>{activeCountries}</strong>
          </div>
          <div className="country-stat-card">
            <span>Selected</span>
            <strong>{selectedVisible}</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`country-alert ${msg.type === "error" ? "country-alert-error" : "country-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="country-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="country-toolbar">
        <div className="country-toolbar-actions">
          <button className="country-primary-btn" onClick={() => { resetForm(); setShowForm(true); }}>
            <Plus size={16} /> Add Country
          </button>
          <button className="country-amber-btn" onClick={handleImportBulk}>
            <Upload size={16} /> Import Bulk
          </button>
          {checkedRows.length > 0 && (
            <button className="country-danger-btn" onClick={handleBulkDelete}>
              <Trash2 size={16} /> Delete Selected ({checkedRows.length})
            </button>
          )}
        </div>

        <div className="country-search-wrap">
          <Search size={16} className="country-search-icon" />
          <input
            type="text"
            className="lm-input country-search-input"
            placeholder="Search country name or code..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {showForm && (
        <div className="country-form-card">
          <div className="country-card-head country-card-head-form">
            <div className="country-card-title">
              <Save size={18} />
              <div>
                <h3>{editingId ? "Edit Country" : "Add New Country"}</h3>
                <p>Create or update a country record with code, currency, and phone prefix.</p>
              </div>
            </div>
          </div>
          <div className="lm-form-grid">
            <div className="lm-field lm-col-2">
              <label className="lm-label">Country Name*</label>
              <input
                className="lm-input"
                placeholder="Enter country name"
                value={formData.countryName}
                onChange={e => setFormData({ ...formData, countryName: e.target.value })}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Country Code*</label>
              <input
                className="lm-input"
                placeholder="e.g., IN, US, AE"
                value={formData.countryCode}
                onChange={e => setFormData({ ...formData, countryCode: e.target.value.toUpperCase() })}
                maxLength={2}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Currency*</label>
              <input
                className="lm-input"
                placeholder="e.g., INR, USD"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                maxLength={3}
              />
            </div>
            <div className="lm-field">
              <label className="lm-label">Phone Code*</label>
              <input
                className="lm-input"
                placeholder="e.g., +91, +1"
                value={formData.phoneCode}
                onChange={e => setFormData({ ...formData, phoneCode: e.target.value })}
              />
            </div>
            <div className="lm-field lm-col-2">
              <label className="lm-label">Status</label>
              <select
                className="lm-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as "Active" | "Inactive" })}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="country-form-actions lm-col-2">
              <button className="country-primary-btn" onClick={handleSave} disabled={loading}>
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button className="country-secondary-btn" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="country-table-card">
        <div className="country-card-head country-table-head">
          <div className="country-card-title">
            <Globe size={18} />
            <div>
              <h3>Country Records ({filteredCountries.length} total)</h3>
              <p>Live country data with bulk selection, toggling, editing, and removal actions.</p>
            </div>
          </div>
          <span className="country-table-badge">Live DB</span>
        </div>
        <div className="lm-table-wrap">
          <table className="lm-table country-table">
            <thead>
              <tr>
                <th className="country-check-col">
                  <input
                    type="checkbox"
                    onChange={e => setCheckedRows(e.target.checked ? countries.map(c => c.id) : [])}
                    checked={checkedRows.length === countries.length && countries.length > 0}
                  />
                </th>
                <th>S.No</th>
                <th>Country Name</th>
                <th>Code</th>
                <th>Currency</th>
                <th>Phone Code</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCountries.length === 0 ? (
                <tr><td colSpan={8} className="country-empty-state">No countries found</td></tr>
              ) : (
                paginatedCountries.map((country, idx) => (
                  <tr key={country.id}>
                    <td className="country-check-col">
                      <input
                        type="checkbox"
                        checked={checkedRows.includes(country.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, country.id] : checkedRows.filter(id => id !== country.id))}
                      />
                    </td>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td className="country-name-cell">{country.countryName}</td>
                    <td>{country.countryCode}</td>
                    <td>{country.currency}</td>
                    <td>{country.phoneCode}</td>
                    <td>
                      <span className={`country-status-pill ${country.status === "Active" ? "is-active" : "is-inactive"}`}>
                        {country.status}
                      </span>
                    </td>
                    <td>
                      <div className="country-row-actions">
                        <button onClick={() => handleEdit(country)} className="country-icon-btn is-edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleToggleStatus(country.id)} className="country-icon-btn is-toggle">⟺</button>
                        <button onClick={() => handleDelete(country.id)} className="country-icon-btn is-delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="country-pagination">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} entries
            </span>
            <div className="country-pagination-actions">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "is-active" : ""}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="country-benefits-card">
        <div className="country-section-head">
          <div>
            <span className="country-section-kicker">Benefits</span>
            <h3>Built for cleaner location control</h3>
          </div>
        </div>
        <div className="country-benefits-grid">
          <div className="country-benefit-item">
            <h4>Central control for location data</h4>
            <p>Manage all countries from one place.</p>
          </div>
          <div className="country-benefit-item">
            <h4>Prevents unused countries appearing</h4>
            <p>Hide inactive countries from the system.</p>
          </div>
          <div className="country-benefit-item">
            <h4>Clean location hierarchy</h4>
            <p>Keep the country-state-city structure organized.</p>
          </div>
          <div className="country-benefit-item">
            <h4>Better integration across modules</h4>
            <p>Keep every location-based module aligned.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
