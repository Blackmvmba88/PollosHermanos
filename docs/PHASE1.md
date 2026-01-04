# Phase 1: API y Persistencia - Implementation Guide

## Overview

Phase 1 transforms PollosHermanos from a development prototype into a production-ready system with:
- PostgreSQL database persistence
- JWT-based authentication
- Role-based access control (RBAC)
- Comprehensive testing infrastructure

## What Has Been Implemented

### 1. Database Infrastructure ✅

#### PostgreSQL Schema
- Complete database schema with all tables
- Database enums for type safety
- Indexes for performance optimization
- Automatic timestamp triggers
- Foreign key relationships

**Tables Created:**
- `users` - User authentication and authorization
- `refresh_tokens` - JWT refresh token management
- `clientes` - Customer data
- `inventario` - Inventory management
- `pedidos` - Order management
- `pedido_items` - Order line items
- `rutas` - Delivery routes
- `paradas` - Route stops
- `transacciones_financieras` - Financial transactions

#### Database Connection
- Connection pooling with pg
- Transaction support
- Error handling
- Connection health checks
- Statistics monitoring

**Location:** `src/infrastructure/database/`

#### Migration System
- Schema creation script
- Migration CLI tool
- Seed data for admin user

**Usage:**
```bash
npm run migrate:up    # Create tables and seed data
npm run migrate:down  # Drop all tables
npm run migrate:reset # Reset database
```

### 2. Configuration Management ✅

#### Environment Variables
- Centralized configuration
- Environment-specific settings
- Validation on startup
- Type-safe access

**Configuration Files:**
- `.env` - Development environment (not committed)
- `.env.example` - Template for environment variables

**Configuration Categories:**
- Database settings (PostgreSQL)
- Redis settings
- Server configuration
- JWT secrets and expiration
- Rate limiting

**Location:** `src/infrastructure/config/Config.ts`

### 3. PostgreSQL Repositories ✅

Implemented production-ready repositories with PostgreSQL:

#### RepositorioPedidosPostgres ✅
- Complete CRUD operations
- Transaction support for orders with items
- Query by customer, status, route, date range
- Proper entity mapping

#### RepositorioInventarioPostgres ✅
- Inventory CRUD operations
- Stock level queries
- Expiration date tracking
- Reorder point detection

#### RepositorioClientesPostgres ✅
- Customer management
- Address handling
- Credit balance tracking
- Search by name, phone, status

**Location:** `src/infrastructure/persistence/`

### 4. Authentication System ✅

#### User Entity
- User ID, username, email
- Password hashing with bcrypt
- Role assignment
- Active/inactive status
- Last login tracking

**Location:** `src/domain/entities/User.ts`

#### ServicioAutenticacion
- User registration
- Login with JWT tokens
- Token refresh mechanism
- Logout (token invalidation)
- Password hashing (bcrypt)

**Key Features:**
- Access tokens (short-lived, 1 hour)
- Refresh tokens (long-lived, 7 days)
- Secure password storage
- Token verification

**Location:** `src/application/services/ServicioAutenticacion.ts`

#### Authentication Middleware
- JWT token verification
- User extraction from token
- Optional authentication support
- Error handling

**Location:** `src/infrastructure/api/middleware/auth.middleware.ts`

### 5. Authorization (RBAC) ✅

#### Roles Defined
- `ADMIN` - Full system access
- `GERENTE` - Management operations
- `VENDEDOR` - Sales operations
- `CONDUCTOR` - Delivery operations
- `CONTADOR` - Financial operations

#### Authorization Middleware
- Role-based access control
- Multiple role support
- Permission checking per endpoint

**Usage Example:**
```typescript
router.get('/admin', authMiddleware, requireRole(UserRole.ADMIN), (req, res) => {
  // Only admins can access
});
```

### 6. API Endpoints ✅

#### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate token
- `GET /api/auth/me` - Get current user info (protected)

**Location:** `src/infrastructure/api/routes/auth.routes.ts`

#### Existing API Routes
All existing endpoints remain functional:
- `/api/pedidos` - Orders management
- `/api/inventario` - Inventory management
- `/api/clientes` - Customers management
- `/api/rutas` - Delivery routes
- `/api/finanzas` - Financial transactions

### 7. Testing Infrastructure ✅

#### Jest Configuration
- TypeScript support with ts-jest
- Coverage thresholds (80%)
- Parallel test execution
- Source map support

#### Tests Created
- `Config.test.ts` - Configuration validation (3 tests)
- `Pedido.test.ts` - Order entity tests (4 tests)

**Current Coverage:**
- Tests passing: 7/7
- Test suites: 2 passed

**Location:** `tests/unit/`

**Run Tests:**
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### 8. Security Features ✅

#### Implemented
- Password hashing with bcrypt (10 salt rounds)
- JWT token signing and verification
- Secure token storage in database
- Token expiration
- Environment-based secrets

