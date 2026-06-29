#!/usr/bin/env node
/**
 * check-family.mjs — SoDam 6형제 설치 상태 + 시너지 활성 여부 진단기.
 *
 * 실행: node scripts/check-family.mjs
 * 필요: Node.js v18+
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const H = homedir();
const log = (msg) => process.stdout.write(msg + '\n');
const readJson = (p) => { try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; } };

// ── 형제 데이터 디렉터리 (플러그인 런타임이 생성) ──────────────────────
const DIRS = {
  harness: join(H, '.sodamharness'),
  loop:    join(H, '.sodam-loop'),
  agentic: join(H, '.sodamagentic'),
};

// ── Harness safety-rules.json ──────────────────────────────────────────
const HARNESS_RULES = join(DIRS.harness, 'safety-rules.json');

// ── Context checkup-rules.json 후보 경로 ──────────────────────────────
const CTX_CANDIDATES = [
  join(H, '.claude', 'plugins', 'sodam-context', 'rules', 'checkup-rules.json'),
  join(H, 'AppData', 'Roaming', 'claude-code', 'plugins', 'sodam-context', 'rules', 'checkup-rules.json'),
  resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '..', '..', '26y_06m_25d_SoDam-Context-Eng', 'rules', 'checkup-rules.json'),
];
const ctxPath = CTX_CANDIDATES.find(existsSync) ?? null;

// ── 상태 수집 ──────────────────────────────────────────────────────────
const harnessInstalled = existsSync(DIRS.harness);
const harnessRules     = harnessInstalled ? readJson(HARNESS_RULES) : null;
// Harness guard.mjs loadExtraRules()는 r.plugins.reverse (중첩 키)를 읽음 — 평탄 키 "plugins.reverse"가 아님
const reNs             = harnessRules?.plugins?.reverse ?? null;
const reCatCount       = Array.isArray(reNs?.catastrophic) ? reNs.catastrophic.length : 0;
const reRiskyCount     = Array.isArray(reNs?.risky)        ? reNs.risky.length        : 0;
const reInjected       = reCatCount > 0 || reRiskyCount > 0;

const loopInstalled    = existsSync(DIRS.loop);
const agenticInstalled = existsSync(DIRS.agentic);
const ctxInstalled     = ctxPath !== null;
const ctxRules         = ctxInstalled ? readJson(ctxPath) : null;
const reScopeInjected  = (ctxRules?.checks ?? []).some((c) => c.id === 're-scope-guard');

// ── 출력 ───────────────────────────────────────────────────────────────
const ok  = (s) => `✅ ${s}`;
const ng  = (s) => `❌ ${s}`;
const pnd = (s) => `⏳ ${s}`;

log('\n═══════════════════════════════════════════');
log('  SoDam 6형제 상태 점검');
log('═══════════════════════════════════════════');

log(`\n● Harness   ${harnessInstalled ? ok('설치됨  ' + DIRS.harness) : ng('미발견  ~/.sodamharness/')}`);
if (harnessInstalled && reNs) {
  log(`            ${reInjected ? ok(`plugins.reverse 규칙  catastrophic ${reCatCount}개 / risky ${reRiskyCount}개`) : ng('plugins.reverse 규칙 없음 — re-inject-harness.mjs 실행 필요')}`);
} else if (harnessInstalled) {
  log(`            ${ng('safety-rules.json 없음 또는 plugins.reverse 섹션 없음')}`);
}

log(`● Loop      ${loopInstalled ? ok('설치됨  ' + DIRS.loop) : ng('미발견  ~/.sodam-loop/')}`);
log(`● Context   ${ctxInstalled  ? ok('발견됨  ' + ctxPath)   : ng('미발견')}`);
if (ctxInstalled) {
  log(`            ${reScopeInjected ? ok('re-scope-guard 검진 항목 등록됨') : ng('re-scope-guard 없음 — re-inject-context.mjs 실행 권장')}`);
}
log(`● Agentic   ${agenticInstalled ? ok('설치됨  ' + DIRS.agentic) : ng('미발견  ~/.sodamagentic/')}`);
log(`● Prompt    ${pnd('미설치 (Phase 2 — Prompt-Eng 코드 미구현)')}`);
log(`● Reverse   ${ok('현재 플러그인')}`);

log('\n───────────────────────────────────────────');
log('  활성 시너지');
log('───────────────────────────────────────────');

const syn = [
  { label: '[Harness+Reverse] RE 규칙 공유 hook     ', ok: harnessInstalled && reInjected,    detail: reInjected ? `plugins.reverse 주입 확인 (catastrophic ${reCatCount} / risky ${reRiskyCount})` : 'node scripts/re-inject-harness.mjs 실행 필요' },
  { label: '[Loop+Harness]    Loop Bash 이중확인 방지', ok: loopInstalled && harnessInstalled,  detail: '(Loop safety-gate.mjs 자동 양보 — 코드 변경 불필요)' },
  { label: '[Agentic+Harness] Agentic 이중 가드 방지', ok: agenticInstalled && harnessInstalled, detail: '(Agentic guard.mjs 자동 양보 — 코드 변경 불필요)' },
  { label: '[Context+Reverse] RE 스코프 건강검진     ', ok: ctxInstalled && reScopeInjected,  detail: ctxInstalled ? (reScopeInjected ? 're-scope-guard 활성' : 'node scripts/re-inject-context.mjs 실행 권장') : 'Context 미설치' },
  { label: '[Prompt+Reverse]  자연어 요청 품질향상   ', ok: false, detail: 'Phase 2 (Prompt-Eng 코드 미구현)' },
];

for (const s of syn) {
  log(`  ${s.ok ? '✅' : (s.label.includes('Prompt') ? '⏳' : '❌')} ${s.label}  ${s.detail}`);
}

log('\n───────────────────────────────────────────');

const allDone = harnessInstalled && reInjected && loopInstalled && agenticInstalled && ctxInstalled && reScopeInjected;
if (allDone) {
  log('🎉 모든 현재 시너지가 활성화됐습니다 (Prompt는 Phase 2).\n');
} else {
  log('\n💡 권장 다음 단계:');
  if (!harnessInstalled)              log('   1. SoDam-Harness 설치 후 초기화');
  if (harnessInstalled && !reInjected) log('   1. node scripts/re-inject-harness.mjs');
  if (ctxInstalled && !reScopeInjected) log('   2. node scripts/re-inject-context.mjs');
  if (!ctxInstalled)                  log('   2. SoDam-Context 설치 후 re-inject-context.mjs');
  log('');
}
