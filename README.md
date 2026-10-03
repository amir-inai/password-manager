# Password Manager

A secure, open-source password manager built with Go (backend) and React (frontend). All sensitive data is encrypted at rest using AES-256-GCM encryption with Argon2id key derivation.

## Features

- **Master Password Authentication**: Single master password to unlock your vault
- **End-to-End Encryption**: All passwords encrypted with AES-256-GCM
- **Secure Key Derivation**: Argon2id for master password hashing
- **CRUD Operations**: Add, view, edit, and delete passwords
- **Password Generator**: Generate strong random passwords
- **Search & Filter**: Quickly find passwords
- **Categories**: Organize passwords by category
- **Responsive UI**: Clean, modern interface

## Tech Stack

### Backend

- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: SQLite with GORM
- **Encryption**: AES-256-GCM + Argon2id

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: React Context

## Project Structure

```
password-manager/
├── backend/
│   ├── cmd/server/          # Application entry point
│   ├── internal/
│   │   ├── config/          # Configuration management
│   │   ├── database/        # Database connection & migrations
│   │   ├── encryption/      # AES-256-GCM encryption service
│   │   ├── handlers/        # HTTP request handlers
│   │   ├── models/          # Data models
│   │   └── middleware/      # Authentication middleware
│   └── migrations/          # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React Context for auth state
│   │   └── services/        # API service layer
│   └── package.json
├── Makefile
└── README.md
```

## Security Architecture

### Encryption Flow

1. User enters master password
2. Argon2id derives a 32-byte encryption key from master password + salt
3. AES-256-GCM encrypts/decrypts all password data
4. Each password entry has its own unique nonce
5. Master password is never stored or transmitted

### API Security

- All endpoints (except unlock) require valid session
- Session stored in server memory (lost on restart)
- CORS restricted to frontend origin
- Rate limiting on unlock endpoint

## Getting Started

### Prerequisites

- Go 1.21 or higher
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/amir-inai/password-manager.git
cd password-manager
```

2. Install backend dependencies:

```bash
cd backend
go mod tidy
cd ..
```

3. Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### Running the Application

#### Option 1: Using the startup script (Windows)

Double-click `scripts/start.bat` or run it from Command Prompt:

```cmd
scripts\start.bat
```

#### Option 2: Using PowerShell

```powershell
.\scripts\start.ps1
```

#### Option 3: Manual start (all platforms)

**Terminal 1 - Start Backend:**

```bash
cd backend
go run cmd/server/main.go
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

#### Option 4: Docker (recommended)

Docker runs the production build: the React app is served by nginx, which
reverse-proxies `/api` to the Go backend. The SQLite vault is stored in a
Docker named volume so it survives rebuilds.

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2).

```bash
# Build and start both services (backend + frontend)
docker compose up --build
```

Then open `http://localhost:5173`.

Useful commands:

```bash
docker compose up -d --build   # start in the background
docker compose logs -f         # follow logs
docker compose down            # stop containers (vault data is kept)
docker compose down -v         # stop AND delete the vault volume
```

Or via `make`:

```bash
make docker-up     # start (http://localhost:5173)
make docker-logs   # follow logs
make docker-down   # stop
```

**Notes:**

- Only the frontend port (`5173`) is published; the backend stays on the
  internal Docker network and is reachable through nginx at `/api`.
- The vault database is persisted in the `vault-data` volume at `/data/vault.db`.
- To point the frontend at a different API base, override the build arg:
  `docker compose build --build-arg VITE_API_URL=/api frontend`.

### First Time Setup

When you first open the application, you'll be prompted to create a master password. This password will be used to encrypt all your data. **Make sure to remember it** - there's no way to recover your data if you forget it!

## API Endpoints

| Method | Endpoint           | Description                       | Auth |
| ------ | ------------------ | --------------------------------- | ---- |
| POST   | /api/unlock        | Unlock vault with master password | No   |
| POST   | /api/lock          | Lock the vault                    | Yes  |
| GET    | /api/passwords     | List all passwords                | Yes  |
| POST   | /api/passwords     | Add new password                  | Yes  |
| PUT    | /api/passwords/:id | Update password                   | Yes  |
| DELETE | /api/passwords/:id | Delete password                   | Yes  |
| POST   | /api/generate      | Generate random password          | Yes  |
| GET    | /api/health        | Health check                      | No   |

## Environment Variables

### Backend

- `SERVER_ADDRESS`: Server address (default: `:8080`)
- `DATABASE_PATH`: SQLite database file path (default: `./vault.db`)
- `FRONTEND_ORIGIN`: Frontend origin for CORS (default: `http://localhost:5173`)

### Frontend

- `VITE_API_URL`: Backend API URL (default: `http://localhost:8080/api`)

## Development

### Running Tests

```bash
make test
```

### Building for Production

```bash
# Build backend
cd backend
go build -o bin/server cmd/server/main.go

# Build frontend
cd frontend
npm run build
```

## Security Considerations

- **Master Password**: Never stored or transmitted. Used only for key derivation.
- **Encryption at Rest**: All sensitive data encrypted with AES-256-GCM.
- **Key Derivation**: Argon2id with memory-hard parameters (64MB memory, 3 iterations).
- **Session Management**: Server-side sessions stored in memory (lost on restart).
- **CORS**: Restricted to configured frontend origin.
- **Rate Limiting**: Recommended for production deployment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This password manager is provided as-is for educational and personal use. Always follow security best practices and consider using established, audited password managers for production use.
