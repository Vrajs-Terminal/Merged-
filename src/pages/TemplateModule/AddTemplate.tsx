import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Save, X } from "lucide-react";
import API_BASE from "../api";
import "./templates.css";

const API = `${API_BASE}/templates`;

interface AddTemplateProps {
    id?: number;
    setActivePage: (p: string) => void;
}

export default function AddTemplate({ id, setActivePage }: AddTemplateProps) {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        groupName: "",
        templateType: "Work Report",
        allowMultiplePerShift: false,
        requiredOnPunchIn: false,
        requiredOnPunchOut: "Optional",
        needReportingPerson: false
    });
    const [groupInput, setGroupInput] = useState("");

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get(`${API}/${id}`)
                .then(res => {
                    setForm(res.data);
                    setLoading(false);
                })
                .catch(() => {
                    alert("Failed to load template.");
                    setActivePage("templates");
                });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (id) {
                await axios.put(`${API}/${id}`, form);
            } else {
                await axios.post(API, form);
            }
            setActivePage("templates");
        } catch (err) {
            alert("Failed to save template.");
        } finally {
            setSubmitting(false);
        }
    };

    const addGroup = () => {
        if (!groupInput.trim()) return;
        const groups = form.groupName ? form.groupName.split(",").map(g => g.trim()) : [];
        if (!groups.includes(groupInput.trim())) {
            const newGroups = [...groups, groupInput.trim()].join(",");
            setForm({ ...form, groupName: newGroups });
        }
        setGroupInput("");
    };

    const removeGroup = (g: string) => {
        const groups = form.groupName.split(",").map(item => item.trim()).filter(item => item !== g);
        setForm({ ...form, groupName: groups.join(",") });
    };

    if (loading) return <div className="lm-loading a-dd-te-mp-la-te-page">Loading...</div>;

    return (
        <div className="lm-container lm-fade a-dd-te-mp-la-te-page">
            <div className="lm-page-header a-dd-te-mp-la-te-page">
                <div>
                    <h2 className="lm-page-title a-dd-te-mp-la-te-page">
                        <button className="lm-btn-icon a-dd-te-mp-la-te-page" onClick={() => setActivePage("templates")} style={{ marginRight: "0.5rem" }}>
                            <ArrowLeft size={18} />
                        </button>
                        {id ? "Edit Template" : "Add New Template"}
                    </h2>
                    <p className="lm-page-subtitle a-dd-te-mp-la-te-page">{id ? "Update existing" : "Create a new"} reporting template</p>
                </div>
            </div>

            <div className="lm-card a-dd-te-mp-la-te-page" style={{ maxWidth: "800px" }}>
                <form onSubmit={handleSubmit} className="lm-form-grid a-dd-te-mp-la-te-page">
                    <div className="lm-field lm-col-2 a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Name*</label>
                        <input 
                            className="lm-input a-dd-te-mp-la-te-page" 
                            placeholder="Template Name" 
                            required 
                            value={form.name} 
                            onChange={e => setForm({ ...form, name: e.target.value })} 
                        />
                    </div>

                    <div className="lm-field lm-col-2 a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Description</label>
                        <textarea 
                            className="lm-input a-dd-te-mp-la-te-page" 
                            style={{ minHeight: "80px" }}
                            placeholder="Template Description" 
                            value={form.description} 
                            onChange={e => setForm({ ...form, description: e.target.value })} 
                        />
                    </div>

                    <div className="lm-field lm-col-2 a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Group Name (Press Enter or Comma to add)</label>
                        <div className="lm-tag-input-wrap a-dd-te-mp-la-te-page">
                            <div className="lm-tags a-dd-te-mp-la-te-page">
                                {form.groupName && form.groupName.split(",").filter(g => g).map(g => (
                                    <span key={g} className="lm-tag a-dd-te-mp-la-te-page">
                                        {g} <X size={10} onClick={() => removeGroup(g)} />
                                    </span>
                                ))}
                            </div>
                            <input 
                                className="lm-tag-input a-dd-te-mp-la-te-page" 
                                placeholder="Type group name..." 
                                value={groupInput} 
                                onChange={e => setGroupInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ',') {
                                        e.preventDefault();
                                        addGroup();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="lm-field a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Template Type</label>
                        <select 
                            className="lm-select a-dd-te-mp-la-te-page" 
                            value={form.templateType} 
                            onChange={e => setForm({ ...form, templateType: e.target.value })}
                        >
                            <option value="Work Report">Work Report</option>
                            <option value="Visit">Visit</option>
                            <option value="Expense">Expense</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Task">Task</option>
                        </select>
                    </div>

                    <div className="lm-field a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Allow Multiple Report Per Shift</label>
                        <div className="lm-radio-group a-dd-te-mp-la-te-page">
                            <label><input type="radio" checked={!form.allowMultiplePerShift} onChange={() => setForm({ ...form, allowMultiplePerShift: false })} /> No</label>
                            <label><input type="radio" checked={form.allowMultiplePerShift} onChange={() => setForm({ ...form, allowMultiplePerShift: true })} /> Yes</label>
                        </div>
                    </div>

                    <div className="lm-field a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Required in Punch In</label>
                        <div className="lm-radio-group a-dd-te-mp-la-te-page">
                            <label><input type="radio" checked={!form.requiredOnPunchIn} onChange={() => setForm({ ...form, requiredOnPunchIn: false })} /> No</label>
                            <label><input type="radio" checked={form.requiredOnPunchIn} onChange={() => setForm({ ...form, requiredOnPunchIn: true })} /> Yes</label>
                        </div>
                    </div>

                    <div className="lm-field a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Required on Punch Out</label>
                        <select 
                            className="lm-select a-dd-te-mp-la-te-page" 
                            value={form.requiredOnPunchOut} 
                            onChange={e => setForm({ ...form, requiredOnPunchOut: e.target.value })}
                        >
                            <option value="Optional">Optional</option>
                            <option value="Required">Required</option>
                        </select>
                    </div>

                    <div className="lm-field a-dd-te-mp-la-te-page">
                        <label className="lm-label a-dd-te-mp-la-te-page">Need Reporting Person</label>
                        <div className="lm-radio-group a-dd-te-mp-la-te-page">
                            <label><input type="radio" checked={!form.needReportingPerson} onChange={() => setForm({ ...form, needReportingPerson: false })} /> No</label>
                            <label><input type="radio" checked={form.needReportingPerson} onChange={() => setForm({ ...form, needReportingPerson: true })} /> Yes</label>
                        </div>
                    </div>

                    <div className="lm-form-footer lm-col-2 a-dd-te-mp-la-te-page">
                        <button type="button" className="lm-btn-secondary a-dd-te-mp-la-te-page" onClick={() => setActivePage("templates")}>Cancel</button>
                        <button type="submit" className="lm-btn-primary a-dd-te-mp-la-te-page" disabled={submitting}>
                            <Save size={16} /> {submitting ? "Saving..." : (id ? "Update Template" : "Add Template")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
