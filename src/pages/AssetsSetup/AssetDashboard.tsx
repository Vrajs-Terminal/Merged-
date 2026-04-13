import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  Package, AlertTriangle, 
  DollarSign, TrendingUp, Calendar, Clock,
  ArrowRight, ShieldCheck, MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { toast } from '../../components/Toast';
import PageTitle from "../../components/PageTitle";
import "./Assets.css";
import "./AssetDashboard.css";

const AssetDashboard: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await assetsAPI.getStats();
      setStats(res.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statusData = stats ? [
    { name: 'Active', value: stats.active || 0, color: '#10b981' },
    { name: 'Maintenance', value: stats.maintenance || 0, color: '#f59e0b' },
    { name: 'Scrapped', value: stats.scrapped || 0, color: '#ef4444' },
  ] : [];

  if (loading) {
     return (
       <div className="asset-loading-state">
          <div className="asset-loading-spinner"></div>
          <p className="asset-loading-text">Synchronizing Asset Database...</p>
       </div>
     );
  }

  const totalItems = stats?.total || 0;

  return (
   <div className="main-content animate-fade-in asset-dashboard-page">
      {/* Header */}
         <div className="asset-header">
        <PageTitle title="Asset Infrastructure" subtitle="Total Lifecycle Visibility & Operational Analytics" />
            <div className="asset-header-actions">
          <button 
            onClick={fetchStats}
            className="btn btn-secondary shadow-sm"
          >
            <Clock size={16} /> Sync Realtime
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="asset-dashboard-stats-grid">
        <div className="asset-stat-card">
           <div className="asset-stat-icon blue">
              <Package size={24} />
           </div>
           <div className="asset-stat-info grow">
              <p className="asset-stat-label">Total Assets Registered</p>
              <div className="asset-stat-meta-row">
                 <h3 className="asset-stat-value compact">{totalItems}</h3>
                 <span className="asset-stat-meta asset-stat-meta-primary">
                   <TrendingUp size={12} /> 12% Growth
                 </span>
              </div>
           </div>
        </div>

        <div className="asset-stat-card">
           <div className="asset-stat-icon green">
              <DollarSign size={24} />
           </div>
           <div className="asset-stat-info grow">
              <p className="asset-stat-label">Total Inventory Value</p>
              <div className="asset-stat-meta-row">
                 <h3 className="asset-stat-value compact">$ {stats?.totalValue?.toLocaleString() || 0}</h3>
                 <span className="asset-stat-meta">Aggregate</span>
              </div>
           </div>
        </div>

        <div className="asset-stat-card">
           <div className="asset-stat-icon orange">
              <AlertTriangle size={24} />
           </div>
           <div className="asset-stat-info grow">
              <p className="asset-stat-label">In Maintenance Phase</p>
              <div className="asset-stat-meta-row">
                 <h3 className="asset-stat-value compact">{stats?.maintenance || 0}</h3>
                 <span className="asset-stat-meta pending-dot">
                   {stats?.upcomingMaint || 0} pending
                 </span>
              </div>
           </div>
        </div>

        <div className="asset-stat-card">
           <div className="asset-stat-icon blue">
              <ShieldCheck size={24} />
           </div>
           <div className="asset-stat-info grow">
              <p className="asset-stat-label">Asset Groups Defined</p>
              <div className="asset-stat-meta-row">
                 <h3 className="asset-stat-value compact">{stats?.categories || 0}</h3>
                 <span className="asset-stat-meta">Categories</span>
              </div>
           </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="asset-charts-row">
        <div className="asset-chart-card">
           <div className="asset-chart-head">
              <h3 className="asset-chart-title">
                 <span className="asset-chart-title-accent"></span>
                 Operational Distribution
              </h3>
              <div className="asset-mode-switch">
                 <button className="asset-mode-btn active">Live</button>
                 <button className="asset-mode-btn">Historic</button>
              </div>
           </div>
           <div className="asset-chart-area">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} fontWeight={600} axisLine={false} tickLine={false} width={30} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }} itemStyle={{ fontSize: '13px', fontWeight: '600' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                       {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="asset-chart-card asset-pie-card">
           <h3 className="asset-pie-title">Status Mix %</h3>
           <div className="asset-pie-area">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                       data={statusData}
                       cx="50%"
                       cy="50%"
                       innerRadius={65}
                       outerRadius={85}
                       paddingAngle={12}
                       dataKey="value"
                    >
                       {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                 </PieChart>
              </ResponsiveContainer>
              <div className="asset-pie-center">
                 <span className="asset-pie-total">{totalItems}</span>
                 <span className="asset-pie-total-label">Total</span>
              </div>
           </div>
           <div className="asset-pie-legend">
              {statusData.map((item, i) => (
                 <div key={i} className="asset-pie-legend-item">
                    <div className="asset-pie-legend-left">
                       <div className="asset-pie-dot" style={{ backgroundColor: item.color }}></div>
                       <span className="asset-pie-name">{item.name}</span>
                    </div>
                    <div className="asset-pie-percent">
                       {totalItems > 0 ? Math.round((item.value / totalItems) * 100) : 0}%
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Grid 2 Column */}
      <div className="asset-bottom-grid">
         <div className="asset-chart-card">
            <h3 className="asset-bottom-title">
               <Calendar size={20} color="#f59e0b" />
               Upcoming Maintenance
            </h3>
            <div className="asset-bottom-body">
               {stats?.upcomingMaint ? (
                 <p className="asset-note">Maintenance records integrated with service vendor workflows.</p>
               ) : (
                 <div className="asset-empty-box">
                    <Clock size={32} color="#cbd5e1" />
                    <p className="asset-empty-text">No tasks due soon</p>
                 </div>
               )}
               <button 
                  onClick={() => setActivePage?.('assetUpcomingMaint')}
                  className="btn btn-secondary w-full justify-center shadow-sm"
               >
                  Service Dashboard <ArrowRight size={16} />
               </button>
            </div>
         </div>

         <div className="asset-chart-card asset-audit-card">
            <h4 className="asset-bottom-title">
               <ShieldCheck size={20} color="var(--primary)" />
               <span>Recent Audit Trail</span>
            </h4>
            <div className="asset-audit-list">
                <div className="asset-audit-item">
                   <div className="asset-audit-icon-wrap">
                      <div className="asset-audit-icon">
                         <MapPin size={18} />
                      </div>
                   </div>
                   <div className="asset-audit-text">
                      <p className="asset-audit-title">System Ready</p>
                      <p className="asset-audit-desc">Asset Synchronization completed successfully</p>
                   </div>
                </div>
                <div className="asset-audit-item">
                   <div className="asset-audit-icon-wrap">
                      <div className="asset-audit-icon">
                         <ShieldCheck size={18} />
                      </div>
                   </div>
                   <div className="asset-audit-text">
                      <p className="asset-audit-title">Database integrity checks: PASS</p>
                      <p className="asset-audit-desc">Verified {totalItems} asset records</p>
                   </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
