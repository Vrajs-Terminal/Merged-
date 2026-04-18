export interface ExtractedList<T> {
  rows: T[];
  total: number;
  page: number;
  pages: number;
}

const toArray = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  return [];
};

export const extractApiList = <T>(payload: any): ExtractedList<T> => {
  const rows = [
    toArray<T>(payload),
    toArray<T>(payload?.data),
    toArray<T>(payload?.rows),
    toArray<T>(payload?.items),
    toArray<T>(payload?.results),
    toArray<T>(payload?.data?.data),
    toArray<T>(payload?.data?.rows),
    toArray<T>(payload?.data?.items),
    toArray<T>(payload?.data?.results)
  ].find((candidate) => candidate.length > 0) || [];

  const pagination = payload?.pagination || payload?.data?.pagination || {};
  const total = typeof pagination.total === "number" ? pagination.total : rows.length;
  const page = typeof pagination.page === "number" ? pagination.page : 1;
  const pages = typeof pagination.pages === "number"
    ? pagination.pages
    : Math.max(1, Math.ceil(total / Math.max(1, typeof pagination.limit === "number" ? pagination.limit : rows.length || 1)));

  return { rows, total, page, pages };
};

export const buildSearchText = (...values: Array<string | number | null | undefined>) =>
  values
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map((value) => String(value).toLowerCase())
    .join(" ");

export const getStatusTone = (status?: string | null) => {
  const normalized = (status || "").trim().toLowerCase();

  if (["active", "approved", "completed", "delivered"].includes(normalized)) {
    return "is-success";
  }

  if (["pending", "draft", "low"].includes(normalized)) {
    return "is-warning";
  }

  if (["inactive", "cancelled", "failed", "out", "rejected"].includes(normalized)) {
    return "is-danger";
  }

  if (["in progress", "processing"].includes(normalized)) {
    return "is-info";
  }

  return "is-neutral";
};
