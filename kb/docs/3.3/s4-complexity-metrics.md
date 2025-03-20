# S4 Complexity Metrics Calculation

## Core Metrics Framework

```typescript
interface S4ComplexityMetrics {
  stories_per_actor: {
    calculation: "Total Stories / Unique Actors",
    target_range: "1.5 - 2.5",
    warning_threshold: 2.5,
    critical_threshold: 3.0
  },
  acceptance_criteria_avg: {
    calculation: "Total Acceptance Criteria / Total Stories",
    target_range: "4.0 - 6.0",
    warning_threshold: 6.0,
    critical_threshold: 7.0
  },
  integration_points: {
    levels: {
      low: "1-2 external systems",
      medium: "3-5 external systems",
      high: "> 5 external systems"
    },
    warning_threshold: "medium",
    critical_threshold: "high"
  },
  state_transitions: {
    levels: {
      linear: "Single path progression",
      branching: "Multiple valid paths",
      complex: "State machine required"
    },
    warning_threshold: "branching",
    critical_threshold: "complex"
  }
}
```

## Calculation Examples

### 1. Stories Per Actor
```typescript
interface StoriesPerActorCalculation {
  method: {
    step1: "Identify unique actors in all stories",
    step2: "Count total stories across all actors",
    step3: "Divide total stories by unique actor count"
  },
  example: {
    StateLink_MVP: {
      unique_actors: ["Legal Rep", "State Admin"],  // Count: 2
      total_stories: 4.4,  // 2 stories * 2.2 weight
      calculation: "4.4 / 2 = 2.2 stories per actor"
    }
  },
  weighting_factors: {
    story_complexity: {
      simple: 0.8,
      standard: 1.0,
      complex: 1.2
    },
    integration_impact: {
      low: 1.0,
      medium: 1.1,
      high: 1.2
    }
  }
}
```

### 2. Acceptance Criteria Average
```typescript
interface AcceptanceCriteriaCalculation {
  method: {
    step1: "Count all acceptance criteria across stories",
    step2: "Count total number of stories",
    step3: "Apply weighting factors",
    step4: "Calculate weighted average"
  },
  example: {
    StateLink_MVP: {
      total_criteria: 11,  // Sum of all criteria
      total_stories: 2,
      raw_average: "11 / 2 = 5.5",
      weighted_calculation: {
        criteria_weights: {
          validation: 1.2,
          integration: 1.1,
          standard: 1.0
        },
        final_score: "5.5 after weights"
      }
    }
  }
}
```

## Metric Boundaries

```yaml
s4_complexity_boundaries:
  stories_per_actor:
    optimal: "1.5 - 2.5"
    warning: "2.5 - 3.0"
    critical: "> 3.0"
    calculation_rules:
      - "Count each actor only once across all stories"
      - "Weight stories by complexity and integration factors"
      - "Include implicit stories from integration points"

  acceptance_criteria_avg:
    optimal: "4.0 - 6.0"
    warning: "6.0 - 7.0"
    critical: "> 7.0"
    calculation_rules:
      - "Count explicit criteria only"
      - "Apply domain-specific weights"
      - "Consider integration complexity"

  combined_complexity_score:
    formula: "(stories_per_actor * 0.4) + (acceptance_criteria_avg * 0.6)"
    thresholds:
      low: "< 3.0"
      medium: "3.0 - 4.0"
      high: "> 4.0"
```

## Example Application

### StateLink MVP Analysis
```typescript
interface StateLinkAnalysis {
  actors: {
    legal_rep: {
      stories: 1,
      total_criteria: 5,
      complexity_weight: 1.1  // Medium integration
    },
    state_admin: {
      stories: 1,
      total_criteria: 6,
      complexity_weight: 1.2  // High integration
    }
  },
  calculations: {
    stories_per_actor: {
      raw: "2 stories / 2 actors = 1.0",
      weighted: "2.2 (after complexity weights)"
    },
    acceptance_criteria: {
      raw: "11 criteria / 2 stories = 5.5",
      weighted: "5.5 (after domain weights)"
    }
  },
  final_metrics: {
    stories_per_actor: 2.2,
    acceptance_criteria_avg: 5.5,
    complexity_score: 3.8  // Medium complexity
  }
}
```

## Validation Rules

```typescript
interface MetricValidation {
  story_rules: {
    max_per_actor: 3,
    min_per_mvp: 2,
    max_complexity_weight: 1.2
  },
  criteria_rules: {
    min_per_story: 3,
    max_per_story: 7,
    required_categories: [
      "Validation",
      "Error handling",
      "Success state"
    ]
  },
  integration_rules: {
    max_direct_dependencies: 3,
    max_indirect_dependencies: 5,
    required_boundaries: [
      "Data contract",
      "Error boundary",
      "Rate limiting"
    ]
  }
}
```

## Implementation Guidelines

```yaml
metric_tracking:
  frequency: "Per story addition/modification"
  automation:
    tools:
      - "Complexity calculator in CI/CD"
      - "Metric visualization dashboard"
      - "Trend analysis reports"
  alerts:
    - trigger: "Metric exceeds warning threshold"
      action: "Team review required"
    - trigger: "Metric exceeds critical threshold"
      action: "Architectural review required"

refactoring_triggers:
  stories_per_actor:
    - threshold: "> 2.5"
      action: "Split stories or consolidate actors"
  acceptance_criteria:
    - threshold: "> 6.0"
      action: "Simplify stories or split into multiple stories"
  combined_score:
    - threshold: "> 4.0"
      action: "Major refactoring required"
```

## Best Practices

1. **Regular Monitoring**
   - Calculate metrics for each story addition
   - Track trends over time
   - Review impacts of changes

2. **Proactive Management**
   - Address complexity early
   - Use metrics to guide story splitting
   - Maintain clear boundaries

3. **Team Alignment**
   - Share metrics in planning
   - Use as discussion points
   - Guide architectural decisions

4. **Continuous Improvement**
   - Refine calculation weights
   - Adjust thresholds based on experience
   - Document learnings and patterns 