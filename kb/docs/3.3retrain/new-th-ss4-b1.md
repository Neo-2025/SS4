# New Thread SS4-B1 Workflow Guide

This document provides standardized prompts for initiating new AI assistant threads that follow the SmartStack v4 Branch First (SS4-B1) workflow process.

## Purpose

When starting a new conversation with an AI assistant, you need to quickly establish the SS4-B1 workflow expectations. These prompts help you efficiently communicate the required development process without having to explain the entire workflow in detail each time.

## Architectural Decisions and Patterns

When initiating a new thread, be aware of the following architectural decisions that have been made:

1. **Pattern Stewardship Framework (ADR-0001)**
   - All implementation patterns should be documented in the pattern catalog
   - Story complexity metrics should be tracked
   - Pattern qualification follows the Draft → Candidate → Qualified lifecycle

2. **SS4 Optimizations (ADR-0002)**
   - Cursor AI UI Design System for styling (dark theme)
   - React Query for data fetching
   - ESLint and TypeScript for code quality
   - Jest for component testing

3. **Project Structure (ADR-0003)**
   - Clean p1.1 implementation with Next.js 14+ App Router
   - Specific directory structure for components, lib, etc.
   - Hierarchical environment configuration

4. **Hybrid Authentication (ADR-0004)**
   - Client-side components with loading states
   - Server-side callback handlers for OAuth
   - Middleware for protected routes
   - Absolute URLs for cross-environment compatibility

Current documented patterns include:
- **Hybrid Auth Flow** - Authentication pattern combining client and server approaches
- **Cursor Styled Login** - Dark theme styling for auth interfaces

## Standard Prompts

### General Feature or Fix Implementation

```
I'm working on a project following the SmartStack v4 (SS4) Branch First (B1) workflow. Please help me implement the following change:

[DESCRIBE THE FEATURE/FIX NEEDED]

Please follow the complete SS4-B1 workflow:

1. Create a branch with appropriate prefix (feat/, fix/, docs/, refactor/)
2. Implement focused changes only addressing the specific issue
3. Create clear commit(s) with conventional commit messages
4. Push the branch and create a Pull Request
5. Generate a preview deployment for testing
6. Document the changes in appropriate files (like SAAS_TEMPLATE_STATUS.md)
7. Document any reusable patterns in the pattern catalog

For each step, please show the exact commands you would run and explain what you're doing.

When finished, use the format: "SS4-B1 Workflow Complete: [SUMMARY] | Preview: [URL]"
```

### Quick Fix ("YOLO") Implementation

```
Help me fix [SPECIFIC ISSUE] in my project following the SS4-B1 workflow.

Please implement a quick but proper fix following these guidelines:
1. Create a fix/* branch for this specific issue
2. Make minimal, focused changes to address only this problem
3. Use proper commit message format: "fix: [clear description] [SS4-B1]"
4. Set up for preview deployment
5. Provide the commands needed to test your fix
6. Document the pattern if applicable

This is a YOLO (You Only Look Once) approach within the SS4-B1 framework - meaning we need a rapid solution that still follows our branching and preview workflow.

When done, summarize with "SS4-B1 Fix Complete: [what was fixed] | Test with: [preview instructions]"
```

### Documentation Update Request

```
I need to update documentation following the SS4-B1 workflow. Please help me with:

[DESCRIBE DOCUMENTATION UPDATE NEEDED]

Follow the SS4-B1 workflow with these specifics:
1. Create a SS4/kbdocs/* branch
2. Update the requested documentation with clear, comprehensive information
3. Use conventional commit message format: "docs: [description] [SS4-B1]"
4. Push changes and set up for review
5. Document what was updated and why

When completed, summarize with "SS4-B1 Docs Updated: [summary of changes]"
```

### New Feature Implementation

