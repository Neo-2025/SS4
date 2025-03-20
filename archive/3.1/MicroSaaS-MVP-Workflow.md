# MicroSaaS MVP Development Workflow

## Overview

This document outlines a streamlined development workflow for building Micro-SaaS applications using:

- **Cursor** as the AI-powered IDE
- **Next.js** as the full-stack framework
- **Clerk** for authentication
- **Stripe** for payments
- **Vercel** for deployment

The workflow focuses on developer productivity, reliable local development, and minimizing the gap between development and production environments, allowing rapid MVP creation and iteration.

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| IDE | Cursor | AI-assisted development |
| Framework | Next.js (App Router) | Full-stack application framework |
| Authentication | Clerk.dev | User authentication and management |
| Database | Prisma + PlanetScale/Railway | Data modeling and persistence |
| Payments | Stripe | Payment processing and subscriptions |
| Deployment | Vercel | Hosting and serverless functions |
| Monitoring | Vercel Analytics + Axiom | Performance and error tracking |
| Testing | Vitest/Jest | Unit and integration testing |

## Project Setup

### 1. Initialize Project with Cursor

```bash
# Create a new Next.js project with Cursor terminal
npx create-next-app@latest my-microsaas --typescript --tailwind --app --eslint
cd my-microsaas

# Initialize Git repository
git init
git add .
git commit -m "Initial commit"
```

### 2. Integrate Core Dependencies

```bash
# Install main dependencies
npm install @clerk/nextjs prisma @prisma/client stripe react-hook-form zod @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query

# Install UI components (optional but recommended)
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast lucide-react

# Install development dependencies
npm install -D prettier eslint-config-prettier eslint-plugin-prettier prisma vitest
```

### 3. Environment Configuration

Create a base `.env.example` file:

```
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL="postgresql://..."

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Then create your actual `.env.local` file:

```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

## Project Structure

Set up the project with a clean, maintainable structure:

```
my-microsaas/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── settings/page.tsx
│   │   └── billing/page.tsx
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/         # Reusable UI components
│   ├── dashboard/  # Dashboard-specific components
│   ├── billing/    # Stripe-related components
│   └── forms/      # Form components
├── lib/
│   ├── clerk.ts    # Clerk setup and utilities
│   ├── prisma.ts   # Prisma client setup
│   ├── stripe.ts   # Stripe utilities
│   └── trpc.ts     # tRPC setup
├── prisma/
│   └── schema.prisma
├── public/
└── styles/
```

## Local Development Environment

### Docker Compose for Local Services

Create `docker-compose.yml` for local development services:

```yaml
version: '3'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: microsaas
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  stripe-cli:
    image: stripe/stripe-cli
    command: "listen --forward-to http://host.docker.internal:3000/api/webhooks/stripe"
    environment:
      STRIPE_API_KEY: ${STRIPE_SECRET_KEY}

volumes:
  postgres_data:
```

