import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  History, Clock, User, ArrowRight, Package, 
  TrendingDown, TrendingUp, Info,
  Cpu
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

const AssetHistory: React.FC = () => {
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoadingAssets(true);
      const res = await assetsAPI.getAssets();
      setAssets(res.data);
    } catch (error) {
      toast.error('Failed to load asset index');
    } finally {
      setLoadingAssets(false);
    }
  };

  const loadHistory = async (asset: any) => {
    try {
      setLoading(true);
      setSelectedAsset(asset);
      const res = await assetsAPI.getHistory(asset.id);
      setHistory(res.data);
    } catch (error) {
      toast.error('Failed to load lifecycle record');
    } finally {
      setLoading(false);
    }
  };

   const getActionClass = (action: string) => {
    switch (action) {
         case 'Created': return 'asset-action-created';
         case 'Assigned': return 'asset-action-assigned';
         case 'Transferred': return 'asset-action-transferred';
         case 'Maintenance': return 'asset-action-maintenance';
         case 'Scrapped': return 'asset-action-scrapped';
         case 'Returned': return 'asset-action-returned';
         default: return 'asset-action-default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created': return <TrendingUp size={14} />;
      case 'Transferred': return <ArrowRight size={14} />;
      case 'Scrapped': return <TrendingDown size={14} />;
      case 'Maintenance': return <Cpu size={14} />;
      case 'Assigned': return <User size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
           <h1 className="asset-page-title"><Package size={24} /> Asset Lifecycle Audit</h1>
           <p className="asset-page-subtitle">Immutable infrastructure tracking</p>
        </div>
        <div className="asset-header-actions">
           <button onClick={loadAssets} className="asset-btn secondary">
              <History size={16} /> Refresh Index
           </button>
        </div>
      </div>

      <div className="asset-history-grid">
        <div className="asset-history-index">
              <div className="asset-history-index-head">
                 <h3>Registry Index</h3>
                 <span className="asset-pill">{assets.length} Units</span>
              </div>
              
              <div className="asset-history-list">
                {loadingAssets ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="asset-skeleton-row"><div className="asset-skeleton"></div></div>
                  ))
                ) : assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => loadHistory(asset)}
                    className={`asset-history-item ${selectedAsset?.id === asset.id ? 'active' : ''}`}
                  >
                    <span className="asset-avatar"><Package size={16} /></span>
                    <div className="asset-cell-stack">
                       <span className="asset-cell-main">{asset.itemName}</span>
                       <span className="asset-cell-sub">{asset.assetCode || 'NO-REF'}</span>
                    </div>
                  </button>
                ))}
              </div>
        </div>

        <div className="asset-history-main">
           {!selectedAsset ? (
              <div className="asset-history-empty">
                <div className="asset-empty-state compact">
                  <Cpu size={40} />
                  <h4>Awaiting Asset Selection</h4>
                  <p>Choose a unit from the registry to view its complete lifecycle trail.</p>
                </div>
              </div>
           ) : (
              <div>
                 <div className="asset-history-summary">
                    <div className="asset-timeline-row">
                       <div>
                          <h2>{selectedAsset.itemName}</h2>
                          <div className="asset-history-meta">
                             <span className="asset-pill">{selectedAsset.assetCode}</span>
                             <span className="asset-cell-sub"><Clock size={12} /> Tracking Since Acquisition</span>
                          </div>
                       </div>
                       <div>
                          <span className="asset-status active">{selectedAsset.status || 'Active'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="asset-timeline">
                    {loading ? (
                       Array.from({ length: 3 }).map((_, i) => (
                         <div key={i} className="asset-skeleton-row"><div className="asset-skeleton"></div></div>
                       ))
                    ) : history.length === 0 ? (
                       <div className="asset-empty-state compact">
                          <Info size={30} />
                          <h4>No lifecycle data found</h4>
                          <p>No lifecycle events available for this asset.</p>
                       </div>
                    ) : history.map((event, index) => (
                       <div key={event.id || index} className="asset-timeline-event">
                             <div className="asset-timeline-row">
                                <div className="asset-custodian">
                                   <span className={`asset-action-badge ${getActionClass(event.action)}`}>
                                      {getActionIcon(event.action)} {event.action || 'Event'}
                                   </span>
                                   <span className="asset-cell-sub">
                                      <Clock size={12} /> {new Date(event.createdAt).toLocaleString()}
                                   </span>
                                </div>
                                <div className="asset-custodian">
                                   <div className="asset-cell-stack">
                                      <span className="asset-cell-sub">Authorized By</span>
                                      <span className="asset-cell-main">{event.doneBy || 'System'}</span>
                                   </div>
                                   <span className="asset-avatar"><User size={14} /></span>
                                </div>
                             </div>

                             <div className="asset-action-flow">
                                <div className="asset-cell-stack">
                                   <span className="asset-cell-sub">Origin</span>
                                   <span className="asset-cell-main">{event.fromInfo || 'Inventory Stock'}</span>
                                </div>
                                <ArrowRight size={16} color="var(--color-border-strong)" />
                                <div className="asset-cell-stack">
                                   <span className="asset-cell-sub">Target</span>
                                   <span className="asset-cell-main">{event.toInfo || 'Active Stock'}</span>
                                </div>
                             </div>

                             {event.remark && (
                                <div style={{ marginTop: 10 }}>
                                   <span className="asset-cell-sub">Remark: {event.remark}</span>
                                </div>
                             )}
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AssetHistory;
