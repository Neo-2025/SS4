# SS5 CI/CD Quick Start Guide

## Common Operations

### Validating Patterns

Patterns are automatically validated when pushed to the repository. To manually trigger validation:

1. Go to GitHub repository → Actions
2. Find "SS5 Pattern Validation" workflow
3. Click "Run workflow"

### Generating Documentation

Documentation is automatically generated on a schedule, but can be manually triggered:

1. Go to GitHub repository → Actions
2. Find "SS5 Docs Generation" workflow
3. Click "Run workflow"

### Collecting Metrics

Metrics about patterns are collected on a weekly schedule, but can be manually triggered:

1. Go to GitHub repository → Actions
2. Find "SS5 Metrics Collection" workflow
3. Click "Run workflow"
4. Download artifacts from the completed run

## Troubleshooting

### Common Issues

1. **Validation Errors**: Check pattern formatting against the schema in `ss5/scripts/validate-patterns.sh`
2. **Documentation Generation Failure**: Ensure the `setup.sh` script has run successfully
3. **Metrics Collection Issues**: Verify that `pattern-metrics.js` is executable

## Manual Setup

### Documentation Generation

If needed, run the setup script manually:

```bash
chmod +x ss5/tools/doc-gen/setup.sh
./ss5/tools/doc-gen/setup.sh
```

### Metrics Collection

Ensure the metrics script is executable:

```bash
chmod +x ss5/tools/metrics/pattern-metrics.js
```

Manually run metrics collection:

```bash
mkdir -p docs/generated
./ss5/tools/metrics/pattern-metrics.js > docs/generated/pattern-metrics.json
```

