#!/usr/bin/env node

/**
 * SS5 Pattern Metrics Collection Tool
 * Analyzes pattern files to collect metrics about pattern usage, quality, and relationships
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use absolute paths
const scriptDir = __dirname;
const repoRoot = path.resolve(scriptDir, '../../..');
const patternsDir = path.join(repoRoot, 'ss5/patterns');
const outputDir = path.join(repoRoot, 'docs/generated');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Analyzing SS5 patterns for metrics collection...');

// Metrics to collect
const metrics = {
  totalPatterns: 0,
  patternsByStatus: {
    Draft: 0,
    Candidate: 0,
    Validated: 0,
    Adaptive: 0,
    Core: 0
  },
  patternsByCategory: {},
  patternData: {}
};

// Helper function to extract value from pattern content
function extractValue(content, marker) {
  const regex = new RegExp(`${marker}\\s*([^\\n]+)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

// Process each pattern file
function processPatterns(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processPatterns(filePath);
    } else if (file.name.endsWith('.md') && !file.name.startsWith('_')) {
      // Skip template files
      metrics.totalPatterns++;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const title = extractValue(content, '#');
      const status = extractValue(content, '## Status:');
      const classification = extractValue(content, '## Classification:');
      
      // Count by status
      if (metrics.patternsByStatus[status] !== undefined) {
        metrics.patternsByStatus[status]++;
      }
      
      // Count by category
      if (!metrics.patternsByCategory[classification]) {
        metrics.patternsByCategory[classification] = 0;
      }
      metrics.patternsByCategory[classification]++;
      
      // Store pattern data
      const patternKey = file.name.replace('.md', '');
      const codeExamples = (content.match(/```[a-z]*[\s\S]*?```/g) || []).length;
      const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
      const relatedPatterns = (content.match(/Related Patterns:/i) ? 
        content.split('Related Patterns:')[1].split('\n\n')[0].split('\n').filter(line => line.trim().length > 0).length : 
        0);
      
      metrics.patternData[patternKey] = {
        title,
        status,
        classification,
        path: filePath.replace(repoRoot + '/', ''),
        codeExamples,
        links,
        relatedPatterns,
        valueScore: calculatePatternValue(status, codeExamples, links, relatedPatterns)
      };
    }
  }
}

// Calculate a value score for the pattern based on its attributes
function calculatePatternValue(status, codeExamples, links, relatedPatterns) {
  const statusWeight = {
    Draft: 1,
    Candidate: 2,
    Validated: 3,
    Adaptive: 4,
    Core: 5
  };
  
  return (statusWeight[status] || 0) * 2 + 
         Math.min(codeExamples, 5) + 
         Math.min(links, 3) + 
         Math.min(relatedPatterns, 4);
}

// Start the metrics collection
try {
  processPatterns(patternsDir);
  
  // Get Git contribution data if in a Git repo
  try {
    Object.keys(metrics.patternData).forEach(pattern => {
      const filePath = metrics.patternData[pattern].path;
      const gitLog = execSync(`git log --follow --format="%ae %aI" -- "${filePath}"`, { cwd: repoRoot }).toString();
      const contributors = new Set(gitLog.split('\n')
        .filter(line => line.trim())
        .map(line => line.split(' ')[0]));
      
      metrics.patternData[pattern].contributors = Array.from(contributors);
      metrics.patternData[pattern].contributorCount = contributors.size;
    });
  } catch (gitError) {
    console.warn('Git information collection failed. Skipping Git metrics.');
  }
  
  // Write metrics to file
  fs.writeFileSync(
    path.join(outputDir, 'metrics-data.json'),
    JSON.stringify(metrics, null, 2)
  );
  
  console.log(`Metrics collection complete. Analyzed ${metrics.totalPatterns} patterns.`);
  console.log(`Status distribution: ${JSON.stringify(metrics.patternsByStatus)}`);
  console.log(`Output saved to: ${path.join(outputDir, 'metrics-data.json')}`);
} catch (error) {
  console.error('Error collecting metrics:', error);
  process.exit(1);
}
