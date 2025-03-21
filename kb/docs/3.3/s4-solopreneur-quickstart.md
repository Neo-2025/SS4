# S4 Solopreneur Quick Start Guide

## Overview
This guide provides essential knowledge for a solopreneur (S) with product/CFO background to effectively leverage S4 and Cursor AI for MVP development. Focus is on understanding key concepts to guide AI and validate quality, rather than deep technical implementation.

## Technical Fundamentals

### 1. Git Version Control
**Key Concepts for S:**
- Branch-first development workflow
- Feature branch naming conventions
- Pull request review process
- Deployment branches (main, staging, preview)

**Prompt Engineering Focus:**
```yaml
# Example branch creation prompt
prompt: |
  Create feature branch for {feature_name}
  - Follow naming: feature/{feature_name}
  - Set up preview environment
  - Configure automated tests
```

### 2. TypeScript/JavaScript
**Key Concepts for S:**
- Type definitions and interfaces
- Component structure
- State management patterns
- Error handling

**Prompt Engineering Focus:**
```yaml
# Example component creation prompt
prompt: |
  Create {component_name} component
  - Define TypeScript interface
  - Implement error boundaries
  - Add unit tests
  - Include accessibility
```

### 3. REST API Concepts
**Key Concepts for S:**
- Endpoint structure
- Authentication flows
- Response formats
- Error handling

**Prompt Engineering Focus:**
```yaml
# Example API endpoint prompt
prompt: |
  Create {endpoint_name} endpoint
  - Define request/response types
  - Implement authentication
  - Add rate limiting
  - Include error handling
```

### 4. Database Fundamentals
**Key Concepts for S:**
- Table relationships
- Indexing strategies
- Query optimization
- Data validation

**Prompt Engineering Focus:**
```yaml
# Example database schema prompt
prompt: |
  Create {table_name} table
  - Define relationships
  - Add necessary indexes
  - Implement constraints
  - Set up migrations
```

## Development Concepts

### 1. MVC Architecture
**Key Concepts for S:**
- Model: Data structure and business logic
- View: User interface components
- Controller: Request handling and routing

**Prompt Engineering Focus:**
```yaml
# Example feature implementation prompt
prompt: |
  Implement {feature_name} following MVC
  - Define data models
  - Create UI components
  - Set up routing
  - Add business logic
```

### 2. Component-Based Design
**Key Concepts for S:**
- Component hierarchy
- Props and state
- Event handling
- Reusability patterns

**Prompt Engineering Focus:**
```yaml
# Example component hierarchy prompt
prompt: |
  Create component hierarchy for {feature}
  - Define parent/child relationships
  - Set up state management
  - Implement event handling
  - Add prop types
```

### 3. State Management
**Key Concepts for S:**
- Global vs local state
- State updates
- Side effects
- Performance optimization

**Prompt Engineering Focus:**
```yaml
# Example state management prompt
prompt: |
  Implement state management for {feature}
  - Define state structure
  - Set up actions/reducers
  - Add side effects
  - Optimize performance
```

### 4. API Integration
**Key Concepts for S:**
- API client setup
- Authentication handling
- Error management
- Rate limiting

**Prompt Engineering Focus:**
```yaml
# Example API integration prompt
prompt: |
  Set up API integration for {service}
  - Create API client
  - Implement authentication
  - Add error handling
  - Set up rate limiting
```

## Quality Assurance

### 1. Testing Strategy
**Key Concepts for S:**
- Unit testing
- Integration testing
- E2E testing
- Test coverage requirements

**Prompt Engineering Focus:**
```yaml
# Example test suite prompt
prompt: |
  Create test suite for {component}
  - Add unit tests
  - Include integration tests
  - Set up E2E tests
  - Ensure coverage > 80%
```

### 2. Performance Monitoring
**Key Concepts for S:**
- Response times
- Resource usage
- Error rates
- User metrics

