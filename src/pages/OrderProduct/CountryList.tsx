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
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Globe size={22} /> Country List</h2>
          <p className="lm-page-subtitle">Manage countries and control availability across all location-based modules</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Top Buttons and Search */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <button
          className="lm-btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#6366f1";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Plus size={16} /> Add Country
        </button>
        <button
          className="lm-btn-secondary"
          onClick={handleImportBulk}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 1.2rem", backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "0.375rem", cursor: "pointer", transition: "all 0.3s ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fde68a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fef3c7";
          }}
        >
          <Upload size={16} /> Import Bulk
        </button>
        {checkedRows.length > 0 && (
          <button
            className="action-btn action-btn-delete"
            onClick={handleBulkDelete}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "6px 12px" }}
          >
            <Trash2 size={16} /> Delete Selected ({checkedRows.length})
          </button>
        )}

        <div style={{ marginLeft: "auto", position: "relative", minWidth: "250px" }}>
          <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            className="lm-input"
            placeholder="Search country name or code..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="lm-card" style={{ marginBottom: "2rem", borderLeft: "4px solid #6366f1", backgroundColor: "#f8fafc" }}>
          <div className="lm-card-title">{editingId ? "Edit Country" : "Add New Country"}</div>
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
            <div className="lm-form-footer lm-col-2" style={{ display: "flex", gap: "1rem" }}>
              <button
                className="lm-btn-primary"
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  opacity: loading ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#4f46e5";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = "#6366f1";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                <Save size={14} /> {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="lm-btn-secondary"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{
                  flex: 1,
                  padding: "0.7rem 1rem",
                  backgroundColor: "#e2e8f0",
                  color: "#475569",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#cbd5e1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#e2e8f0";
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="lm-card">
        <div className="lm-card-title">Country Records ({filteredCountries.length} total)</div>
        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "center", width: "50px" }}>
                  <input
                    type="checkbox"
                    onChange={e => setCheckedRows(e.target.checked ? countries.map(c => c.id) : [])}
                    checked={checkedRows.length === countries.length && countries.length > 0}
                  />
                </th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>S.No</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Country Name</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Code</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Currency</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Phone Code</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Status</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCountries.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No countries found</td></tr>
              ) : (
                paginatedCountries.map((country, idx) => (
                  <tr
                    key={country.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "white" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background-color 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "white" : "#f8fafc";
                    }}
                  >
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={checkedRows.includes(country.id)}
                        onChange={e => setCheckedRows(e.target.checked ? [...checkedRows, country.id] : checkedRows.filter(id => id !== country.id))}
                      />
                    </td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td style={{ padding: "1rem", fontWeight: 600, color: "#1f2937" }}>{country.countryName}</td>
                    <td style={{ padding: "1rem", color: "#475569", fontWeight: 500 }}>{country.countryCode}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{country.currency}</td>
                    <td style={{ padding: "1rem", color: "#475569" }}>{country.phoneCode}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        className="lm-badge"
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: country.status === "Active" ? "#d1fae5" : "#fee2e2",
                          color: country.status === "Active" ? "#047857" : "#dc2626"
                        }}
                      >
                        {country.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleEdit(country)}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#dbeafe",
                            border: "1px solid #0284c7",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#bfdbfe";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#dbeafe";
                          }}
                        >
                          <Edit2 size={14} color="#0284c7" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(country.id)}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#d1d5db",
                            border: "1px solid #9ca3af",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#6b7280"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#b4b8bf";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#d1d5db";
                          }}
                        >
                          ⟺
                        </button>
                        <button
                          onClick={() => handleDelete(country.id)}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#fee2e2",
                            border: "1px solid #ef4444",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fecaca";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#fee2e2";
                          }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderTop: "1px solid #e2e8f0" }}>
            <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCountries.length)} of {filteredCountries.length} entries
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{ padding: "0.5rem 1rem", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: currentPage === page ? "#6366f1" : "#e2e8f0",
                    color: currentPage === page ? "white" : "#475569",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer"
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: "0.5rem 1rem", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #10b981", marginTop: "2rem" }}>
        <div className="lm-card-title" style={{ color: "#047857" }}>✓ Benefits</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Central control for location data</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Manage all countries from one place</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Prevents unused countries appearing</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Hide inactive countries from system</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Clean location hierarchy</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Organized country-state-city structure</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Better integration across modules</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Linked with all location-based modules</p>
          </div>
        </div>
      </div>
    </div>
  );
}
