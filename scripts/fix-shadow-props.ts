#!/usr/bin/env bun
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { log } from '@/lib/core/logger';

interface FileChange {
  file: string;
  lineNumber: number;
  original: string;
  fixed: string;
}

const ignorePaths = [
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'scripts/fix-shadow-props.ts',
];

async function fixShadowsInFile(filePath: string): Promise<FileChange[]> {
  const changes: FileChange[] = [];
  
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    let modified = false;
    
    const newLines = lines.map((line, index) => {
      // Skip if it's a comment
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return line;
      }
      
      // Check for direct boxShadow usage in styles
      if (line.includes('boxShadow:') && !line.includes('Platform.OS')) {
        const lineNumber = index + 1;
        const original = line;
        
        // If it's in a web-only style block, it's okay
        if (content.substring(Math.max(0, content.indexOf(line) - 200), content.indexOf(line)).includes("Platform.OS === 'web'")) {
          return line;
        }
        
        // For hover states in Card component, wrap in Platform check
        if (line.includes('boxShadow:') && filePath.includes('Card.tsx')) {
          const indent = line.match(/^\s*/)?.[0] || '';
          const newLine = `${indent}...(Platform.OS === 'web' && { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }),`;
          changes.push({ file: filePath, lineNumber, original, fixed: newLine });
          modified = true;
          return newLine;
        }
        
        // For other cases, comment it out with a TODO
        const indent = line.match(/^\s*/)?.[0] || '';
        const newLine = `${indent}// TODO: Replace with shadow prop - ${line.trim()}`;
        changes.push({ file: filePath, lineNumber, original, fixed: newLine });
        modified = true;
        return newLine;
      }
      
      // Check for shadowColor, shadowOffset, etc. outside of designSystem.shadows
      const shadowProps = ['shadowColor:', 'shadowOffset:', 'shadowOpacity:', 'shadowRadius:'];
      for (const prop of shadowProps) {
        if (line.includes(prop) && !line.includes('designSystem.shadows')) {
          // Check if it's already in a Platform-specific block
          const contextStart = Math.max(0, content.indexOf(line) - 500);
          const context = content.substring(contextStart, content.indexOf(line));
          
          if (!context.includes("Platform.select") && !context.includes("Platform.OS")) {
            const lineNumber = index + 1;
            const original = line;
            const indent = line.match(/^\s*/)?.[0] || '';
            const newLine = `${indent}// TODO: Use Box shadow prop instead - ${line.trim()}`;
            changes.push({ file: filePath, lineNumber, original, fixed: newLine });
            modified = true;
            return newLine;
          }
        }
      }
      
      return line;
    });
    
    if (modified) {
      // Add Platform import if needed and not already present
      if (!content.includes("import { Platform }") && !content.includes("Platform,")) {
        const importIndex = newLines.findIndex(line => line.includes("from 'react-native'"));
        if (importIndex !== -1) {
          // Add Platform to existing react-native import
          newLines[importIndex] = newLines[importIndex].replace(
            /from 'react-native'/,
            (match) => {
              const currentImports = newLines[importIndex].match(/{([^}]+)}/)?.[1] || '';
              if (!currentImports.includes('Platform')) {
                return newLines[importIndex].includes('{')
                  ? newLines[importIndex].replace('{', '{ Platform,')
                  : "import { Platform } from 'react-native'";
              }
              return match;
            }
          );
        }
      }
      
      await writeFile(filePath, newLines.join('\n'), 'utf-8');
    }
    
  } catch (error) {
    log.error('Failed to process file', 'SHADOW_FIX', error);
  }
  
  return changes;
}

async function processDirectory(dir: string): Promise<FileChange[]> {
  const allChanges: FileChange[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    // Skip ignored paths
    if (ignorePaths.some(ignored => fullPath.includes(ignored))) {
      continue;
    }

    if (entry.isDirectory()) {
      const changes = await processDirectory(fullPath);
      allChanges.push(...changes);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      const changes = await fixShadowsInFile(fullPath);
      allChanges.push(...changes);
    }
  }

  return allChanges;
}

async function fixShadowProps() {
  log.info('Starting shadow prop fixes...', 'SHADOW_FIX');

  const projectRoot = process.cwd();
  const changes = await processDirectory(projectRoot);

  if (changes.length > 0) {
    log.info(`Fixed ${changes.length} shadow prop issues`, 'SHADOW_FIX');
    
    // Group by file
    const changesByFile = changes.reduce((acc, change) => {
      if (!acc[change.file]) {
        acc[change.file] = [];
      }
      acc[change.file].push(change);
      return acc;
    }, {} as Record<string, FileChange[]>);
    
    console.log('\n📝 Changes made:');
    for (const [file, fileChanges] of Object.entries(changesByFile)) {
      console.log(`\n${file}:`);
      for (const change of fileChanges) {
        console.log(`  Line ${change.lineNumber}: Fixed shadow prop issue`);
      }
    }
  } else {
    log.info('No shadow prop issues found!', 'SHADOW_FIX');
  }
  
  console.log('\n✅ Shadow prop fixes complete!');
  console.log('\n📌 Next steps:');
  console.log('1. Review the TODO comments added to files');
  console.log('2. Replace direct shadow styles with Box component shadow prop');
  console.log('3. Use Platform.select() for platform-specific shadows when needed');
}

// Run the fix
fixShadowProps().catch((error) => {
  log.error('Shadow fix failed', 'SHADOW_FIX', error);
  process.exit(1);
});