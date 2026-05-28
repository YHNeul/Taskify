const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const TARGET_EXTENSIONS = new Set(['.ts', '.tsx']);

const LEGACY_SIZES = [
  'login_lg',
  'login_sm',
  'modal_lg',
  'modal_sm',
  'delete_lg',
  'delete_sm',
  'comment_lg',
  'comment_sm',
  'add_column',
  'add_todo',
  'dashboard_card',
  'add_board',
  'delete_dashboard',
];

const LEGACY_SIZE_PATTERN = new RegExp(
  `\\bsize\\s*=\\s*"(${LEGACY_SIZES.join('|')})"`,
  'g',
);

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
    LEGACY_SIZE_PATTERN.lastIndex = 0;
    const matched = LEGACY_SIZE_PATTERN.exec(line);
    if (matched) {
      violations.push({
        line: index + 1,
        value: matched[1],
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
    console.log('PASS: legacy size 신규 유입이 없습니다.');
    return;
  }

  console.error('FAIL: legacy preset은 legacySize로 사용해야 합니다.\n');
  for (const fileViolation of allViolations) {
    const relativePath = path.relative(ROOT, fileViolation.filePath);
    for (const violation of fileViolation.violations) {
      console.error(
        `${relativePath}:${violation.line} size="${violation.value}" -> legacySize="${violation.value}"`,
      );
      console.error(`  ${violation.source}`);
    }
  }

  process.exit(1);
}

main();
