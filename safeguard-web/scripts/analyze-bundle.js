#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const BUNDLE_SIZE_LIMIT = 180 * 1024; // 180KB gzipped
const CHUNK_SIZE_LIMIT = 50 * 1024; // 50KB per chunk

console.log('🔍 Analyzing bundle size...\n');

// Build the project (vite build directly to skip strict TS/test checks during analysis)
try {
  console.log('Building project with Vite (no minify)...');
  execSync('npx vite build --minify=false', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Check if dist directory exists
const distPath = join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  console.error('❌ Dist directory not found');
  process.exit(1);
}

// Analyze bundle
try {
  console.log('\n📊 Bundle Analysis:');
  
  // Get build stats
  const statsOutput = execSync('du -sh dist/*', { encoding: 'utf8' });
  console.log(statsOutput);
  
  // Check main bundle size
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    const indexContent = readFileSync(indexPath, 'utf8');
    const jsFiles = indexContent.match(/\/assets\/[^"]+\.js/g) || [];
    const cssFiles = indexContent.match(/\/assets\/[^"]+\.css/g) || [];
    
    console.log(`\n📦 Assets found:`);
    console.log(`   JS files: ${jsFiles.length}`);
    console.log(`   CSS files: ${cssFiles.length}`);
  }
  
  // Run bundle analyzer if available
  try {
    console.log('\n🔬 Running bundle analyzer...');
    execSync('npx vite-bundle-analyzer dist', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Bundle analyzer not available, install with: npm i -D vite-bundle-analyzer');
  }
  
  console.log('\n✅ Bundle analysis complete!');
  console.log(`📏 Size limit: ${Math.round(BUNDLE_SIZE_LIMIT / 1024)}KB gzipped`);
  console.log(`🧩 Chunk limit: ${Math.round(CHUNK_SIZE_LIMIT / 1024)}KB per chunk`);
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
}
