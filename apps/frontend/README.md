# Frontend Application

A simple frontend that will display in a interactive way the bots and its dependencies

## Project Structure

- **`src/components`**: Reusable UI components (BotCard, WorkerCard, LogList, etc.).
- **`src/pages`**: Top-level page components (Application).
- **`src/services`**: API clients and service layers.
- **`src/hooks`**: Custom React hooks (usePagination, useAccordion).
- **`src/configuration`**: As I told you I like this way to fail early.
- **`tests`**: Unit (Vitest) and End-to-End (Playwright) tests.

## Project Scripts

- **`npm run dev`**: Starts the Vite development server.
- **`npm run build`**: Builds the production-ready application.
- **`npm run test:unit`**: Runs unit tests using `vitest`.
- **`npm run test:e2e`**: Runs end-to-end tests using `@playwright/test`.
- **`npm run lint`**: Runs ESLint.
- **`npm run preview`**: Previews the built application.

## Local Setup

1.  **Install Dependencies**:
    Ensure root dependencies are installed and the shared package is built.

    ```bash
    npm install # Within the base dir of the project
    npm run npm:install # It will install all the project dependencies
    npm run build --prefix packages/shared # Shared package, nothing new so far
    ```

2.  **Run Locally**:
    ```bash
    npm run dev --prefix apps/frontend
    ```
    The application will be available at `http://localhost:5173`.
    _Ensure the backend is running on `http://localhost:3001`._

## Requirements

- **Node.js**: v22+
- **npm**: v10+
- **Backend Service**: Must be running for full functionality.
