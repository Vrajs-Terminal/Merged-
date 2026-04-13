import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Hash, RefreshCcw, 
  ToggleLeft, ToggleRight, AlertTriangle, 
   CheckCircle2, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';

const AssetSettings: React.FC = () => {
  const [idSettings, setIdSettings] = useState<any>({
    enableAutoGenerate: true,
    prefix: 'AST',
    includeCategoryCode: true,
    serialType: 'Auto',
    updateExisting: false
  });
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const idRes = await assetsAPI.getIDSettings();
      if (idRes.data) setIdSettings(idRes.data);
    } catch (error) {
      toast.error('Failed to load system settings');
    }
  };

  const saveIDSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsAPI.updateIDSettings(idSettings);
      toast.success('ID Configuration deployed globally');
      fetchSettings();
    } catch (error) {
       toast.error('Failed to update protocol');
    }
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header Section */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <h1 className="page-title"><Package size={22} /> Assets Core Settings</h1>
           <p className="page-subtitle">Configure asset tracking logic and automated behaviors</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button onClick={fetchSettings} className="btn btn-secondary shadow-sm">
              <RefreshCcw size={18} />
           </button>
        </div>
      </div>

      <div style={{ width: "100%" }}>
         {/* ID Generation Settings */}
          <div style={{ width: "100%" }}>
            <form onSubmit={saveIDSettings} className="glass-card" style={{ padding: "32px", borderTop: "4px solid var(--primary)", width: "100%" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                     <div style={{ padding: "12px", background: "rgba(79, 70, 229, 0.08)", borderRadius: "12px" }}>
                        <Hash size={24} color="var(--primary)" />
                     </div>
                     <div>
                        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)" }}>Automated ID Assignment</h2>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Infrastructure indexing logic</p>
                     </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--color-bg-secondary)", padding: "10px 16px", borderRadius: "10px" }}>
                     <span style={{ fontSize: "11px", fontWeight: "700", color: idSettings.enableAutoGenerate ? "var(--primary)" : "var(--text-muted)" }}>
                        {idSettings.enableAutoGenerate ? 'PROTOCOL: ACTIVE' : 'PROTOCOL: DISABLED'}
                     </span>
                     <button
                        type="button"
                        onClick={() => setIdSettings({ ...idSettings, enableAutoGenerate: !idSettings.enableAutoGenerate })}
                        style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}
                     >
                        {idSettings.enableAutoGenerate ? <ToggleRight size={40} color="var(--primary)" /> : <ToggleLeft size={40} color="var(--color-border)" />}
                     </button>
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                     <div>
                        <label className="label-modern">Core Prefix Sequence*</label>
                        <input 
                          type="text"
                          required
                          disabled={!idSettings.enableAutoGenerate}
                          value={idSettings.prefix}
                          onChange={(e) => setIdSettings({ ...idSettings, prefix: e.target.value.toUpperCase() })}
                          className="input-modern"
                          style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "2px", color: "var(--primary)" }}
                        />
                     </div>
                     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div 
                          onClick={() => setIdSettings({ ...idSettings, includeCategoryCode: !idSettings.includeCategoryCode })}
                          className="glass-card"
                          style={{ padding: "16px", cursor: "pointer", border: idSettings.includeCategoryCode ? "2px solid var(--primary)" : "1px solid var(--color-border)", background: idSettings.includeCategoryCode ? "var(--primary-light)" : "white" }}
                        >
                           <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>Category Tag</p>
                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: "16px", fontWeight: "800", color: idSettings.includeCategoryCode ? "var(--primary)" : "var(--text-muted)" }}>Suffix</span>
                              <CheckCircle2 size={16} color={idSettings.includeCategoryCode ? "var(--primary)" : "var(--color-border)"} />
                           </div>
                        </div>
                        <div className="glass-card" style={{ padding: "16px", background: "var(--color-bg-secondary)" }}>
                           <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textAlign: "center", marginBottom: "8px" }}>Generation Method</p>
                           <div style={{ display: "flex", gap: "8px" }}>
                             {(['Auto', 'Manual'] as const).map(m => (
                               <button
                                 key={m}
                                 type="button"
                                 onClick={() => setIdSettings({ ...idSettings, serialType: m })}
                                 style={{
                                   flex: 1,
                                   padding: "6px",
                                   fontSize: "10px",
                                   fontWeight: "700",
                                   borderRadius: "8px",
                                   border: "none",
                                   background: idSettings.serialType === m ? "var(--primary)" : "white",
                                   color: idSettings.serialType === m ? "white" : "var(--text-muted)",
                                   transition: "all 0.2s"
                                 }}
                               >
                                 {m}
                               </button>
                             ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  <div style={{ background: "var(--color-text-primary)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", textAlign: "center", position: "relative", overflow: "hidden" }}>
                     <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", filter: "blur(20px)" }} />
                     <p style={{ fontSize: "10px", fontWeight: "700", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "16px" }}>Logic Match Preview</p>
                     <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                        <span style={{ fontSize: "40px", fontWeight: "800" }}>{idSettings.prefix}</span>
                        {idSettings.includeCategoryCode && <span style={{ fontSize: "40px", fontWeight: "800", color: "var(--primary)" }}>LAP</span>}
                        <span style={{ fontSize: "40px", fontWeight: "800", opacity: 0.2 }}>001</span>
                     </div>
                     <div style={{ marginTop: "24px", display: "flex", gap: "12px", opacity: 0.3 }}>
                        <span style={{ fontSize: "8px", fontWeight: "800" }}>PREFIX • CATEGORY • SERIAL</span>
                     </div>
                  </div>
               </div>

               <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
                     <div 
                        onClick={() => setIdSettings({ ...idSettings, updateExisting: !idSettings.updateExisting })}
                        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 20px", borderRadius: "12px", background: idSettings.updateExisting ? "rgba(239, 68, 68, 0.08)" : "var(--color-bg-secondary)", border: idSettings.updateExisting ? "1px solid #ef4444" : "1px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
                     >
                        <AlertTriangle size={18} color={idSettings.updateExisting ? "#ef4444" : "var(--text-muted)"} />
                        <div>
                           <p style={{ fontSize: "12px", fontWeight: "700", color: idSettings.updateExisting ? "#ef4444" : "var(--text-main)", margin: 0 }}>Retroactive Overwrite</p>
                           <p style={{ fontSize: "10px", color: "var(--text-muted)", margin: 0 }}>Apply to existing records</p>
                        </div>
                     </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ padding: "14px 32px" }}>
                     Commit Global Logic
                  </button>
               </div>
            </form>
          </div>
      </div>
    </div>
  );
};

export default AssetSettings;
