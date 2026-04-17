import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Plus, Edit2, Trash2, Settings, 
  CheckCircle2, XCircle,
  ArrowRight, RefreshCw, AlertTriangle,
  ShieldCheck, Package
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

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
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
          <h1 className="asset-page-title"><Package size={24} /> Asset Categories</h1>
          <p className="asset-page-subtitle">Define classification rules and automated identification logic</p>
        </div>
        <div className="asset-header-actions">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="asset-btn secondary"
          >
            <Settings size={16} /> ID Settings
          </button>
          <button 
            onClick={() => { setEditingCategory(null); setFormData({ name: '', code: '', imageRequired: false, serialRequired: true }); setShowModal(true); }}
            className="asset-btn primary"
          >
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      <div className="asset-preview-card">
            <div className="asset-preview-left">
              <span className="asset-kpi-icon primary">
                <RefreshCw size={20} />
              </span>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Auto ID Generation Preview</h3>
                <p className="asset-page-subtitle">Pattern: {idSettings.prefix} + {idSettings.includeCategoryCode ? '[CAT_CODE]' : ''} + [SERIAL]</p>
              </div>
            </div>
            <div className="asset-preview-token">{idPreview()}</div>
      </div>

      <div className="asset-kpi-grid">
        <div className="asset-kpi-card">
           <div className="asset-kpi-icon info">
              <ShieldCheck size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Total Categories</p>
              <h3 className="asset-kpi-value">{categories.length}</h3>
           </div>
        </div>

        <div className="asset-kpi-card">
           <div className="asset-kpi-icon danger" style={{ background: 'var(--color-warning-50)', color: 'var(--color-warning-600)' }}>
              <Package size={20} />
           </div>
           <div>
              <p className="asset-kpi-label">Total Quantified Inventory</p>
              <h3 className="asset-kpi-value">
                {categories.reduce((acc, cat) => acc + (cat._count?.assets || 0), 0)}
              </h3>
           </div>
        </div>
      </div>

      <div className="asset-manage-table-card">
        <div className="asset-table-wrap">
          <table className="asset-ops-table">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Short Code</th>
                <th>Mandatories</th>
                <th>Quantities</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="asset-skeleton-row">
                    <td colSpan={5}>
                       <div className="asset-skeleton"></div>
                    </td>
                  </tr>
                ))
              ) : categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="asset-cell-stack">
                      <span className="asset-cell-main">{cat.name}</span>
                      <span className="asset-cell-sub">Group Reference ID: #{cat.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="asset-pill">
                      {cat.code}
                    </span>
                  </td>
                  <td>
                    <div className="asset-custodian">
                       <span className={cat.imageRequired ? 'bulk-valid' : 'bulk-invalid'}>
                         {cat.imageRequired ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Media
                       </span>
                       <span className={cat.serialRequired ? 'bulk-valid' : 'bulk-invalid'}>
                         {cat.serialRequired ? <CheckCircle2 size={12} /> : <XCircle size={12} />} Serial
                       </span>
                    </div>
                  </td>
                  <td>
                     <div className="asset-cell-stack">
                       <span className="asset-cell-main">{cat._count?.assets || 0}</span>
                       <span className="asset-cell-sub">Total Units</span>
                     </div>
                  </td>
                  <td>
                    <div className="asset-custodian">
                      <button onClick={() => handleEdit(cat)} className="asset-icon-action" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => toggleHide(cat)} className="asset-icon-action" title="Visibility"><ArrowRight size={14} className={cat.isHidden ? 'rotate-180' : ''} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="asset-icon-action danger" title="Delete"><Trash2 size={14} /></button>
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
        <div className="asset-modal-overlay">
           <div className="asset-modal">
             <div className="asset-modal-head">
                <h2>ID Logic Configuration</h2>
                <button onClick={() => setShowSettingsModal(false)} className="scrap-modal-close"><XCircle size={18} /></button>
             </div>

             <form onSubmit={handleSettingsSubmit} className="asset-modal-body">
                <div className="asset-register-section">
                  <div className="asset-switch-row">
                    <div>
                      <h4 style={{ marginBottom: 2 }}>Automated ID Assignment</h4>
                      <p className="asset-cell-sub">When enabled, system will bypass manual entry.</p>
                    </div>
                    <button type="button" className={`asset-switch ${idSettings.enableAutoGenerate ? 'enabled' : ''}`} onClick={() => setIdSettings({...idSettings, enableAutoGenerate: !idSettings.enableAutoGenerate})}>
                      <span className="asset-switch-thumb" />
                    </button>
                  </div>

                  <div className="asset-form-grid" style={{ marginTop: 12 }}>
                    <div className="asset-form-field">
                      <label>Primary Prefix</label>
                      <input required type="text" placeholder="e.g. MINE, AST" value={idSettings.prefix} onChange={(e) => setIdSettings({...idSettings, prefix: e.target.value.toUpperCase()})} className="input-modern" />
                    </div>
                    <div className="asset-form-field">
                      <label>Serial Increment</label>
                      <select value={idSettings.serialType} onChange={(e) => setIdSettings({...idSettings, serialType: e.target.value})} className="select-modern">
                        <option value="Auto">Auto-Increment (001, 002...)</option>
                        <option value="Manual">Unstructured / Manual</option>
                      </select>
                    </div>
                  </div>
                </div>

                <label className="asset-check-row">
                  <input type="checkbox" checked={idSettings.includeCategoryCode} onChange={(e) => setIdSettings({...idSettings, includeCategoryCode: e.target.checked})} />
                  <div>
                    <strong>Include Category Code Segment</strong>
                    <span>Example Result: {idSettings.prefix} + COMPUTER + 001</span>
                  </div>
                </label>

                <label className="asset-check-row danger">
                  <input type="checkbox" checked={idSettings.updateExisting} onChange={(e) => setIdSettings({...idSettings, updateExisting: e.target.checked})} />
                  <div>
                    <strong><AlertTriangle size={14} /> Global ID Recalculation</strong>
                    <span>Warning: This will re-alias all existing assets in the system.</span>
                  </div>
                </label>

                <div className="asset-form-actions">
                   <button type="button" onClick={() => setShowSettingsModal(false)} className="asset-btn secondary">Cancel Override</button>
                   <button type="submit" className="asset-btn primary">Apply Global Logic</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="asset-modal-overlay">
          <div className="asset-modal sm">
            <div className="asset-modal-head">
              <h2>{editingCategory ? 'Update Group' : 'Group Registration'}</h2>
              <button onClick={() => setShowModal(false)} className="scrap-modal-close"><XCircle size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="asset-modal-body">
              <div className="asset-form-field">
                <label>Categorical Name*</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-modern" placeholder="e.g. Workstations, Mobile" />
              </div>

              <div className="asset-form-field">
                <label>Identification Token (Code)*</label>
                <input required type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="input-modern" placeholder="e.g. COMP, MOB" />
              </div>

              <div className="asset-form-grid">
                <label className="asset-check-tile">
                  <input type="checkbox" checked={formData.imageRequired} onChange={(e) => setFormData({ ...formData, imageRequired: e.target.checked })} />
                  <span>Image Mandate</span>
                </label>
                <label className="asset-check-tile">
                  <input type="checkbox" checked={formData.serialRequired} onChange={(e) => setFormData({ ...formData, serialRequired: e.target.checked })} />
                  <span>Track Serial</span>
                </label>
              </div>

              <div className="asset-form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="asset-btn secondary">Discard</button>
                <button type="submit" className="asset-btn primary">{editingCategory ? 'Commit' : 'Execute'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCategory;
