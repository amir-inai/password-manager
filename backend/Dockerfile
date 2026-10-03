# ---- Build stage ----
FROM golang:1.25-alpine AS builder

WORKDIR /src

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build the static binary
# CGO is disabled because glebarez/sqlite (modernc.org/sqlite) is pure Go.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/server ./cmd/server

# ---- Runtime stage ----
FROM alpine:3.20

# Run as a non-root user and prepare the data directory for the SQLite vault
RUN adduser -D -u 10001 app && mkdir -p /data && chown app:app /data

WORKDIR /app
COPY --from=builder /out/server /app/server

USER app

EXPOSE 8080

ENV SERVER_ADDRESS=":8080" \
    DATABASE_PATH="/data/vault.db" \
    FRONTEND_ORIGIN="http://localhost:5173"

ENTRYPOINT ["/app/server"]
