/**
 * Command Registry for HealthBench CLI
 * Based on the CLI Command Registry Pattern
 */

import { Command, CommandResponse, CommandOptions } from './types';

class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  /**
   * Register a new command
   */
  register(command: Command): void {
    if (this.commands.has(command.name)) {
      console.warn(`Command ${command.name} is already registered. It will be overwritten.`);
    }
    this.commands.set(command.name, command);
  }

  /**
   * Get a command by name
   */
  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  /**
   * Execute a command by name with arguments and options
   */
  async execute(name: string, args: Record<string, any> = {}, options: CommandOptions = {}): Promise<CommandResponse> {
    const command = this.commands.get(name);
    
    if (!command) {
      return {
        success: false,
        message: `Command not found: ${name}`,
        error: 'COMMAND_NOT_FOUND'
      };
    }

    try {
      // Ensure args._ exists for positional arguments
      if (!args._) {
        args._ = [];
      }

      // Validate required arguments
      if (command.args) {
        const missingArgs = command.args
          .filter(arg => arg.required && args[arg.name] === undefined)
          .map(arg => arg.name);

        if (missingArgs.length > 0) {
          return {
            success: false,
            message: `Missing required arguments: ${missingArgs.join(', ')}`,
            error: 'MISSING_REQUIRED_ARGS'
          };
        }

        // Apply default values for missing optional arguments
        command.args.forEach(arg => {
          if (!arg.required && args[arg.name] === undefined && arg.default !== undefined) {
            args[arg.name] = arg.default;
          }
        });
      }

      // Execute the command with options
      return await command.execute(args, options);
    } catch (error) {
      console.error(`Error executing command ${name}:`, error);
      return {
        success: false,
        message: `Failed to execute command: ${name}`,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * List all registered commands
   */
  listAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * List commands by category
   */
  listByCategory(category: string): Command[] {
    return this.listAll().filter(cmd => cmd.category === category);
  }

  /**
   * Get available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.listAll().forEach(cmd => categories.add(cmd.category || 'general'));
    return Array.from(categories);
  }
}

// Create and export singleton instance
const registry = new CommandRegistry();
export default registry; 