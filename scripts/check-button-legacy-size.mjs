import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const TARGET_EXTENSIONS = new Set(['.ts', '.tsx']);
const LEGACY_PROP_PATTERN = /\blegacySize\s*=/g;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walk(fullPath));
      continue;
    }
    if (TARGET_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findViolations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations = [];

  lines.forEach((line, index) => {
    LEGACY_PROP_PATTERN.lastIndex = 0;
    const matched = LEGACY_PROP_PATTERN.exec(line);
    if (matched) {
      violations.push({
        line: index + 1,
        source: line.trim(),
      });
    }
  });

  return violations;
}

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error('src 디렉터리를 찾을 수 없습니다.');
    process.exit(1);
  }

  const files = walk(SRC_DIR);
  const allViolations = [];

  for (const filePath of files) {
    const violations = findViolations(filePath);
    if (violations.length > 0) {
      allViolations.push({ filePath, violations });
    }
  }

  if (allViolations.length === 0) {
    console.log('PASS: legacySize 사용이 없습니다.');
    return;
  }

  console.error('FAIL: legacySize 속성은 제거되었습니다.\n');
  for (const fileViolation of allViolations) {
    const relativePath = path.relative(ROOT, fileViolation.filePath);
    for (const violation of fileViolation.violations) {
      console.error(`${relativePath}:${violation.line} legacySize 사용 발견`);
      console.error(`  ${violation.source}`);
    }
  }

  process.exit(1);
}

main();
