import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  LayoutGrid,
  Loader2,
  PlayCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import { quotationConfigAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Quotation.css";

type QuotationColumn = {
  columnName: string;
  visible: boolean;
  sequence: number;
  customLabel: string;
};

const DEFAULT_COLUMNS: QuotationColumn[] = [
  { columnName: "Product Name", visible: true, sequence: 1, customLabel: "Product Name" },
  { columnName: "Description / SKU", visible: true, sequence: 2, customLabel: "Description / SKU" },
  { columnName: "Quantity", visible: true, sequence: 3, customLabel: "Quantity" },
  { columnName: "Unit Price (Rate)", visible: true, sequence: 4, customLabel: "Unit Price (Rate)" },
  { columnName: "Itemwise Discount", visible: false, sequence: 5, customLabel: "Itemwise Discount" },
  { columnName: "Applicable Tax", visible: true, sequence: 6, customLabel: "Applicable Tax" },
  { columnName: "Row Total", visible: true, sequence: 7, customLabel: "Row Total" },
];

const normalizeColumns = (rows: QuotationColumn[]) =>
  [...rows]
    .sort((a, b) => Number(a.sequence || 0) - Number(b.sequence || 0))
    .map((column, idx) => ({
      columnName: column.columnName,
      visible: Boolean(column.visible),
      sequence: idx + 1,
      customLabel: (column.customLabel || column.columnName || "").trim(),
    }));

const previewSampleValue = (columnName: string) => {
  const key = columnName.toLowerCase();
  if (key.includes("product")) return "Wireless Keyboard";
  if (key.includes("description") || key.includes("sku")) return "SKU-WK-1024";
  if (key.includes("quantity")) return "12";
  if (key.includes("unit") || key.includes("rate")) return "$39.00";
  if (key.includes("discount")) return "8%";
  if (key.includes("tax")) return "$28.08";
  if (key.includes("total")) return "$458.28";
  return "-";
};

const QuotationTableColumn: React.FC = () => {
  const [columns, setColumns] = useState<QuotationColumn[]>(DEFAULT_COLUMNS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const res = await quotationConfigAPI.getConfigs();
        const rows =
          Array.isArray(res?.data) && res.data.length > 0
            ? (res.data as QuotationColumn[])
            : DEFAULT_COLUMNS;
        setColumns(normalizeColumns(rows));
      } catch {
        toast.error("Failed to fetch quotation column configs. Showing defaults.");
        setColumns(normalizeColumns(DEFAULT_COLUMNS));
      } finally {
        setLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  const visibleColumns = useMemo(() => columns.filter((column) => column.visible), [columns]);
  const hiddenColumns = useMemo(() => columns.filter((column) => !column.visible), [columns]);

  const handleToggleVisibility = (idx: number) => {
    setColumns((prev) =>
      prev.map((column, index) => (index === idx ? { ...column, visible: !column.visible } : column)),
    );
  };

  const handleLabelChange = (idx: number, value: string) => {
    setColumns((prev) =>
      prev.map((column, index) => (index === idx ? { ...column, customLabel: value } : column)),
    );
  };

  const handleFocusLabel = (idx: number) => {
    const input = inputRefs.current[idx];
    if (!input) return;
    input.focus();
    input.select();
  };

  const handleResetRow = (idx: number) => {
    const target = columns[idx];
    const base = DEFAULT_COLUMNS.find((column) => column.columnName === target.columnName);
    if (!base) return;

    setColumns((prev) =>
      prev.map((column, index) =>
        index === idx
          ? {
              ...column,
              visible: base.visible,
              customLabel: base.customLabel,
            }
          : column,
      ),
    );
    toast.info(`${target.columnName} restored to defaults`);
  };

  const handleMove = (idx: number, direction: "up" | "down") => {
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= columns.length) return;

    const next = [...columns];
    const temp = next[idx];
    next[idx] = next[target];
    next[target] = temp;
    setColumns(next.map((column, index) => ({ ...column, sequence: index + 1 })));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await quotationConfigAPI.updateConfigs(columns);
      toast.success("Quotation table columns updated globally");
    } catch {
      toast.error("Failed to save quotation table columns");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content qcol-loading-shell">
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        <p>Loading quotation column settings...</p>
      </div>
    );
  }

  return (
    <div className="main-content animate-fade-in quotation-page-container qcol-page">
      <div className="quotation-header">
        <div className="quotation-header-text">
          <h1>
            <FileText size={22} /> Quotation Table Column
          </h1>
          <p>Configure visible columns, reorder them, and tune header labels used across quotation outputs.</p>
        </div>
        <div className="quotation-header-actions">
          <button className="btn btn-primary shadow-glow" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? "Saving..." : "Apply Changes Globally"}
          </button>
        </div>
      </div>

      <div className="quotation-summary-grid qcol-summary-grid">
        <div className="quotation-summary-card">
          <span>Total Columns</span>
          <strong>{columns.length}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Visible</span>
          <strong>{visibleColumns.length}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Hidden</span>
          <strong>{hiddenColumns.length}</strong>
        </div>
        <div className="quotation-summary-card">
          <span>Preview Sync</span>
          <strong>Live</strong>
        </div>
      </div>

      <div className="quotation-main-card glass-card qcol-config-card">
        <div className="quotation-toolbar">
          <div>
            <h2 className="quotation-section-title">Column Configuration Matrix</h2>
            <p className="quotation-section-subtitle">Manage sequence, visibility, and label text from one structured list.</p>
          </div>
        </div>

        <div className="quotation-toolbar-subrow qcol-live-row">
          <div className="quotation-live-note">
            <PlayCircle size={16} /> Live Configuration Mode: changes affect PDF generation and the Generate Quotation preview.
          </div>
        </div>

        <div className="qcol-table-wrap">
          <table className="table-modern quotation-table qcol-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Column Name</th>
                <th>Visibility</th>
                <th>Header Label (Custom)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((column, idx) => (
                <tr key={column.columnName} className={column.visible ? "" : "qcol-row-muted"}>
                  <td>
                    <div className="qcol-sequence-cell">
                      <button className="btn btn-secondary qcol-seq-btn" onClick={() => handleMove(idx, "up")} disabled={idx === 0}>
                        <ArrowUp size={12} />
                      </button>
                      <span className="qcol-sequence-chip">{idx + 1}</span>
                      <button
                        className="btn btn-secondary qcol-seq-btn"
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === columns.length - 1}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="qcol-name">{column.columnName}</span>
                  </td>
                  <td>
                    <button className={`quotation-status-pill ${column.visible ? "is-active" : ""}`} onClick={() => handleToggleVisibility(idx)}>
                      {column.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {column.visible ? "Visible" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <input
                      ref={(element) => {
                        inputRefs.current[idx] = element;
                      }}
                      type="text"
                      className="input-modern qcol-input"
                      value={column.customLabel || column.columnName}
                      onChange={(event) => handleLabelChange(idx, event.target.value)}
                    />
                  </td>
                  <td>
                    <div className="qcol-actions">
                      <button className="btn btn-secondary qcol-action-btn" onClick={() => handleFocusLabel(idx)}>
                        <Edit2 size={13} /> Edit
                      </button>
                      <button className="btn btn-secondary qcol-action-btn" onClick={() => handleResetRow(idx)}>
                        <RotateCcw size={13} /> Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card qcol-preview-card">
        <div className="qcol-preview-head">
          <h4>
            <LayoutGrid size={18} /> Preview Section (Mini Mockup)
          </h4>
          <p>A quick snapshot of how enabled headers appear in quotation output.</p>
        </div>

        <div className="qcol-preview-shell">
          <div className="qcol-preview-header-row">
            {visibleColumns.map((column) => (
              <span key={column.columnName} className="qcol-preview-header-chip">
                {column.customLabel || column.columnName}
              </span>
            ))}
          </div>

          <div className="qcol-preview-data-row">
            {visibleColumns.map((column) => (
              <span key={column.columnName} className="qcol-preview-data-chip">
                {previewSampleValue(column.columnName)}
              </span>
            ))}
          </div>
        </div>

        {hiddenColumns.length > 0 && (
          <div className="qcol-hidden-list">
            <label>Hidden in current output:</label>
            <div>
              {hiddenColumns.map((column) => (
                <span className="quotation-chip" key={column.columnName}>
                  {column.customLabel || column.columnName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationTableColumn;
