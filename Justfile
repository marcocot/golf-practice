set dotenv-load := false

# List available recipes
default:
    @just --list

# Install all workspace dependencies
install:
    pnpm install

# Start the dev infra (Postgres + Mailpit)
up:
    docker compose up -d db mailpit

# Stop the dev infra
down:
    docker compose down

# Run the full dev stack in Docker (db, mailpit, api, web) with hot reload
dev:
    docker compose up --build

# Follow logs of the dev stack
logs:
    docker compose logs -f

# Run the dev stack hybrid: infra in Docker, api + web on the host
dev-local: up
    pnpm --parallel --filter "./apps/*" dev

# Run only the API on the host in watch mode
dev-api: up
    pnpm --filter @golf/api dev

# Run only the web app on the host
dev-web:
    pnpm --filter @golf/web dev

# Create/apply a dev migration (prompts for a name)
migrate name="dev": up
    pnpm --filter @golf/api exec prisma migrate dev --name {{name}}

# Apply pending migrations without generating new ones
migrate-deploy: up
    pnpm --filter @golf/api exec prisma migrate deploy

# Regenerate the Prisma client
generate:
    pnpm --filter @golf/api exec prisma generate

# Open Prisma Studio against the dev database
studio: up
    pnpm --filter @golf/api exec prisma studio

# Run every test suite (api unit + web)
test:
    pnpm -r test

# API unit tests with coverage
test-api:
    pnpm --filter @golf/api test

# API end-to-end tests (needs the database)
e2e: up
    pnpm --filter @golf/api test:e2e

# Web tests with coverage
test-web:
    pnpm --filter @golf/web test

# Lint everything
lint:
    pnpm -r lint

# Type-check the web app
typecheck:
    pnpm --filter @golf/web typecheck

# Build both apps
build:
    pnpm -r build

# Format the repo with Prettier
format:
    pnpm format

# Run lint + tests + build, the way CI would
check: lint test build

# Build and start the full production stack in Docker
prod-up:
    docker compose -f docker-compose.prod.yml up -d --build

# Stop the production stack
prod-down:
    docker compose -f docker-compose.prod.yml down

# Follow logs of the production stack
prod-logs:
    docker compose -f docker-compose.prod.yml logs -f

# Remove build output, coverage and node_modules
clean:
    rm -rf node_modules apps/*/node_modules apps/*/dist apps/web/dev-dist apps/*/coverage
