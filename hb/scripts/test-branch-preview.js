#!/usr/bin/env node

/**
 * Branch Preview Test Script
 * This script verifies the authentication configuration in a Vercel preview deployment
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get the preview URL from command line args or prompt for it
const args = process.argv.slice(2);
let previewUrl = args[0];

function testPreviewDeployment(url) {
  console.log(`\n🔍 Testing Branch Preview: ${url}\n`);
  
  // Test #1: Check if site is accessible
  console.log('Test #1: Verifying site accessibility...');
  httpsGet(`${url}`)
    .then(response => {
      console.log('✅ Site is accessible');
      
      // Test #2: Check for proper environment variables
      console.log('\nTest #2: Checking environment configuration...');
      return httpsGet(`${url}/api/config-test`);
    })
    .then(response => {
      try {
        const config = JSON.parse(response);
        
        // Check for required environment variables
        const hasSupabaseUrl = config.hasSupabaseUrl;
        const hasSupabaseKey = config.hasSupabaseKey;
        const hasGithubClientId = config.hasGithubClientId;
        
        if (hasSupabaseUrl && hasSupabaseKey && hasGithubClientId) {
          console.log('✅ Environment variables are properly configured');
          
          // Show the configuration details
          console.log('\nConfiguration Details:');
          console.log('- Supabase URL: ' + (hasSupabaseUrl ? '✅ Present' : '❌ Missing'));
          console.log('- Supabase Key: ' + (hasSupabaseKey ? '✅ Present' : '❌ Missing'));
          console.log('- GitHub OAuth Client ID: ' + (hasGithubClientId ? '✅ Present' : '❌ Missing'));
          console.log('- GitHub OAuth URL: ' + config.githubOAuthUrl);
          
          // Test #3: Check auth callback route
          console.log('\nTest #3: Verifying auth callback route...');
          return httpsGet(`${url}/auth/callback`);
        } else {
          throw new Error('Missing required environment variables');
        }
      } catch (error) {
        throw new Error(`Environment configuration error: ${error.message}`);
      }
    })
    .then(response => {
      console.log('✅ Auth callback route is configured correctly');
      
      // Test #4: Manual authentication testing instructions
      console.log('\nTest #4: Manual Authentication Testing');
      console.log('Please perform the following manual tests:');
      console.log('1. Open the preview URL in your browser:', url);
      console.log('2. Try the authentication commands:');
      console.log('   - >login (Should redirect to GitHub OAuth)');
      console.log('   - >account (Should show account info when logged in)');
      console.log('   - >logout (Should clear the session)');
      console.log('\n🎉 Branch Preview Authentication Testing Guide Completed!');
      
      rl.close();
    })
    .catch(error => {
      console.error(`❌ Error: ${error.message}`);
      rl.close();
    });
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      // Handle redirects for auth routes
      if (res.statusCode >= 300 && res.statusCode < 400) {
        console.log(`   ↪️ Redirect detected (${res.statusCode}): ${res.headers.location}`);
        if (url.includes('/auth/callback')) {
          resolve('Redirect as expected for auth callback');
          return;
        }
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}: ${data.substring(0, 100)}...`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// If no URL was provided, prompt for it
if (!previewUrl) {
  rl.question('Enter Vercel Preview URL: ', (answer) => {
    previewUrl = answer.trim();
    if (!previewUrl.startsWith('https://')) {
      previewUrl = 'https://' + previewUrl;
    }
    testPreviewDeployment(previewUrl);
  });
} else {
  if (!previewUrl.startsWith('https://')) {
    previewUrl = 'https://' + previewUrl;
  }
  testPreviewDeployment(previewUrl);
} 