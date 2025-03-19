# S4 Cursor Plugin Architecture

## Plugin Structure
```typescript
interface S4CursorPlugin {
  name: "s4-cursor-plugin",
  version: "1.0.0",
  targetTemplate: {
    name: "next-js-saas-starter",
    compatibleVersions: ["^1.0.0", "^2.0.0"],
    hooks: string[]
  }
}
```

## Directory Structure
```bash
s4-cursor-plugin/
├── package.json           # Plugin package definition
├── plugin.config.ts      # Plugin configuration
├── scripts/              # Plugin scripts
│   ├── install.ts       # Plugin installation
│   ├── uninstall.ts    # Plugin cleanup
│   └── update.ts       # Version compatibility
├── src/
│   ├── hooks/          # Template integration points
│   │   ├── pre-dev.ts
│   │   ├── post-build.ts
│   │   └── watch.ts
│   ├── transforms/     # Code transformations
│   │   ├── metadata.ts
│   │   ├── patterns.ts
│   │   └── stories.ts
│   └── virtual/        # Virtual overlay system
│       ├── stories/
│       ├── patterns/
│       └── ai/
└── templates/          # Plugin templates
    ├── stories/
    ├── patterns/
    └── config/
```

## Plugin Integration

### 1. Virtual Overlay System
```typescript
interface VirtualOverlay {
  /**
   * Creates a virtual file system overlay that doesn't modify
   * the original template files but provides AI-enhanced views
   */
  filesystem: {
    mount: (templatePath: string) => void,
    intercept: (path: string) => TransformedContent,
    commit: (changes: Change[]) => void
  },
  
  transforms: {
    addMetadata: (content: string) => string,
    wrapWithContext: (content: string) => string,
    injectPatterns: (content: string) => string
  }
}
```

### 2. Hook System
```typescript
interface PluginHooks {
  /**
   * Lifecycle hooks that integrate with template
   * without modifying its core structure
   */
  predev: {
    setupVirtualFS: () => void,
    injectMetadata: () => void,
    startTracking: () => void
  },

  build: {
    transformOutput: (content: string) => string,
    injectArtifacts: (build: Build) => Build
  },

  watch: {
    trackChanges: (change: FileChange) => void,
    updateContext: (context: Context) => void
  }
}
```

### 3. Configuration System
```typescript
// plugin.config.ts
interface PluginConfig {
  /**
   * Plugin configuration that adapts to template versions
   */
  template: {
    version: string,
    paths: {
      components: string,
      pages: string,
      lib: string
    },
    features: {
      auth: boolean,
      api: boolean,
      database: boolean
    }
  },

  s4: {
    virtualPaths: {
      stories: string,
      patterns: string,
      context: string
    },
    tracking: {
      enabled: boolean,
      mode: "virtual" | "physical"
    }
  },

  cursor: {
    features: {
      storyTracking: boolean,
      patternValidation: boolean,
      contextPreservation: boolean
    }
  }
}
```

## Usage Example

### 1. Installation
```bash
# Install plugin alongside template
npm install next-js-saas-starter
npm install s4-cursor-plugin

# Initialize plugin
npx s4-cursor-plugin init
```

### 2. Development with Plugin
```typescript
// next.config.js
import { withS4Cursor } from 's4-cursor-plugin';

export default withS4Cursor({
  // Original template config
  experimental: { appDir: true },
  // ... other config
});
```

### 3. Virtual Story Management
```typescript
// Virtual path that overlays template structure
// stories/AUTH-001/context.ts
import { createStory } from 's4-cursor-plugin';

export const story = createStory({
  id: 'AUTH-001',
  components: ['LoginForm', 'AuthButton'],
  patterns: ['oauth-flow'],
  // Original template components are referenced but not modified
  templateRefs: ['app/auth/login.tsx', 'components/AuthButton.tsx']
});
```

## Version Compatibility

### 1. Version Mapping
```typescript
interface VersionMap {
  "1.0.0": {
    paths: {
      components: "components/*",
      pages: "app/*"
    },
    transforms: Transform[]
  },
  "2.0.0": {
    paths: {
      components: "src/components/*",
      pages: "src/app/*"
    },
    transforms: Transform[]
  }
}
```

### 2. Compatibility Layer
```typescript
class TemplateCompatibility {
  /**
   * Adapts plugin features to template versions
   */
  async adapt(templateVersion: string): Promise<void> {
    const config = await this.detectConfig(templateVersion);
    await this.setupVirtualFS(config);
    await this.injectHooks(config);
  }

  private async detectConfig(
    version: string
  ): Promise<PluginConfig> {
    // Implementation
  }
}
```

## Development Workflow

### 1. Plugin-Aware Scripts
```json
{
  "scripts": {
    "dev": "s4-cursor-plugin pre-dev && next dev",
    "build": "s4-cursor-plugin pre-build && next build",
    "start": "s4-cursor-plugin pre-start && next start"
  }
}
```

### 2. Story Development
```typescript
// Using virtual overlay system
import { useStory } from 's4-cursor-plugin';

const story = useStory('AUTH-001');

// Original template component with virtual enhancements
export function LoginForm() {
  // Template implementation
}

// Virtual metadata (doesn't modify source)
story.addMetadata(LoginForm, {
  patterns: ['oauth-flow'],
  context: 'auth'
});
```

## Plugin Benefits

1. **Non-Invasive Integration**
   - Uses virtual overlay system
   - No direct template modifications
   - Preserves template upgradability

2. **Version Independence**
   - Adapts to template changes
   - Maintains compatibility layer
   - Auto-detects template version

3. **Development Flexibility**
   - Virtual story management
   - Pattern tracking without lock-in
   - Easy plugin removal if needed

4. **Enhanced Collaboration**
   - Teams can use plugin optionally
   - Shared virtual context
   - Compatible with other plugins

## Migration Strategy

### 1. From Direct Integration
```typescript
interface MigrationSteps {
  preparation: [
    "Identify template touchpoints",
    "Create virtual mappings",
    "Setup compatibility layer"
  ],
  execution: [
    "Install plugin",
    "Move S4 content to virtual layer",
    "Update references to virtual paths"
  ],
  validation: [
    "Verify template integrity",
    "Test plugin features",
    "Validate version compatibility"
  ]
}
```

### 2. Future Template Updates
```typescript
interface UpdateStrategy {
  steps: [
    "Update template independently",
    "Run plugin compatibility check",
    "Auto-adapt virtual layer",
    "Verify S4 features"
  ],
  rollback: {
    revertToVanilla: () => void,
    restorePlugin: () => void
  }
}
``` 