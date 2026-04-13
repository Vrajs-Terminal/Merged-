import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Check, Loader2, Car, Users, Search, ChevronLeft, ChevronRight, Filter, AlertCircle, Camera, Calendar, Building2, MapPin, Activity } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './vehicles.css';

interface Vehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_value: number;
  image_url_1: string | null;
  image_url_2: string | null;
  image_url_3: string | null;
  status: string;
  assigned_date: string;
  userId: number;
  categoryId: number;
  branchId: number | null;
  departmentId: number | null;
  user: { id: number; name: string };
  category: { id: number; name: string };
  branch?: { id: number; name: string };
  department?: { id: number; name: string };
  createdAt: string;
}

interface User { id: number; name: string; department_id?: number }
interface Branch { id: number; name: string }
interface Department { id: number; name: string; branch_id?: number }
interface Category { id: number; name: string; status: string }

const EMPTY_FORM = {
  user_id: '',
  category_id: '',
  branch_id: '',
  department_id: '',
  vehicle_name: '',
  vehicle_number: '',
  vehicle_value: '',
  image_url_1: '',
  image_url_2: '',
  image_url_3: '',
  status: 'Active',
  assigned_date: new Date().toISOString().split('T')[0]
};

export default function AddVehicle() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
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
      const [vRes, uRes, bRes, cRes] = await Promise.all([
        api.get('/vehicles'),
        api.get('/api/users?status=Active'),
        api.get('/api/branches'),
        api.get('/vehicles/categories')
      ]);
      setVehicles(vRes.data);
      setUsers(uRes.data);
      setBranches(bRes.data);
      setCategories(cRes.data.filter((c: any) => c.status === 'Active'));
    } catch (error) {
      toast.error('Failed to load vehicle data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchDepartments = useCallback(async (branchId: string) => {
    if (!branchId) {
      setDepartments([]);
      return;
    }
    try {
      const res = await api.get(`/api/departments?branch_id=${branchId}`);
      setDepartments(res.data);
    } catch (error) {
      /* Silent error for now */
    }
  }, []);

  const openAdd = () => {
    setEditItem({ ...EMPTY_FORM });
    setEditMode(false);
    setDrawerOpen(true);
  };

  const openEdit = async (v: Vehicle) => {
    setEditItem({
      id: v.id,
      user_id: String(v.userId),
      category_id: String(v.categoryId),
      branch_id: String(v.branchId || ''),
      department_id: String(v.departmentId || ''),
      vehicle_name: v.vehicle_name,
      vehicle_number: v.vehicle_number,
      vehicle_value: v.vehicle_value,
      image_url_1: v.image_url_1 || '',
      image_url_2: v.image_url_2 || '',
      image_url_3: v.image_url_3 || '',
      status: v.status,
      assigned_date: v.assigned_date.split('T')[0]
    });
    if (v.branchId) await fetchDepartments(String(v.branchId));
    setEditMode(true);
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    const { user_id, category_id, vehicle_name, vehicle_number } = editItem;
    if (!user_id || !category_id || !vehicle_name || !vehicle_number) {
      return toast.error('Please fill required fields');
    }

    setSaving(true);
    try {
      const payload = {
        ...editItem,
        user_id: Number(user_id),
        category_id: Number(category_id),
        branch_id: editItem.branch_id ? Number(editItem.branch_id) : null,
        department_id: editItem.department_id ? Number(editItem.department_id) : null,
        vehicle_value: editItem.vehicle_value ? Number(editItem.vehicle_value) : 0,
        vehicle_number: vehicle_number.trim().toUpperCase()
      };

      if (editMode && editItem.id) {
        await api.put(`/vehicles/${editItem.id}`, payload);
        toast.success('Vehicle updated');
      } else {
        await api.post('/vehicles', payload);
        toast.success('Vehicle added successfully');
      }
      setDrawerOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error saving vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vehicle assignment?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success('Vehicle deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const filtered = vehicles.filter(v => 
    v.vehicle_name.toLowerCase().includes(search.toLowerCase()) || 
    v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
    v.user.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="ev-layout">
      <div className="ev-container">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-header-left">
            <div className="ev-header-icon"><Car size={22} /></div>
            <div>
              <h2>Employee Vehicles</h2>
              <p>Assign and manage corporate or personal vehicles for employees</p>
            </div>
          </div>
          <div className="ev-header-actions">
            <button className="ev-btn ev-btn-primary" onClick={openAdd}>
              <Plus size={16} /> Add Vehicle
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="ev-stats-grid">
          <div className="ev-stat-card">
            <div className="ev-stat-icon blue"><Car size={20} /></div>
            <div>
              <p className="ev-stat-label">Total Vehicles</p>
              <p className="ev-stat-value">{vehicles.length}</p>
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-icon green"><Activity size={20} /></div>
            <div>
              <p className="ev-stat-label">Active Fleet</p>
              <p className="ev-stat-value">{vehicles.filter(v => v.status === 'Active').length}</p>
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-icon amber"><Users size={20} /></div>
            <div>
              <p className="ev-stat-label">Assignments</p>
              <p className="ev-stat-value">{new Set(vehicles.map(v => v.userId)).size}</p>
            </div>
          </div>
          <div className="ev-stat-card">
            <div className="ev-stat-icon purple"><Car size={20} /></div>
            <div>
              <p className="ev-stat-label">Total Asset Value</p>
              <p className="ev-stat-value">₹{vehicles.reduce((s, v) => s + (v.vehicle_value || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ev-filters">
          <div className="ev-field">
            <label>Search Vehicle</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input 
                className="ev-input" 
                style={{ paddingLeft: 36 }}
                placeholder="Name, number or employee..." 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="ev-table-wrap">
          <table className="ev-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Sr No</th>
                <th>Employee</th>
                <th>Vehicle Info</th>
                <th>Type</th>
                <th>Branch/Dept</th>
                <th>Value</th>
                <th>Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="ev-loading">
                    <Loader2 size={24} className="ev-spin" /> Loading vehicle registry...
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ev-empty">No vehicles found.</td>
                </tr>
              ) : (
                paged.map((v, i) => (
                  <tr key={v.id}>
                    <td className="ev-td-sr">{(page - 1) * perPage + i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifySelf: 'center', color: '#3b82f6', fontWeight: 'bold', fontSize: '12px', justifyContent: 'center' }}>
                          {v.user.name.charAt(0)}
                        </div>
                        <span className="ev-name">{v.user.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="ev-name">{v.vehicle_name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{v.vehicle_number}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 500 }}>
                        {v.category.name}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {v.branch?.name || '—'} / {v.department?.name || '—'}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{(v.vehicle_value || 0).toLocaleString()}</td>
                    <td>
                      <span className={`ev-badge ${v.status === 'Active' ? 'ev-badge-active' : 'ev-badge-inactive'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td>
                      <div className="ev-actions" style={{ justifyContent: 'flex-end' }}>
                        <button className="ev-action-btn ev-action-edit" onClick={() => openEdit(v)} title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button className="ev-action-btn ev-action-delete" onClick={() => handleDelete(v.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination omitted for brevity, same as category */}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      {drawerOpen && (
        <div className="ev-overlay" onClick={() => !saving && setDrawerOpen(false)}>
          <div className="ev-drawer" onClick={e => e.stopPropagation()}>
            <div className="ev-drawer-header">
              <div className="ev-drawer-title"><Car size={18} /> {editMode ? 'Edit Vehicle' : 'Add Vehicle'}</div>
              <button className="ev-drawer-close" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
            </div>
            
            <div className="ev-drawer-body">
              <div className="ev-section-label">Assignment Info</div>
              
              <div className="ev-grid-2">
                <div className="ev-field">
                  <label>Branch</label>
                  <select 
                    className="ev-select" 
                    value={editItem.branch_id} 
                    onChange={e => { setEditItem({...editItem, branch_id: e.target.value, department_id: ''}); fetchDepartments(e.target.value); }}
                  >
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="ev-field">
                  <label>Department</label>
                  <select 
                    className="ev-select" 
                    value={editItem.department_id} 
                    onChange={e => setEditItem({...editItem, department_id: e.target.value})}
                  >
                    <option value="">Select Dept</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="ev-field" style={{ marginBottom: '20px' }}>
                <label>Employee <span className="ev-req">*</span></label>
                <select className="ev-select" style={{ width: '100%' }} value={editItem.user_id} onChange={e => setEditItem({...editItem, user_id: e.target.value})}>
                  <option value="">— Select Employee —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              <div className="ev-section-label">Vehicle Details</div>

              <div className="ev-grid-2">
                <div className="ev-field">
                  <label>Type <span className="ev-req">*</span></label>
                  <select className="ev-select" value={editItem.category_id} onChange={e => setEditItem({...editItem, category_id: e.target.value})}>
                    <option value="">Select Type</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="ev-field">
                  <label>Vehicle Name <span className="ev-req">*</span></label>
                  <input className="ev-input" placeholder="e.g. Swift Dzire, Honda Shine" value={editItem.vehicle_name} onChange={e => setEditItem({...editItem, vehicle_name: e.target.value})} />
                </div>
              </div>

              <div className="ev-grid-2">
                <div className="ev-field">
                  <label>Vehicle Number <span className="ev-req">*</span></label>
                  <input className="ev-input" placeholder="e.g. MH-12-GJ-1234" style={{ textTransform: 'uppercase' }} value={editItem.vehicle_number} onChange={e => setEditItem({...editItem, vehicle_number: e.target.value})} />
                </div>
                <div className="ev-field">
                  <label>Vehicle Value (₹)</label>
                  <input className="ev-input" type="number" placeholder="0" value={editItem.vehicle_value} onChange={e => setEditItem({...editItem, vehicle_value: e.target.value})} />
                </div>
              </div>

              <div className="ev-field" style={{ marginBottom: '20px' }}>
                <label>Assigned Date</label>
                <input className="ev-input" type="date" value={editItem.assigned_date} onChange={e => setEditItem({...editItem, assigned_date: e.target.value})} />
              </div>

              <div className="ev-section-label"><Camera size={14} /> Upload Images</div>
              <div className="ev-image-slot-grid">
                {[1, 2, 3].map(id => (
                  <div key={id} className="ev-image-slot" onClick={() => {
                    const url = prompt('Enter Image URL ' + id);
                    if (url !== null) setEditItem({...editItem, [`image_url_${id}`]: url});
                  }}>
                    {editItem[`image_url_${id}`] ? (
                      <img src={editItem[`image_url_${id}`]} referrerPolicy="no-referrer" alt="preview" className="ev-image-preview" />
                    ) : (
                      <>
                        <Camera size={20} color="#cbd5e1" />
                        <span className="ev-image-label">Img {id}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="ev-field" style={{ marginTop: '20px' }}>
                <label>Status</label>
                <div className="ev-chip-group">
                  {['Active', 'Inactive'].map(s => (
                    <button key={s} className={`ev-chip ${editItem.status === s ? 'ev-chip-active' : ''}`} onClick={() => setEditItem({...editItem, status: s})}>
                      {editItem.status === s && <Check size={14} />} {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ev-drawer-footer">
              <button className="ev-btn ev-btn-secondary" onClick={() => setDrawerOpen(false)} disabled={saving}>Cancel</button>
              <button className="ev-btn ev-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <><Loader2 size={16} className="ev-spin" /> Saving...</>
                ) : (
                  <><Check size={16} /> {editMode ? 'Update Vehicle' : 'Register Vehicle'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
