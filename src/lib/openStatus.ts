export function isRestaurantOpen(
  openingTime: string | null,
  closingTime: string | null,
  timezone: string
): boolean {
  // No hours configured yet — don't tell customers a restaurant is closed
  // when the owner simply hasn't filled this in.
  if (!openingTime || !closingTime) return true;

  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const nowMinutes = hh * 60 + mm;

    const [openH, openM] = openingTime.split(":").map(Number);
    const [closeH, closeM] = closingTime.split(":").map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (closeMinutes > openMinutes) {
      return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
    }
    // Overnight hours, e.g. 18:00 - 02:00
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  } catch {
    return true;
  }
}

export function formatHours(openingTime: string | null, closingTime: string | null): string | null {
  if (!openingTime || !closingTime) return null;
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  return `${fmt(openingTime)} - ${fmt(closingTime)}`;
}
