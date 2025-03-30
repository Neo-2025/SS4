---
status: Validated
classification: cli
---

# CLI-COMMAND-PATTERN

## Status

**Current Status**: Validated
**Last Updated**: [Current Date]
**Qualification Metrics**:
- Implementations: 3
- Projects: 1
- Related Patterns: 4

## Classification

CLI Pattern

## Problem

CLI-based applications need a structured way to handle commands with consistent parsing, validation, execution, and error handling. Without a standardized approach, command implementations can become inconsistent, error-prone, and difficult to extend or maintain. Additionally, help text and command documentation can become disconnected from the implementation.

## Solution

The CLI Command Pattern provides a structured approach for implementing CLI commands with consistent parsing, validation, and execution. Each command is encapsulated as an object with standardized interfaces for validation, execution, and help text generation, making it easy to add new commands while ensuring consistent behavior.

### Core Components

1. **Command Objects**: Individual classes/objects representing specific commands
2. **Command Registry**: Central registry for registering and retrieving commands
3. **Argument Parser**: Consistent parsing of command arguments
4. **Validation Rules**: Validation logic for command arguments
5. **Result Formatter**: Consistent formatting of command results

### Key Features

1. **Standardized Interfaces**: All commands follow the same interface
2. **Self-Validation**: Commands include their own validation logic
3. **Help Text Integration**: Documentation is embedded within command objects
4. **Consistent Error Handling**: Standardized approach to handling invalid input
5. **Command Discovery**: Easy to list and explore available commands

## Implementation Example

### Command Interface

```typescript
/**
 * Command result interface
 */
interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Base command interface
 */
interface Command {
  execute(args: string[]): Promise<CommandResult>;
  validate(args: string[]): boolean;
  getUsage(): string;
  getDescription(): string;
}
```

### Agency Command Implementation

```typescript
/**
 * Agency commands for CLI
 */
export class AgencyCommands {
  private agencyService: AgencyManagementService;
  
  constructor(agencyService: AgencyManagementService) {
    this.agencyService = agencyService;
  }
  
  /**
   * Add agency command: >add CCN [ccn1], [ccn2], ...
   * @param args Command arguments
   */
  async addAgency(args: string[]): Promise<CommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Invalid usage. Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Check if first argument is "CCN"
    if (args[0].toLowerCase() !== 'ccn') {
      return {
        success: false,
        message: 'Invalid usage. Command must start with "CCN". Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Parse CCNs (args[1] might be a comma-separated list)
    const ccnInput = args.slice(1).join(' ');
    const ccnList = ccnInput.split(',').map(ccn => ccn.trim()).filter(ccn => ccn !== '');
    
    if (ccnList.length === 0) {
      return {
        success: false,
        message: 'No CCNs provided. Correct syntax: >add CCN [ccn1], [ccn2], ...'
      };
    }
    
    // Add each CCN
    const results = [];
    for (const ccn of ccnList) {
      try {
        const agencyData = await this.agencyService.addAgency(
          ccn,
          async (ccnToFetch) => {
            // API call implementation
            return { /* agency data */ };
          }
        );
        
        results.push({ ccn, success: true, name: agencyData.name });
      } catch (error) {
        results.push({ ccn, success: false, error: (error as Error).message });
      }
    }
    
    // Format result message
    const successCount = results.filter(r => r.success).length;
    const resultMessages = results.map(r => {
      if (r.success) {
        return `HealthBench: Found "${r.name}" (CCN: ${r.ccn}) - Added`;
      } else {
        return `HealthBench: Failed to add CCN ${r.ccn} - ${r.error}`;
      }
    });
    
    return {
      success: successCount > 0,
      message: [
        `HealthBench: Adding agencies with CCNs: ${ccnList.join(', ')}`,
        ...resultMessages,
        `HealthBench: ${successCount} ${successCount === 1 ? 'agency' : 'agencies'} added successfully`
      ].join('\n'),
      data: results
    };
  }
  
  /**
   * Group agency command: >group-as [type] [ccn1], [ccn2], ...
   * @param args Command arguments
   */
  async groupAgency(args: string[]): Promise<CommandResult> {
    // Implementation details
    // ...
  }
  
  /**
   * List agencies command: >list agencies
   */
  listAgencies(): CommandResult {
    // Implementation details
    // ...
  }
}
```

### Command Registry Implementation

