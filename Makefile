.PHONY: help backend frontend test clean install-backend install-frontend docker-build docker-up docker-down docker-logs

help:
	@echo "Password Manager - Available commands:"
	@echo "  make backend       - Run the Go backend server"
	@echo "  make frontend      - Run the React frontend dev server"
	@echo "  make install-backend - Install Go dependencies"
	@echo "  make install-frontend - Install frontend dependencies"
	@echo "  make test          - Run all tests"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make docker-build  - Build the Docker images"
	@echo "  make docker-up     - Start the app with Docker (http://localhost:5173)"
	@echo "  make docker-down   - Stop the Docker containers"
	@echo "  make docker-logs   - Follow the Docker container logs"

backend:
	cd backend && go run cmd/server/main.go

frontend:
	cd frontend && npm run dev

install-backend:
	cd backend && go mod tidy

install-frontend:
	cd frontend && npm install

test:
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	cd frontend && npm test

clean:
	cd backend && go clean
	cd frontend && rm -rf node_modules dist

docker-build:
	docker compose build

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
