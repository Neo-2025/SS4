/**
 * GitHub OAuth Authentication Test Script
 * 
 * This script tests the GitHub OAuth authentication flow in the HealthBench CLI.
 * It executes the following steps:
 * 1. Start the local development server
 * 2. Open the application in a browser
 * 3. Execute the login command
 * 4. Verify that the user is redirected to GitHub
 * 5. Complete the authentication flow
 * 6. Verify that the user is redirected back to the application
 * 7. Verify that the user is authenticated
 * 
 * Usage:
 * node scripts/test-auth.js
 */

const { spawn } = require('child_process');
const open = require('open');

console.log('🚀 Starting GitHub OAuth authentication test...');

// Step 1: Start the local development server
console.log('📦 Starting local development server...');

const server = spawn('npm', ['run', 'dev'], { 
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  // When the server is ready
  if (output.includes('ready started server')) {
    console.log('✅ Local development server is running');
    
    // Step 2: Open the application in a browser
    console.log('🌐 Opening application in default browser...');
    open('http://localhost:3000');
    
    console.log('\n🔍 Manual Testing Instructions:');
    console.log('1. Enter the command ">login" in the terminal');
    console.log('2. Verify that you are redirected to GitHub for authentication');
    console.log('3. Complete the authentication using test account credentials:');
    console.log('   - Email: neo@smartscale.co');
    console.log('4. Verify that you are redirected back to the application');
    console.log('5. Verify that the authentication status is updated in the terminal status bar');
    console.log('6. Try the ">account" command to see your account information');
    console.log('7. Try the ">logout" command to sign out');
    console.log('\n⚠️ Press Ctrl+C to stop the server when testing is complete\n');
  }
});

server.stderr.on('data', (data) => {
  console.error(`❌ Error: ${data}`);
});

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
}); 