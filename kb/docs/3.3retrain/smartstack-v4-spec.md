# SmartStack v4 (SS4) Specification

## Overview
SmartStack v4 (S4) is a development framework designed for efficient MVP development using AI-assisted development tools, particularly Cursor AI. The framework integrates Branch-First workflow (B1) principles and is specifically tailored to guide solopreneurs through the implementation of the P1.1 story suite.

## Core Principles

### 1. AI-First Development
- Leverage CursorAI for development tasks
- Maintain clear context across threads
- Use structured prompts following SS4-B1 format
- Document decisions and patterns in knowledge base

### 2. Branch-First (B1) Workflow
- Create dedicated branches before any code changes
- Isolate changes to single features or fixes
- Deploy and verify in preview environments
- Document changes with conventional commits
- Maintain consistent workflow across all development

### 3. Story-Driven Development
- Follow the P1.1 story suite implementation sequence
- Adhere to clearly defined acceptance criteria
- Implement stories in dependency order
- Document pattern discoveries during implementation

### 4. Context Management
- Update current story focus in thread training document
- Document successful patterns in `kb/patterns/`
- Maintain implementation status in `SAAS_TEMPLATE_STATUS.md`
- Preserve context across multiple AI assistance threads

### 5. Complexity Management
- Track story suite metrics
- Maintain pattern catalog
- Document architectural decisions
- Implement optimization strategies

### 6. Pattern Stewardship
- Identify and document reusable patterns
- Maintain pattern qualification process
- Track pattern usage and adaptations
- Evolve patterns based on implementation feedback

## Architectural Decisions

SS4 has established the following architectural decisions:

### 1. Pattern Stewardship Framework (ADR-0001)
- Formal pattern documentation in pattern catalog
- Pattern qualification process (Draft → Candidate → Qualified)
- Story complexity metrics tracking
- Pattern usage metrics

### 2. SS4 Optimizations (ADR-0002)
- Cursor AI UI Design System for consistent styling
- ESLint + TypeScript for code quality
- React Query for data fetching
- Jest + React Testing Library for testing

### 3. Project Structure (ADR-0003)
- Clean p1.1 implementation with Next.js 14+
- Specific directory structure for components, lib, etc.
- Hierarchical environment configuration
- GitHub + Vercel deployment workflow

### 4. Hybrid Authentication (ADR-0004)
- Client-side components with loading states
- Server-side callback handlers
- Middleware for protected routes
- Absolute URL handling for cross-environment compatibility

### 5. Dependency Versions and ORM Strategy (ADR-0005)
- Specific versions for all dependencies
- Native Supabase query API instead of an ORM
- Simplified stack with focused functionality
- Future-proof dependency choices

## Project Prerequisites

### Development Environment
- WSL2 with Ubuntu 20.04 LTS
- Node.js 18+ LTS
- Git with GitHub CLI (`gh`)
- Vercel CLI
- Cursor Editor with Claude 3.7+ integration

### Accounts and Services
- GitHub account with repository access
- Vercel account with project setup
- Supabase account with project configured
- Perplexity API access (for specific stories)

### Project Structure
```
SS4/
├── p1.1/                       # Main project directory
│   ├── app/                    # Next.js application
│   │   ├── api/                # API routes
│   │   ├── auth/               # Auth-related pages
│   │   ├── dashboard/          # Protected dashboard
│   │   └── game/               # March Madness game UI
│   ├── components/             # UI components
│   │   ├── ui/                 # UI primitives
│   │   ├── auth/               # Auth components
│   │   └── game/               # Game components
│   ├── lib/                    # Utility libraries
│   │   ├── auth/               # Auth utilities
│   │   ├── supabase/           # Supabase clients
│   │   └── utils/              # General utilities
│   ├── providers/              # React context providers
│   └── public/                 # Static assets
├── kb/                         # Knowledge base
│   ├── docs/                   # Documentation
│   │   ├── P1-1-Story-Suite.md # Story definitions
│   │   ├── S4-B1-workflow.md   # Workflow documentation
│   │   └── smartstack-v4-spec.md # This specification
│   └── ADR/                    # Architectural decisions
│       ├── ADR-0001-pattern-stewardship-framework.md
│       ├── ADR-0002-ss4-optimizations.md
│       ├── ADR-0003-project-structure.md
│       ├── ADR-0004-hybrid-authentication-strategy.md
│       └── ADR-0005-dependency-versions-orm-strategy.md
├── ss4/                        # SmartStack v4 infrastructure
│   ├── patterns/               # Pattern catalog
│   │   ├── authentication/     # Auth-related patterns
│   │   ├── ui/                 # UI patterns
│   │   ├── data/               # Data patterns
│   │   └── integration/        # Integration patterns
│   ├── metrics/                # Complexity metrics
│   └── scripts/                # Utility scripts
└── SS4-P1.1-new-thread-training # Thread training guide
```

