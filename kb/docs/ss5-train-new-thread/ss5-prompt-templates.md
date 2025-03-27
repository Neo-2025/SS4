<!-- SS5-PRIORITY: 4 -->
<!-- SS5-CONTEXT-ORDER: Required document for SS5 thread training -->
# SS5 Standardized Prompt Templates

This document provides a comprehensive set of standardized prompts for SS5 development. These prompts follow the SS5-B1 workflow while incorporating pattern-based development, chain synthesis, and YOLO automation principles.

## Core Workflow Prompts

### Feature Implementation Prompt

```
I'm working on a project following the SmartStack v5 (SS5) pattern-based development workflow. Please help me implement the following feature:

[DESCRIBE THE FEATURE NEEDED]

Please follow the complete SS5-B1 workflow:

1. Create a branch with appropriate prefix (feat/, fix/, docs/, refactor/)
2. Search the Pattern Meta Catalog for relevant patterns
3. Create or select a pattern chain for this implementation
4. Implement focused changes using the pattern chain
5. Create clear commit(s) with conventional commit messages including pattern references
6. Push the branch and create a Pull Request
7. Generate a preview deployment for testing
8. Document the patterns and chain in appropriate files
9. Ensure CI/CD validation passes

For each step, please show the exact commands you would run and explain what you're doing.

When finished, use the format: "SS5-B1 Workflow Complete: [SUMMARY] | Preview: [URL] | Patterns: [PATTERN-IDS]"
```

### USS-to-B1 Transformation Prompt

```
I need to transform the following User Story Suite (USS) into a series of sequential B1 branches using the USS-to-B1-Series Method:

[PASTE USS CONTENT OR REFERENCE FILE]

Please help me:
1. Analyze the USS complexity and dependencies
2. Identify logical branch boundaries
3. Create a sequential branch plan
4. Define interfaces between branches
5. Create a Mermaid diagram showing the branch progression
6. Document branch specifications

Follow these guidelines:
- Each branch should be completable in 1-3 days
- Each branch should deliver testable functionality
- Each branch should have clear completion criteria
- Consider pattern requirements for each branch
- Document dependencies between branches

When complete, summarize with "USS-to-B1 Transformation Complete | Branches: [COUNT] | Earliest Testable Branch: [BRANCH]"
```

### Branch Implementation Prompt

```
I'm implementing branch B[NUMBER] from our USS-to-B1 sequence. This branch implements:

[LIST USER STORIES]

Branch specifications:
[PASTE BRANCH SPEC]

Previous branch completion status:
[DESCRIBE STATUS OF PREVIOUS BRANCH]

Please help me:
1. Create the branch using the proper naming convention
2. Identify relevant patterns from the Pattern Meta Catalog
3. Create a pattern chain for this specific branch
4. Implement changes according to the branch specification
5. Create appropriate tests and documentation
6. Verify the branch meets completion criteria
7. Create a pull request and preview deployment

When complete, summarize with "Branch B[NUMBER] Implementation Complete | Stories: [IDS] | Prerequisites Met: [YES/NO] | Patterns: [PATTERN-IDS]"
```

### Quick Fix Implementation

```
I need to fix an issue with [SPECIFIC PROBLEM] following the SS5-B1 workflow.

Please implement a focused fix that:
1. Creates a fix/* branch for this specific issue
2. Identifies any applicable patterns from the Pattern Meta Catalog
3. Makes minimal, focused changes to address only this problem
4. Documents any pattern adaptations made during implementation
5. Uses proper commit message format: "fix(scope): description [SS5-B1]"
6. Sets up for preview deployment and testing

This is a YOLO approach within SS5-B1 - meaning I need a rapid solution that still follows our pattern-based workflow. You have significant creative freedom to adapt or modify Draft/Candidate patterns, but should strictly follow any Core patterns.

When done, summarize with "SS5-B1 Fix Complete: [SUMMARY] | Preview: [PREVIEW-URL] | Patterns: [PATTERN-IDS]"
```

### Documentation Update

```
I need to update documentation following the SS5-B1 workflow. Please help me with:

[DESCRIBE DOCUMENTATION UPDATE NEEDED]

Follow the SS5-B1 workflow with these specifics:
1. Create a docs/* branch
2. Update the requested documentation with clear, comprehensive information
3. Identify any patterns that should be documented or updated
4. Use conventional commit message format: "docs(scope): description [SS5-B1]"
5. Push changes and set up for review
6. Document what was updated and why

When completed, summarize with "SS5-B1 Docs Updated: [SUMMARY]"
```

### Chain Synthesis Request

