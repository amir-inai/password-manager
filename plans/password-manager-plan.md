# Password Manager - Implementation Plan

## Project Overview

A secure password manager built with Go (backend) and React (frontend) using SQLite for storage and AES-256-GCM encryption.

## Tech Stack

### Backend

- **Language**: Go 1.21+
- **Framework**: Gin (HTTP router)
- **Database**: SQLite with GORM
- **Encryption**: AES-256-GCM
- **Key Derivation**: Argon2id
- **Architecture**: REST API

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: React Context + useReducer
- **Styling**: CSS Modules or Tailwind CSS

## Architecture

```
password-manager/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── database/
│   │   │   └── db.go
│   │   ├── encryption/
│   │   │   └── crypto.go
│   │   ├── handlers/
│   │   │   ├── auth.go
│   │   │   ├── passwords.go
│   │   │   └── generator.go
│   │   ├── models/
│   │   │   └── password.go
│   │   └── middleware/
│   │       └── auth.go
│   ├── migrations/
│   │   └── 001_initial.up.sql
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PasswordList.tsx
│   │   │   ├── PasswordForm.tsx
│   │   │   ├── PasswordGenerator.tsx
│   │   │   └── MasterPassword.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── docker-compose.yml
├── Makefile
└── README.md
```

## Database Schema

### Table: vault_entries

```sql
CREATE TABLE vault_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    username TEXT NOT NULL,
    encrypted_password BLOB NOT NULL,
    encrypted_url TEXT,
    encrypted_notes TEXT,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: vault_meta

```sql
CREATE TABLE vault_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
-- Stores: salt, nonce for master password verification
```

## Security Design

### Encryption Flow

1. User enters master password
2. Argon2id derives a 32-byte key from master password + salt
3. AES-256-GCM encrypts/decrypts password data
4. Each password entry has its own nonce
5. Master password is never stored

### API Security

- All endpoints (except unlock) require valid session
- Session stored in memory (server-side)
- CORS configured for frontend origin
- Rate limiting on unlock endpoint

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

## Implementation Steps

### Phase 1: Backend Foundation

1. Initialize Go module and project structure
2. Set up Gin router and middleware
3. Configure SQLite database with GORM
4. Create database models and migrations
5. Implement encryption utilities (Argon2id + AES-256-GCM)

### Phase 2: Backend API

1. Implement unlock/lock endpoints
2. Implement CRUD endpoints for passwords
3. Implement password generator endpoint
4. Add authentication middleware
5. Add CORS and error handling

### Phase 3: Frontend Foundation

1. Initialize React + Vite + TypeScript project
2. Set up project structure and routing
3. Create API service layer
4. Implement authentication context

### Phase 4: Frontend UI

1. Build MasterPassword component (unlock screen)
2. Build PasswordList component (display passwords)
3. Build PasswordForm component (add/edit)
4. Build PasswordGenerator component
5. Style the application

### Phase 5: Integration & Testing

1. Connect frontend to backend API
2. Test full CRUD flow
3. Test encryption/decryption
4. Test password generator
5. Add error handling and loading states

### Phase 6: Polish

1. Add README documentation
2. Add Makefile for easy setup
3. Add Docker configuration (optional)
4. Code review and cleanup

## Key Libraries

### Backend (go.mod)

```
github.com/gin-gonic/gin v1.9.1
gorm.io/gorm v1.25.4
gorm.io/driver/sqlite v1.5.4
golang.org/x/crypto v0.17.0
github.com/spf13/viper v1.17.0
```

### Frontend (package.json)

```
react: ^18.2.0
react-dom: ^18.2.0
typescript: ^5.2.0
vite: ^5.0.0
axios: ^1.6.0
```

## Security Considerations

- Master password never transmitted or stored
- All sensitive data encrypted at rest
- Session stored in server memory (lost on restart)
- Argon2id with memory-hard parameters for key derivation
- AES-256-GCM for authenticated encryption
- CORS restricted to frontend origin
- Rate limiting on authentication endpoints
