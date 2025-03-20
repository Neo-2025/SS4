# New Thread SS4-B1 Workflow Guide

This document provides standardized prompts for initiating new AI assistant threads that follow the SmartStack v4 Branch First (SS4-B1) workflow process.

## Purpose

When starting a new conversation with an AI assistant, you need to quickly establish the SS4-B1 workflow expectations. These prompts help you efficiently communicate the required development process without having to explain the entire workflow in detail each time.

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
7. Provide a summary of what was done and the preview URL for testing

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

This is a YOLO (You Only Look Once) approach within the SS4-B1 framework - meaning we need a rapid solution that still follows our branching and preview workflow.

When done, summarize with "SS4-B1 Fix Complete: [what was fixed] | Test with: [preview instructions]"
```

### Documentation Update Request

```
I need to update documentation following the SS4-B1 workflow. Please help me with:

[DESCRIBE DOCUMENTATION UPDATE NEEDED]

Follow the SS4-B1 workflow with these specifics:
1. Create a docs/* branch
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

When complete, summarize with "SS4-B1 Feature Implemented: [feature name] | Test at: [preview URL]"
```

## Shorthand Commands

For quick reference, you can use these shorthand commands in ongoing threads:

- `[SS4-B1] fix: [issue]` - Request a quick fix following the workflow
- `[SS4-B1] feat: [feature]` - Request a new feature implementation 
- `[SS4-B1] docs: [update]` - Request documentation updates
- `[SS4-B1] deploy & preview` - Request deployment and preview URL generation

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

## Best Practices

1. **Be Specific**: Clearly describe what needs to be implemented or fixed
2. **Maintain Focus**: Request only one feature or fix per workflow
3. **Include Context**: Provide enough background information for the AI to understand
4. **Request Documentation**: Always ask for updates to status documentation
5. **Verify Preview**: Always check the preview deployment before merging

## Reference

For complete details on the SS4-B1 workflow, see:
- `/home/neo/SS4/kb/docs/S4-B1-workflow-guide.md`
- `/home/neo/SS4/kb/docs/S4-B1-workflow.md`

---

This document serves as a quick reference for initiating new threads that follow the SS4-B1 workflow process, ensuring consistent development practices and quality standards. 