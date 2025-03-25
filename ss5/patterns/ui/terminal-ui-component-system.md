# Terminal UI Component System

## Status: Validated

## Classification: UI

## Problem
Building terminal-like interfaces in web applications requires consistent styling, behavior, and component structure to create an authentic and usable command-line experience.

## Context
This pattern should be applied when creating:
- CLI-style web interfaces
- Terminal emulators in browser environments
- Command-driven applications
- Developer tools with terminal-like interaction

## Solution
Create a component system that emulates terminal behavior with:

1. **Core Terminal Components**:
   - Terminal container with proper styling
   - Command input with history navigation
   - Command output display
   - Prompt indicators

2. **Terminal Styling**:
   - Dark-themed color scheme
   - Monospace typography
   - Cursor animations
   - Appropriate spacing and padding

3. **Interactive Behaviors**:
   - Command history navigation (up/down arrows)
   - Command completion
   - Scrollable output
   - Copy/paste support

## Implementation Example
```tsx
// Terminal container component
interface TerminalProps {
  children: React.ReactNode;
  theme?: 'dark' | 'light';
  fullscreen?: boolean;
}

export function Terminal({ 
  children, 
  theme = 'dark', 
  fullscreen = false 
}: TerminalProps) {
  return (
    <div 
      className={`terminal ${theme} ${fullscreen ? 'fullscreen' : ''}`}
      style={{
        backgroundColor: 'var(--terminal-bg)',
        color: 'var(--terminal-text)',
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        borderRadius: '0.5rem',
        padding: '1rem',
        overflow: 'auto',
        height: fullscreen ? '100vh' : '500px',
        width: fullscreen ? '100vw' : '100%',
      }}
    >
      {children}
    </div>
  );
}

// Command input component
interface CommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CommandInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'Type a command...',
  disabled = false
}: CommandInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value);
      onChange('');
      e.preventDefault();
    }
  };
  
  return (
    <div className="terminal-input-wrapper">
      <span className="terminal-prompt">{'>'}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="terminal-input"
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'inherit',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          outline: 'none',
          width: 'calc(100% - 1.5rem)',
          marginLeft: '0.5rem',
          padding: '0.25rem 0',
        }}
        spellCheck={false}
        autoFocus
      />
    </div>
  );
}

// Command output display
interface CommandOutputProps {
  output: Array<{
    id: string;
    command?: string;
    content: React.ReactNode;
    type?: 'success' | 'error' | 'info';
  }>;
}

export function CommandOutput({ output }: CommandOutputProps) {
  return (
    <div className="terminal-output">
      {output.map((item) => (
        <div key={item.id} className={`terminal-line ${item.type || ''}`}>
          {item.command && (
            <div className="terminal-command">
              <span className="terminal-prompt">{'>'}</span>
              <span className="terminal-command-text">{item.command}</span>
            </div>
          )}
          <div className="terminal-content">
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Benefits
- Creates a consistent terminal-like user experience
- Provides reusable components that can be composed for different CLI interfaces
- Supports natural CLI behaviors like command history
- Creates an authentic developer-focused aesthetic
- Improves usability through familiar terminal interaction patterns

## Related Patterns
- **CLI Command Registry**: Provides command handling backend for the terminal UI
- **Responsive Terminal Display**: Ensures the terminal works across device sizes
- **Terminal Stylesheet System**: Provides consistent styling for terminal components

## Usage Metrics
- Complexity: Medium
- Reusability: High
- Stories: US-000 (Project Setup with CLI-Focused Template)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-04-15 | Initial pattern | Extracted from HealthBench US-000 implementation | 