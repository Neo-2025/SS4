#!/usr/bin/env node

/**
 * SS5 Pattern Documentation Generator
 * Generates HTML documentation from pattern markdown files
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const markdownIt = require('markdown-it');
const md = new markdownIt();

// Configuration
const PATTERNS_DIR = 'ss5/patterns';
const CHAINS_DIR = 'ss5/chains';
const OUTPUT_DIR = 'docs/generated';
const TEMPLATE_DIR = 'ss5/tools/doc-gen/templates';

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

// Create templates directory if it doesn't exist
fs.ensureDirSync(TEMPLATE_DIR);

// Create simple HTML template if it doesn't exist
const defaultTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        h3 { color: #2980b9; }
        pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
        code { font-family: 'Courier New', Courier, monospace; }
        .status { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 0.8em; font-weight: bold; }
        .status-draft { background: #f39c12; color: white; }
        .status-candidate { background: #3498db; color: white; }
        .status-validated { background: #2ecc71; color: white; }
        .status-adaptive { background: #9b59b6; color: white; }
        .status-core { background: #e74c3c; color: white; }
        .navigation { background: #f8f8f8; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
        .pattern-list { list-style-type: none; padding: 0; }
        .pattern-list li { margin-bottom: 8px; }
        .pattern-list a { text-decoration: none; color: #3498db; }
        .pattern-list a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="navigation">
            <a href="index.html">Home</a> | 
            <a href="patterns.html">Patterns</a> | 
            <a href="chains.html">Chains</a>
        </div>
        <h1>{{title}}</h1>
        <div class="content">
            {{{content}}}
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(TEMPLATE_DIR, 'default.html'), defaultTemplate);

// Generate pattern documentation
console.log('Generating pattern documentation...');

// Get all pattern files
const patternFiles = glob.sync(`${PATTERNS_DIR}/**/*.md`, { ignore: `${PATTERNS_DIR}/**/_template.md` });

// Create patterns index
let patternIndex = [];

// Process each pattern file
patternFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const filename = path.basename(file, '.md');
    const category = path.dirname(file).split('/').pop();
    
    // Extract pattern name and status
    const titleMatch = content.match(/^# (.*)/m);
    const statusMatch = content.match(/^## Status: (.*)/m);
    
    const title = titleMatch ? titleMatch[1] : filename;
    const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
    
    // Add to index
    patternIndex.push({
        title,
        filename: `${filename}.html`,
        category,
        status
    });
    
    // Convert markdown to HTML
    const htmlContent = md.render(content);
    
    // Create output with status styling
    const statusClass = `status-${status.toLowerCase()}`;
    let outputHtml = defaultTemplate
        .replace('{{title}}', title)
        .replace('{{{content}}}', htmlContent)
        .replace(/<h1>(.*?)<\/h1>/, `<h1>$1 <span class="status ${statusClass}">${status}</span></h1>`);
    
    // Write output file
    fs.writeFileSync(path.join(OUTPUT_DIR, `${filename}.html`), outputHtml);
    console.log(`Generated: ${filename}.html`);
});

// Generate patterns index page
let patternsHtml = `
<h2>Pattern Index</h2>
<p>Total patterns: ${patternIndex.length}</p>

