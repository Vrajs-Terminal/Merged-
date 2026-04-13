import React, { useState, useEffect } from "react";
import { Save, PackageSearch, Calendar, MapPin, User, Info, Phone, Link, AlertCircle, FileText } from "lucide-react";
import { toast } from "../../components/Toast";
import { lostAndFoundAPI, employeeAPI } from "../../services/apiService";
import "./ReportLostItem.css";

export default function ReportLostItem() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: "Lost",
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
      toast.success("Anomalous loss event successfully registered");
      setFormData({...formData, itemName: "", description: "", date: "", location: "", photoUrl: "", contactDetails: ""});
    } catch (e: any) {
      toast.error("Loss registration protocol failed");
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="lost-item-header">
        <div className="lost-item-header-wrapper">
          <div>
            <h1 className="page-title"><PackageSearch size={22} color="#4f46e5" strokeWidth={2.25} /> Report Anomalous Loss</h1>
            <p className="page-subtitle">Infrastructure isolation protocol for missing hardware</p>
          </div>
        </div>
      </div>

      <div className="glass-card lost-item-card">
        <div className="lost-item-alert">
          <AlertCircle size={20} className="lost-item-alert-icon" />
          <p className="lost-item-alert-text">
            Reports are cryptographically hashed and cannot be deleted once submitted. Please verify all data forensic markers.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="lost-item-form">
          <div className="lost-item-form-full">
            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Anomalous Item Identity*</label>
              <input required type="text" value={formData.itemName} onChange={e => setFormData({...formData, itemName: e.target.value})} className="lost-item-form-input" placeholder="e.g. Blue Dell Laptop, Keys, Corporate Access Card..." />
            </div>
          </div>

          <div className="lost-item-form-group">
            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Last Known Isolation Date*</label>
              <div className="lost-item-form-input-wrapper">
                <Calendar size={18} className="lost-item-form-input-icon" />
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="lost-item-form-input with-icon" />
              </div>
            </div>

            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Terminal / Sector Location*</label>
              <div className="lost-item-form-input-wrapper">
                <MapPin size={18} className="lost-item-form-input-icon danger" />
                <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="lost-item-form-input with-icon" placeholder="Branch / Desk / Area Sector" />
              </div>
            </div>

            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Reporting Entity (Employee)*</label>
              <div className="lost-item-form-input-wrapper">
                <User size={18} className="lost-item-form-input-icon" />
                <select required value={formData.reportedById} onChange={e => setFormData({...formData, reportedById: e.target.value})} className="lost-item-form-select with-icon">
                  <option value="">Select Discovery Personnel</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="lost-item-form-group">
            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Hardware forensic Markers / Details</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="lost-item-form-input lost-item-form-textarea" placeholder="Provide color, brand, or unique identifiers..."></textarea>
            </div>

            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Emergency Contact Terminal*</label>
              <div className="lost-item-form-input-wrapper">
                <Phone size={18} className="lost-item-form-input-icon" />
                <input required type="text" value={formData.contactDetails} onChange={e => setFormData({...formData, contactDetails: e.target.value})} className="lost-item-form-input with-icon" placeholder="Phone / Internal Extension" />
              </div>
            </div>
          </div>

          <div className="lost-item-form-full">
            <div className="lost-item-form-field">
              <label className="lost-item-form-label">Digital Visual Reference (Cloud Photo URL)</label>
              <div className="lost-item-form-input-wrapper">
                <Link size={18} className="lost-item-form-input-icon" />
                <input type="text" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} className="lost-item-form-input with-icon" placeholder="https://secure-storage.minerhr.com/asset-photo.jpg" />
              </div>
            </div>
          </div>

          <div className="lost-item-form-actions">
            <button type="button" onClick={() => setFormData({...formData, itemName: "", description: "", date: "", location: "", photoUrl: "", contactDetails: ""})} className="btn btn-secondary lost-item-btn-reset">Reset Registry</button>
            <button type="submit" className="btn btn-primary lost-item-btn-submit">
              <FileText size={20} /> Deploy Loss Protocol
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