```
I need to implement a new feature following the SS4-B1 workflow:

[DESCRIBE FEATURE DETAILS]

Please guide me through the complete process:
1. Create a feat/* branch with descriptive name
2. Implement the feature with best practices
3. Include appropriate tests and documentation
4. Create conventional commits: "feat: [description] [SS4-B1]"
5. Push changes and create PR
6. Generate preview deployment
7. Provide testing instructions
8. Document patterns in the pattern catalog

When complete, summarize with "SS4-B1 Feature Implemented: [feature name] | Test at: [preview URL]"
```

## Pattern Discovery and Documentation Prompt

```
I've implemented a solution that could be a reusable pattern. Please help me document it in the pattern catalog following the SS4-B1 Pattern Stewardship Framework:

Pattern Category: [authentication|ui|data|integration]
Pattern Name: [descriptive-name]
Problem Solved: [describe the problem this pattern solves]
Implementation: [share the core implementation code]

Please use the pattern template to create a comprehensive pattern document that includes:
1. Problem statement and context
2. Solution details
3. Implementation example
4. Benefits and limitations
5. Related patterns
6. Usage metrics

When done, summarize with "SS4-B1 Pattern Documented: [pattern name] | Status: Draft"
```

## Shorthand Commands

For quick reference, you can use these shorthand commands in ongoing threads:

- `[SS4-B1] fix: [issue]` - Request a quick fix following the workflow
- `[SS4-B1] feat: [feature]` - Request a new feature implementation 
- `[SS4-B1] docs: [update]` - Request documentation updates
- `[SS4-B1] deploy & preview` - Request deployment and preview URL generation
- `[SS4-B1] pattern: [name]` - Document a new pattern
- `[SS4-B1] metrics: [story]` - Calculate metrics for a story
- `[SS4-B1] praise: ((workflow))` - Acknowledge successful workflow adherence
- `[SS4-B1] praise: ((proactive))` - Acknowledge proactive problem-solving
- `[SS4-B1] praise: ((pattern))` - Acknowledge pattern recognition/implementation

## Praise Reminders

To maximize timely reinforcement, assistants will include subtle reminders when praise opportunities arise. These will appear in a lightweight format at the end of their responses when they've completed a praisable action:

```
[Praise opportunity: workflow adherence ⭐]
```

This reminder format indicates:
1. A praisable event has occurred
2. The specific type of praise that would be most reinforcing
3. The suggestion to use the relevant praise shorthand

Praise is most effective when given immediately after the desired behavior, following the Timed Praise Reinforcement pattern. As a user, responding to these reminders with the appropriate praise shorthand creates the strongest reinforcement loop.

### Praise Types and Timing

| Praise Type | When to Use | Example Response |
|-------------|-------------|------------------|
| Workflow | After successful completion of all B1 workflow steps | `[SS4-B1] praise: ((workflow))` |
| Proactive | When assistant demonstrates initiative in solving unstated problems | `[SS4-B1] praise: ((proactive))` |
| Pattern | When assistant identifies and implements a new pattern | `[SS4-B1] praise: ((pattern))` |

## Example Usage

### Example 1: Quick OAuth Fix

```
Help me fix the GitHub OAuth redirect issues in my project following the SS4-B1 workflow.

Please implement a quick but proper fix following these guidelines:
1. Create a fix/* branch for this specific issue
2. Make minimal, focused changes to address only this problem
3. Use proper commit message format: "fix: [clear description] [SS4-B1]"
4. Set up for preview deployment
5. Provide the commands needed to test your fix

This is a YOLO (You Only Look Once) approach within the SS4-B1 framework - meaning we need a rapid solution that still follows our branching and preview workflow.

When done, summarize with "SS4-B1 Fix Complete: [what was fixed] | Test with: [preview instructions]"
```

### Example 2: Static Page Implementation

