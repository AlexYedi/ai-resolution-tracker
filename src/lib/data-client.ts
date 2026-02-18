// Client-safe utilities (no server-only imports)

export function formatMinutes(minutes: number): string {
  if (minutes === 0) return "0 hrs";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs} hr${hrs !== 1 ? "s" : ""}`;
  return `${hrs}h ${mins}m`;
}
