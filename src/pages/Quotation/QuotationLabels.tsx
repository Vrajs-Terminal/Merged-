import React, { useEffect, useState } from "react";
import { Edit2, Layout, Search, RotateCcw, CheckCircle2, FileText } from "lucide-react";
import { quotationConfigAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

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

  const [labels, setLabels] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await quotationConfigAPI.getConfigs();
        const rows = Array.isArray(res?.data) && res.data.length > 0 ? res.data : defaultColumns;
        setLabels(rows.map((row: any, index: number) => ({
          id: row.id || index + 1,
          original: row.columnName,
          display: row.customLabel || row.columnName,
          status: row.visible ? "Active" : "Inactive",
          sequence: row.sequence || index + 1,
        })));
      } catch {
        toast.error("Failed to load quotation labels");
        setLabels(defaultColumns.map((row, index) => ({
          id: index + 1,
          original: row.columnName,
          display: row.customLabel,
          status: row.visible ? "Active" : "Inactive",
          sequence: row.sequence,
        })));
      }
    };

    load();
  }, []);

  const handleLabelChange = (id: number, value: string) => {
    setLabels((prev) => prev.map((item) => item.id === id ? { ...item, display: value } : item));
  };

  const saveLabel = async (id: number) => {
    try {
      const payload = labels.map((item) => ({
        columnName: item.original,
        visible: item.status === "Active",
        sequence: item.sequence,
        customLabel: item.display,
      }));
      await quotationConfigAPI.updateConfigs(payload);
      toast.success("Quotation labels updated");
    } catch {
      toast.error("Failed to update quotation labels");
    }
  };

  const resetLabels = async () => {
    try {
      await quotationConfigAPI.updateConfigs(defaultColumns);
      setLabels(defaultColumns.map((row, index) => ({
        id: index + 1,
        original: row.columnName,
        display: row.customLabel,
        status: row.visible ? "Active" : "Inactive",
        sequence: row.sequence,
      })));
      toast.success("Labels reset to defaults");
    } catch {
      toast.error("Failed to reset labels");
    }
  };

  const filteredLabels = labels.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return item.original.toLowerCase().includes(q) || item.display.toLowerCase().includes(q);
  });

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><FileText size={22} /> Quotation Labels</h1>
          <p className="page-subtitle">Customize terminology used in quotes as per regional or client-specific requirements</p>
        </div>
        <button className="btn btn-secondary" onClick={resetLabels}>
          <RotateCcw size={18} /> Reset to Defaults
        </button>
      </div>

       <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", width: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input type="text" className="input-modern" placeholder="Search system labels..." style={{ paddingLeft: "40px" }} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={14} color="var(--success)" /> Live labels will apply to all new generated PDFs
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
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
                <tr key={l.id}>
                  <td>{idx + 1}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", background: "#f8fafc" }}>{l.original}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <input
                        type="text"
                        className="input-modern"
                        value={l.display}
                        onChange={(e) => handleLabelChange(l.id, e.target.value)}
                        style={{
                          border: "none",
                          background: "transparent",
                          padding: "4px",
                          fontWeight: "700",
                          fontSize: "14px",
                          width: "fit-content",
                          outline: "none",
                          color: "var(--primary)",
                        }}
                       />
                       <Edit2 size={12} color="var(--text-muted)" style={{ cursor: "pointer" }} />
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${l.status === "Active" ? "badge-success" : "badge-gray"}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={() => saveLabel(l.id)}>Update</button>
                  </td>
                </tr>
              ))}
              {filteredLabels.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>No quotation labels found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "24px", padding: "16px", borderRadius: "12px", background: "rgba(79, 70, 229, 0.05)", display: "flex", alignItems: "center", gap: "12px", color: "var(--primary)" }}>
         <Layout size={20} />
         <p style={{ fontSize: "14px", fontWeight: "600" }}>Pro Tip: Use custom labels to align with regional tax names (e.g., VAT, GST, Sales Tax) or industry-specific terminology.</p>
      </div>
    </div>
  );
};

export default QuotationLabels;