#### Pending
- Rate limiting
- Request validation/sanitization
- Security headers (helmet)
- Audit logging
- SQL injection prevention (parameterized queries already in place)

## Installation & Setup

### Prerequisites
- Node.js v14+
- PostgreSQL 12+
- Redis (optional for Phase 1.2)

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Create Database**
```sql
CREATE DATABASE polloshermanos;
```

4. **Run Migrations**
```bash
npm run migrate:up
```

This will:
- Create all tables
- Create indexes
- Create a default admin user (username: admin, password: admin123)

5. **Build Project**
```bash
npm run build
```

6. **Start API Server**
```bash
npm run api
```

The API will be available at `http://localhost:3000/api`

## Usage Examples

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "vendedor1",
    "email": "vendedor@example.com",
    "password": "securepassword",
    "nombre": "Juan Vendedor",
    "role": "VENDEDOR"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-admin-001",
      "username": "admin",
      "email": "admin@polloshermanos.com",
      "role": "ADMIN",
      "nombre": "Administrador"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "1h"
  }
}
```

### 3. Access Protected Endpoint

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Database Connection String

The system constructs the PostgreSQL connection string from environment variables:

```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Example:
```
postgresql://postgres:postgres@localhost:5432/polloshermanos
```

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Development Workflow

### 1. Make Changes
Edit TypeScript files in `src/`

### 2. Run Tests
```bash
npm test
```

### 3. Build
```bash
npm run build
```

### 4. Test API
```bash
npm run api
```

## Project Structure

```
src/
├── domain/                  # Domain layer (entities, interfaces)
│   ├── entities/
│   │   ├── User.ts         # User entity with roles
│   │   ├── Pedido.ts       # Order entity
│   │   ├── Cliente.ts      # Customer entity
│   │   └── ...
│   └── repositories/        # Repository interfaces
│       ├── IRepositorioPedidos.ts
│       └── ...
│
├── application/            # Application layer (services)
│   └── services/
│       ├── ServicioAutenticacion.ts  # Auth service
│       ├── ServicioPedidos.ts
│       └── ...
│
└── infrastructure/         # Infrastructure layer
    ├── config/
    │   └── Config.ts       # Environment configuration
    ├── database/
    │   ├── DatabaseConnection.ts  # PostgreSQL connection
    │   ├── schema.sql             # Database schema
    │   └── migrate.ts             # Migration tool
    ├── persistence/
    │   ├── RepositorioPedidosPostgres.ts
    │   ├── RepositorioInventarioPostgres.ts
    │   └── ...
    └── api/
        ├── middleware/
        │   └── auth.middleware.ts  # Auth middleware
        ├── routes/
        │   ├── auth.routes.ts      # Auth endpoints
        │   └── ...
        └── server.ts               # Express server
```

## Next Steps (Phase 1 Remaining)

### High Priority
1. **Complete PostgreSQL Repositories**
   - RepositorioRutasPostgres
   - RepositorioFinanzasPostgres

2. **Add Security Enhancements**
   - Rate limiting middleware
   - Request validation with express-validator
   - Security headers with helmet
   - Audit logging

3. **Expand Test Coverage**
   - Service unit tests
   - API integration tests
   - E2E tests for critical flows

4. **API Documentation**
   - Swagger/OpenAPI specification
   - Interactive API explorer

### Medium Priority
1. **Redis Caching Layer**
   - Cache frequently accessed data
   - Session management
   - Rate limit storage

2. **CI/CD Pipeline**
   - Automated testing
   - Build verification
   - Deployment automation

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Ensure PostgreSQL is running
2. Check connection details in `.env`
3. Verify database exists: `psql -l`

### JWT Token Issues

**Problem:** Token invalid or expired
```
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

**Solution:**
1. Use refresh token to get new access token
2. Login again if refresh token expired
3. Check JWT_SECRET in `.env`

### Migration Issues

**Problem:** Tables already exist
```
ERROR: relation "users" already exists
```

**Solution:**
```bash
npm run migrate:reset  # Drop and recreate all tables
```

## Security Considerations

### Production Deployment

1. **Change Default Secrets**
   - Update `JWT_SECRET` in `.env`
   - Update `JWT_REFRESH_SECRET` in `.env`
   - Never use development secrets in production

2. **Change Default Admin Password**
   - Login with admin/admin123
   - Change password immediately
   - Or delete and create new admin user

3. **Enable SSL**
   - Set `DB_SSL=true` in production `.env`
   - Use SSL certificates for database connection

4. **Use Environment Variables**
   - Never commit `.env` file
   - Use secure secret management in production
   - Consider using AWS Secrets Manager, Azure Key Vault, etc.

## Support

For issues or questions:
1. Check this documentation
2. Review test examples
3. Check API documentation
4. Open GitHub issue

---

**Phase 1 Status:** 🟡 In Progress (70% complete)
**Last Updated:** January 2025
