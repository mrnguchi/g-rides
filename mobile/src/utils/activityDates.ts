const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Hermes does not reliably parse display strings such as "Aug 9, 2026".
// Decode our mock date formats explicitly; only ISO timestamps use Date parsing.
export function parseActivityDate(value: string): Date | null {
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  const display = /^(?:[A-Za-z]+,?\s+)?([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})$/.exec(text);
  if (!iso && !display) return null;
  const year = Number(iso ? iso[1] : display![3]);
  const month = iso ? Number(iso[2]) - 1 : months.indexOf(display![1].slice(0, 3).toLowerCase());
  const day = Number(iso ? iso[3] : display![2]);
  if (year < 1000 || month < 0 || month > 11 || day < 1 || day > 31) return null;
  const date = new Date(year, month, day, 12);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day ? date : null;
}

export function activityDateKey(value: string): string {
  const date = parseActivityDate(value);
  if (!date) return 'undated';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
