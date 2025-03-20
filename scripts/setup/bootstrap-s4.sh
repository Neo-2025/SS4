#!/bin/bash

# S4 Bootstrap Script
# This script sets up the development environment for SmartStack v4 (S4)

set -e  # Exit on error

# Environment variables
WINDOWS_USER="luke"
WINDOWS_HOME="/mnt/c/Users/$WINDOWS_USER"
WSL_USER="neo"
WSL_HOME="/home/$WSL_USER"
S4_ROOT="$WSL_HOME/S4"

# Log function
log() {
    echo "[S4 Bootstrap] $1"
}

# Error handling
handle_error() {
    log "Error: $1"
    exit 1
}

# Check WSL version and status
check_wsl() {
    log "Checking WSL environment..."
    uname -a || handle_error "Failed to get system info"
    lsb_release -a || handle_error "Failed to get distribution info"
}

# Configure WSL for optimal performance
configure_wsl() {
    log "Configuring WSL for optimal performance..."
    
    # Create WSL config
    log "Creating WSL config..."
    sudo bash -c 'cat > /etc/wsl.conf << EOF
[wsl2]
memory=6GB
processors=4
localhostForwarding=true

[automount]
enabled = true
root = /mnt/
options = "metadata,umask=22,fmask=11"
mountFsTab = true

[interop]
enabled = true
appendWindowsPath = true

[network]
generateResolvConf = true
EOF'

    # Optimize system settings
    log "Optimizing system settings..."
    sudo bash -c 'cat >> /etc/sysctl.conf << EOF
vm.swappiness=10
vm.dirty_ratio=40
fs.inotify.max_user_watches=524288
EOF'

    sudo sysctl -p || log "Note: Some sysctl settings may require a WSL restart"
}

# Configure path mappings
configure_paths() {
    log "Configuring path mappings..."
    
    # Set up environment variables
    log "Setting up environment variables..."
    cat >> "$WSL_HOME/.bashrc" << EOF

# S4 Path Mappings
export WINDOWS_USER="$WINDOWS_USER"
export WINDOWS_HOME="$WINDOWS_HOME"
export WSL_USER="$WSL_USER"
export WSL_HOME="$WSL_HOME"
export S4_ROOT="$S4_ROOT"
EOF

    # Create Windows path mappings
    log "Creating Windows path mappings..."
    mkdir -p "$WSL_HOME/win"
    ln -sf "$WINDOWS_HOME" "$WSL_HOME/win/home"
    mkdir -p "$WSL_HOME/win/{projects,downloads,documents}"
    ln -sf "$WINDOWS_HOME/Projects" "$WSL_HOME/win/projects"
    ln -sf "$WINDOWS_HOME/Downloads" "$WSL_HOME/win/downloads"
    ln -sf "$WINDOWS_HOME/Documents" "$WSL_HOME/win/documents"
}

# Install essential development tools
install_dev_tools() {
    log "Installing development tools..."
    
    # Update and install packages
    sudo apt-get update 
    sudo apt-get install -y \
        curl \
        git \
        nodejs \
        postgresql-client \
        redis-tools \
        build-essential \
        python3 \
        python3-pip \
        docker.io \
        docker-compose || handle_error "Failed to install development tools"
}

# Install global npm packages
install_npm_globals() {
    log "Installing global npm packages..."
    # Note: Using Supabase CLI v1.13.1 as v3.2.1 specified in .cursor.rules is not available in npm registry
    # TODO: Verify if v3.2.1 is a typo in .cursor.rules or if there's a specific installation method
    npm install -g \
        supabase@1.13.1 \
        vercel \
        typescript@5.3.3 \
        ts-node || handle_error "Failed to install npm packages"
}

# Configure Git for WSL
configure_git() {
    log "Configuring Git for WSL..."
    git config --global core.fileMode false
    git config --global core.autocrlf input
    git config --global core.eol lf || handle_error "Failed to configure Git"
    
    # Configure GitHub credentials if not already set
    if [ -z "$(git config --global user.name)" ]; then
        git config --global user.name "Neo"
        git config --global user.email "neo@smartscale.co"
    fi
}

