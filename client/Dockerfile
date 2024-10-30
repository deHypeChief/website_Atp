# Stage 1: Build the Vite app with Bun
FROM oven/bun:1 AS build
WORKDIR /client

# Copy package.json and bun.lockb to install dependencies
COPY package.json bun.lockb ./

# Install dependencies with Bun
RUN bun install --frozen-lockfile

# Copy all project files
COPY . .

# Build the Vite app for production~~
RUN bun run build

# Stage 2: Serve the built app with NGINX
FROM nginx:alpine
COPY --from=build /client/dist /usr/share/nginx/html

# Expose the default NGINX port
EXPOSE 80