## Solopreneur (S) Responsibilities

### Planning and Organization
- Update current story focus in thread training document
- Ensure story prerequisites are completed before starting new stories
- Track implementation status in `SAAS_TEMPLATE_STATUS.md`
- Maintain knowledge base with newly discovered patterns

### Implementation
- Follow SS4-B1 workflow consistently
- Create properly named branches for each feature
- Review and test all code before merging
- Document implementation decisions

### Documentation
- Document successful patterns discovered during implementation
- Update status documentation after each story completion
- Maintain technical debt log in status document
- Create clear usage examples for reusable components

### Maintenance
- Review and approve pull requests
- Verify preview deployments before merging
- Ensure proper environment configuration
- Maintain consistent dependency versions

### Pattern Stewardship
- Identify and document reusable patterns
- Follow pattern qualification process
- Track pattern usage and adaptations
- Promote pattern reuse across stories

## Minimum Knowledge Requirements

### Technical Knowledge
- JavaScript/TypeScript fundamentals
- React and Next.js basics
- Git branching and PR workflow
- Basic understanding of authentication flows
- Fundamental database concepts

### Process Knowledge
- SS4-B1 workflow steps
- Preview deployment verification
- Documentation requirements
- Pattern recognition and documentation

### Tool Proficiency
- Cursor Editor operations
- Git command line usage
- GitHub PR workflow
- Vercel deployment process
- Basic WSL navigation

## Daily/Weekly Maintenance Best Practices

### Daily Practices
- Start each session by updating current story focus
- Begin new features with properly named branches
- Document newly discovered patterns
- Commit changes with conventional commit messages
- Test in preview environment before merging

### Weekly Practices
- Review and update `SAAS_TEMPLATE_STATUS.md`
- Clean up stale branches
- Verify environment variables are properly set
- Update knowledge base with new patterns
- Plan next story implementations

### Monthly Practices
- Conduct dependency updates
- Review and refine pattern documentation
- Analyze technical debt and create reduction plan
- Evaluate workflow efficiency and make adjustments

## CursorAI Agent Prompting Guidelines

### Effective Prompting Patterns
- Begin new threads with reference to SS4-P1.1-new-thread-training
- Update current story section with specific story details
- Use the special commands defined in the training document
- Provide clear implementation context
- Request specific workflow steps

### Best Practices
- Use structured prompts that follow the response format
- Begin each session with clear story context
- Reference specific sections of documentation
- Request step-by-step guidance for complex implementations
- Ask for pattern documentation when solutions are reusable

### What Not To Do
- Avoid vague or ambiguous requests
- Don't mix multiple stories in a single thread
- Avoid bypassing the branch-first workflow
- Don't neglect documentation updates
- Avoid inconsistent commit messages
- Don't skip preview deployment testing
- Avoid working directly on main branch

## Implementation Guidelines for P1.1 Story Suite

### Story Suite Navigation
The P1.1 story suite defines a clear implementation path for a SaaS application with:

1. **US-000**: Project setup foundation (P0 priority)
2. **US-001**: GitHub OAuth authentication (P0 priority)
3. **US-002**: Protected landing page (P0 priority)
4. **US-003 to US-006**: Core SaaS patterns (P1-P2 priorities)
5. **US-007**: CLI-like UI for March Madness (P1 priority)
6. **US-008**: Perplexity API integration (P1 priority)

