export async function getTimezone(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://timeapi.io/api/timezone/coordinate?latitude=${lat}&longitude=${lng}`,
    );
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (typeof data.timeZone === 'string') return data.timeZone;
    throw new Error();
  } catch {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}
