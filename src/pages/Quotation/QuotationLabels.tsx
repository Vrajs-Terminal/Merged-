import React, { useEffect, useMemo, useState } from "react";
import { Edit2, Layout, Search, RotateCcw, CheckCircle2, FileText, Save, RefreshCcw, ToggleLeft, ToggleRight } from "lucide-react";
import { quotationConfigAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Quotation.css";

type LabelRow = {
  id: number;
  original: string;
  display: string;
  status: "Active" | "Inactive";
  sequence: number;
};

const QuotationLabels: React.FC = () => {
  const defaultColumns = [
    { columnName: "Product Name", visible: true, sequence: 1, customLabel: "Product Name" },
    { columnName: "Description / SKU", visible: true, sequence: 2, customLabel: "Description / SKU" },
    { columnName: "Quantity", visible: true, sequence: 3, customLabel: "Quantity" },
    { columnName: "Unit Price (Rate)", visible: true, sequence: 4, customLabel: "Unit Price (Rate)" },
    { columnName: "Itemwise Discount", visible: false, sequence: 5, customLabel: "Itemwise Discount" },
    { columnName: "Applicable Tax", visible: true, sequence: 6, customLabel: "Applicable Tax" },
    { columnName: "Row Total", visible: true, sequence: 7, customLabel: "Row Total" },
  ];

  const normalizeLabels = (rows: typeof defaultColumns): LabelRow[] =>
    rows.map((row, index) => ({
      id: index + 1,
      original: row.columnName,
      display: row.customLabel || row.columnName,
      status: row.visible ? "Active" : "Inactive",
      sequence: row.sequence || index + 1,
    }));

  const [labels, setLabels] = useState<LabelRow[]>(normalizeLabels(defaultColumns));
  const [baselineLabels, setBaselineLabels] = useState<LabelRow[]>(normalizeLabels(defaultColumns));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [savingRowId, setSavingRowId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quotationConfigAPI.getConfigs();
        const rows = Array.isArray(res?.data) && res.data.length > 0 ? res.data : defaultColumns;
        setLabels(
          rows.map((row: any, index: number) => ({
            id: row.id || index + 1,
            original: row.columnName,
            display: row.customLabel || row.columnName,
            status: row.visible ? "Active" : "Inactive",
            sequence: row.sequence || index + 1,
          })),
        );
        setBaselineLabels(
          rows.map((row: any, index: number) => ({
            id: row.id || index + 1,
            original: row.columnName,
            display: row.customLabel || row.columnName,
            status: row.visible ? "Active" : "Inactive",
            sequence: row.sequence || index + 1,
          })),
        );
      } catch {
        toast.error("Failed to load quotation labels");
        const normalized = normalizeLabels(defaultColumns);
        setLabels(normalized);
        setBaselineLabels(normalized);
      }
    };

    load();
  }, []);

  const handleLabelChange = (id: number, value: string) => {
    setLabels((prev) => prev.map((item) => item.id === id ? { ...item, display: value } : item));
  };

  const updateStatus = (id: number) => {
    setLabels((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item,
      ),
    );
  };

  const resetRow = (original: string) => {
    const defaultRow = defaultColumns.find((row) => row.columnName === original);
    if (!defaultRow) return;

    setLabels((prev) =>
      prev.map((item, index) =>
        item.original === original
          ? {
              ...item,
              display: defaultRow.customLabel,
              status: defaultRow.visible ? "Active" : "Inactive",
              sequence: defaultRow.sequence || index + 1,
            }
          : item,
      ),
    );
    toast.info(`Label ${defaultRow.columnName} restored`);
  };

  const saveLabel = async (id: number) => {
    try {
      setSavingRowId(id);
      const payload = labels.map((item) => ({
        columnName: item.original,
        visible: item.status === "Active",
        sequence: item.sequence,
        customLabel: item.display,
      }));
      await quotationConfigAPI.updateConfigs(payload);
      setBaselineLabels(labels);
      toast.success("Quotation labels updated");
    } catch {
      toast.error("Failed to update quotation labels");
    } finally {
      setSavingRowId(null);
    }
  };

  const resetLabels = async () => {
    try {
      const normalizedDefaults = normalizeLabels(defaultColumns);
      await quotationConfigAPI.updateConfigs(defaultColumns);
      setLabels(normalizedDefaults);
      setBaselineLabels(normalizedDefaults);
      toast.success("Labels reset to defaults");
    } catch {
      toast.error("Failed to reset labels");
    }
  };

  const updateAllLabels = async () => {
    try {
      await quotationConfigAPI.updateConfigs(
        labels.map((item) => ({
          columnName: item.original,
          visible: item.status === "Active",
          sequence: item.sequence,
          customLabel: item.display,
        })),
      );
      setBaselineLabels(labels);
      toast.success("All quotation labels updated");
    } catch {
      toast.error("Failed to update quotation labels");
    }
  };

  const activeCount = useMemo(() => labels.filter((item) => item.status === "Active").length, [labels]);
  const customCount = useMemo(() => labels.filter((item) => item.display.trim() !== item.original.trim()).length, [labels]);

  const filteredLabels = labels.filter((item) => {
    const q = search.trim().toLowerCase();
    const queryMatch = !q || item.original.toLowerCase().includes(q) || item.display.toLowerCase().includes(q);
    const statusMatch = statusFilter === "All" || item.status === statusFilter;
    return queryMatch && statusMatch;
  });

  const isRowDirty = (row: LabelRow) => {
    const baseline = baselineLabels.find((item) => item.original === row.original);
    if (!baseline) return false;
    return baseline.display !== row.display || baseline.status !== row.status;
  };

  const dirtyCount = useMemo(() => labels.filter((row) => isRowDirty(row)).length, [labels, baselineLabels]);
  const filteredCount = filteredLabels.length;

  const previewVisible = useMemo(
    () => labels.filter((item) => item.status === "Active").sort((a, b) => a.sequence - b.sequence),
    [labels],
  );
  const previewHidden = useMemo(() => labels.filter((item) => item.status !== "Active"), [labels]);

  return (
    <div className="main-content animate-fade-in quotation-page-container">
      <div className="quotation-header">
        <div className="quotation-header-text">
          <h1><FileText size={22} /> Quotation Labels</h1>
          <p>Customize terminology used in quotes for regional rules, client-specific phrasing, and PDF output.</p>
        </div>
        <div className="quotation-header-actions">
          <button className="btn btn-secondary" onClick={resetLabels}>
            <RotateCcw size={16} /> Reset to Defaults
          </button>
          <button className="btn btn-primary" onClick={updateAllLabels}>
            <Save size={16} /> Save All Changes
          </button>
        </div>
      </div>

      <div className="quotation-summary-grid">
        <div className="quotation-summary-card">
          <span>Total Labels</span>
          <strong>{labels.length}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Active Labels</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Custom Labels</span>
          <strong>{customCount}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Unsaved Changes</span>
          <strong>{dirtyCount}</strong>
        </div>
      </div>

      <div className="quotation-main-card glass-card">
        <div className="quotation-toolbar">
          <div className="qlabel-toolbar-copy">
            <h2 className="quotation-section-title">System Label Library</h2>
            <p className="quotation-section-subtitle">Edit display names, toggle visibility, and save changes for each row or in bulk.</p>
            <div className="qlabel-toolbar-meta">
              <span className="qlabel-meta-chip">Showing {filteredCount} of {labels.length}</span>
              {dirtyCount > 0 && <span className="qlabel-meta-chip is-warning">{dirtyCount} pending change{dirtyCount > 1 ? "s" : ""}</span>}
            </div>
          </div>
          <div className="quotation-toolbar-actions">
            <div className="quotation-search-wrap">
              <Search size={18} className="quotation-search-icon" />
              <input
                type="text"
                className="input-modern"
                placeholder="Search system labels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select-modern qlabel-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="quotation-toolbar-subrow">
          <div className="quotation-live-note">
            <CheckCircle2 size={14} /> Live labels will apply to all new generated PDFs
          </div>
        </div>

        <div className="qlabel-table-wrap">
          <table className="table-modern quotation-table qlabel-table">
            <colgroup>
              <col style={{ width: "56px" }} />
              <col style={{ width: "30%" }} />
              <col style={{ width: "36%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>System Label</th>
                <th>Display Name (Custom)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabels.map((l, idx) => (
                <tr key={l.id} className={isRowDirty(l) ? "qlabel-row-dirty" : ""}>
                  <td><span className="qlabel-index">{idx + 1}</span></td>
                  <td>
                    <span className="quotation-system-label">{l.original}</span>
                  </td>
                  <td>
                    <div className="quotation-label-input-wrap">
                      <input
                        type="text"
                        className="input-modern quotation-label-input qlabel-display-input"
                        value={l.display}
                        onChange={(e) => handleLabelChange(l.id, e.target.value)}
                      />
                      <Edit2 size={12} color="var(--color-text-muted)" />
                      {isRowDirty(l) && <span className="qlabel-dirty-pill">Modified</span>}
                    </div>
                  </td>
                  <td>
                    <button className={`quotation-status-pill ${l.status === "Active" ? "is-active" : ""}`} onClick={() => updateStatus(l.id)}>
                      {l.status === "Active" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {l.status}
                    </button>
                  </td>
                  <td>
                    <div className="qlabel-action-wrap">
                      <button className="btn btn-secondary qlabel-action-btn" onClick={() => resetRow(l.original)}>
                        <RefreshCcw size={14} /> Reset
                      </button>
                      <button className="btn btn-primary qlabel-action-btn" onClick={() => saveLabel(l.id)} disabled={!isRowDirty(l) || savingRowId === l.id}>
                        <Save size={14} /> {savingRowId === l.id ? "Saving..." : "Update"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLabels.length === 0 && (
                <tr>
                  <td colSpan={5} className="quotation-empty-row">No quotation labels found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card qlabel-preview-card">
        <div className="qlabel-preview-head">
          <h4>Preview Section (Mini Mockup)</h4>
          <p>Shows how label names will appear in generated quotation headers.</p>
        </div>

        <div className="qlabel-preview-grid">
          {previewVisible.map((item) => (
            <div className="qlabel-preview-chip" key={item.original}>
              <span>{item.display}</span>
            </div>
          ))}
        </div>

        {previewHidden.length > 0 && (
          <div className="qlabel-hidden-row">
            <label>Hidden labels:</label>
            <div>
              {previewHidden.map((item) => (
                <span className="quotation-chip" key={item.original}>{item.display}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="quotation-tip-card">
         <Layout size={20} />
         <p>Pro Tip: Use custom labels to align with regional tax names such as VAT, GST, or sales tax and keep client-facing documents consistent.</p>
      </div>
    </div>
  );
};

export default QuotationLabels;
