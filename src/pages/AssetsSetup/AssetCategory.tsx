import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Plus, Edit2, Trash2, Settings, 
  CheckCircle2, XCircle,
  ArrowRight, RefreshCw, AlertTriangle,
  ShieldCheck, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';

const AssetCategory: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idSettings, setIdSettings] = useState<any>({
    enableAutoGenerate: true,
    prefix: 'AST',
    includeCategoryCode: true,
    serialType: 'Auto',
    updateExisting: false
  });
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    imageRequired: false,
    serialRequired: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, settingsRes] = await Promise.all([
        assetsAPI.getCategories(),
        assetsAPI.getIDSettings()
      ]);
      setCategories(catsRes.data);
      if (settingsRes.data) setIdSettings(settingsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await assetsAPI.updateCategory(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await assetsAPI.createCategory(formData);
        toast.success('Category created');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', code: '', imageRequired: false, serialRequired: true });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assetsAPI.updateIDSettings(idSettings);
      toast.success('Settings updated successfully');
      setShowSettingsModal(false);
      fetchData();
    } catch (error: any) {
      toast.error('Failed to update settings');
    }
  };

  const handleEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code,
      imageRequired: cat.imageRequired,
      serialRequired: cat.serialRequired,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? Items might be affected.')) return;
    try {
      await assetsAPI.deleteCategory(id);
      toast.success('Category deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const toggleHide = async (cat: any) => {
    try {
      await assetsAPI.updateCategory(cat.id, { isHidden: !cat.isHidden });
      fetchData();
    } catch (error) {
      toast.error('Toggle failed');
    }
  };

  const idPreview = () => {
    const prefix = idSettings.prefix || 'AST';
    const catCode = idSettings.includeCategoryCode ? 'CAT' : '';
    const serial = idSettings.serialType === 'Auto' ? '001' : 'XXX';
    return `${prefix}${catCode}${serial}`;
  };

  return (
    <div className="main-content animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><Package size={22} /> Asset Categories</h1>
          <p className="page-subtitle">Define classification rules and automated identification logic</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-secondary shadow-sm"
          >
            <Settings size={18} /> ID Settings
          </button>
          <button 
            onClick={() => { setEditingCategory(null); setFormData({ name: '', code: '', imageRequired: false, serialRequired: true }); setShowModal(true); }}
            className="btn btn-primary shadow-glow"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      {/* Logic Preview Card */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ background: "rgba(79, 70, 229, 0.08)", padding: "16px", borderRadius: "16px" }}>
                <RefreshCw className="w-8 h-8 text-(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>Auto ID Generation Preview</h3>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "500" }}>Pattern: {idSettings.prefix} + {idSettings.includeCategoryCode ? '[CAT_CODE]' : ''} + [SERIAL]</p>
              </div>
            </div>
            <div style={{ padding: "12px 24px", background: "var(--color-bg-secondary)", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
               <span style={{ fontSize: "24px", fontWeight: "800", color: "var(--primary)", letterSpacing: "2px" }}>{idPreview()}</span>
            </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(14, 165, 233, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <ShieldCheck size={24} color="#0ea5e9" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Total Categories</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>{categories.length}</h3>
           </div>
        </div>

        <div className="glass-card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
           <div style={{ background: "rgba(234, 179, 8, 0.08)", padding: "12px", borderRadius: "12px" }}>
              <Package size={24} color="#eab308" />
           </div>
           <div>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>Total Quantified Inventory</p>
              <h3 style={{ fontSize: "24px", fontWeight: "700" }}>
                {categories.reduce((acc, cat) => acc + (cat._count?.assets || 0), 0)}
              </h3>
           </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card" style={{ overflowX: "auto" }}>
        <div>
          <table className="table-modern">
            <thead>
              <tr>
                <th>Classification</th>
                <th style={{ textAlign: "center" }}>Short Code</th>
                <th style={{ textAlign: "center" }}>Mandatories</th>
                <th style={{ textAlign: "center" }}>Quantities</th>
                <th style={{ textAlign: "right" }}>Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-24 border-b border-slate-50">
                    <td colSpan={5} className="px-6 py-4">
                       <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <span style={{ fontWeight: "700", fontSize: "15px" }}>{cat.name}</span>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>Group Reference ID: #{cat.id}</p>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span className="badge" style={{ background: "var(--primary-light)", color: "var(--primary)", padding: "6px 12px", borderRadius: "8px", fontWeight: "700" }}>
                      {cat.code}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Media</span>
                          {cat.imageRequired ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-300" />}
                       </div>
                       <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Serial</span>
                          {cat.serialRequired ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-300" />}
                       </div>
                    </div>
                  </td>
                  <td style={{ textAlign: "center" }}>
                     <div style={{ fontSize: "18px", fontWeight: "800" }}>{cat._count?.assets || 0}</div>
                     <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Total Units</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <button onClick={() => handleEdit(cat)} className="btn btn-secondary" style={{ padding: "8px" }} title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => toggleHide(cat)} className="btn btn-secondary" style={{ padding: "8px" }} title="Visibility"><ArrowRight size={14} className={cat.isHidden ? 'rotate-180' : ''} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="btn btn-danger" style={{ padding: "8px" }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ID Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900  flex items-center gap-3">
                     <Settings className="w-8 h-8 text-blue-600" />
                     ID Logic Configuration
                   </h2>
                   <p className="text-gray-500 font-medium  mt-1 uppercase text-[10px] ">Global Identification Rules for Asset Infrastructure</p>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-gray-400" /></button>
             </div>
             
             <form onSubmit={handleSettingsSubmit} className="p-10">
                <div className="mb-6 p-4 border border-gray-100 rounded-xl bg-gray-50">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-gray-900 font-bold text-lg uppercase tracking-tight  line-through decoration-indigo-500/50 decoration-4">Automated ID Assignment</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase  mt-1 ">When enabled, system will bypass manual entry</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={idSettings.enableAutoGenerate}
                          onChange={(e) => setIdSettings({...idSettings, enableAutoGenerate: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Prefix</label>
                        <input 
                          required
                          type="text"
                          placeholder="e.g. MINE, AST"
                          value={idSettings.prefix}
                          onChange={(e) => setIdSettings({...idSettings, prefix: e.target.value.toUpperCase()})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Serial Increment</label>
                        <select 
                          value={idSettings.serialType}
                          onChange={(e) => setIdSettings({...idSettings, serialType: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        >
                          <option value="Auto">Auto-Increment (001, 002...)</option>
                          <option value="Manual">Unstructured / Manual</option>
                        </select>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <label className="flex items-center gap-4 p-6 bg-gray-50 border border-gray-100 rounded-xl cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all group">
                     <input 
                       type="checkbox" 
                       checked={idSettings.includeCategoryCode}
                       onChange={(e) => setIdSettings({...idSettings, includeCategoryCode: e.target.checked})}
                       className="w-6 h-6 border-slate-300 rounded accent-indigo-600"
                     />
                     <div>
                       <span className="block text-sm font-bold text-gray-900  ">Include Category Code Segment</span>
                       <span className="block text-[10px] text-gray-400 font-bold uppercase  mt-1">Example Result: {idSettings.prefix} + COMPUTER + 001</span>
                     </div>
                   </label>

                   <label className="flex items-center gap-4 p-6 bg-red-50/50 border border-red-100 rounded-xl cursor-pointer hover:border-red-200 transition-all border-dashed">
                     <input 
                       type="checkbox" 
                       checked={idSettings.updateExisting}
                       onChange={(e) => setIdSettings({...idSettings, updateExisting: e.target.checked})}
                       className="w-6 h-6 rounded accent-red-600"
                     />
                     <div>
                       <span className="text-sm font-bold text-red-600 flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4" /> Global ID Recalculation
                       </span>
                       <span className="block text-[10px] text-red-400 font-bold uppercase  mt-1 ">Warning: This will re-alias all existing assets in the system</span>
                     </div>
                   </label>
                </div>

                <div className="pt-10 mt-10 border-t border-gray-100 flex gap-4">
                   <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 py-4 text-gray-500 font-bold uppercase text-xs  hover:text-gray-900 hover:translate-x-[-4px] transition-all">Cancel Override</button>
                   <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md">Apply Global Logic</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gray-50 border-b border-gray-100 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
                 <Plus className="w-24 h-24 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900   mb-1">
                {editingCategory ? 'Update Group' : 'Group Registration'}
              </h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase  ">Asset Classification & Segment Rules</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categorical Name*</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="e.g. Workstations, Mobile, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identification Token (Code)*</label>
                <input
                  required
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="e.g. COMP, MOB"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all hover:bg-white group">
                  <span className="text-[9px] uppercase font-bold text-gray-400 group-hover:text-indigo-600">Image Mandate</span>
                  <input
                    type="checkbox"
                    checked={formData.imageRequired}
                    onChange={(e) => setFormData({ ...formData, imageRequired: e.target.checked })}
                    className="w-10 h-10 accent-indigo-600 rounded-lg cursor-pointer"
                  />
                </label>
                <label className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all hover:bg-white group">
                  <span className="text-[9px] uppercase font-bold text-gray-400 group-hover:text-indigo-600">Track Serial</span>
                  <input
                    type="checkbox"
                    checked={formData.serialRequired}
                    onChange={(e) => setFormData({ ...formData, serialRequired: e.target.checked })}
                    className="w-10 h-10 accent-indigo-600 rounded-lg cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 text-gray-400 font-bold uppercase  text-xs hover:text-gray-900 transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md"
                >
                  {editingCategory ? 'Commit' : 'Execute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCategory;
