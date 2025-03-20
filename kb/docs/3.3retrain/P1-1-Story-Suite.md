# SS4 Story Suite: Clean P1.1 Implementation with Shadcn/UI and GitHub OAuth

## Prerequisite Story

```yaml
story:
  id: "US-000"
  title: "P1.1 Project Setup with Clean Next.js Template"
  type: "infrastructure"
  priority: "P0"
  complexity: "S"
  dependencies: []
  technical_context:
    architecture: "Next.js App Router"
    stack: ["Next.js 14+", "TypeScript", "Tailwind CSS", "Shadcn/UI"]
    constraints: ["Vercel Deployment", "GitHub Repo Reuse"]
  acceptance_criteria:
    functional:
      - "As a solopreneur, I can get help from Claude 3.7 Sonnet Max (aka Cursor AI Agent)to optimize my dev environment (step by step assing various options in two docs) and scan knowledge base for logic gaps and synthesis (mindful of prior version debt) Note I am cofortable with currrent directory structure under neo@A-AA-9FNSHM2:~/SS4/kb, ./p1, ./script, so best is to conform docs to this initial dir structure
      - "As a solopreneur, I can get help from Claude 3.7 Sonnet Max to add a Stripe user story, and an optional Polygon story, and assess some more advanced pattern context layering
      - "As a solopreneur, I can reuse the existing GitHub repo for my project"
      - "As a solopreneur, I can create a fresh Vercel project linked to existing GitHub repo"
      - "As a solopreneur, I can deploy a clean Next.js template with shadcn/ui"
      - "As a solopreneur, I can get help from Claude 3.7 Sonnet Max to create a clean Next.js template with shadcn/ui"
      - "As a solopreneur, I can reuse Supabase project and GitHub App credentials"
    technical:
      - "Project must use Next.js with App Router"
      - "Project must include proper TypeScript configuration"
      - "Project must include shadcn/ui components"
      - "Project must maintain same Supabase connection details"
    testing:
      - "Successful deployment to Vercel"
      - "Verify environment variables connection to Supabase"
  implementation_notes:
    timeline: "2 hours for initial setup"
```

## Core Story Suite

### US-001: GitHub OAuth Authentication with Shadcn/UI

```yaml
story:
  id: "US-001"
  title: "GitHub OAuth Authentication with Shadcn/UI"
  type: "feature"
  priority: "P0"
  complexity: "M"
  dependencies: ["US-000"]
  technical_context:
    architecture: "Client-Server with SSR fallbacks"
    stack: ["Next.js", "Supabase Auth", "shadcn/ui", "TypeScript"]
    constraints: ["Mobile Responsive", "Progressive Enhancement"]
  acceptance_criteria:
    functional:
      - "As a user, I can log in with GitHub using a prominently displayed button"
      - "As a user, I receive visual feedback during the authentication process"
      - "As a user, I am redirected to a protected landing page upon successful authentication"
      - "As a user, I can see appropriate error messages if authentication fails"
    technical:
      - "Use shadcn/ui Button component for GitHub login"
      - "Implement hybrid auth pattern with client-side fallbacks"
      - "Ensure SSR-safe authentication checks"
      - "Use existing GitHub App credentials from Supabase"
    testing:
      - "Test successful GitHub authentication flow"
      - "Test authentication error handling"
      - "Verify user state persistence across refreshes"
  implementation_notes:
    architecture: "Implement auth with createClientComponentClient for reliability"
    ui_components: "Use shadcn/ui Button, Card, and Toast components"
```

### US-002: Protected Landing Page

