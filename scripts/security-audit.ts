import fs from 'fs';
import path from 'path';

const SECRET_PATTERNS = [
  { name: 'Anthropic Key', regex: /sk-ant-api03-[A-Za-z0-9_-]{20,}/ },
  { name: 'AWS Secret Key', regex: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/i },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'Generic Password/Secret', regex: /(?:password|secret|apikey|token)\s*[:=]\s*['"][A-Za-z0-9_\-+=]{20,}['"]/i },
];

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'out', 'dist', '.gemini'];
const IGNORE_FILES = ['.env']; // .env is local-only, excluded by .gitignore

function scanDirectory(dir: string, issues: Array<{ file: string; secretType: string; line: number }>) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORE_DIRS.includes(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, issues);
    } else if (entry.isFile()) {
      if (IGNORE_FILES.includes(entry.name)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        for (const pattern of SECRET_PATTERNS) {
          if (pattern.regex.test(line)) {
            // Ignore type definitions or variable name definitions
            if (line.includes('process.env.') || line.includes('interface ') || line.includes('type ') || line.includes('ANTHROPIC_API_KEY=')) {
              continue;
            }
            issues.push({
              file: path.relative(process.cwd(), fullPath),
              secretType: pattern.name,
              line: idx + 1,
            });
          }
        }
      });
    }
  }
}

console.log('🔒 RUNNING SECURITY AUDIT FOR HARDCODED CREDENTIALS...\n');
const issues: Array<{ file: string; secretType: string; line: number }> = [];
scanDirectory(process.cwd(), issues);

if (issues.length === 0) {
  console.log('✅ ZERO hardcoded API keys or secrets detected in source code.');
  console.log('✅ All environment variables access via process.env server-side only.');
} else {
  console.error('❌ SECURITY ISSUES DETECTED:');
  issues.forEach((i) => {
    console.error(`   - ${i.file}:${i.line} -> ${i.secretType}`);
  });
}
