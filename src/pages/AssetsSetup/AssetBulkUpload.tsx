import React, { useState, useRef, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  CheckCircle2, AlertCircle, 
  Plus, ArrowRight, Download, Package,
  Trash2, Layers, Hash, Info
} from 'lucide-react';
import { toast } from '../../components/Toast';

const AssetBulkUpload: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    assetsAPI.getCategories().then(res => setCategories(res.data));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        toast.error('File lacks sufficient matrix data (header + records required)');
        return;
      }
      
      const parsed = lines.slice(1).map(line => {
        const [itemName, categoryName, brand, price, vendor, serialNo] = line.split(',').map(s => s.trim());
        const cat = categories.find(c => c.name.toLowerCase() === categoryName?.toLowerCase() || c.code.toLowerCase() === categoryName?.toLowerCase());
        return {
          itemName,
          categoryId: cat?.id || '',
          categoryName: categoryName || 'Unknown',
          brand,
          price: parseFloat(price) || 0,
          vendor,
          serialNo,
          isValid: !!cat && !!itemName
        };
      });

      setData(parsed);
      setStep(2);
      toast.info(`Parsed ${parsed.length} potential asset records`);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    const validData = data.filter(d => d.isValid).map(({ categoryName, isValid, ...rest }) => rest);
    if (!validData.length) {
      toast.error('No validated records found to initiate protocol');
      return;
    }

    try {
      setLoading(true);
      await assetsAPI.bulkUploadAssets({ assets: validData });
      toast.success(`${validData.length} Hardware units successfully integrated`);
      setStep(3);
    } catch (error) {
      toast.error('Matrix integration failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
     const csvContent = "data:text/csv;charset=utf-8,Item Name,Category,Brand,Price,Vendor,Serial No\nDell XPS 13,Laptops,Dell,1200,Dell Direct,SN-001\niPhone 15,Mobile,Apple,999,Apple Store,SN-002";
     const link = document.createElement("a");
     link.setAttribute("href", encodeURI(csvContent));
     link.setAttribute("download", "minehr_asset_template.csv");
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
           <h1 className="page-title"><Package size={22} /> Batch Asset Registry</h1>
           <p className="page-subtitle">High-volume record synchronization</p>
        </div>
        <button 
          onClick={downloadSample}
          className="btn btn-secondary shadow-sm"
        >
          <Download size={18} style={{ marginRight: '8px' }} /> Download Template
        </button>
      </div>

      <div className="glass-card" style={{ padding: 0, minHeight: "500px", display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: "32px", position: "relative" }}>
         {/* Custom Gradient Step Progress */}
         <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-secondary)", padding: "20px 40px" }}>
            {[1, 2, 3].map((s) => (
               <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", opacity: step >= s ? 1 : 0.4 }}>
                  <div style={{ 
                    width: "36px", 
                    height: "36px", 
                    borderRadius: "10px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontWeight: "700", 
                    background: step === s ? "var(--primary)" : step > s ? "#10b981" : "var(--color-border)",
                    color: "white"
                  }}>
                     {step > s ? <CheckCircle2 size={18} /> : s}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: step === s ? "var(--primary)" : "var(--text-muted)" }}>
                    {s === 1 ? 'Source Upload' : s === 2 ? 'Validation Matrix' : 'Closure Sync'}
                  </span>
                  {s < 3 && <div style={{ flex: 1, height: "2px", background: "var(--color-border)", margin: "0 12px" }}></div>}
               </div>
            ))}
         </div>

         <div style={{ padding: "40px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            {step === 1 && (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 style={{ 
                   flex: 1, 
                   display: "flex", 
                   flexDirection: "column", 
                   alignItems: "center", 
                   justifyContent: "center", 
                   padding: "60px", 
                   border: "2px dashed var(--color-border)", 
                   borderRadius: "20px", 
                   cursor: "pointer",
                   background: "rgba(79, 70, 229, 0.02)"
                 }}
               >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                  <div style={{ width: "80px", height: "80px", background: "white", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: "var(--shadow-sm)" }}>
                     <Plus size={32} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", marginBottom: "8px" }}>Drop CSV Protocol File</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500", marginBottom: "32px" }}>Matrix validation will proceed upon selection</p>
                  
                  <div style={{ display: "flex", gap: "32px", borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>
                        <Layers size={16} /> 500+ Items per sync
                     </div>
                     <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>
                        <AlertCircle size={16} /> Validates Auto-ID rules
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div className="space-y-10 animate-fade-in flex-1">
                  <div className="flex items-center justify-between">
                     <div>
                        <h3 className="text-2xl font-bold text-gray-900 uppercase  tracking-tighter">Validation Hub</h3>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 ">Scan results for hardware integrity</p>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => setStep(1)} className="px-6 py-4 text-gray-400 font-bold uppercase  text-[10px]  hover:text-gray-900 transition-colors">Abort Matrix</button>
                        <button 
                          onClick={handleUpload}
                          disabled={loading}
                          className="px-6 py-4 bg-emerald-600 text-white rounded-xl font-bold uppercase  text-xs shadow-2xl shadow-emerald-500/30 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-4 disabled:opacity-50"
                        >
                           {loading ? 'Sychronizing...' : <><CheckCircle2 className="w-5 h-5" /> Deploy Items</>}
                        </button>
                     </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-1 shadow-inner relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <Package className="w-48 h-48 text-gray-900 rotate-12" />
                    </div>
                    <div className="overflow-x-auto max-h-[500px] custom-scrollbar relative z-10">
                       <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-gray-100 z-10 border-b border-white shadow-sm">
                             <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase ">Descriptor Unit</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase ">Logic Class</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase ">Serial Code</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase  text-right">Verification</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-white/40">
                             {data.map((row, index) => (
                                <tr key={index} className="hover:bg-white/50 transition-colors group">
                                   <td className="px-6 py-4">
                                      <div className="text-gray-900 font-bold uppercase text-xs tracking-tight group-hover:text-emerald-600 transition-colors">{row.itemName}</div>
                                      <div className="text-[10px] text-gray-400 font-bold  mt-1  opacity-60">Vendor: {row.vendor || 'Direct'}</div>
                                   </td>
                                   <td className="px-6 py-4">
                                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase   border ${row.isValid ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-red-50 text-red-600 border-red-100 opacity-50'}`}>
                                         {row.categoryName}
                                      </span>
                                   </td>
                                   <td className="px-6 py-4">
                                      <div className="text-gray-400  text-[10px] font-bold tracking-[0.2em] uppercase">{row.serialNo || 'NO-REF-SER'}</div>
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      {row.isValid ? <CheckCircle2 className="w-6 h-6 text-emerald-500 ml-auto" /> : <AlertCircle className="w-6 h-6 text-red-500 ml-auto" />}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-6 rounded-xl border border-slate-50">
                     <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><Info className="w-5 h-5" /></div>
                     <p className="text-[10px] font-bold uppercase  text-gray-400">Total Valid Items: <span className="text-indigo-600 text-lg ml-2">{data.filter(d => d.isValid).length} / {data.length}</span></p>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="text-center py-20 animate-fade-in flex flex-col items-center flex-1">
                  <div className="w-40 h-40 bg-emerald-50 border-4 border-emerald-100 rounded-xl flex items-center justify-center mb-10 shadow-inner relative group cursor-pointer hover:rotate-12 transition-transform">
                     <CheckCircle2 className="w-20 h-20 text-emerald-500 group-hover:scale-125 transition-transform" />
                  </div>
                  <h3 className="text-5xl font-bold text-gray-900 uppercase  tracking-tighter mb-4 leading-none decoration-emerald-500/20 underline decoration-8 underline-offset-8">Integration Successful</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mb-12 ">Matrix deployment concluded at {new Date().toLocaleTimeString()}</p>
                  
                  <div className="flex gap-8">
                     <button onClick={() => setStep(1)} className="px-6 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase  text-xs shadow-2xl hover:bg-slate-800 transition-all">Restart Matrix Upload</button>
                     <button className="px-6 py-4 bg-white border border-gray-100 text-gray-400 rounded-xl font-bold uppercase  text-xs hover:text-gray-900 hover:border-slate-300 transition-all flex items-center gap-3 ">
                        View Itemized History <ArrowRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>

      {/* Info Boxes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            { icon: Package, title: 'Category Sync', desc: 'Ensure categories in your sheet contain valid logic codes from the "Categories" Hub.', color: 'var(--primary)' },
            { icon: Hash, title: 'ID Generation', desc: 'Leaving Item ID empty triggers the automatic hashing sequence built in Settings.', color: '#3b82f6' },
            { icon: Trash2, title: 'Error Cleanup', desc: 'Invalid rows are automatically quarantined and skipped during the upload protocol.', color: '#ef4444' }
          ].map((inf, i) => (
            <div key={i} className="glass-card" style={{ padding: "24px" }}>
               <div style={{ width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", background: `${inf.color}15`, color: inf.color }}>
                  <inf.icon size={24} />
               </div>
               <h4 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>{inf.title}</h4>
               <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.6" }}>{inf.desc}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssetBulkUpload;
