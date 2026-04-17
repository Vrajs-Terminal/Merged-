import React, { useState, useEffect } from "react";
import { penaltyAPI, leaveTypeAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Plus, Save, ArrowRightCircle, AlertCircle, AlertTriangle, X } from "lucide-react";
import "./Penalty.css";

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
    <div className="main-content animate-fade-in penalty-page-container penalty-conversion-page">
      <div className="penalty-header">
        <div className="penalty-title-block">
          <div className="penalty-title-row">
            <AlertTriangle size={24} className="penalty-title-icon" />
            <h1 className="page-title">Penalty to Leave Conversion</h1>
          </div>
          <p className="page-subtitle">Define automated leave deduction policies</p>
        </div>
        <div className="penalty-header-actions">
          <button className="penalty-btn primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Conversion Rule
          </button>
        </div>
      </div>

      {showForm && (
        <div className="penalty-card penalty-form-shell penalty-conversion-form animate-slide-up">
          <div className="penalty-card-header">
            <div>
              <h3 className="penalty-card-title">Create Conversion Rule</h3>
              <p className="penalty-card-subtitle">Map repeated penalties to leave deductions using a clean, auditable policy.</p>
            </div>
            <button className="penalty-icon-btn" onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={16} />
            </button>
          </div>
          
          <div className="penalty-form-grid penalty-conversion-grid">
            <div>
              <label className="input-label">Penalty Type*</label>
              <select name="penaltyType" className="select-modern" value={formData.penaltyType} onChange={handleInputChange}>
                <option value="Late In">Late In</option>
                <option value="Early Out">Early Out</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="input-label">Leave Type*</label>
              <select name="leaveTypeId" className="select-modern" value={formData.leaveTypeId} onChange={handleInputChange}>
                <option value="">Select Leave Type</option>
                {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} ({lt.leaveCode})</option>)}
              </select>
            </div>
            <div className="penalty-field-span-2">
              <label className="input-label">Conversion Rule*</label>
              <div className="penalty-conversion-rule-box">
                <div className="penalty-conversion-part">
                  <span className="penalty-conversion-label">Penalty Counts</span>
                  <input type="number" name="conversionCount" className="input-modern" value={formData.conversionCount} onChange={handleInputChange} min={1} />
                </div>
                <span className="penalty-conversion-equals">=</span>
                <div className="penalty-conversion-part">
                  <span className="penalty-conversion-label">Leave Days Deducted</span>
                  <input type="number" name="leaveDeductionVal" className="input-modern" step="0.5" value={formData.leaveDeductionVal} onChange={handleInputChange} min={0} />
                </div>
              </div>
            </div>
            <div>
              <label className="input-label">Max Month Limit (Optional)</label>
              <input type="number" name="maxLimit" className="input-modern" value={formData.maxLimit} onChange={handleInputChange} />
            </div>
            <div className="penalty-conversion-hint">
              <h4 className="penalty-conversion-hint-title">Policy Preview</h4>
              <p className="penalty-conversion-hint-text">
                Every <strong>{formData.conversionCount || 0}</strong> <strong>{formData.penaltyType}</strong> entries will deduct
                <strong> {formData.leaveDeductionVal || 0}</strong> day(s) from selected leave type.
              </p>
            </div>
          </div>

          <div className="penalty-form-actions">
            <button className="penalty-btn primary" onClick={handleSubmit}>
              <Save size={18} /> Save Conversion Rule
            </button>
          </div>
        </div>
      )}

      <div className="penalty-card penalty-table-shell">
        <div className="penalty-table-header">
          <div>
            <h3 className="penalty-card-title">Conversion Policies</h3>
            <p className="penalty-card-subtitle">All active penalty-to-leave mappings currently applied by the system.</p>
          </div>
          <span className="penalty-chip">{conversions.length} rules</span>
        </div>

        <div className="penalty-rules-grid">
        {conversions.map((conv) => (
          <div key={conv.id} className="penalty-rule-card animate-slide-up">
            <div className="penalty-rule-header">
              <div className="penalty-rule-hero">
                <ArrowRightCircle size={24} color="var(--primary)" />
              </div>
            </div>
            <h3 className="penalty-rule-name">{conv.penaltyType} Policy</h3>
            <div className="penalty-rule-meta penalty-rule-summary">
              <span className="penalty-rule-amount">{conv.conversionCount} {conv.penaltyType}s</span>
              <ArrowRightCircle size={14} />
              <span className="penalty-rule-amount penalty-success">{conv.leaveDeductionVal} {conv.leaveType.name}</span>
            </div>
            <div className="penalty-rule-desc penalty-inline-meta">
              <AlertCircle size={14} />
              <span>{conv.maxLimit ? `Limit: Max ${conv.maxLimit} days/month` : "No limit set"}</span>
            </div>
          </div>
        ))}
        {conversions.length === 0 && (
          <div className="penalty-empty-state penalty-empty-grid">
            <p>No conversion rules defined. Use the button above to add the first mapping.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PenaltyToLeave;
