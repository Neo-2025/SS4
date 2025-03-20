# Dashboard & Subscription Feature Guide

## Overview
The dashboard and subscription components provide user account management and subscription tier management with freemium model enabled by default.

## User Dashboard

### Features
- User profile display
- Subscription status overview
- Feature availability based on subscription tier
- Responsive navigation with mobile support

### Routes
- `/dashboard` - Main dashboard page
- `/subscription` - Subscription management page
- `/auth/signout` - Sign-out functionality

### Components
- `DashboardNav` - Navigation component with responsive design
- `SubscriptionPlanCard` - Subscription plan display
- `SubscriptionFeatureTable` - Feature comparison table

## Subscription System

### Data Model
- `SubscriptionTier`: 'free' | 'basic' | 'pro' | 'enterprise'
- `SubscriptionPlan`: Plan details with features and pricing
- `UserSubscription`: User's current subscription information
- Database Table: `user_subscriptions`

### Service Layer
- `SubscriptionService`: Interface for subscription operations
- `createFreeSubscription`: Assigns free tier to new users
- `updateSubscription`: Updates subscription details
- `getUserSubscription`: Retrieves current subscription

### Current Implementation
- Only freemium tier enabled
- All code for premium tiers present but disabled
- Plans marked with `isAvailable: false` are hidden from UI
- Interface adapts automatically when plans become available

## Bootstrap Commands

```bash
# Clone and checkout feature branch
git clone https://github.com/Neo-2025/p1.git
cd p1
git checkout -b feat/dashboard-subscription

# Install dependencies
npm install

# Create subscription table in database
node scripts/create-subscription-table.js

# Build to verify changes
npm run build

# Create PR with detailed description
gh pr create --title "feat(dashboard): implement dashboard with subscription management" --body-file .github/pr-description.md

# Deploy preview
vercel
```

## Important Route Protection
- `/dashboard/*` - Protected by middleware, requires authentication
- `/subscription/*` - Protected by middleware, requires authentication
- `/auth/login` - Redirects authenticated users to dashboard
- `/` - Root redirects to dashboard when authenticated, login when not 