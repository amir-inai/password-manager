# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (deterministic install from package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle.
# VITE_API_URL defaults to "/api" so the browser calls nginx on the same
# origin, which reverse-proxies to the backend (no CORS needed).
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
