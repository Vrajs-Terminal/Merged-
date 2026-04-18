import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react";
import { adminSettingsAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import "./orderSettings.css";

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
    <div className="lm-container lm-fade os-page-shell">
      <div className="os-header">
        <div className="os-header-content">
          <span className="os-eyebrow">Order Control Center</span>
          <h2><Settings size={22} /> Order Settings</h2>
          <p>Configure order creation, management, and processing in a clean, structured workspace.</p>
        </div>
        <button className="os-save-button" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="os-hero-card">
        <div className="os-hero-copy">
          <span className="os-eyebrow">System-wide configuration</span>
          <h3>Control order behavior, customer flow, and product rules in one place.</h3>
          <p>
            This layout groups settings into focused sections so teams can scan faster and change with confidence.
          </p>
        </div>
        <div className="os-hero-stats">
          <div className="os-stat-card">
            <span>Tabs</span>
            <strong>9</strong>
          </div>
          <div className="os-stat-card">
            <span>Core Fields</span>
            <strong>14+</strong>
          </div>
          <div className="os-stat-card">
            <span>Status</span>
            <strong>Ready</strong>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`os-alert ${msg.type === "error" ? "os-alert-error" : "os-alert-success"}`}>
          {msg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />} {msg.text}
          <button className="os-alert-close" onClick={() => setMsg(null)}>&times;</button>
        </div>
      )}

      <div className="os-card os-tabs-card">
        <div className="os-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`os-tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="os-tab-content os-card">
        <div className="os-tab-meta">
          <span>{tabs.find((tab) => tab.id === activeTab)?.label}</span>
          <strong>Active configuration</strong>
        </div>
        {renderTabContent()}
      </div>

      <div className="os-benefits-card os-card">
        <div className="os-section-head">
          <div>
            <span className="os-section-kicker">Why this matters</span>
            <h3>Built to keep order operations clear and consistent</h3>
          </div>
        </div>
        <div className="os-benefits-grid">
          <div className="os-benefit-item">
            <h4>Flexible order control</h4>
            <p>Customize every aspect of order creation and management.</p>
          </div>
          <div className="os-benefit-item">
            <h4>Distributor-retailer support</h4>
            <p>Support complex B2B business models with cleaner rules.</p>
          </div>
          <div className="os-benefit-item">
            <h4>Better sales team management</h4>
            <p>Keep field workflows organized and easier to maintain.</p>
          </div>
          <div className="os-benefit-item">
            <h4>Customizable data collection</h4>
            <p>Control which retailer information you collect from the app.</p>
          </div>
          <div className="os-benefit-item">
            <h4>Improved order workflow</h4>
            <p>Streamline processing with a more guided settings experience.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
