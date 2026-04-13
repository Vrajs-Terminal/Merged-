import React, { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Calendar, User, FileText, ShoppingCart, Percent, DollarSign, Save, Download, Mail, MessageCircle, AlertCircle } from "lucide-react";
import { adminSettingsAPI, productAPI, retailerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

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
    <div className="main-content animate-fade-in">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
        <div>
          <h1 className="page-title"><FileText size={22} /> Generate Quotation</h1>
          <p className="page-subtitle">Create and issue professional quotations with custom taxation and logic</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button className="btn btn-secondary shadow-sm">
            <Save size={18} /> Save as Draft
          </button>
           <button className="btn btn-primary shadow-glow">
            <FileText size={18} /> Finalize & Issue
          </button>
        </div>
      </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {/* Customer Information Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "var(--primary)" }}>
              <User size={20} />
              <h3 style={{ fontSize: "16px" }}>Customer Identity</h3>
           </div>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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

        {/* Timeline Information Card */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
           <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", color: "var(--primary)" }}>
              <Calendar size={20} />
              <h3 style={{ fontSize: "16px" }}>Validity Framework</h3>
           </div>
           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
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

      {/* Product Section Card */}
      <div className="glass-card" style={{ marginBottom: "32px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--primary)" }}>
               <ShoppingCart size={20} />
               <h3 style={{ fontSize: "16px" }}>Quoted Items Inventory</h3>
            </div>
            <button className="btn btn-secondary shadow-sm" style={{ padding: "8px 16px", fontSize: "13px" }}>
              <Plus size={16} /> Add Product Line
            </button>
         </div>

         <div style={{ overflowX: "auto" }}>
            <table className="table-modern">
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
                     <td>1</td>
                     <td style={{ width: "300px" }}>
                                    <select className="select-modern" style={{ height: "35px", padding: "2px 8px" }} value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                       {products.length === 0 && <option value="">No products available</option>}
                                       {products.map((product) => (
                                          <option key={product.id} value={product.id}>
                                             {product.name}
                                          </option>
                                       ))}
                        </select>
                     </td>
                     <td><input type="number" className="input-modern" defaultValue={10} style={{ width: "70px", height: "35px", padding: "4px" }} /></td>
                     <td><input type="text" className="input-modern" defaultValue="₹ 2,499" style={{ width: "100px", height: "35px", padding: "4px" }} /></td>
                     <td><input type="number" className="input-modern" defaultValue={5} style={{ width: "60px", height: "35px", padding: "4px" }} /></td>
                     <td><input type="number" className="input-modern" defaultValue={18} style={{ width: "60px", height: "35px", padding: "4px" }} /></td>
                     <td style={{ fontWeight: "700", color: "var(--primary)" }}>₹ 24,990</td>
                     <td><button className="btn btn-danger" style={{ padding: "6px" }}><Trash2 size={14} /></button></td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>

       {/* Detailed Summary Footer */}
       <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
          <div className="glass-card">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
                <Edit2 size={20} />
                <h3 style={{ fontSize: "16px" }}>Additional Terms & Notes</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="input-label">Public Notes (Visible to Customer)</label>
                  <textarea className="input-modern" rows={3} placeholder="Thank you for your business!"></textarea>
                </div>
                 <div>
                  <label className="input-label">Standard Terms & Conditions</label>
                  <textarea className="input-modern" rows={3} placeholder="1. Delivery within 7 business days..."></textarea>
                </div>
              </div>
          </div>

          <div className="glass-card" style={{ background: "rgba(79, 70, 229, 0.03)", border: "1px solid rgba(79, 70, 229, 0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", color: "var(--primary)" }}>
                <DollarSign size={20} />
                <h3 style={{ fontSize: "16px" }}>Quotation Final Pricing</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Items Sub-total (Before Tax)</span>
                    <span style={{ fontWeight: "700" }}>₹ 2,49,900.00</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Total Cash Discount (5%)</span>
                    <span style={{ fontWeight: "700", color: "var(--danger)" }}>- ₹ 12,495.00</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                    <span style={{ color: "var(--text-muted)" }}>Unified GST (18%)</span>
                    <span style={{ fontWeight: "700", color: "var(--success)" }}>+ ₹ 42,732.90</span>
                 </div>
                 <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", margin: "8px 0" }}></div>
                 <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", fontWeight: "900" }}>
                    <span style={{ color: "var(--primary)" }}>Final Quotation Amt.</span>
                    <span style={{ color: "var(--primary)" }}>₹ 2,80,137.90</span>
                 </div>
              </div>

               <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <button className="btn btn-secondary shadow-sm hover:translate-y-[-2px]" style={{ fontSize: "12px" }}>
                    <Download size={16} color="#475569" /> Export PDF
                  </button>
                  <button className="btn btn-success shadow-sm hover:translate-y-[-2px]" style={{ background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", color: "white", fontSize: "12px" }}>
                    <MessageCircle size={16} /> WhatsApp Quote
                  </button>
                  <button className="btn btn-secondary shadow-sm hover:translate-y-[-2px]" style={{ fontSize: "12px" }}>
                    <Mail size={16} color="#4f46e5" /> Email Quote
                  </button>
                  <button className="btn btn-primary" style={{ fontSize: "12px" }}>
                    <ShoppingCart size={16} /> Direct Order
                  </button>
               </div>
          </div>
       </div>
    </div>
  );
};

export default QuotationGenerate;
