# Frontend Application

This is the frontend part of the monorepo application, built with React, TypeScript, and Vite. It communicates with the backend via tRPC.

## Development

### Prerequisites

- Node.js 18.x or later
- pnpm

### Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

This application is deployed using AWS Amplify for the frontend and AWS Lambda for the backend API.

### Prerequisites

- AWS Account with Amplify and Lambda services enabled
- GitHub repository connected to Amplify
- PostgreSQL database (RDS)

### Deployment Steps

1. **Initialize Amplify Project**:
   - In the AWS Amplify Console, create a new app.
   - Connect your GitHub repository.
   - Set the app root directory to `web/`.

2. **Configure Build Settings**:
   - Amplify uses the `amplify.yml` file in the `web/` directory for build configuration.
   - This handles building both frontend and backend.

3. **Set Environment Variables**:
   In Amplify Console > App Settings > Environment variables:
   - `VITE_API_URL`: API Gateway endpoint URL (provided by Amplify after backend deployment)
   - `VITE_APP_ENV`: Environment (e.g., production)
   - Backend environment variables (for Lambda):
     - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SCHEMA`, `NODE_ENV`, `FRONTEND_URL`

4. **Database Setup**:
   - Provision an RDS PostgreSQL instance.
   - Run database migrations if needed.

5. **Deploy**:
   - Push to the main branch to trigger automatic deployment via Amplify.
   - Monitor deployment in Amplify Console.

### CI/CD

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes and pull requests to the main branch, performing:
- Type checking
- Linting
- Building the application

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- tRPC for API communication
- React Hook Form for forms
- TanStack Query for data fetching

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
