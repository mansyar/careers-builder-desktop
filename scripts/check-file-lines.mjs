#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const MAX_LINES = 500;
const TARGET_DIRS = ['src', 'e2e', 'tests'];
const INCLUDE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.mjs',
  '.css',
  '.html',
]);
const EXCLUDE_DIRS = new Set([
  'node_modules', 'out', 'dist', '.git',
  'coverage', '.vite', 'test-results',
]);

const root = process.cwd();

function checkDirectory(dirPath) {
  let hasErrors = false;
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      if (checkDirectory(fullPath)) hasErrors = true;
    } else if (stat.isFile()) {
      const ext = extname(entry).toLowerCase();
      if (!INCLUDE_EXTENSIONS.has(ext)) continue;

      const content = readFileSync(fullPath, 'utf-8');
      const lineCount = content.split('\n').length;

      if (lineCount > MAX_LINES) {
        const relPath = fullPath.replace(root + '/', '');
        console.error(`❌ ${relPath}: ${lineCount} lines (max ${MAX_LINES})`);
        hasErrors = true;
      }
    }
  }

  return hasErrors;
}

let hasErrors = false;

for (const dir of TARGET_DIRS) {
  const dirPath = join(root, dir);
  try {
    statSync(dirPath);
  } catch {
    continue;
  }
  if (checkDirectory(dirPath)) {
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error(`\nFAILED: Some files exceed ${MAX_LINES} line limit`);
  process.exit(1);
} else {
  console.log('✅ All files within line limit');
}
