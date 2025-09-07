// LucidSeal Assets Worker (patched)
// - Long cache for versioned filenames (-v1.2.3.)
// - Correct MIME for webmanifest, svg, etc.
// - HEAD/OPTIONS support (CORS/preflight)
// - ETag/304 handling
// - Content-Disposition inline for web media, attachment for docs
// - Simple aliases for brand/app manifest

const TYPES = {
  svg:"image/svg+xml", png:"image/png", jpg:"image/jpeg", jpeg:"image/jpeg",
  webp:"image/webp", ico:"image/x-icon",
  json:"application/json; charset=utf-8",
  md:"text/markdown; charset=utf-8", txt:"text/plain; charset=utf-8",
  webmanifest:"application/manifest+json",
  html:"text/html; charset=utf-8", css:"text/css; charset=utf-8", js:"text/javascript; charset=utf-8",
  pdf:"application/pdf",
  docx:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx:"application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv:"text/csv; charset=utf-8"
};

// Lock this down to your sites; or swap to "*" if you want fully public CORS
const ALLOWED_ORIGINS = new Set([
  "https://lucidseal.org",
  "https://www.lucidseal.org",
  "https://assets.lucidseal.org"
]);

const isVersioned = (key) => /-v\\d+(?:\\.\\d+)*\\./i.test(key);
const guessMime = (key) => TYPES[key.split(".").pop()?.toLowerCase()];

function contentDisposition(key) {
  const filename = key.split("/").pop() || "download";
  const ext = filename.split(".").pop()?.toLowerCase();
  const inline = new Set(["pdf","svg","png","jpg","jpeg","webp","ico","webmanifest","html","css","js"]).has(ext);
  return `${inline ? "inline" : "attachment"}; filename="${filename.replace(/[\\r\\n"]/g,"_")}"`;
}

function corsHeaders(req) {
  const h = new Headers({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cross-Origin-Resource-Policy": "cross-origin"
  });
  const origin = req.headers.get("Origin");
  if (!origin) return h;
  if (ALLOWED_ORIGINS.has(origin)) {
    h.set("Access-Control-Allow-Origin", origin);
    h.set("Vary", "Origin");
  }
  return h;
}

export default {
  async fetch(request, env) {
    // OPTIONS: CORS preflight
    if (request.method === "OPTIONS") {
      const h = corsHeaders(request);
      h.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      h.set("Access-Control-Allow-Headers", "Content-Type, If-None-Match");
      return new Response(null, { status: 204, headers: h });
    }

    const url = new URL(request.url);
    let key = url.pathname.replace(/^\/+/, "");
//            ^^^^^  single slash escaped inside a JS regex literal


    // Health & root
    if (url.pathname === "/health") {
      return new Response("ok", { status: 200, headers: corsHeaders(request) });
    }
    if (url.pathname === "/") {
      const h = corsHeaders(request);
      h.set("Content-Type", "application/json; charset=utf-8");
      return new Response(JSON.stringify({ ok: true, service: "lucidseal-assets" }), { status: 200, headers: h });
    }

    // Friendly alias for manifest
    if (url.pathname === "/manifest.webmanifest") key = "brand/app/manifest.webmanifest";

    // Default routing: if path doesn't start with public/ or brand/, serve from public/
    if (!key.startsWith("public/") && !key.startsWith("brand/")) {
      key = `public/${key}`;
    }

    // Fetch from R2
    const obj = await env.ASSETS_BUCKET.get(key);
    if (!obj) {
      const h = corsHeaders(request);
      h.set("Cache-Control", "no-store");
      return new Response("Not found", { status: 404, headers: h });
    }

    const ct = guessMime(key) || obj.httpMetadata?.contentType || "application/octet-stream";
    const headers = corsHeaders(request);
    headers.set("Content-Type", ct);
    headers.set("Content-Length", obj.size.toString());
    headers.set("Content-Disposition", contentDisposition(key));
    headers.set("Cache-Control", isVersioned(key) ? "public, max-age=31536000, immutable" : "public, max-age=3600");
    if (obj.httpEtag) headers.set("ETag", obj.httpEtag);

    // Conditional GET (304)
    const inm = request.headers.get("If-None-Match");
    if (inm && obj.httpEtag && inm.replace(/W\\//, "") === obj.httpEtag.replace(/W\\//, "")) {
      return new Response(null, { status: 304, headers });
    }

    if (request.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }

    return new Response(obj.body, { status: 200, headers });
  }
};
