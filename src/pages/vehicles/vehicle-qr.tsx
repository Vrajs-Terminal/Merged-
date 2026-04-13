import { useState, useEffect, useCallback } from 'react';
import { QrCode as QrIcon, Printer, Download, Search, Loader2, Filter, X, Building2, User as UserIcon, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import './vehicles.css';

interface Vehicle {
  id: number;
  vehicle_name: string;
  vehicle_number: string;
  employee_id: number;
  employee_name: string;
  category: string;
  branch: string;
  status: string;
  qrPayload: string;
}

export default function VehicleQR() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    branch_id: '',
    user_id: ''
  });

  const [qrDataUrls, setQrDataUrls] = useState<Record<number, string>>({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12; // Grid view, smaller per page

  const fetchDropdowns = useCallback(async () => {
    try {
      const [bRes, uRes] = await Promise.all([
        api.get('/api/branches'),
        api.get('/api/users?status=Active')
      ]);
      setBranches(bRes.data);
      setUsers(uRes.data);
    } catch (error) {}
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  const generateQRCodes = async (list: Vehicle[]) => {
    const urls: Record<number, string> = {};
    for (const v of list) {
      try {
        const url = await QRCode.toDataURL(v.qrPayload, {
          width: 256,
          margin: 2,
          color: { dark: '#0f172a', light: '#ffffff' }
        });
        urls[v.id] = url;
      } catch (err) {
        console.error('QR Gen Error', err);
      }
    }
    setQrDataUrls(urls);
  };

  const getVehicles = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.branch_id) params.branch_id = filters.branch_id;
      if (filters.user_id) params.user_id = filters.user_id;

      const res = await api.get('/vehicles/reports/qr-bulk', { params });
      setVehicles(res.data);
      await generateQRCodes(res.data);
      setSearched(true);
      setPage(1);
    } catch (error) {
      toast.error('Failed to fetch vehicles for QR');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (v: Vehicle) => {
    const dataUrl = qrDataUrls[v.id];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${v.vehicle_number}_${v.employee_name}.png`;
    a.click();
    toast.success('QR Downloaded');
  };

  const printQR = (v: Vehicle) => {
    const dataUrl = qrDataUrls[v.id];
    if (!dataUrl) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <div style="text-align:center;font-family:sans-serif;padding:40px;">
        <h2>MineHR Vehicle Identification</h2>
        <img src="${dataUrl}" style="width:300px;" />
        <h3>${v.vehicle_name} (${v.vehicle_number})</h3>
        <p>Assigned to: ${v.employee_name}</p>
        <p>Branch: ${v.branch}</p>
        <hr />
        <p style="font-size:12px;color:#666;">Scannned code contains Vehicle ID and Employee ID for verification.</p>
      </div>
      <script>window.onload = () => { window.print(); window.close(); }</script>
    `);
  };

  const filtered = vehicles.filter(v => 
    v.vehicle_name.toLowerCase().includes(search.toLowerCase()) || 
    v.vehicle_number.toLowerCase().includes(search.toLowerCase()) ||
    v.employee_name.toLowerCase().includes(search.toLowerCase())
  );
  
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="ev-layout">
      <div className="ev-container">
        {/* Header */}
        <div className="ev-header">
          <div className="ev-header-left">
            <div className="ev-header-icon"><QrIcon size={22} /></div>
            <div>
              <h2>QR for Vehicle</h2>
              <p>Quick identification & tracking cards for the employee vehicle fleet</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ev-filters">
          <div className="ev-field">
            <label>Branch</label>
            <select className="ev-select" value={filters.branch_id} onChange={e => setFilters({...filters, branch_id: e.target.value})}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="ev-field">
            <label>Employee</label>
            <select className="ev-select" value={filters.user_id} onChange={e => setFilters({...filters, user_id: e.target.value})}>
              <option value="">All Employees</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <button className="ev-btn ev-btn-primary" onClick={getVehicles} disabled={loading}>
            {loading ? <Loader2 size={16} className="ev-spin" /> : <QrIcon size={16} />} Generate Codes
          </button>
          <button className="ev-btn ev-btn-ghost" onClick={() => { setFilters({branch_id:'',user_id:''}); setSearched(false); setVehicles([]); }}>
            <X size={15} /> Clear
          </button>
        </div>

        {searched ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
                {filtered.length} Vehicles listed
              </span>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                <input 
                  className="ev-input ev-input-sm" 
                  style={{ paddingLeft: 32, height: '34px' }} 
                  placeholder="Search in list..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {paged.length === 0 ? (
                <div style={{ gridColumn: '1/-1' }} className="ev-empty">No vehicles found.</div>
              ) : (
                paged.map(v => (
                  <div key={v.id} className="ev-qr-card">
                    <div className="ev-qr-wrap">
                      {qrDataUrls[v.id] ? (
                        <img src={qrDataUrls[v.id]} alt="QR" style={{ width: 140, height: 140 }} />
                      ) : (
                        <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Loader2 size={32} className="ev-spin" color="#cbd5e1" />
                        </div>
                      )}
                    </div>
                    <div className="ev-qr-info">
                      <div className="ev-qr-name">{v.vehicle_name}</div>
                      <div className="ev-qr-sub">{v.vehicle_number}</div>
                      
                      <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '4px' }}>
                          <UserIcon size={14} color="#64748b" />
                          <span style={{ fontSize: '13px', fontWeight: 600 }}>{v.employee_name}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Building2 size={14} color="#64748b" />
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{v.branch}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="ev-btn ev-btn-sm ev-btn-secondary" onClick={() => downloadQR(v)}>
                          <Download size={13} /> Download
                        </button>
                        <button className="ev-btn ev-btn-sm ev-btn-secondary" onClick={() => printQR(v)}>
                          <Printer size={13} /> Print
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {filtered.length > perPage && (
              <div className="ev-pagination" style={{ marginTop: '24px', borderRadius: '16px' }}>
                <span className="ev-pag-info">Page {page} of {totalPages}</span>
                <div className="ev-pag-btns">
                  <button className="ev-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                  <button className="ev-pag-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px', border: '1px dashed #e2e8f0' }}>
            <QrIcon size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#64748b', fontSize: '18px', fontWeight: 600 }}>Fleet Identification System</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', margin: '8px auto 24px' }}>
              Select branch or employee and click "Generate Codes" to create identification QR cards for field verification.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
