import React, { useState, useEffect } from 'react';
import { User, Building, MapPin, CreditCard, Save, Loader2, ArrowLeft } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import './vendor.css';

interface Category {
    id: number;
    name: string;
}

interface SubCategory {
    id: number;
    name: string;
    categoryId: number;
}

const AddVendor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        categoryId: '',
        subCategoryId: '',
        contactPerson: '',
        mobile: '',
        email: '',
        gstNumber: '',
        panNumber: '',
        companyName: '',
        country: 'India',
        state: '',
        city: '',
        area: '',
        pincode: '',
        fullAddress: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        paymentTerms: '',
        status: 'Active',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catRes = await api.get('/vendors/categories');
                setCategories(catRes.data.filter((c: any) => c.status === 'Active'));

                if (isEdit) {
                    const vendRes = await api.get(`/vendors/${id}`);
                    const v = vendRes.data;
                    setForm({
                        name: v.name || '',
                        categoryId: v.categoryId?.toString() || '',
                        subCategoryId: v.subCategoryId?.toString() || '',
                        contactPerson: v.contactPerson || '',
                        mobile: v.mobile || '',
                        email: v.email || '',
                        gstNumber: v.gstNumber || '',
                        panNumber: v.panNumber || '',
                        companyName: v.companyName || '',
                        country: v.country || 'India',
                        state: v.state || '',
                        city: v.city || '',
                        area: v.area || '',
                        pincode: v.pincode || '',
                        fullAddress: v.fullAddress || '',
                        bankName: v.bankName || '',
                        accountNumber: v.accountNumber || '',
                        ifscCode: v.ifscCode || '',
                        paymentTerms: v.paymentTerms?.toString() || '',
                        status: v.status || 'Active',
                    });
                }
            } catch (err) {
                toast.error('Failed to load vendor data');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    useEffect(() => {
        if (form.categoryId) {
            const fetchSubs = async () => {
                try {
                    const res = await api.get(`/vendors/sub-categories?categoryId=${form.categoryId}`);
                    setSubCategories(res.data.filter((s: any) => s.status === 'Active'));
                } catch (err) {
                    console.error('Failed to load sub-categories');
                }
            };
            fetchSubs();
        } else {
            setSubCategories([]);
        }
    }, [form.categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.categoryId || !form.mobile) {
            return toast.error('Please fill required fields (Name, Category, Mobile)');
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: Number(form.categoryId),
                subCategoryId: form.subCategoryId ? Number(form.subCategoryId) : null,
                paymentTerms: form.paymentTerms ? Number(form.paymentTerms) : null
            };

            if (isEdit) {
                await api.put(`/vendors/${id}`, payload);
                toast.success('Vendor updated successfully');
            } else {
                await api.post('/vendors', payload);
                toast.success('Vendor added successfully');
            }
            navigate('/vendor/manage');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to save vendor');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="vendor-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
                <p style={{ marginTop: '16px', color: '#64748b' }}>Loading vendor data...</p>
            </div>
        );
    }

    return (
        <div className="vendor-layout">
            <div className="vendor-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div className="vendor-header">
                    <div className="vendor-header-info">
                        <button className="action-btn" onClick={() => navigate(-1)} style={{ marginRight: '12px' }}>
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h2><User size={20} /> {isEdit ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                            <p>{isEdit ? 'Update existing vendor information.' : 'Register a new supplier or service provider in the system.'}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="vendor-form">
                    <div className="form-sections" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Basic Details */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                <User size={18} style={{ color: '#3b82f6' }} /> Basic Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Vendor Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" name="name" className="form-control" placeholder="Full name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Category <span style={{ color: '#ef4444' }}>*</span></label>
                                    <select name="categoryId" className="form-control" value={form.categoryId} onChange={handleChange} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sub Category</label>
                                    <select name="subCategoryId" className="form-control" value={form.subCategoryId} onChange={handleChange}>
                                        <option value="">Select Sub Category</option>
                                        {subCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Contact Person</label>
                                    <input type="text" name="contactPerson" className="form-control" placeholder="Contact person name" value={form.contactPerson} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input type="text" name="mobile" className="form-control" placeholder="10 digit number" value={form.mobile} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" className="form-control" placeholder="vendor@example.com" value={form.email} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        {/* Business Details */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                <Building size={18} style={{ color: '#3b82f6' }} /> Business Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label>GST Number</label>
                                    <input type="text" name="gstNumber" className="form-control" placeholder="GSTIN" value={form.gstNumber} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>PAN Number</label>
                                    <input type="text" name="panNumber" className="form-control" placeholder="Permanent Account Number" value={form.panNumber} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" name="companyName" className="form-control" placeholder="Business Name" value={form.companyName} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        {/* Address Details */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                <MapPin size={18} style={{ color: '#3b82f6' }} /> Address Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" className="form-control" placeholder="City" value={form.city} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" name="state" className="form-control" placeholder="State" value={form.state} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Pincode</label>
                                    <input type="text" name="pincode" className="form-control" placeholder="6 digit code" value={form.pincode} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label>Full Address</label>
                                    <textarea name="fullAddress" className="form-control" rows={2} placeholder="Office/Warehouse address" value={form.fullAddress} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        {/* Financial Details */}
                        <section>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#1e293b', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                <CreditCard size={18} style={{ color: '#3b82f6' }} /> Financial Details
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                <div className="form-group">
                                    <label>Bank Name</label>
                                    <input type="text" name="bankName" className="form-control" placeholder="Bank" value={form.bankName} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Account Number</label>
                                    <input type="text" name="accountNumber" className="form-control" placeholder="A/C No." value={form.accountNumber} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>IFSC Code</label>
                                    <input type="text" name="ifscCode" className="form-control" placeholder="IFSC" value={form.ifscCode} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>Payment Terms (Credit Days)</label>
                                    <input type="number" name="paymentTerms" className="form-control" placeholder="e.g. 30" value={form.paymentTerms} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                    </div>

                    <div className="modal-footer" style={{ justifyContent: 'flex-start', padding: '24px' }}>
                        <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '12px 24px' }}>
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Vendor Details'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/vendor/manage')} style={{
                            background: '#f1f5f9',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVendor;
