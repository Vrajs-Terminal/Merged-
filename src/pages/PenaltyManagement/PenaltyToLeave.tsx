import React, { useState, useEffect } from "react";
import { penaltyAPI, leaveTypeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Plus, Save, Trash2, ArrowRightCircle, AlertCircle, AlertTriangle } from "lucide-react";

const PenaltyToLeave: React.FC = () => {
  const [conversions, setConversions] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    penaltyType: "Late In",
    conversionCount: 3,
    leaveDeductionVal: 0.5,
    leaveTypeId: "",
    maxLimit: ""
  });

  const fetchConversions = async () => {
    try {
      setLoading(true);
      const res = await penaltyAPI.getConversions();
      setConversions(res.data);
    } catch (err) {
      toast.error("Failed to fetch conversions");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await leaveTypeAPI.getAll();
      setLeaveTypes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversions();
    fetchLeaveTypes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!formData.leaveTypeId) {
      toast.error("Leave type is required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        conversionCount: Number(formData.conversionCount),
        leaveDeductionVal: Number(formData.leaveDeductionVal),
        leaveTypeId: Number(formData.leaveTypeId),
        maxLimit: formData.maxLimit ? Number(formData.maxLimit) : null
      };

      await penaltyAPI.createConversion(payload);
      toast.success("Conversion rule created successfully");
      setShowForm(false);
      
      setFormData({
        penaltyType: "Late In",
        conversionCount: 3,
        leaveDeductionVal: 0.5,
        leaveTypeId: "",
        maxLimit: ""
      });
      fetchConversions();
    } catch (err) {
      toast.error("Failed to save conversion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title"><AlertTriangle size={22} /> Penalty to Leave Conversion</h1>
          <p className="page-subtitle">Define automated leave deduction policies</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> New Conversion Rule
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-slide-up" style={{ marginTop: "24px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3>Create Conversion Rule</h3>
            <button className="action-btn" onClick={() => setShowForm(false)}>×</button>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
            <div>
              <label className="input-label">Penalty Type*</label>
              <select name="penaltyType" className="select-modern" value={formData.penaltyType} onChange={handleInputChange}>
                <option value="Late In">Late In</option>
                <option value="Early Out">Early Out</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="input-label">Conversion Rule</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="number" name="conversionCount" className="input-modern" value={formData.conversionCount} onChange={handleInputChange} style={{ width: "80px" }} />
                <span>Counts = </span>
                <input type="number" name="leaveDeductionVal" className="input-modern" step="0.5" value={formData.leaveDeductionVal} onChange={handleInputChange} style={{ width: "80px" }} />
                <span>Day Leave</span>
              </div>
            </div>
            <div>
              <label className="input-label">Leave Type*</label>
              <select name="leaveTypeId" className="select-modern" value={formData.leaveTypeId} onChange={handleInputChange}>
                <option value="">Select Leave Type</option>
                {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.leaveCode})</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Max Month Limit (Optional)</label>
              <input type="number" name="maxLimit" className="input-modern" value={formData.maxLimit} onChange={handleInputChange} />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button className="btn-primary" onClick={handleSubmit}>
              <Save size={18} /> Save Conversion Rule
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "24px" }}>
        {conversions.map((conv) => (
          <div key={conv.id} className="glass-card animate-slide-up" style={{ padding: "24px", borderLeft: "4px solid var(--primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ background: "var(--primary-light)", padding: "10px", borderRadius: "10px" }}>
                <ArrowRightCircle size={24} color="var(--primary)" />
              </div>
              <button className="action-btn" style={{ color: "#ef4444" }}><Trash2 size={16} /></button>
            </div>
            <h3 style={{ margin: "0 0 8px 0" }}>{conv.penaltyType} Policy</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontWeight: "600" }}>
              <span style={{ fontSize: "20px", color: "var(--primary)" }}>{conv.conversionCount} {conv.penaltyType}s</span>
              <ArrowRightCircle size={14} />
              <span style={{ fontSize: "20px", color: "#10b981" }}>{conv.leaveDeductionVal} {conv.leaveType.name}</span>
            </div>
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
              <AlertCircle size={14} />
              <span>{conv.maxLimit ? `Limit: Max ${conv.maxLimit} days/month` : "No limit set"}</span>
            </div>
          </div>
        ))}
        {conversions.length === 0 && (
          <div className="glass-card" style={{ padding: "40px", textAlign: "center", gridColumn: "1 / -1" }}>
            <p>No conversion rules defined. Click the button above to add one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PenaltyToLeave;