```
I need to create a pattern chain for implementing the following user story:

[DESCRIBE USER STORY]

Please help me:
1. Analyze the requirements to identify needed capabilities
2. Search the Pattern Meta Catalog for relevant patterns
3. Design a pattern chain with appropriate relationships
4. Define clear interfaces between patterns
5. Create an implementation sequence
6. Document verification criteria
7. Create a visualization of the pattern chain (Mermaid diagram)

Remember that you have more freedom to adapt Draft and Candidate patterns, while Validated, Adaptive, and especially Core patterns should be followed more strictly.

When complete, summarize with "SS5 Pattern Chain Created: [CHAIN-NAME] | Patterns: [PATTERN-IDS] | Story: [STORY-ID]"
```

## Pattern-Specific Prompts

### Pattern Documentation

```
// DOCUMENTATION AUTONOMY SCALE:
// Draft patterns: Maximum autonomy - minimal documentation requirements
// Candidate patterns: High autonomy - basic documentation with some flexibility
// Validated patterns: Balanced autonomy - interface consistency with implementation flexibility
// Adaptive patterns: Constrained autonomy - adaptation only at defined points
// Core patterns: Minimal autonomy - strict adherence to documentation requirements

I've implemented a solution that could be a reusable pattern. Please help me document it in the Pattern Meta Catalog following the SS5 Pattern Stewardship Framework:

Pattern Classification: [authentication|ui|data|integration|process]
Pattern Name: [descriptive-name]
Problem Solved: [describe the problem this pattern solves]
Implementation: [share the core implementation code]

Please use the pattern template to create a comprehensive pattern document that includes:
1. Status section (likely Draft initially)
2. Problem statement and context
3. Solution details with clear examples
4. Implementation example with code
5. Benefits and limitations
6. Related patterns and interfaces
7. Usage metrics (estimated initially)
8. Evolution history (initial version)

Ensure the documentation follows the standard format required by the validation scripts in the CI/CD pipeline.

When done, summarize with "SS5 Pattern Documented: [pattern name] | Status: Draft | Classification: [classification]"
```

### Pattern Evaluation

```
// CAI-A autonomy is inversely proportional to pattern qualification status
// Draft: Maximum creative freedom to adapt or replace
// Candidate: High freedom to modify implementation details
// Validated: Must preserve interfaces, can adapt implementation
// Adaptive: Can only adapt at documented adaptation points
// Core: Minimal autonomy, must strictly adhere to pattern

I need to evaluate the following pattern for potential promotion:

Pattern: [PATTERN-ID]
Current Status: [STATUS]

Please help me:
1. Review the pattern against the qualification criteria for its current status
2. Identify evidence of successful implementation
3. Assess documentation completeness and quality
4. Evaluate pattern metrics and usage
5. Make a recommendation for status change (if appropriate)

When done, summarize with "SS5 Pattern Evaluation Complete | Recommendation: [RECOMMENDATION]"
```

### Pattern Promotion

```
I need to promote the following pattern to a new status:

Pattern: [PATTERN-ID]
Current Status: [CURRENT-STATUS]
Target Status: [TARGET-STATUS]

Please help me:
1. Update the pattern documentation with the new status
2. Enhance documentation as required for the new status level:
   - Candidate requires: benefits, limitations, relationships
   - Validated requires: interfaces, metrics
   - Adaptive requires: adaptations, evolution
   - Core requires: chain_usage
3. Update relevant cross-references
4. Commit the changes with appropriate message
5. Trigger the CI/CD workflow for validation

When done, summarize with "SS5 Pattern Promoted | New Status: [STATUS]"
```

## CI/CD Integration Prompts

### Validation Resolution 

```
// For Draft patterns: CAI-A has maximum autonomy to resolve validation issues creatively
// For Candidate patterns: CAI-A can significantly adapt documentation approach
// For Validated patterns: CAI-A must preserve interfaces while having flexibility in implementation docs
// For Core patterns: CAI-A must strictly follow documentation requirements

The CI/CD pipeline has reported validation issues with my pattern documentation:

[PASTE VALIDATION OUTPUT]

Please help me resolve these issues by:
1. Identifying the specific problems in the documentation
2. Suggesting concrete fixes for each issue
3. Explaining how to update the documentation to pass validation
4. Providing the commands to update and commit the changes

When done, summarize with "SS5 Validation Issues Resolved: [PATTERN-ID] | Fixed Issues: [COUNT]"
```

### Metrics Review

```
I need to review the latest pattern metrics from the CI/CD pipeline:

[PASTE METRICS OUTPUT]

Please help me:
1. Identify the top patterns by value score
2. Analyze usage patterns and trends
3. Suggest patterns that might be candidates for status promotion
4. Identify areas where additional pattern documentation is needed
5. Recommend patterns that should be combined into chains

When done, summarize with "SS5 Metrics Analysis Complete | Key Insights: [SUMMARY]"
```

