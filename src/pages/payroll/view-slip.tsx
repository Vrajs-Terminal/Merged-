import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Calendar, Building2, Users, FileText, ShieldCheck, Copy, CheckCircle2, ArrowLeft } from "lucide-react";
import api from "../../lib/axios";
import "./view-slip.css";

type SalarySlip = {
  id: number;
  month: number;
  year: number;
  status: string;
  is_shared?: boolean;
  salary_mode?: string;
  net_salary?: number;
  total_earnings?: number;
  total_deductions?: number;
  user?: {
    name?: string;
    email?: string;
    branch?: { name?: string } | null;
    department?: { name?: string } | null;
  };
  employeeCtc?: {
    gross_salary?: number;
  };
};

function formatMonth(month: number) {
  return new Date(2000, Math.max(0, month - 1), 1).toLocaleString("default", { month: "long" });
}

export default function ViewSalarySlipPage() {
  const { id } = useParams<{ id: string }>();
  const slipId = useMemo(() => Number(id), [id]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slip, setSlip] = useState<SalarySlip | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSlip = async () => {
      if (!slipId || Number.isNaN(slipId)) {
        setError("Invalid salary slip link.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("/salary-slips/list", { params: { status: "Published" } });
        const foundSlip = (response.data || []).find((entry: SalarySlip) => Number(entry.id) === slipId) || null;

        if (!cancelled) {
          if (!foundSlip) {
            setError("Salary slip not found or not published yet.");
          } else if (foundSlip.is_shared === false) {
            setError("This salary slip is not shared for public access.");
          } else {
            setSlip(foundSlip);
            setError(null);
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError("Unable to load the salary slip right now.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadSlip();

    return () => {
      cancelled = true;
    };
  }, [slipId]);

  const handleCopyLink = async () => {
    if (!slip) return;
    const publicLink = `${window.location.origin}/#/view-slip/${slip.id}`;
    await navigator.clipboard.writeText(publicLink);
  };

  if (loading) {
    return (
      <div className="view-slip-shell">
        <div className="view-slip-panel loading-panel">
          <Loader2 size={28} className="spin" />
          <p>Loading salary slip...</p>
        </div>
      </div>
    );
  }

  if (error || !slip) {
    return (
      <div className="view-slip-shell">
        <div className="view-slip-panel error-panel">
          <ShieldCheck size={28} />
          <h1>Salary Slip Unavailable</h1>
          <p>{error || "The requested salary slip could not be loaded."}</p>
          <Link to="/published-salary" className="view-slip-back-link">
            <ArrowLeft size={16} /> Back to Published Salary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="view-slip-shell">
      <div className="view-slip-panel">
        <div className="view-slip-hero">
          <div>
            <p className="view-slip-kicker">Public Salary Slip</p>
            <h1>{slip.user?.name || "Employee"}</h1>
            <p className="view-slip-subtitle">
              {formatMonth(slip.month)} {slip.year} · {slip.status}
            </p>
          </div>
          <button className="view-slip-copy" onClick={handleCopyLink}>
            <Copy size={16} /> Copy Link
          </button>
        </div>

        <div className="view-slip-grid">
          <section className="view-slip-card">
            <div className="view-slip-card-label"><Users size={16} /> Employee</div>
            <div className="view-slip-card-value">{slip.user?.name || "N/A"}</div>
            <div className="view-slip-card-meta">{slip.user?.email || "No email available"}</div>
          </section>
          <section className="view-slip-card">
            <div className="view-slip-card-label"><Building2 size={16} /> Branch</div>
            <div className="view-slip-card-value">{slip.user?.branch?.name || "N/A"}</div>
            <div className="view-slip-card-meta">{slip.user?.department?.name || "No department"}</div>
          </section>
          <section className="view-slip-card">
            <div className="view-slip-card-label"><Calendar size={16} /> Salary Period</div>
            <div className="view-slip-card-value">{formatMonth(slip.month)} {slip.year}</div>
            <div className="view-slip-card-meta">Mode: {slip.salary_mode || "N/A"}</div>
          </section>
          <section className="view-slip-card">
            <div className="view-slip-card-label"><FileText size={16} /> Net Salary</div>
            <div className="view-slip-card-value accent">{Number(slip.net_salary || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
            <div className="view-slip-card-meta">Gross: {Number(slip.employeeCtc?.gross_salary || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
          </section>
        </div>

        <div className="view-slip-summary">
          <div>
            <span>Total Earnings</span>
            <strong>{Number(slip.total_earnings || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</strong>
          </div>
          <div>
            <span>Total Deductions</span>
            <strong>{Number(slip.total_deductions || 0).toLocaleString("en-IN", { style: "currency", currency: "INR" })}</strong>
          </div>
          <div>
            <span>Access</span>
            <strong>{slip.is_shared === false ? "Restricted" : "Shared"}</strong>
          </div>
        </div>

        <div className="view-slip-footer">
          <Link to="/generated-salary" className="view-slip-back-link">
            <ArrowLeft size={16} /> Go to Payroll
          </Link>
          <span className="view-slip-note">This page is routed directly from the public salary-slip link.</span>
        </div>
      </div>
    </div>
  );
}