```yaml
story:
  id: "US-002"
  title: "Protected Landing Page Post-Authentication"
  type: "feature"
  priority: "P0"
  complexity: "M"
  dependencies: ["US-001"]
  technical_context:
    architecture: "Client-first with static shell"
    stack: ["Next.js", "shadcn/ui", "Tailwind CSS", "TypeScript"]
    constraints: ["Mobile Responsive", "Performance First"]
  acceptance_criteria:
    functional:
      - "As an authenticated user, I see a personalized landing page"
      - "As an authenticated user, I can access basic account information"
      - "As an authenticated user, I can see a logical navigation structure"
      - "As an authenticated user, I can sign out"
    technical:
      - "Static shell with progressive enhancement"
      - "Client-side data fetching with proper loading states"
      - "Fallbacks for server component failures"
      - "Clear separation of authentication logic and UI"
    testing:
      - "Verify page loads properly for authenticated users"
      - "Test sign-out functionality"
      - "Verify unauthorized users cannot access the page"
  implementation_notes:
    architecture: "Implement using static generation with client-side data fetching"
    ui_components: "shadcn/ui Card, Avatar, Button, Sheet components"
```

## Foundation Story Suite for SaaS Patterns

### US-003: User Profile Management

```yaml
story:
  id: "US-003"
  title: "User Profile Management"
  type: "feature"
  priority: "P1"
  complexity: "M"
  dependencies: ["US-002"]
  technical_context:
    architecture: "Form-based with optimistic updates"
    stack: ["Next.js", "shadcn/ui", "react-hook-form", "zod", "Supabase"]
    constraints: ["Data Validation", "User Experience"]
  acceptance_criteria:
    functional:
      - "As a user, I can view my profile information"
      - "As a user, I can update basic profile details"
      - "As a user, I receive appropriate feedback on submission"
      - "As a user, I see validation errors when providing invalid data"
    technical:
      - "Implement form validation with zod"
      - "Use optimistic UI updates"
      - "Maintain user session state"
      - "Implement proper error handling"
  implementation_notes:
    data_model: "Create profiles table in Supabase with user_id relation"
```

### US-004: Basic Dashboard Framework

```yaml
story:
  id: "US-004"
  title: "Basic Dashboard Framework"
  type: "component"
  priority: "P1"
  complexity: "M"
  dependencies: ["US-002"]
  technical_context:
    architecture: "Component-based layout"
    stack: ["Next.js", "shadcn/ui", "Tailwind CSS"]
    constraints: ["Mobile Responsive", "Accessibility"]
  acceptance_criteria:
    functional:
      - "As a user, I can navigate between different dashboard sections"
      - "As a user, I can see consistent layout across dashboard pages"
      - "As a user, I can use dashboard on mobile and desktop devices"
    technical:
      - "Implement responsive sidebar navigation"
      - "Create layout components for dashboard structure"
      - "Ensure WCAG 2.1 AA compliance"
      - "Implement static shell with dynamic content areas"
  implementation_notes:
    ui_components: "shadcn/ui layout primitives, navigation components"
```

### US-005: Subscription Plans Display

```yaml
story:
  id: "US-005"
  title: "Subscription Plans Display"
  type: "feature"
  priority: "P1"
  complexity: "M"
  dependencies: ["US-004"]
  technical_context:
    architecture: "Static content with dynamic UI"
    stack: ["Next.js", "shadcn/ui", "Tailwind CSS"]
    constraints: ["UI Consistency", "Performance"]
  acceptance_criteria:
    functional:
      - "As a user, I can view available subscription plans"
      - "As a user, I can compare features across different plans"
      - "As a user, I can see my current subscription status"
    technical:
      - "Create reusable plan component"
      - "Implement responsive pricing grid"
      - "Fetch plans data from API endpoints"
      - "Add visual indication for current plan"
  implementation_notes:
    ui_components: "shadcn/ui Card, Badge, Table components"
```

### US-005B: Stripe Subscription Management