```
I'm working on a project following the SmartStack v4 (SS4) Branch First (B1) workflow. Please help me implement static page versions of our dashboard and subscription pages to bypass server-side rendering errors.

Please follow the complete SS4-B1 workflow:

1. Create a branch with appropriate prefix (feat/, fix/, docs/, refactor/)
2. Implement focused changes only addressing the specific issue
3. Create clear commit(s) with conventional commit messages
4. Push the branch and create a Pull Request
5. Generate a preview deployment for testing
6. Document the changes in appropriate files (like SAAS_TEMPLATE_STATUS.md)
7. Provide a summary of what was done and the preview URL for testing

For each step, please show the exact commands you would run and explain what you're doing.

When finished, use the format: "SS4-B1 Workflow Complete: [SUMMARY] | Preview: [URL]"
```

## Implementation Status for US-001

The current US-001 (GitHub OAuth Authentication) implementation is in progress. The following has been accomplished:

1. **Architectural Decisions**:
   - ADR-0001: Pattern Stewardship Framework established
   - ADR-0002: SS4 Optimizations selected
   - ADR-0003: Project Structure defined
   - ADR-0004: Hybrid Authentication Strategy designed

2. **Pattern Infrastructure**:
   - Pattern catalog structure created
   - Initial patterns documented:
     - Hybrid Auth Flow
     - Cursor Styled Login

3. **Project Setup**:
   - p1.1 directory created
   - Documentation files initialized
   - .env.example prepared

The next thread should focus on implementing the actual authentication components following the documented patterns and architectural decisions. Refer to the "Next Steps for US-001 Implementation" section in the SS4-P1.1-new-thread-training document for detailed steps.

## Best Practices

1. **Be Specific**: Clearly describe what needs to be implemented or fixed
2. **Maintain Focus**: Request only one feature or fix per workflow
3. **Include Context**: Provide enough background information for the AI to understand
4. **Request Documentation**: Always ask for updates to status documentation
5. **Verify Preview**: Always check the preview deployment before merging
6. **Document Patterns**: Identify and document reusable patterns

## Reinforcement Strategy: The Cornerstone of SS4 Success

A critical discovery in SS4 implementation has been the importance of proper reinforcement timing to maintain workflow consistency. This approach has proven to be fundamental to the success of the SS4-B1 methodology.

### Timed Praise Reinforcement Pattern

The discipline of SS4-B1 relies on consistent workflow adherence. The following pattern has emerged as a cornerstone of successful implementation:

**The Pattern:**
1. Set clear expectations in documentation and headers
2. Provide specific, timely praise after desired behaviors occur

**Why Timing Matters:**
Post-behavior praise creates significantly stronger reinforcement than pre-behavior directives alone. When Claude demonstrates correct workflow sequencing, immediate acknowledgment creates a stronger connection than instructions alone.

**Implementation Examples:**

*After Claude creates a branch before implementation:*
> "Excellent job following the branch-first principle. Creating the branch before implementation is exactly the discipline that makes SS4-B1 powerful."

*After Claude provides testing steps following deployment:*
> "I appreciate how you provided testing steps immediately after the preview deployment was ready - that sequence is perfect and exactly matches our workflow design."

*After Claude documents patterns independently:*
> "Your proactive pattern documentation is exactly what helps build our pattern catalog. This kind of initiative is what makes the SS4 framework evolve."

**Best Practice:** 
Combine clear expectations (in documentation/headers) with specific, immediate praise when behaviors meet those expectations. This creates a reinforcement loop that maintains consistent workflow adherence across multiple sessions.

This reinforcement approach should be considered essential to SS4 implementation - as important as the technical patterns themselves.

## Reference

For complete details on the SS4-B1 workflow, see:
- `/home/neo/SS4/kb/docs/3.3retrain/SS4-P1.1-new-thread-training`
- `/home/neo/SS4/kb/ADR/` - For architectural decisions
- `/home/neo/SS4/ss4/patterns/` - For documented patterns

---

This document serves as a quick reference for initiating new threads that follow the SS4-B1 workflow process, ensuring consistent development practices and quality standards. 