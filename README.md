# Transaction Ledger

![License](https://img.shields.io/badge/license-MIT-blue)
![Node.js](https://img.shields.io/badge/node-v22-brightgreen)
![pnpm](https://img.shields.io/badge/pnpm-v9-blue)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Build Status](https://img.shields.io/github/actions/workflow/status/Kmario19/TransactionLedger/ci.yml)

A ledger application for managing bank account transactions, built with TypeScript and Express.js.

## Prerequisites

- Node.js v22
- pnpm v9
- MongoDB (can be run via Docker)

## Main Libraries

- [Express](https://expressjs.com/) - Web framework
- [Mongoose](https://mongoosejs.com/) - MongoDB object modeling
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express) - API documentation
- [Jest](https://jestjs.io/) - Testing framework
- [Biome](https://biomejs.dev/) - Code formatter and linter
- [tsup](https://github.com/egoist/tsup) - TypeScript bundler
- [Husky](https://typicode.github.io/husky/) - Git hooks management
- [tsx](https://github.com/esbuild-kit/tsx) - TypeScript execution environment

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

4. Run the database seed script to populate test data:

```bash
pnpm seed
```

## Docker Support

The project includes Docker configuration for containerized development and deployment:

```bash
# Start the application with Docker Compose
docker-compose up

# Build and run just the application container
docker build -t transaction-ledger . 
docker run -p 3000:3000 transaction-ledger
```

## API Documentation

The API is documented using Swagger. Once the server is running, you can access and test the API endpoints interactively through the Swagger UI interface. All API operations can be executed directly from the Swagger documentation page, making it easy to explore and verify the API functionality at:

```
http://localhost:<PORT>/docs
```

Replace `<PORT>` with the configured port in your `.env` file.

## Debugging with Visual Studio Code

To launch and debug the API using Visual Studio Code, follow these steps:

1. Open the project in Visual Studio Code.
2. Ensure that all dependencies are installed by running:

   ```bash
   pnpm install
   ```

3. Open the "Run and Debug" view in VS Code by clicking on the debug icon in the Activity Bar on the side of the window or pressing `Ctrl+Shift+D`.
4. Select the "Transaction Ledger API" configuration from the dropdown menu. This configuration is already set up in the `.vscode/launch.json` file to run the application using `pnpm dev`.
5. Click the green play button or press `F5` to start debugging.

This will launch the API in development mode, allowing you to set breakpoints, inspect variables, and step through the code.

## Deployment

The project uses GitHub Actions for CI/CD. The workflow builds, tests, and packages the application for release when tags are pushed.

