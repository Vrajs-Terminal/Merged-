import React, { useState } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Info, 
  HelpCircle,
  Hash,
  ShieldCheck,
  Zap,
  Target,
  Clock,
  Layout,
  Save,
  Loader2,
  MessageCircle
} from "lucide-react";
import { pollAPI } from "../../services/apiService";
import "./AddPoll.css";
import PageTitle from "../../components/PageTitle";

const AddPoll = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    startDate: "",
    endDate: "",
    targetAudience: "All Employees",
    isAnonymous: true,
    isMultipleChoice: false,
    options: ["", ""]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({ ...prev, options: [...prev.options, ""] }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || formData.options.some(opt => !opt.trim())) {
      alert("Please fill in the question and all options.");
      return;
    }

    try {
      setLoading(true);
      await pollAPI.create({
        ...formData,
        options: formData.options.filter(opt => opt.trim() !== "")
      });
      alert("Poll created successfully!");
      setActivePage("pollSummary");
    } catch (err) {
      console.error(err);
      alert("Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="poll-page-container">
      <div className="poll-header">
        <div className="header-text">
          <PageTitle title="Create New Engagement Poll" subtitle="Design an interactive poll to collect employee feedback and insights" />
        </div>
        <button className="back-btn" onClick={() => setActivePage("pollSummary")}>
          <ArrowLeft size={18} />
          <span>Back to Summary</span>
        </button>
      </div>

      <form className="poll-form-main" onSubmit={handleSave}>
        <div className="creation-main-panel">
          <div className="poll-form-card">
            <div className="card-section">
              <div className="section-title">
                <HelpCircle size={18} />
                <h3>Poll Details</h3>
              </div>
              <div className="form-group">
                <label>Question <span className="req">*</span></label>
                <input 
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  type="text" 
                  placeholder="e.g., What is your preferred day for the weekly team lunch?" 
                  required
                />
              </div>
              <div className="form-group mt-4">
                <label>Description (Optional)</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide context or instructions for this poll..."
                  rows={3}
                ></textarea>
              </div>
            </div>

            <div className="options-config mt-6">
              <div className="card-section-title" style={{ borderBottom: 'none', marginBottom: '8px' }}>
                <Hash size={18} />
                <h3>Response Options</h3>
                <span className="p-type-badge" style={{ marginLeft: 'auto' }}>Min 2, Max 10</span>
              </div>
              
              <div className="options-grid">
                {formData.options.map((option, index) => (
                  <div key={index} className="option-input-group">
                    <div className="option-number">{index + 1}</div>
                    <input 
                      style={{ flex: 1, padding: '11px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}
                      type="text" 
                      placeholder={`Option ${index + 1}`} 
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                    />
                    {formData.options.length > 2 && (
                      <button type="button" className="act-btn delete" onClick={() => removeOption(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button type="button" className="add-btn" style={{ marginTop: '20px' }} onClick={addOption}>
                <Plus size={16} />
                <span>Add Another Option</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sticky-card">
          <div className="poll-form-card">
            <div className="card-section-title">
              <Zap size={18} />
              <h3>Configuration</h3>
            </div>

            <div className="form-grid-stack">
              <div className="form-group">
                  <label><Clock size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Validity Period</label>
                  <div className="input-with-icon" style={{ marginBottom: "10px" }}>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} required />
                  </div>
                  <div className="input-with-icon">
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} required />
                  </div>
              </div>

              <div className="form-group" style={{ marginTop: "12px" }}>
                  <label><Target size={14} style={{ display: 'inline', marginBottom: '-2px' }}/> Target Audience</label>
                  <select name="targetAudience" value={formData.targetAudience} onChange={handleInputChange}>
                    <option value="All Employees">All Employees</option>
                    <option value="Branch-wise">Branch-wise</option>
                    <option value="Department-wise">Department-wise</option>
                    <option value="Individual-wise">Individual-wise</option>
                  </select>
              </div>

              <div className="toggle-checkbox-group" style={{ flexDirection: "column", gap: "14px", marginTop: "12px" }}>
                 <label className="checkbox-mini">
                    <input type="checkbox" name="isAnonymous" checked={formData.isAnonymous} onChange={handleInputChange} />
                    <ShieldCheck size={16} color="var(--primary)" />
                    Anonymous Participation
                 </label>
                 
                 <label className="checkbox-mini">
                    <input type="checkbox" name="isMultipleChoice" checked={formData.isMultipleChoice} onChange={handleInputChange} />
                    <Layout size={16} color="var(--primary)" />
                    Allow Multiple Selection
                 </label>
              </div>
            </div>

            <div style={{ marginTop: "28px" }}>
              <button type="submit" className="publish-btn" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                <span>Publish Poll</span>
              </button>
            </div>
          </div>

          <div className="info-box-compact">
            <Info size={20} color="var(--color-warning-700)" style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}>Publishing this poll will immediately notify the target audience. Once active, the question cannot be edited.</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPoll;

