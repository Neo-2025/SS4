#!/usr/bin/env node
console.log("Documentation generation running");
const fs = require('fs');
if (!fs.existsSync("docs/generated")) {
  fs.mkdirSync("docs/generated", { recursive: true });
}
fs.writeFileSync("docs/generated/index.html", "<html><body><h1>SS5 Documentation</h1><p>Generated on " + new Date().toISOString() + "</p></body></html>");
console.log("Documentation generated successfully");
