import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Save, Trash2, Edit2, CheckCircle, AlertCircle, List } from "lucide-react";
import API_BASE from "../api";
import "./templates.css";

const API_T = `${API_BASE}/templates`;
const API_Q = `${API_BASE}/template-questions`;

interface ManageTemplateProps {
    templateId: number;
    setActivePage: (p: string) => void;
}

export default function ManageTemplate({ templateId, setActivePage }: ManageTemplateProps) {
    const [template, setTemplate] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [msg, setMsg] = useState<any>(null);

    const [qForm, setQForm] = useState({
        id: null as number | null,
        questionTitle: "",
        placeholder: "",
        questionType: "Description",
        isRequired: "No",
        options: "" // Comma separated for Radio/Checkbox/Dropdown
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [tr, qr] = await Promise.all([
                axios.get(`${API_T}/${templateId}`),
                axios.get(`${API_Q}/template/${templateId}`)
            ]);
            setTemplate(tr.data);
            setQuestions(qr.data);
        } catch (err) {
            setMsg({ type: "error", text: "Failed to load management data." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (templateId) loadData();
        else setActivePage("templates");
    }, [templateId]);

    const handleSaveQuestion = async (action: "save" | "addMore" | "done" = "addMore") => {
        if (!qForm.questionTitle) return alert("Question Title is required!");
        setSubmitting(true);
        try {
            const payload = {
                ...qForm,
                templateId: templateId,
                options: qForm.options ? qForm.options.split(",").map(o => o.trim()) : null
            };

            if (qForm.id) {
                await axios.put(`${API_Q}/${qForm.id}`, payload);
                setMsg({ type: "success", text: "Question updated!" });
            } else {
                await axios.post(API_Q, payload);
                setMsg({ type: "success", text: "Question added!" });
            }

            setQForm({ id: null, questionTitle: "", placeholder: "", questionType: "Description", isRequired: "No", options: "" });
            await loadData();
            
            if (action === "done") {
                setActivePage("templates");
            }
        } catch (err) {
            setMsg({ type: "error", text: "Failed to save question." });
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (q: any) => {
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
            loadData();
        } catch (err) {
            setMsg({ type: "error", text: "Failed to delete question." });
        }
    };

    if (loading) return <div className="lm-loading">Loading...</div>;

    const questionTypes = [
        "Description", "Radio Button", "Checkbox", "File Upload", "Dropdown", "Date", "Time", "Date & Time",
        "Number", "Progress Bar %", "Topic with Time", "Description with Time", "Google Map Location",
        "Topic with Question", "Branch List", "Branch with Remarks", "Department", "Department with Remarks"
    ];

    return (
        <div className="lm-container lm-fade">
            <div className="lm-page-header">
                <div>
                    <h2 className="lm-page-title">
                        <button className="lm-btn-icon" onClick={() => setActivePage("templates")} style={{ marginRight: "0.5rem" }}>
                            <ArrowLeft size={18} />
                        </button>
                        Manage Template: {template?.name}
                    </h2>
                    <p className="lm-page-subtitle">Add or edit questions inside this template</p>
                </div>
            </div>

            {msg && (
                <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
                    {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
                </div>
            )}

            <div className="lm-card" style={{ marginBottom: "2rem" }}>
                <div className="lm-card-title">{qForm.id ? "Edit Question" : "Add New Question"}</div>
                <div className="lm-form-grid">
                    <div className="lm-field lm-col-2">
                        <label className="lm-label">Template Question*</label>
                        <input className="lm-input" placeholder="Question Title" value={qForm.questionTitle} onChange={e => setQForm({ ...qForm, questionTitle: e.target.value })} />
                    </div>
                    <div className="lm-field lm-col-2">
                        <label className="lm-label">Template Question Placeholder</label>
                        <input className="lm-input" placeholder="Placeholder text" value={qForm.placeholder} onChange={e => setQForm({ ...qForm, placeholder: e.target.value })} />
                    </div>
                    <div className="lm-field">
                        <label className="lm-label">Question Type</label>
                        <select className="lm-select" value={qForm.questionType} onChange={e => setQForm({ ...qForm, questionType: e.target.value })}>
                            {questionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="lm-field">
                        <label className="lm-label">Is Required*</label>
                        <select className="lm-select" value={qForm.isRequired} onChange={e => setQForm({ ...qForm, isRequired: e.target.value })}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                            <option value="On Previous Question">On Previous Question</option>
                        </select>
                    </div>

                    {["Radio Button", "Checkbox", "Dropdown"].includes(qForm.questionType) && (
                        <div className="lm-field lm-col-2">
                            <label className="lm-label">Options (Comma separated)</label>
                            <input className="lm-input" placeholder="Option 1, Option 2, Option 3" value={qForm.options} onChange={e => setQForm({ ...qForm, options: e.target.value })} />
                        </div>
                    )}

                    <div className="lm-form-footer lm-col-2">
                        <button type="button" className="lm-btn-secondary" onClick={() => handleSaveQuestion("save")} disabled={submitting}>
                            <Save size={14} /> Save Question
                        </button>
                        <button type="button" className="lm-btn-secondary" onClick={() => handleSaveQuestion("addMore")} disabled={submitting}>
                            <Save size={14} /> Save Question & Add More
                        </button>
                        <button type="button" className="lm-btn-primary" onClick={() => handleSaveQuestion("done")} disabled={submitting}>
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
                            <tr>
                                <th>Order</th>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {questions.length === 0 ? (
                                <tr><td colSpan={5} className="lm-empty">No questions added yet.</td></tr>
                            ) : (
                                questions.map((q, idx) => (
                                    <tr key={q.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{q.questionTitle}</div>
                                            {q.placeholder && <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{q.placeholder}</div>}
                                            {q.options && <div style={{ fontSize: "0.75rem", color: "#6366f1" }}>Options: {Array.isArray(q.options) ? q.options.join(", ") : ""}</div>}
                                        </td>
                                        <td><span className="lm-badge lm-badge-info">{q.questionType}</span></td>
                                        <td><span className={`lm-badge ${q.isRequired === "Yes" ? "lm-badge-success" : "lm-badge-secondary"}`}>{q.isRequired}</span></td>
                                        <td>
                                            <div className="action-btn-group">
                                                <button className="action-btn action-btn-edit" onClick={() => handleEdit(q)}><Edit2 size={14} /></button>
                                                <button className="action-btn action-btn-delete" onClick={() => handleDelete(q.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
