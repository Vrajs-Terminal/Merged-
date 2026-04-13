import { useState, useEffect, useCallback } from 'react';
import { BarChart2, Filter, Download, X, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface EvalRow {
  id: number; self_score: number; manager_score: number; final_score: number;
  weightage: number; weighted_score: number; remark?: string;
  evaluator_type: string; rating: string; grade: string;
  user: { id: number; name: string };
  dimension: { id: number; name: string; code: string };
  pmsAssign: { id: number; pms_type: string; pms_date: string };
}
interface PmsAssign { id: number; pms_type: string; pms_date: string; }
const RATING_COLOR: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: '#fef3c7', text: '#92400e' }, Excellent: { bg: '#dcfce7', text: '#166534' },
  Good: { bg: '#eff6ff', text: '#1e40af' }, Average: { bg: '#faf5ff', text: '#6b21a8' }, Poor: { bg: '#fef2f2', text: '#991b1b' }, Unrated: { bg: '#f1f5f9', text: '#64748b' }
};
const GRADE_COLOR: Record<string, string> = { 'A+': 'pms-grade-a-plus', A: 'pms-grade-a', B: 'pms-grade-b', C: 'pms-grade-c', D: 'pms-grade-d' };

export default function PMSPerformanceReport() {
  const [rows, setRows] = useState<EvalRow[]>([]);
  const [assigns, setAssigns] = useState<PmsAssign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 50;

  const [filters, setFilters] = useState({ pms_assign_id: '', pms_type: '', start_date: '', end_date: '' });

  const fetchAssigns = useCallback(async () => {
    try { const r = await api.get('/pms/assign'); setAssigns(r.data); } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchAssigns(); }, [fetchAssigns]);

  const getReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.pms_assign_id) params.pms_assign_id = filters.pms_assign_id;
      if (filters.pms_type) params.pms_type = filters.pms_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const r = await api.get('/pms/evaluations/report', { params });
      setRows(r.data); setSearched(true); setPage(1);
    } catch { toast.error('Failed to fetch report'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!filtered.length) return toast.error('No data to export');
    const headers = ['Employee', 'PMS Type', 'Date', 'Dimension', 'Self Score', 'Manager Score', 'Final Score', 'Weightage', 'Weighted Score', 'Rating', 'Grade', 'Remark'];
    const csvRows = filtered.map(r => [
      r.user.name, r.pmsAssign.pms_type, new Date(r.pmsAssign.pms_date).toLocaleDateString(),
      r.dimension.name, r.self_score, r.manager_score, r.final_score, r.weightage, r.weighted_score.toFixed(2),
      r.rating, r.grade, r.remark || ''
    ]);
    const csvContent = [headers, ...csvRows].map(row => row.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv' }));
    a.download = `pms_report_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('CSV exported!');
  };

  const filtered = rows.filter(r => !search || r.user.name.toLowerCase().includes(search.toLowerCase()) || r.dimension.name.toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const totalScore = rows.reduce((s, r) => s + r.final_score, 0);
  const avgScore = rows.length ? (totalScore / rows.length).toFixed(1) : '0';
  const presentCount = rows.filter(r => r.final_score > 0).length;

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><BarChart2 size={22} /></div>
            <div><h2>PMS Performance Report</h2><p>View employee performance with weighted dimension scores</p></div>
          </div>
          <div className="pms-header-actions">
            {rows.length > 0 && <button className="pms-btn pms-btn-green" onClick={exportCSV}><Download size={15} /> Export CSV</button>}
          </div>
        </div>

        <div className="pms-filters">
          <div className="pms-field"><label>Assignment</label>
            <select className="pms-select" value={filters.pms_assign_id} onChange={e => setFilters(p => ({ ...p, pms_assign_id: e.target.value }))}>
              <option value="">All Assignments</option>
              {assigns.map(a => <option key={a.id} value={a.id}>{a.pms_type} — {new Date(a.pms_date).toLocaleDateString()}</option>)}
            </select>
          </div>
          <div className="pms-field"><label>PMS Type</label>
            <select className="pms-select" value={filters.pms_type} onChange={e => setFilters(p => ({ ...p, pms_type: e.target.value }))}>
              <option value="">All</option>{['Weekly', 'Monthly', 'Quarterly', 'Annual'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="pms-field"><label>From Date</label><input className="pms-input pms-select" type="date" value={filters.start_date} onChange={e => setFilters(p => ({ ...p, start_date: e.target.value }))} /></div>
          <div className="pms-field"><label>To Date</label><input className="pms-input pms-select" type="date" value={filters.end_date} onChange={e => setFilters(p => ({ ...p, end_date: e.target.value }))} /></div>
          <button className="pms-btn pms-btn-primary" onClick={getReport} disabled={loading}>{loading ? <Loader2 size={15} className="pms-spin" /> : <Filter size={15} />} Get Report</button>
          <button className="pms-btn pms-btn-ghost" onClick={() => { setFilters({ pms_assign_id: '', pms_type: '', start_date: '', end_date: '' }); setRows([]); setSearched(false); }}><X size={14} /> Clear</button>
        </div>

        {searched && (
          <>
            <div className="pms-stats-grid">
              {[
                { label: 'Total Records', val: rows.length, cls: 'blue' },
                { label: 'Avg Final Score', val: avgScore, cls: 'green' },
                { label: 'Scored Entries', val: presentCount, cls: 'purple' },
                { label: 'Unique Employees', val: new Set(rows.map(r => r.user.id)).size, cls: 'amber' },
              ].map(s => (
                <div className="pms-stat-card" key={s.label}>
                  <div className={`pms-stat-icon ${s.cls}`}><BarChart2 size={20} /></div>
                  <div><p className="pms-stat-label">{s.label}</p><p className="pms-stat-value">{s.val}</p></div>
                </div>
              ))}
            </div>

            <div className="pms-controls">
              <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length} rows</span>
              <div className="pms-search-wrap" style={{ maxWidth: 280 }}>
                <Search size={15} className="pms-search-icon" />
                <input className="pms-input" placeholder="Filter by employee or dimension..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                {search && <button className="pms-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
              </div>
            </div>

            <div className="pms-table-wrap">
              <table className="pms-table">
                <thead>
                  <tr><th>#</th><th>Employee</th><th>PMS Type</th><th>Date</th><th>Dimension</th><th>Self</th><th>Manager</th><th>Final</th><th>Weightage</th><th>Weighted Score</th><th>Rating</th><th>Remark</th></tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? <tr><td colSpan={12} className="pms-empty">No records match the filter.</td></tr>
                    : paged.map((r, i) => {
                      const { bg, text } = RATING_COLOR[r.rating] || RATING_COLOR.Unrated;
                      const scoreWidth = Math.min((r.final_score / 100) * 100, 100);
                      return (
                        <tr key={r.id}>
                          <td className="pms-td-sr">{(page - 1) * perPage + i + 1}</td>
                          <td><div className="pms-name">{r.user.name}</div></td>
                          <td><span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.pmsAssign.pms_type}</span></td>
                          <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(r.pmsAssign.pms_date).toLocaleDateString()}</td>
                          <td><div style={{ fontWeight: 600, fontSize: 13 }}>{r.dimension.name}</div><div style={{ fontSize: 11, color: '#94a3b8' }}>{r.dimension.code}</div></td>
                          <td style={{ color: '#64748b', fontWeight: 600 }}>{r.self_score > 0 ? r.self_score : '—'}</td>
                          <td style={{ color: '#64748b', fontWeight: 600 }}>{r.manager_score > 0 ? r.manager_score : '—'}</td>
                          <td>
                            <div className="pms-progress-wrap">
                              <div className="pms-progress-bar"><div className={`pms-progress-fill ${r.final_score >= 80 ? 'green' : r.final_score >= 50 ? 'amber' : 'red'}`} style={{ width: `${scoreWidth}%` }} /></div>
                              <span className="pms-score">{r.final_score}</span>
                            </div>
                          </td>
                          <td style={{ color: '#64748b', fontSize: 13 }}>{r.weightage}%</td>
                          <td><span className="pms-score" style={{ color: '#3b82f6' }}>{r.weighted_score.toFixed(2)}</span></td>
                          <td><span style={{ background: bg, color: text, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.rating}</span></td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{r.remark || '—'}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="pms-pagination">
              <span className="pms-pag-info">Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
              <div className="pms-pag-btns">
                <button className="pms-pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`pms-pag-btn ${p === page ? 'pms-pag-btn-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="pms-pag-btn" disabled={page >= totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <BarChart2 size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>Apply filters and click Get Report</p>
            <p style={{ fontSize: 13 }}>Performance data will appear here with scores, weightages, and ratings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
