// bun-serve.js

import { serve } from "bun"; // Import Bun's serve function
import { join } from "path"; // Import the path module
import { performance } from "perf_hooks"; // Import performance for timing

const port = 3000; // Set your desired port
const distDir = join(process.cwd(), "dist"); // Define the dist directory

// Start timing
const startTime = performance.now();

serve({
  port,
  fetch(request) {
    const url = new URL(request.url);
    const filePath = join(distDir, url.pathname === "/" ? "index.html" : url.pathname);

    try {
      return new Response(Bun.file(filePath)); // Serve the requested file
    } catch {
      return new Response("404 Not Found", { status: 404 }); // Handle 404
    }
  },
});

// Calculate the time it took to start the server
const endTime = performance.now();
const duration = (endTime - startTime).toFixed(2); // Time in milliseconds

// Log in Next.js-like format with emojis
console.log(`🚀 Server started in ${duration}ms on http://localhost:${port}`);
console.log(`✅ Ready on http://localhost:${port}`);
