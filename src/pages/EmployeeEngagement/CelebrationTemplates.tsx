import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Edit, 
  MessageSquare, 
  Send, 
  Mail, 
  Bell,
  Loader2,
  Smartphone,
  Heart
} from "lucide-react";
import { celebrationTemplateAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

const CelebrationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    templateName: "",
    eventType: "Birthday",
    message: "",
    autoSend: false,
    sendVia: "Email",
    status: "Active"
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await celebrationTemplateAPI.getAll();
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch templates", err);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      eventType: template.eventType,
      message: template.message,
      autoSend: template.autoSend,
      sendVia: template.sendVia,
      status: template.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await celebrationTemplateAPI.delete(id);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await celebrationTemplateAPI.update(editingTemplate.id, formData);
        toast.success("Template updated successfully");
      } else {
        await celebrationTemplateAPI.create(formData);
        toast.success("Template created successfully");
      }
      setShowModal(false);
      setEditingTemplate(null);
      setFormData({
        templateName: "",
        eventType: "Birthday",
        message: "",
        autoSend: false,
        sendVia: "Email",
        status: "Active"
      });
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "Birthday": return "🎂";
      case "Work Anniversary": return "🎊";
      case "Wedding Anniversary": return "❤️";
      default: return "🎉";
    }
  };

  const getChannelIcon = (via: string) => {
    switch (via) {
      case "Email": return <Mail size={16} />;
      case "WhatsApp": return <Smartphone size={16} />;
      case "App Notification": return <Bell size={16} />;
      default: return <Send size={16} />;
    }
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title"><Heart size={22} /> Celebration Template List</h1>
          <p className="page-subtitle">Create and manage automated wishes for employee events</p>
        </div>
        <button 
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => {
            setEditingTemplate(null);
            setFormData({
              templateName: "",
              eventType: "Birthday",
              message: "",
              autoSend: false,
              sendVia: "Email",
              status: "Active"
            });
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Add Template
        </button>
      </div>

      <div className="glass-card" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Template Name</th>
                  <th>Event Type</th>
                  <th>Message Preview</th>
                  <th>Auto Send</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template, idx) => (
                  <tr key={template.id}>
                    <td>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{template.templateName}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        {getChannelIcon(template.sendVia)} {template.sendVia}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-primary-light`} style={{ display: "flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                        {getEventIcon(template.eventType)} {template.eventType}
                      </span>
                    </td>
                    <td>
                      <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "14px" }}>
                        {template.message}
                      </div>
                    </td>
                    <td>
                      {template.autoSend ? (
                        <span className="badge badge-success-light">Yes</span>
                      ) : (
                        <span className="badge badge-gray-light">No</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${template.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {template.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="action-btn edit-btn" onClick={() => handleEdit(template)} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(template.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {templates.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <MessageSquare size={48} opacity={0.2} />
                        <p>No templates found. Create your first celebration template!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-scale-up" style={{ width: "600px", padding: "32px" }}>
            <h2 style={{ marginBottom: "24px" }}>{editingTemplate ? "Edit Template" : "Add New Template"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="input-label">Template Name*</label>
                  <input 
                    type="text" 
                    className="input-modern" 
                    placeholder="e.g. Birthday Wish - Standard"
                    required 
                    value={formData.templateName}
                    onChange={e => setFormData({...formData, templateName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="input-label">Event Type*</label>
                  <select 
                    className="select-modern" 
                    required
                    value={formData.eventType}
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                  >
                    <option>Birthday</option>
                    <option>Work Anniversary</option>
                    <option>Wedding Anniversary</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label">Send Via*</label>
                  <select 
                    className="select-modern" 
                    required
                    value={formData.sendVia}
                    onChange={e => setFormData({...formData, sendVia: e.target.value})}
                  >
                    <option>Email</option>
                    <option>WhatsApp</option>
                    <option>App Notification</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="input-label">Message Content*</label>
                  <textarea 
                    className="input-modern" 
                    rows={4}
                    placeholder="Example: Happy Birthday {Employee Name}! 🎉 Have a great year ahead!"
                    required
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px" }}>
                    Available tags: <code style={{ color: "var(--primary)" }}>{"{Employee Name}"}</code>, <code style={{ color: "var(--primary)" }}>{"{Years Completed}"}</code>
                  </div>
                </div>

                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "12px", gridColumn: "span 1" }}>
                  <input 
                    type="checkbox" 
                    id="autoSend"
                    checked={formData.autoSend}
                    onChange={e => setFormData({...formData, autoSend: e.target.checked})}
                  />
                  <label htmlFor="autoSend" className="input-label" style={{ margin: 0 }}>Auto Send</label>
                </div>

                <div className="form-group">
                  <label className="input-label">Status</label>
                  <select 
                    className="select-modern"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "32px" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CelebrationTemplates;
