#!/usr/bin/env node

/**
 * Security Check Script
 * Verifies that no API keys are committed to the repository
 */

const fs = require('fs');
const path = require('path');

const sensitivePatterns = [
  /gsk_[a-zA-Z0-9]{32,}/, // Groq API keys
  /sk-[a-zA-Z0-9]{32,}/,  // OpenAI API keys
  /AIza[0-9A-Za-z_-]{35}/, // Google API keys
  /AKIA[0-9A-Z]{16}/,      // AWS keys
];

const filesToCheck = [
  'server/server.js',
  'client/src/App.js',
  'api/index.js',
];

let hasIssues = false;

console.log('🔒 Running security check...\n');

// Check for .env files
const checkEnvFiles = () => {
  const envFiles = [
    '.env',
    'server/.env',
    'client/.env',
  ];

  envFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`⚠️  WARNING: ${file} exists! Make sure it's in .gitignore`);
      hasIssues = true;
    }
  });
};

// Check for hardcoded API keys
const checkForKeys = () => {
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      sensitivePatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            if (!match.includes('your_free_key_here') && !match.includes('example')) {
              console.log(`❌ SECURITY ISSUE: Potential API key found in ${file}`);
              console.log(`   Pattern: ${match.substring(0, 10)}...`);
              hasIssues = true;
            }
          });
        }
      });
    }
  });
};

// Check .gitignore
const checkGitignore = () => {
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env')) {
      console.log('⚠️  WARNING: .gitignore might not exclude .env files');
      hasIssues = true;
    } else {
      console.log('✅ .gitignore properly configured');
    }
  }
};

checkEnvFiles();
checkForKeys();
checkGitignore();

if (hasIssues) {
  console.log('\n❌ Security check failed! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('\n✅ Security check passed! Safe to commit and deploy.');
  process.exit(0);
}

