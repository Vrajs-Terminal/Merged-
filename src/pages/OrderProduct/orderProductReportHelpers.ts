import { exportToExcel, exportToPDF } from "../../utils/exportUtils";

export type ExportRow = Record<string, string | number | boolean | null | undefined>;

const getKeys = (rows: ExportRow[], keys?: string[]) => {
  if (keys && keys.length > 0) {
    return keys;
  }

  if (rows.length === 0) {
    return [];
  }

  return Object.keys(rows[0]);
};

const escapeCsv = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }

  return text;
};

const copyText = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

export const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2
}).format(Number.isFinite(value) ? value : 0);

export const formatDate = (value: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const formatDateTime = (value: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const copyRowsToClipboard = async (rows: ExportRow[], keys?: string[]) => {
  const columns = getKeys(rows, keys);

  if (columns.length === 0) {
    return false;
  }

  const lines = [
    columns.join("\t"),
    ...rows.map((row) => columns.map((column) => row[column] ?? "").join("\t"))
  ];

  await copyText(lines.join("\n"));
  return true;
};

export const downloadRowsAsCsv = (rows: ExportRow[], fileName: string, keys?: string[]) => {
  const columns = getKeys(rows, keys);

  if (columns.length === 0) {
    return false;
  }

  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(","))
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${Date.now()}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
};

export const exportRowsToExcel = (rows: ExportRow[], fileName: string, sheetName: string) => {
  if (rows.length === 0) {
    return false;
  }

  exportToExcel(rows, fileName, sheetName);
  return true;
};

export const exportRowsToPdf = (rows: ExportRow[], fileName: string, title: string, keys?: string[]) => {
  if (rows.length === 0) {
    return false;
  }

  exportToPDF(rows, fileName, title, keys);
  return true;
};
