# Transaction Ledger

A ledger application for managing bank account transactions, built with TypeScript and Express.js.

## Prerequisites

- Node.js (version in `.node-version`)
- pnpm (package manager)
- MongoDB (can be run via Docker)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Copy the environment example file and configure as needed:

```bash
cp .env.example .env
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Run Jest tests in watch mode |
| `pnpm test:coverage` | Run Jest tests with coverage report |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code using Biome |
| `pnpm check` | Run Biome checks |
| `pnpm check:write` | Run Biome checks and fix issues where possible |
| `pnpm build` | Build the project using tsup |
| `pnpm dev` | Run the development server |
| `pnpm watch` | Run the server in watch mode (excludes test files) |
| `pnpm seed` | Seed the database with initial data |

## API Documentation

The API is documented using Swagger. Once the server is running, you can access the API documentation at:

```
http://localhost:<PORT>/docs
```

Replace `<PORT>` with the configured port in your `.env` file.

## Main Libraries

- [Express](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) - API documentation
- [Jest](https://jestjs.io/) - Testing framework
- [Biome](https://biomejs.dev/) - Code formatter and linter
- [tsup](https://github.com/egoist/tsup) - TypeScript bundler

## Docker Support

The project includes Docker configuration for containerized development and deployment:

```bash
# Start the application with Docker Compose
docker-compose up

# Build and run just the application container
docker build -t transaction-ledger .
docker run -p 3000:3000 transaction-ledger
```

## Project Structure

```
src/
├── app.ts            # Express application setup
├── index.ts          # Application entry point
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/           # Mongoose models
├── routes/           # API routes
├── seeds/            # Database seed scripts
└── types/            # TypeScript type definitions
```

## Deployment

The project uses GitHub Actions for CI/CD. The workflow builds, tests, and packages the application for release when tags are pushed.