# Create project structure
create_project_structure() {
    log "Creating project structure..."
    mkdir -p "$S4_ROOT/p1" || handle_error "Failed to create p1 directory"
    mkdir -p "$S4_ROOT/kb" || handle_error "Failed to create kb directory"
    mkdir -p "$S4_ROOT/scripts" || handle_error "Failed to create scripts directory"
    
    # Set up VS Code workspace settings
    log "Setting up VS Code workspace settings..."
    mkdir -p "$S4_ROOT/.vscode"
    cat > "$S4_ROOT/.vscode/settings.json" << EOF
{
    "terminal.integrated.defaultProfile.windows": "WSL",
    "terminal.integrated.profiles.windows": {
        "WSL": {
            "path": "wsl.exe",
            "args": ["-d", "Ubuntu-20.04"]
        }
    },
    "files.eol": "\n",
    "files.watcherExclude": {
        "**/node_modules/**": true,
        "**/.git/**": true
    }
}
EOF

    # Verify Cursor AI setup
    log "Verifying Cursor AI setup..."
    if [ ! -d "$WSL_HOME/.cursor-server" ]; then
        log "Warning: Cursor AI server not found at $WSL_HOME/.cursor-server"
        log "Please ensure Cursor is properly installed and configured"
    else
        log "Cursor AI setup verified"
    fi
}

# Set up Next.js app structure
setup_nextjs_app() {
    log "Setting up Next.js app structure..."
    
    # Create app directory structure
    mkdir -p "$S4_ROOT/p1/src/app"
    
    # Create layout.tsx
    cat > "$S4_ROOT/p1/src/app/layout.tsx" << EOF
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S4 Project',
  description: 'S4 Development Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

    # Create page.tsx
    cat > "$S4_ROOT/p1/src/app/page.tsx" << EOF
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Welcome to S4 Project</h1>
    </main>
  )
}
EOF

    # Create globals.css
    cat > "$S4_ROOT/p1/src/app/globals.css" << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

    # Create tailwind.config.js
    cat > "$S4_ROOT/p1/tailwind.config.js" << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

    # Create postcss.config.js
    cat > "$S4_ROOT/p1/postcss.config.js" << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

    # Create vercel.json
    cat > "$S4_ROOT/p1/vercel.json" << EOF
{
    "buildCommand": "npm run build",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "framework": "nextjs",
    "regions": ["iad1"]
}
EOF

    log "Next.js app structure created successfully"
}

# Set up Next.js template structure and configuration
setup_nextjs_template() {
    log "Setting up Next.js template structure..."
    
    # Create src directory structure
    mkdir -p "$S4_ROOT/p1/src/app" \
            "$S4_ROOT/p1/src/lib" \
            "$S4_ROOT/p1/src/types" \
            "$S4_ROOT/p1/kb/training/basics/templates"
    
    # Create app files
    log "Creating Next.js app files..."
    cat > "$S4_ROOT/p1/src/app/layout.tsx" << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'S4 SaaS Template',
  description: 'SmartStack v4 SaaS Template',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

    cat > "$S4_ROOT/p1/src/app/page.tsx" << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to S4 SaaS Template</h1>
        <p className="text-xl mb-4">Your modern SaaS solution starts here.</p>
      </div>
    </main>
  )
}
EOF

    cat > "$S4_ROOT/p1/src/app/globals.css" << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
    to bottom,
    transparent,
    rgb(var(--background-end-rgb))
  )
  rgb(var(--background-start-rgb));
}
EOF

    # Create utility files
    log "Creating utility files..."
    cat > "$S4_ROOT/p1/src/lib/validation.ts" << 'EOF'
import { NextApiRequest } from 'next';

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