```typescript
/**
 * Command registry for managing CLI commands
 */
export class CommandRegistry {
  private commands: Map<string, Command> = new Map();
  
  /**
   * Register a command
   * @param name Command name
   * @param command Command implementation
   */
  register(name: string, command: Command): void {
    this.commands.set(name.toLowerCase(), command);
  }
  
  /**
   * Get a command by name
   * @param name Command name
   */
  get(name: string): Command | undefined {
    return this.commands.get(name.toLowerCase());
  }
  
  /**
   * List all available commands
   */
  listCommands(): { name: string; description: string }[] {
    return Array.from(this.commands.entries()).map(([name, command]) => ({
      name,
      description: command.getDescription()
    }));
  }
  
  /**
   * Execute a command with arguments
   * @param input Full command input string
   */
  async execute(input: string): Promise<CommandResult> {
    const [commandName, ...args] = input.trim().split(/\s+/);
    
    if (!commandName) {
      return {
        success: false,
        message: 'No command provided. Type >help to see available commands.'
      };
    }
    
    const command = this.get(commandName.replace(/^>/, ''));
    
    if (!command) {
      return {
        success: false,
        message: `Unknown command: ${commandName}. Type >help to see available commands.`
      };
    }
    
    if (!command.validate(args)) {
      return {
        success: false,
        message: `Invalid usage. Correct syntax: ${command.getUsage()}`
      };
    }
    
    return command.execute(args);
  }
}
```

## Benefits

1. **Consistency**: All commands follow the same structure and conventions
2. **Encapsulation**: Each command encapsulates its own logic and validation
3. **Extensibility**: Easy to add new commands without changing existing code
4. **Self-Documentation**: Commands include their own documentation
5. **Modularity**: Commands can be grouped by domain or functionality
6. **Testability**: Each command can be tested in isolation
7. **Discoverability**: Easy to generate help text and command listings

## Limitations

1. **Initial Setup Complexity**: Requires more upfront design than ad-hoc approaches
2. **Verbosity**: Can be more verbose than simple function-based commands
3. **Learning Curve**: Developers need to understand the pattern before adding commands
4. **Performance Overhead**: Minor overhead from additional abstraction layers
5. **State Management**: May require additional mechanisms for shared state

## Related Patterns

- **TEXT-TABLE-FORMATTING**: Often used for formatting command output
- **TERMINAL-PROGRESS-TRACKER**: Used for visualizing progress during command execution
- **MULTI-ENTITY-GROUPING**: Commands often operate on grouped entities
- **AGENCY-IMPORT-WORKFLOW**: Workflow patterns can be wrapped as commands

## Usage Examples

### Help Command Implementation

```typescript
export class HelpCommand implements Command {
  constructor(private commandRegistry: CommandRegistry) {}
  
  execute(args: string[]): Promise<CommandResult> {
    const commands = this.commandRegistry.listCommands();
    
    // If a specific command is requested
    if (args.length > 0) {
      const commandName = args[0];
      const command = this.commandRegistry.get(commandName);
      
      if (!command) {
        return Promise.resolve({
          success: false,
          message: `Unknown command: ${commandName}`
        });
      }
      
      return Promise.resolve({
        success: true,
        message: [
          `Command: ${commandName}`,
          `Usage: ${command.getUsage()}`,
          `Description: ${command.getDescription()}`
        ].join('\n')
      });
    }
    
    // Otherwise list all commands
    const commandList = commands.map(c => `  ${c.name.padEnd(15)} - ${c.description}`);
    
    return Promise.resolve({
      success: true,
      message: [
        'Available commands:',
        ...commandList,
        '',
        'Type >help [command] for more information about a specific command.'
      ].join('\n')
    });
  }
  
  validate(args: string[]): boolean {
    return true; // Help command accepts any arguments
  }
  
  getUsage(): string {
    return '>help [command]';
  }
  
  getDescription(): string {
    return 'Show help information for available commands';
  }
}
```

### Command Registration

```typescript
// Initialize command registry
const commandRegistry = new CommandRegistry();

// Initialize services
const agencyService = new AgencyManagementService(resilientApiGateway);
const agencyCommands = new AgencyCommands(agencyService);

// Register commands
commandRegistry.register('add', {
  execute: args => agencyCommands.addAgency(args),
  validate: args => args.length >= 1 && args[0].toLowerCase() === 'ccn',
  getUsage: () => '>add CCN [ccn1], [ccn2], ...',
  getDescription: () => 'Add one or more agencies by CCN'
});

commandRegistry.register('group-as', {
  execute: args => agencyCommands.groupAgency(args),
  validate: args => args.length >= 2 && ['Org', 'Comp', 'Target'].includes(args[0]),
  getUsage: () => '>group-as [type] [ccn1], [ccn2], ...',
  getDescription: () => 'Group agencies as Org/Comp/Target'
});

commandRegistry.register('list', {
  execute: args => {
    if (args[0]?.toLowerCase() === 'agencies') {
      return agencyCommands.listAgencies();
    }
    return Promise.resolve({
      success: false,
      message: 'Invalid list command. Try >list agencies'
    });
  },
  validate: args => args.length >= 1 && args[0].toLowerCase() === 'agencies',
  getUsage: () => '>list agencies',
  getDescription: () => 'List all agencies in the system'
});
```

## Evolution History

- **v1.0**: Basic command implementation with validation
- **v1.1**: Added command registry for centralized command management
- **v1.2**: Enhanced with standardized result formatting
- **v1.3**: Added self-documentation capabilities 