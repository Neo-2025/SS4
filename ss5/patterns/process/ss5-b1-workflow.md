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
Inconsistent development workflows lead to context switching, deployment issues, and maintenance challenges, particularly in AI-assisted development.

## Context
This pattern is THE DEFINING FOUNDATIONAL META-PATTERN of SmartStack v5 and should be applied to all development work within the framework.

## Solution
A comprehensive development workflow that integrates branch-first principles with AI-assisted development and pattern-based implementation:

1. **Branch Creation**: 
   - CAI-A suggests appropriate branch naming
   - Pattern Steward approves branch creation

2. **Pattern Selection**: 
   - CAI-A proactively identifies relevant patterns based on user story
   - CAI-A classifies patterns by adherence level (Core vs. adaptable)
   - Pattern Steward reviews and confirms selections

3. **Pattern Chain Synthesis**: 
   - CAI-A leads chain development with enhanced pattern knowledge
   - CAI-A documents adaptation points in chain
   - Pattern Steward reviews chain for architectural alignment

4. **Implementation**: 
   - CAI-A leads implementation with appropriate pattern application
   - CAI-A documents adaptations and improvements
   - Pattern Steward reviews critical aspects

5. **Documentation**: 
   - CAI-A automatically updates pattern documentation with learnings
   - Pattern Steward reviews and approves documentation changes

6. **Verification**: 
   - CAI-A suggests verification approaches based on pattern requirements
   - Pattern Steward conducts final verification

7. **Pull Request**: 
   - CAI-A prepares PR with pattern adherence/adaptation notes
   - Pattern Steward reviews and approves

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

## Benefits
- Consistent development approach across projects
- Reduced context switching between tasks
- Clear documentation and knowledge transfer
- Improved code quality and maintainability
- Effective use of AI-assisted development
- Balanced innovation through collaborative stewardship

## CAI-A Notes
- This is a Core pattern that must be adhered to strictly
- The workflow structure must be preserved in all implementations
- CAI-A should take a proactive leadership role while maintaining the integrity of the workflow

## Related Patterns
- **Pattern Chain Synthesis**: Combines patterns for specific stories
- **Bootstrap Script Generation**: Initializes project structure
- **Pattern Documentation Workflow**: Documents new patterns
- **Automated Documentation Generation**: Maintains documentation

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