```yaml
story:
  id: "US-005B"
  title: "Stripe Subscription Management"
  type: "feature"
  priority: "P0"
  complexity: "L"
  dependencies: ["US-004", "US-005"]
  technical_context:
    architecture: "Client-Server with Stripe Integration"
    stack: ["Next.js", "Stripe API", "shadcn/ui", "TypeScript", "Supabase"]
    constraints: ["PCI Compliance", "Security", "User Experience"]
  acceptance_criteria:
    functional:
      - "As a user, I can select a subscription plan and proceed to checkout"
      - "As a user, I can complete payment using Stripe Checkout"
      - "As a user, I can view my current subscription status in the dashboard"
      - "As a user, I can update my payment method through Stripe Customer Portal"
      - "As a user, I can upgrade, downgrade, or cancel my subscription"
      - "As a user, I can see my billing history and download invoices"
      - "As an admin, I can receive notifications for subscription events"
    technical:
      - "Integrate Stripe Pricing Tables for plan selection"
      - "Implement Stripe Checkout for secure payment processing"
      - "Set up Stripe Customer Portal for subscription management"
      - "Configure Stripe webhooks to track subscription events"
      - "Create database schema for tracking subscription status"
      - "Implement subscription status checks for feature access control"
      - "Ensure proper error handling for payment failures"
    testing:
      - "Test successful checkout flow with Stripe test cards"
      - "Verify webhook handling for subscription events"
      - "Test subscription upgrades and downgrades"
      - "Verify proper subscription status updates in the database"
  implementation_notes:
    architecture: |
      The subscription system follows a modern Stripe integration pattern with these components:
      
      1. Client-side subscription selection using Stripe Pricing Tables
      2. Server-side checkout session creation for security
      3. Webhook handling for subscription lifecycle events
      4. Customer Portal integration for self-service management
      
    data_model: |
      Database tables required:
      - customers: Links users to Stripe customer IDs
      - subscriptions: Tracks subscription status, plan type, and period
      - payment_methods: Stores payment method details (tokenized)
      - invoices: Records invoice history
      
    stripe_setup: |
      1. Configure Stripe Products and Prices in dashboard
      2. Create Stripe Pricing Table for embedded display
      3. Configure webhook endpoints with proper event signatures
      4. Set up Customer Portal with branding and allowed actions
      
    security_considerations: |
      - Never process payments on server to maintain PCI compliance
      - Verify webhook signatures to prevent fraudulent events
      - Use environment variables for all Stripe API keys
      - Implement proper CORS and CSP headers for checkout
      
    ui_components: |
      - Stripe Pricing Table component with custom theme
      - shadcn/ui Dialog for checkout confirmation
      - Subscription status Badge for dashboard
      - Payment history Table with download options
      - Customer Portal launcher Button
```

### US-006: Basic API Infrastructure

```yaml
story:
  id: "US-006"
  title: "Basic API Infrastructure"
  type: "infrastructure"
  priority: "P2"
  complexity: "L"
  dependencies: ["US-002", "US-005B"]
  technical_context:
    architecture: "API Routes with tRPC"
    stack: ["Next.js", "tRPC", "TypeScript", "Zod"]
    constraints: ["Type Safety", "Performance", "Security"]
  acceptance_criteria:
    functional:
      - "As a developer, I can create type-safe API endpoints"
      - "As a developer, I can validate request inputs"
      - "As a developer, I can handle authentication in API routes"
    technical:
      - "Set up tRPC router structure"
      - "Implement input validation with Zod"
      - "Create authentication middleware"
      - "Add error handling utilities"
  implementation_notes:
    architecture: "Follow trpc.io recommendations for Next.js App Router"
```

### US-007: CLI-like UI for March Madness Bracket Challenge

