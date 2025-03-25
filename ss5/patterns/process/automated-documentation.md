# Automated Documentation Generation

## Status: Candidate

## Classification: Process

## Problem

Pattern-based development requires comprehensive, up-to-date documentation to be effective, but manually maintaining documentation is time-consuming, error-prone, and often neglected. As a pattern catalog grows, it becomes increasingly difficult to maintain consistent documentation across all patterns and pattern chains, leading to knowledge gaps and inconsistent implementation.

## Solution

Create an automated documentation generation system that extracts metadata from pattern and chain files, generates comprehensive documentation in multiple formats, and automatically updates when patterns change. This system parses standardized pattern file formats, extracts key information, and generates structured documentation that is easily accessible to developers.

## Key Implementation

```javascript
// Configuration for documentation generator
const config = {
  patternsDir: path.resolve(__dirname, '../../patterns'),
  chainsDir: path.resolve(__dirname, '../../chains'),
  outputDir: path.resolve(__dirname, '../../../docs/generated'),
  templateDir: path.resolve(__dirname, 'templates'),
  formats: ['markdown', 'html'],
  catalogFile: 'pattern-catalog.md',
  statsFile: 'pattern-stats.json',
};

// Pattern extraction regex patterns
const patternRegexes = {
  title: /^# (.+)$/m,
  status: /^## Status: (.+)$/m,
  classification: /^## Classification: (.+)$/m,
  problem: /^## Problem\s+([\s\S]*?)(?=^## )/m,
  solution: /^## Solution\s+([\s\S]*?)(?=^## )/m,
  implementation: /^## Key Implementation\s+([\s\S]*?)(?=^## |$)/m,
  benefits: /^## Benefits\s+([\s\S]*?)(?=^## |$)/m,
  usedIn: /^## Used In\s+([\s\S]*?)(?=^## |$)/m,
  examples: /^## Examples\s+([\s\S]*?)(?=^## |$)/m,
};

// Main function for documentation generation
async function main() {
  // Find and parse pattern and chain files
  const patternFiles = await findPatternFiles();
  const chainFiles = await findChainFiles();
  const patterns = await parsePatternFiles(patternFiles);
  const chains = await parseChainFiles(chainFiles);
  
  // Generate documentation in different formats
  const catalog = await generatePatternCatalog(patterns, chains);
  await saveToFile(`${config.outputDir}/${config.catalogFile}`, catalog);
  
  const stats = await generatePatternStats(patterns, chains);
  await saveToFile(`${config.outputDir}/${config.statsFile}`, JSON.stringify(stats, null, 2));
  
  await htmlGenerator.generateHtmlDocs(patterns, chains, stats, config);
}

// File watcher for automatic updates
function watchFiles() {
  const watchPaths = [
    `${config.patternsDir}/**/*.md`,
    `${config.chainsDir}/**/*.md`,
  ];
  
  const watcher = chokidar.watch(watchPaths, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
  });
  
  watcher
    .on('add', path => debouncedUpdate())
    .on('change', path => debouncedUpdate())
    .on('unlink', path => debouncedUpdate());
}
```

## Benefits

- **Consistency**: Ensures documentation follows a standardized format across all patterns
- **Up-to-date**: Automatically updates documentation when patterns change
- **Comprehensive**: Extracts metadata from all patterns and chains to create complete documentation
- **Multiple formats**: Generates documentation in both Markdown and HTML formats
- **Metrics and statistics**: Provides insights into pattern usage, status, and distribution
- **Time-saving**: Eliminates the need for manual documentation maintenance
- **Searchable**: Creates searchable, filterable documentation for easy reference
- **Integration**: Can be integrated with CI/CD pipelines for automatic updates

## Usage

The Automated Documentation Generation pattern is implemented through a set of scripts and templates that work together to extract pattern metadata and generate documentation:

1. **Setup**: Run the setup script to install dependencies and configure the generator
   ```bash
   ./setup.sh
   ```

2. **Documentation Generation**: Generate documentation once
   ```bash
   ./generate-docs.js
   ```

3. **Automatic Updates**: Watch for changes and update documentation automatically
   ```bash
   ./update-docs.js
   ```

4. **CI/CD Integration**: Integrate with CI/CD pipelines to update documentation on push
   ```yaml
   name: Update Documentation
   on:
     push:
       branches: [ main ]
       paths:
         - 'ss5/patterns/**/*.md'
         - 'ss5/chains/**/*.md'
   ```

The system produces documentation in the `docs/generated/` directory, including a markdown catalog, an interactive HTML website, and JSON statistics.

## Used In

- SS5 Pattern Meta Catalog
- SS5 Pattern Chains documentation
- SS5 Implementation Plan documentation
- SmartStack v5 Specification

## Related Patterns

- **Pattern Qualification Process**: The Documentation Generator respects and displays the qualification status of patterns
- **Pattern Meta Catalog**: The generator extracts metadata from the pattern catalog
- **Project-Specific Pattern Chains**: Documents how patterns are chained together for specific projects
- **SS5-B1 Workflow**: Integrates with the workflow for pattern documentation updates 