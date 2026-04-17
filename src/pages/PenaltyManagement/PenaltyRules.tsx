import React, { useState, useEffect } from "react";
import { penaltyAPI, shiftAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import { Plus, Save, Trash2, Edit, AlertCircle, Clock, AlertTriangle, X } from "lucide-react";
import "./Penalty.css";

interface PenaltyRulesProps {
  setActivePage: (page: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PenaltyRules: React.FC<PenaltyRulesProps> = ({ setActivePage }) => {
  const [rules, setRules] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  const [formData, setFormData] = useState({
    ruleName: "",
    applicableOn: "Late In",
    graceTime: 10,
    penaltyTriggerAfter: 3,
    penaltyType: "Deduct Salary",
    penaltyValue: 0,
    shiftId: "",
    frequency: "Daily"
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await penaltyAPI.getRules();
      setRules(res.data);
    } catch (err) {
      toast.error("Failed to fetch rules");
    } finally {
      setLoading(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await shiftAPI.getAll();
      setShifts(res.data.shifts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRules();
    fetchShifts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (addMore = false) => {
    if (!formData.ruleName) {
      toast.error("Rule name is required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        graceTime: Number(formData.graceTime),
        penaltyTriggerAfter: Number(formData.penaltyTriggerAfter),
        penaltyValue: Number(formData.penaltyValue),
        shiftId: formData.shiftId ? Number(formData.shiftId) : null
      };

      if (editingRule) {
        await penaltyAPI.updateRule(editingRule.id, payload);
        toast.success("Rule updated successfully");
      } else {
        await penaltyAPI.createRule(payload);
        toast.success("Rule created successfully");
      }

      if (!addMore) {
        setShowForm(false);
        setEditingRule(null);
      }
      
      setFormData({
        ruleName: "",
        applicableOn: "Late In",
        graceTime: 10,
        penaltyTriggerAfter: 3,
        penaltyType: "Deduct Salary",
        penaltyValue: 0,
        shiftId: "",
        frequency: "Daily"
      });
      fetchRules();
    } catch (err) {
      toast.error("Failed to save rule");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      applicableOn: rule.applicableOn,
      graceTime: rule.graceTime,
      penaltyTriggerAfter: rule.penaltyTriggerAfter,
      penaltyType: rule.penaltyType,
      penaltyValue: rule.penaltyValue || 0,
      shiftId: rule.shiftId ? String(rule.shiftId) : "",
      frequency: rule.frequency
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await penaltyAPI.deleteRule(id);
      toast.success("Rule deleted");
      fetchRules();
    } catch (err) {
      toast.error("Failed to delete rule");
    }
  };

  return (
    <div className="main-content animate-fade-in penalty-page-container">
      <div className="penalty-header">
        <div className="penalty-title-block">
          <div className="penalty-title-row">
            <AlertTriangle size={24} className="penalty-title-icon" />
            <h1 className="page-title">Penalty Rules</h1>
          </div>
          <p className="page-subtitle">Automate discipline and attendance policy</p>
        </div>
        <div className="penalty-header-actions">
          <button className="penalty-btn primary" onClick={() => { setShowForm(true); setEditingRule(null); }}>
            <Plus size={18} /> Add New Rule
          </button>
        </div>
      </div>

      {showForm && (
        <div className="penalty-card penalty-form-shell animate-slide-up">
          <div className="penalty-card-header">
            <div>
              <h3 className="penalty-card-title">{editingRule ? "Edit Penalty Rule" : "Create Penalty Rule"}</h3>
              <p className="penalty-card-subtitle">Define how attendance violations should be handled.</p>
            </div>
            <button className="penalty-icon-btn" onClick={() => setShowForm(false)} aria-label="Close form">
              <X size={16} />
            </button>
          </div>
          
          <div className="penalty-form-grid">
            <div>
              <label className="input-label">Rule Name*</label>
              <input 
                type="text" name="ruleName" className="input-modern" 
                value={formData.ruleName} onChange={handleInputChange} 
                placeholder="e.g. 3 Late Marks Deduction"
              />
            </div>
            <div>
              <label className="input-label">Applicable On*</label>
              <select name="applicableOn" className="select-modern" value={formData.applicableOn} onChange={handleInputChange}>
                <option value="Late In">Late In</option>
                <option value="Early Out">Early Out</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="Missed Punch">Missed Punch</option>
                <option value="Shift Violation">Shift Violation</option>
              </select>
            </div>
            <div>
              <label className="input-label">Grace Time (Minutes)</label>
              <input type="number" name="graceTime" className="input-modern" value={formData.graceTime} onChange={handleInputChange} />
            </div>
            <div>
              <label className="input-label">No. of Counts to Trigger</label>
              <input type="number" name="penaltyTriggerAfter" className="input-modern" value={formData.penaltyTriggerAfter} onChange={handleInputChange} />
            </div>
            <div>
              <label className="input-label">Penalty Type</label>
              <select name="penaltyType" className="select-modern" value={formData.penaltyType} onChange={handleInputChange}>
                <option value="Warning Only">Warning Only</option>
                <option value="Deduct Salary">Deduct Salary</option>
                <option value="Convert to Leave">Convert to Leave</option>
              </select>
            </div>
            <div>
              <label className="input-label">Penalty Value</label>
              <input type="number" name="penaltyValue" className="input-modern" value={formData.penaltyValue} onChange={handleInputChange} placeholder="Amount or Day value" />
            </div>
            <div>
              <label className="input-label">Apply on Shift*</label>
              <select name="shiftId" className="select-modern" value={formData.shiftId} onChange={handleInputChange}>
                <option value="">All Shifts</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.shiftName}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Frequency</label>
              <select name="frequency" className="select-modern" value={formData.frequency} onChange={handleInputChange}>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="penalty-form-actions">
            <button className="penalty-btn secondary" onClick={() => handleSubmit(true)}>Save & Add More</button>
            <button className="penalty-btn primary" onClick={() => handleSubmit(false)}>
              <Save size={18} /> {editingRule ? "Update Rule" : "Save Rule"}
            </button>
          </div>
        </div>
      )}

      <div className="penalty-card penalty-table-shell">
        <div className="penalty-table-header">
          <div>
            <h3 className="penalty-card-title">Configured rules</h3>
            <p className="penalty-card-subtitle">Review triggers, penalties, and shift targeting in one place.</p>
          </div>
          <span className="penalty-chip">{rules.length} rules</span>
        </div>
        <div className="penalty-table-wrap">
          <table className="penalty-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Applicable On</th>
                <th>Trigger After</th>
                <th>Grace Time</th>
                <th>Penalty</th>
                <th>Frequency</th>
                <th>Shift Link</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td className="penalty-strong">{rule.ruleName}</td>
                  <td><span className="penalty-pill">{rule.applicableOn}</span></td>
                  <td>{rule.penaltyTriggerAfter} counts</td>
                  <td>{rule.graceTime} min</td>
                  <td>
                    <div className="penalty-inline-meta">
                      <AlertCircle size={14} className={rule.penaltyType === "Warning Only" ? "penalty-warn" : "penalty-danger"} />
                      {rule.penaltyType} ({rule.penaltyValue || 0})
                    </div>
                  </td>
                  <td>{rule.frequency}</td>
                  <td>
                    {rule.shift ? (
                      <div className="penalty-inline-meta">
                        <Clock size={14} /> {rule.shift.shiftName}
                      </div>
                    ) : "All Shifts"}
                  </td>
                  <td>
                    <div className="penalty-row-actions">
                      <button className="penalty-icon-btn" onClick={() => handleEdit(rule)} aria-label="Edit rule"><Edit size={16} /></button>
                      <button className="penalty-icon-btn danger" onClick={() => handleDelete(rule.id)} aria-label="Delete rule"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rules.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="penalty-empty-state">No rules defined yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PenaltyRules;
