import React, { useState, useEffect } from "react";
import { PlusCircle, Edit2, Trash2, RefreshCcw, Info, Settings, X, Layers, UserCheck } from "lucide-react";
import { toast } from "../../components/Toast";
import { nomineeAPI } from "../../services/apiService";
import "./NominationTypeSetup.css";

export default function NominationTypeSetup() {
  const [types, setTypes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: null as number|null, name: "", description: "", allowMultiple: "No" });
  
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const res = await nomineeAPI.getTypes();
      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error("Failed to load protocol setup");
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
         ...formData,
         allowMultiple: formData.allowMultiple === "Yes"
      };
      if (formData.id) {
        await nomineeAPI.updateType(formData.id, payload);
        toast.success("Nomination criteria updated");
      } else {
        await nomineeAPI.createType(payload);
        toast.success("New nomination protocol deployed");
      }
      setShowModal(false);
      setFormData({ id: null, name: "", description: "", allowMultiple: "No" });
      fetchTypes();
    } catch (e) {
      toast.error("Criteria synchronization failed");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await nomineeAPI.deleteType(id);
      toast.success("Protocol permanently purged");
      fetchTypes();
    } catch(e) {
      toast.error("Decommissioning failed");
    }
  };

  const openModal = (type: any = null) => {
    if (type) {
      setFormData({ id: type.id, name: type.name, description: type.description || "", allowMultiple: type.allowMultiple ? "Yes" : "No" });
    } else {
      setFormData({ id: null, name: "", description: "", allowMultiple: "No" });
    }
    setShowModal(true);
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="nomination-header">
        <div className="nomination-header-title">
          <h1 className="page-title"><UserCheck size={22} /> Nomination Infrastructure</h1>
          <p className="page-subtitle">Master Orchestration of Beneficiary Protocols</p>
        </div>
        <div className="nomination-header-actions">
          <button onClick={fetchTypes} className="btn btn-secondary shadow-sm">
            <RefreshCcw size={18} />
          </button>
          <button 
            onClick={() => openModal()}
            className="btn btn-primary shadow-glow"
          >
            <PlusCircle size={18} /> Add Criteria
          </button>
        </div>
      </div>

      <div className="nomination-container glass-card">
        {/* Matrix Card */}
        <div className="nomination-main">
          <div className="nomination-card">
            <div className="nomination-card-header">
              <h3>Live Protocol Index</h3>
              <span className="nomination-count-badge">{types.length} Logic Slots</span>
            </div>
            <div className="nomination-table-wrapper">
              <table className="nomination-table">
                <thead>
                  <tr>
                    <th>Sr. No</th>
                    <th>Criteria Identity</th>
                    <th>Logic Description</th>
                    <th>Multi-Slot</th>
                    <th>Audit Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => 
                      <tr key={i}>
                        <td colSpan={6} className="nomination-loading">Synchronizing Matrix...</td>
                      </tr>
                    )
                  ) : types.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="nomination-table-empty">
                        <Info size={48} className="nomination-table-empty-icon" />
                        <p>No nomination criteria found.</p>
                      </td>
                    </tr>
                  ) : types.map((t, idx) => (
                    <tr key={t.id}>
                      <td className="nomination-table-sr">{idx + 1}</td>
                      <td className="nomination-table-name">{t.name}</td>
                      <td className="nomination-table-desc">{t.description || "N/A"}</td>
                      <td>
                        <span className={`nomination-badge ${t.allowMultiple ? 'nomination-badge-enabled' : 'nomination-badge-isolation'}`}>
                          {t.allowMultiple ? "Enabled" : "Isolation"}
                        </span>
                      </td>
                      <td className="nomination-table-date">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="nomination-table-actions">
                        <div className="nomination-actions">
                          <button 
                            onClick={() => openModal(t)}
                            className="nomination-action-btn nomination-action-edit"
                            title="Edit Protocol"
                          >
                            <Edit2 size={16}/>
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="nomination-action-btn nomination-action-delete"
                            title="Delete Protocol"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="nomination-sidebar">
          <div className="nomination-info-card nomination-info-secondary">
            <div className="nomination-info-icon-box">
              <Layers size={20} />
            </div>
            <div className="nomination-info-text">
              <h4>System Integrity</h4>
              <p>All criteria changes trigger an automated audit sync across records.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="nomination-modal-overlay">
          <div className="glass-card nomination-modal">
            <div className="nomination-modal-header">
              <h2 className="nomination-modal-title">{formData.id ? "Edit Protocol" : "Add Protocol Slot"}</h2>
              <button onClick={() => setShowModal(false)} className="nomination-modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="nomination-modal-body">
              <div className="nomination-form-group">
                <label className="nomination-form-label">Protocol Name Identity*</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="nomination-form-input" 
                  placeholder="e.g. Provident Fund, Insurance" 
                  required 
                />
              </div>
              <div className="nomination-form-group">
                <label className="nomination-form-label">Logic Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="nomination-form-input nomination-form-textarea" 
                  placeholder="Protocol details..."
                />
              </div>
              <div className="nomination-form-group">
                <label className="nomination-form-label">Multi-Slot Allocation Threshold*</label>
                <div className="nomination-form-options">
                  {['No', 'Yes'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({...formData, allowMultiple: opt})}
                      className={`nomination-form-option-btn ${formData.allowMultiple === opt ? 'active' : ''}`}
                    >
                      {opt === 'Yes' ? "Multiple Entities" : "Single Isolation"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="nomination-form-actions">
                <button type="submit" className="btn btn-primary nomination-form-submit">Synchronize Type</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary nomination-form-cancel">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