```yaml
story:
  id: "US-007"
  title: "CLI-like UI for March Madness Bracket Challenge"
  type: "feature"
  priority: "P1"
  complexity: "L"
  dependencies: ["US-001", "US-002", "US-004"]
  technical_context:
    architecture: "Command-based UI with role-specific actions"
    stack: ["Next.js", "shadcn/ui", "TypeScript", "Supabase"]
    constraints: ["Real-time Updates", "Role-based Access Control", "User Experience"]
  acceptance_criteria:
    functional:
      - "As a game user, I receive 100 tokens upon first login via GitHub OAuth"
      - "As a game user, I can use commands to select winners for tournament games (e.g., >s E1, W16, S6, NE10)"
      - "As a game user, I can view my current selections, token balance, and standings"
      - "As a game user, I can view a leaderboard after each round (>lb)"
      - "As a game user, I can access help documentation with the >h command"
      - "As an admin, I can set up game pairs (>gp E1vE16, E2vE15, etc.)"
      - "As an admin, I can declare round winners (>w E1, E2, etc.)"
      - "As an admin, I can open/close selection windows for rounds (>o 64r, >c 64r)"
    technical:
      - "Implement command parser with role-based authorization"
      - "Create token management system with transaction history"
      - "Develop real-time leaderboard with user rankings"
      - "Implement automatic default selections for users who miss selection windows"
      - "Create admin panel for tournament management"
    testing:
      - "Test command parsing and execution for different roles"
      - "Verify token distribution and wagering mechanics"
      - "Test round progression and scoring logic"
      - "Verify leaderboard calculations"
  implementation_notes:
    architecture: |
      Terminal-like UI with command input and response display.
      Split implementation into:
      1. Command parser service
      2. Role-based command handlers
      3. Tournament state management
      4. Real-time leaderboard calculations
      
    data_model: |
      - users: Track user profiles and token balances
      - tournaments: Store tournament metadata
      - rounds: Track round status (open/closed) and deadlines
      - games: Store game pairs and outcomes
      - selections: Store user selections and wagers
      - transactions: Record token movements
      
    command_syntax: |
      Game User Commands:
      - >s [REGION][SEED]          # Select team (E1, W16, S6, NE10)
      - >lb                        # View leaderboard
      - >h                         # Help documentation
      - >b                         # View token balance and selections
      
      Admin Commands:
      - >gp [REGION][SEED]v[REGION][SEED]   # Create game pair
      - >w [REGION][SEED]                   # Declare winner
      - >o [ROUND]                         # Open selection window
      - >c [ROUND]                         # Close selection window
      
    game_mechanics: |
      - Users receive 100 tokens on first login
      - All tokens must be wagered across selections for each round
      - Default selection is the lower seed (underdog) if user fails to make selections
      - Scoring based on correct predictions and tokens wagered
      - Tiebreaker is earliest GitHub login timestamp
      
    ui_components: |
      - Command input with autocomplete using shadcn/ui Command component
      - Response display with shadcn/ui ScrollArea
      - Tournament bracket visualization
      - Real-time leaderboard with shadcn/ui Table
```

### US-008: Perplexity API Integration for Pregame Hype Summaries

```yaml
story:
  id: "US-008"
  title: "Perplexity API Integration for Pregame Hype Summaries"
  type: "feature"
  priority: "P1"
  complexity: "M"
  dependencies: ["US-001", "US-006", "US-007"]
  technical_context:
    architecture: "API Client with Content Generation"
    stack: ["Next.js", "shadcn/ui", "TypeScript", "Perplexity API"]
    constraints: ["API Rate Limiting", "Content Moderation", "Response Time"]
  acceptance_criteria:
    functional:
      - "As a game user, I can request pregame hype summaries using the >pg command (e.g., >pg E1vE16)"
      - "As a game user, I receive an engaging, informative summary about the matchup"
      - "As a game user, I can see team statistics, history, and predictions in the summary"
      - "As a game user, I can share the generated hype summary with others"
      - "As an admin, I can configure prompts used for generating hype content"
    technical:
      - "Implement secure Perplexity API client with proper error handling"
      - "Create effective prompt templates for consistent, high-quality summaries"
      - "Implement caching to prevent duplicate API calls for the same matchup"
      - "Handle API rate limits and provide appropriate feedback to users"
      - "Format AI responses for readability in the CLI interface"
    testing:
      - "Test API connection and response handling"
      - "Verify cache functionality for repeated requests"
      - "Test response formatting and display"
      - "Verify rate limit handling"
  implementation_notes:
    architecture: |
      Create a dedicated Perplexity API service with:
      1. API client configuration
      2. Prompt template management
      3. Response caching
      4. Rate limit handling
      
    data_model: |
      - pregame_summaries: Cache generated summaries with game_id reference
      - prompt_templates: Store customizable prompt templates for different content types
      
    prompt_design: |
      Base prompt template for pregame hype:
      
      """
      Generate an engaging pregame hype summary for a March Madness basketball matchup between {team1} ({seed1}) and {team2} ({seed2}).
      
      Include:
      1. Team backgrounds and season performance
      2. Key players to watch
      3. Historical matchup data if available
      4. Interesting storylines
      5. Statistical comparison
      6. Expert predictions
      
      Format the response conversationally as an exciting sports analyst would, highlighting the drama and excitement of the matchup. Keep it concise but comprehensive (around 250-300 words).
      """
      
    command_handler: |
      The >pg command parses the matchup identifier (e.g., E1vE16) to:
      1. Identify the teams involved
      2. Check cache for existing summary
      3. Generate new summary via Perplexity if needed
      4. Format and display the response
      5. Save to cache for future requests
      
    ui_components: |
      - Add styled output for pregame summaries using shadcn/ui Card and Typography
      - Include share button for copying summary to clipboard
      - Add loading indicator during API calls
```

