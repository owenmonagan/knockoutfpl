#!/usr/bin/env node

/**
 * E2E Test Watcher
 *
 * Watches critical source files and triggers relevant E2E tests based on changes.
 * Uses the .e2e-watch.json configuration to map files to test tags.
 *
 * Usage:
 *   node scripts/e2e-watch.js
 *   npm run test:e2e:selective (if added to package.json)
 */

import fs from 'fs';
import path from 'path';
import { watch } from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { minimatch } from 'minimatch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Configuration
const CONFIG_FILE = path.join(rootDir, '.e2e-watch.json');
const DEBOUNCE_MS = 2000; // Wait 2 seconds after last change
const SRC_DIR = path.join(rootDir, 'src');

// State
let debounceTimer = null;
let changedFiles = new Set();
let isRunningTests = false;

/**
 * Load the E2E watch configuration
 */
function loadConfig() {
  try {
    const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(`❌ Failed to load ${CONFIG_FILE}:`, error.message);
    console.log('\n📝 Creating default configuration...');
    return {
      mappings: [],
      defaultTags: ['@smoke']
    };
  }
}

/**
 * Match a file path against patterns and return relevant tags
 */
function getTagsForFile(filePath, config) {
  const relativePath = path.relative(rootDir, filePath);
  const tags = new Set();

  for (const mapping of config.mappings) {
    // Convert the pattern to a glob pattern
    const pattern = mapping.pattern.replace(/\{([^}]+)\}/g, '{$1}');

    if (minimatch(relativePath, pattern, { matchBase: false })) {
      mapping.tags.forEach(tag => tags.add(tag));
    }
  }

  // If no tags found, use default
  if (tags.size === 0 && config.defaultTags) {
    config.defaultTags.forEach(tag => tags.add(tag));
  }

  return Array.from(tags);
}

/**
 * Run unit tests first, then E2E tests if they pass
 */
async function runTests(tags) {
  if (isRunningTests) {
    console.log('⏳ Tests already running, skipping...');
    return;
  }

  isRunningTests = true;
  console.log('\n🧪 Running unit tests first...');

  try {
    // Run unit tests
    const unitTestResult = await runCommand('npm', ['test', '--', '--run']);

    if (unitTestResult.code !== 0) {
      console.log('❌ Unit tests failed. Skipping E2E tests.');
      isRunningTests = false;
      return;
    }

    console.log('✅ Unit tests passed!\n');

    // Run E2E tests with selected tags
    if (tags.length === 0) {
      console.log('ℹ️  No specific tags to run, skipping E2E tests.');
      isRunningTests = false;
      return;
    }

    const uniqueTags = [...new Set(tags)];
    const grepPattern = uniqueTags.join('|');

    console.log(`🎭 Running E2E tests: ${uniqueTags.join(', ')}`);
    console.log(`   Command: playwright test --grep "${grepPattern}"\n`);

    await runCommand('npx', ['playwright', 'test', '--grep', grepPattern]);

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
  } finally {
    isRunningTests = false;
  }
}

/**
 * Run a command and stream output
 */
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      resolve({ code });
    });

    proc.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Handle file change event
 */
function handleFileChange(filePath, config) {
  changedFiles.add(filePath);

  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new timer
  debounceTimer = setTimeout(() => {
    const allTags = new Set();

    console.log('\n📝 Changed files:');
    changedFiles.forEach(file => {
      const relativePath = path.relative(rootDir, file);
      const tags = getTagsForFile(file, config);
      console.log(`   ${relativePath} → ${tags.join(', ') || 'none'}`);
      tags.forEach(tag => allTags.add(tag));
    });

    // Clear changed files
    changedFiles.clear();

    // Run tests
    if (allTags.size > 0) {
      runTests(Array.from(allTags));
    }
  }, DEBOUNCE_MS);
}

/**
 * Watch directory recursively
 */
function watchDirectory(dir, config) {
  try {
    const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const filePath = path.join(dir, filename);

      // Ignore node_modules, dist, and other build artifacts
      if (filePath.includes('node_modules') ||
          filePath.includes('dist') ||
          filePath.includes('.git') ||
          filePath.includes('playwright-report')) {
        return;
      }

      // Only watch .ts, .tsx, .js, .jsx files
      if (!/\.(ts|tsx|js|jsx)$/.test(filename)) {
        return;
      }

      // Check if file exists (not deleted)
      if (fs.existsSync(filePath)) {
        handleFileChange(filePath, config);
      }
    });

    console.log(`👀 Watching: ${path.relative(rootDir, dir)}`);
    return watcher;
  } catch (error) {
    console.error(`❌ Failed to watch ${dir}:`, error.message);
    return null;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🎬 E2E Test Watcher Starting...\n');

  const config = loadConfig();

  console.log('📋 Configuration:');
  console.log(`   Mappings: ${config.mappings.length}`);
  console.log(`   Default tags: ${config.defaultTags.join(', ')}\n`);

  // Watch src directory
  const watcher = watchDirectory(SRC_DIR, config);

  if (!watcher) {
    console.error('❌ Failed to start watcher');
    process.exit(1);
  }

  console.log('\n✅ E2E watcher is running!');
  console.log('   Press Ctrl+C to stop\n');

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n👋 Stopping watcher...');
    watcher.close();
    process.exit(0);
  });
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { loadConfig, getTagsForFile, runTests };
