type SheetResult = { ok: true; mocked?: boolean } | { ok: false; error: string };

/**
 * Sends a payload to the Google Apps Script web app bound to the sheet.
 * Apps Script answers a POST with a 302 to googleusercontent.com; fetch follows
 * it and returns the script's JSON output.
 */
export async function sendToSheet(payload: Record<string, unknown>): Promise<SheetResult> {
  const url = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET || "";

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[sheets] GOOGLE_SCRIPT_URL not set — logging instead:", payload);
      return { ok: true, mocked: true };
    }
    return { ok: false, error: "Registration storage is not configured." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  try {
    const res = await fetch(url, {
      method: "POST",
      // text/plain avoids a CORS preflight-style rejection inside Apps Script.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, secret }),
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
    const text = await res.text();
    let data: { ok?: boolean; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      return { ok: false, error: "The sheet returned an unexpected response. Check the Apps Script deployment." };
    }
    if (!res.ok || !data.ok) return { ok: false, error: data.error || `Sheet error (${res.status}).` };
    return { ok: true };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return { ok: false, error: aborted ? "The sheet took too long to respond." : "Could not reach the sheet." };
  } finally {
    clearTimeout(timer);
  }
}