## Advanced Feature Stories

These stories represent more advanced capabilities that extend the core SaaS functionality with emerging technologies. They are optional and considered stretch goals for future implementation.

### US-009: Polygon 2.0 Integration Foundation

```yaml
story:
  id: "US-009"
  title: "Polygon 2.0 Integration Foundation (Optional)"
  type: "infrastructure"
  priority: "P3"
  complexity: "XL"
  dependencies: ["US-005B", "US-006"]
  technical_context:
    architecture: "Modular Web3 Integration"
    stack: ["Next.js", "Polygon 2.0 SDK", "ethers.js", "TypeScript", "Supabase"]
    constraints: ["Optional Integration", "Future Compatibility", "Security", "Gas Optimization"]
  acceptance_criteria:
    functional:
      - "As a developer, I can optionally enable Polygon 2.0 features with minimal configuration"
      - "As a developer, I can connect to Polygon testnet and mainnet environments"
      - "As an application, I can maintain dual persistence (traditional DB + blockchain) with data consistency"
      - "As a user, I can connect existing wallets for authentication and transactions"
      - "As a user, I can opt into blockchain-backed features when available"
      - "As an admin, I can monitor blockchain interactions and resource usage"
      - "As a system owner, I can deploy smart contracts using templates for different use cases"
    technical:
      - "Implement pluggable architecture for optional Polygon integration"
      - "Create abstraction layer for blockchain interactions"
      - "Develop smart contract templates for common use cases (tokens, NFTs, royalties)"
      - "Implement wallet connection with multiple providers"
      - "Create dual-persistence system with conflict resolution"
      - "Set up gas fee estimation and optimization"
      - "Configure secure key management and transaction signing"
    testing:
      - "Test wallet connection and authentication"
      - "Verify transaction signing and sending"
      - "Test smart contract deployment and interaction"
      - "Validate dual-persistence synchronization"
      - "Benchmark performance with and without blockchain features"
  implementation_notes:
    architecture: |
      The Polygon 2.0 integration follows a modular, pluggable architecture:
      
      1. Core system functions without requiring blockchain
      2. Optional Web3 modules can be enabled/disabled
      3. Abstraction layer separates business logic from blockchain implementation
      4. Feature flagging for blockchain-dependent features
      5. Graceful fallbacks when blockchain features are unavailable
      
    use_cases: |
      Designed to support multiple Web3 use cases:
      
      - NFT creation and management (e.g., athlete cards, digital collectibles)
      - Smart contract-based royalty distribution (e.g., oil & gas royalties)
      - In-app token economies with real value
      - Transparent record-keeping with immutable audit trails
      - Fractional ownership of digital and physical assets
      
    implementation_approach: |
      Phased implementation with focus on future compatibility:
      
      1. Core infrastructure and abstraction layer
      2. Wallet connection and basic transactions
      3. Smart contract templates for specific verticals
      4. Admin tools for monitoring and management
      5. User-facing features built on blockchain capabilities
      
    smart_contract_templates: |
      Provide templates for common use cases:
      
      - ERC-20 token contracts for in-app economies
      - ERC-721/1155 contracts for NFT creation
      - Royalty distribution contracts with verification
      - Access control contracts for premium features
      - Multi-signature contracts for group decisions
      
    security_considerations: |
      - Implement strict key management practices
      - Use well-audited contract templates
      - Maintain comprehensive testing for all smart contracts
      - Implement transaction signing confirmation UI
      - Support hardware wallet integration for enhanced security
      - Provide clear documentation on security best practices
      
    performance_optimization: |
      - Implement off-chain state management with blockchain verification
      - Use batch transactions when appropriate
      - Cache blockchain data with appropriate invalidation
      - Monitor gas prices and optimize transaction timing
      - Implement layer 2 solutions for high-volume operations
      
    ui_components: |
      - Wallet connection modal with provider selection
      - Transaction confirmation dialogs with fee estimation
      - Blockchain activity monitoring dashboard
      - Asset gallery for NFT display and management
      - Token balance and transaction history views
```

