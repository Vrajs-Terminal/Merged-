import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";

interface OrderSettings {
  // General Settings
  shareOrderButton: boolean;
  orderCancellationTime: number;
  allowOrderWithoutPunchIn: boolean;
  attachOrderCsvExport: boolean;
  bypassOrderRouteVerification: boolean;
  orderEditAccess: boolean;
  orderHistoryViewType: "retailerWise" | "employeeWise" | "dateWise";

  // Location Settings
  retailerVisitRadius: number;
  requireEndVisitReason: boolean;
  allowOrderOutsideRoute: boolean;

  // Product Settings
  productPriceType: "fixedPrice" | "editablePrice" | "discountBasedPrice";
  stockManagement: boolean;
  allowZeroPriceProduct: boolean;
  applyGstOnOrder: boolean;
  applyFreightCharges: boolean;
  displayHsnCode: boolean;

  // Distributor Settings
  sendEmailToDistributor: boolean;
  distributorViewWhileTakingOrder: "assignedDistributor" | "allDistributors" | "hidden";
  distributorViewWhileAddingRetailer: "assignedDistributor" | "allDistributors" | "hidden";

  // Retailer Settings
  retailerNameUnique: boolean;
  employeeBindWithRetailer: boolean;
  allowAddingNewCityArea: boolean;
  allowB2bOrders: boolean;
  retailerContactDuplication: "allow" | "notAllow";

  // App Interface Settings
  showOrderProcessSteps: boolean;
  retailerProductView: "horizontalCategory" | "verticalCategory" | "productList";
  allowEditingCustomerDetails: "anyCustomer" | "onlyAssignedCustomer" | "requireApproval";

  // PDF Settings
  showRemarksInPdf: boolean;
  showProductImagesInPdf: boolean;
  showDistributorDetailsInPdf: boolean;

  // Retailer Fields
  retailerFields: {
    [key: string]: boolean;
  };

  // Discount Settings
  discountOnOrderTotal: boolean;
  discountType: "percentage" | "fixedAmount";
  maximumDiscountLimit: number;
}

const defaultSettings: OrderSettings = {
  shareOrderButton: true,
  orderCancellationTime: 60,
  allowOrderWithoutPunchIn: false,
  attachOrderCsvExport: true,
  bypassOrderRouteVerification: false,
  orderEditAccess: true,
  orderHistoryViewType: "employeeWise",
  retailerVisitRadius: 500,
  requireEndVisitReason: true,
  allowOrderOutsideRoute: false,
  productPriceType: "fixedPrice",
  stockManagement: true,
  allowZeroPriceProduct: false,
  applyGstOnOrder: true,
  applyFreightCharges: false,
  displayHsnCode: true,
  sendEmailToDistributor: true,
  distributorViewWhileTakingOrder: "assignedDistributor",
  distributorViewWhileAddingRetailer: "assignedDistributor",
  retailerNameUnique: true,
  employeeBindWithRetailer: true,
  allowAddingNewCityArea: false,
  allowB2bOrders: false,
  retailerContactDuplication: "notAllow",
  showOrderProcessSteps: true,
  retailerProductView: "verticalCategory",
  allowEditingCustomerDetails: "onlyAssignedCustomer",
  showRemarksInPdf: true,
  showProductImagesInPdf: true,
  showDistributorDetailsInPdf: true,
  retailerFields: {
    email: true,
    area: true,
    photo: true,
    category: true,
    website: true,
    alternatePhone: false,
    pincode: true,
    gstNumber: true,
    dob: false,
    anniversary: false,
    creditLimit: true,
    creditDays: true,
    retailerType: true,
    address: true
  },
  discountOnOrderTotal: true,
  discountType: "percentage",
  maximumDiscountLimit: 20
};