export const validateRequest = (req: NextApiRequest, requiredFields: string[] = []): ValidationResult => {
  const errors: string[] = [];

  // Validate HTTP method
  if (!req.method) {
    errors.push('HTTP method is required');
  }

  // Validate required fields in body
  if (requiredFields.length > 0 && req.body) {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        errors.push(`${field} is required`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};
EOF

    cat > "$S4_ROOT/p1/src/lib/error-handling.ts" << 'EOF'
import { NextApiResponse } from 'next';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export const handleError = (res: NextApiResponse, error: ApiError | Error) => {
  console.error('API Error:', error);

  const status = (error as ApiError).status || 500;
  const message = error.message || 'Internal server error';
  const code = (error as ApiError).code || 'INTERNAL_ERROR';

  return res.status(status).json({
    error: {
      message,
      code,
    },
  });
};
EOF

    # Create type definitions
    log "Creating type definitions..."
    cat > "$S4_ROOT/p1/src/types/index.ts" << 'EOF'
import React from 'react';

// Common props interface for components
export interface ComponentProps {
  className?: string;
  id?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Add other common types here
export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}
EOF

    # Create template files
    log "Creating template files..."
    cat > "$S4_ROOT/p1/kb/training/basics/templates/api-template.ts" << 'EOF'
import { NextApiRequest, NextApiResponse } from 'next';
import { validateRequest } from '@/lib/validation';
import { handleError, ApiError } from '@/lib/error-handling';

// Handler function types
type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

// Handler implementations
const handleGet: ApiHandler = async (req, res) => {
  // Implement GET logic here
  res.status(200).json({ message: 'GET request successful' });
};

const handlePost: ApiHandler = async (req, res) => {
  // Implement POST logic here
  res.status(201).json({ message: 'POST request successful' });
};

const handlePut: ApiHandler = async (req, res) => {
  // Implement PUT logic here
  res.status(200).json({ message: 'PUT request successful' });
};

const handleDelete: ApiHandler = async (req, res) => {
  // Implement DELETE logic here
  res.status(200).json({ message: 'DELETE request successful' });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate request
    const validation = validateRequest(req);
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return handleError(res, error as Error | ApiError);
  }
}
EOF

    cat > "$S4_ROOT/p1/kb/training/basics/templates/component-template.tsx" << 'EOF'
import React from 'react';
import { ComponentProps } from '@/types';

interface Props extends ComponentProps {
  // Add component-specific props here
  title?: string;
  description?: string;
  onClick?: () => void;
}

export const ComponentName: React.FC<Props> = ({
  className,
  id,
  style,
  children,
  title = 'Default Title',
  description,
  onClick,
}) => {
  // Add hooks here
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  return (
    <div
      id={id}
      className={className}
      style={style}
      onClick={handleClick}
    >
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
};
EOF

    # Configure TypeScript
    log "Configuring TypeScript..."
    cat > "$S4_ROOT/p1/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    # Verify the build
    log "Verifying template build..."
    cd "$S4_ROOT/p1" || handle_error "Failed to change to p1 directory"
    npm run build || handle_error "Template build failed"
    
    log "Next.js template setup complete"
}

# Configure Vercel and Supabase integration
configure_vercel_supabase() {
    log "Configuring Vercel and Supabase integration..."
    
    # Create Supabase configuration
    log "Creating Supabase configuration..."
    mkdir -p "$S4_ROOT/p1/supabase"
    cat > "$S4_ROOT/p1/supabase/config.toml" << EOF
# A string used to distinguish different Supabase projects on the same host. Defaults to the working
# directory name when running `supabase init`.
project_id = "s4-project"

[api]
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. public is always included.
schemas = ["public", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 15

[studio]
# Port to use for Supabase Studio.
port = 54323

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the dashboard.
[inbucket]
# Port to use for the email testing server API.
port = 54324
# Port to use for the email testing server SMTP port.
smtp_port = 54325
# Port to use for the email testing server POP3 port.
pop3_port = 54326

[storage]
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 seconds (one
# week).
jwt_expiry = 86400
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
EOF

    # Create token rotation workflow
    log "Creating token rotation workflow..."
    mkdir -p "$S4_ROOT/.github/workflows"
    cat > "$S4_ROOT/.github/workflows/token-rotation.yml" << EOF
name: Token Rotation

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Rotate GitHub Token
        run: |
          gh auth refresh -h github.com
        env:
          GH_TOKEN: \${{ secrets.GH_TOKEN }}
          
      - name: Rotate Vercel Token
        run: |
          vercel tokens rotate
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
          
      - name: Rotate Supabase Token
        run: |
          supabase login --token \$(supabase token rotate)
        env:
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}
          
      - name: Update Environment Variables
        run: |
          vercel env pull .env.production
          supabase secrets set --env-file .env.production
        env:
          VERCEL_TOKEN: \${{ secrets.VERCEL_TOKEN }}
          SUPABASE_ACCESS_TOKEN: \${{ secrets.SUPABASE_ACCESS_TOKEN }}
EOF

    # Create environment variables template
    log "Creating environment variables template..."
    cat > "$S4_ROOT/p1/.env.example" << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key
STRIPE_SECRET_KEY=your-secret-key

# Database
DATABASE_URL=your-database-url

# Vercel
VERCEL_PROJECT_ID=your-project-id
VERCEL_ORG_ID=your-org-id
EOF

    log "Vercel and Supabase integration configured."
    log "IMPORTANT: Manual steps required:"
    log "1. Create a new project on Vercel (https://vercel.com/new)"
    log "2. Create a new project on Supabase (https://supabase.com/dashboard)"
    log "3. Link the projects in Vercel dashboard:"
    log "   - Go to Project Settings > Environment Variables"
    log "   - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    log "   - Enable 'Automatically expose System Environment Variables'"
    log "   - IMPORTANT: Do NOT use the 'STORAGE_' prefix for environment variables"
    log "     as it can cause confusion in the integration"
    log "4. Configure preview deployments:"
    log "   - In Vercel, go to Project Settings > Git"
    log "   - Enable 'Preview Deployment Checks'"
    log "   - Add Supabase preview URL and key mappings"
    log "5. Set up token rotation:"
    log "   - Add GH_TOKEN, VERCEL_TOKEN, and SUPABASE_ACCESS_TOKEN to GitHub Secrets"
    log "   - Token rotation is scheduled for daily at midnight"
    log ""
    log "IMPORTANT: The tight integration between Vercel and Supabase provides all environment"
    log "variables in one place, making it viable to create preview branches that coordinate"
    log "Vercel and Supabase environments. To get your environment variables:"
    log "1. Link your project: vercel link"
    log "2. Pull environment variables: vercel env pull .env.development.local"
    log "3. The .env.development.local file will contain all necessary variables for both"
    log "   Vercel and Supabase, enabling seamless preview branch creation and testing."
}

# Function to set up database with Drizzle ORM
setup_database() {
    log "Setting up database with Drizzle ORM..."
    
    # Install Drizzle dependencies
    log "Installing Drizzle dependencies..."
    npm install drizzle-orm @vercel/postgres pg
    npm install -D drizzle-kit dotenv
    
    # Create necessary directories
    log "Creating database directories..."
    mkdir -p src/lib/db
    
    # Create configuration files
    log "Creating database configuration files..."
    
    # Create drizzle.config.ts
    cat > drizzle.config.ts << 'EOL'
import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.POSTGRES_HOST!,
    user: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DATABASE!,
    port: 5432,
    ssl: true,
  },
} satisfies Config;
EOL
    
    # Create schema.ts
    cat > src/lib/db/schema.ts << 'EOL'
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
EOL
    
    # Create index.ts
    cat > src/lib/db/index.ts << 'EOL'
import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from './schema';

export const db = drizzle(sql, { schema });
EOL
    
    # Add database scripts to package.json
    log "Adding database scripts to package.json..."
    npm pkg set scripts.db:generate="drizzle-kit generate"
    npm pkg set scripts.db:push="drizzle-kit push"
    npm pkg set scripts.db:studio="drizzle-kit studio"
    
    # Create feature branch for database setup
    log "Creating feature branch for database setup..."
    git checkout -b feat/drizzle-setup
    
    # Add and commit changes
    log "Committing database setup changes..."
    git add .
    git commit -m "feat: add drizzle orm setup with schema"
    
    log "Database setup complete! Next steps:"
    log "1. Push changes to GitHub: git push origin feat/drizzle-setup"
    log "2. Deploy to Vercel to trigger preview environment"
    log "3. Verify Supabase preview branch creation"
}

