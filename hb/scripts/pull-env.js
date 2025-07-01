/**
 * Environment Variables Pull Script
 * 
 * This script pulls environment variables from Vercel into a local .env.local file.
 * It implements the CORE pattern where Vercel is the primary Source of Record (SOR)
 * for environment variables, ensuring consistent branch-to-branch execution.
 * 
 * IMPORTANT: Never manually create or modify .env.local files. Always pull from Vercel.
 * 
 * Usage:
 * node scripts/pull-env.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 CORE PATTERN: Vercel as Primary Source of Record');
console.log('───────────────────────────────────────────────────');
console.log('This script implements the established CORE patterns:');
console.log('1. Vercel as Primary SOR Pattern (CORE)');
console.log('2. Environment Configuration Pattern');
console.log('3. Meeting In The Middle Pattern');
console.log('4. Branch-to-Branch Serial Execution Pattern');
console.log('───────────────────────────────────────────────────');
console.log('⚠️  NEVER manually create or edit .env.local files');
console.log('⚠️  ALWAYS pull from Vercel for branch-to-branch consistency');
console.log('───────────────────────────────────────────────────');

// Step 1: Check if Vercel CLI is installed
console.log('\n📋 Step 1: Checking Vercel CLI installation...');
const checkVercel = spawn('npx', ['vercel', '--version'], {
  stdio: 'pipe',
  shell: true
});

checkVercel.stdout.on('data', (data) => {
  console.log(`✅ Vercel CLI is installed: ${data.toString().trim()}`);
  pullEnvironmentVariables();
});

checkVercel.stderr.on('data', () => {
  console.log('❌ Vercel CLI is not installed or not working properly');
  console.log('Please install it with: npm install -g vercel');
  process.exit(1);
});

// Step 2: Pull environment variables
function pullEnvironmentVariables() {
  console.log('\n📋 Step 2: Pulling environment variables from Vercel (Primary SOR)...');
  
  // First, check if .env.local exists and rename it if it does
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const backupPath = `${envPath}.backup-${Date.now()}`;
    console.log(`⚠️  Found existing .env.local, backing up to ${backupPath}`);
    fs.renameSync(envPath, backupPath);
    console.log('⚠️  Per CORE pattern, we always refresh from Vercel as the primary SOR');
  }
  
  const cmd = spawn('npx', ['vercel', 'env', 'pull', '.env.local'], {
    stdio: 'inherit',
    shell: true
  });

  cmd.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Environment variables successfully pulled from Vercel!');
      verifyEnvironmentVariables();
    } else {
      console.error('❌ Failed to pull environment variables from Vercel');
      console.log('Possible solutions:');
      console.log('1. Make sure you are authenticated with Vercel: npx vercel login');
      console.log('2. Make sure the project is linked: npx vercel link');
      console.log('3. Check your internet connection');
      process.exit(1);
    }
  });
}

// Step 3: Verify environment variables
function verifyEnvironmentVariables() {
  console.log('\n📋 Step 3: Verifying environment variables from Vercel SOR...');
  
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env.local file not found');
      process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Check Supabase configuration
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    if (hasSupabaseUrl && hasSupabaseKey) {
      console.log('✅ Supabase configuration found in Vercel SOR');
    } else {
      console.log('⚠️ Supabase configuration incomplete in Vercel SOR');
      console.log('   Missing:', !hasSupabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : '', !hasSupabaseKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : '');
      console.log('   🔄 Add these variables to Vercel and pull again');
    }
    
    // Check GitHub OAuth configuration
    const hasGithubClientId = envContent.includes('NEXT_PUBLIC_GITHUB_CLIENT_ID') || 
                           envContent.includes('GITHUB_OAUTH_CLIENT_ID');
    const hasGithubClientSecret = envContent.includes('GITHUB_CLIENT_SECRET') || 
                                envContent.includes('GITHUB_OAUTH_CLIENT_SECRET');
    
    if (hasGithubClientId && hasGithubClientSecret) {
      console.log('✅ GitHub OAuth configuration found in Vercel SOR');
    } else {
      console.log('⚠️ GitHub OAuth configuration incomplete in Vercel SOR');
      console.log('   Missing:', !hasGithubClientId ? 'GITHUB_CLIENT_ID' : '', !hasGithubClientSecret ? 'GITHUB_CLIENT_SECRET' : '');
      console.log('   🔄 Add these variables to Vercel and pull again');
    }
    
    console.log('\n🎉 Environment variables verification complete!');
    console.log('───────────────────────────────────────────────────');
    console.log('ℹ️  You can also use the npm script: npm run vercel:env:pull');
    console.log('───────────────────────────────────────────────────');
    console.log('🔄 CORE PATTERN ENFORCED: Vercel as primary SOR for environment variables');
    console.log('🚀 Ready to proceed with Branch 2 implementation!');
  } catch (error) {
    console.error('❌ Error verifying environment variables:', error);
    process.exit(1);
  }
} 