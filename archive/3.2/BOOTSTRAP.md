## SS4 Project Bootstrap

This document outlines the steps to bootstrap the SS4 project from scratch and includes successful fixes for common issues.

### Prerequisites

- Node.js >= 18.17.0
- npm
- git
- Vercel CLI

### Initial Setup

1. Clone the repository
```bash
git clone https://github.com/your-org/p1.git
cd p1
```

2. Set up the development branch
```bash
git checkout -b feat/saas-template-setup
```

3. Initialize the project
```bash
npm init -y
```

4. Install core dependencies
```bash
npm install next@14.1.0 react@18.2.0 react-dom@18.2.0 @supabase/auth-helpers-nextjs @supabase/supabase-js @stripe/stripe-js stripe zod @tanstack/react-query clsx tailwind-merge
```

5. Install development dependencies
```bash
npm install -D typescript @types/react @types/node @types/react-dom eslint eslint-config-next prettier prettier-plugin-tailwindcss husky lint-staged @typescript-eslint/eslint-plugin @typescript-eslint/parser tailwindcss postcss autoprefixer jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom drizzle-kit dotenv
```

### Environment Configuration

1. Create `.env.local` file
```bash
cp .env.example .env.local
```

2. Set up environment variables
```bash
vercel env pull .env.local
```

### Project Structure Creation

1. Set up Next.js configuration
```bash
mkdir -p app/{auth/login,dashboard} components/auth lib types public
```

2. Create TypeScript configuration
```bash
npx tsc --init
```

3. Set up Tailwind CSS
```bash
npx tailwindcss init -p
```

### Database and Authentication Setup

1. Create database seed script at `scripts/seed-db.js`

2. Run the seed script to create the single user
```bash
node scripts/seed-db.js
```

### Common Fixes and Solutions

#### JSON Formatting Issues

If you encounter JSON formatting issues in package.json or other JSON files:

```bash
# Fix package.json formatting
./scripts/fix-json-files.sh package.json

# Verify JSON is valid
cat package.json | jq empty
```

#### Route Structure Issues

If routes aren't working properly:

1. Ensure proper route structure
```bash
# For /auth/login route, create the proper directory structure
mkdir -p app/auth/login
```

2. Create page and layout files in the appropriate directories
```bash
# Create auth layout
touch app/auth/layout.tsx

# Create login page
touch app/auth/login/page.tsx
```

#### Build Errors

For module resolution errors:

```bash
# Install missing dependencies
npm install zod

# Fix tsconfig.json path resolution
# Change from "@/*": ["./src/*"] to "@/*": ["./*"]
```

#### Deployment Issues

For Vercel deployment:

```bash
# Update vercel.json configuration
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}

# Deploy to Vercel
vercel deploy --prod -y
```

### Successful Commands for Feature Branch Workflow

```bash
# Commit changes
git add package.json
git commit -m "fix(build): correct package.json formatting"

# Push to feature branch
git push origin feat/saas-template-setup

# Merge to main
git checkout main
git pull origin main
git merge feat/saas-template-setup
git push origin main
```

### Troubleshooting

If you encounter 404 errors with route groups:
- Check that you're not mixing regular routes with route groups (parentheses)
- Ensure middleware is properly configured with the correct matchers
- Verify that redirects are pointing to the correct routes

For authentication issues:
- Check that Supabase environment variables are correctly set
- Ensure the database seed script has been run to create the initial user
- Verify the login form is using the correct credentials 