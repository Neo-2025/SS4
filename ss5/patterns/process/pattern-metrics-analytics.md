# Pattern Metrics & Analytics

## Status: Validated

## Classification: Process

## Problem

Development teams often struggle to make data-driven decisions about which patterns are most effective, widely used, and deliver the most value. Without objective measurements, pattern promotion, refinement, and deprecation decisions remain subjective and may not align with actual usage patterns and benefits.

Specifically:

1. There is no systematic way to track which patterns are being used across projects
2. No quantitative metrics exist to evaluate pattern effectiveness
3. Pattern promotion decisions lack objective data
4. Teams cannot easily identify patterns that need improvement or deprecation
5. It's difficult to visualize and communicate pattern usage across the organization

## Solution

Create a comprehensive metrics and analytics system that collects data on pattern usage, calculates value metrics, and presents this information in an accessible dashboard. This system includes tools for:

1. **Pattern Usage Detection**: Scanning codebases to detect pattern implementations
2. **Value Metrics Calculation**: Combining usage data with complexity and impact ratings
3. **Interactive Dashboard**: Visualizing metrics for stakeholders
4. **Recommendation Engine**: Suggesting patterns for promotion or reassessment

## Key Implementation

```javascript
// Configuration for metrics collection
const config = {
  patterns: {
    directory: "../../patterns",
    metadataRegex: {
      status: "Status:\\s*(Core|Validated|Candidate|Draft)",
      classification: "Classification:\\s*([\\w\\s]+)",
      complexity: "Complexity:\\s*(\\d+)"
    }
  },
  repositories: {
    local: ["../../../"],
    scan_depth: 2,
    exclude_dirs: ["node_modules", "dist", "build", ".git"]
  },
  output: {
    metrics_file: "metrics-data.json",
    dashboard_file: "../../docs/generated/pattern-dashboard.html"
  }
};

// Extract pattern metadata
function extractPatternMetadata(content) {
  const metadata = {
    status: "Draft",
    classification: "Uncategorized",
    complexity: 1,
    impact: 1
  };
  
  // Extract status
  const statusMatch = content.match(new RegExp(config.patterns.metadataRegex.status));
  if (statusMatch && statusMatch[1]) {
    metadata.status = statusMatch[1];
  }
  
  // Extract classification
  const classMatch = content.match(new RegExp(config.patterns.metadataRegex.classification));
  if (classMatch && classMatch[1]) {
    metadata.classification = classMatch[1].trim();
  }
  
  // Extract complexity
  const complexityMatch = content.match(new RegExp(config.patterns.metadataRegex.complexity));
  if (complexityMatch && complexityMatch[1]) {
    metadata.complexity = parseInt(complexityMatch[1], 10) || 1;
  }
  
  return metadata;
}

// Find pattern implementation references
function analyzePatternUsage(pattern, repositories) {
  let references = 0;
  let implementations = 0;
  
  repositories.forEach(repo => {
    // Check for implementation files
    const implFiles = findPatternImplementationFiles(repo, pattern);
    implementations += implFiles.length;
    
    // Check for usage references
    const refs = findPatternReferences(repo, pattern);
    references += refs.length;
  });
  
  return {
    references,
    implementations,
    usageScore: calculateUsageScore(references, implementations)
  };
}

// Calculate metrics for a pattern
function calculateMetrics(pattern, metadata, usage) {
  // Calculate value score based on usage, impact, and inverse complexity
  // Higher usage and impact increase value, higher complexity decreases value
  const usageWeight = 0.5;
  const impactWeight = 0.4;
  const complexityWeight = 0.1;
  
  // Normalize complexity to a 0-1 scale where 0 is most complex
  const normalizedComplexity = Math.max(0, 1 - (metadata.complexity / 3));
  
  // Calculate weighted score
  const valueScore = (
    (usage.usageScore * usageWeight) +
    (metadata.impact * impactWeight) +
    (normalizedComplexity * complexityWeight)
  );
  
  return {
    pattern: pattern.name,
    status: metadata.status,
    classification: metadata.classification,
    valueScore: Math.min(3, valueScore),
    usageScore: usage.usageScore,
    complexityScore: metadata.complexity,
    impactScore: metadata.impact,
    codeReferences: usage.references
  };
}

// Generate metrics dashboard
function generateDashboard(metricsData, templateFile, outputFile) {
  console.log('Generating Pattern Metrics Dashboard...');
  
  // Load dashboard template
  const templateContent = fs.readFileSync(templateFile, 'utf8');
  
  // Insert metrics data into template
  const dashboardContent = templateContent.replace(
    'const metricsData = {};', 
    `const metricsData = ${JSON.stringify(metricsData, null, 2)};`
  );
  
  // Write dashboard file
  fs.writeFileSync(outputFile, dashboardContent);
  
  console.log(`Dashboard generated successfully: ${outputFile}`);
}

// The main metrics collection function
async function collectPatternMetrics() {
  // 1. Find all pattern files
  const patternFiles = findPatternFiles(config.patterns.directory);
  
  // 2. Extract metadata from patterns
  const patterns = patternFiles.map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const metadata = extractPatternMetadata(content);
    return {
      name: path.basename(file, path.extname(file)),
      path: file,
      metadata
    };
  });
  
  // 3. Analyze pattern usage in repositories
  const repositories = findRepositories(config.repositories);
  const metricsData = {};
  
  for (const pattern of patterns) {
    // Analyze pattern usage
    const usage = analyzePatternUsage(pattern, repositories);
    
    // Calculate metrics
    const metrics = calculateMetrics(pattern, pattern.metadata, usage);
    
    // Store metrics
    metricsData[pattern.name] = metrics;
  }
  
  // 4. Save metrics data to file
  fs.writeFileSync(
    path.join(__dirname, config.output.metrics_file),
    JSON.stringify(metricsData, null, 2)
  );
  
  // 5. Generate dashboard
  generateDashboard(
    metricsData,
    path.join(__dirname, 'templates/dashboard.html'),
    path.join(__dirname, config.output.dashboard_file)
  );
  
  return metricsData;
}
```

## Benefits

1. **Data-Driven Decisions**: Provides objective data for pattern promotion and refinement
2. **Improved Pattern Quality**: Helps identify patterns that need improvement
3. **Focused Development**: Directs resources to patterns that deliver the most value
4. **Transparency**: Makes pattern usage visible across the organization
5. **Pattern Evolution**: Supports the natural evolution of the pattern catalog

## Usage

1. **Setup the metrics system**:
   ```bash
   # Navigate to the metrics directory
   cd ss5/tools/metrics
   
   # Run the setup script
   ./setup.sh
   ```

2. **Collect pattern metrics**:
   ```bash
   ./pattern-metrics.js
   ```

3. **Generate the dashboard**:
   ```bash
   ./metrics-dashboard.js
   ```

4. **View the dashboard**:
   Open `docs/generated/pattern-dashboard.html` in your browser.

5. **Integrate with CI/CD**:
   Add metrics collection and dashboard generation to your CI/CD pipeline to keep metrics up-to-date.

## Related Patterns

- **Automated Documentation Generation**: Metrics can be incorporated into the generated documentation
- **Pattern Qualification Process**: Metrics provide data for the qualification and promotion process
- **Pattern Meta Catalog**: Metrics enrich the meta catalog with usage and value data 