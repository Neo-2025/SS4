/**
 * Command Registry Tests
 */

import { Command } from '../types';
import registry from '../registry';

describe('Command Registry', () => {
  // Reset registry before each test
  beforeEach(() => {
    // Clear existing commands
    registry.listAll().forEach(cmd => {
      // @ts-ignore: Accessing private method for testing
      registry['commands'].delete(cmd.name);
    });
  });

  test('registers a command', () => {
    const testCommand: Command = {
      name: 'test',
      description: 'Test command',
      usage: 'test',
      category: 'testing',
      execute: async () => {
        return {
          success: true,
          message: 'Test command executed',
        };
      },
    };

    registry.register(testCommand);
    expect(registry.get('test')).toBe(testCommand);
  });

  test('executes a command', async () => {
    const testCommand: Command = {
      name: 'test',
      description: 'Test command',
      usage: 'test',
      category: 'testing',
      execute: async () => {
        return {
          success: true,
          message: 'Test command executed',
          data: { value: 'test-data' }
        };
      },
    };

    registry.register(testCommand);
    const result = await registry.execute('test');
    expect(result.success).toBe(true);
    expect(result.message).toBe('Test command executed');
    expect(result.data.value).toBe('test-data');
  });

  test('returns error for unknown command', async () => {
    const result = await registry.execute('unknown-command');
    expect(result.success).toBe(false);
    expect(result.message).toContain('Command not found');
  });

  test('validates required arguments', async () => {
    const testCommand: Command = {
      name: 'test-args',
      description: 'Test command with args',
      usage: 'test-args <required-arg>',
      category: 'testing',
      args: [
        {
          name: 'requiredArg',
          type: 'string',
          description: 'Required argument',
          required: true
        }
      ],
      execute: async (args) => {
        return {
          success: true,
          message: `Got arg: ${args.requiredArg}`,
          data: { arg: args.requiredArg }
        };
      },
    };

    registry.register(testCommand);
    
    // Missing required arg
    const errorResult = await registry.execute('test-args');
    expect(errorResult.success).toBe(false);
    expect(errorResult.message).toContain('Missing required arguments');
    
    // With required arg
    const successResult = await registry.execute('test-args', { requiredArg: 'value' });
    expect(successResult.success).toBe(true);
    expect(successResult.message).toBe('Got arg: value');
  });

  test('applies default values for optional arguments', async () => {
    const testCommand: Command = {
      name: 'test-optional',
      description: 'Test command with optional args',
      usage: 'test-optional [--optional-arg]',
      category: 'testing',
      args: [
        {
          name: 'optionalArg',
          type: 'string',
          description: 'Optional argument',
          required: false,
          default: 'default-value'
        }
      ],
      execute: async (args) => {
        return {
          success: true,
          message: `Got arg: ${args.optionalArg}`,
          data: { arg: args.optionalArg }
        };
      },
    };

    registry.register(testCommand);
    
    // Without optional arg (should use default)
    const defaultResult = await registry.execute('test-optional');
    expect(defaultResult.success).toBe(true);
    expect(defaultResult.message).toBe('Got arg: default-value');
    
    // With explicit value
    const explicitResult = await registry.execute('test-optional', { optionalArg: 'custom-value' });
    expect(explicitResult.success).toBe(true);
    expect(explicitResult.message).toBe('Got arg: custom-value');
  });

  test('lists commands by category', () => {
    const testCmd1: Command = {
      name: 'test1',
      description: 'Test command 1',
      usage: 'test1',
      category: 'category1',
      execute: async () => ({ success: true, message: 'test1' }),
    };
    
    const testCmd2: Command = {
      name: 'test2',
      description: 'Test command 2',
      usage: 'test2',
      category: 'category1',
      execute: async () => ({ success: true, message: 'test2' }),
    };
    
    const testCmd3: Command = {
      name: 'test3',
      description: 'Test command 3',
      usage: 'test3',
      category: 'category2',
      execute: async () => ({ success: true, message: 'test3' }),
    };
    
    registry.register(testCmd1);
    registry.register(testCmd2);
    registry.register(testCmd3);
    
    const cat1Commands = registry.listByCategory('category1');
    expect(cat1Commands.length).toBe(2);
    expect(cat1Commands).toContain(testCmd1);
    expect(cat1Commands).toContain(testCmd2);
    
    const cat2Commands = registry.listByCategory('category2');
    expect(cat2Commands.length).toBe(1);
    expect(cat2Commands).toContain(testCmd3);
  });

  test('gets all categories', () => {
    const testCmd1: Command = {
      name: 'test1',
      description: 'Test command 1',
      usage: 'test1',
      category: 'category1',
      execute: async () => ({ success: true, message: 'test1' }),
    };
    
    const testCmd2: Command = {
      name: 'test2',
      description: 'Test command 2',
      usage: 'test2',
      category: 'category2',
      execute: async () => ({ success: true, message: 'test2' }),
    };
    
    registry.register(testCmd1);
    registry.register(testCmd2);
    
    const categories = registry.getCategories();
    expect(categories.length).toBe(2);
    expect(categories).toContain('category1');
    expect(categories).toContain('category2');
  });
}); 