## SS4-B1 Implementation Approach

To implement this story suite following the SS4-B1 workflow:

1. **Initial Project Setup**
   ```bash
   # Create p1.1 in Vercel dashboard
   # Clone existing repo
   git clone https://github.com/your-username/p1.git p1.1
   cd p1.1
   
   # Create clean Next.js project in a separate directory
   npx create-next-app@latest clean-next --typescript --tailwind --eslint --app --src-dir
   
   # Install shadcn/ui
   cd clean-next
   npx shadcn-ui@latest init
   
   # Create a new branch in the original repo
   cd ../p1.1
   git checkout -b feat/clean-rebuild
   
   # Copy clean project files
   cp -r ../clean-next/* .
   
   # Commit and push
   git add .
   git commit -m "feat: clean rebuild with Next.js and shadcn/ui [SS4-B1]"
   git push -u origin feat/clean-rebuild
   ```

2. **For each user story**:
   - Create a new branch: `git checkout -b feat/us-001-github-auth`
   - Implement the feature following XS-sized commits
   - Document the pattern in the knowledge base
   - Create PR and deploy preview
   - Test functionality
   - Merge and move to next story

## Implementation Timeline

1. **US-000**: Project Setup (2 hours)
2. **US-001**: GitHub Authentication (4 hours)
3. **US-002**: Protected Landing Page (4 hours)
4. **US-003-006**: Additional SaaS patterns (2-3 days)
5. **US-007**: CLI-like UI for March Madness (1-2 days)
6. **US-008**: Perplexity API Integration (1 day)

## Implementation Details

### 1. Command Parser Component

```tsx
'use client';

import { useState } from 'react';
import { Command } from '@/components/ui/command';
import { parseCommand } from '@/lib/command-parser';

export function TerminalUI({ role = 'user' }) {
  const [history, setHistory] = useState<CommandResponse[]>([]);
  const [input, setInput] = useState('');
  
  const handleCommand = async (cmd: string) => {
    setInput('');
    setHistory(prev => [...prev, { type: 'input', content: cmd }]);
    
    try {
      const response = await parseCommand(cmd, role);
      setHistory(prev => [...prev, { 
        type: 'output', 
        content: response.message,
        data: response.data 
      }]);
    } catch (error) {
      setHistory(prev => [...prev, { 
        type: 'error', 
        content: error.message 
      }]);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto p-4 bg-black text-green-400 font-mono">
        {history.map((entry, i) => (
          <div key={i} className={entry.type === 'error' ? 'text-red-400' : ''}>
            {entry.type === 'input' ? '> ' : ''}{entry.content}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-800 p-2">
        <Command 
          className="w-full" 
          placeholder={role === 'admin' ? "Enter admin command..." : "Enter command..."}
          value={input}
          onValueChange={setInput}
          onKeyDown={e => e.key === 'Enter' && handleCommand(input)}
        />
      </div>
    </div>
  );
}
```

### 2. Tournament State Management

