import { useState, useEffect, useCallback } from 'react';
import { Trophy, Download, Filter, X, Loader2, TrendingUp, Star, Medal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import './pms.css';

interface SummaryRow {
  userId: number; employeeName: string; pmsAssignId: number;
  pmsType: string; pmsDate: string; totalScore: number;
  dimensionCount: number; completedCount: number; completionPct: number;
  rating: string; grade: string; remark: string; rank: number;
}
interface Leader { userId: number; name: string; avgScore: number; rank: number; medal: string; }
interface PmsAssign { id: number; pms_type: string; pms_date: string; }

const RATING_COLOR: Record<string, { bg: string; text: string }> = {
  Outstanding: { bg: '#fef3c7', text: '#92400e' }, Excellent: { bg: '#dcfce7', text: '#166534' },
  Good: { bg: '#eff6ff', text: '#1e40af' }, Average: { bg: '#faf5ff', text: '#6b21a8' }, Poor: { bg: '#fef2f2', text: '#991b1b' }, Unrated: { bg: '#f1f5f9', text: '#64748b' }
};
const GRADE_COLOR: Record<string, string> = { 'A+': 'pms-grade-a-plus', A: 'pms-grade-a', B: 'pms-grade-b', C: 'pms-grade-c', D: 'pms-grade-d' };

export default function PerformanceSummary() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [assigns, setAssigns] = useState<PmsAssign[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'leaderboard'>('summary');
  const [page, setPage] = useState(1);
  const perPage = 25;

  const [filters, setFilters] = useState({ pms_assign_id: '', pms_type: '', start_date: '', end_date: '' });

  const fetchAssigns = useCallback(async () => {
    try { const r = await api.get('/pms/assign'); setAssigns(r.data); } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchAssigns(); }, [fetchAssigns]);

  const getData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.pms_assign_id) params.pms_assign_id = filters.pms_assign_id;
      if (filters.pms_type) params.pms_type = filters.pms_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const [sRes, lRes] = await Promise.all([
        api.get('/pms/summary', { params }),
        api.get('/pms/summary/leaderboard', { params: { ...params, top: 10 } })
      ]);
      setSummary(sRes.data); setLeaders(lRes.data); setSearched(true); setPage(1);
    } catch { toast.error('Failed to fetch summary'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (!summary.length) return toast.error('No data to export');
    const headers = ['Rank', 'Employee', 'PMS Type', 'Date', 'Total Score', 'Rating', 'Grade', 'Completion %', 'Remark'];
    const rows = summary.map(r => [r.rank, r.employeeName, r.pmsType, new Date(r.pmsDate).toLocaleDateString(), r.totalScore, r.rating, r.grade, `${r.completionPct}%`, r.remark]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `performance_summary_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast.success('Exported!');
  };

  const paged = summary.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(summary.length / perPage);

  return (
    <div className="pms-layout">
      <div className="pms-container">
        <div className="pms-header">
          <div className="pms-header-left">
            <div className="pms-header-icon"><Trophy size={22} /></div>
            <div><h2>Performance Summary</h2><p>Aggregated scores, rankings & top performer leaderboard</p></div>
          </div>
          <div className="pms-header-actions">
            {summary.length > 0 && <button className="pms-btn pms-btn-green" onClick={exportCSV}><Download size={15} /> Export CSV</button>}
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
          <button className="pms-btn pms-btn-primary" onClick={getData} disabled={loading}>
            {loading ? <Loader2 size={15} className="pms-spin" /> : <Filter size={15} />} Get Data
          </button>
          <button className="pms-btn pms-btn-ghost" onClick={() => { setFilters({ pms_assign_id: '', pms_type: '', start_date: '', end_date: '' }); setSummary([]); setLeaders([]); setSearched(false); }}><X size={14} /> Clear</button>
        </div>

        {searched && (
          <>
            <div className="pms-stats-grid">
              {[
                { label: 'Employees Evaluated', val: summary.length, cls: 'blue' },
                { label: 'Top Score', val: summary[0]?.totalScore?.toFixed(1) || '0', cls: 'green' },
                { label: 'Avg Score', val: summary.length ? (summary.reduce((s, r) => s + r.totalScore, 0) / summary.length).toFixed(1) : '0', cls: 'amber' },
                { label: 'Excellent/Outstanding', val: summary.filter(r => ['Excellent', 'Outstanding'].includes(r.rating)).length, cls: 'purple' },
              ].map(s => (
                <div className="pms-stat-card" key={s.label}>
                  <div className={`pms-stat-icon ${s.cls}`}><TrendingUp size={20} /></div>
                  <div><p className="pms-stat-label">{s.label}</p><p className="pms-stat-value">{s.val}</p></div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: 4, borderRadius: 10, width: 'fit-content' }}>
              {(['summary', 'leaderboard'] as const).map(t => (
                <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '8px 18px', borderRadius: 7, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: '0.2s', background: activeTab === t ? 'white' : 'transparent', color: activeTab === t ? '#3b82f6' : '#64748b', boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
                  {t === 'summary' ? <><TrendingUp size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Summary Table</> : <><Trophy size={13} style={{ verticalAlign: -2, marginRight: 5 }} />Leaderboard</>}
                </button>
              ))}
            </div>

            {activeTab === 'summary' && (
              <>
                <div className="pms-table-wrap">
                  <table className="pms-table">
                    <thead>
                      <tr><th>Rank</th><th>Employee</th><th>PMS Type</th><th>Date</th><th>Total Score</th><th>Rating</th><th>Grade</th><th>Completion</th><th>Remark</th></tr>
                    </thead>
                    <tbody>
                      {paged.length === 0 ? <tr><td colSpan={9} className="pms-empty">No evaluation data available.</td></tr>
                        : paged.map(r => {
                          const { bg, text } = RATING_COLOR[r.rating] || RATING_COLOR.Unrated;
                          const rankCls = r.rank === 1 ? 'pms-rank-1' : r.rank === 2 ? 'pms-rank-2' : r.rank === 3 ? 'pms-rank-3' : 'pms-rank-n';
                          return (
                            <tr key={`${r.userId}_${r.pmsAssignId}`}>
                              <td><div className={`pms-rank ${rankCls}`}>{r.rank}</div></td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {r.remark && <Star size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                                  <div className="pms-name">{r.employeeName}</div>
                                </div>
                              </td>
                              <td><span style={{ background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.pmsType}</span></td>
                              <td style={{ fontSize: 13, color: '#64748b' }}>{new Date(r.pmsDate).toLocaleDateString()}</td>
                              <td>
                                <div className="pms-progress-wrap">
                                  <div className="pms-progress-bar" style={{ maxWidth: 70 }}>
                                    <div className={`pms-progress-fill ${r.totalScore >= 80 ? 'green' : r.totalScore >= 50 ? 'amber' : 'red'}`} style={{ width: `${Math.min(r.totalScore, 100)}%` }} />
                                  </div>
                                  <span className="pms-score">{r.totalScore}</span>
                                </div>
                              </td>
                              <td><span style={{ background: bg, color: text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{r.rating}</span></td>
                              <td><span className={`pms-grade-badge ${GRADE_COLOR[r.grade] || 'pms-grade-d'}`}>{r.grade}</span></td>
                              <td>
                                <div className="pms-progress-wrap">
                                  <div className="pms-progress-bar"><div className={`pms-progress-fill ${r.completionPct >= 80 ? 'green' : 'amber'}`} style={{ width: `${r.completionPct}%` }} /></div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{r.completionPct}%</span>
                                </div>
                              </td>
                              <td style={{ fontSize: 12, color: r.remark ? '#f59e0b' : '#94a3b8' }}>{r.remark || '—'}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <div className="pms-pagination">
                  <span className="pms-pag-info">Showing {Math.min((page - 1) * perPage + 1, summary.length)}–{Math.min(page * perPage, summary.length)} of {summary.length}</span>
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

            {activeTab === 'leaderboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'linear-gradient(135deg, #eff6ff, white)', borderRadius: 12, border: '1px solid #bfdbfe' }}>
                  <Medal size={20} style={{ color: '#3b82f6' }} />
                  <span style={{ fontWeight: 700, color: '#1e293b' }}>Top {leaders.length} Performers</span>
                  <span style={{ fontSize: 12, color: '#64748b', marginLeft: 4 }}>Ranked by average weighted score</span>
                </div>
                {leaders.length === 0 ? <div className="pms-empty">No leaderboard data available.</div>
                  : leaders.map(l => (
                    <div key={l.userId} className={`pms-leader-card ${l.rank === 1 ? 'top-1' : l.rank === 2 ? 'top-2' : l.rank === 3 ? 'top-3' : ''}`}>
                      <span className="pms-leader-medal">{l.medal}</span>
                      <div style={{ flex: 1 }}>
                        <div className="pms-leader-rank">Rank #{l.rank}</div>
                        <div className="pms-leader-name">{l.name}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="pms-leader-score">{l.avgScore}</div>
                        <div className="pms-leader-grade">Avg Score</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {!searched && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <Trophy size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: '#64748b', margin: '0 0 6px' }}>Apply filters and click Get Data</p>
            <p style={{ fontSize: 13 }}>Performance summary and 🏆 Leaderboard will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