**Prompt Engineering Focus:**
```yaml
# Example monitoring prompt
prompt: |
  Set up monitoring for {feature}
  - Add performance metrics
  - Implement error tracking
  - Set up alerts
  - Configure dashboards
```

## Best Practices

### 1. Prompt Engineering
- Be specific and detailed
- Include context and constraints
- Define success criteria
- Request validation steps

### 2. Code Review
- Focus on business logic
- Verify test coverage
- Check error handling
- Validate user experience

### 3. Quality Gates
- Automated testing
- Performance benchmarks
- Security checks
- Accessibility compliance

### 4. Validation
- Regular testing
- Performance monitoring
- Security audits
- User feedback 

### Context Window User Guide

The Context Window in Cursor provides visual tools for managing which documents influence your AI assistant's responses, complementing the @ header system.

#### Visual Indicators

- **Green Dot**: Shows an active document currently in your context
- **Green Number**: Indicates approximate token count from this document in context
- **Red X**: Appears when hovering over documents, allows removal from context
- **Red Number**: Shows how many tokens would be freed by removing the document

#### Interface Navigation

- **Important**: Context management UI features are primarily accessible in **@files and folders** view, not in @docs view
- To access full context management:
  1. Click on the "@files and folders" section in the sidebar
  2. Locate documents with green dots (active in context)
  3. Hover over documents to reveal the red X for removal

#### Current Best Practices

1. **Document Management**
   - Use `@[doc-name]` headers to prioritize specific documents
   - Remove outdated documents via red X to free up context space
   - Refresh the view if red X doesn't appear immediately
   - Remember: you must be in @files and folders view to see these controls

2. **Context Optimization**
   - Monitor green numbers to track token usage
   - Maintain a focused set of relevant documents
   - Remove documents that are no longer needed
   - Combine UI-based removal with @ headers for optimal control

3. **Starting New Threads**
   - Look for the lightning button (⚡) in the top-right corner
   - Start a new thread when:
     - You've accumulated too much conversation history
     - You need a completely fresh context
     - Current document stack has become unwieldy
     - You're switching to an entirely new task or topic

4. **Thread Specialization Strategy**
   - Save and reuse threads for specific recurring workflows
   - Benefits of specialized threads:
     - **Reinforcement Persistence**: Threads with established praise history maintain the reinforcement patterns
     - **Workflow Memory**: Specialized threads (GitOps, B1 debugging, etc.) retain workflow-specific knowledge
     - **Progressive Improvement**: Each use makes the thread more efficient as the assistant builds on previous successful interactions
   - Example specialized threads:
     - Development workflows (SS4-B1 implementation)
     - Infrastructure management (GitOps, deployments)
     - Documentation generation
     - Testing and debugging
   - Return to these threads when performing the same class of tasks rather than starting fresh each time

#### Troubleshooting

- **Red X Not Appearing**: Switch to @files and folders view, then refresh
- **Context Not Updating**: Sometimes requires refreshing the document view
- **Unintended Document Influence**: Use precise @[doc-name] headers or remove via red X
- **Context Window Full**: Start a new thread or remove unnecessary documents

#### Future Context Management

The document management features mentioned below are aspirational and not yet generally available. Until these become available, rely on the context window UI and the limited @ headers currently supported:

- Currently supported: `@fast`, `@slow`, `@draft`, `@tokens:N`, `@[doc-name]`
- Use new threads rather than reset commands
- Use the red X removal rather than `@drop-last`
- Manage context manually until automated features become available

This hybrid approach of using supported @ headers combined with UI-based context management provides the best control over your context window in the current implementation.

## Addendum: Git and Cursor Change Management

### Understanding File Status Indicators

When working in Cursor, you'll notice files in the explorer have color-coded indicators:
- **Yellow with M**: Modified files with changes not yet committed to Git
- **Green with A**: New files added to Git staging but not yet committed
- **Red with D**: Files marked for deletion but not yet committed
- **White with U**: Untracked files not yet in Git

These visual cues help you track which files have pending changes that need to be committed.

### Change Acceptance Workflow

