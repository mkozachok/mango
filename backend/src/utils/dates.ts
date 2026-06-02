export function parseReviewPublishedAt(input: {
  review_timestamp?: number;
  review_datetime_utc?: string;
}): Date | null {
  if (typeof input.review_timestamp === "number" && Number.isFinite(input.review_timestamp)) {
    // Outscraper docs show seconds
    return new Date(input.review_timestamp * 1000);
  }

  const s = input.review_datetime_utc?.trim();
  if (!s) return null;

  // Expected format: "MM/DD/YYYY HH:mm:ss" (UTC)
  const m = /^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(s);
  if (!m) {
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const [, mm, dd, yyyy, HH, MM, SS] = m;
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);
  const hour = Number(HH);
  const minute = Number(MM);
  const second = Number(SS);

  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return Number.isNaN(d.getTime()) ? null : d;
}

