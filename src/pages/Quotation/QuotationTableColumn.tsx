import React, { useEffect, useState } from "react";
import { GripVertical, Eye, EyeOff, Save, Trash2, Edit2, PlayCircle, Loader2, FileText } from "lucide-react";
import { quotationConfigAPI } from "../../services/apiService";

const QuotationTableColumn: React.FC = () => {
  const defaultColumns = [
    { columnName: "Product Name", visible: true, sequence: 1, customLabel: "Product Name" },
    { columnName: "Description / SKU", visible: true, sequence: 2, customLabel: "Description / SKU" },
    { columnName: "Quantity", visible: true, sequence: 3, customLabel: "Quantity" },
    { columnName: "Unit Price (Rate)", visible: true, sequence: 4, customLabel: "Unit Price (Rate)" },
    { columnName: "Itemwise Discount", visible: false, sequence: 5, customLabel: "Itemwise Discount" },
    { columnName: "Applicable Tax", visible: true, sequence: 6, customLabel: "Applicable Tax" },
    { columnName: "Row Total", visible: true, sequence: 7, customLabel: "Row Total" },
  ];

  const [columns, setColumns] = useState<any[]>(defaultColumns);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setLoading(true);
        const res = await quotationConfigAPI.getConfigs();
        if (res.data && res.data.length > 0) {
          setColumns(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch configs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleToggleVisibility = (idx: number) => {
    const newCols = [...columns];
    newCols[idx].visible = !newCols[idx].visible;
    setColumns(newCols);
  };

  const handleLabelChange = (idx: number, val: string) => {
    const newCols = [...columns];
    newCols[idx].customLabel = val;
    setColumns(newCols);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await quotationConfigAPI.updateConfigs(columns);
      alert("Configuration saved successfully!");
    } catch (err) {
      alert("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return (
       <div className="main-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80vh" }}>
         <Loader2 className="animate-spin" size={48} color="var(--primary)" />
         <p style={{ marginTop: "16px", color: "var(--text-muted)" }}>Loading quotation settings...</p>
       </div>
     );
  }

  return (
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><FileText size={22} /> Quotation Table Column</h1>
          <p className="page-subtitle">Configure which columns appear in your quotation table and in what order</p>
        </div>
        <button className="btn btn-primary shadow-glow" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? " Saving..." : " Apply Changes Globally"}
        </button>
      </div>

       <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", color: "var(--primary)" }}>
           <PlayCircle size={20} />
           <p style={{ fontSize: "14px", fontWeight: "600" }}>Live Configuration Mode: Changes made here will affect PDF generation and the "Generate Quotation" preview screen.</p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: "30px" }}></th>
                <th>Sequence</th>
                <th>Column Name</th>
                <th>Visibility</th>
                <th>Header Label (Custom)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => (
                <tr key={idx} style={{ opacity: col.visible ? 1 : 0.6 }}>
                  <td>
                    <GripVertical size={16} color="var(--text-muted)" style={{ cursor: "grab" }} />
                  </td>
                  <td>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
                      {idx + 1}
                    </div>
                  </td>
                  <td style={{ fontWeight: "700", color: col.visible ? "var(--text-main)" : "var(--text-muted)" }}>{col.columnName}</td>
                  <td>
                    <div onClick={() => handleToggleVisibility(idx)}>
                      {col.visible ? (
                        <span className="badge badge-success" style={{ gap: "6px", cursor: "pointer" }}><Eye size={12} /> Visible</span>
                      ) : (
                        <span className="badge badge-gray" style={{ gap: "6px", cursor: "pointer" }}><EyeOff size={12} /> Hidden</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      className="input-modern" 
                      value={col.customLabel || col.columnName} 
                      onChange={(e) => handleLabelChange(idx, e.target.value)}
                      style={{ border: "none", background: "rgba(0,0,0,0.03)", padding: "4px 8px", fontSize: "13px", height: "30px", borderRadius: "4px" }} 
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Edit2 size={13} /></button>
                       <button className="btn btn-secondary" style={{ padding: "6px" }}><Trash2 size={13} color="var(--danger)" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: "32px" }} className="glass-card">
         <h4 style={{ fontSize: "16px", marginBottom: "16px" }}>Preview Section (Mini Mockup)</h4>
         <div style={{ padding: "16px", border: "1px dashed var(--border-light)", borderRadius: "10px", display: "flex", gap: "2px", background: "#fff" }}>
            {columns.filter(c => c.visible).sort((a,b)=>a.sequence - b.sequence).map((c, idx) => (
              <div key={idx} style={{ flex: 1, padding: "8px", background: "var(--primary-light)", fontSize: "11px", fontWeight: "700", textAlign: "center", border: "1px solid rgba(79,70,229,0.1)" }}>
                {c.customLabel || c.columnName}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default QuotationTableColumn;
