#!/usr/bin/env node

/**
 * SS5 Pattern Metrics Collection
 * Analyzes pattern files to collect metrics on usage and quality
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Configuration with absolute paths
const SCRIPT_DIR = path.dirname(require.main.filename);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../..');
const PATTERNS_DIR = path.join(REPO_ROOT, 'ss5/patterns');
const CHAINS_DIR = path.join(REPO_ROOT, 'ss5/chains');
const OUTPUT_DIR = path.join(REPO_ROOT, 'docs/generated');
const METRICS_DATA_PATH = path.join(SCRIPT_DIR, 'metrics-data.json');

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

console.log('Collecting pattern metrics...');

// Get all pattern files
const patternFiles = glob.sync(`${PATTERNS_DIR}/**/*.md`, { ignore: `${PATTERNS_DIR}/**/_template.md` });
const chainFiles = glob.sync(`${CHAINS_DIR}/**/*.md`, { ignore: `${CHAINS_DIR}/**/_*.md` });

// Initialize metrics data
const metricsData = {};

// Process each pattern file
patternFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const filename = path.basename(file, '.md');
    const category = path.dirname(file).split('/').pop();
    
    // Extract pattern information
    const titleMatch = content.match(/^# (.*)/m);
    const statusMatch = content.match(/^## Status: (.*)/m);
    const classificationMatch = content.match(/^## Classification: (.*)/m);
    
    const title = titleMatch ? titleMatch[1].trim() : filename;
    const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
    const classification = classificationMatch ? classificationMatch[1].trim() : 'Unknown';
    
    // Calculate content metrics
    const lines = content.split('\n').length;
    const codeBlocks = (content.match(/```/g) || []).length / 2; // Each code block has an opening and closing ```
    const hasBenefits = content.includes('## Benefits');
    const hasLimitations = content.includes('## Limitations');
    const hasRelated = content.includes('## Related Patterns');
    
    // Calculate documentation completeness score (0-100)
    let completenessScore = 0;
    const checks = [
        content.includes('# '),                 // Title
        content.includes('## Status:'),         // Status
        content.includes('## Classification:'), // Classification
        content.includes('## Problem'),         // Problem statement
        content.includes('## Solution'),        // Solution
        content.includes('## Implementation'),  // Implementation
        hasBenefits,                           // Benefits
        hasLimitations,                        // Limitations
        hasRelated,                            // Related Patterns
        codeBlocks > 0                         // Code examples
    ];
    
    completenessScore = (checks.filter(Boolean).length / checks.length) * 100;
    
    // Check chain usage
    const chainUsage = chainFiles.filter(chainFile => {
        const chainContent = fs.readFileSync(chainFile, 'utf-8');
        return chainContent.includes(title);
    }).length;
    
    // Calculate value score (based on status, completeness, and chain usage)
    let valueScoreFactors = {
        'Draft': 1,
        'Candidate': 2,
        'Validated': 3,
        'Adaptive': 4,
        'Core': 5
    };
    
    const statusFactor = valueScoreFactors[status] || 1;
    const valueScore = (
        (statusFactor * 20) +          // Status: 20-100 points
        (completenessScore * 0.4) +    // Completeness: 0-40 points
        (chainUsage * 10) +            // Chain usage: 0+ points (10 per chain)
        (codeBlocks * 5)               // Code examples: 0+ points (5 per example)
    ) / 10; // Scale to 0-100
    
    // Store metrics
    metricsData[filename] = {
        pattern: title,
        status,
        classification,
        category,
        lines,
        codeBlocks,
        completenessScore,
        chainUsage,
        valueScore: Math.min(10, valueScore), // Cap at 10
        file: filename
    };
});

// Write metrics data to file
fs.writeJsonSync(path.join(OUTPUT_DIR, 'pattern-metrics.json'), metricsData, { spaces: 2 });
fs.writeJsonSync(METRICS_DATA_PATH, metricsData, { spaces: 2 });

console.log(`Collected metrics for ${Object.keys(metricsData).length} patterns.`);
console.log('Pattern metrics collection complete!'); 