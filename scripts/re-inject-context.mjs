#!/usr/bin/env node
/**
 * re-inject-context.mjs — SoDam-Reverse × SoDam-Context 시너지 스크립트.
 *
 * 역할: Context의 checkup-rules.json에 RE 스코프 검진 항목(re-scope-guard)을
 *       추가하는 방법을 안내한다. 다른 플러그인 파일을 직접 수정하지 않고
 *       (자기보호 hook 차단 위험), 복붙 가능한 명령어를 출력한다.
 *
 * 실행: node scripts/re-inject-context.mjs
 * 필요: SoDam-Context-Eng 설치 (없으면 건너뜀)
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const log = (msg) => process.stdout.write(msg + '\n');

const RE_SCOPE_RULE = {
  id: 're-scope-guard',
  kind: 'ai_suspect',
  name: 'RE 스코프 누락 (방어·교육·본인소유물 언급?)',
  why: "SoDam-Reverse가 설치된 프로젝트면 CLAUDE.md에 '방어·교육·본인소유물 전용' 범위를 명시해야 AI가 범위를 벗어나지 않습니다.",
  _source: '[sodam-reverse]',
};

// Context 플러그인 checkup-rules.json 후보 경로 (개발·설치 공통)
const CONTEXT_CANDIDATES = [
  join(homedir(), '.claude', 'plugins', 'sodam-context', 'rules', 'checkup-rules.json'),
  join(homedir(), 'AppData', 'Roaming', 'claude-code', 'plugins', 'sodam-context', 'rules', 'checkup-rules.json'),
  // 개발 경로: 현재 스크립트 위치 기준으로 형제 디렉터리 탐색
  resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '..', '..', '26y_06m_25d_SoDam-Context-Eng', 'rules', 'checkup-rules.json'),
];

log('\n🔍 SoDam-Context 검색 중...');

let contextRulesPath = null;
for (const candidate of CONTEXT_CANDIDATES) {
  if (existsSync(candidate)) { contextRulesPath = candidate; break; }
}

if (!contextRulesPath) {
  log('ℹ️  SoDam-Context 미발견 — 건너뜀.');
  log('   Context를 먼저 설치한 뒤 이 스크립트를 다시 실행하세요.');
  log('   권장 설치 순서: Harness → Loop → Context → Agentic → Prompt → Reverse\n');
  process.exit(0);
}

log(`   발견: ${contextRulesPath}`);

// 이미 주입됐는지 확인
let existing;
try {
  existing = JSON.parse(readFileSync(contextRulesPath, 'utf8'));
} catch (e) {
  log(`❌ checkup-rules.json 읽기 실패: ${e.message}`);
  process.exit(1);
}

const alreadyInjected = (existing.checks || []).some((c) => c.id === RE_SCOPE_RULE.id);
if (alreadyInjected) {
  log('✅ re-scope-guard 검진 항목이 이미 등록돼 있습니다.\n');
  process.exit(0);
}

// 직접 수정하지 않고 복붙 명령어 출력
const ruleJson = JSON.stringify(RE_SCOPE_RULE, null, 4).split('\n').join('\n    ');

log('\n✅ Context 발견. 아래 단계를 따라 RE 스코프 검진 항목을 추가하세요.\n');
log('─────────────────────────────────────────────────────────────────');
log('파일을 직접 수정하는 이유: 다른 플러그인 파일을 자동 수정하면');
log('SoDam 자기보호 hook이 차단할 수 있습니다.\n');
log(`대상 파일: ${contextRulesPath}\n`);
log('추가할 항목 (checks 배열 마지막에 삽입):');
log('─────────────────────────────────────────────────────────────────');
log(JSON.stringify(RE_SCOPE_RULE, null, 2));
log('─────────────────────────────────────────────────────────────────\n');
log('PowerShell 원라이너 (복붙 후 실행):');
log('─────────────────────────────────────────────────────────────────');
const escaped = JSON.stringify(RE_SCOPE_RULE).replace(/'/g, "''");
const escapedPath = contextRulesPath.replace(/'/g, "''");
log(`$f = '${escapedPath}'; $r = Get-Content $f | ConvertFrom-Json; $r.checks += '${escaped}' | ConvertFrom-Json; $r | ConvertTo-Json -Depth 10 | Set-Content $f -Encoding UTF8`);
log('─────────────────────────────────────────────────────────────────');
log('\n실행 후 /sodam-context:treat 를 다시 실행하면 RE 스코프 검진이 활성화됩니다.\n');
