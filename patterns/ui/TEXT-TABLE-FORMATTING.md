---
status: Candidate
classification: ui
---

# TEXT-TABLE-FORMATTING

## Status

**Current Status**: Candidate
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 2
- Projects: 1
- Related Patterns: 3

## Classification

UI Pattern

## Problem

CLI and terminal-based applications need to present tabular data in a clear, readable format without relying on HTML or graphical rendering. Standard console.log output or simple text strings lack the visual structure needed to effectively present complex data relationships and tables.

## Solution

The Text Table Formatting pattern uses Unicode box-drawing characters and consistent spacing to create visually structured tables in text-only environments. It formats tabular data with proper alignment, borders, and spacing to improve readability and information hierarchy.

### Core Components

1. **Border Characters**: Unicode box-drawing characters for table borders
2. **Column Alignment**: Consistent spacing and alignment of column content
3. **Row Formatting**: Consistent row formatting with separators
4. **Header Styling**: Distinguished header styling for table headers
5. **Table Structure**: Logical division of header, body, and footer sections

### Key Features

1. **Unicode Borders**: Box-drawing characters for clear visual boundaries
2. **Consistent Alignment**: Text alignment for readable columns
3. **Visual Hierarchy**: Clear distinction between headers and data
4. **Terminal Compatibility**: Works in any text-based terminal or console
5. **No Dependencies**: Pure string formatting without external libraries

## Implementation Example

```typescript
/**
 * List agencies command: >list agencies
 */
listAgencies(): CommandResult {
  const agencies = this.agencyService.listAgencies();
  
  if (agencies.length === 0) {
    return {
      success: true,
      message: 'HealthBench: No agencies found. Add agencies with >add CCN command.'
    };
  }
  
  // Get all client groups
  const clientGroups = this.agencyService.listClientGroups();
  
  // Format table header
  const tableHeader = [
    '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━┓',
    '┃ AGENCY NAME                    ┃ CCN       ┃ TYPE        ┃',
    '┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━┩'
  ];
  
  // Format table rows
  const tableRows = agencies.map(agency => {
    // Find group type for agency
    let groupType = '';
    
    // Look for agency in all client groups
    for (const clientGroup of clientGroups) {
      const agencyGroup = clientGroup.agencies.find(a => a.agencyId === agency.ccn);
      if (agencyGroup) {
        groupType = agencyGroup.type;
        break;
      }
    }
    
    // Format row
    return `│ ${agency.name.padEnd(30)} │ ${agency.ccn.padEnd(9)} │ ${groupType.padEnd(11)} │`;
  });
  
  // Format table footer
  const tableFooter = ['└────────────────────────────────┴───────────┴─────────────┘'];
  
  // Combine all parts
  const table = [
    ...tableHeader,
    ...tableRows,
    ...tableFooter
  ].join('\n');
  
  return {
    success: true,
    message: table,
    data: agencies
  };
}
```

## Unicode Box Drawing Characters

```
┌─┬─┐  Top borders: ┌ (top-left), ┬ (top-middle), ┐ (top-right)
│ │ │  Vertical borders: │ (vertical)
├─┼─┤  Middle borders: ├ (middle-left), ┼ (middle-middle), ┤ (middle-right)
└─┴─┘  Bottom borders: └ (bottom-left), ┴ (bottom-middle), ┘ (bottom-right)
      Horizontal borders: ─ (horizontal)

// Heavy borders for headers
┏━┳━┓  Heavy top: ┏ (top-left), ┳ (top-middle), ┓ (top-right)
┃ ┃ ┃  Heavy vertical: ┃ (vertical)
┡━╇━┩  Mixed borders: ┡ (middle-left-heavy), ╇ (middle mixed), ┩ (middle-right-heavy)
┗━┻━┛  Heavy bottom: ┗ (bottom-left), ┻ (bottom-middle), ┛ (bottom-right)
      Heavy horizontal: ━ (horizontal)
```

## Benefits

1. **Improved Readability**: Clear visual structure for tabular data
2. **Terminal Compatibility**: Works in any text-based environment
3. **No Dependencies**: Pure string formatting without external libraries
4. **Visual Hierarchy**: Distinguishes headers, data, and sections
5. **Compact Representation**: Efficient use of screen space
6. **Consistent Styling**: Standardized approach to data presentation
7. **Accessibility**: Works with screen readers and text-only interfaces

## Limitations

1. **Limited Styling**: Limited styling options compared to HTML tables
2. **Width Management**: Fixed-width columns may truncate long content
3. **Terminal Support**: Some terminals may not render Unicode characters correctly
4. **Content Wrapping**: No built-in support for content wrapping in cells
5. **Localization Challenges**: Fixed-width columns may not work well with all languages

## Related Patterns

- **CLI-COMMAND-PATTERN**: Tables are often used for command output
- **TERMINAL-PROGRESS-TRACKER**: Both provide terminal-friendly visual formatting
- **MULTI-ENTITY-GROUPING**: Tables are often used to display grouped entities

## Usage Examples

### Star Rating Report

```typescript
/**
 * Format star rating report as a text table
 */
formatStarRatingReport(agencies: AgencyWithRating[]): string {
  // Format table header
  const tableHeader = [
    '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓',
    '┃ AGENCY                         ┃ STAR RATING   ┃ VS LAST QTR ┃',
    '┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━┩'
  ];
  
  // Format table rows
  const tableRows = agencies.map(agency => {
    const stars = '★'.repeat(Math.floor(agency.rating)) + '☆'.repeat(5 - Math.floor(agency.rating));
    const trend = agency.trend > 0 ? '↗' : (agency.trend < 0 ? '↘' : '→');
    
    return `│ ${agency.name.padEnd(30)} │ ${stars} (${agency.rating.toFixed(1)})  │     ${trend}       │`;
  });
  
  // Format table footer
  const tableFooter = ['└────────────────────────────────┴───────────────┴─────────────┘'];
  
  // Combine all parts
  return [...tableHeader, ...tableRows, ...tableFooter].join('\n');
}
```

### Quality Measures Table

```typescript
/**
 * Format quality measures as a text table
 */
formatQualityMeasuresTable(measures: QualityMeasure[]): string {
  // Format table header
  const tableHeader = [
    '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━┓',
    '┃ MEASURE NAME                   ┃ SCORE     ┃ STATE AVG   ┃ NATL AVG    ┃',
    '┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━╇━━━━━━━━━━━━━╇━━━━━━━━━━━━━┩'
  ];
  
  // Format table rows
  const tableRows = measures.map(measure => {
    return `│ ${measure.name.padEnd(30)} │ ${measure.score.toFixed(1)}%     │ ${measure.stateAverage.toFixed(1)}%       │ ${measure.nationalAverage.toFixed(1)}%       │`;
  });
  
  // Format table footer
  const tableFooter = ['└────────────────────────────────┴───────────┴─────────────┴─────────────┘'];
  
  // Combine all parts
  return [...tableHeader, ...tableRows, ...tableFooter].join('\n');
}
```

## Evolution History

- **v1.0** (Current): Initial implementation with Unicode box-drawing characters 