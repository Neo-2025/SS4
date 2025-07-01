/**
 * Command Index - COMPLETE RESTORATION
 * All commands imported to ensure registration
 */

import registry from './registry';
import './debug-list-commands';
export * from './types';

// AUTH COMMANDS
import './auth/magic-link';    // Magic link authentication
import './auth/claim';         // Hospital group claiming  
import './auth/subscribe';     // Stripe subscription
import './auth/listing';       // T_ID marketplace management

// SYSTEM COMMANDS  
import './system/help';        // Show all commands
import './system/health';      // System health check
import './system/debug';       // Debug information
import './system/clear';       // Clear console
import './system/status';      // System status
import './system/version';     // Version information
import './system/reset';       // Reset functionality

// QBR COMMANDS
import './qbr/get-qbr';        // Fire-and-forget QBR generation

// AGENCY COMMANDS
import './agency/add';         // Add agency
import './agency/list';        // List agencies
import './agency/group-as';    // Group agencies

// TOP-LEVEL COMMANDS
import './account';            // Account info
import './login';              // Login
import './logout';             // Logout
import './search';             // Search

// Export the registry for use in the application
export default registry;