### NPM Scripts Configuration

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "services:up": "docker-compose up -d",
    "services:down": "docker-compose down",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "stripe:listen": "stripe listen --forward-to localhost:3000/api/webhooks/stripe",
    "test": "vitest",
    "test:watch": "vitest watch"
  }
}
```

## Core Configuration Files

### 1. Prisma Configuration

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String   @id @default(cuid())
  clerkId    String   @unique
  email      String   @unique
  name       String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  stripeCustomerId String?
  
  // Relations
  subscriptions Subscription[]
}

model Subscription {
  id                 String   @id @default(cuid())
  userId             String
  stripeSubscriptionId String  @unique
  status             String   // 'active', 'canceled', etc
  priceId            String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2. Clerk Configuration

Create `lib/clerk.ts`:

```typescript
import { clerkClient } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function ensureUserInDatabase(clerkId: string) {
  // First, get the user from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkId);
  
  // Check if user exists in our database
  const existingUser = await prisma.user.findUnique({
    where: { clerkId }
  });
  
  if (!existingUser) {
    // Create the user in our database
    const primaryEmailAddress = clerkUser.emailAddresses.find(
      email => email.id === clerkUser.primaryEmailAddressId
    );
    
    if (!primaryEmailAddress) {
      throw new Error("User does not have a primary email address");
    }
    
    return prisma.user.create({
      data: {
        clerkId,
        email: primaryEmailAddress.emailAddress,
        name: `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || undefined,
      }
    });
  }
  
  return existingUser;
}
```

### 3. Stripe Configuration

Create `lib/stripe.ts`:

```typescript
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Update to the latest version
});

export async function createStripeCheckoutSession({
  userId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  // Get the user from our database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // If the user doesn't have a Stripe customer ID, create one
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name || undefined,
      metadata: {
        userId: user.id,
      },
    });
    
    stripeCustomerId = customer.id;
    
    // Update the user with the Stripe customer ID
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId },
    });
  }

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
}
```

### 4. tRPC Configuration

Create `lib/trpc.ts`:

```typescript
import { initTRPC, TRPCError } from '@trpc/server';
import { getAuth } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { type NextRequest } from 'next/server';

export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { req } = opts;
  const auth = getAuth(req);
  
  return {
    auth,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Middleware to require authentication
const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.auth?.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
```

## Development Workflow

### 1. Initialize Development Environment

Each time you start development:

```bash
# Start required services (PostgreSQL, Stripe CLI)
npm run services:up

# Push your database schema if needed
npm run db:push

# Start the Next.js development server
npm run dev
```

### 2. Cursor-Assisted Development

#### Cursor Prompts for Common Tasks

Create a `.cursor` folder with `prompts.md`:

```markdown
# Cursor Prompts Library

## Component Generation
@cursor: Create a form component for [purpose] with the following fields: [fields]. Use react-hook-form for validation and handle submission.

## Data Model
@cursor: Create a Prisma model for [entity] with the following fields and relationships: [fields].

## API Route
@cursor: Create a tRPC mutation for [action] that handles [specific task] with proper error handling and input validation.

## Stripe Integration
@cursor: Create a function to handle [payment action] using Stripe SDK. Include webhook handling if necessary.

## Documentation
@cursor: Generate documentation for the [feature] function including parameters, return values, and usage examples.
```

#### Example: Creating a New Feature

1. **Define the data model**:

```
// @cursor: Create a Prisma model for Product with name, description, price, and image URL fields
```

2. **Create backend functionality**:

```
// @cursor: Create a tRPC query to fetch products with optional filtering and pagination
```

3. **Implement the UI**:

```
// @cursor: Create a responsive product grid component using Tailwind CSS that shows product cards with name, price, and image
```

### 3. Feature-Based Approach

For each feature, follow this workflow:

1. Define requirements
2. Create or update the data model (`prisma/schema.prisma`)
3. Apply database changes (`npm run db:push`)
4. Implement the API functionality using tRPC
5. Build the UI components
6. Connect frontend to backend
7. Test the feature
8. Refine based on testing
9. Commit changes

## Testing and Quality Assurance

### Automated Testing

Set up testing with Vitest:

```typescript
// tests/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Example test', () => {
  it('should pass', () => {
    expect(1 + 1).toEqual(2);
  });
});
```

### Manual Testing Checklist

For each feature, verify:

- [ ] Authentication flows (sign up, sign in, sign out)
- [ ] Dashboard functionality
- [ ] Data persistence
- [ ] Payment flows (using Stripe test cards)
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Error states and edge cases
- [ ] Performance and loading states

### Stripe Testing

Use these test cards for Stripe:

- **Success**: 4242 4242 4242 4242
- **Requires Authentication**: 4000 0025 0000 3155
- **Declined**: 4000 0000 0000 9995

## Deployment Process

### First-time Vercel Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link
```

### Environment Variables

Configure these in the Vercel dashboard:

1. Go to your project settings
2. Navigate to Environment Variables
3. Add all the variables from `.env.local` with production values

### Deploy to Vercel

```bash
# Create a development preview
vercel

# Deploy to production
vercel --prod
```

### Post-Deployment Tasks

1. Configure Stripe production webhooks
2. Update Clerk redirect URLs
3. Verify all environment variables
4. Run smoke tests on production

## Local Development Tips

### Multi-Terminal Approach

Organize your development with multiple terminals:

1. **Terminal 1**: Next.js dev server (`npm run dev`)
2. **Terminal 2**: Stripe webhook listener (`npm run stripe:listen`)
3. **Terminal 3**: Prisma Studio (`npm run db:studio`)
4. **Terminal 4**: Git commands and other utilities

### Development vs. Production

Create helpers to manage environment differences:

```typescript
// lib/environment.ts
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? (
  isDev ? 'http://localhost:3000' : 'https://your-production-url.com'
);
```

### Development Accounts

For consistent testing:

1. Create dedicated test users in Clerk's development instance
2. Use test API keys for Stripe in development
3. Maintain consistent test data

## Common Patterns

### User Onboarding Flow

```
Sign Up → Email Verification → Basic Profile → Subscription Selection → Payment → Dashboard
```

### Subscription Management

```
View Current Plan → Change Plan → Preview Changes → Confirm → Update Subscription → Confirmation
```

### Settings and Account Management

```
View Profile → Edit Details → Save Changes → Confirmation
```

## Cursor Usage Tips for MicroSaaS Development

### Efficient Cursor Patterns

1. **Component Generation**:
   ```
   // @cursor: Generate a [component type] component for [purpose] using Tailwind CSS
   ```

2. **Feature Implementation**:
   ```
   // @cursor: Implement [feature] with the following requirements: [list requirements]
   ```

3. **Bug Fixing**:
   ```
   // @cursor: Debug this issue: [describe issue]. The expected behavior is: [expected behavior]
   ```

4. **Code Refactoring**:
   ```
   // @cursor: Refactor this code to improve [aspect] while maintaining the same functionality
   ```

### Code Quality Prompts

```
// @cursor: Review this code for potential issues and suggest improvements
```

```
// @cursor: Make this code more maintainable by applying best practices
```

## Conclusion

This workflow provides a streamlined approach to developing MicroSaaS applications with a focus on developer productivity. The combination of Cursor AI, Next.js, Clerk, and Stripe creates a powerful foundation for building and iterating on SaaS MVPs quickly.

By following this approach, you can:

1. Rapidly develop new features with AI assistance
2. Maintain a reliable local development environment
3. Confidently deploy to production
4. Scale your application as your user base grows

---

*This document outlines a development workflow for MicroSaaS applications. Customize it to fit your specific project needs and team preferences.* 