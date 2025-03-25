#!/usr/bin/env node

/**
 * SS5 Metrics Dashboard Generator
 * Creates an HTML dashboard from collected pattern metrics
 */

const fs = require('fs');
const path = require('path');

// Use absolute paths
const scriptDir = __dirname;
const repoRoot = path.resolve(scriptDir, '../../..');
const outputDir = path.join(repoRoot, 'docs/generated');
const metricsFile = path.join(outputDir, 'metrics-data.json');

console.log('Generating SS5 Pattern Metrics Dashboard...');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Check if metrics data exists
if (!fs.existsSync(metricsFile)) {
  console.error(`Metrics data file not found at ${metricsFile}. Run pattern-metrics.js first.`);
  process.exit(1);
}

// Read metrics data
const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));

// Generate the dashboard HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SS5 Pattern Metrics Dashboard</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      margin-bottom: 30px;
    }
    .metrics-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px;
    }
    .metric-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: #2c3e50;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .chart-container {
      height: 250px;
      margin: 15px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-Draft { background-color: #e0e0e0; color: #333; }
    .status-Candidate { background-color: #bbdefb; color: #0d47a1; }
    .status-Validated { background-color: #c8e6c9; color: #1b5e20; }
    .status-Adaptive { background-color: #fff9c4; color: #f57f17; }
    .status-Core { background-color: #ffccbc; color: #bf360c; }
  </style>
  <script>
    window.onload = function() {
      // Render charts when page loads (if using a chart library)
      // This would use a library like Chart.js
      console.log('Dashboard loaded');
    }
  </script>
</head>
<body>
  <div class="dashboard">
    <div class="header">
      <h1>SS5 Pattern Metrics Dashboard</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="metrics-container">
      <div class="metric-card">
        <div class="metric-title">Pattern Status Distribution</div>
        <div class="chart-container" id="status-chart">
          <table>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
            ${Object.entries(metrics.patternsByStatus)
              .map(([status, count]) => `
                <tr>
                  <td><span class="status-badge status-${status}">${status}</span></td>
                  <td>${count}</td>
                </tr>
              `).join('')}
            <tr>
              <th>Total</th>
              <td>${metrics.totalPatterns}</td>
            </tr>
          </table>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-title">Pattern Categories</div>
        <div class="chart-container" id="category-chart">
          <table>
            <tr>
              <th>Category</th>
              <th>Count</th>
            </tr>
            ${Object.entries(metrics.patternsByCategory)
              .map(([category, count]) => `
                <tr>
                  <td>${category || 'Uncategorized'}</td>
                  <td>${count}</td>
                </tr>
              `).join('')}
          </table>
        </div>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-title">Top Patterns by Value Score</div>
      <div class="table-container">
        <table>
          <tr>
            <th>Pattern</th>
            <th>Status</th>
            <th>Code Examples</th>
            <th>Links</th>
            <th>Related Patterns</th>
            <th>Value Score</th>
          </tr>
          ${Object.entries(metrics.patternData)
            .sort((a, b) => b[1].valueScore - a[1].valueScore)
            .slice(0, 10)
            .map(([key, data]) => `
              <tr>
                <td><a href="https://github.com/Neo-2025/SS4/blob/main/${data.path}">${data.title || key}</a></td>
                <td><span class="status-badge status-${data.status}">${data.status}</span></td>
                <td>${data.codeExamples}</td>
                <td>${data.links}</td>
                <td>${data.relatedPatterns}</td>
                <td>${data.valueScore}</td>
              </tr>
            `).join('')}
        </table>
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-title">All Patterns</div>
      <div class="table-container">
        <table>
          <tr>
            <th>Pattern</th>
            <th>Status</th>
            <th>Category</th>
            <th>Value Score</th>
          </tr>
          ${Object.entries(metrics.patternData)
            .map(([key, data]) => `
              <tr>
                <td><a href="https://github.com/Neo-2025/SS4/blob/main/${data.path}">${data.title || key}</a></td>
                <td><span class="status-badge status-${data.status}">${data.status}</span></td>
                <td>${data.classification || 'Uncategorized'}</td>
                <td>${data.valueScore}</td>
              </tr>
            `).join('')}
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;

// Write the dashboard HTML to file
fs.writeFileSync(path.join(outputDir, 'pattern-dashboard.html'), html);

console.log(`Metrics dashboard generated at: ${path.join(outputDir, 'pattern-dashboard.html')}`);
