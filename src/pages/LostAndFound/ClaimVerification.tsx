import React, { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, FileText, User, Info, Shield, Scale, X, RefreshCcw, PackageSearch } from "lucide-react";
import { toast } from "../../components/Toast";
import { lostAndFoundAPI, employeeAPI } from "../../services/apiService";
import "./ClaimVerification.css";

export default function ClaimVerification() {
  const [claims, setClaims] = useState<any[]>([]);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ itemId: "", claimedById: "", proofDescription: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [claimsRes, empRes, itemsRes] = await Promise.all([
        lostAndFoundAPI.getClaims().catch(() => ({ data: [] })),
        employeeAPI.getAll().catch(() => ({ data: [] })),
        lostAndFoundAPI.getItems({ status: 'Open' }).catch(() => ({ data: [] }))
      ]);
      setClaims(Array.isArray(claimsRes?.data) ? claimsRes.data : Array.isArray(claimsRes?.data?.data) ? claimsRes.data.data : []);
      setEmployees(Array.isArray(empRes?.data) ? empRes.data : Array.isArray(empRes?.data?.data) ? empRes.data.data : []);
      setItems(Array.isArray(itemsRes?.data) ? itemsRes.data : Array.isArray(itemsRes?.data?.data) ? itemsRes.data.data : []);
    } catch (e) {
      toast.info("ℹ️ Operating in offline mode - some data may not be synced");
      setClaims([]);
      setEmployees([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyClaim = async (id: number, status: string) => {
    if(!confirm(`Are you sure you want to enforce "${status}" protocol on this claim?`)) return;
    try {
      const userRaw = localStorage.getItem("user");
      const currentUser = userRaw ? JSON.parse(userRaw) : null;
      await lostAndFoundAPI.verifyClaim(id, { status, approvedById: currentUser?.id });
      toast.success("Claim status transitioned: " + status);
      fetchInitialData();
    } catch (e) {
      toast.error("Verification protocol failure");
    }
  };

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lostAndFoundAPI.claimItem(formData);
      toast.success("Sovereign claim successfully registered for matching");
      setShowClaimModal(false);
      setFormData({ itemId: "", claimedById: "", proofDescription: "" });
      fetchInitialData();
    } catch (e) {
      toast.error("Claim submission protocol failed");
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="claim-header">
        <div className="claim-header-title">
          <h1 className="page-title"><PackageSearch size={22} color="#4f46e5" strokeWidth={2.25} /> Claim & Recovery Verification</h1>
          <p className="page-subtitle">Sovereign adjudication matrix for recovered infrastructure</p>
        </div>
        <div className="claim-header-actions">
          <button onClick={fetchInitialData} className="btn btn-secondary shadow-sm">
            <RefreshCcw size={18} />
          </button>
          <button 
            onClick={() => setShowClaimModal(true)}
            className="btn btn-primary shadow-glow"
          >
            <FileText size={18} /> New Claim Protocol
          </button>
        </div>
      </div>

      <div className="claim-container glass-card">
        {/* Claims Matrix Card */}
        <div className="claim-main">
          <div className="claim-card">
            <div className="claim-card-header">
              <h3>Pending Claims Registry</h3>
              <span className="claim-count-badge">{claims.length} Active Protocols</span>
            </div>
            <div className="claim-table-wrapper">
              <table className="claim-table">
                <thead>
                  <tr>
                    <th>Asset Identity</th>
                    <th>Claiming Entity</th>
                    <th>Validation Proof</th>
                    <th>Protocol State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => 
                      <tr key={i}>
                        <td colSpan={5} className="claim-loading">Synchronizing Matrix...</td>
                      </tr>
                    )
                  ) : claims.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="claim-table-empty">
                        <Scale size={48} className="claim-table-empty-icon" />
                        <h3 className="claim-table-empty-title">Zero Adjudications Required</h3>
                        <p className="claim-table-empty-desc">
                          No active claims found in the current audit window.
                        </p>
                      </td>
                    </tr>
                  ) : claims.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="claim-table-item">
                          <div className="claim-table-item-name">{c.item?.itemName}</div>
                          <div className="claim-table-item-meta">{c.item?.type} | {c.item?.location}</div>
                        </div>
                      </td>
                      <td>
                        <div className="claim-table-claimant">
                          <div className="claim-table-avatar">
                            <User size={14} className="claim-table-avatar-icon" />
                          </div>
                          <span className="claim-table-claimant-name">{c.claimedBy?.firstName} {c.claimedBy?.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="claim-table-proof">{c.proofDescription}</div>
                      </td>
                      <td>
                        <span className={`claim-badge ${
                          c.status === 'Approved' ? 'claim-badge-approved' : 
                          c.status === 'Rejected' ? 'claim-badge-rejected' : 
                          'claim-badge-pending'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="claim-table-actions">
                        {c.status === 'Pending' && (
                          <div className="claim-action-buttons">
                            <button 
                              onClick={() => verifyClaim(c.id, 'Approved')}
                              className="claim-action-btn claim-action-approve"
                              title="Approve Claim"
                            >
                              <CheckCircle size={18}/>
                            </button>
                            <button 
                              onClick={() => verifyClaim(c.id, 'Rejected')}
                              className="claim-action-btn claim-action-reject"
                              title="Reject Claim"
                            >
                              <XCircle size={18}/>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="claim-sidebar">
          <div className="claim-info-card claim-info-secondary">
            <div className="claim-info-icon-box">
              <Info size={20} />
            </div>
            <div className="claim-info-text">
              <h4>System Guard</h4>
              <p>False claims are flagged by the integrity engine.</p>
            </div>
          </div>
        </div>
      </div>

      {showClaimModal && (
        <div className="claim-modal-overlay">
          <div className="glass-card claim-modal">
            <div className="claim-modal-header">
              <h2 className="claim-modal-title">Submit Recovery Claim</h2>
              <button onClick={() => setShowClaimModal(false)} className="claim-modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitClaim} className="claim-modal-body">
              <div className="claim-form-group">
                <label className="claim-form-label">Target Item from Registry*</label>
                <select 
                  required 
                  value={formData.itemId} 
                  onChange={e => setFormData({...formData, itemId: e.target.value})} 
                  className="claim-form-select"
                >
                  <option value="">Choose item...</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.itemName} ({i.type} at {i.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="claim-form-group">
                <label className="claim-form-label">Claiming Entity (Employee)*</label>
                <select 
                  required 
                  value={formData.claimedById} 
                  onChange={e => setFormData({...formData, claimedById: e.target.value})} 
                  className="claim-form-select"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="claim-form-group">
                <label className="claim-form-label">Validation Proof / Forensic Markers*</label>
                <textarea 
                  required 
                  value={formData.proofDescription} 
                  onChange={e => setFormData({...formData, proofDescription: e.target.value})} 
                  className="claim-form-input claim-form-textarea"
                  placeholder="Describe proof like password, unique content, physical scratches, or original serial..."
                />
              </div>
              <div className="claim-form-actions">
                <button type="submit" className="btn btn-primary claim-form-submit">Synchronize Claim</button>
                <button type="button" onClick={() => setShowClaimModal(false)} className="btn btn-secondary claim-form-cancel">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
