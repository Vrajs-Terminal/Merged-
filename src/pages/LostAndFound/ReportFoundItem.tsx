import React, { useState, useEffect } from "react";
import { Save, PackageSearch, Calendar, MapPin, User, Info, Phone, Link, CheckCircle, FileText } from "lucide-react";
import { toast } from "../../components/Toast";
import { lostAndFoundAPI, employeeAPI } from "../../services/apiService";
import "./ReportFoundItem.css";

export default function ReportFoundItem() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "Found",
    itemName: "",
    description: "",
    date: "",
    location: "",
    photoUrl: "",
    reportedById: "",
    contactDetails: ""
  });

  useEffect(() => {
    employeeAPI.getAll().then(res => setEmployees(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lostAndFoundAPI.reportItem(formData);
      toast.success("Found item successfully logged into recovery registry");
      setFormData({...formData, itemName: "", description: "", date: "", location: "", photoUrl: "", contactDetails: ""});
    } catch (e: any) {
      toast.error("Recovery registration failure");
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="found-item-header">
        <div className="found-item-header-wrapper">
          <div>
            <h1 className="page-title"><PackageSearch size={22} color="#4f46e5" strokeWidth={2.25} /> Relinquish Found Asset</h1>
            <p className="page-subtitle">Centralized recovery protocol for anomalous items</p>
          </div>
        </div>
      </div>

      <div className="glass-card found-item-card">
        <div className="found-item-alert">
          <CheckCircle size={20} className="found-item-alert-icon" />
          <p className="found-item-alert-text">
            Recovered items are inventoried in the sovereign matrix until a claim matching is detected. Please identify all physical markers carefully.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="found-item-form">
          <div className="found-item-form-full">
            <div className="found-item-form-field">
              <label className="found-item-form-label">Recovered Item Identity*</label>
              <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="found-item-form-input" placeholder="e.g. Wallet, Phone, Access Key, Umbrella..." />
            </div>
          </div>

          <div className="found-item-form-group">
            <div className="found-item-form-field">
              <label className="found-item-form-label">Discovery Date Audit*</label>
              <div className="found-item-form-input-wrapper">
                <Calendar size={18} className="found-item-form-input-icon" />
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="found-item-form-input with-icon" />
              </div>
            </div>

            <div className="found-item-form-field">
              <label className="found-item-form-label">Handover / Hub Location*</label>
              <div className="found-item-form-input-wrapper">
                <MapPin size={18} className="found-item-form-input-icon success" />
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="found-item-form-input with-icon" placeholder="Admin Desk / Security Ledger Terminal" />
              </div>
            </div>

            <div className="found-item-form-field">
              <label className="found-item-form-label">Discovery Personnel (Employee)*</label>
              <div className="found-item-form-input-wrapper">
                <User size={18} className="found-item-form-input-icon" />
                <select required value={formData.reportedById} onChange={e => setFormData({...formData, reportedById: e.target.value})} className="found-item-form-select with-icon">
                  <option value="">Select Employee</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="found-item-form-group">
            <div className="found-item-form-field">
              <label className="found-item-form-label">Discovery Forensic Markers / Details</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="found-item-form-input found-item-form-textarea" placeholder="Provide condition found, color, or content observed to assist in sovereign matching..."></textarea>
            </div>

            <div className="found-item-form-field">
              <label className="found-item-form-label">Emergency Contact Terminal*</label>
              <div className="found-item-form-input-wrapper">
                <Phone size={18} className="found-item-form-input-icon" />
                <input required type="text" value={formData.contactDetails} onChange={e => setFormData({...formData, contactDetails: e.target.value})} className="found-item-form-input with-icon" placeholder="Phone / Internal Extension" />
              </div>
            </div>
          </div>

          <div className="found-item-form-full">
            <div className="found-item-form-field">
              <label className="found-item-form-label">Visual Verification Hash (Cloud Photo URL)</label>
              <div className="found-item-form-input-wrapper">
                <Link size={18} className="found-item-form-input-icon" />
                <input type="text" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="found-item-form-input with-icon" placeholder="https://secure-storage.minerhr.com/recovery-photo.jpg" />
              </div>
            </div>
          </div>

          <div className="found-item-form-actions">
            <button type="button" onClick={() => setFormData({...formData, itemName: "", description: "", date: "", location: "", photoUrl: "", contactDetails: ""})} className="btn btn-secondary found-item-btn-reset">Reset Protocol</button>
            <button type="submit" className="btn btn-primary found-item-btn-submit">
              <FileText size={20} /> Deploy Recovery Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