```typescript
// lib/tournament-manager.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Round = '64' | '32' | '16' | '8' | '4' | '2' | '1';

export async function openSelectionWindow(round: Round) {
  const supabase = createClientComponentClient();
  return supabase
    .from('rounds')
    .update({ status: 'open', updated_at: new Date() })
    .eq('round_number', round);
}

export async function closeSelectionWindow(round: Round) {
  const supabase = createClientComponentClient();
  
  // Close the window
  await supabase
    .from('rounds')
    .update({ status: 'closed', updated_at: new Date() })
    .eq('round_number', round);
    
  // Apply default selections for users who didn't choose
  return applyDefaultSelections(round);
}

async function applyDefaultSelections(round: Round) {
  // Logic to find users without selections and apply defaults
  // (selecting underdogs for all games in the round)
}
```

### 3. Token Management System

```typescript
// lib/token-manager.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function distributeInitialTokens(userId: string) {
  const supabase = createClientComponentClient();
  
  // Check if user already has tokens
  const { data: existingBalance } = await supabase
    .from('users')
    .select('token_balance')
    .eq('id', userId)
    .single();
    
  if (existingBalance && existingBalance.token_balance > 0) {
    return { success: false, message: 'User already has tokens' };
  }
  
  // Distribute initial tokens
  await supabase
    .from('users')
    .update({ token_balance: 100 })
    .eq('id', userId);
    
  // Record transaction
  await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      amount: 100,
      type: 'initial',
      description: 'Initial token distribution'
    });
    
  return { success: true, message: 'Distributed 100 tokens' };
}
```

### 4. Perplexity API Client

```typescript
// lib/perplexity.ts
import { cache } from 'react';

interface PerplexityOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

const defaultOptions: PerplexityOptions = {
  model: 'pplx-7b-online',
  temperature: 0.7,
  max_tokens: 500
};

export const getPerplexityResponse = cache(async (
  prompt: string, 
  options: PerplexityOptions = {}
) => {
  const mergedOptions = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: mergedOptions.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: mergedOptions.temperature,
        max_tokens: mergedOptions.max_tokens
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Perplexity API error: ${error.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
});
```

### 5. Pregame Hype Command Handler

```typescript
// lib/commands/pregame-hype.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getPerplexityResponse } from '@/lib/perplexity';
import { getTeamDetails } from '@/lib/tournament-data';

export async function handlePregameHypeCommand(matchup: string) {
  // Parse matchup (e.g., "E1vE16")
  const matchRegex = /([NESW])(\d+)v([NESW])(\d+)/i;
  const match = matchup.match(matchRegex);
  
  if (!match) {
    return {
      success: false,
      message: 'Invalid matchup format. Please use format like "E1vE16".'
    };
  }
  
  const [_, team1Region, team1Seed, team2Region, team2Seed] = match;
  const team1Id = `${team1Region}${team1Seed}`;
  const team2Id = `${team2Region}${team2Seed}`;
  
  // Check cache first
  const supabase = createClientComponentClient();
  const { data: cachedSummary } = await supabase
    .from('pregame_summaries')
    .select('content, created_at')
    .eq('matchup', matchup)
    .single();
    
  // If cache is less than 6 hours old, use it
  if (cachedSummary) {
    const cacheTime = new Date(cachedSummary.created_at);
    const hoursSinceCached = (Date.now() - cacheTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCached < 6) {
      return {
        success: true,
        message: '🏀 Pregame Hype Summary 🏀',
        data: {
          content: cachedSummary.content,
          cached: true
        }
      };
    }
  }
  
  // Get team details to enhance the prompt
  const team1 = await getTeamDetails(team1Id);
  const team2 = await getTeamDetails(team2Id);
  
  if (!team1 || !team2) {
    return {
      success: false,
      message: 'Team details not found. Has this matchup been set up?'
    };
  }
  
  // Generate the prompt
  const prompt = `
  Generate an engaging pregame hype summary for a March Madness basketball matchup between ${team1.name} (${team1Region}-${team1Seed}) and ${team2.name} (${team2Region}-${team2Seed}).
  
  Include:
  1. Team backgrounds and season performance
  2. Key players to watch
  3. Historical matchup data if available
  4. Interesting storylines
  5. Statistical comparison
  6. Expert predictions
  
  Format the response conversationally as an exciting sports analyst would, highlighting the drama and excitement of the matchup. Keep it concise but comprehensive (around 250-300 words).
  `;
  
  try {
    // Call Perplexity API
    const content = await getPerplexityResponse(prompt, {
      temperature: 0.8, // Slightly higher for more creative content
    });
    
    // Cache the result
    await supabase
      .from('pregame_summaries')
      .upsert({
        matchup,
        content,
        created_at: new Date().toISOString()
      });
    
    return {
      success: true,
      message: '🏀 Pregame Hype Summary 🏀',
      data: {
        content,
        cached: false
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Error generating preview: ${error.message}`
    };
  }
}
```

### 6. Hype Display Component

```tsx
// components/HypeDisplay.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';

