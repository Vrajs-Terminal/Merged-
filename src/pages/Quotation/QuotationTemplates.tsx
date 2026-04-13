import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Layout, FileCheck, CheckCircle2, FileText } from "lucide-react";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

type QuotationTemplate = {
  id: number;
  name: string;
  type: string;
  default: boolean;
  status: "Active" | "Inactive";
};

const DEFAULT_TEMPLATES: QuotationTemplate[] = [
  { id: 1, name: "Standard Retail Quote", type: "Retailer", default: true, status: "Active" },
  { id: 2, name: "Corporate Distributor Quote", type: "Distributor", default: false, status: "Active" },
  { id: 3, name: "Seasonal Discount Template", type: "Promotional", default: false, status: "Inactive" },
];

const QuotationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<QuotationTemplate[]>(DEFAULT_TEMPLATES);
  const [appConfig, setAppConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("Retailer");
  const [templateStatus, setTemplateStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        const res = await adminSettingsAPI.getAppConfig();
        const payload = res?.data && typeof res.data === "object" ? (res.data as Record<string, any>) : {};
        setAppConfig(payload);

        const configured = Array.isArray(payload.quotationTemplates)
          ? (payload.quotationTemplates as QuotationTemplate[])
          : [];

        if (configured.length > 0) {
          setTemplates(configured);
        }
      } catch {
        toast.info("Using default quotation templates");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const persistTemplates = async (nextTemplates: QuotationTemplate[]) => {
    try {
      const nextConfig = {
        ...appConfig,
        quotationTemplates: nextTemplates,
      };

      await adminSettingsAPI.saveAppConfig(nextConfig);
      setAppConfig(nextConfig);
      setTemplates(nextTemplates);
    } catch {
      toast.error("Failed to save quotation templates");
    }
  };

  const addTemplate = async () => {
    const name = templateName.trim();
    if (!name) {
      toast.error("Template name is required");
      return;
    }

    const nextTemplate: QuotationTemplate = {
      id: Date.now(),
      name,
      type: templateType,
      default: templates.length === 0,
      status: templateStatus,
    };

    await persistTemplates([nextTemplate, ...templates]);
    setTemplateName("");
    setTemplateType("Retailer");
    setTemplateStatus("Active");
    toast.success("Template added");
  };

  const removeTemplate = async (id: number) => {
    const nextTemplates = templates.filter((template) => template.id !== id);
    await persistTemplates(nextTemplates);
    toast.success("Template deleted");
  };

  const toggleStatus = async (id: number) => {
    const nextTemplates: QuotationTemplate[] = templates.map((template) =>
      template.id === id
        ? {
            ...template,
            status: (template.status === "Active" ? "Inactive" : "Active") as "Active" | "Inactive",
          }
        : template
    );
    await persistTemplates(nextTemplates);
  };

  const setAsDefault = async (id: number) => {
    const nextTemplates = templates.map((template) => ({
      ...template,
      default: template.id === id,
    }));
    await persistTemplates(nextTemplates);
  };

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><FileText size={22} /> Quotation Templates</h1>
          <p className="page-subtitle">Standardize your sales process with reusable layouts and formats</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-primary">
            <Plus size={18} /> Add Template
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Template Name</th>
                <th>Target Type</th>
                <th>Default Status</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && templates.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                    No templates found.
                  </td>
                </tr>
              )}
              {templates.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <div style={{ background: "var(--primary-light)", padding: "8px", borderRadius: "8px" }}>
                        <Layout size={16} color="var(--primary)" />
                       </div>
                       <span style={{ fontWeight: "600" }}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{t.type}</span></td>
                  <td>
                    {t.default ? (
                      <span className="badge badge-success" style={{ gap: "4px" }}><CheckCircle2 size={12} /> Standard</span>
                    ) : (
                      <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }} onClick={() => setAsDefault(t.id)}>
                        Mark Default
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${t.status === "Active" ? "badge-success" : "badge-danger"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => setAsDefault(t.id)}><FileCheck size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => toggleStatus(t.id)}><Edit2 size={14} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px", color: "var(--danger)" }} onClick={() => removeTemplate(t.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Template Designer Section (Preview-like Form) */}
       <div className="glass-card" style={{ marginTop: "32px", border: "1px solid var(--primary-light)" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <Edit2 size={20} color="var(--primary)" />
            <h3 style={{ fontSize: "18px" }}>Template Designer Essentials</h3>
         </div>
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
               <div>
                  <label className="input-label">Template Identifier Name*</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g., Summer 2024 Bulk Order"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
               </div>
              <div>
                <label className="input-label">Target Type</label>
                <select className="select-modern" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
                  <option>Retailer</option>
                  <option>Distributor</option>
                  <option>Promotional</option>
                </select>
              </div>
              <div>
                <label className="input-label">Current Status</label>
                <select
                  className="select-modern"
                  value={templateStatus}
                  onChange={(e) => setTemplateStatus(e.target.value as "Active" | "Inactive")}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
               <div>
                  <label className="input-label">Header Section (Branding/Address)</label>
                  <textarea className="input-modern" rows={3} placeholder="Company Name, GSTIN, Registered Address..." style={{ resize: "none" }}></textarea>
               </div>
                <div>
                  <label className="input-label">Footer Section (Terms & Legal)</label>
                  <textarea className="input-modern" rows={3} placeholder="Delivery within 7 days, 100% advance..." style={{ resize: "none" }}></textarea>
               </div>
            </div>
            <div>
               <label className="input-label" style={{ marginBottom: "16px" }}>Visibility & Smart Controls</label>
               <div style={{ background: "rgba(79, 70, 229, 0.05)", padding: "20px", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {[
                    { label: "Show Discount Column", active: true },
                    { label: "Enable Itemwise Taxation", active: true },
                    { label: "Display Grand Total Summary", active: true },
                    { label: "Authorized Signature Box", active: false },
                    { label: "Include Bank Details", active: true }
                  ].map((field, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: "500" }}>{field.label}</span>
                      <div style={{ width: "40px", height: "18px", background: field.active ? "var(--success)" : "#cbd5e1", borderRadius: "10px", position: "relative", cursor: "pointer" }}>
                         <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", left: field.active ? "auto" : "2px", right: field.active ? "2px" : "auto", top: "2px" }}></div>
                      </div>
                    </div>
                  ))}
               </div>
              <button className="btn btn-primary" style={{ marginTop: "24px", width: "100%" }} onClick={addTemplate}>Save New Layout Profile</button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default QuotationTemplates;