### Implementation Flow
- Follow the defined story dependencies
- Complete prerequisites before starting dependent stories
- Implement with technology choices specified in stories
- Use the SS4-B1 workflow consistently for each story

### Quality Standards
- Code implements acceptance criteria without excess scope
- Documentation describes implementation decisions
- Successful patterns are extracted to knowledge base
- Deployed previews function as expected
- TypeScript typing is properly implemented

## Technical Stack

### Frontend
- Next.js 15.2.3 (App Router)
- TypeScript 5.4.3
- Tailwind CSS 3.4.1 with Cursor AI Design System
- shadcn/ui components
- lucide-react 0.363.0 for icons

### Authentication and Database
- Supabase Auth Helpers 0.9.2
- Supabase JS 2.39.7
- Native Supabase query API (no ORM)

### Data Fetching and State Management
- TanStack Query 5.27.2
- TanStack Query DevTools 5.27.2

### Form Handling and Validation
- React Hook Form 7.51.1
- Zod 3.22.4
- hookform/resolvers 3.3.4

### Testing
- Jest 29.7.0
- React Testing Library 14.2.1
- Testing Library Jest DOM 6.4.2
- Jest Environment JSDOM 29.7.0

### Development
- ESLint 8.57.0
- ESLint Config Next 15.2.3
- TypeScript ESLint Plugin 7.2.0
- TypeScript ESLint Parser 7.2.0
- ESLint Plugin React 7.34.0
- ESLint Plugin React Hooks 4.6.0
- Git for version control
- Vercel for deployment

## Installation Commands

```bash
# Create Next.js project with the right configurations
npx create-next-app@15.2.3 . --typescript --tailwind --eslint --app

# Install authentication dependencies
npm install @supabase/auth-helpers-nextjs@0.9.2 @supabase/supabase-js@2.39.7

# Install data fetching
npm install @tanstack/react-query@5.27.2 @tanstack/react-query-devtools@5.27.2

# Install form handling
npm install react-hook-form@7.51.1 @hookform/resolvers@3.3.4 zod@3.22.4

# Install UI components
npm install lucide-react@0.363.0
npx shadcn-ui@0.8.0 init

# Install testing tools
npm install -D jest@29.7.0 @testing-library/react@14.2.1 @testing-library/jest-dom@6.4.2 jest-environment-jsdom@29.7.0

# Install ESLint plugins
npm install -D eslint@8.57.0 eslint-config-next@15.2.3 @typescript-eslint/eslint-plugin@7.2.0 @typescript-eslint/parser@7.2.0 eslint-plugin-react@7.34.0 eslint-plugin-react-hooks@4.6.0
```

## Success Metrics

### Implementation
- All P0 and P1 stories successfully implemented
- Stories follow acceptance criteria
- Preview deployments function as expected
- No critical bugs in production

### Process
- Consistent use of SS4-B1 workflow
- Proper documentation of implementation decisions
- Pattern extraction and documentation
- Technical debt management

### Efficiency
- Reduced development time through AI assistance
- Reuse of established patterns
- Minimal context switching between threads
- Effective preview testing

## Current Status of US-001

The current implementation status for US-001:

1. **Architectural Decisions**:
   - Pattern Stewardship Framework established
   - SS4 Optimizations selected
   - Project Structure defined
   - Hybrid Authentication Strategy designed
   - Dependency Versions and ORM Strategy decided

2. **Pattern Infrastructure**:
   - Pattern catalog structure created
   - Initial patterns documented:
     - Hybrid Auth Flow
     - Cursor Styled Login

3. **Project Setup**:
   - p1.1 directory created
   - Documentation files initialized
   - Environment configuration prepared
   - Project linked to Vercel p1.1_nbp
   - GitHub repository connected

Next steps include initializing the Next.js project following our precise version requirements, implementing the authentication components, and deploying for testing.

## Version History
- v4.4: Dependency Versions and ORM Strategy (Mar)
- v4.3: Pattern Stewardship and ADR Integration (Mar)
- v4.2: SS4-B1 workflow integration (Mar)
- v4.1: P1.1 Story Suite alignment (Mar)
- v4.0: Initial SmartStack v4 with AI-assisted development (Feb)
- v3.x: Previous versions before AI-assisted development (Jan)