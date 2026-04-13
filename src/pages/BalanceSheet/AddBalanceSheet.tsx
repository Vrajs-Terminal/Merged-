import React, { useEffect, useState } from "react";
import { PlusCircle, Calendar, IndianRupee, UploadCloud, Save, AlertCircle, Loader2, TrendingUp } from "lucide-react";
import { ledgerAPI, branchAPI } from "../../services/apiService";

const AddBalanceSheet: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    branchId: "",
    date: new Date().toISOString().split('T')[0],
    amount: "",
    type: "",
    paymentMode: "Cash on Hand",
    remark: "",
  });

  const fetchBranches = async () => {
    try {
      const response = await branchAPI.getAll();
      setBranches(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.category || !formData.amount || !formData.type) {
      alert("Please fill all required fields marked with *");
      return;
    }

    try {
      setLoading(true);
      await ledgerAPI.createTransaction(formData);
      alert("Transaction recorded successfully!");
      if (setActivePage) setActivePage("balanceSheetReport");
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 className="page-title"><TrendingUp size={22} /> Add Balance Sheet Entry</h1>
          <p className="page-subtitle">Record financial transactions for income, expenses, assets, or liabilities</p>
        </div>
         <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="badge badge-primary" style={{ padding: "8px 16px", borderRadius: "20px" }}>FY 2024-25 Active</span>
         </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
        {/* Core Entry Form */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)" }}>
              <PlusCircle size={20} />
              <h3 style={{ fontSize: "18px" }}>Transaction Fundamentals</h3>
           </div>
           
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                 <label className="input-label">Balance Sheet Category*</label>
                 <select name="category" className="select-modern" value={formData.category} onChange={handleChange}>
                    <option value="">-- Select Classification --</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense (Operational)</option>
                    <option value="Asset">Asset (Capex)</option>
                    <option value="Liability">Liability</option>
                 </select>
              </div>
              <div>
                 <label className="input-label">Center Branch*</label>
                 <select name="branchId" className="select-modern" value={formData.branchId} onChange={handleChange}>
                    <option value="">-- Select Branch --</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.branchName}</option>
                    ))}
                 </select>
              </div>
           </div>

           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                 <label className="input-label">Source / Type*</label>
                 <input 
                   name="type" 
                   type="text" 
                   className="input-modern" 
                   placeholder="e.g. Sales Revenue, Office Rent" 
                   value={formData.type} 
                   onChange={handleChange} 
                 />
              </div>
              <div>
                 <label className="input-label">Nominal Amount (₹)*</label>
                 <div style={{ position: "relative" }}>
                   <IndianRupee size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                   <input 
                     name="amount" 
                     type="number" 
                     className="input-modern" 
                     placeholder="0.00" 
                     style={{ paddingLeft: "40px" }} 
                     value={formData.amount} 
                     onChange={handleChange} 
                   />
                 </div>
              </div>
           </div>

           <div>
              <label className="input-label">Date of Entry*</label>
              <div style={{ position: "relative" }}>
                <Calendar size={18} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                <input 
                  name="date" 
                  type="date" 
                  className="input-modern" 
                  value={formData.date} 
                  onChange={handleChange} 
                />
              </div>
           </div>

           <div>
              <label className="input-label">Payment Channel*</label>
              <div style={{ display: "flex", gap: "16px" }}>
                 {['Cash on Hand', 'Bank Transfer', 'UPI / Card'].map((mode, i) => (
                    <label 
                      key={i} 
                      style={{ 
                        flex: 1, 
                        padding: "16px", 
                        borderRadius: "12px", 
                        border: formData.paymentMode === mode ? "1px solid var(--primary)" : "1px solid var(--border-light)", 
                        background: formData.paymentMode === mode ? "var(--primary-light)" : "transparent",
                        display: "flex", 
                        alignItems: "center", 
                        gap: "10px", 
                        cursor: "pointer", 
                        transition: "all 0.3s" 
                      }} 
                    >
                       <input 
                         type="radio" 
                         name="paymentMode" 
                         value={mode} 
                         checked={formData.paymentMode === mode} 
                         onChange={handleChange} 
                       />
                       <span style={{ fontSize: "13px", fontWeight: "600" }}>{mode}</span>
                    </label>
                 ))}
              </div>
           </div>

           <div>
              <label className="input-label">Remark / Justification</label>
              <textarea 
                name="remark" 
                className="input-modern" 
                rows={3} 
                placeholder="Provide a brief context for this entry..." 
                style={{ resize: "none" }}
                value={formData.remark}
                onChange={handleChange}
              ></textarea>
           </div>
        </div>

        {/* Documentation & Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
           <div className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
                <UploadCloud size={20} />
                <h3 style={{ fontSize: "16px" }}>Voucher & Evidence</h3>
              </div>
              <div style={{ border: "2px dashed #cbd5e1", borderRadius: "16px", padding: "40px", textAlign: "center", cursor: "pointer" }}>
                 <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: "12px" }} />
                 <p style={{ fontWeight: "700" }}>Upload Invoice/Receipt</p>
                 <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>PNG, JPG or PDF (Max 5MB)</p>
              </div>
           </div>

           <div className="glass-card" style={{ background: "rgba(79, 70, 229, 0.04)", border: "1px solid rgba(79, 70, 229, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
                <AlertCircle size={18} />
                <h3 style={{ fontSize: "16px" }}>Audit Compliance</h3>
              </div>
              <ul style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "12px" }}>
                 <li style={{ display: "flex", gap: "8px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", marginTop: "6px" }}></div> All entries tagged as 'Asset' will automatically appear in Depreciation reports.</li>
                 <li style={{ display: "flex", gap: "8px" }}><div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", marginTop: "6px" }}></div> Link entries with cost-centers via 'Branch' for P&L segmentation.</li>
              </ul>
              <button 
                className="btn btn-primary shadow-glow" 
                style={{ width: "100%", marginTop: "32px", padding: "14px" }}
                onClick={handleSubmit}
                disabled={loading}
              >
                 {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                 {loading ? " Processing..." : " Commit Transaction"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AddBalanceSheet;

