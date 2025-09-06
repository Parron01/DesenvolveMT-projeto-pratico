export function formatDateISO(input: string) {
  // accepts dd/mm/yyyy and returns yyyy-MM-dd; if already iso, return as is
  if (!input) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const m = input.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

export function isValidISODate(value?: string) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
