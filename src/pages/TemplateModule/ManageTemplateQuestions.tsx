import { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  List,
  Zap,
  LayoutGrid
} from "lucide-react";
import API_BASE from "../api";
import "./templates.css";

const API_T = `${API_BASE}/templates`;
const API_Q = `${API_BASE}/template-questions`;

export default function ManageTemplateQuestions() {
  const [templates, setTemplates] = useState<Array<{ id: number; name: string; templateType: string; description?: string; status: string; groupName?: string }>>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [template, setTemplate] = useState<{ id: number; name: string } | null>(null);
  const [questions, setQuestions] = useState<Array<{ id: number; questionTitle: string; placeholder?: string; questionType: string; isRequired: string; options?: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [qForm, setQForm] = useState({
    id: null as number | null,
    questionTitle: "",
    placeholder: "",
    questionType: "Description",
    isRequired: "No",
    options: ""
  });

  // Fetch all templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_T}?limit=1000`);
      setTemplates(res.data.templates);
    } catch {
      setMsg({ type: "error", text: "Failed to fetch templates." });
    } finally {
      setLoading(false);
    }
  };

  // Load template and its questions
  const loadTemplate = async (templateId: number) => {
    setLoading(true);
    try {
      const [tr, qr] = await Promise.all([
        axios.get(`${API_T}/${templateId}`),
        axios.get(`${API_Q}/template/${templateId}`)
      ]);
      setSelectedTemplateId(templateId);
      setTemplate(tr.data);
      setQuestions(qr.data);
      setQForm({
        id: null,
        questionTitle: "",
        placeholder: "",
        questionType: "Description",
        isRequired: "No",
        options: ""
      });
    } catch {
      setMsg({ type: "error", text: "Failed to load template data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSaveQuestion = async (action: "save" | "addMore" | "done" = "addMore") => {
    if (!qForm.questionTitle) return alert("Question Title is required!");
    setSubmitting(true);
    try {
      const payload = {
        ...qForm,
        templateId: selectedTemplateId,
        options: qForm.options ? qForm.options.split(",").map(o => o.trim()) : null
      };

      if (qForm.id) {
        await axios.put(`${API_Q}/${qForm.id}`, payload);
        setMsg({ type: "success", text: "Question updated!" });
      } else {
        await axios.post(API_Q, payload);
        setMsg({ type: "success", text: "Question added!" });
      }

      setQForm({
        id: null,
        questionTitle: "",
        placeholder: "",
        questionType: "Description",
        isRequired: "No",
        options: ""
      });
      
      if (selectedTemplateId) {
        await loadTemplate(selectedTemplateId);
      }
      
      if (action === "done") {
        setSelectedTemplateId(null);
        setTemplate(null);
        setQuestions([]);
      }
    } catch {
      setMsg({ type: "error", text: "Failed to save question." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (q: { id: number; questionTitle: string; placeholder?: string; questionType: string; isRequired: string; options?: string[] }) => {
    setQForm({
      id: q.id,
      questionTitle: q.questionTitle,
      placeholder: q.placeholder || "",
      questionType: q.questionType,
      isRequired: q.isRequired,
      options: Array.isArray(q.options) ? q.options.join(", ") : ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (qid: number) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await axios.delete(`${API_Q}/${qid}`);
      setMsg({ type: "success", text: "Question deleted!" });
      if (selectedTemplateId) {
        await loadTemplate(selectedTemplateId);
      }
    } catch {
      setMsg({ type: "error", text: "Failed to delete question." });
    }
  };

  const questionTypes = [
    "Description", "Radio Button", "Checkbox", "File Upload", "Dropdown", "Date", "Time", "Date & Time",
    "Number", "Progress Bar %", "Topic with Time", "Description with Time", "Google Map Location",
    "Topic with Question", "Branch List", "Branch with Remarks", "Department", "Department with Remarks"
  ];

  // If no template selected, show template selection
  if (!selectedTemplateId) {
    return (
      <div className="lm-container lm-fade">
        <div className="lm-page-header">
          <div>
            <h2 className="lm-page-title"><LayoutGrid size={22} /> Manage Template Questions</h2>
            <p className="lm-page-subtitle">Select a template to add or manage questions inside it</p>
          </div>
        </div>

        {msg && (
          <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
            {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
            <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
          </div>
        )}

        {loading ? (
          <div className="lm-loading">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="lm-card">
            <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              <LayoutGrid size={32} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <p>No templates available. Create a template first.</p>
            </div>
          </div>
        ) : (
          <div className="lm-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {templates.map((t) => (
              <div
                key={t.id}
                className="lm-card"
                style={{
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "2px solid #e2e8f0",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(99, 102, 241, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => loadTemplate(t.id)}
              >
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.5rem" }}>
                    <span className="lm-badge lm-badge-info">{t.templateType}</span>
                  </div>
                  {t.description && (
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>
                      {t.description}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                    Status: {t.status}
                  </span>
                  <span style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "#f1f5f9", borderRadius: "4px" }}>
                    Group: {t.groupName || "—"}
                  </span>
                </div>

                <button
                  className="lm-btn-primary"
                  style={{ 
                    width: "100%", 
                    justifyContent: "center", 
                    gap: "0.5rem",
                    transition: "all 0.3s ease",
                    transform: "translateY(0)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(99, 102, 241, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Zap size={14} /> Manage Questions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Template selected - show question management
  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title">
            <button
              className="lm-btn-icon"
              onClick={() => {
                setSelectedTemplateId(null);
                setTemplate(null);
                setQuestions([]);
              }}
              style={{ marginRight: "0.5rem" }}
            >
              ← Back
            </button>
            Manage Questions: {template?.name}
          </h2>
          <p className="lm-page-subtitle">Add or edit questions inside this template</p>
        </div>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div className="lm-card-title">{qForm.id ? "Edit Question" : "Add New Question"}</div>
        <div className="lm-form-grid">
          <div className="lm-field lm-col-2">
            <label className="lm-label">Template Question*</label>
            <input
              className="lm-input"
              placeholder="Question Title"
              value={qForm.questionTitle}
              onChange={e => setQForm({ ...qForm, questionTitle: e.target.value })}
            />
          </div>
          <div className="lm-field lm-col-2">
            <label className="lm-label">Template Question Placeholder</label>
            <input
              className="lm-input"
              placeholder="Placeholder text"
              value={qForm.placeholder}
              onChange={e => setQForm({ ...qForm, placeholder: e.target.value })}
            />
          </div>
          <div className="lm-field">
            <label className="lm-label">Question Type</label>
            <select
              className="lm-select"
              value={qForm.questionType}
              onChange={e => setQForm({ ...qForm, questionType: e.target.value })}
            >
              {questionTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="lm-field">
            <label className="lm-label">Is Required*</label>
            <select
              className="lm-select"
              value={qForm.isRequired}
              onChange={e => setQForm({ ...qForm, isRequired: e.target.value })}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="On Previous Question">On Previous Question</option>
            </select>
          </div>

          {["Radio Button", "Checkbox", "Dropdown"].includes(qForm.questionType) && (
            <div className="lm-field lm-col-2">
              <label className="lm-label">Options (Comma separated)</label>
              <input
                className="lm-input"
                placeholder="Option 1, Option 2, Option 3"
                value={qForm.options}
                onChange={e => setQForm({ ...qForm, options: e.target.value })}
              />
            </div>
          )}

          <div className="lm-form-footer lm-col-2" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              className="lm-btn-secondary"
              onClick={() => handleSaveQuestion("save")}
              disabled={submitting}
              style={{
                flex: 1,
                minWidth: "160px",
                padding: "0.7rem 1rem",
                backgroundColor: "#f0f4f8",
                color: "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: "0.375rem",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#e2e8f0";
                  e.currentTarget.style.borderColor = "#94a3b8";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#f0f4f8";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }
              }}
            >
              <Save size={14} /> Save Question
            </button>
            <button
              type="button"
              className="lm-btn-secondary"
              onClick={() => handleSaveQuestion("addMore")}
              disabled={submitting}
              style={{
                flex: 1,
                minWidth: "180px",
                padding: "0.7rem 1rem",
                backgroundColor: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fcd34d",
                borderRadius: "0.375rem",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 500,
                transition: "all 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#fde68a";
                  e.currentTarget.style.borderColor = "#f59e0b";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#fef3c7";
                  e.currentTarget.style.borderColor = "#fcd34d";
                }
              }}
            >
              <Save size={14} /> Save & Add More
            </button>
            <button
              type="button"
              className="lm-btn-primary"
              onClick={() => handleSaveQuestion("done")}
              disabled={submitting}
              style={{
                flex: 1,
                minWidth: "140px",
                padding: "0.7rem 1rem",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "0.375rem",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#4f46e5";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(99, 102, 241, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.backgroundColor = "#6366f1";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <CheckCircle size={14} /> Done
            </button>
          </div>
        </div>
      </div>

      <div className="lm-card">
        <div className="lm-card-title"><List size={18} /> Questions List</div>
        <div className="lm-table-wrap">
          <table className="lm-table">
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Order</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Question</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Type</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Required</th>
                <th style={{ padding: "1rem", fontWeight: 600, color: "#475569", fontSize: "0.875rem", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan={5} className="lm-empty" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No questions added yet. Add the first question above.</td></tr>
              ) : (
                questions.map((q, idx) => (
                  <tr 
                    key={q.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "white" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      transition: "background-color 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "white" : "#f8fafc";
                    }}
                  >
                    <td style={{ padding: "1rem", color: "#475569", fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>{q.questionTitle}</div>
                      {q.placeholder && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.25rem" }}>{q.placeholder}</div>}
                      {q.options && <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>Options: {Array.isArray(q.options) ? q.options.join(", ") : ""}</div>}
                    </td>
                    <td style={{ padding: "1rem" }}><span className="lm-badge lm-badge-info">{q.questionType}</span></td>
                    <td style={{ padding: "1rem" }}><span className={`lm-badge ${q.isRequired === "Yes" ? "lm-badge-success" : "lm-badge-secondary"}`}>{q.isRequired}</span></td>
                    <td style={{ padding: "1rem" }}>
                      <div className="action-btn-group">
                        <button 
                          className="action-btn action-btn-edit" 
                          onClick={() => handleEdit(q)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="action-btn action-btn-delete" 
                          onClick={() => handleDelete(q.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="lm-card" style={{ marginTop: "2rem", backgroundColor: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
        <div className="lm-card-title" style={{ color: "#047857" }}>✓ Benefits</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Flexible Reporting System</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Create custom templates for different reporting needs</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Custom Forms</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Build forms for different activities and workflows</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Easy Data Collection</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Collect structured data from employees efficiently</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Works with Punch System</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Integrate with Punch In/Out system for automatic triggers</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Multiple Report Types</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Support 18+ question types for diverse needs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
