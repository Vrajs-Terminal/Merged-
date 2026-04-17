import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Layout,
  FileCheck,
  CheckCircle2,
  FileText,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Eye,
  BadgePercent,
  Coins,
} from "lucide-react";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Quotation.css";

type QuotationTemplate = {
  id: number;
  name: string;
  type: string;
  default: boolean;
  status: "Active" | "Inactive";
  header?: string;
  footer?: string;
  controls?: Record<string, boolean>;
};

type TemplateDraft = {
  name: string;
  type: string;
  status: "Active" | "Inactive";
  header: string;
  footer: string;
  controls: Record<string, boolean>;
};

const CONTROL_DEFS = [
  { key: "showDiscountColumn", label: "Show Discount Column", description: "Display item-level discount columns in the quotation table.", icon: BadgePercent },
  { key: "enableItemwiseTaxation", label: "Enable Itemwise Taxation", description: "Apply tax rules per line item instead of a flat document rate.", icon: Coins },
  { key: "displayGrandTotalSummary", label: "Display Grand Total Summary", description: "Show a clear final summary panel at the bottom of the quotation.", icon: Eye },
  { key: "authorizedSignatureBox", label: "Authorized Signature Box", description: "Reserve space for the sign-off area on the printed quotation.", icon: ShieldCheck },
  { key: "includeBankDetails", label: "Include Bank Details", description: "Show payment and bank information in the footer section.", icon: FileText },
];

const DEFAULT_CONTROLS = CONTROL_DEFS.reduce((accumulator, control) => {
  accumulator[control.key] = control.key !== "authorizedSignatureBox";
  return accumulator;
}, {} as Record<string, boolean>);

const DEFAULT_DRAFT: TemplateDraft = {
  name: "",
  type: "Retailer",
  status: "Active",
  header: "",
  footer: "",
  controls: DEFAULT_CONTROLS,
};

const DEFAULT_TEMPLATES: QuotationTemplate[] = [
  {
    id: 1,
    name: "Standard Retail Quote",
    type: "Retailer",
    default: true,
    status: "Active",
    header: "Company name, address, GSTIN and quotation reference block.",
    footer: "Standard delivery terms, warranty note, and payment disclaimer.",
    controls: { ...DEFAULT_CONTROLS },
  },
  {
    id: 2,
    name: "Corporate Distributor Quote",
    type: "Distributor",
    default: false,
    status: "Active",
    header: "Corporate identity block with client and approval details.",
    footer: "Payment instructions, authorized contacts, and bank details.",
    controls: { ...DEFAULT_CONTROLS },
  },
  {
    id: 3,
    name: "Seasonal Discount Template",
    type: "Promotional",
    default: false,
    status: "Inactive",
    header: "Campaign-specific banner and limited-period offer summary.",
    footer: "Offer expiry, replacement policy, and special terms.",
    controls: { ...DEFAULT_CONTROLS, authorizedSignatureBox: false },
  },
];

const QuotationTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<QuotationTemplate[]>(DEFAULT_TEMPLATES);
  const [appConfig, setAppConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [draft, setDraft] = useState<TemplateDraft>(DEFAULT_DRAFT);
  const designerRef = useRef<HTMLDivElement | null>(null);

  const normalizeTemplate = (template: Partial<QuotationTemplate>): QuotationTemplate => ({
    id: Number(template.id || Date.now()),
    name: template.name || "Untitled Template",
    type: template.type || "Retailer",
    default: Boolean(template.default),
    status: template.status === "Inactive" ? "Inactive" : "Active",
    header: template.header || "",
    footer: template.footer || "",
    controls: { ...DEFAULT_CONTROLS, ...(template.controls || {}) },
  });

  const scrollToDesigner = () => {
    designerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const beginCreateTemplate = () => {
    setEditingTemplateId(null);
    setDraft(DEFAULT_DRAFT);
    scrollToDesigner();
  };

  const beginEditTemplate = (template: QuotationTemplate) => {
    setEditingTemplateId(template.id);
    setDraft({
      name: template.name,
      type: template.type,
      status: template.status,
      header: template.header || "",
      footer: template.footer || "",
      controls: { ...DEFAULT_CONTROLS, ...(template.controls || {}) },
    });
    scrollToDesigner();
  };

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
          setTemplates(configured.map(normalizeTemplate));
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

  const addOrUpdateTemplate = async () => {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Template name is required");
      return;
    }

    const nextTemplate: QuotationTemplate = {
      id: editingTemplateId ?? Date.now(),
      name,
      type: draft.type,
      default:
        editingTemplateId !== null
          ? templates.find((template) => template.id === editingTemplateId)?.default || false
          : templates.length === 0,
      status: draft.status,
      header: draft.header.trim(),
      footer: draft.footer.trim(),
      controls: { ...draft.controls },
    };

    const nextTemplates = editingTemplateId === null
      ? [nextTemplate, ...templates]
      : templates.map((template) => (template.id === editingTemplateId ? nextTemplate : template));

    await persistTemplates(nextTemplates);
    setEditingTemplateId(null);
    setDraft(DEFAULT_DRAFT);
    toast.success(editingTemplateId === null ? "Template added" : "Template updated");
  };

  const removeTemplate = async (id: number) => {
    const confirmed = window.confirm("Delete this quotation template?");
    if (!confirmed) return;

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

  const activeCount = useMemo(() => templates.filter((template) => template.status === "Active").length, [templates]);
  const defaultTemplate = useMemo(() => templates.find((template) => template.default), [templates]);
  const enabledControlsCount = useMemo(
    () => Object.values(draft.controls).filter(Boolean).length,
    [draft.controls],
  );

  return (
    <div className="main-content animate-fade-in quotation-page-container">
      <div className="quotation-header">
        <div className="quotation-header-text">
          <h1><FileText size={22} /> Quotation Templates</h1>
          <p>Standardize your sales process with reusable layouts, better controls, and clear action flows.</p>
        </div>
        <div className="quotation-header-actions">
          <button className="btn btn-secondary" onClick={() => persistTemplates(DEFAULT_TEMPLATES.map(normalizeTemplate))}>
            <RefreshCw size={16} /> Restore Defaults
          </button>
          <button className="btn btn-primary" onClick={beginCreateTemplate}>
            <Plus size={18} /> Add Template
          </button>
        </div>
      </div>

      <div className="quotation-summary-grid">
        <div className="quotation-summary-card">
          <span>Total Templates</span>
          <strong>{templates.length}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Active Templates</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Default Template</span>
          <strong>{defaultTemplate?.name || "Not set"}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Enabled Controls</span>
          <strong>{enabledControlsCount} / {CONTROL_DEFS.length}</strong>
        </div>
      </div>

      <div className="quotation-main-card glass-card">
        <div className="quotation-toolbar">
          <div>
            <h2 className="quotation-section-title">Template Library</h2>
            <p className="quotation-section-subtitle">Manage reusable quotation layouts and quickly switch the default profile.</p>
          </div>
          <div className="quotation-toolbar-actions">
            <button className="btn btn-secondary" onClick={() => scrollToDesigner()}>
              <Edit2 size={16} /> Open Designer
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern quotation-table">
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
                    <div className="quotation-template-cell">
                       <div className="quotation-template-icon">
                        <Layout size={16} color="var(--primary)" />
                       </div>
                       <div>
                         <span className="quotation-template-name">{t.name}</span>
                         <p className="quotation-template-meta">{t.header || "No header summary set"}</p>
                       </div>
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
                    <div className="quotation-action-group">
                       <button className="btn btn-secondary quotation-action-btn" title="Edit template" aria-label="Edit template" onClick={() => beginEditTemplate(t)}>
                         <Edit2 size={14} />
                       </button>
                       <button className="btn btn-secondary quotation-action-btn" title="Make default" aria-label="Make default" onClick={() => setAsDefault(t.id)}>
                         <FileCheck size={14} />
                       </button>
                       <button className="btn btn-secondary quotation-action-btn" title={t.status === "Active" ? "Deactivate template" : "Activate template"} aria-label={t.status === "Active" ? "Deactivate template" : "Activate template"} onClick={() => toggleStatus(t.id)}>
                         {t.status === "Active" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                       </button>
                       <button className="btn btn-danger quotation-action-btn" title="Delete template" aria-label="Delete template" onClick={() => removeTemplate(t.id)}>
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={designerRef} className="glass-card quotation-designer-card">
         <div className="quotation-designer-header">
            <div>
              <div className="quotation-designer-title-row">
                <Edit2 size={20} color="var(--primary)" />
                <h3>Template Designer Essentials</h3>
              </div>
              <p className="quotation-section-subtitle">
                Build or update a quotation layout profile with structure, visibility, and footer content in one place.
              </p>
            </div>
            <button className="btn btn-secondary" onClick={beginCreateTemplate}>
              <Plus size={16} /> New Template
            </button>
         </div>

         <div className="quotation-designer-grid">
            <div className="quotation-designer-column">
               <div className="quotation-field-card">
                 <div className="quotation-field-card-head">
                   <h4>Template Identity</h4>
                   <span className="badge badge-primary">{editingTemplateId ? "Editing Mode" : "New Layout"}</span>
                 </div>
               <div>
                  <label className="input-label">Template Identifier Name*</label>
                  <input
                    type="text"
                    className="input-modern"
                    placeholder="e.g., Summer 2024 Bulk Order"
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  />
               </div>
              <div>
                <label className="input-label">Target Type</label>
                <select className="select-modern" value={draft.type} onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}>
                  <option>Retailer</option>
                  <option>Distributor</option>
                  <option>Promotional</option>
                </select>
              </div>
              <div>
                <label className="input-label">Current Status</label>
                <select
                  className="select-modern"
                  value={draft.status}
                  onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              </div>

               <div className="quotation-field-card">
                 <div className="quotation-field-card-head">
                   <h4>Header / Footer Content</h4>
                   <span className="quotation-chip">Printed layout copy</span>
                 </div>
                 <div>
                    <label className="input-label">Header Section (Branding / Address)</label>
                    <textarea
                      className="input-modern"
                      rows={4}
                      placeholder="Company Name, GSTIN, Registered Address..."
                      style={{ resize: "none" }}
                      value={draft.header}
                      onChange={(e) => setDraft((prev) => ({ ...prev, header: e.target.value }))}
                    />
                 </div>
                 <div>
                    <label className="input-label">Footer Section (Terms & Legal)</label>
                    <textarea
                      className="input-modern"
                      rows={4}
                      placeholder="Delivery within 7 days, 100% advance..."
                      style={{ resize: "none" }}
                      value={draft.footer}
                      onChange={(e) => setDraft((prev) => ({ ...prev, footer: e.target.value }))}
                    />
                 </div>
               </div>
            </div>

            <div className="quotation-designer-column">
               <div className="quotation-field-card quotation-control-card">
                 <div className="quotation-field-card-head">
                   <div>
                     <h4>Visibility & Smart Controls</h4>
                     <p className="quotation-section-subtitle">Make the template logic easier to understand and control at a glance.</p>
                   </div>
                   <span className="badge badge-success">{enabledControlsCount} enabled</span>
                 </div>
                 <div className="quotation-control-list">
                  {CONTROL_DEFS.map((control) => {
                    const Icon = control.icon;
                    const checked = draft.controls[control.key];

                    return (
                      <label key={control.key} className="quotation-control-row">
                        <div className="quotation-control-copy">
                          <span className="quotation-control-icon"><Icon size={16} /></span>
                          <div>
                            <span className="quotation-control-title">{control.label}</span>
                            <span className="quotation-control-desc">{control.description}</span>
                          </div>
                        </div>
                        <span className={`quotation-switch ${checked ? "is-on" : ""}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) =>
                              setDraft((prev) => ({
                                ...prev,
                                controls: { ...prev.controls, [control.key]: event.target.checked },
                              }))
                            }
                          />
                          <span />
                        </span>
                      </label>
                    );
                  })}
                 </div>
               </div>

               <div className="quotation-preview-card">
                 <div className="quotation-preview-head">
                   <h4>Live Layout Summary</h4>
                   <span className={`badge ${draft.status === "Active" ? "badge-success" : "badge-danger"}`}>{draft.status}</span>
                 </div>
                 <div className="quotation-preview-name">{draft.name || "Untitled template"}</div>
                 <div className="quotation-preview-meta-row">
                   <span className="quotation-chip">{draft.type}</span>
                   <span className="quotation-chip">{editingTemplateId ? "Editing existing" : "Creating new"}</span>
                 </div>
                 <div className="quotation-preview-block">
                   <label>Header</label>
                   <p>{draft.header || "No header content added yet."}</p>
                 </div>
                 <div className="quotation-preview-block">
                   <label>Footer</label>
                   <p>{draft.footer || "No footer content added yet."}</p>
                 </div>
                 <div className="quotation-preview-footer">
                   <span>{enabledControlsCount} of {CONTROL_DEFS.length} controls enabled</span>
                   <span>{draft.type} layout</span>
                 </div>
               </div>
              <button className="btn btn-primary quotation-save-btn" onClick={addOrUpdateTemplate}>
                {editingTemplateId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingTemplateId ? "Update Layout Profile" : "Save New Layout Profile"}
              </button>
            </div>
         </div>
       </div>
    </div>
  );
};

export default QuotationTemplates;