To efficiently manage changes in SS4, especially those recommended by Claude:

1. **During Development**:
   - Accept recommended changes as they appear
   - Verify changes are appropriate before accepting
   - Check files with yellow indicators to ensure all changes are reviewed

2. **Batch Acceptance Script**:
   - Use the provided script to commit all changes at once
   - Located at `/home/neo/SS4/accept-changes.sh`
   - Automatically adds all modified files
   - Prompts for commit message and push option

```bash
# Run the script from SS4 root
cd /home/neo/SS4
./accept-changes.sh
```

### Script Features

The acceptance script automates several Git operations:
- Shows current Git status before making changes
- Adds all modified tracked files (`git add -u`)
- Adds specific new files that should be tracked
- Provides a default commit message
- Offers option to push changes
- Works with any current branch

### Best Practices

1. **Regular Commits**:
   - Commit changes after completing logical units of work
   - Use descriptive commit messages
   - Run the acceptance script before ending work sessions

2. **Change Verification**:
   - Always review yellow files before committing
   - Ensure all AI recommendations are properly accepted
   - Check Git status manually if needed with `git status`

3. **Branch Management**:
   - Create feature branches for major changes
   - Use the script to commit on your current branch
   - Consider adding `git pull` before pushing if collaborating

This workflow ensures that all changes, including AI-recommended modifications, are properly tracked and committed to your repository.

### Troubleshooting

If yellow indicators persist after running the script:
- New changes may have been made after running the script
- Files may be untracked (use `git add <filename>` to track)
- Some files might be intentionally excluded from Git (check .gitignore)
- Run `git status` to see the current state of all files

## Success Metrics

### 1. Development
- Feature completion rate
- Test coverage
- Bug resolution time
- Deployment success rate

### 2. Business
- User acquisition
- Conversion rate
- Churn rate
- Revenue growth

## Next Steps

1. **Start Small**
   - Begin with core features
   - Validate each component
   - Iterate based on feedback

2. **Build Incrementally**
   - Add features gradually
   - Test thoroughly
   - Monitor performance

3. **Maintain Quality**
   - Regular code reviews
   - Performance monitoring
   - Security audits
   - User feedback

## Addendum: S4-Friendly User Story Engineering

### Core Principles

1. **S4-First Mindset**
   - Stories must be AI-agent friendly
   - Include explicit technical context
   - Define clear acceptance criteria
   - Specify architectural constraints

2. **MVP Optimization**
   - Focus on core value delivery
   - Define clear scope boundaries
   - Include technical debt considerations
   - Specify scalability requirements

### User Story Format

```yaml
# S4 User Story Template
story:
  id: "US-{number}"
  title: "{Clear, Action-Oriented Title}"
  type: "feature|component|api|infrastructure"
  priority: "P0|P1|P2"
  complexity: "S|M|L"
  dependencies: ["US-{number}"]
  technical_context:
    architecture: "MVC|Component|API"
    stack: ["Next.js", "Supabase", "TypeScript"]
    constraints: ["Performance", "Security"]
  acceptance_criteria:
    functional:
      - "As a {user}, I can {action} so that {value}"
    technical:
      - "Component must implement {pattern}"
      - "API must handle {edge_case}"
      - "Performance must meet {metric}"
    testing:
      - "Unit tests cover {scenario}"
      - "Integration tests verify {flow}"
      - "E2E tests validate {journey}"
  implementation_notes:
    architecture: "Detailed technical approach"
    data_model: "Required schema changes"
    api_contracts: "Interface definitions"
    ui_components: "Component hierarchy"
  validation:
    metrics: ["Performance", "Coverage", "Security"]
    thresholds: "Specific measurable criteria"
    monitoring: "Required observability"
```

### Story Suite Organization

