/**
 * Authentication Commands Tests
 * Tests for login, logout, and account commands
 */

import loginCommand from '../auth/login';
import logoutCommand from '../auth/logout';
import accountCommand from '../auth/account';

// Mock Supabase
jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn()
    }
  },
  isSupabaseConfigured: jest.fn()
}));

// Mock user session service
jest.mock('../../db/supabase-service', () => ({
  userSessionService: {
    endAllForUser: jest.fn(),
    getActive: jest.fn()
  },
  commandHistoryService: {
    add: jest.fn()
  }
}));

// Import mocks after they've been set up
import { supabase, isSupabaseConfigured } from '../../utils/supabase';
import { userSessionService } from '../../db/supabase-service';

describe('Authentication Commands', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Login Command', () => {
    it('should fail if Supabase is not configured', async () => {
      // Mock isSupabaseConfigured to return false
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);
      
      const result = await loginCommand.execute({});
      
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Authentication is not properly configured');
      expect(result.error).toBe('CONFIG_ERROR');
    });
    
    it('should initiate GitHub OAuth flow when configured', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock signInWithOAuth to return success
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://github.com/login/oauth/authorize?client_id=123' },
        error: null
      });
      
      const result = await loginCommand.execute({});
      
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Redirecting to GitHub');
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback')
        })
      });
    });
    
    it('should handle OAuth initiation errors', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock signInWithOAuth to return an error
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider error' }
      });
      
      const result = await loginCommand.execute({});
      
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('GitHub authentication failed');
      expect(result.error).toContain('OAuth provider error');
    });
  });
  
  describe('Logout Command', () => {
    it('should fail if Supabase is not configured', async () => {
      // Mock isSupabaseConfigured to return false
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);
      
      const result = await logoutCommand.execute({});
      
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Authentication is not properly configured');
      expect(result.error).toBe('CONFIG_ERROR');
    });
    
    it('should sign out the user when authenticated', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock getUser to return a user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null
      });
      
      // Mock signOut to return success
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null
      });
      
      // Mock endAllForUser to return success
      (userSessionService.endAllForUser as jest.Mock).mockResolvedValue(true);
      
      const result = await logoutCommand.execute({});
      
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('successfully logged out');
      expect(userSessionService.endAllForUser).toHaveBeenCalledWith('user-123');
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
    
    it('should handle the case when no user is logged in', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock getUser to return no user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });
      
      const result = await logoutCommand.execute({});
      
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('No active session found');
      expect(supabase.auth.signOut).not.toHaveBeenCalled();
    });
  });
  
  describe('Account Command', () => {
    it('should fail if Supabase is not configured', async () => {
      // Mock isSupabaseConfigured to return false
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);
      
      const result = await accountCommand.execute({});
      
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Authentication is not properly configured');
      expect(result.error).toBe('CONFIG_ERROR');
    });
    
    it('should return user account information when authenticated', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock getUser to return a user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { 
          user: { 
            id: 'user-123', 
            email: 'test@example.com',
            email_confirmed_at: '2023-01-01T00:00:00Z',
            last_sign_in_at: '2023-01-02T00:00:00Z',
            created_at: '2022-12-01T00:00:00Z'
          } 
        },
        error: null
      });
      
      // Mock getActive to return a session
      (userSessionService.getActive as jest.Mock).mockResolvedValue({
        id: 'session-123',
        user_id: 'user-123',
        started_at: '2023-01-02T00:00:00Z',
        last_active_at: '2023-01-02T01:00:00Z',
        is_active: true,
        client_info: { browser: 'Chrome', os: 'Windows' }
      });
      
      const result = await accountCommand.execute({});
      
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Account information for test@example.com');
      expect(result.data).toEqual({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailConfirmed: true,
          lastSignIn: '2023-01-02T00:00:00Z',
          createdAt: '2022-12-01T00:00:00Z'
        },
        session: {
          started: '2023-01-02T00:00:00Z',
          lastActive: '2023-01-02T01:00:00Z'
        }
      });
    });
    
    it('should handle the case when no user is logged in', async () => {
      // Mock isSupabaseConfigured to return true
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
      
      // Mock getUser to return no user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      });
      
      const result = await accountCommand.execute({});
      
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('You are not logged in');
      expect(result.error).toBe('NOT_AUTHENTICATED');
    });
  });
}); 