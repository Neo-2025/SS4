# CLI Command Registry

## Status: Core

## Classification: UI

## Problem
Ad-hoc command handling creates inconsistent command behavior, leading to poor user experience and maintenance challenges in CLI-style interfaces.

## Context
This pattern should be applied when building terminal-like interfaces that require:
- Command parsing and execution
- Consistent command handling and validation
- Extensible command system
- Standardized response formatting

## Solution
Implement a centralized registry for terminal commands with validation and execution:

1. Define a command interface with name, description, usage, and execution methods
2. Create a command registry that manages command registration and lookup
3. Implement validation for command syntax and parameters
4. Return standardized response format from all commands
5. Provide helper utilities for common command operations

## Implementation Example
```typescript
// Command interface
interface Command {
  name: string;
  description: string;
  usage: string;
  execute(args: string[]): Promise<CommandResult>;
  validate(args: string[]): boolean;
}

// CommandResult type for standardized responses
interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

// Command registry
class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  
  register(command: Command): void {
    this.commands.set(command.name, command);
  }
  
  get(commandName: string): Command | undefined {
    return this.commands.get(commandName);
  }
  
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }
  
  async execute(input: string): Promise<CommandResult> {
    const [commandName, ...args] = input.trim().split(/\s+/);
    
    if (!commandName) {
      return { success: false, message: 'No command provided' };
    }
    
    const command = this.commands.get(commandName.replace(/^>/, ''));
    
    if (!command) {
      return { 
        success: false, 
        message: `Unknown command: ${commandName}. Type 'help' to see available commands.` 
      };
    }
    
    if (!command.validate(args)) {
      return { success: false, message: `Invalid usage: ${command.usage}` };
    }
    
    return command.execute(args);
  }
}

// Example help command implementation
class HelpCommand implements Command {
  constructor(private registry: CommandRegistry) {}
  
  name = 'help';
  description = 'Display help information for available commands';
  usage = 'help [command]';
  
  validate(args: string[]): boolean {
    return args.length <= 1;
  }
  
  async execute(args: string[]): Promise<CommandResult> {
    if (args.length === 0) {
      // List all commands
      const commands = this.registry.getAll();
      const commandList = commands
        .map(cmd => `${cmd.name} - ${cmd.description}`)
        .join('\n');
      
      return {
        success: true,
        message: 'Available commands:\n' + commandList
      };
    }
    
    // Show help for specific command
    const command = this.registry.get(args[0]);
    if (!command) {
      return {
        success: false,
        message: `Unknown command: ${args[0]}`
      };
    }
    
    return {
      success: true,
      message: `${command.name} - ${command.description}\nUsage: ${command.usage}`
    };
  }
}
```

## Benefits
- Provides a consistent approach to command handling
- Enables easy extension with new commands
- Standardizes command validation and error handling
- Simplifies command discovery through help functionality
- Improves maintainability by encapsulating command logic

## Related Patterns
- **Terminal UI Component System**: Provides the visual elements for the CLI
- **Responsive Terminal Display**: Ensures commands display correctly at different sizes
- **Environment Configuration Pattern**: Configures command behavior per environment

## Usage Metrics
- Complexity: Medium
- Reusability: High
- Stories: US-000 (Project Setup with CLI-Focused Template), US-002 (CLI Command Parser)

## Version History
| Version | Date | Description | Notes |
|---------|------|-------------|-------|
| 1.0 | 2023-04-15 | Initial pattern | Extracted from HealthBench US-000 implementation | 