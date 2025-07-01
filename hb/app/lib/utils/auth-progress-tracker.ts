/**
 * Auth Progress Tracker
 * Provides terminal-style progress tracking for authentication operations
 */

export type AuthProgressStep = 'idle' | 'redirecting' | 'authenticating' | 'complete' | 'error';

export interface AuthProgressUpdate {
  step: AuthProgressStep;
  message: string;
  error?: Error;
}

export class AuthProgressTracker {
  private callback: (update: AuthProgressUpdate) => void;
  
  constructor(callback: (update: AuthProgressUpdate) => void) {
    this.callback = callback;
  }
  
  idle(): void {
    this.callback({
      step: 'idle',
      message: 'Ready for authentication',
    });
  }
  
  redirecting(): void {
    this.callback({
      step: 'redirecting',
      message: 'Redirecting to GitHub for authentication...',
    });
  }
  
  authenticating(): void {
    this.callback({
      step: 'authenticating',
      message: 'Authenticating with GitHub...',
    });
  }
  
  complete(username: string): void {
    this.callback({
      step: 'complete',
      message: `Successfully logged in as ${username}`,
    });
  }
  
  error(error: Error): void {
    this.callback({
      step: 'error',
      message: `Authentication error: ${error.message}`,
      error,
    });
  }
} 