#!/usr/bin/env bun
import { promises as fs } from 'fs';
import path from 'path';

// Patterns to exclude
const EXCLUDE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/scripts/**',
  '**/__tests__/**',
  '**/jest.setup.js',
  '**/metro.config.js',
  '**/webpack.config.js',
];

// Files that need special handling
const SPECIAL_FILES = {
  '/lib/core/logger.ts': true, // Don't touch the logger itself
  '/lib/core/debug.ts': true,   // Debug utilities might need console
  '/lib/core/suppress-warnings.ts': true, // Warning suppression needs console
};

async function removeConsoleLogs() {
  log.info('🔍 Searching for console.log statements...\n', 'COMPONENT');
  
  // Find all TypeScript and JavaScript files using shell command
  const { execSync } = require('child_process');
  const filesStr = execSync(
    `find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) | grep -v node_modules | grep -v dist | grep -v build | grep -v .next || true`,
    { encoding: 'utf-8' }
  );
  const files = filesStr.trim().split('\n').filter(f => f.length > 0).map(f => path.resolve(f));

  let totalCount = 0;
  let filesModified = 0;
  const results: Array<{ file: string; count: number; lines: number[] }> = [];

  for (const file of files) {
    // Skip special files
    const relativePath = path.relative(process.cwd(), file);
    if (SPECIAL_FILES[`/${relativePath}`]) {
      continue;
    }

    try {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.split('\n');
      const consoleLogLines: number[] = [];
      let modified = false;
      
      const newLines = lines.map((line, index) => {
        // Skip if it's a comment
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          return line;
        }
        
        // Check for console.log
// TODO: Replace with structured logging - if (line.includes('console.log')) {
          consoleLogLines.push(index + 1);
          totalCount++;
          modified = true;
          
          // Try to extract the message for conversion
          const match = line.match(/console\.log\s*\(\s*['"`]([^'"`]+)['"`]/);
          if (match) {
            const message = match[1];
            const indent = line.match(/^\s*/)?.[0] || '';
            
            // Try to determine the context
            let logFunction = 'log.info';
            if (message.toLowerCase().includes('error')) {
              logFunction = 'log.error';
            } else if (message.toLowerCase().includes('warn')) {
              logFunction = 'log.warn';
            } else if (message.toLowerCase().includes('debug')) {
              logFunction = 'log.debug';
            }
            
            // Check if file already imports logger
            const hasLoggerImport = content.includes("from '@/lib/core/logger'");
            
            if (hasLoggerImport) {
              // Replace with structured logging
              return line.replace(
                /console\.log\s*\(.*/,
                `${logFunction}('${message}', 'COMPONENT');`
              );
            } else {
              // Comment out for manual review
              return `// TODO: Replace with structured logging - ${line.trim()}`;
            }
          } else {
            // Complex console.log, comment out for manual review
            return `// TODO: Replace with structured logging - ${line.trim()}`;
          }
        }
        
        return line;
      });

      if (modified) {
        // Check if we need to add logger import
        if (!content.includes("from '@/lib/core/logger'") && 
            newLines.some(line => line.includes('log.info') || line.includes('log.error'))) {
          // Add import at the top after other imports
          const firstImportIndex = newLines.findIndex(line => line.startsWith('import'));
          const lastImportIndex = newLines.findLastIndex(line => line.startsWith('import'));
          
          if (lastImportIndex !== -1) {
            newLines.splice(lastImportIndex + 1, 0, "import { log } from '@/lib/core/logger';");
          } else {
            newLines.unshift("import { log } from '@/lib/core/logger';");
          }
        }
        
        await fs.writeFile(file, newLines.join('\n'));
        filesModified++;
        results.push({
          file: relativePath,
          count: consoleLogLines.length,
          lines: consoleLogLines,
        });
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  // Print results
  log.info('\n📊 Results:', 'COMPONENT');
  log.info('Total console.log statements found: ${totalCount}', 'COMPONENT');
  log.info('Files modified: ${filesModified}\n', 'COMPONENT');

  if (results.length > 0) {
    log.info('📝 Modified files:', 'COMPONENT');
    results.forEach(({ file, count, lines }) => {
      log.info('\n${file}', 'COMPONENT');
      log.info('  - ${count} console.log statements replaced/commented', 'COMPONENT');
      log.info('  - Lines: ${lines.join(', 'COMPONENT');
    });
  }

  log.info('\n✅ Done! Please review the changes and update any TODO comments.', 'COMPONENT');
  log.info('\n⚠️  Important: Files with complex console.log statements have been commented out.', 'COMPONENT');
  log.info('    Please manually update these to use structured logging.\n', 'COMPONENT');
}

// Run the script
removeConsoleLogs().catch(console.error);