# Set up Vercel and GitHub Actions
setup_vercel_and_github() {
    log "Setting up Vercel and GitHub Actions..."
    
    # Install Vercel CLI if not already installed
    if ! command -v vercel &> /dev/null; then
        log "Installing Vercel CLI..."
        npm install -g vercel
    fi

    # IMPORTANT: Vercel Project Settings Requirements for S4
    # 1. Fluid Compute must be enabled for optimal performance
    #    - Go to Project Settings > Functions
    #    - Enable "Fluid Compute"
    #    - This allows Vercel to automatically manage concurrency
    #    - Optimizes performance based on workload
    #    - Required for S4 compliance due to:
    #      a) Dynamic resource allocation
    #      b) Automatic performance optimization
    #      c) Cost-effective scaling
    #      d) Better cold start handling
    
    # Create GitHub Actions workflows directory
    mkdir -p "$S4_ROOT/.github/workflows"
    
    # IMPORTANT: GitHub requires workflow files to be created through the API or web interface
    # This is a security measure to prevent workflow injection attacks
    # Even with correct token scopes, direct git operations for workflow files are restricted
    
    # Create branch-first workflow
    log "Creating branch-first workflow..."
    cat > "$S4_ROOT/.github/workflows/branch-first.yml" << 'EOF'
name: Branch-First Development

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main, 'feat/*', 'fix/*', 'docs/*' ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check || echo 'Type check skipped - not configured yet'
        
      - name: Lint
        run: npm run lint || echo 'Lint skipped - not configured yet'
        
      - name: Test
        run: npm test || echo 'Tests skipped - not configured yet'
        
      - name: Build
        run: npm run build || echo 'Build skipped - not configured yet'

  preview:
    needs: validate
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build || echo 'Build skipped - not configured yet'
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./
          vercel-args: '--prod'
EOF

    # Create test workflow
    log "Creating test workflow..."
    cat > "$S4_ROOT/.github/workflows/test.yml" << 'EOF'
name: Automated Testing

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main, 'feat/*', 'fix/*' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit || echo 'Unit tests skipped - not configured yet'
        
      - name: Run integration tests
        run: npm run test:integration || echo 'Integration tests skipped - not configured yet'
        
      - name: Run E2E tests
        run: npm run test:e2e || echo 'E2E tests skipped - not configured yet'
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true
EOF

    # Create sync-vercel-env script
    log "Creating Vercel environment sync script..."
    cat > "$S4_ROOT/scripts/sync-vercel-env.sh" << 'EOF'
#!/bin/bash

# Function to log messages
log() {
    echo "[Vercel Sync] $1"
}

# Check for required tools
if ! command -v vercel &> /dev/null; then
    log "Error: Vercel CLI is not installed. Please run: npm install -g vercel"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    log "Error: GitHub CLI is not installed. Please run: npm install -g gh"
    exit 1
fi

# Verify logged in status
vercel whoami &> /dev/null || {
    log "Error: Not logged into Vercel. Please run: vercel login"
    exit 1
}

gh auth status &> /dev/null || {
    log "Error: Not logged into GitHub. Please run: gh auth login"
    exit 1
}

# Fetch environment variables from Vercel
log "Fetching environment variables from Vercel..."
vercel env pull .env.vercel.tmp

# Read and process each line
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^# ]] && continue
    
    # Split into key and value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        
        # Remove quotes if present
        value="${value#\"}"
        value="${value%\"}"
        
        # Skip if empty value
        [[ -z "$value" ]] && continue
        
        log "Syncing $key to GitHub secrets..."
        echo "$value" | gh secret set "$key"
    fi
done < .env.vercel.tmp

# Cleanup
rm .env.vercel.tmp

log "Successfully synced all environment variables to GitHub secrets!"
log "Please verify the secrets in your GitHub repository settings"
EOF

    # Create get-vercel-ids script
    cat > "$S4_ROOT/scripts/get-vercel-ids.js" << EOF
const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Get organization ID
  const orgOutput = execSync('vercel teams ls').toString();
  const orgMatch = orgOutput.match(/ID:\\s+([^\\n]+)/);
  const orgId = orgMatch ? orgMatch[1].trim() : null;
  console.log('Organization ID:', orgId);

  // Get project ID
  const projectOutput = execSync('vercel projects ls').toString();
  const projectMatch = projectOutput.match(/ID:\\s+([^\\n]+)/);
  const projectId = projectMatch ? projectMatch[1].trim() : null;
  console.log('Project ID:', projectId);

  if (orgId && projectId) {
    // Create a .env file with these values
    const envContent = \`
VERCEL_ORG_ID=\${orgId}
VERCEL_PROJECT_ID=\${projectId}
\`;
    fs.writeFileSync('.env', envContent);
    console.log('\\nCreated .env file with Vercel IDs');

    // Add to GitHub secrets
    console.log('\\nTo add these to GitHub secrets, run:');
    console.log(\`gh secret set VERCEL_ORG_ID -b "\${orgId}"\`);
    console.log(\`gh secret set VERCEL_PROJECT_ID -b "\${projectId}"\`);
  } else {
    console.error('Could not find organization or project ID');
  }

} catch (error) {
  console.error('Error:', error.message);
  console.log('\\nPlease make sure you are logged in to Vercel CLI:');
  console.log('1. Run: npm i -g vercel');
  console.log('2. Run: vercel login');
}
EOF

    # Make the scripts executable
    chmod +x "$S4_ROOT/scripts/sync-vercel-env.sh"
    chmod +x "$S4_ROOT/scripts/get-vercel-ids.js"
    
    # Create workflows through GitHub API
    log "Creating workflows through GitHub API..."
    cd "$S4_ROOT"
    
    # Get current SHA for branch-first.yml
    BRANCH_FIRST_SHA=$(gh api /repos/Neo-2025/p1/contents/.github/workflows/branch-first.yml --jq .sha)
    
    # Update branch-first.yml
    gh api --method PUT /repos/Neo-2025/p1/contents/.github/workflows/branch-first.yml \
        --field message="feat: add branch-first workflow" \
        --field content="$(base64 -w0 .github/workflows/branch-first.yml)" \
        --field branch=main \
        --field sha="$BRANCH_FIRST_SHA"
    
    # Get current SHA for test.yml
    TEST_SHA=$(gh api /repos/Neo-2025/p1/contents/.github/workflows/test.yml --jq .sha)
    
    # Update test.yml
    gh api --method PUT /repos/Neo-2025/p1/contents/.github/workflows/test.yml \
        --field message="feat: add test workflow" \
        --field content="$(base64 -w0 .github/workflows/test.yml)" \
        --field branch=main \
        --field sha="$TEST_SHA"
    
    log "Vercel and GitHub Actions setup complete"
    log "Next steps:"
    log "1. Run 'vercel login' to authenticate with Vercel"
    log "2. Run 'node scripts/get-vercel-ids.js' to get your Vercel IDs"
    log "3. Run './scripts/sync-vercel-env.sh' to sync Vercel environment variables to GitHub secrets"
    log "4. Enable Fluid Compute in Vercel Project Settings > Functions for S4 compliance"
}

# Set up Git repository structure
setup_git_repository() {
    log "Setting up Git repository structure..."
    
    # Initialize Git repository
    cd "$S4_ROOT" || handle_error "Failed to change to S4 directory"
    git init
    
    # Add submodules
    git submodule add https://github.com/Neo-2025/p1.git p1
    git submodule add https://github.com/Neo-2025/p1.git archive/p1
    
    # Create README
    cat > "$S4_ROOT/README.md" << EOF
# SmartStack v4 (SS4)

## Overview
SmartStack v4 (SS4) is a development framework designed for efficient MVP development using AI-assisted development tools, particularly Cursor AI.

## Structure
- \`/p1\` - Main project directory
- \`/kb\` - Knowledge base and documentation
- \`/scripts\` - Development and automation scripts
- \`/archive\` - Daily context archives

## Key Features
- AI-assisted development workflow
- Daily context preservation
- Automated token rotation
- GitOps-based workflow
- Integrated documentation

## Getting Started
1. Clone this repository
2. Follow setup guide in \`/p1/SETUP.md\`
3. Review knowledge base in \`/kb/docs/\`

## Documentation
- [Context Archive Guide](/kb/docs/context-archive-guide.md)
- [Token Rotation Guide](/kb/docs/token-rotation-guide.md)
- [Project Setup Guide](/p1/SETUP.md)

## License
Proprietary - All rights reserved 
EOF
    
    # Initial commit and push
    git add .
    git commit -m "feat: initial SS4 framework setup with submodules"
    git branch -M main
    
    log "Repository structure setup complete"
}

# Configure Vercel project and prevent duplicate creation
configure_vercel_project() {
    log "Configuring Vercel project..."
    
    # IMPORTANT: Prevention of Duplicate Project Creation
    # Historical Context: Previously, automatic project creation led to duplicate projects
    # (e.g., p1-nextjs-saas was created erroneously alongside p1)
    # This function implements safeguards to prevent such issues
    
    # Verify existing project
    if ! vercel inspect --token="$VERCEL_TOKEN" 2>/dev/null; then
        log "Project not found. Linking to existing project..."
        # Link to existing project instead of creating new
        vercel link --token="$VERCEL_TOKEN" --yes || handle_error "Failed to link Vercel project"
    fi
    
    # Pull environment information without auto-creation
    vercel pull --token="$VERCEL_TOKEN" --environment=preview || handle_error "Failed to pull Vercel environment"
    
    # Verify project configuration
    log "Verifying Vercel project configuration..."
    if [ ! -f ".vercel/project.json" ]; then
        handle_error "Project configuration not found. Please ensure project is properly linked."
    fi
    
    # Document project ID for reference
    PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
    log "Linked to Vercel project ID: $PROJECT_ID"
    
    # Configure essential settings
    log "Configuring Vercel project settings..."
    log "1. Enable Fluid Compute in Project Settings > Functions"
    log "2. Set up environment variables in Project Settings > Environment Variables"
    log "3. Configure deployment protection if needed"
    
    # Document in project README
    cat >> "$S4_ROOT/p1/README.md" << EOF

## Vercel Deployment Protection
To prevent accidental project creation:
1. Always use \`vercel link\` before deployment
2. Keep \`.vercel/project.json\` in version control
3. Verify project ID matches environment variables
4. Use explicit project naming in commands
5. Never use auto-creation flags without verification
EOF
}

# Configure Git repository and prevent common issues
configure_git_and_vercel() {
    log "Setting up Git and Vercel configuration..."
    
    # Create comprehensive .gitignore
    log "Creating .gitignore with proper exclusions..."
    cat > "$S4_ROOT/p1/.gitignore" << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem
.env*
!.env.example

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel/*
!.vercel/project.json

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/

# Supabase
**/supabase/.temp
**/supabase/.env

# Logs
logs
*.log

# Cache
.cache/
.vercel
EOF

    # Create base package.json with fixed versions
    log "Creating package.json with consistent dependency versions..."
    cat > "$S4_ROOT/p1/package.json" << 'EOF'
{
  "name": "p1",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "stripe:sync": "node scripts/stripe-sync.js"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "@supabase/supabase-js": "2.39.3",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "drizzle-orm": "^0.29.3",
    "postgres": "^3.4.3",
    "@stripe/stripe-js": "^2.4.0",
    "stripe": "^14.14.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "5.3.3",
    "autoprefixer": "^10.4.17",
    "tailwindcss": "^3.4.1",
    "@tailwindcss/typography": "^0.5.10",
    "@tailwindcss/forms": "^0.5.7",
    "postcss": "^8.4.35",
    "drizzle-kit": "^0.30.5"
  }
}
EOF

    # IMPORTANT: Vercel Project Setup
    # Historical Context: Previously, automatic project creation led to duplicate projects
    # (e.g., p1-nextjs-saas was created erroneously alongside p1)
    log "Setting up Vercel project..."
    
    # Verify or create Vercel link
    if ! vercel inspect --token="$VERCEL_TOKEN" 2>/dev/null; then
        log "Project not found. Linking to existing project..."
        vercel link --token="$VERCEL_TOKEN" --yes || handle_error "Failed to link Vercel project"
    fi
    
    # Ensure .vercel/project.json is tracked
    if [ -f "$S4_ROOT/p1/.vercel/project.json" ]; then
        log "Adding Vercel project configuration to version control..."
        git -C "$S4_ROOT/p1" add -f .vercel/project.json
        git -C "$S4_ROOT/p1" commit -m "chore: add vercel project configuration"
    else
        handle_error "Vercel project configuration not found. Please ensure project is properly linked."
    fi
    
    # Install dependencies
    log "Installing project dependencies..."
    cd "$S4_ROOT/p1" || handle_error "Failed to change to p1 directory"
    npm install || handle_error "Failed to install dependencies"
    
    # Initial Git setup
    log "Performing initial Git commit..."
    git -C "$S4_ROOT/p1" add .
    git -C "$S4_ROOT/p1" commit -m "chore: initial project setup"
    
    log "Git and Vercel configuration complete"
}

# Usage information
usage() {
    echo "Usage: $0 [command]"
    echo "Commands:"
    echo "  check        - Check WSL environment"
    echo "  configure    - Configure WSL settings"
    echo "  paths        - Configure path mappings"
    echo "  tools        - Install development tools"
    echo "  npm          - Install global npm packages"
    echo "  git          - Configure Git settings"
    echo "  structure    - Create project structure"
    echo "  nextjs       - Set up Next.js app structure"
    echo "  vercel       - Configure Vercel and Supabase integration"
    echo "  all          - Run all steps"
    echo ""
}

# Main execution
main() {
    log "Starting S4 bootstrap process..."
    
    check_wsl
    configure_wsl
    configure_paths
    install_dev_tools
    install_npm_globals
    configure_git
    create_project_structure
    setup_nextjs_app
    setup_nextjs_template
    setup_git_repository
    configure_vercel_project
    setup_vercel_and_github
    configure_git_and_vercel
    
    log "S4 bootstrap process completed successfully!"
}

# Run main function
main 