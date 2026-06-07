set dotenv-load := false

# List available recipes
default:
    @just --list

# Install all workspace dependencies
install:
    pnpm install

# Start the whole stack in Docker (db, mailpit, api, web), detached
up:
    docker compose up -d --build

# Stop and remove the stack
down:
    docker compose down

# Start only the infra (Postgres + Mailpit), detached
infra:
    docker compose up -d db mailpit

# Run the whole stack in Docker in the foreground with logs and hot reload
dev:
    docker compose up --build

# Follow the stack logs
logs:
    docker compose logs -f

# Run hybrid: infra in Docker, api + web on the host
dev-local: infra
    pnpm --parallel --filter "./apps/*" dev

# Run only the API on the host in watch mode
dev-api: infra
    pnpm --filter @golf/api dev

# Run only the web app on the host
dev-web:
    pnpm --filter @golf/web dev

# Create/apply a dev migration (prompts for a name)
migrate name="dev": infra
    pnpm --filter @golf/api exec prisma migrate dev --name {{name}}

# Apply pending migrations without generating new ones
migrate-deploy: infra
    pnpm --filter @golf/api exec prisma migrate deploy

# Regenerate the Prisma client
generate:
    pnpm --filter @golf/api exec prisma generate

# Open Prisma Studio against the dev database
studio: infra
    pnpm --filter @golf/api exec prisma studio

# Run every test suite (api unit + web)
test:
    pnpm -r test

# API unit tests with coverage
test-api:
    pnpm --filter @golf/api test

# API end-to-end tests (needs the database)
e2e: infra
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
