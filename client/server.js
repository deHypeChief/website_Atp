import { serve } from "bun";
import { statSync, readFileSync } from "fs";
import { resolve, join, extname } from "path";

// Configuration
const DIST_PATH = resolve("./dist");
const INDEX_HTML = readFileSync(join(DIST_PATH, "index.html"));
const PORT = process.env.PORT || 3000;

// Helper to check if file exists
const fileExists = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

// Helper to determine MIME type
const getMimeType = (filePath) => {
  const ext = extname(filePath);
  switch (ext) {
    case '.js': return 'application/javascript';
    case '.css': return 'text/css';
    case '.html': return 'text/html';
    case '.json': return 'application/json';
    case '.png': return 'image/png';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    default: return 'application/octet-stream'; // Fallback
  }
}

console.log(`🚀 Server starting...`);
console.log(`📂 Serving files from: ${DIST_PATH}`);

// Server configuration
serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    const filePath = join(DIST_PATH, url.pathname);
    const timestamp = new Date().toLocaleTimeString();

    // Try to serve static file
    if (fileExists(filePath)) {
      const mimeType = getMimeType(filePath);
      console.log(`[${timestamp}] 📁 Serving static file: ${url.pathname}`);
      return new Response(readFileSync(filePath), {
        headers: {
          "Content-Type": mimeType,
        },
      });
    }

    // Serve index.html for client-side routing
    console.log(`[${timestamp}] 🔄 Serving index.html for: ${url.pathname}`);
    return new Response(INDEX_HTML, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});

console.log(`\n🌐 Server running at http://localhost:${PORT}`);
console.log(`👉 Press Ctrl+C to stop\n`);
