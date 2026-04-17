import React, { useState, useRef, useEffect } from 'react';
import { assetsAPI } from '../../services/apiService';
import { 
  CheckCircle2, AlertCircle, 
   Plus, Download, Package,
  Trash2, Layers, Hash, Info
} from 'lucide-react';
import { toast } from '../../components/Toast';
import './AssetReportsScrap.css';

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
    <div className="main-content animate-fade-in asset-insights-page">
      <div className="asset-page-header">
        <div>
           <h1 className="asset-page-title"><Package size={24} /> Batch Asset Registry</h1>
           <p className="asset-page-subtitle">High-volume record synchronization</p>
        </div>
        <button 
          onClick={downloadSample}
          className="asset-btn secondary"
        >
          <Download size={16} /> Download Template
        </button>
      </div>

      <div className="asset-bulk-card">
         <div className="bulk-stepper">
            {[1, 2, 3].map((s) => (
               <div key={s} className={`bulk-step-item ${step === s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                  <span className="bulk-step-badge">{step > s ? <CheckCircle2 size={14} /> : s}</span>
                  <span>{s === 1 ? 'Source Upload' : s === 2 ? 'Validation Matrix' : 'Closure Sync'}</span>
               </div>
            ))}
         </div>

         <div className="bulk-stage">
            {step === 1 && (
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="bulk-dropzone"
               >
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" style={{ display: 'none' }} />
                  <div className="bulk-upload-icon">
                    <Plus size={30} />
                  </div>
                  <h3>Drop CSV Protocol File</h3>
                  <p>Matrix validation will proceed upon selection.</p>
                  
                  <div className="bulk-meta">
                     <div className="bulk-meta-item">
                        <Layers size={16} /> 500+ Items per sync
                     </div>
                     <div className="bulk-meta-item">
                        <AlertCircle size={16} /> Validates Auto-ID rules
                     </div>
                  </div>
               </div>
            )}

            {step === 2 && (
               <div>
                  <div className="bulk-validate-head">
                     <div>
                        <h3>Validation Hub</h3>
                        <p>Review parsed items before deployment.</p>
                     </div>
                     <div className="bulk-action-row">
                        <button onClick={() => setStep(1)} className="asset-btn secondary">Abort Matrix</button>
                        <button 
                          onClick={handleUpload}
                          disabled={loading}
                          className="asset-btn primary"
                        >
                           {loading ? 'Synchronizing...' : <><CheckCircle2 size={16} /> Deploy Items</>}
                        </button>
                     </div>
                  </div>

                  <div className="bulk-table-wrap">
                    <div className="asset-table-wrap">
                       <table className="asset-ops-table">
                          <thead>
                             <tr>
                                <th>Descriptor Unit</th>
                                <th>Logic Class</th>
                                <th>Serial Code</th>
                                <th>Verification</th>
                             </tr>
                          </thead>
                          <tbody>
                             {data.map((row, index) => (
                                <tr key={index}>
                                   <td>
                                      <div className="asset-cell-stack">
                                        <span className="asset-cell-main">{row.itemName || 'Unknown Item'}</span>
                                        <span className="asset-cell-sub">Vendor: {row.vendor || 'Direct'}</span>
                                      </div>
                                   </td>
                                   <td>
                                      <span className={row.isValid ? 'bulk-valid' : 'bulk-invalid'}>
                                         {row.categoryName}
                                      </span>
                                   </td>
                                   <td>
                                      <span className="asset-cell-sub">{row.serialNo || 'NO-REF-SER'}</span>
                                   </td>
                                   <td>
                                      {row.isValid ? <span className="bulk-valid">Valid</span> : <span className="bulk-invalid">Invalid</span>}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  </div>
                  <div className="bulk-validity-bar">
                     <Info size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                     Total Valid Items: <strong>{data.filter(d => d.isValid).length} / {data.length}</strong>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="bulk-success-state">
                  <div className="bulk-success-icon">
                     <CheckCircle2 size={46} />
                  </div>
                  <h3 style={{ marginTop: 12 }}>Integration Successful</h3>
                  <p>Matrix deployment concluded at {new Date().toLocaleTimeString()}.</p>
                  
                  <div className="bulk-success-actions">
                     <button onClick={() => setStep(1)} className="asset-btn primary">Restart Matrix Upload</button>
                     <button className="asset-btn secondary">
                        View Itemized History
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>

      <div className="asset-note-grid">
          {[
            { icon: Package, title: 'Category Sync', desc: 'Ensure categories in your sheet contain valid logic codes from the "Categories" Hub.', color: 'var(--primary)' },
            { icon: Hash, title: 'ID Generation', desc: 'Leaving Item ID empty triggers the automatic hashing sequence built in Settings.', color: '#3b82f6' },
            { icon: Trash2, title: 'Error Cleanup', desc: 'Invalid rows are automatically quarantined and skipped during the upload protocol.', color: '#ef4444' }
          ].map((inf, i) => (
            <div key={i} className="asset-note-card">
               <div className="asset-note-icon" style={{ color: inf.color }}>
                  <inf.icon size={24} />
               </div>
               <div>
                 <h4>{inf.title}</h4>
                 <p>{inf.desc}</p>
               </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AssetBulkUpload;
