export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === "/health") {
      return new Response("ok", { status: 200 });
    }

    if (pathname === "/manifest.json") {
      const obj = await env.ASSETS_BUCKET.get("manifest.json");
      if (!obj) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
      return withCommonHeaders(new Response(await obj.text(), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }), request);
    }

    const key = pathname.replace(/^\/+/, "");
    if (!key) {
      // Root: simple JSON to confirm service
      return withCommonHeaders(new Response(JSON.stringify({ ok: true, service: "lucidseal-assets" }), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }), request);
    }

    const obj = await env.ASSETS_BUCKET.get(key);
    if (!obj) return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

    const contentType = guessMime(key) || obj.httpMetadata?.contentType || "application/octet-stream";
    const disp = contentDisposition(key);

    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", obj.size.toString());
    headers.set("Content-Disposition", disp);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("Cache-Control", cacheControl(pathname));

    // CORS: allow only LucidSeal domains by default
    const origin = request.headers.get("Origin");
    const allowList = new Set(["https://lucidseal.org", "https://www.lucidseal.org", "https://assets.lucidseal.org"]);
    if (origin && allowList.has(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Vary", "Origin");
    }

    return withCommonHeaders(new Response(obj.body, { status: 200, headers }), request);
  }
};

function withCommonHeaders(response, request) {
  // Add/adjust shared headers here if needed
  return response;
}

function cacheControl(pathname) {
  if (pathname === "/manifest.json") return "public, max-age=60, s-maxage=600";
  return "public, max-age=600, s-maxage=86400";
}

function guessMime(key) {
  const ext = key.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "csv": return "text/csv; charset=utf-8";
    case "json": return "application/json; charset=utf-8";
    case "md": return "text/markdown; charset=utf-8";
    case "txt": return "text/plain; charset=utf-8";
    case "svg": return "image/svg+xml";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    default: return undefined;
  }
}

function contentDisposition(key) {
  const filename = key.split("/").pop() || "download";
  const ext = filename.split(".").pop()?.toLowerCase();
  const inlineTypes = new Set(["pdf", "svg", "png", "jpg", "jpeg"]);
  const type = inlineTypes.has(ext) ? "inline" : "attachment";
  return `${type}; filename="${sanitizeFilename(filename)}"`;
}

function sanitizeFilename(name) {
  return name.replace(/[\r\n"]/g, "_");
}
