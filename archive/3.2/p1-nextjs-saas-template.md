# P1 Next.js SaaS Development Template

## Repository Structure
```bash
p1/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth routes (login, register, etc.)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── dashboard/        # Dashboard components
│   ├── marketing/        # Marketing components
│   └── ui/               # Shared UI components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client & utils
│   ├── stripe/          # Stripe integration
│   └── db/              # Drizzle ORM setup
└── utils/               # Helper functions
```

## Core Dependencies

### Framework & Runtime
```json
{
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "typescript": "5.3.3"
  }
}
```

### Database & Auth
```json
{
  "dependencies": {
    "@supabase/supabase-js": "2.39.3",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "drizzle-orm": "^0.29.3",
    "postgres": "^3.4.3"
  }
}
```

### UI & Styling
```json
{
  "dependencies": {
    "tailwindcss": "^3.4.1",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/forms": "^0.5.7",
    "shadcn-ui": "latest"
  }
}
```

### Payments
```json
{
  "dependencies": {
    "stripe": "^14.14.0",
    "@stripe/stripe-js": "^2.4.0"
  }
}
```

## Environment Setup

### 1. Supabase Configuration
```bash
# .env.local
SUPABASE_URL="your-project-url"
SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000"

# OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID="your-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
GITHUB_OAUTH_CLIENT_ID="your-client-id"
GITHUB_OAUTH_CLIENT_SECRET="your-client-secret"
```

### 2. Stripe Configuration
```bash
# .env.local
STRIPE_SECRET_KEY="your-secret-key"
STRIPE_PUBLISHABLE_KEY="your-publishable-key"
STRIPE_PRICING_TABLE_ID="your-pricing-table-id"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
```

### 3. Database Configuration
```bash
# .env.local
DATABASE_URL="postgresql://${USER}:${PASSWORD}@your-db-host/saas-template?sslmode=require"
```

## Feature Components

### 1. Authentication Components
```typescript
interface AuthComponents {
  signIn: {
    email: boolean,
    oauth: {
      google: boolean,
      github: boolean
    },
    resetPassword: boolean
  };
  protected: {
    routes: ["/dashboard/*"],
    middleware: "supabase"
  };
}
```

### 2. Billing Components
```typescript
interface BillingComponents {
  stripe: {
    pricingTable: boolean,
    checkout: boolean,
    customerPortal: boolean,
    webhooks: boolean
  };
  features: {
    subscription: boolean,
    usage: boolean,
    invoicing: boolean
  };
}
```

### 3. Database Schema
```typescript
// /lib/db/schema.ts
interface DatabaseSchema {
  users: {
    id: string,
    email: string,
    metadata: JSON
  };
  subscriptions: {
    id: string,
    userId: string,
    status: string,
    priceId: string
  };
  products: {
    id: string,
    name: string,
    features: string[]
  };
}
```

## Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "stripe:sync": "node scripts/stripe-sync.js"
  }
}
```

## Implementation Steps

### 1. Initial Setup
```bash
# Clone template
git clone https://github.com/Neo-2025/p1.git
cd p1

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local

# Initialize database
pnpm db:push
```

### 2. Supabase Setup
1. Create Supabase project
2. Configure OAuth providers
3. Set up email templates
4. Configure security policies

### 3. Stripe Setup
1. Create Stripe account
2. Set up products and pricing
3. Configure webhooks
4. Create pricing table

### 4. Database Setup
1. Define schema
2. Run migrations
3. Set up indexes
4. Configure backups

## S4 Integration Points

### 1. Story Management
```typescript
interface S4StoryIntegration {
  auth: {
    stories: [
      "user-registration",
      "oauth-login",
      "password-reset"
    ],
    patterns: [
      "auth-flow",
      "protected-routes"
    ]
  };
  billing: {
    stories: [
      "subscription-setup",
      "payment-management"
    ],
    patterns: [
      "stripe-integration",
      "webhook-handling"
    ]
  };
}
```

### 2. Development Boundaries
```typescript
interface S4Boundaries {
  routes: {
    max: 25,
    protected: 15,
    public: 10
  };
  components: {
    maxPerPage: 10,
    maxProps: 8,
    maxDepth: 3
  };
  database: {
    maxTables: 10,
    maxRelations: 15,
    maxIndexes: 20
  };
}
```

### 3. Quality Gates
```typescript
interface S4QualityGates {
  auth: {
    oauth: "required",
    passwordless: "optional",
    mfa: "recommended"
  };
  database: {
    migrations: "required",
    backups: "required",
    monitoring: "required"
  };
  stripe: {
    webhooks: "required",
    testing: "required",
    logging: "required"
  };
}
```

## Success Metrics

```typescript
interface S4Metrics {
  auth: {
    signupConversion: ">40%",
    oauthUsage: ">60%",
    passwordResetTime: "<5m"
  };
  billing: {
    checkoutConversion: ">80%",
    subscriptionRetention: ">85%",
    revenueGrowth: ">10%/month"
  };
  performance: {
    pageLoad: "<2s",
    apiLatency: "<200ms",
    dbQueries: "<5/request"
  };
}
```

## References
- [Next.js SaaS Starter with Supabase](https://vercel.com/templates/next.js/next-js-saas-starter-1)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) 