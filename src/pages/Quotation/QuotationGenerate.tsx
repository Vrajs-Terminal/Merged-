import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Calendar, User, FileText, ShoppingCart, DollarSign, Save, Download, Mail, MessageCircle, CheckCircle2 } from "lucide-react";
import { adminSettingsAPI, productAPI, retailerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./Quotation.css";

type RetailerRecord = {
   id: number;
   name: string;
   contactNumber?: string;
};

type ProductRecord = {
   id: number;
   name: string;
};

type QuotationTemplate = {
   id: number;
   name: string;
};

const QuotationGenerate: React.FC = () => {
   const [retailers, setRetailers] = useState<RetailerRecord[]>([]);
   const [products, setProducts] = useState<ProductRecord[]>([]);
   const [templates, setTemplates] = useState<QuotationTemplate[]>([]);

   const [selectedRetailer, setSelectedRetailer] = useState("");
   const [selectedTemplate, setSelectedTemplate] = useState("");
   const [selectedProduct, setSelectedProduct] = useState("");

   useEffect(() => {
      const fetchDependencies = async () => {
         try {
            const [retailerRes, productRes, appConfigRes] = await Promise.all([
               retailerAPI.getAll(1, 200),
               productAPI.getAll(1, 200),
               adminSettingsAPI.getAppConfig(),
            ]);

            const retailerData = Array.isArray(retailerRes?.data)
               ? retailerRes.data
               : Array.isArray(retailerRes?.data?.data)
               ? retailerRes.data.data
               : [];

            const productData = Array.isArray(productRes?.data)
               ? productRes.data
               : Array.isArray(productRes?.data?.data)
               ? productRes.data.data
               : [];

            const templateData = Array.isArray(appConfigRes?.data?.quotationTemplates)
               ? appConfigRes.data.quotationTemplates
               : [];

            setRetailers(retailerData);
            setProducts(productData);
            setTemplates(templateData);

            if (retailerData.length > 0) setSelectedRetailer(String(retailerData[0].id));
            if (productData.length > 0) setSelectedProduct(String(productData[0].id));
            if (templateData.length > 0) setSelectedTemplate(String(templateData[0].id));
         } catch {
            toast.info("Some quotation dependencies could not be loaded");
         }
      };

      fetchDependencies();
   }, []);

   const selectedRetailerRecord = retailers.find((retailer) => String(retailer.id) === selectedRetailer);

  return (
      <div className="main-content animate-fade-in quotation-page-container qgen-page">
         <div className="quotation-header qgen-header">
            <div className="quotation-header-text">
               <h1><FileText size={22} /> Generate Quotation</h1>
               <p>Create and issue professional quotations with custom taxation and logic</p>
        </div>
            <div className="quotation-header-actions qgen-header-actions">
               <button className="btn btn-secondary qgen-btn">
            <Save size={18} /> Save as Draft
          </button>
               <button className="btn btn-primary qgen-btn qgen-btn-primary">
            <FileText size={18} /> Finalize & Issue
          </button>
        </div>
      </div>

         <div className="qgen-summary-strip">
            <div className="qgen-summary-pill">
               <span>Selected Customer</span>
               <strong>{selectedRetailerRecord?.name || "None"}</strong>
            </div>
            <div className="qgen-summary-pill">
               <span>Template</span>
               <strong>{templates.find((template) => String(template.id) === selectedTemplate)?.name || "Default Template"}</strong>
            </div>
            <div className="qgen-summary-pill is-success">
               <CheckCircle2 size={14} />
               <strong>Document ready workflow</strong>
            </div>
         </div>

         <div className="qgen-top-grid">
            <div className="glass-card qgen-form-card">
               <div className="qgen-card-head">
              <User size={20} />
                     <h3>Customer Identity</h3>
               </div>
               <div className="qgen-form-grid">
              <div>
                <label className="input-label">Select Customer / Retailer*</label>
                        <select className="select-modern" value={selectedRetailer} onChange={(e) => setSelectedRetailer(e.target.value)}>
                           {retailers.length === 0 && <option value="">No retailers available</option>}
                           {retailers.map((retailer) => (
                              <option key={retailer.id} value={retailer.id}>
                                 {retailer.name}
                              </option>
                           ))}
                </select>
              </div>
              <div>
                <label className="input-label">Communication Contact</label>
                        <input
                           type="text"
                           className="input-modern"
                           placeholder="E.g., +91 9876543210"
                           disabled
                           value={selectedRetailerRecord?.contactNumber || ""}
                        />
              </div>
               </div>
               <div>
              <label className="input-label">Email Address (Quotation Delivery)</label>
              <input type="email" className="input-modern" placeholder="E.g., accounts@retailers.com" />
               </div>
        </div>

            <div className="glass-card qgen-form-card">
               <div className="qgen-card-head">
              <Calendar size={20} />
                     <h3>Validity Framework</h3>
               </div>
               <div className="qgen-form-grid">
              <div>
                <label className="input-label">Quotation Date*</label>
                <input type="date" className="input-modern" defaultValue="2024-03-31" />
              </div>
              <div>
                <label className="input-label">Validity (Valid Till)*</label>
                <input type="date" className="input-modern" defaultValue="2024-04-15" />
              </div>
               </div>
               <div>
              <label className="input-label">Reference Template</label>
                     <select className="select-modern" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                        {templates.length === 0 && <option value="">Default Template</option>}
                        {templates.map((template) => (
                           <option key={template.id} value={template.id}>
                              {template.name}
                           </option>
                        ))}
              </select>
               </div>
        </div>
      </div>

         <div className="glass-card qgen-line-items-card">
            <div className="qgen-card-head qgen-card-head-spread">
               <div className="qgen-card-head">
               <ShoppingCart size={20} />
                      <h3>Quoted Items Inventory</h3>
               </div>
               <button className="btn btn-secondary qgen-btn-sm">
                  <Plus size={16} /> Add Product Line
               </button>
            </div>

            <div className="qgen-table-wrap">
               <table className="table-modern qgen-items-table">
                  <thead>
                     <tr>
                        <th>#</th>
                        <th>Product / Item Selection</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Discount %</th>
                        <th>GST %</th>
                        <th>Total Amount</th>
                        <th>Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td><span className="qgen-index">1</span></td>
                        <td>
                           <select className="select-modern qgen-table-input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                              {products.length === 0 && <option value="">No products available</option>}
                              {products.map((product) => (
                                 <option key={product.id} value={product.id}>
                                    {product.name}
                                 </option>
                              ))}
                           </select>
                        </td>
                        <td><input type="number" className="input-modern qgen-table-input" defaultValue={10} /></td>
                        <td><input type="text" className="input-modern qgen-table-input" defaultValue="₹ 2,499" /></td>
                        <td><input type="number" className="input-modern qgen-table-input" defaultValue={5} /></td>
                        <td><input type="number" className="input-modern qgen-table-input" defaultValue={18} /></td>
                        <td className="qgen-line-amount">₹ 24,990</td>
                        <td>
                           <button className="btn btn-danger qgen-icon-btn" aria-label="Remove item">
                              <Trash2 size={14} />
                           </button>
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>

         <div className="qgen-bottom-grid">
            <div className="glass-card qgen-form-card">
               <div className="qgen-card-head">
                  <Edit2 size={20} />
                  <h3>Additional Terms & Notes</h3>
               </div>
               <div className="qgen-notes-grid">
                  <div>
                     <label className="input-label">Public Notes (Visible to Customer)</label>
                     <textarea className="input-modern" rows={3} placeholder="Thank you for your business!" />
                  </div>
                  <div>
                     <label className="input-label">Standard Terms & Conditions</label>
                     <textarea className="input-modern" rows={3} placeholder="1. Delivery within 7 business days..." />
                  </div>
               </div>
            </div>

            <div className="glass-card qgen-pricing-card">
               <div className="qgen-card-head">
                  <DollarSign size={20} />
                  <h3>Quotation Final Pricing</h3>
               </div>

               <div className="qgen-pricing-lines">
                  <div className="qgen-pricing-line">
                     <span>Items Sub-total (Before Tax)</span>
                     <strong>₹ 2,49,900.00</strong>
                  </div>
                  <div className="qgen-pricing-line">
                     <span>Total Cash Discount (5%)</span>
                     <strong className="is-negative">- ₹ 12,495.00</strong>
                  </div>
                  <div className="qgen-pricing-line">
                     <span>Unified GST (18%)</span>
                     <strong className="is-positive">+ ₹ 42,732.90</strong>
                  </div>
                  <div className="qgen-pricing-total">
                     <span>Final Quotation Amt.</span>
                     <strong>₹ 2,80,137.90</strong>
                  </div>
               </div>

               <div className="qgen-cta-grid">
                  <button className="btn btn-secondary qgen-btn-sm">
                     <Download size={16} /> Export PDF
            </button>
                  <button className="btn btn-success qgen-btn-sm">
                     <MessageCircle size={16} /> WhatsApp Quote
                  </button>
                  <button className="btn btn-secondary qgen-btn-sm">
                     <Mail size={16} /> Email Quote
                  </button>
                  <button className="btn btn-primary qgen-btn-sm qgen-btn-primary">
                     <ShoppingCart size={16} /> Direct Order
                  </button>
               </div>
            </div>
         </div>
    </div>
  );
};

export default QuotationGenerate;
