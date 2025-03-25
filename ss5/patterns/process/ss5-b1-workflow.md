---
pattern:
  name: "SS5-B1 Workflow"
  status: "Core"
  classification: "Process"
  version: "5.1"
---

# SS5-B1 Workflow

## Status: Core

## Classification: Process

## Problem

Software development projects need a consistent, repeatable process that ensures high-quality, maintainable code while leveraging pattern-based development and AI assistance.

## Solution

The SS5-B1 workflow provides a structured approach to development that integrates pattern selection, implementation, documentation, and validation. This workflow ensures consistent application of patterns while maintaining flexibility for specific requirements.

## Implementation

The SS5-B1 workflow consists of the following steps:

1. Create a dedicated branch
2. Identify applicable patterns
3. Synthesize pattern chains for complex features
4. Implement changes following patterns
5. Document new patterns or adaptations
6. Validate implementation with CI/CD
7. Commit changes with pattern references
8. Push and create PR
9. Deploy and test
10. Update pattern metrics
11. Merge when approved

## Benefits

- Ensures consistent development approach
- Promotes pattern reuse and documentation
- Integrates AI assistance throughout the process
- Maintains pattern quality through validation
- Creates a self-improving development ecosystem

## Limitations

- Requires initial investment in pattern documentation
- May have a learning curve for new team members
- Requires discipline to maintain pattern quality

## Related Patterns

- **Pattern Meta Catalog**: Framework for organizing patterns
- **Pattern Chain Synthesis**: Approach for combining patterns
- **YOLO Automation**: Proactive pattern documentation

## AI Collaboration
- **Core Elements**: (must preserve these aspects)
  - The 7-step workflow structure
  - Branch-first approach
  - Pattern-driven implementation
  - Documentation requirements
  
- **Adaptation Points**: (cannot be modified as this is a Core pattern)
  - Implementation details within each step
  - Integration with specific tools
  - Documentation formats

## Implementation Example
```bash
# 1. Create branch for specific user story
git checkout -b feat/US-001-github-oauth

# 2. Select patterns from catalog
# - Hybrid Auth Flow (Status: Adaptive)
# - Supabase GitHub OAuth Integration (Status: Validated)

# 3. Synthesize pattern chain
# - Create authentication-chain.md with adherence levels

# 4. Implement following the chain
# - CAI-A leads implementation with appropriate adaptations
# - Document adaptations in implementation notes

# 5. Document patterns and adaptations
# - Update pattern usage metrics
# - Document new patterns discovered
# - CAI-A adds implementation notes

# 6. Verify in preview environment
vercel deploy

# 7. Create pull request
git push -u origin feat/US-001-github-oauth
# CAI-A prepares PR with pattern adherence notes
```

## CAI-A Notes
- This is a Core pattern that must be adhered to strictly
- The workflow structure must be preserved in all implementations
- CAI-A should take a proactive leadership role while maintaining the integrity of the workflow

## Usage Metrics
- Complexity: Medium (but decreases with familiarity)
- Reusability: High (core to all SS5 development)
- Adaptation Value: N/A (Core pattern)
- Stories: All user stories in SS5 projects

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 5.1 | Current date | Updated for Collaborative Stewardship | Added CAI-A and Pattern Steward responsibilities |
| 5.0 | 2023-04-15 | Formalized as Core Pattern | Evolved from SS4-B1 workflow |
| 4.0 | 2023-03-01 | Initial pattern | Original SS4-B1 workflow | 