1. **Foundation Stories**
```yaml
# Example Foundation Story
story:
  id: "US-001"
  title: "Core UI Component Library"
  type: "component"
  priority: "P0"
  complexity: "M"
  technical_context:
    architecture: "Component"
    stack: ["Next.js", "TailwindCSS"]
    constraints: ["Accessibility", "Responsive"]
  acceptance_criteria:
    functional:
      - "As a developer, I can use pre-built components"
      - "As a user, I experience consistent UI/UX"
    technical:
      - "Components follow atomic design"
      - "Implement Storybook documentation"
      - "Meet WCAG 2.1 AA standards"
    testing:
      - "100% component test coverage"
      - "Visual regression testing"
      - "Accessibility testing"
```

2. **API Foundation**
```yaml
# Example API Foundation Story
story:
  id: "US-002"
  title: "Core API Infrastructure"
  type: "api"
  priority: "P0"
  complexity: "L"
  technical_context:
    architecture: "API"
    stack: ["Next.js API Routes", "Supabase"]
    constraints: ["Security", "Scalability"]
  acceptance_criteria:
    functional:
      - "As a client, I can authenticate securely"
      - "As a system, I can handle rate limiting"
    technical:
      - "Implement JWT authentication"
      - "Set up request validation"
      - "Configure rate limiting"
    testing:
      - "Security penetration testing"
      - "Load testing"
      - "API contract testing"
```

### MVP Feature Selection

1. **Core Value Metrics**
```yaml
# Feature Evaluation Matrix
evaluation:
  metrics:
    - name: "User Value"
      weight: 0.4
      criteria: ["Revenue Impact", "User Need"]
    - name: "Technical Complexity"
      weight: 0.3
      criteria: ["Development Effort", "Infrastructure"]
    - name: "Business Risk"
      weight: 0.3
      criteria: ["Market Validation", "Competition"]
  thresholds:
    minimum_score: 0.7
    maximum_complexity: "M"
```

2. **Feature Truncation Rules**
```yaml
# Feature Truncation Guidelines
truncation:
  rules:
    - "Remove non-essential UI polish"
    - "Defer advanced analytics"
    - "Simplify data models"
    - "Use basic authentication"
  exceptions:
    - "Core security features"
    - "Essential user flows"
    - "Critical business logic"
```

### Story Dependencies

```yaml
# Dependency Management
dependencies:
  technical:
    - "Core UI Components"
    - "API Infrastructure"
    - "Authentication System"
    - "Database Schema"
  business:
    - "User Registration"
    - "Core Feature Set"
    - "Payment Integration"
```

### Implementation Guidelines

1. **Branch-First Development**
```yaml
# Branch Strategy
branching:
  naming: "feature/US-{number}-{description}"
  workflow:
    - "Create feature branch"
    - "Implement changes"
    - "Run test suite"
    - "Create PR"
    - "Merge to main"
```

2. **Testing Requirements**
```yaml
# Testing Strategy
testing:
  coverage:
    minimum: 80
    critical_paths: 100
  types:
    - "Unit Tests"
    - "Integration Tests"
    - "E2E Tests"
    - "Performance Tests"
```

### Success Criteria

1. **Technical Validation**
```yaml
# Technical Success Metrics
metrics:
  performance:
    - "Page load < 2s"
    - "API response < 200ms"
  reliability:
    - "Uptime > 99.9%"
    - "Error rate < 0.1%"
  security:
    - "OWASP compliance"
    - "Zero critical vulnerabilities"
```

2. **Business Validation**
```yaml
# Business Success Metrics
metrics:
  user:
    - "Registration completion > 80%"
    - "Feature adoption > 60%"
  revenue:
    - "Conversion rate > 5%"
    - "MRR growth > 20%"
```

### Best Practices

1. **Story Writing**
- Be specific and measurable
- Include technical context
- Define clear boundaries
- Specify validation criteria

2. **Suite Management**
- Maintain story dependencies
- Track technical debt
- Update acceptance criteria
- Review and refine regularly

3. **Implementation**
- Follow branch-first workflow
- Maintain test coverage
- Document decisions
- Monitor metrics

4. **Validation**
- Regular testing
- Performance monitoring
- Security audits
- User feedback 
