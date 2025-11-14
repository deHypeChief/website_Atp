# Stage 1: Build the Vite app
FROM oven/bun:1 AS build
WORKDIR /admin

# Install deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build app
COPY . .
RUN bun run build



# Stage 2: Serve with Bun (NO nginx)
FROM oven/bun:1 AS prod
WORKDIR /admin

# Copy built frontend
COPY --from=build /admin/dist ./dist

# Create a Bun static server directly in the Dockerfile
RUN printf "import { serve } from 'bun';\n\
import { file } from 'bun';\n\
serve({\n\
  port: 3000,\n\
  async fetch(req) {\n\
    const url = new URL(req.url);\n\
    try {\n\
      return new Response(file('./dist' + url.pathname));\n\
    } catch {\n\
      return new Response(file('./dist/index.html'));\n\
    }\n\
  }\n\
});\n" > server.js

EXPOSE 3000

CMD ["bun", "server.js"]
