# Stage 1: Build the Vite app with Bun
FROM oven/bun:1 AS build
WORKDIR /client

# Copy package.json and lockfile for dependency installation
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all files
COPY . .

# Build Vite app
RUN bun run build



# Stage 2: Serve using Bun (no NGINX)
FROM oven/bun:1 AS prod
WORKDIR /client

# Copy built frontend
COPY --from=build /client/dist ./dist

# Create Bun static file server INSIDE the Dockerfile
RUN printf "import { serve } from 'bun';\n\
import { file } from 'bun';\n\
\n\
serve({\n\
  port: 80,\n\
  async fetch(req) {\n\
    const url = new URL(req.url);\n\
    const path = './dist' + (url.pathname === '/' ? '/index.html' : url.pathname);\n\
\n\
    try {\n\
      return new Response(file(path));\n\
    } catch {\n\
      return new Response(file('./dist/index.html'));\n\
    }\n\
  }\n\
});\n" > server.js

EXPOSE 80

CMD ["bun", "server.js"]
