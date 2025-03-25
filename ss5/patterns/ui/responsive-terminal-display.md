# Responsive Terminal Display

## Status: Candidate

## Classification: UI

## Problem
Terminal UI layouts often break on different screen sizes, leading to poor user experience on mobile devices, tablets, or when resizing browser windows.

## Context
This pattern should be applied when creating:
- Terminal-like interfaces that need to work across device sizes
- CLI applications with complex output formatting
- Text-based visualizations that must adapt to container width
- Command interfaces for both desktop and mobile users

## Solution
Implement a responsive approach to terminal displays with:

1. **Responsive Container**:
   - Fluid width with appropriate constraints
   - Font size adjustments based on viewport
   - Dynamic height calculation
   - Proper overflow handling

2. **Content Adaptation**:
   - Line wrapping for commands and output
   - Responsive tables using appropriate techniques
   - Simplified visualizations on smaller screens
   - Condensed information displays on mobile

3. **Interactive Adjustments**:
   - Touch-friendly input areas on mobile
   - Larger click targets for mobile users
   - Keyboard-friendly interactions on desktop
   - Appropriate scrolling behavior

## Implementation Example
```typescript
function ResponsiveTerminal({ 
  children, 
  minWidth = 320,
  maxWidth = 1200
}: {
  children: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
}) {
  const [fontSize, setFontSize] = useState('14px');
  const [lineHeight, setLineHeight] = useState('1.4');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Mobile styling
        setFontSize('12px');
        setLineHeight('1.3');
      } else if (width < 1024) {
        // Tablet styling
        setFontSize('13px');
        setLineHeight('1.4');
      } else {
        // Desktop styling
        setFontSize('14px');
        setLineHeight('1.5');
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div 
      className="terminal-container" 
      style={{ 
        fontSize,
        lineHeight,
        width: '100%',
        maxWidth,
        minWidth: Math.min(minWidth, window.innerWidth - 40),
        overflowX: 'auto',
        overflowY: 'auto',
      }}
    >
      {children}
    </div>
  );
}

// Responsive terminal table component
function ResponsiveTerminalTable({ 
  data,
  columns,
  mobileFormat = 'stack' // 'stack' | 'scroll' | 'simplify'
}: {
  data: any[];
  columns: { header: string; accessor: string; width?: number }[];
  mobileFormat?: 'stack' | 'scroll' | 'simplify';
}) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  if (isMobile && mobileFormat === 'stack') {
    // Render stacked card view for mobile
    return (
      <div className="terminal-table-mobile">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="terminal-card">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="terminal-card-field">
                <div className="terminal-card-label">{column.header}:</div>
                <div className="terminal-card-value">{row[column.accessor]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  if (isMobile && mobileFormat === 'simplify') {
    // Render simplified table with fewer columns
    const priorityColumns = columns.slice(0, 3); // Only show first 3 columns
    
    return (
      <div className="terminal-table-simple">
        <div className="terminal-table-header">
          {priorityColumns.map((column, colIndex) => (
            <div key={colIndex} className="terminal-table-cell">{column.header}</div>
          ))}
        </div>
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="terminal-table-row">
            {priorityColumns.map((column, colIndex) => (
              <div key={colIndex} className="terminal-table-cell">{row[column.accessor]}</div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  // Default or scroll format
  return (
    <div className={`terminal-table-wrapper ${isMobile && mobileFormat === 'scroll' ? 'scroll' : ''}`}>
      <table className="terminal-table">
        <thead>
          <tr>
            {columns.map((column, colIndex) => (
              <th key={colIndex} style={{ width: column.width ? `${column.width}px` : 'auto' }}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{row[column.accessor]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Benefits
- Ensures terminal interface works across all device sizes
- Maintains readability on smaller screens
- Adapts complex data visualizations appropriately
- Improves mobile usability without compromising desktop experience
- Prevents horizontal scrolling and text overflow issues

## Related Patterns
- **Terminal UI Component System**: Provides the base components that will be responsively displayed
- **CLI Command Registry**: Supplies commands and output for responsive display
- **Text Visualization Component System**: Provides data visualizations that must be responsive

## Usage Metrics
- Complexity: Medium
- Reusability: High
- Stories: US-000 (Project Setup with CLI-Focused Template)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-04-15 | Initial pattern | Extracted from HealthBench US-000 implementation | 