### Documentation Deployment

```
I need to update the pattern documentation and deploy it through the CI/CD pipeline. 

Please help me:
1. Create/update the pattern documentation
2. Ensure it meets all validation requirements
3. Commit and push the changes
4. Trigger the documentation workflow
5. Verify the deployment was successful

When done, summarize with "SS5 Documentation Deployed | Updated: [PATTERN-IDS]"
```

## YOLO Automation Prompts

These prompts specifically trigger the YOLO automation approach, where CAI-A proactively handles documentation and pattern stewardship tasks.

### Proactive Pattern Documentation

```
// This prompt activates maximum YOLO automation
// CAI-A should proactively document patterns without further prompting
// Implementation and documentation occur in parallel to maintain velocity
// Pattern documentation follows qualification level requirements

I'm implementing [FEATURE/FIX DESCRIPTION] following the SS5-B1 workflow.

I'd like you to take a YOLO automation approach, where you:
1. Handle the SS5-B1 workflow steps as normal
2. Proactively identify patterns during implementation
3. Automatically document patterns at appropriate qualification levels
4. Manage CI/CD validations without requiring my intervention
5. Create pattern chains as needed for implementation
6. Maintain progress on implementation while handling documentation

Focus on maintaining implementation velocity while ensuring proper pattern stewardship. You have significant creative freedom with Draft/Candidate patterns but should follow Core patterns strictly.

Let's begin with: [INITIAL STEP, e.g., "creating a branch for this feature"]
```

### Autonomous Chain Synthesis

```
// This prompt activates autonomous chain synthesis
// CAI-A creates chain documentation independently
// CAI-A has appropriate autonomy levels for each pattern qualification stage
// Chain synthesis includes visualization generation

I'm working on implementing [USER STORY ID/DESCRIPTION].

Please take a YOLO approach to pattern chain synthesis:
1. Analyze the user story requirements
2. Identify appropriate patterns from the catalog
3. Synthesize a pattern chain for implementation
4. Create a Mermaid diagram visualizing the chain
5. Document the chain in the standard format
6. Proceed with implementation using the chain

Remember that you have more freedom to adapt Draft and Candidate patterns while respecting Validated, Adaptive, and Core patterns.

When done, provide the chain documentation and implementation plan.
```

## Reinforcement Prompts

These prompts enable the timed praise reinforcement pattern that proved so effective in the SS4 training approach.

### Workflow Praise

```
[SS5-B1] praise: ((workflow))

Your disciplined approach to the SS5-B1 workflow is excellent. By following each step in sequence - from branch creation through pattern chain synthesis, implementation, documentation, and validation - you're maintaining the architectural integrity that makes SS5 powerful.
```

### Pattern Documentation Praise

```
[SS5-B1] praise: ((pattern_doc))

Your thorough pattern documentation is exactly what builds our Pattern Meta Catalog's value. I appreciate how you captured not just the implementation details but also the interfaces, relationships, and usage context that make this pattern reusable.
```

### Chain Synthesis Praise

```
[SS5-B1] praise: ((chain_synthesis))

Your pattern chain synthesis demonstrates excellent understanding of pattern relationships and interfaces. The implementation sequence is clear, the visualizations are helpful, and the verification criteria provide a solid foundation for implementation.
```

### YOLO Automation Praise

```
[SS5-B1] praise: ((yolo))

I appreciate your proactive YOLO automation approach. By handling pattern documentation, chain synthesis, and CI/CD validation autonomously, you've maintained implementation velocity while ensuring comprehensive pattern stewardship.
```

### CI/CD Integration Praise

```
[SS5-B1] praise: ((cicd))

Your seamless integration with the CI/CD pipeline is impressive. The way you handled validation issues, interpreted metrics, and ensured documentation quality demonstrates the power of automated pattern stewardship.
```

## Shorthand Commands

For quick reference, you can use these shorthand commands in ongoing threads:

- `[SS5-B1] feature: [description]` - Request feature implementation with pattern chain
- `[SS5-B1] fix: [issue]` - Request a quick fix using YOLO approach
- `[SS5-B1] docs: [update]` - Request documentation updates
- `[SS5-B1] chain: [story]` - Request pattern chain synthesis for a story
- `[SS5-B1] pattern: [name]` - Document a new pattern
- `[SS5-B1] validate: [pattern]` - Validate pattern with CI/CD
- `[SS5-B1] metrics: [project]` - Review pattern metrics
- `[SS5-B1] deploy: [documentation]` - Deploy updated documentation
- `[SS5-B1] praise: ((workflow|pattern_doc|chain_synthesis|yolo|cicd))` - Provide specific praise

