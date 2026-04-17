import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  IndianRupee,
  Loader2,
  PlusCircle,
  RefreshCw,
  Save,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";
import { branchAPI, ledgerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./BalanceSheet.css";

interface BranchItem {
  id: string | number;
  branchName: string;
}

interface BalanceFormData {
  category: string;
  branchId: string;
  date: string;
  amount: string;
  type: string;
  paymentMode: string;
  remark: string;
}

const getInitialFormData = (): BalanceFormData => ({
  category: "",
  branchId: "",
  date: new Date().toISOString().split("T")[0],
  amount: "",
  type: "",
  paymentMode: "Cash on Hand",
  remark: "",
});

const AddBalanceSheet: React.FC<{ setActivePage?: (page: string) => void }> = ({ setActivePage }) => {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [fetchingBranches, setFetchingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BalanceFormData>(getInitialFormData());
  const [attachment, setAttachment] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBranches = async () => {
    try {
      setFetchingBranches(true);
      const response = await branchAPI.getAll();
      setBranches(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Unable to load branches");
    } finally {
      setFetchingBranches(false);
    }
  };

  useEffect(() => {
    fetchBranches();

    const savedDraft = localStorage.getItem("bsAddDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as BalanceFormData;
        setFormData(parsed);
        toast.info("Saved draft restored");
      } catch (error) {
        console.error("Failed to parse saved draft", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isValidAttachment = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PNG, JPG, or PDF files are allowed");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size should be under 5MB");
      return false;
    }

    return true;
  };

  const handleAttachmentSelect = (file: File | null) => {
    if (!file) return;
    if (!isValidAttachment(file)) return;
    setAttachment(file);
    toast.success("Evidence file attached");
  };

  const validateForm = () => {
    if (!formData.category) return "Please select balance sheet category";
    if (!formData.branchId) return "Please select a branch";
    if (!formData.type.trim()) return "Please enter source/type";
    if (!formData.amount || Number(formData.amount) <= 0) return "Please enter a valid amount";
    if (!formData.date) return "Please select entry date";
    if (!formData.paymentMode) return "Please select payment mode";
    return "";
  };

  const handleSaveDraft = () => {
    localStorage.setItem("bsAddDraft", JSON.stringify(formData));
    toast.success("Draft saved locally");
  };

  const clearForm = () => {
    setFormData(getInitialFormData());
    setAttachment(null);
  };

  const handleSubmit = async (goToReport = true) => {
    const errorMessage = validateForm();
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    try {
      setSubmitting(true);
      await ledgerAPI.createTransaction({
        ...formData,
        amount: Number(formData.amount),
        attachmentName: attachment?.name ?? null,
      });

      localStorage.removeItem("bsAddDraft");
      toast.success("Transaction recorded successfully");

      if (goToReport) {
        if (setActivePage) setActivePage("balanceSheetReport");
      } else {
        clearForm();
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const amountLabel = useMemo(() => {
    const amount = Number(formData.amount || 0);
    if (!amount) return "0.00";
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [formData.amount]);

  const selectedBranchName = useMemo(() => {
    const selected = branches.find((branch) => String(branch.id) === String(formData.branchId));
    return selected?.branchName || "Not selected";
  }, [branches, formData.branchId]);

  return (
    <div className="main-content bs-add-page animate-fade-in">
      <div className="page-header bs-add-header">
        <div>
          <PageTitle
            title="Add Balance Sheet Entry"
            subtitle="Record and organize financial transactions for accurate reporting"
            icon={<TrendingUp size={22} />}
          />
        </div>
        <span className="badge badge-primary bs-add-fy">FY 2024-25 Active</span>
      </div>

      <div className="bs-add-grid">
        <form
          className="glass-card bs-add-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(true);
          }}
        >
          <div className="bs-add-section-title">
            <PlusCircle size={20} />
            <h3>Transaction Fundamentals</h3>
          </div>

          <div className="bs-add-form-grid">
            <div>
              <label className="input-label">Balance Sheet Category*</label>
              <select name="category" className="select-modern" value={formData.category} onChange={handleChange}>
                <option value="">-- Select Classification --</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense (Operational)</option>
                <option value="Asset">Asset (Capex)</option>
                <option value="Liability">Liability</option>
              </select>
            </div>

            <div>
              <label className="input-label">Center Branch*</label>
              <select name="branchId" className="select-modern" value={formData.branchId} onChange={handleChange}>
                <option value="">{fetchingBranches ? "Loading branches..." : "-- Select Branch --"}</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Source / Type*</label>
              <input
                name="type"
                type="text"
                className="input-modern"
                placeholder="e.g. Sales Revenue, Office Rent"
                value={formData.type}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="input-label">Nominal Amount (INR)*</label>
              <div className="bs-input-icon-wrap">
                <IndianRupee size={18} className="bs-input-icon" />
                <input
                  name="amount"
                  type="number"
                  className="input-modern bs-input-pad"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                />
              </div>
            </div>

            <div className="bs-add-form-full">
              <label className="input-label">Date of Entry*</label>
              <div className="bs-input-icon-wrap right">
                <Calendar size={18} className="bs-input-icon" />
                <input name="date" type="date" className="input-modern" value={formData.date} onChange={handleChange} />
              </div>
            </div>

            <div className="bs-add-form-full">
              <label className="input-label">Payment Channel*</label>
              <div className="bs-payment-grid">
                {["Cash on Hand", "Bank Transfer", "UPI / Card"].map((mode) => (
                  <label key={mode} className={`bs-payment-option ${formData.paymentMode === mode ? "is-active" : ""}`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={formData.paymentMode === mode}
                      onChange={handleChange}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bs-add-form-full">
              <label className="input-label">Remark / Justification</label>
              <textarea
                name="remark"
                className="input-modern bs-add-remark"
                rows={3}
                placeholder="Provide a brief context for this entry..."
                value={formData.remark}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bs-add-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                clearForm();
                toast.info("Form reset");
              }}
            >
              <RefreshCw size={16} /> Reset
            </button>
            <button className="btn-secondary" type="button" onClick={handleSaveDraft}>
              <Save size={16} /> Save Draft
            </button>
            <button className="btn-primary" type="button" onClick={() => handleSubmit(false)} disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save & Add Next
            </button>
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Commit Transaction
            </button>
          </div>
        </form>

        <div className="bs-add-side">
          <section className="glass-card bs-side-card">
            <div className="bs-add-section-title compact">
              <UploadCloud size={18} />
              <h3>Voucher & Evidence</h3>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              style={{ display: "none" }}
              onChange={(event) => handleAttachmentSelect(event.target.files?.[0] ?? null)}
            />

            <div
              className={`bs-upload-zone ${dragOver ? "is-drag" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragOver(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                handleAttachmentSelect(event.dataTransfer.files?.[0] ?? null);
              }}
            >
              <UploadCloud size={30} />
              <p>Upload Invoice / Receipt</p>
              <small>PNG, JPG or PDF up to 5MB</small>
            </div>

            {attachment && (
              <div className="bs-file-chip">
                <FileText size={14} />
                <span>{attachment.name}</span>
                <button type="button" onClick={() => setAttachment(null)}>
                  <X size={14} />
                </button>
              </div>
            )}
          </section>

          <section className="glass-card bs-side-card bs-audit">
            <div className="bs-add-section-title compact">
              <ShieldCheck size={18} />
              <h3>Audit Compliance</h3>
            </div>
            <ul>
              <li>Asset entries are mapped into depreciation reports automatically.</li>
              <li>Branch tagging supports cost-center analysis in P and L segmentation.</li>
              <li>Attach vouchers for smoother internal and statutory audits.</li>
            </ul>
          </section>

          <section className="glass-card bs-side-card bs-summary">
            <div className="bs-add-section-title compact">
              <AlertCircle size={18} />
              <h3>Entry Snapshot</h3>
            </div>
            <div className="bs-summary-row">
              <span>Category</span>
              <strong>{formData.category || "Not selected"}</strong>
            </div>
            <div className="bs-summary-row">
              <span>Branch</span>
              <strong>{selectedBranchName}</strong>
            </div>
            <div className="bs-summary-row">
              <span>Payment</span>
              <strong>{formData.paymentMode}</strong>
            </div>
            <div className="bs-summary-row">
              <span>Amount</span>
              <strong>INR {amountLabel}</strong>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AddBalanceSheet;

