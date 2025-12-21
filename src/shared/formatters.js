export function formatUtilization(value) {
  if (value == null) return 'N/A';
  return `${value}%`;
}
