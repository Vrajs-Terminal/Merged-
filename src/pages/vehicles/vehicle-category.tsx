import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Check, Loader2, List, Activity, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vehicles.css';

interface Category {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdBy: { id: number; name: string } | null;
  _count?: { vehicles: number };
  createdAt: string;
}

const EMPTY_FORM = { name: '', description: '', status: 'Active' };

export default function VehicleCategory() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>({ ...EMPTY_FORM });
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/vehicles/categories');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load vehicle categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAdd = () => {
    setEditItem({ ...EMPTY_FORM });
    setEditMode(false);
    setDrawerOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditItem({ ...cat, description: cat.description || '' });
    setEditMode(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!editItem.name.trim()) return toast.error('Category name is required');
    setSaving(true);
    try {
      if (editMode && editItem.id) {
        await api.put(`/vehicles/categories/${editItem.id}`, editItem);
        toast.success('Category updated successfully');
      } else {
        await api.post('/vehicles/categories', editItem);
        toast.success('Category created successfully');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/vehicles/categories/${id}`);
      toast.success('Category deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      await api.patch(`/vehicles/categories/${id}/toggle`);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Toggle failed');
    }
  };

  const filtered = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );
  
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="ev-layout">
      <div className="ev-container">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-header-left">
            <div className="ev-header-icon"><List size={22} /></div>
            <div>
              <h2>Manage Vehicle Category</h2>
              <p>Define types of vehicles used by employees (Bike, Car, Van, etc.)</p>
            </div>
          </div>
          <div className="ev-header-actions">
            <button className="ev-btn ev-btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Category
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="ev-stats-grid">
          <div className="ev-stat-card">
            <div className="ev-stat-icon blue"><List size={20} /></div>
            <div>
              <p className="ev-stat-label">Total Categories</p>
              <p className="ev-stat-value">{categories.length}</p>
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-icon green"><Activity size={20} /></div>
            <div>
              <p className="ev-stat-label">Active</p>
              <p className="ev-stat-value">{categories.filter(c => c.status === 'Active').length}</p>
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-icon amber"><Filter size={20} /></div>
            <div>
              <p className="ev-stat-label">In Use</p>
              <p className="ev-stat-value">{categories.filter(c => (c._count?.vehicles || 0) > 0).length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ev-filters">
          <div className="ev-field">
            <label>Search Category</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input 
                className="ev-input" 
                style={{ paddingLeft: 36 }}
                placeholder="Name or description..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
              />
              {search && (
                <button 
                  style={{ position: 'absolute', right: 10, top: 10, border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer' }}
                  onClick={() => setSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="ev-table-wrap">
          <table className="ev-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Sr No</th>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Vehicles</th>
                <th>Created At</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="ev-loading">
                    <Loader2 size={24} className="ev-spin" /> Loading categories...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ev-empty">
                    {search ? 'No categories match your search.' : 'No categories found. Click "Add Category" to create one.'}
                  </td>
                </tr>
              ) : (
                paged.map((cat, i) => (
                  <tr key={cat.id}>
                    <td className="ev-td-sr">{(page - 1) * perPage + i + 1}</td>
                    <td><span className="ev-name">{cat.name}</span></td>
                    <td style={{ maxWidth: '300px', fontSize: '13px', color: '#64748b' }}>
                      {cat.description || <span style={{ color: '#cbd5e1' }}>No description</span>}
                    </td>
                    <td>
                      <span 
                        className={`ev-badge ${cat.status === 'Active' ? 'ev-badge-active' : 'ev-badge-inactive'}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleStatus(cat.id)}
                        title="Click to toggle status"
                      >
                        {cat.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#3b82f6' }}>{cat._count?.vehicles || 0}</span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(cat.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="ev-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="ev-action-btn ev-action-edit" onClick={() => openEdit(cat)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="ev-action-btn ev-action-delete" 
                          onClick={() => handleDelete(cat.id)} 
                          title="Delete"
                          disabled={(cat._count?.vehicles || 0) > 0}
                          style={{ opacity: (cat._count?.vehicles || 0) > 0 ? 0.3 : 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination */}
          {filtered.length > perPage && (
            <div className="ev-pagination">
              <span className="ev-pag-info">
                Showing {Math.min((page - 1) * perPage + 1, filtered.length)} to {Math.min(page * perPage, filtered.length)} of {filtered.length}
              </span>
              <div className="ev-pag-btns">
                <button className="ev-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button 
                    key={p} 
                    className={`ev-pag-btn ${page === p ? 'ev-pag-btn-active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="ev-pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="ev-overlay" onClick={() => !saving && setDrawerOpen(false)}>
          <div className="ev-drawer" onClick={e => e.stopPropagation()}>
            <div className="ev-drawer-header">
              <div className="ev-drawer-title">
                {editMode ? <Edit2 size={18} /> : <Plus size={18} />}
                {editMode ? 'Edit Category' : 'Add New Category'}
              </div>
              <button className="ev-drawer-close" onClick={() => setDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="ev-drawer-body">
              <div className="ev-section-label">Category Details</div>
              
              <div className="ev-field" style={{ marginBottom: '20px' }}>
                <label>Category Name <span className="ev-req">*</span></label>
                <input 
                  className="ev-input" 
                  style={{ width: '100%' }}
                  placeholder="e.g. Bike, Car, Truck..." 
                  value={editItem.name}
                  onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>

              <div className="ev-field" style={{ marginBottom: '20px' }}>
                <label>Description</label>
                <textarea 
                  className="ev-input ev-textarea" 
                  style={{ width: '100%' }}
                  placeholder="Additional details about this vehicle type..."
                  value={editItem.description}
                  onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                />
              </div>

              <div className="ev-field">
                <label>Initial Status</label>
                <div className="ev-chip-group">
                  {['Active', 'Inactive'].map(s => (
                    <button 
                      key={s}
                      className={`ev-chip ${editItem.status === s ? 'ev-chip-active' : ''}`}
                      onClick={() => setEditItem({ ...editItem, status: s })}
                    >
                      {editItem.status === s && <Check size={14} />} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ev-drawer-footer">
              <button className="ev-btn ev-btn-secondary" onClick={() => setDrawerOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button 
                className="ev-btn ev-btn-primary" 
                onClick={handleSave} 
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 size={16} className="ev-spin" /> Saving...</>
                ) : (
                  <><Check size={16} /> {editMode ? 'Update Category' : 'Create Category'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
