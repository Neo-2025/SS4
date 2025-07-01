'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Terminal.module.css'; // We'll create this next

// Import command registry
import commandRegistry from '../../lib/commands';
import { CommandResponse } from '../../lib/commands/types';
import { supabase } from '../../lib/utils/supabase';
import { commandHistoryService } from '../../lib/db/supabase-service';

interface TerminalWidget {
  type: 'dropdown' | 'button' | 'text';
  id: string;
  label: string;
  options?: string[];
  value?: string;
  action?: () => void;
}

const Terminal: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [outputLines, setOutputLines] = useState<Array<{type: string, content: string}>>([
    { type: 'system', content: 'SmartMarkets.ai CLI v2.0.0' },
    { type: 'system', content: 'Hospital M&A Territorial Intelligence - Type "help" for commands' },
  ]);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [widgets, setWidgets] = useState<TerminalWidget[]>([]);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Scroll to the bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputLines]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Handle magic link callback
    const handleMagicLinkCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.get('auth') === 'success') {
        // Magic link was clicked, check session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && !error) {
          setOutputLines(prev => [...prev, {
            type: 'success',
            content: `✅ Successfully authenticated as ${session.user.email}`
          }]);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    
    // Check authentication status on mount
    const checkAuthStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    handleMagicLinkCallback();
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session) {
        setOutputLines(prev => [...prev, {
          type: 'success',
          content: `🔐 Authenticated as ${session.user.email}`
        }]);
      } else if (event === 'SIGNED_OUT') {
        setOutputLines(prev => [...prev, {
          type: 'system',
          content: '👋 Logged out successfully'
        }]);
      }
    });
    
    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getCommandSuggestions = (input: string): string[] => {
    const allCommands = commandRegistry.listAll();
    const inputParts = input.split(' ');
    const currentWord = inputParts[inputParts.length - 1];
    
    if (inputParts.length === 1) {
      // Suggest commands
      return allCommands
        .map(cmd => cmd.name)
        .filter(cmd => cmd.startsWith(currentWord));
    } else {
      // Suggest arguments based on the command
      const command = allCommands.find(cmd => cmd.name === inputParts[0]);
      if (command && command.suggestions) {
        return command.suggestions(currentWord);
      }
    }
    return [];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Update suggestions
    const newSuggestions = getCommandSuggestions(value);
    setSuggestions(newSuggestions);
    setSelectedSuggestion(-1);
  };

  const parseCommand = (commandString: string): { command: string, args: Record<string, any> } => {
    const parts = commandString.trim().split(' ');
    const command = parts[0];
    const args: Record<string, any> = { _: [] };
    
    // Parse args in the format --arg=value or --flag
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const argParts = part.substring(2).split('=');
        if (argParts.length === 1) {
          // It's a flag (boolean)
          args[argParts[0]] = true;
        } else {
          // It's a key-value arg
          args[argParts[0]] = argParts[1];
        }
      } else if (!part.startsWith('-')) {
        // Positional argument
        args[`arg${i}`] = part;
        // Also add to the array of positional arguments
        args._.push(part);
      }
    }
    
    return { command, args };
  };

  const executeCommand = async (commandString: string) => {
    // Add command to output
    const trimmedCommand = commandString.trim();
    if (!trimmedCommand) return;
    
    setOutputLines([...outputLines, { type: 'command', content: `$ ${trimmedCommand}` }]);
    
    // Add to history
    setCommandHistory([...commandHistory, trimmedCommand]);
    setHistoryIndex(-1);
    
    // Parse and execute
    const { command, args } = parseCommand(trimmedCommand);
    
    try {
      // Special built-in commands
      if (command === 'clear') {
        setOutputLines([]);
        return;
      }
      
      if (command === 'help') {
        displayHelp();
        return;
      }
      
      // Create progress callback for commands
      const handleProgress = (update: any) => {
        setOutputLines(prev => [...prev, { 
          type: update.step === 'error' ? 'error' : 'system', 
          content: update.message 
        }]);
      };
      
      // Execute with command registry
      const result = await commandRegistry.execute(command, args, { onProgress: handleProgress });
      
      // Record command history in Supabase if user is authenticated
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await commandHistoryService.add({
            user_id: user.id,
            command: trimmedCommand,
            args,
            success: result.success
          });
        }
      } catch (error) {
        console.error('Error recording command history:', error);
        // Continue execution even if history recording fails
      }
      
      // Handle special command responses
      if (result.success && result.data && result.data.action === 'clear') {
        setOutputLines([]);
        return;
      }
      
      displayCommandResult(result);
    } catch (error) {
      setOutputLines([
        ...outputLines, 
        { type: 'error', content: `Error: ${error instanceof Error ? error.message : String(error)}` }
      ]);
    }
    
    // Clear input
    setInput('');
  };

  const displayCommandResult = (result: CommandResponse) => {
    const newLines = [];
    
    // Add message line
    newLines.push({
      type: result.success ? 'success' : 'error',
      content: result.message
    });
    
    // If there's data, add it formatted as JSON
    if (result.data) {
      newLines.push({
        type: 'data',
        content: JSON.stringify(result.data, null, 2)
      });
    }
    
    setOutputLines([...outputLines, ...newLines]);
  };

  const displayHelp = () => {
    const categories = commandRegistry.getCategories();
    const helpLines = [
      { type: 'system', content: 'Available Commands:' },
    ];
    
    categories.forEach(category => {
      helpLines.push({ type: 'system', content: `\n${category.toUpperCase()}:` });
      const commands = commandRegistry.listByCategory(category);
      
      commands.forEach(cmd => {
        helpLines.push({ 
          type: 'system', 
          content: `  ${cmd.name.padEnd(12)} - ${cmd.description}`
        });
      });
    });
    
    // Add built-in commands
    helpLines.push({ type: 'system', content: '\nBUILT-IN:' });
    helpLines.push({ type: 'system', content: '  clear        - Clear the terminal output' });
    helpLines.push({ type: 'system', content: '  help         - Display this help message' });
    
    setOutputLines([...outputLines, ...helpLines]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (selectedSuggestion >= 0 && suggestions.length > 0) {
        // Complete with selected suggestion
        const inputParts = input.split(' ');
        inputParts[inputParts.length - 1] = suggestions[selectedSuggestion];
        setInput(inputParts.join(' '));
        setSuggestions([]);
        setSelectedSuggestion(-1);
      } else {
        executeCommand(input);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        if (selectedSuggestion < suggestions.length - 1) {
          setSelectedSuggestion(prev => prev + 1);
        } else {
          setSelectedSuggestion(0);
        }
      }
    } else if (e.key === 'ArrowUp') {
      // Navigate command history
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      // Navigate command history
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      e.preventDefault();
      e.clipboardData.setData('text/plain', selection.toString());
    }
  };

  // Add this function to handle widget interactions
  const handleWidgetAction = (widget: TerminalWidget) => {
    if (widget.type === 'dropdown' && widget.options) {
      setActiveWidget(widget.id);
    } else if (widget.action) {
      widget.action();
    }
  };

  const handleLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleLoginFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      
      if (error) throw error;
      
      setShowLoginForm(false);
      setOutputLines(prev => [...prev, {
        type: 'success',
        content: 'Successfully logged in!'
      }]);
    } catch (error) {
      setOutputLines(prev => [...prev, {
        type: 'error',
        content: `Login error: ${error instanceof Error ? error.message : String(error)}`
      }]);
    }
  };

  const handleCLILogin = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setOutputLines(prev => [...prev, {
        type: 'success',
        content: 'Successfully logged in!'
      }]);
    } catch (error) {
      setOutputLines(prev => [...prev, {
        type: 'error',
        content: `Login error: ${error instanceof Error ? error.message : String(error)}`
      }]);
    }
  };

  // Commands are now registered via the command files in /lib/commands/

  return (
    <div className={styles.terminal} onClick={handleClick}>
      <div className={styles.header}>
        <div className={styles.title}>SmartMarkets.ai Terminal</div>
        <div className={styles.buttons}>
          <span className={styles.button}></span>
          <span className={styles.button}></span>
          <span className={styles.button}></span>
        </div>
      </div>
      
      <div className={styles.content}>
        <div 
          className={styles.output} 
          ref={outputRef}
          onCopy={handleCopy}
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'c') {
              handleCopy(e as unknown as React.ClipboardEvent);
            }
          }}
        >
          {outputLines.map((line, index) => (
            <div 
              key={index} 
              className={`${styles.line} ${styles[line.type]}`}
              style={{ userSelect: 'text', cursor: 'text' }}
            >
              {line.content}
            </div>
          ))}
          
          {/* Login form */}
          {showLoginForm && (
            <div className={styles.loginForm}>
              <form onSubmit={handleLoginFormSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginFormChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password:</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginFormChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.formButton}>
                    Login
                  </button>
                  <button
                    type="button"
                    className={styles.formButton}
                    onClick={() => setShowLoginForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Widgets container */}
          {widgets.length > 0 && (
            <div className={styles.widgets}>
              {widgets.map(widget => (
                <div key={widget.id} className={styles.widget}>
                  {widget.type === 'dropdown' && widget.options ? (
                    <div className={styles.dropdown}>
                      <button
                        className={styles.dropdownButton}
                        onClick={() => handleWidgetAction(widget)}
                      >
                        {widget.label}: {widget.value || 'Select...'}
                      </button>
                      {activeWidget === widget.id && (
                        <div className={styles.dropdownContent}>
                          {widget.options.map(option => (
                            <div
                              key={option}
                              className={styles.dropdownItem}
                              onClick={() => {
                                setWidgets(prev => prev.map(w => 
                                  w.id === widget.id ? { ...w, value: option } : w
                                ));
                                setActiveWidget(null);
                              }}
                            >
                              {option}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      className={styles.widgetButton}
                      onClick={() => handleWidgetAction(widget)}
                    >
                      {widget.label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.inputLine}>
          <span className={styles.prompt}>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={styles.input}
            autoFocus
            spellCheck="false"
          />
        </div>
        
        {suggestions.length > 0 && (
          <div className={styles.suggestions} ref={suggestionsRef}>
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`${styles.suggestion} ${index === selectedSuggestion ? styles.selected : ''}`}
                onClick={() => {
                  const inputParts = input.split(' ');
                  inputParts[inputParts.length - 1] = suggestion;
                  setInput(inputParts.join(' '));
                  setSuggestions([]);
                  setSelectedSuggestion(-1);
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.statusBar}>
        <div className={styles.status}>Ready</div>
        <div className={styles.authStatus}>
          {authLoading ? (
            <span className={styles.loading}>Checking auth...</span>
          ) : user ? (
            <span className={styles.authenticated}>● Logged in as {user.email}</span>
          ) : (
            <span className={styles.unauthenticated}>○ Not logged in</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Update the formatLineContent function to handle more formats
const formatLineContent = (content: string): string => {
  // Convert ANSI color codes to HTML
  const ansiToHtml = (text: string): string => {
    return text
      .replace(/\x1b\[31m/g, '<span style="color: #ff0000">')
      .replace(/\x1b\[32m/g, '<span style="color: #00ff00">')
      .replace(/\x1b\[33m/g, '<span style="color: #ffff00">')
      .replace(/\x1b\[34m/g, '<span style="color: #0000ff">')
      .replace(/\x1b\[0m/g, '</span>');
  };

  // Convert ASCII art and Unicode
  const processSpecialChars = (text: string): string => {
    return text
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
      .replace(/\\x1b\[([0-9;]+)m/g, (_, code) => `<span class="ansi-${code}">`);
  };

  // Process emojis
  const processEmojis = (text: string): string => {
    return text.replace(/:([a-z0-9_]+):/g, (_, emoji) => {
      const emojiMap: Record<string, string> = {
        'check': '✓',
        'cross': '✗',
        'info': 'ℹ️',
        'warning': '⚠️',
        'error': '❌',
        'success': '✅'
      };
      return emojiMap[emoji] || `:${emoji}:`;
    });
  };

  return processEmojis(processSpecialChars(ansiToHtml(content)));
};

export default Terminal; 