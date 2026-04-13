import { useState, useEffect } from 'react';
import { Plus, X, Save, Calculator, HelpCircle, Activity } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import './tax-slabs.css';

interface Slab {
    id?: number;
    from_amount: number;
    to_amount: number | null;
    tax_percentage: number;
    status: string;
}

const TaxSlabs = () => {
    const [financialYear, setFinancialYear] = useState('2025-26');
    const [taxRegime, setTaxRegime] = useState('New');
    const [slabType, setSlabType] = useState('Individual');
    
    const [slabs, setSlabs] = useState<Slab[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Live Calculator State
    const [calcSalary, setCalcSalary] = useState<number>(1200000);

    useEffect(() => {
        fetchSlabs();
    }, [financialYear, taxRegime, slabType]);

    const fetchSlabs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/payroll/tax-slabs', {
                params: { financial_year: financialYear, tax_regime: taxRegime, slab_type: slabType }
            });
            if (res.data.length > 0) {
                setSlabs(res.data);
            } else {
                setSlabs([]);
            }
        } catch (error) {
            toast.error("Failed to load tax slabs.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlab = () => {
        const newSlabs = [...slabs];
        if (newSlabs.length > 0) {
            const lastSlab = newSlabs[newSlabs.length - 1];
            // By default, assume standard progression of +3L or +2.5L
            const increment = taxRegime === 'New' ? 300000 : 250000;
            if (lastSlab.to_amount === null) {
                // Cannot add after 'Above'
                toast.error("Remove the 'Above' slab before adding a new one.");
                return;
            }
            newSlabs.push({
                from_amount: lastSlab.to_amount + 1,
                to_amount: null,
                tax_percentage: lastSlab.tax_percentage + 5,
                status: 'Active'
            });
        } else {
            newSlabs.push({
                from_amount: 0,
                to_amount: null,
                tax_percentage: 0,
                status: 'Active'
            });
        }
        setSlabs(newSlabs);
    };

    const handleUpdateSlab = (index: number, field: keyof Slab, value: any) => {
        const newSlabs = [...slabs];
        newSlabs[index] = { ...newSlabs[index], [field]: value };
        
        // Auto-fix cascading overlaps
        if (field === 'to_amount' && value !== null && index < newSlabs.length - 1) {
            newSlabs[index + 1].from_amount = value + 1;
        }
        setSlabs(newSlabs);
    };

    const handleRemoveSlab = (index: number) => {
        const newSlabs = slabs.filter((_, i) => i !== index);
        // If we removed the last slab, ensure the new last slab is 'Above' (to_amount = null)
        if (newSlabs.length > 0 && index === slabs.length - 1) {
            newSlabs[newSlabs.length - 1].to_amount = null;
        }
        setSlabs(newSlabs);
    };

    const saveSlabs = async () => {
        if (slabs.length === 0) return toast.error("Please add at least one slab.");
        
        // Validation check
        let valid = true;
        for (let i = 0; i < slabs.length; i++) {
            const s = slabs[i];
            if (i < slabs.length - 1 && s.to_amount === null) {
                toast.error(`Slab ${i+1} cannot be "Above" if it's not the last slab.`);
                valid = false; break;
            }
            if (s.to_amount !== null && s.to_amount <= s.from_amount) {
                toast.error(`Slab ${i+1} To Amount must be greater than From Amount.`);
                valid = false; break;
            }
            if (i > 0 && s.from_amount !== (slabs[i-1].to_amount! + 1)) {
                toast.error(`Slab ${i+1} must start exactly 1 rupee after Slab ${i}.`);
                valid = false; break;
            }
        }
        if (!valid) return;

        try {
            await api.post('/payroll/tax-slabs/bulk', {
                financial_year: financialYear,
                tax_regime: taxRegime,
                slab_type: slabType,
                slabs
            });
            toast.success("Tax slabs saved securely.");
            fetchSlabs(); // Reload to get IDs and DB locked states
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to save slabs.");
        }
    };

    // Live Tax Calculation Engine based on dynamic slabs
    const calculateLiveTax = () => {
        if (!calcSalary || isNaN(calcSalary) || slabs.length === 0) return 0;
        let tax = 0;
        for (const slab of slabs) {
            if (calcSalary > slab.from_amount) {
                const taxableInThisSlab = slab.to_amount 
                    ? Math.min(calcSalary, slab.to_amount) - slab.from_amount
                    : calcSalary - slab.from_amount;
                
                tax += (taxableInThisSlab * slab.tax_percentage) / 100;
            }
        }
        return Math.round(tax);
    };

    return (
        <div className="tax-slabs-layout">
            <div className="tax-slabs-container">
                <div className="ts-header">
                    <div>
                        <h2>Income Tax Slabs Builder</h2>
                        <p>Configure dynamic tax percentage brackets logically and securely for payroll processing.</p>
                    </div>
                </div>

                <div className="ts-filter-card">
                    <div className="ts-filter-group">
                        <label>Financial Year *</label>
                        <select className="ts-select" value={financialYear} onChange={e => setFinancialYear(e.target.value)}>
                            <option value="2025-26">2025–26</option>
                            <option value="2024-25">2024–25</option>
                        </select>
                    </div>
                    <div className="ts-filter-group">
                        <label>Tax Regime *</label>
                        <select className="ts-select" value={taxRegime} onChange={e => setTaxRegime(e.target.value)}>
                            <option value="New">New Regime</option>
                            <option value="Old">Old Regime</option>
                        </select>
                    </div>
                    <div className="ts-filter-group">
                        <label>Slab Subject Type *</label>
                        <select className="ts-select" value={slabType} onChange={e => setSlabType(e.target.value)}>
                            <option value="Individual">Individual (Below 60 yrs)</option>
                            <option value="Senior Citizen">Senior Citizen (60-80 yrs)</option>
                            <option value="Company">Company Entity</option>
                        </select>
                    </div>
                    <button className="btn-secondary" onClick={fetchSlabs}><Activity size={16} /> Load</button>
                </div>

                <div className="ts-grid-layout">
                    {/* Slab Builder */}
                    <div className="ts-slab-builder">
                        <div className="ts-slab-builder-header">
                            <h3 style={{ margin: 0, fontSize: 16 }}>Tax Slabs Configuration</h3>
                            <button className="btn-primary" onClick={saveSlabs} disabled={loading}><Save size={16}/> Save Slabs</button>
                        </div>

                        {loading ? (
                            <p style={{ color: '#64748b' }}>Loading slabs...</p>
                        ) : slabs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, border: '1px dashed #cbd5e1', borderRadius: 12 }}>
                                <p style={{ color: '#64748b' }}>No slabs configured for this combination.</p>
                                <button className="btn-primary" style={{ margin: '16px auto 0' }} onClick={handleAddSlab}><Plus size={16}/> Create First Slab</button>
                            </div>
                        ) : (
                            <div className="ts-slab-list">
                                {slabs.map((slab, idx) => (
                                    <div key={idx} className="ts-slab-row">
                                        <div className="ts-slab-col" style={{ flex: 1 }}>
                                            <label>From (₹)</label>
                                            <input 
                                                type="number" 
                                                className="ts-input" 
                                                value={slab.from_amount} 
                                                onChange={e => handleUpdateSlab(idx, 'from_amount', Number(e.target.value))}
                                                disabled={idx > 0} // Driven by previous 'to' amount
                                            />
                                        </div>
                                        <div className="ts-slab-col" style={{ flex: 1 }}>
                                            <label>To (₹)</label>
                                            {slab.to_amount === null ? (
                                                <input type="text" className="ts-input" value="Above" disabled style={{ background: '#f1f5f9', fontWeight: 600 }}/>
                                            ) : (
                                                <input 
                                                    type="number" 
                                                    className="ts-input" 
                                                    value={slab.to_amount || ''} 
                                                    onChange={e => handleUpdateSlab(idx, 'to_amount', Number(e.target.value) || null)}
                                                />
                                            )}
                                        </div>
                                        <div className="ts-slab-col" style={{ width: '100px' }}>
                                            <label>Tax (%)</label>
                                            <div style={{ position: 'relative' }}>
                                                <input 
                                                    type="number" 
                                                    className="ts-input" 
                                                    style={{ paddingRight: 24 }}
                                                    value={slab.tax_percentage} 
                                                    onChange={e => handleUpdateSlab(idx, 'tax_percentage', Number(e.target.value))}
                                                />
                                                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 600 }}>%</span>
                                            </div>
                                        </div>
                                        <button 
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: 16 }}
                                            onClick={() => handleRemoveSlab(idx)}
                                        ><X size={20}/></button>
                                    </div>
                                ))}

                                {slabs.length > 0 && slabs[slabs.length - 1].to_amount !== null && (
                                    <button className="btn-add-slab" onClick={handleAddSlab}><Plus size={16}/> Add Next Level Slab</button>
                                )}
                                {slabs.length > 0 && slabs[slabs.length - 1].to_amount !== null && (
                                    <button className="btn-add-slab" style={{ marginTop: 8, borderColor: '#16a34a', color: '#16a34a' }} onClick={() => handleUpdateSlab(slabs.length - 1, 'to_amount', null)}>
                                        <Plus size={16}/> Lock Final Slab as "Above"
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Live Calculator */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div className="ts-calculator-card">
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calculator size={18} color="#3b82f6"/> Live Tax Preview
                            </h3>
                            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Test how exactly these structured slabs will perform computationally.</p>
                            
                            <label style={{ fontSize: 13, fontWeight: 500, color: '#475569' }}>Simulated Yearly Income (₹)</label>
                            <input 
                                type="number" 
                                className="ts-input" 
                                style={{ marginTop: 8 }}
                                value={calcSalary}
                                onChange={e => setCalcSalary(Number(e.target.value))}
                            />

                            <div className="ts-calc-result">
                                <p>Estimated Tax Liability ({taxRegime} Regime)</p>
                                <h3>₹{calculateLiveTax().toLocaleString()}</h3>
                                <div style={{ marginTop: 12, padding: 8, background: 'rgba(59,130,246,0.1)', borderRadius: 6, fontSize: 12, color: '#1e40af' }}>
                                    <strong>Note:</strong> This amount excludes Education Cess (4%) and 87A Rebate logic (applied later in processing).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxSlabs;
