# AWS Amplify and Lambda Deployment Plan for Monorepo

## Overview
This plan outlines the configuration for deploying the monorepo application using AWS Amplify for the frontend and AWS Lambda for the backend API. The monorepo uses pnpm for package management, with separate frontend (React/Vite) and backend (Express/tRPC) applications.

## Monorepo Structure Analysis
- **Root Directory**: `web/`
- **Frontend App**: `web/apps/frontend/` (Vite React application)
- **Backend App**: `web/apps/backend/` (Express server with tRPC)
- **Package Manager**: pnpm with workspace configuration

## Amplify Configuration

### Base Directories
- **Frontend**: `web/apps/frontend`
- **Backend**: `web/apps/backend`

### Build Settings

#### Frontend Build
- **Build Command**: `cd web/apps/frontend && pnpm install && pnpm build`
- **Build Output Directory**: `dist` (default Vite output)
- **Node Version**: 18.x or later (based on dependencies)

#### Backend Build (Lambda Functions)
- **Build Command**: `cd web/apps/backend && pnpm install && pnpm build`
- **Build Output Directory**: `dist`
- **Runtime**: Node.js 18.x
- **Handler**: `dist/server.handler` (requires adaptation for Lambda)

### amplify.yml Configuration
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - cd web/apps/frontend
            - pnpm install
        build:
          commands:
            - cd web/apps/frontend
            - pnpm build
      artifacts:
        baseDirectory: web/apps/frontend/dist
        files:
          - '**/*'
      cache:
        paths:
          - web/apps/frontend/node_modules/**/*
    backend:
      phases:
        preBuild:
          commands:
            - cd web/apps/backend
            - pnpm install
        build:
          commands:
            - cd web/apps/backend
            - pnpm build
      artifacts:
        baseDirectory: web/apps/backend/dist
        files:
          - '**/*'
      cache:
        paths:
          - web/apps/backend/node_modules/**/*
```

## Backend Adaptation for Lambda

### Current Architecture
- Express server with tRPC middleware
- Single server.ts entry point
- Database connection via Drizzle ORM

### Required Changes for Lambda
1. **Convert to Serverless Functions**: Split Express routes into individual Lambda functions
2. **API Gateway Integration**: Use AWS API Gateway to route requests to Lambda functions
3. **Database Connection**: Ensure connection pooling for serverless environment
4. **Handler Function**: Create a Lambda handler that wraps the tRPC router

### Proposed Lambda Structure
```
web/apps/backend/src/
├── functions/
│   ├── trpc-handler.ts    # Main tRPC handler for Lambda
│   └── health-check.ts    # Health check function
├── lib/
│   └── db.ts              # Database connection utilities
└── routers/
    └── index.ts           # tRPC router (unchanged)
```

### Lambda Handler Example
```typescript
// functions/trpc-handler.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { appRouter } from '../routers/index';
import { createAWSLambdaContext, awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

export const handler: APIGatewayProxyHandler = awsLambdaRequestHandler({
  router: appRouter,
  createContext: createAWSLambdaContext,
});
```

## Environment Variables

### Frontend Environment Variables
- `VITE_API_URL`: API Gateway endpoint URL (e.g., `https://api.amplifyapp.com/dev`)
- `VITE_APP_ENV`: Environment (development/staging/production)

### Backend Environment Variables
- `DB_HOST`: RDS PostgreSQL endpoint
- `DB_PORT`: 5432
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password (stored securely)
- `DB_SCHEMA`: Database schema
- `NODE_ENV`: production
- `FRONTEND_URL`: Amplify hosted frontend URL

### Amplify Environment Configuration
Environment variables should be configured in the Amplify Console under:
- App Settings > Environment variables
- Use Amplify's secret management for sensitive data like DB_PASSWORD

## Database Configuration
- **RDS PostgreSQL**: Provision through Amplify or AWS Console
- **Connection**: Use connection pooling (pg.Pool) for Lambda functions
- **Migrations**: Run database migrations during build or via Lambda function

## Deployment Steps
1. Initialize Amplify project in monorepo root
2. Configure multi-app setup with base directories
3. Set up environment variables
4. Configure build settings in amplify.yml
5. Adapt backend code for Lambda deployment
6. Test deployment in staging environment
7. Deploy to production

## Security Considerations
- Use IAM roles for Lambda functions with minimal permissions
- Enable CORS properly for API Gateway
- Store secrets in AWS Secrets Manager or Amplify environment secrets
- Implement proper authentication/authorization if needed

## Monitoring and Logging
- CloudWatch Logs for Lambda functions
- X-Ray for tracing (optional)
- Amplify build logs for CI/CD monitoring

## Cost Optimization
- Lambda function optimization (memory, timeout)
- RDS instance sizing based on load
- CloudFront distribution for frontend assets