# Backend Service

This backend application will handle the bot data for the frontend application render it properly

## Project Structure

The project follows a standard layered architecture:

- **`src/configuration`**: I like this because if we forget to set the .envs in the project, it fails at application boot
- **`src/controllers`**: Request handlers (Controllers) that define route logic. Nothing new here.
- **`src/services`**: Somewaht a business logic layer.
- **`src/models`**: Data models and interfaces (imported from `@packages/shared`). I tried to make this "mongodb" like.
- **`src/middlewares`**: Express middlewares for error handling, logging, etc. Again everything that we already know.
- **`src/utils`**: Utility functions, including the file-based DataStore.
- **`tests`**: Unit and Integration tests.

## Project Scripts

- **`npm run dev`**: Starts the application in development mode with `nodemon` for hot-reloading.
- **`npm run build`**: Compiles the TypeScript code to JavaScript.
- **`npm run test:unit`**: Runs unit tests using `vitest`. Vitest > Jest.
- **`npm run test:integration`**: Runs integration tests using `vitest`.
- **`npm run lint`**: Runs ESLint to check for code quality issues.
- **`npm run lint:fix`**: Runs ESLint and automatically fixes fixable issues.

## Local Setup

1.  **Install Dependencies**:
    Navigate to the root and install dependencies (including building the shared package).

    ```bash
    npm install # Within the base dir of the project 
    npm run npm:install # Installs all workspace dependencies
    npm run build --prefix packages/shared # Backend depends on this
    ```

2.  **Environment Variables**:
    Copy `.env.default` to `.env` (optional, defaults are provided).

    ```bash
    cp apps/backend/.env.default apps/backend/.env
    ```

3.  **Run Locally**:
    ```bash
    npm run dev --prefix apps/backend
    ```

## Requirements

- **Node.js**: v22+
- **npm**: v10+
- **Docker**: (Optional) For running via Docker Compose.

## Routes

### Bot Management

- **`GET /bots`**: List all bots (paginated).
- **`GET /bots/:id`**: Get a specific bot by ID.
- **`GET /bots/:id/workers`**: List workers for a specific bot.
- **`GET /bots/:id/logs`**: List logs for a specific bot.
- **`GET /bots/:id/workers/:wid/logs`**: List logs for a specific worker.

### Health Check

- **`GET /health`**: Health check endpoint. Returns `200 OK` or `503 Service Unavailable` if shutting down.
  - _Note: In Docker, this service runs on the main API port._

### Documentation

- **`GET /docs`**: Swagger UI documentation.
