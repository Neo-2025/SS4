/**
 * Help Command
 * Provides help information for available commands
 */

import { Command } from '../types';
import registry from '../registry';

const helpCommand: Command = {
  name: 'help',
  description: 'Display help information for available commands',
  usage: 'help [command]',
  category: 'system',
  args: [
    {
      name: 'command',
      type: 'string',
      description: 'Specific command to get help for',
      required: false
    }
  ],
  execute: async (args) => {
    const specificCommand = args.command as string | undefined;
    
    // If a specific command is requested, show detailed help for it
    if (specificCommand) {
      return getSpecificCommandHelp(specificCommand);
    }
    
    // Otherwise, show general help with all commands by category
    return getGeneralHelp();
  }
};

const getSpecificCommandHelp = (commandName: string): Promise<any> => {
  const command = registry.get(commandName);
  
  if (!command) {
    return Promise.resolve({
      success: false,
      message: `Unknown command: ${commandName}`,
      error: 'COMMAND_NOT_FOUND'
    });
  }
  
  // Format detailed help for the specific command
  const helpText = [
    `Command: ${command.name}`,
    `Description: ${command.description}`,
    `Usage: ${command.usage}`,
    `Category: ${command.category}`
  ];
  
  // Add arguments if any
  if (command.args && command.args.length > 0) {
    helpText.push('\nArguments:');
    command.args.forEach(arg => {
      const required = arg.required ? '(Required)' : '(Optional)';
      const defaultValue = arg.default !== undefined ? ` Default: ${arg.default}` : '';
      helpText.push(`  ${arg.name} - ${arg.description} ${required}${defaultValue}`);
    });
  }
  
  // Add examples if available (hardcoded for now, could be part of Command interface)
  const examples = getExamplesForCommand(command.name);
  if (examples.length > 0) {
    helpText.push('\nExamples:');
    examples.forEach(example => {
      helpText.push(`  ${example}`);
    });
  }
  
  return Promise.resolve({
    success: true,
    message: helpText.join('\n'),
    data: { command }
  });
};

const getGeneralHelp = (): Promise<any> => {
  const categories = registry.getCategories();
  const helpLines = ['Available Commands:'];
  
  // Sort categories with "system" first
  const sortedCategories = categories.sort((a, b) => {
    if (a === 'system') return -1;
    if (b === 'system') return 1;
    return a.localeCompare(b);
  });
  
  // Add commands by category
  sortedCategories.forEach(category => {
    helpLines.push(`\n${category.toUpperCase()}:`);
    const commands = registry.listByCategory(category);
    
    // Sort commands alphabetically within each category
    commands.sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
      helpLines.push(`  ${cmd.name.padEnd(12)} - ${cmd.description}`);
    });
  });
  
  // Add usage tip
  helpLines.push('\nTip: Type "help [command]" for detailed information about a specific command.');
  
  return Promise.resolve({
    success: true,
    message: helpLines.join('\n'),
    data: { categories, commandCount: registry.listAll().length }
  });
};

// Helper function to get examples for specific commands
const getExamplesForCommand = (commandName: string): string[] => {
  const exampleMap: Record<string, string[]> = {
    help: [
      'help',
      'help version',
      'help login'
    ],
    version: [
      'version'
    ],
    health: [
      'health',
      'health --verbose'
    ],
    clear: [
      'clear'
    ],
    login: [
      'login',
      'login user@example.com'
    ]
  };
  
  return exampleMap[commandName] || [];
};

// Register the command
registry.register(helpCommand);

export default helpCommand; 