#!/usr/bin/env node

/**
 * SS5 Metrics Dashboard Generator
 * Creates visualizations of pattern metrics
 */

const fs = require('fs-extra');
const path = require('path');

// Configuration with absolute paths
const SCRIPT_DIR = path.dirname(require.main.filename);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '../../..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'docs/generated');
const INPUT_FILE = path.join(OUTPUT_DIR, 'pattern-metrics.json');

// Ensure input exists
if (!fs.existsSync(INPUT_FILE)) {
  console.error('Metrics data not found! Run pattern-metrics.js first.');
  process.exit(1);
}

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

console.log('Generating metrics dashboard...');

// Read metrics data
const metricsData = fs.readJsonSync(INPUT_FILE);
const patterns = Object.values(metricsData);

// Generate dashboard HTML
const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SS5 Pattern Metrics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #2c3e50; }
        h2 { color: #3498db; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .chart-container { margin-bottom: 40px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: #f8f8f8; padding: 20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; color: #2980b9; }
        .metric-label { font-size: 0.9em; color: #7f8c8d; }
        .status-distribution { display: flex; margin-top: 10px; height: 20px; border-radius: 5px; overflow: hidden; }
        .status-segment { height: 100%; }
        .table-container { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; position: sticky; top: 0; }
        tr:hover { background-color: #f5f5f5; }
        .value-high { color: #27ae60; }
        .value-medium { color: #f39c12; }
        .value-low { color: #e74c3c; }
        .navigation { background: #f8f8f8; padding: 10px; margin-bottom: 20px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="navigation">
            <a href="index.html">Home</a> | 
            <a href="patterns.html">Patterns</a> | 
            <a href="chains.html">Chains</a> |
            <a href="pattern-dashboard.html">Metrics Dashboard</a>
        </div>
        
        <h1>SS5 Pattern Metrics Dashboard</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${patterns.length}</div>
                <div class="metric-label">Total Patterns</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${patterns.filter(p => p.status === 'Core').length}</div>
                <div class="metric-label">Core Patterns</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${(patterns.reduce((sum, p) => sum + p.valueScore, 0) / patterns.length).toFixed(1)}</div>
                <div class="metric-label">Average Value Score</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${(patterns.reduce((sum, p) => sum + p.completenessScore, 0) / patterns.length).toFixed(1)}%</div>
                <div class="metric-label">Average Documentation Completeness</div>
            </div>
        </div>
        
        <h2>Status Distribution</h2>
        <div class="chart-container">
            <canvas id="statusChart"></canvas>
        </div>
        
        <h2>Value Score by Pattern</h2>
        <div class="chart-container">
            <canvas id="valueChart"></canvas>
        </div>
        
        <h2>Pattern Metrics Table</h2>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Pattern</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Value Score</th>
                        <th>Doc Completeness</th>
                        <th>Chain Usage</th>
                    </tr>
                </thead>
                <tbody>
                    ${patterns.sort((a, b) => b.valueScore - a.valueScore).map(p => `
                    <tr>
                        <td><a href="${p.file}.html">${p.pattern}</a></td>
                        <td>${p.status}</td>
                        <td>${p.category}</td>
                        <td class="${p.valueScore >= 7 ? 'value-high' : p.valueScore >= 4 ? 'value-medium' : 'value-low'}">${p.valueScore.toFixed(1)}</td>
                        <td>${p.completenessScore.toFixed(1)}%</td>
                        <td>${p.chainUsage}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <script>
            // Status distribution chart
            const statuses = ['Draft', 'Candidate', 'Validated', 'Adaptive', 'Core'];
            const statusCounts = statuses.map(status => 
                ${JSON.stringify(patterns)}.filter(p => p.status === status).length
            );
            
            new Chart(document.getElementById('statusChart'), {
                type: 'bar',
                data: {
                    labels: statuses,
                    datasets: [{
                        label: 'Number of Patterns',
                        data: statusCounts,
                        backgroundColor: [
                            '#f39c12', // Draft
                            '#3498db', // Candidate
                            '#2ecc71', // Validated
                            '#9b59b6', // Adaptive
                            '#e74c3c'  // Core
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Pattern Count'
                            }
                        }
                    }
                }
            });
            
            // Value score chart
            const valueData = ${JSON.stringify(patterns.sort((a, b) => b.valueScore - a.valueScore).slice(0, 15))}
                .map(p => ({ name: p.pattern, value: p.valueScore, status: p.status }));
            
            new Chart(document.getElementById('valueChart'), {
                type: 'horizontalBar',
                data: {
                    labels: valueData.map(d => d.name),
                    datasets: [{
                        label: 'Value Score',
                        data: valueData.map(d => d.value),
                        backgroundColor: valueData.map(d => {
                            switch(d.status) {
                                case 'Core': return '#e74c3c';
                                case 'Adaptive': return '#9b59b6';
                                case 'Validated': return '#2ecc71';
                                case 'Candidate': return '#3498db';
                                default: return '#f39c12';
                            }
                        })
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Value Score'
                            },
                            max: 10
                        }
                    }
                }
            });
        </script>
    </div>
</body>
</html>
`;

// Write dashboard HTML
fs.writeFileSync(path.join(OUTPUT_DIR, 'pattern-dashboard.html'), dashboardHtml);

console.log('Metrics dashboard generated successfully!'); 