import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Layout,
  CheckCircle2,
  Building2,
  Globe,
  Eye,
  EyeOff,
  TrendingUp,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { branchAPI, ledgerAPI } from "../../services/apiService";
import { toast } from "../../components/Toast";
import PageTitle from "../../components/PageTitle";
import "./BalanceSheet.css";

interface BranchItem {
  id: string | number;
  branchName: string;
}

interface BalanceSheetTypeItem {
  id: string;
  name: string;
  category: "Income" | "Expense" | "Asset" | "Liability";
  branch: string;
  branchId: string;
  status: "Visible" | "Stashed";
  source: "system" | "custom";
}

interface TypeFormData {
  name: string;
  category: "Income" | "Expense" | "Asset" | "Liability";
  branchId: string;
}

const CUSTOM_TYPE_STORAGE_KEY = "balanceSheetCustomTypes";

const getInitialFormState = (): TypeFormData => ({
  name: "",
  category: "Expense",
  branchId: "",
});

const normalizeTypeName = (name: string) => name.trim().toLowerCase();

const toId = (prefix: string, value: string) => `${prefix}-${normalizeTypeName(value).replace(/\s+/g, "-")}`;

const BalanceSheetType: React.FC = () => {
  const [types, setTypes] = useState<BalanceSheetTypeItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TypeFormData>(getInitialFormState());

  const customTypeCount = useMemo(() => types.filter((type) => type.source === "custom").length, [types]);

  const persistCustomTypes = (nextTypes: BalanceSheetTypeItem[]) => {
    const customTypes = nextTypes.filter((type) => type.source === "custom");
    localStorage.setItem(CUSTOM_TYPE_STORAGE_KEY, JSON.stringify(customTypes));
  };

  const getBranchName = (branchId: string) => {
    if (!branchId) return "All";
    const branch = branches.find((item) => String(item.id) === String(branchId));
    return branch?.branchName || "All";
  };

  const resetModal = () => {
    setEditingTypeId(null);
    setFormData(getInitialFormState());
    setShowModal(false);
  };

  const openCreateModal = () => {
    setEditingTypeId(null);
    setFormData(getInitialFormState());
    setShowModal(true);
  };

  const openEditModal = (type: BalanceSheetTypeItem) => {
    setEditingTypeId(type.id);
    setFormData({
      name: type.name,
      category: type.category,
      branchId: type.branchId,
    });
    setShowModal(true);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [transactionsRes, branchesRes] = await Promise.all([
          ledgerAPI.getTransactions({}).catch(() => ({ data: [] })),
          branchAPI.getAll().catch(() => ({ data: [] })),
        ]);

        const transactionData = Array.isArray(transactionsRes?.data)
          ? transactionsRes.data
          : Array.isArray(transactionsRes?.data?.data)
            ? transactionsRes.data.data
            : [];

        const branchData: BranchItem[] = Array.isArray(branchesRes?.data) ? branchesRes.data : [];
        setBranches(branchData);

        const systemTypes = Object.values(
          transactionData.reduce((acc: Record<string, BalanceSheetTypeItem>, item: any) => {
            const name = item.type || "Unnamed Type";
            const normalized = normalizeTypeName(name);

            if (!acc[name]) {
              acc[name] = {
                id: toId("sys", normalized),
                name,
                category: (item.category || "Expense") as BalanceSheetTypeItem["category"],
                branch: item.branch?.name || item.branch?.branchName || "All",
                branchId: item.branch?.id ? String(item.branch.id) : "",
                status: "Visible",
                source: "system",
              };
            }
            return acc;
          }, {}) as Record<string, BalanceSheetTypeItem>
        ) as BalanceSheetTypeItem[];

        const storedCustomTypes = localStorage.getItem(CUSTOM_TYPE_STORAGE_KEY);
        const parsedCustomTypes = storedCustomTypes ? (JSON.parse(storedCustomTypes) as BalanceSheetTypeItem[]) : [];

        const dedupedCustom = parsedCustomTypes.filter((type) => {
          const duplicateSystemType = systemTypes.some(
            (systemType) => normalizeTypeName(systemType.name) === normalizeTypeName(type.name),
          );
          return !duplicateSystemType;
        });

        const nextTypes = [...systemTypes, ...dedupedCustom] as BalanceSheetTypeItem[];
        setTypes(nextTypes);

        if (parsedCustomTypes.length !== dedupedCustom.length) {
          persistCustomTypes(nextTypes);
        }
      } catch {
        toast.error("Failed to load balance sheet types");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleSaveType = async () => {
    if (!formData.name.trim()) {
      toast.error("Type identifier name is required");
      return;
    }

    const normalizedName = normalizeTypeName(formData.name);
    const duplicate = types.some(
      (type) => normalizeTypeName(type.name) === normalizedName && type.id !== editingTypeId,
    );

    if (duplicate) {
      toast.error("Type name already exists");
      return;
    }

    try {
      setSaving(true);

      const nextType: BalanceSheetTypeItem = {
        id: editingTypeId || toId("custom", `${normalizedName}-${Date.now()}`),
        name: formData.name.trim(),
        category: formData.category,
        branch: getBranchName(formData.branchId),
        branchId: formData.branchId,
        status: "Visible",
        source: "custom",
      };

      const nextTypes = editingTypeId
        ? types.map((type) => {
            if (type.id !== editingTypeId) return type;
            return {
              ...type,
              ...nextType,
              source: type.source,
              status: type.status,
            };
          })
        : [...types, nextType];

      setTypes(nextTypes);
      persistCustomTypes(nextTypes);
      toast.success(editingTypeId ? "Type updated successfully" : "New type created successfully");
      resetModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteType = (type: BalanceSheetTypeItem) => {
    if (type.source === "system") {
      toast.info("System types cannot be deleted. You can stash them instead.");
      return;
    }

    const confirmed = window.confirm(`Delete type \"${type.name}\"?`);
    if (!confirmed) return;

    const nextTypes = types.filter((item) => item.id !== type.id);
    setTypes(nextTypes);
    persistCustomTypes(nextTypes);
    toast.success("Type deleted");
  };

  const handleToggleVisibility = (typeId: string) => {
    const nextTypes = types.map((type): BalanceSheetTypeItem => {
      if (type.id !== typeId) return type;
      return {
        ...type,
        status: (type.status === "Visible" ? "Stashed" : "Visible") as BalanceSheetTypeItem["status"],
      };
    });

    setTypes(nextTypes);
    persistCustomTypes(nextTypes);
  };

  const visibleTypes = useMemo(() => [...types].sort((a, b) => a.name.localeCompare(b.name)), [types]);

  return (
    <div className="main-content animate-fade-in bs-type-page">
      <div className="page-header bs-type-header">
        <div>
          <PageTitle
            title="Balance Sheet Types"
            subtitle="Configure financial accounts and categories linked with organizational branches"
            icon={<TrendingUp size={22} />}
          />
        </div>
        <div className="bs-type-header-actions">
          <span className="badge badge-primary">Custom Types: {customTypeCount}</span>
          <button className="btn btn-primary shadow-glow" onClick={openCreateModal}>
            <Plus size={18} /> Define New Type
          </button>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", color: "var(--primary)" }}>
            <Layout size={20} />
            <p style={{ fontSize: "14px", fontWeight: "600" }}>Linked Branch Control: Certain financial types can be restricted to specific branches for segmented accounting.</p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Type Identifier Name</th>
                <th>Primary Category</th>
                <th>Branch Assignment</th>
                <th>System Visibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="bs-type-empty">
                    <Loader2 size={18} className="animate-spin" /> Loading type definitions...
                  </td>
                </tr>
              )}

              {!loading && visibleTypes.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <span style={{ fontWeight: "700", color: t.status === "Visible" ? "var(--color-text-primary)" : "var(--color-text-muted)" }}>
                      {t.name}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.category === "Income" ? "badge-success" : 
                      t.category === "Expense" ? "badge-danger" : 
                      t.category === "Asset" ? "badge-primary" : "badge-warning"
                    }`} style={{ fontSize: "10px", fontWeight: "800" }}>
                      {t.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px" }}>
                       {t.branch === "All" ? <Globe size={14} /> : <Building2 size={14} />}
                       {t.branch}
                    </div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${t.status === "Visible" ? "badge-success" : "badge-gray"}`}
                      style={{ gap: "6px", cursor: "pointer", border: "none" }}
                      onClick={() => handleToggleVisibility(t.id)}
                    >
                      {t.status === "Visible" ? (
                        <>
                          <Eye size={12} /> Live
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} /> Stashed
                        </>
                      )}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                       <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={() => openEditModal(t)}>
                        <Edit2 size={14} />
                       </button>
                       <button className="btn btn-danger" style={{ padding: "6px" }} onClick={() => handleDeleteType(t)}>
                        <Trash2 size={14} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && visibleTypes.length === 0 && (
                <tr>
                  <td colSpan={6} className="bs-type-empty">
                    No balance sheet types available yet. Click Define New Type to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: "32px", background: "rgba(234, 179, 8, 0.04)", border: "1px dashed rgba(234, 179, 8, 0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#eab308" }}>
          <CheckCircle2 size={18} />
          <p style={{ fontSize: "13px", fontWeight: "700" }}>Pro Feature: Automatic mapping to expense categories is available for 'Expense' types. This syncs with your operational spends.</p>
        </div>
      </div>

      {showModal && (
        <div className="bs-type-modal-overlay" onClick={resetModal}>
          <div className="bs-type-modal-content glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="bs-type-modal-head">
              <h3>{editingTypeId ? "Edit Type Definition" : "Define New Type"}</h3>
              <button className="btn btn-secondary" style={{ padding: "6px" }} onClick={resetModal}>
                <X size={14} />
              </button>
            </div>

            <div className="bs-type-modal-grid">
              <div>
                <label className="input-label">Type Identifier Name*</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="e.g. Operational Expense"
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                />
              </div>

              <div>
                <label className="input-label">Primary Category*</label>
                <select
                  className="select-modern"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: event.target.value as TypeFormData["category"],
                    }))
                  }
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                </select>
              </div>

              <div className="bs-type-modal-full">
                <label className="input-label">Branch Assignment</label>
                <select
                  className="select-modern"
                  value={formData.branchId}
                  onChange={(event) => setFormData((prev) => ({ ...prev, branchId: event.target.value }))}
                >
                  <option value="">All Branches</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bs-type-modal-actions">
              <button className="btn btn-secondary" onClick={resetModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveType} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetType;