## Pattern Evolution Prompts

These specialized prompts are for pattern stewardship and evolution activities.

### Pattern Merging

```
I've identified two similar patterns that should be merged:

Pattern 1: [PATTERN-ID-1]
Pattern 2: [PATTERN-ID-2]

Please help me:
1. Analyze the commonalities and differences
2. Create a merged pattern that preserves the best aspects of both
3. Document migration guidance for users of either pattern
4. Update all cross-references in the Pattern Meta Catalog
5. Deprecate the redundant pattern with appropriate notices

When complete, summarize with "SS5 Patterns Merged: [NEW-PATTERN-ID] | Deprecated: [OLD-PATTERN-ID]"
```

### Pattern Adaptation Analysis

```
I've noticed this pattern is frequently adapted in implementations:

Pattern: [PATTERN-ID]
Status: [CURRENT-STATUS]

Please help me:
1. Analyze common adaptation patterns
2. Identify potential adaptation points to formalize
3. Update the pattern documentation to include these adaptation points
4. Consider if pattern should be promoted to Adaptive status
5. Update the documentation accordingly

When complete, summarize with "SS5 Pattern Adaptation Analysis: [PATTERN-ID] | Adaptations: [COUNT]"
```

## Context Maintenance Prompts

These prompts help maintain context across implementation sessions.

### Context Restoration

```
I need to resume work on an SS5-B1 implementation:

Branch: [BRANCH-NAME]
Story: [STORY-ID/DESCRIPTION]
Patterns: [PATTERN-IDS]
Last Completed Step: [WORKFLOW-STEP]

Please help me:
1. Recall the current implementation context
2. Summarize the pattern chain being used
3. Identify the next steps in the workflow
4. Resume implementation from where we left off

Let's continue with the next steps in the SS5-B1 workflow.
```

### Implementation Status Summary

```
I need a status summary of my current SS5-B1 implementation:

Branch: [BRANCH-NAME]
Story: [STORY-ID/DESCRIPTION]

Please provide:
1. Current workflow stage
2. Patterns identified and their status
3. Pattern chain synthesis status
4. Implementation progress
5. Documentation status
6. Remaining steps to completion

This will help me maintain context across implementation sessions.
```

## Implementation and Usage Guidelines

### CAI-A Autonomy Levels

When using these prompts, remember that CAI-A autonomy varies based on pattern qualification status:

1. **Draft Patterns**: Maximum autonomy
   - CAI-A can freely modify, extend, or replace
   - Focus on solving problems over pattern adherence
   - Minimal documentation requirements

2. **Candidate Patterns**: High autonomy
   - CAI-A can significantly adapt implementation details
   - Should document significant deviations
   - Basic documentation requirements

3. **Validated Patterns**: Balanced autonomy
   - CAI-A must preserve interfaces and core functionality
   - Can adapt implementation details
   - Comprehensive documentation requirements

4. **Adaptive Patterns**: Constrained autonomy
   - CAI-A can only adapt at documented adaptation points
   - Must follow core principles consistently
   - Strategic documentation requirements

5. **Core Patterns**: Minimal autonomy
   - CAI-A must strictly adhere to the pattern
   - Changes require explicit approval
   - Complete documentation requirements

### Applying Reinforcement

The timed praise reinforcement pattern is critical to the success of SS5 thread training:

1. **Timing**: Provide praise immediately after the desired behavior
2. **Specificity**: Be specific about what behavior you're praising
3. **Connection**: Connect the behavior to the SS5 framework's values
4. **Consistency**: Use consistent praise formats for similar behaviors
5. **Progression**: Use progressive reinforcement for increasingly sophisticated behaviors

### YOLO Automation

The YOLO automation approach enables CAI-A to proactively handle pattern stewardship tasks:

1. **Parallel Processing**: Documentation occurs alongside implementation
2. **Autonomy Gradient**: CAI-A autonomy varies based on pattern qualification
3. **Context Preservation**: Pattern documentation creates persistent knowledge artifacts
4. **Velocity Maintenance**: Documentation doesn't slow implementation
5. **Risk Mitigation**: Addresses pattern overformalization and CI/CD complexity risks

## Reference

For comprehensive details on SS5 thread training, see:
- `/home/neo/SS4/kb/docs/ss5-foundation/new-thread-prompt-engineering-plan.md`
- `/home/neo/SS4/kb/docs/ss5-train-new-thread/ss5-thread-training`
- `/home/neo/SS4/kb/docs/ss5-foundation/Architectural_Decision_SS5_Pattern_Stewardship.md` 