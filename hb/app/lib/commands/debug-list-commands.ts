import registry from './registry';

// Debug command: logs all registered commands at startup
console.log('[DEBUG] Registered commands:', Object.keys(registry.commands || registry));

export default function debugListCommands() {
  // No-op: just for build-time debug
} 