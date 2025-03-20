# Adapting Next.js SaaS Template for Cursor AI

## Original Template Structure

### Current Organization
```typescript
interface CurrentTemplate {
  structure: {
    app: {
      auth: "Basic Supabase auth routes",
      dashboard: "Protected routes",
      marketing: "Public pages",
      api: "API routes"
    },
    components: {
      auth: "Auth components",
      dashboard: "Dashboard UI",
      marketing: "Marketing components",
      ui: "Shared components"
    },
    lib: {
      supabase: "Supabase client",
      stripe: "Stripe integration",
      db: "Database utilities"
    }
  }
}
```

### Standard Features
```typescript
interface StandardFeatures {
  auth: {
    supabase: true,           // Basic Supabase auth
    oauth: ["google", "github"],
    session: "server-side"
  },
  billing: {
    stripe: true,            // Standard Stripe integration
    subscriptions: true,
    webhooks: true
  },
  database: {
    drizzle: true,          // Basic Drizzle ORM setup
    migrations: true,
    types: true
  }
}
```

## Required Adaptations for Cursor AI

### 1. File Structure Adaptation
```typescript
interface StructureAdaptation {
  additions: {
    stories: {
      active: "Story implementations",
      completed: "Archived stories",
      templates: "Story templates"
    },
    patterns: {
      registry: "Pattern definitions",
      validation: "Pattern rules",
      detection: "Pattern detection"
    },
    ai: {
      metadata: "AI-readable info",
      hints: "AI processing hints",
      context: "Context tracking"
    }
  },
  modifications: {
    components: {
      addMetadata: true,     // Add AI metadata
      restructure: true,     // Group by stories
      patterns: true         // Add pattern markers
    },
    lib: {
      aiUtils: true,        // Add AI utilities
      contextTracking: true // Add context tracking
    }
  }
}
```

### 2. Documentation Enhancement
```typescript
interface DocumentationEnhancement {
  components: {
    before: "// Regular JSDoc comments",
    after: `
      /**
       * @ai-component ComponentName
       * @story STORY-ID
       * @pattern pattern-name
       * @context-boundary boundary-type
       */
    `
  },
  functions: {
    before: "// Basic TypeScript types",
    after: `
      /**
       * @ai-function functionName
       * @context story-context
       * @patterns [pattern1, pattern2]
       */
    `
  }
}
```

### 3. Development Workflow Changes
```typescript
interface WorkflowChanges {
  standard: {
    development: "npm run dev",
    build: "npm run build",
    test: "npm run test"
  },
  aiEnhanced: {
    development: [
      "npm run dev",
      "npm run s4:story:track",    // Track story context
      "npm run ai:pattern:watch"   // Watch patterns
    ],
    validation: [
      "npm run s4:validate",       // Validate S4 compliance
      "npm run ai:analyze"         // AI analysis
    ],
    metrics: [
      "npm run s4:metrics",        // Track S4 metrics
      "npm run ai:performance"     // AI performance
    ]
  }
}
```

## Implementation Steps

### 1. Initial Setup
```bash
# Clone original template
git clone https://github.com/vercel-labs/nextjs-saas-starter
cd nextjs-saas-starter

# Add S4 and AI support structure
mkdir -p stories/{active,completed,templates}
mkdir -p patterns/{registry,validation}
mkdir -p lib/ai
```

### 2. Add AI Configuration
```typescript
// .cursorrc.ts
export default {
  ai: {
    enabled: true,
    features: {
      storyTracking: true,
      patternValidation: true
    }
  }
}
```

### 3. Modify Component Structure
```typescript
// Before: Regular component
export const AuthButton = () => {
  // Implementation
};

// After: AI-enhanced component
/**
 * @ai-component AuthButton
 * @story AUTH-001
 * @pattern oauth-flow
 */
export const AuthButton = () => {
  // Implementation
};
```

### 4. Add Story Management
```typescript
// stories/active/AUTH-001/context.json
{
  "story": {
    "id": "AUTH-001",
    "title": "OAuth Integration",
    "context": {
      "scope": ["auth"],
      "patterns": ["oauth-flow"]
    }
  }
}
```

## Migration Guide

### 1. Component Migration
```typescript
interface ComponentMigration {
  steps: [
    "Add AI metadata comments",
    "Group by story context",
    "Add pattern markers",
    "Update imports for new structure"
  ],
  example: {
    before: "./components/auth/LoginForm.tsx",
    after: "./stories/active/AUTH-001/components/LoginForm.tsx"
  }
}
```

### 2. Documentation Migration
```typescript
interface DocsMigration {
  steps: [
    "Add AI-readable formats",
    "Include story context",
    "Add pattern references",
    "Update component links"
  ],
  tooling: {
    automated: ["metadata-generator", "doc-validator"],
    manual: ["story-assignment", "pattern-identification"]
  }
}
```

### 3. Testing Adaptation
```typescript
interface TestingChanges {
  additions: {
    storyValidation: "Validate story compliance",
    patternTesting: "Test pattern implementation",
    aiMetrics: "Track AI performance"
  },
  modifications: {
    unitTests: "Add story context",
    integration: "Add pattern validation",
    e2e: "Add AI metrics"
  }
}
```

## Best Practices for Adaptation

1. **Gradual Migration**
   - Start with new components
   - Migrate existing components incrementally
   - Add AI metadata progressively

2. **Pattern Implementation**
   - Identify common patterns first
   - Create pattern registry
   - Add validation rules
   - Implement detection

3. **Story Management**
   - Create story structure
   - Add context tracking
   - Implement validation
   - Monitor metrics

4. **Development Workflow**
   - Add AI-aware scripts
   - Implement validation hooks
   - Set up metrics collection
   - Configure CI/CD integration

## Success Metrics for Adaptation

```typescript
interface AdaptationMetrics {
  migration: {
    componentCoverage: ">80%",    // AI-ready components
    patternCoverage: ">70%",      // Pattern implementation
    storyTracking: ">90%"         // Story context coverage
  },
  performance: {
    aiCompletion: "<500ms",       // AI suggestion speed
    contextSwitch: "<2s",         // Context loading time
    validation: "<1s"             // Pattern validation time
  },
  quality: {
    patternAdherence: ">90%",     // Pattern compliance
    storyCompliance: ">85%",      // Story requirements met
    aiEfficiency: ">80%"          // AI suggestion accuracy
  }
}
``` 