interface HypeDisplayProps {
  content: string;
  matchup: string;
  cached?: boolean;
}

export function HypeDisplay({ content, matchup, cached }: HypeDisplayProps) {
  const shareHype = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Toast notification for success
    } catch (error) {
      // Toast notification for error
    }
  };
  
  return (
    <Card className="my-4 bg-blue-50 border border-blue-200">
      <CardHeader className="bg-blue-600 text-white">
        <CardTitle className="flex justify-between items-center">
          <span>Matchup Preview: {matchup}</span>
          {cached && <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Cached</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 whitespace-pre-wrap font-serif">
        {content}
      </CardContent>
      <CardFooter className="flex justify-end bg-blue-50">
        <Button variant="outline" size="sm" onClick={shareHype}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Database Schema

### Tournament Database Schema

```sql
-- Database schema for March Madness bracket challenge

-- Track user profiles and token balances
create table public.users (
  id uuid primary key references auth.users(id),
  email text not null,
  username text,
  token_balance integer not null default 0,
  created_at timestamp with time zone default now()
);

-- Tournament rounds
create table public.rounds (
  id uuid primary key default uuid_generate_v4(),
  round_number text not null,
  status text not null default 'closed',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Game pairs in each round
create table public.games (
  id uuid primary key default uuid_generate_v4(),
  round_id uuid references public.rounds(id),
  team1 text not null,
  team2 text not null,
  winner text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- User selections
create table public.selections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  game_id uuid references public.games(id),
  selected_team text not null,
  tokens_wagered integer not null,
  is_default boolean default false,
  created_at timestamp with time zone default now()
);

-- Token transactions
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  amount integer not null,
  type text not null,
  description text,
  created_at timestamp with time zone default now()
);
```

### Perplexity Integration Schema

```sql
-- Store game details for enhancing prompts
create table public.teams (
  id text primary key,  -- E.g., 'E1', 'W16'
  name text not null,
  mascot text,
  record text,
  conference text,
  key_players jsonb,
  stats jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Cache pregame summaries
create table public.pregame_summaries (
  id uuid primary key default uuid_generate_v4(),
  matchup text not null unique,  -- E.g., 'E1vE16'
  content text not null,
  created_at timestamp with time zone default now()
);

-- Store customizable prompts
create table public.prompt_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  content text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Environment Variables

Essential environment variables for the project:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=your-app.vercel.app

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Perplexity API
PERPLEXITY_API_KEY=your-perplexity-api-key
NEXT_PUBLIC_ENABLE_PERPLEXITY=true
```

## Conclusion

This story suite provides a comprehensive plan for rebuilding the P1.1 project with a clean implementation based on Next.js, shadcn/ui, and Supabase, while preserving the valuable GitHub OAuth integration. The March Madness bracket challenge serves as an engaging testbed application that demonstrates the implementation of core SaaS patterns.

By following the SS4-B1 workflow and implementing these user stories incrementally, you can create a robust foundation for future SaaS applications while maintaining a clean, maintainable codebase. 