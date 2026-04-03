# Backend assessment — wallet microservices

Monorepo with two NestJS gRPC microservices (**user-service**, **wallet-service**), shared **Protobuf** definitions, and **PostgreSQL** via **Prisma**.

## Structure

```
backend-assessment/
├── apps/
│   ├── user-service/     # gRPC UserService (port 50051)
│   └── wallet-service/   # gRPC WalletService (port 50052)
├── packages/
│   ├── proto/            # user.proto, wallet.proto
│   └── prisma/           # schema, migrations, generated client
├── docker-compose.yml
└── .env                  # create from .env.example
```

## Prerequisites

- Node.js 18+
- npm (workspaces)
- Docker (optional, for Postgres)
- Outbound HTTPS when first running `npx prisma generate` (Prisma downloads the query engine)


## Setup

1. **Start PostgreSSL**

   ```bash
   docker compose up -d
   ```

2. **Environment**

   Copy `.env.example` to `.env` at the repo root and adjust if needed.

3. **Install and generate Prisma client**

   ```bash
   npm install
   npm run db:generate
   ```

4. **Migrations**

   From the repo root (uses the `DATABASE_URL` in `.env`):

   ```bash
   cd packages/prisma && npx prisma migrate deploy && cd ../..
   ```

   For local development you can also run:

   ```bash
   npm run db:migrate
   ```

   This runs `prisma migrate dev` in the prisma workspace (you may be prompted for a migration name if the DB is empty and you prefer `dev` over `deploy`).

## Run services

Use **two terminals**. **Wallet** must be up before **User**, because creating a user automatically creates a wallet via gRPC.

**Terminal 1 — wallet-service**

```bash
npm run wallet:dev
```

**Terminal 2 — user-service**

```bash
npm run user:dev
```

Build all packages:

```bash
npm run build
```

## gRPC testing (grpcurl)

Install [grpcurl](https://github.com/fullstorydev/grpcurl). From the repository root:

### Create user

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto user.proto ^
  -d "{\"email\":\"alice@example.com\",\"name\":\"Alice\"}" ^
  127.0.0.1:50051 user.UserService/CreateUser
```

### Get user by ID

Replace `USER_ID` with the `id` from the create response.

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto user.proto ^
  -d "{\"id\":\"USER_ID\"}" ^
  127.0.0.1:50051 user.UserService/GetUserById
```

On macOS/Linux, replace `^` with `\` for line continuation.

### Create wallet (optional; users also get a wallet when created)

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto wallet.proto ^
  -d "{\"user_id\":\"USER_ID\"}" ^
  127.0.0.1:50052 wallet.WalletService/CreateWallet
```

### Get wallet

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto wallet.proto ^
  -d "{\"id\":\"WALLET_ID\"}" ^
  127.0.0.1:50052 wallet.WalletService/GetWallet
```

### Credit wallet

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto wallet.proto ^
  -d "{\"id\":\"WALLET_ID\",\"amount\":\"100.50\"}" ^
  127.0.0.1:50052 wallet.WalletService/CreditWallet
```

### Debit wallet

```bash
grpcurl -plaintext ^
  -import-path packages/proto/proto -proto wallet.proto ^
  -d "{\"id\":\"WALLET_ID\",\"amount\":\"25\"}" ^
  127.0.0.1:50052 wallet.WalletService/DebitWallet
```

## Behaviour notes

- **User → Wallet:** After `CreateUser`, user-service calls `WalletService.CreateWallet` so each user gets a wallet automatically.
- **Wallet → User:** `CreateWallet` calls `UserService.GetUserById` before persisting.
- **Debit:** Implemented with `prisma.$transaction` and returns **failed precondition** when balance is insufficient.
- **Validation:** Credit/debit amounts use `class-validator` (non-negative decimal strings).
- **Logging:** Structured logging via **nestjs-pino** (pretty output in non-production).

## Prisma commands (reference)

As required by the assessment:

```bash
cd packages/prisma
npx prisma migrate dev
npx prisma generate
```