export default function OrderSettings() {
  const [settings, setSettings] = useState<OrderSettings>(defaultSettings);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await adminSettingsAPI.getOrderConfig();
        if (res?.data) {
          setSettings({ ...defaultSettings, ...res.data });
        }
      } catch {
        toast.error("Failed to load order settings profile");
      }
    };

    loadSettings();
  }, []);

  const handleBoolChange = (field: string, value: boolean) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleStringChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleNumberChange = (field: string, value: number) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleRetailerFieldToggle = (field: string, value: boolean) => {
    setSettings({
      ...settings,
      retailerFields: { ...settings.retailerFields, [field]: value }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminSettingsAPI.saveOrderConfig(settings);
      setMsg({ type: "success", text: "Order settings saved successfully!" });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Order Settings" },
    { id: "location", label: "Location & Visit Settings" },
    { id: "product", label: "Product & Pricing Settings" },
    { id: "distributor", label: "Distributor Settings" },
    { id: "retailer", label: "Retailer Settings" },
    { id: "interface", label: "App Interface Settings" },
    { id: "pdf", label: "Order PDF Settings" },
    { id: "fields", label: "Retailer Field Settings" },
    { id: "discount", label: "Order Discount Settings" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Share Order Button</label>
              <select className="lm-select" value={settings.shareOrderButton ? "yes" : "no"} onChange={e => handleBoolChange("shareOrderButton", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Order Cancellation Time (Minutes)</label>
              <input
                type="number"
                className="lm-input"
                value={settings.orderCancellationTime}
                onChange={e => handleNumberChange("orderCancellationTime", parseInt(e.target.value) || 0)}
                placeholder="60"
              />
            </div>

            <div className="lm-field">
              <label className="lm-label">Allow Order Without Punch In</label>
              <select className="lm-select" value={settings.allowOrderWithoutPunchIn ? "yes" : "no"} onChange={e => handleBoolChange("allowOrderWithoutPunchIn", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Attach Order CSV While Export</label>
              <select className="lm-select" value={settings.attachOrderCsvExport ? "yes" : "no"} onChange={e => handleBoolChange("attachOrderCsvExport", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Bypass Order Route Verification</label>
              <select className="lm-select" value={settings.bypassOrderRouteVerification ? "yes" : "no"} onChange={e => handleBoolChange("bypassOrderRouteVerification", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Order Edit Access</label>
              <select className="lm-select" value={settings.orderEditAccess ? "yes" : "no"} onChange={e => handleBoolChange("orderEditAccess", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Order History View Type</label>
              <select className="lm-select" value={settings.orderHistoryViewType} onChange={e => handleStringChange("orderHistoryViewType", e.target.value)}>
                <option value="retailerWise">Retailer Wise</option>
                <option value="employeeWise">Employee Wise</option>
                <option value="dateWise">Date Wise</option>
              </select>
            </div>
          </div>
        );

      case "location":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Retailer Visit Radius (Meter)</label>
              <input
                type="number"
                className="lm-input"
                value={settings.retailerVisitRadius}
                onChange={e => handleNumberChange("retailerVisitRadius", parseInt(e.target.value) || 0)}
                placeholder="500"
              />
            </div>

            <div className="lm-field">
              <label className="lm-label">Require End Visit Reason</label>
              <select className="lm-select" value={settings.requireEndVisitReason ? "yes" : "no"} onChange={e => handleBoolChange("requireEndVisitReason", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Allow Order Outside Assigned Route</label>
              <select className="lm-select" value={settings.allowOrderOutsideRoute ? "yes" : "no"} onChange={e => handleBoolChange("allowOrderOutsideRoute", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        );

      case "product":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Product Price Type</label>
              <select className="lm-select" value={settings.productPriceType} onChange={e => handleStringChange("productPriceType", e.target.value)}>
                <option value="fixedPrice">Fixed Price</option>
                <option value="editablePrice">Editable Price</option>
                <option value="discountBasedPrice">Discount Based Price</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Stock Management</label>
              <select className="lm-select" value={settings.stockManagement ? "on" : "off"} onChange={e => handleBoolChange("stockManagement", e.target.value === "on")}>
                <option value="on">On</option>
                <option value="off">Off</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Allow Zero Price Product Order</label>
              <select className="lm-select" value={settings.allowZeroPriceProduct ? "yes" : "no"} onChange={e => handleBoolChange("allowZeroPriceProduct", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Apply GST on Order</label>
              <select className="lm-select" value={settings.applyGstOnOrder ? "yes" : "no"} onChange={e => handleBoolChange("applyGstOnOrder", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Apply Freight Charges</label>
              <select className="lm-select" value={settings.applyFreightCharges ? "yes" : "no"} onChange={e => handleBoolChange("applyFreightCharges", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Display HSN Code</label>
              <select className="lm-select" value={settings.displayHsnCode ? "yes" : "no"} onChange={e => handleBoolChange("displayHsnCode", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        );

      case "distributor":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Send Email to Distributor on Order</label>
              <select className="lm-select" value={settings.sendEmailToDistributor ? "yes" : "no"} onChange={e => handleBoolChange("sendEmailToDistributor", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Distributor View While Taking Order</label>
              <select className="lm-select" value={settings.distributorViewWhileTakingOrder} onChange={e => handleStringChange("distributorViewWhileTakingOrder", e.target.value)}>
                <option value="assignedDistributor">Assigned Distributor</option>
                <option value="allDistributors">All Distributors</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Distributor View While Adding Retailer</label>
              <select className="lm-select" value={settings.distributorViewWhileAddingRetailer} onChange={e => handleStringChange("distributorViewWhileAddingRetailer", e.target.value)}>
                <option value="assignedDistributor">Assigned Distributor</option>
                <option value="allDistributors">All Distributors</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
        );

      case "retailer":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Retailer Name Unique</label>
              <select className="lm-select" value={settings.retailerNameUnique ? "yes" : "no"} onChange={e => handleBoolChange("retailerNameUnique", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Employee Bind With Retailer</label>
              <select className="lm-select" value={settings.employeeBindWithRetailer ? "yes" : "no"} onChange={e => handleBoolChange("employeeBindWithRetailer", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Allow Adding New City/Area from App</label>
              <select className="lm-select" value={settings.allowAddingNewCityArea ? "yes" : "no"} onChange={e => handleBoolChange("allowAddingNewCityArea", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Allow B2B Orders</label>
              <select className="lm-select" value={settings.allowB2bOrders ? "yes" : "no"} onChange={e => handleBoolChange("allowB2bOrders", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Retailer Contact Number Duplication</label>
              <select className="lm-select" value={settings.retailerContactDuplication} onChange={e => handleStringChange("retailerContactDuplication", e.target.value)}>
                <option value="allow">Allow</option>
                <option value="notAllow">Not Allow</option>
              </select>
            </div>
          </div>
        );

      case "interface":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Show Order Process Steps in App</label>
              <select className="lm-select" value={settings.showOrderProcessSteps ? "yes" : "no"} onChange={e => handleBoolChange("showOrderProcessSteps", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Retailer Product View</label>
              <select className="lm-select" value={settings.retailerProductView} onChange={e => handleStringChange("retailerProductView", e.target.value)}>
                <option value="horizontalCategory">Horizontal Category</option>
                <option value="verticalCategory">Vertical Category</option>
                <option value="productList">Product List</option>
              </select>
            </div>

            <div className="lm-field lm-col-2">
              <label className="lm-label">Allow Editing Customer Details</label>
              <select className="lm-select" value={settings.allowEditingCustomerDetails} onChange={e => handleStringChange("allowEditingCustomerDetails", e.target.value)}>
                <option value="anyCustomer">Any Customer</option>
                <option value="onlyAssignedCustomer">Only Assigned Customer</option>
                <option value="requireApproval">Require Approval</option>
              </select>
            </div>
          </div>
        );

      case "pdf":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Show Remarks in Order PDF</label>
              <select className="lm-select" value={settings.showRemarksInPdf ? "yes" : "no"} onChange={e => handleBoolChange("showRemarksInPdf", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Show Product Images in Order PDF</label>
              <select className="lm-select" value={settings.showProductImagesInPdf ? "yes" : "no"} onChange={e => handleBoolChange("showProductImagesInPdf", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Show Distributor Details in PDF</label>
              <select className="lm-select" value={settings.showDistributorDetailsInPdf ? "yes" : "no"} onChange={e => handleBoolChange("showDistributorDetailsInPdf", e.target.value === "yes")}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        );

      case "fields":
        return (
          <div style={{ overflowX: "auto" }}>
            <table className="lm-table">
              <thead>
                <tr>
                  <th>Retailer Field</th>
                  <th style={{ textAlign: "center" }}>Show</th>
                  <th style={{ textAlign: "center" }}>Hide</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "email", label: "Retailer Email" },
                  { key: "area", label: "Area" },
                  { key: "photo", label: "Retailer Photo" },
                  { key: "category", label: "Category" },
                  { key: "website", label: "Website" },
                  { key: "alternatePhone", label: "Alternate Mobile Number" },
                  { key: "pincode", label: "Pincode" },
                  { key: "gstNumber", label: "GST Number" },
                  { key: "dob", label: "Date Of Birth" },
                  { key: "anniversary", label: "Wedding Anniversary" },
                  { key: "creditLimit", label: "Credit Limit" },
                  { key: "creditDays", label: "Credit Days" },
                  { key: "retailerType", label: "Retailer Type" },
                  { key: "address", label: "Address" }
                ].map((field) => (
                  <tr key={field.key}>
                    <td style={{ fontWeight: 600 }}>{field.label}</td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="radio"
                        checked={settings.retailerFields[field.key]}
                        onChange={() => handleRetailerFieldToggle(field.key, true)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <input
                        type="radio"
                        checked={!settings.retailerFields[field.key]}
                        onChange={() => handleRetailerFieldToggle(field.key, false)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "discount":
        return (
          <div className="lm-form-grid">
            <div className="lm-field">
              <label className="lm-label">Discount on Order Total</label>
              <select className="lm-select" value={settings.discountOnOrderTotal ? "allow" : "notAllow"} onChange={e => handleBoolChange("discountOnOrderTotal", e.target.value === "allow")}>
                <option value="allow">Allow</option>
                <option value="notAllow">Not Allow</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Discount Type</label>
              <select className="lm-select" value={settings.discountType} onChange={e => handleStringChange("discountType", e.target.value)}>
                <option value="percentage">Percentage %</option>
                <option value="fixedAmount">Fixed Amount</option>
              </select>
            </div>

            <div className="lm-field">
              <label className="lm-label">Maximum Discount Limit</label>
              <input
                type="number"
                className="lm-input"
                value={settings.maximumDiscountLimit}
                onChange={e => handleNumberChange("maximumDiscountLimit", parseInt(e.target.value) || 0)}
                placeholder="20"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="lm-container lm-fade">
      <div className="lm-page-header">
        <div>
          <h2 className="lm-page-title"><Settings size={22} /> Order Settings</h2>
          <p className="lm-page-subtitle">Configure order creation, management, and processing in the system</p>
        </div>
        <button 
          className="lm-btn-primary" 
          onClick={handleSave} 
          disabled={saving}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: saving ? "#cbd5e1" : "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 600,
            transition: "all 0.3s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.9rem"
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#4f46e5";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(99, 102, 241, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.backgroundColor = "#6366f1";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {msg && (
        <div className={`lm-alert ${msg.type === "error" ? "lm-alert-error" : "lm-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="lm-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      {/* Tabs */}
      <div className="lm-card" style={{ marginBottom: "2rem" }}>
        <div style={{ 
          display: "flex", 
          gap: "0.5rem", 
          flexWrap: "wrap", 
          borderBottom: "2px solid #e2e8f0", 
          paddingBottom: "1rem",
          overflow: "auto"
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.7rem 1.2rem",
                backgroundColor: activeTab === tab.id ? "#6366f1" : "transparent",
                color: activeTab === tab.id ? "white" : "#64748b",
                border: "none",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: "0.8rem",
                transition: "all 0.3s ease",
                whiteSpace: "nowrap",
                boxShadow: activeTab === tab.id ? "0 2px 8px rgba(99, 102, 241, 0.2)" : "none",
                borderBottom: activeTab === tab.id ? "2px solid #4f46e5" : "none"
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "#e0e7ff";
                  e.currentTarget.style.color = "#4f46e5";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="lm-card" style={{ marginBottom: "2rem", animation: "fadeIn 0.3s ease" }}>
        {renderTabContent()}
      </div>

      {/* Benefits Section */}
      <div className="lm-card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
        <div className="lm-card-title" style={{ color: "#047857" }}>✓ Benefits</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Flexible Order Control</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Customize every aspect of order creation and management</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Distributor-Retailer Support</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Support complex B2B business models</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Better Sales Team Management</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Manage field sales teams effectively</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Customizable Data Collection</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Control which retailer information to collect</p>
          </div>
          <div>
            <h4 style={{ color: "#047857", marginBottom: "0.5rem" }}>✔ Improved Order Workflow</h4>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Streamline order processes for field sales</p>
          </div>
        </div>
      </div>
    </div>
  );
}