<h3>By Category</h3>
`;

// Group by category
const categories = {};
patternIndex.forEach(pattern => {
    if (!categories[pattern.category]) {
        categories[pattern.category] = [];
    }
    categories[pattern.category].push(pattern);
});

// Add category sections
Object.keys(categories).forEach(category => {
    patternsHtml += `<h4>${category}</h4>\n<ul class="pattern-list">\n`;
    categories[category].forEach(pattern => {
        patternsHtml += `  <li><a href="${pattern.filename}">${pattern.title}</a> <span class="status status-${pattern.status.toLowerCase()}">${pattern.status}</span></li>\n`;
    });
    patternsHtml += `</ul>\n`;
});

// Add status sections
patternsHtml += `<h3>By Status</h3>\n`;
const statuses = ['Core', 'Adaptive', 'Validated', 'Candidate', 'Draft'];
statuses.forEach(status => {
    const patternsWithStatus = patternIndex.filter(p => p.status.toLowerCase() === status.toLowerCase());
    if (patternsWithStatus.length > 0) {
        patternsHtml += `<h4>${status} (${patternsWithStatus.length})</h4>\n<ul class="pattern-list">\n`;
        patternsWithStatus.forEach(pattern => {
            patternsHtml += `  <li><a href="${pattern.filename}">${pattern.title}</a> (${pattern.category})</li>\n`;
        });
        patternsHtml += `</ul>\n`;
    }
});

// Write patterns index
let patternsIndexHtml = defaultTemplate
    .replace('{{title}}', 'SS5 Pattern Catalog')
    .replace('{{{content}}}', patternsHtml);
fs.writeFileSync(path.join(OUTPUT_DIR, 'patterns.html'), patternsIndexHtml);
console.log(`Generated: patterns.html`);

// Process chain files similarly
const chainFiles = glob.sync(`${CHAINS_DIR}/**/*.md`, { ignore: `${CHAINS_DIR}/**/_*.md` });
let chainIndex = [];

// Process each chain file
chainFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const filename = path.basename(file, '.md');
    
    // Extract chain name
    const titleMatch = content.match(/^# Chain: (.*)/m);
    const title = titleMatch ? titleMatch[1] : filename;
    
    // Add to index
    chainIndex.push({
        title,
        filename: `${filename}.html`
    });
    
    // Convert markdown to HTML
    const htmlContent = md.render(content);
    
    // Create output
    let outputHtml = defaultTemplate
        .replace('{{title}}', title)
        .replace('{{{content}}}', htmlContent);
    
    // Write output file
    fs.writeFileSync(path.join(OUTPUT_DIR, `${filename}.html`), outputHtml);
    console.log(`Generated: ${filename}.html`);
});

// Generate chains index page
let chainsHtml = `
<h2>Pattern Chain Index</h2>
<p>Total chains: ${chainIndex.length}</p>

<ul class="pattern-list">
`;

chainIndex.forEach(chain => {
    chainsHtml += `  <li><a href="${chain.filename}">${chain.title}</a></li>\n`;
});
chainsHtml += `</ul>\n`;

// Write chains index
let chainsIndexHtml = defaultTemplate
    .replace('{{title}}', 'SS5 Pattern Chains')
    .replace('{{{content}}}', chainsHtml);
fs.writeFileSync(path.join(OUTPUT_DIR, 'chains.html'), chainsIndexHtml);
console.log(`Generated: chains.html`);

// Generate main index page
let indexHtml = `
<h1>SS5 Pattern Documentation</h1>

<p>Welcome to the SS5 Pattern Documentation. This documentation contains the Pattern Meta Catalog for SmartStack v5.</p>

<div class="content-blocks">
    <div>
        <h2><a href="patterns.html">Pattern Catalog</a></h2>
        <p>Browse the complete pattern catalog with ${patternIndex.length} patterns across multiple categories.</p>
    </div>
    
    <div>
        <h2><a href="chains.html">Pattern Chains</a></h2>
        <p>Explore ${chainIndex.length} pattern chains for implementing complex features.</p>
    </div>
</div>

<h3>Pattern Status Distribution</h3>
<ul>
`;

statuses.forEach(status => {
    const count = patternIndex.filter(p => p.status.toLowerCase() === status.toLowerCase()).length;
    indexHtml += `  <li><span class="status status-${status.toLowerCase()}">${status}</span>: ${count} patterns</li>\n`;
});

indexHtml += `</ul>

<h3>Recent Updates</h3>
<p>Last updated: ${new Date().toLocaleDateString()}</p>
`;

// Write main index
let mainIndexHtml = defaultTemplate
    .replace('{{title}}', 'SS5 Documentation')
    .replace('{{{content}}}', indexHtml);
fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), mainIndexHtml);
console.log(`Generated: index.html`);

console.log('Documentation generation complete!'); 