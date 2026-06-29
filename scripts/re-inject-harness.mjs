#!/usr/bin/env node
/**
 * re-inject-harness.mjs — SoDam-Reverse × SoDam-Harness 시너지 통합 스크립트.
 *
 * 역할: Harness guard.mjs가 자동 로드하는 ~/.sodamharness/safety-rules.json 에
 *       RE 전용 위험 패턴을 주입한다. 주입 후 Harness hook 1개가 RE 규칙까지 담당하므로
 *       경쟁 hook 중복 없이 안전 3층 중 2층을 공유한다.
 *
 * 실행: node scripts/re-inject-harness.mjs  (또는 /re-selftest가 자동 호출)
 * 필요: SoDam-Harness-Eng 먼저 설치·초기화 (Harness가 없으면 자체 re-deny-guard.mjs로 폴백).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HARNESS_RULES_PATH = join(homedir(), '.sodamharness', 'safety-rules.json');
const RE_SOURCE_TAG = '[sodam-reverse]';

// Harness guard.mjs compileList()는 문자열/정규식 패턴 배열을 기대한다.
// 객체({match, tag, reason})를 주입하면 compileList가 무시 → 무음 실패.
// 정규식 문자열로 주입해야 안전 규칙이 실제로 등록된다.
const RE_RULES = {
  catastrophic: [
    '크랙',
    '유료.?잠금.?풀',
    '라이선스.?우회',
    '라이센스.?우회',
    'license.?bypass',
    'bypass.?license',
    'drm.?bypass',
    'keygen',
  ],
  risky: [
    '인증.?우회',
    '로그인.?우회',
    '항상.?true.?반환',
    '항상.?참.?반환',
    '토큰.?추출',
    '키.?추출해',
    'bypass.?auth',
    'nop.?the.?check',
    'patch.?the.?check',
    'always.?return.?true',
  ],
};

function log(msg) { process.stdout.write(msg + '\n'); }

if (!existsSync(HARNESS_RULES_PATH)) {
  const dir = join(homedir(), '.sodamharness');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  log(`ℹ️  Harness 규칙 파일 없음 → 새로 생성: ${HARNESS_RULES_PATH}`);
  const fresh = { catastrophic: [], risky: [], sensitivePaths: { windows: [], posix: [], homeSubdirs: [] }, plugins: { reverse: { catastrophic: [], risky: [], recursiveDelete: [] } }, _note: 'SoDam Harness safety-rules (RE 주입)' };
  writeFileSync(HARNESS_RULES_PATH, JSON.stringify(fresh, null, 2), 'utf8');
}

let rules;
try {
  rules = JSON.parse(readFileSync(HARNESS_RULES_PATH, 'utf8'));
} catch (e) {
  log(`❌ Harness 규칙 파일 읽기 실패: ${e.message}`);
  process.exit(1);
}

// plugins.reverse 중첩 네임스페이스 사용 (Harness guard.mjs loadExtraRules()가 r.plugins.* 를 읽음).
// ⚠️ 평탄 키("plugins.reverse")로 쓰면 loadExtraRules()가 인식 못 함 — 반드시 중첩 구조 사용.
// 마이그레이션: 구버전 평탄 키가 있으면 자동 변환 후 삭제.
if (rules['plugins.reverse'] && typeof rules['plugins.reverse'] === 'object') {
  if (!rules.plugins) rules.plugins = {};
  if (!rules.plugins.reverse) rules.plugins.reverse = rules['plugins.reverse'];
  delete rules['plugins.reverse'];
  log('ℹ️  구버전 flat key "plugins.reverse" → 중첩 plugins.reverse 자동 마이그레이션 완료.');
}
if (!rules.plugins || typeof rules.plugins !== 'object') rules.plugins = {};
if (!rules.plugins.reverse || typeof rules.plugins.reverse !== 'object') {
  rules.plugins.reverse = { catastrophic: [], risky: [], recursiveDelete: [] };
}
const ns = rules.plugins.reverse;

let added = 0;
for (const level of ['catastrophic', 'risky']) {
  if (!Array.isArray(ns[level])) ns[level] = [];
  for (const pattern of RE_RULES[level]) {
    if (!ns[level].includes(pattern)) { ns[level].push(pattern); added++; }
  }
}

try {
  writeFileSync(HARNESS_RULES_PATH, JSON.stringify(rules, null, 2), 'utf8');
  log(`✅ Harness safety-rules.json 에 RE 규칙 ${added}개 주입 완료.`);
  log(`   네임스페이스: plugins.reverse (중첩 구조 — Harness loadExtraRules() 호환)`);
  log(`   경로: ${HARNESS_RULES_PATH}`);
  log(`   이제 Harness hook 1개가 RE 위험 패턴도 함께 차단합니다 (hook 중복 없음).`);
  if (added === 0) log('   (이미 모두 등록됨 — 중복 주입 없음)');
} catch (e) {
  log(`❌ 규칙 저장 실패: ${e.message}`);
  process.exit(1);
}
