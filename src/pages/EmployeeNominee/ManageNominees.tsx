import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Search, Eye, AlertCircle, CheckCircle2, XCircle, Filter, UserCheck, Upload, PlusCircle, Shield, Phone, Mail, Percent, X, User, Calendar, FileSpreadsheet } from "lucide-react";
import { nomineeAPI, employeeAPI } from "../../services/apiService";
import * as XLSX from "xlsx";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./ManageNominees.css";

export default function ManageNominees() {
  const [nominees, setNominees] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: "", nominationTypeId: "", nomineeName: "", relation: "", dob: "",
    aadharNumber: "", mobileNo: "", email: "", address: "", nomineePercentage: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [nomsRes, typesRes, empRes] = await Promise.all([
        nomineeAPI.getAll(),
        nomineeAPI.getTypes(),
        employeeAPI.getAll()
      ]);
      setNominees(nomsRes.data);
      setTypes(typesRes.data);
      setEmployees(empRes.data);
    } catch (e) {
      toast.error("Failed to load registry records");
    }
  };

  const handleSave = async () => {
    try {
      await nomineeAPI.create(formData);
      toast.success("Security beneficiary successfully registered");
      setShowAddModal(false);
      setFormData({
        employeeId: "", nominationTypeId: "", nomineeName: "", relation: "", dob: "",
        aadharNumber: "", mobileNo: "", email: "", address: "", nomineePercentage: ""
      });
      fetchInitialData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Beneficiary registration protocol failed");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
      await nomineeAPI.delete(id);
      toast.success("Nominee record permanently purged");
      fetchInitialData();
    } catch(e) {
      toast.error("Deletion protocol failed");
    }
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      try {
        const res = await nomineeAPI.bulkUpload({ nominees: data });
        toast.success(res.data.message);
        setShowBulkUpload(false);
        fetchInitialData();
      } catch (err) {
         toast.error("Bulk synchronization failed");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header manage-nominees-header">
        <div>
           <PageTitle title="Beneficiary Registry" subtitle="Centralized infrastructure for employee security nominations" />
        </div>
        <div className="manage-nominees-actions">
           <button 
             onClick={() => setShowBulkUpload(true)}
             className="btn btn-secondary shadow-sm"
           >
              <Upload size={18} /> Bulk Sync
           </button>
           <button 
             onClick={() => setShowAddModal(true)}
             className="btn btn-primary shadow-glow"
           >
              <PlusCircle size={18} /> Register Nominee
           </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card manage-nominees-card">
        <div className="manage-nominees-card-header">
           <h3 className="manage-nominees-title">Live Beneficiary Matrix</h3>
           <span className="badge manage-nominees-count-badge">{nominees.length} Entities Synchronized</span>
        </div>
        <div className="manage-nominees-table-scroll">
          <table className="table-modern manage-nominees-table">
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Employee Identity</th>
                <th>Beneficiary Name</th>
                <th>Relation</th>
                <th>Audit DOB</th>
                <th>Contact Terminal</th>
                <th>Nomination Type</th>
                <th>Ledger %</th>
                 <th className="manage-nominees-actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {nominees.length === 0 ? (
                <tr>
                   <td colSpan={9} className="manage-nominees-empty">
                     <div className="manage-nominees-empty-icon-wrap">
                          <Shield size={48} color="var(--text-muted)" />
                      </div>
                     <h3 className="manage-nominees-empty-title">Registry Pure</h3>
                     <p className="manage-nominees-empty-desc">Zero active beneficiary records found in current node.</p>
                   </td>
                </tr>
              ) : nominees.map((n, idx) => (
                <tr key={n.id}>
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div style={{ fontWeight: "700", fontSize: "14px" }}>{n.employee?.firstName} {n.employee?.lastName}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ID: {n.employee?.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{n.nomineeName}</td>
                  <td className="px-6 py-4 text-gray-500">{n.relation}</td>
                  <td className="px-6 py-4 text-gray-500">{n.dob ? new Date(n.dob).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-500">
                     <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><Phone size={12} /> {n.mobileNo}</div>
                     {n.email && <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}><Mail size={12} /> {n.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                      {n.nominationType?.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: "800", color: "var(--primary)" }}>
                       <Percent size={14} /> {n.nomineePercentage}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(n.id)} style={{ padding: "6px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                       <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
             <div style={{ padding: "24px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                   <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Nominee Registration</h2>
                   <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Beneficiary Protocol Deployment</p>
                </div>
                <button onClick={() => setShowAddModal(false)} style={{ padding: "8px", borderRadius: "8px", background: "white", border: "1px solid var(--color-border)" }}>
                   <X size={20} />
                </button>
             </div>
             
             <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="label-modern">Employee Identity*</label>
                   <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} className="select-modern">
                     <option value="">Select Target Entity</option>
                     {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="label-modern">Protocol Type*</label>
                   <select value={formData.nominationTypeId} onChange={e => setFormData({...formData, nominationTypeId: e.target.value})} className="select-modern">
                     <option value="">Select Nomination For</option>
                     {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="label-modern">Beneficiary Full Name*</label>
                   <div style={{ position: "relative" }}>
                      <User size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                      <input type="text" value={formData.nomineeName} onChange={e => setFormData({...formData, nomineeName: e.target.value})} className="input-modern" style={{ paddingLeft: "40px" }} placeholder="Legal Name" />
                   </div>
                 </div>
                 <div>
                   <label className="label-modern">Relation*</label>
                   <select value={formData.relation} onChange={e => setFormData({...formData, relation: e.target.value})} className="select-modern">
                     <option value="">Select Correlation</option>
                     <option value="Father">Father</option>
                     <option value="Mother">Mother</option>
                     <option value="Spouse">Spouse</option>
                     <option value="Child">Child</option>
                     <option value="Other">Other</option>
                   </select>
                 </div>
                 <div>
                   <label className="label-modern">Birth Date Audit</label>
                   <div style={{ position: "relative" }}>
                      <Calendar size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                      <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="input-modern" style={{ paddingLeft: "40px" }} />
                   </div>
                 </div>
                 <div>
                   <label className="label-modern">Aadhar Terminal ID*</label>
                   <input type="text" value={formData.aadharNumber} onChange={e => setFormData({...formData, aadharNumber: e.target.value})} className="input-modern" placeholder="0000 0000 0000" />
                 </div>
                 <div>
                   <label className="label-modern">Mobile Terminal No.*</label>
                   <input type="text" value={formData.mobileNo} onChange={e => setFormData({...formData, mobileNo: e.target.value})} className="input-modern" placeholder="+91 XXXXX XXXXX" />
                 </div>
                 <div>
                   <label className="label-modern">Digital Ledger (Email)</label>
                   <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-modern" placeholder="nominee@domain.com" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="label-modern">Nomination Allocation (%)*</label>
                   <div style={{ position: "relative" }}>
                      <Percent size={16} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--primary)" }} />
                      <input type="number" min="1" max="100" value={formData.nomineePercentage} onChange={e => setFormData({...formData, nomineePercentage: e.target.value})} className="input-modern" style={{ paddingLeft: "40px" }} placeholder="e.g. 100" />
                   </div>
                 </div>
                 <div className="md:col-span-2">
                   <label className="label-modern">Physical Domicile Address</label>
                   <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-modern" style={{ minHeight: "80px" }} placeholder="Full Residence Details..."></textarea>
                 </div>
               </div>
               
               <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                 <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, padding: "12px" }}>Synchronize Beneficiary</button>
                 <button onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Discard Protocol</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Bulk Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md animate-fade-in" style={{ padding: 0, overflow: "hidden" }}>
             <div style={{ padding: "24px", background: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)" }}>Matrix Bulk Integration</h2>
                <button onClick={() => setShowBulkUpload(false)} style={{ padding: "8px", borderRadius: "8px", background: "white", border: "1px solid var(--color-border)" }}>
                   <X size={20} />
                </button>
             </div>
             <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ background: "rgba(79, 70, 229, 0.04)", padding: "16px", borderRadius: "12px", border: "1px solid var(--primary-light)" }}>
                   <p style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FileSpreadsheet size={16} /> Matrix columns required:
                   </p>
                   <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.6" }}>
                      employeeId, nomineeName, relation, nominationType, percentage, mobileNo, aadharNumber
                   </p>
                </div>
                <input type="file" accept=".xlsx, .xls" onChange={handleBulkUpload} className="input-modern" />
                <button onClick={() => setShowBulkUpload(false)} className="btn btn-secondary w-full">Abort Synchronization</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

