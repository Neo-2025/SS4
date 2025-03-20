# SmartStack v4 (S4) Specification

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

## Project Prerequisites

### Development Environment
- WSL2 with Ubuntu 20.04 LTS
- Node.js 18+ LTS
- Git with GitHub CLI (`gh`)
- Vercel CLI
- Cursor Editor with Claude 3.5+ integration

### Accounts and Services
- GitHub account with repository access
- Vercel account with project setup
- Supabase account with project configured
- Perplexity API access (for specific stories)

### Project Structure
```
SS4/
├── p1/                           # Main project directory
│   ├── app/                      # Next.js application
│   ├── components/               # UI components
│   ├── lib/                      # Utility libraries
│   └── public/                   # Static assets
├── kb/                           # Knowledge base
│   ├── docs/                     # Documentation
│   │   ├── P1-1-Story-Suite.md   # Story definitions
│   │   ├── S4-B1-workflow.md     # Workflow documentation
│   │   └── smartstack-v4-spec.md # This specification
│   └── patterns/                 # Implementation patterns
└── SS4-P1.1-new-thread-training  # Thread training guide
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
- Next.js 14+ (App Router)
- TypeScript 5+
- Tailwind CSS 
- shadcn/ui components
- Supabase Auth Helpers

### Backend
- Supabase for authentication and database
- Vercel for deployment and serverless functions
- tRPC for API structure (where applicable)
- Perplexity API for content generation (US-008)

### Development
- Cursor AI for assisted development
- Git/GitHub for version control
- Vercel for preview deployments
- WSL for local development environment

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

## Version History
- v4.2: Current version with SS4-B1 workflow integration (Mar)
- v4.1: P1.1 Story Suite alignment (Mar)
- v4.0: Initial SmartStack v4 with AI-assisted development (Feb)
- v3.x: Previous versions before AI-assisted development (Jan)