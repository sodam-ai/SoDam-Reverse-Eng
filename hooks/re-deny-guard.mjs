#!/usr/bin/env node
/**
 * sodam-reverse :: re-deny-guard.mjs — 안전 3층 중 [2층] deny-hook.
 * 크랙·인증/라이선스 우회·키/토큰 추출 등 금지 범위 도구 호출을 차단.
 * 원칙: 1차 방어는 AI 출력거부(스킬). 이 hook은 2차. fail-closed(판단불가 시 차단). 과차단 최소화(좁은 패턴).
 */
import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

const TAG = '[sodam-reverse]';

// 안전로그 기록(02_DATA_MODEL SafetyLog) — 원문 대신 해시만 저장(자기부죄 방지, PRD M7).
// 기록 실패가 차단 판정에 영향 주면 안 되므로 항상 try/catch로 격리한다.
// 범위: 해시 기록까지만(최소 스코프) — "자동 만료"는 후속 과제로 남긴다.
function logSafetyEvent(reason) {
  try {
    const dir = join(process.cwd(), '.sodam-re');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const hash = createHash('sha256').update(raw || '').digest('hex').slice(0, 16);
    const entry = { id: `log-${Date.now()}`, blocked_request: `sha256:${hash}`, reason, occurred_at: new Date().toISOString() };
    appendFileSync(join(dir, 'safety-log.jsonl'), JSON.stringify(entry) + '\n', 'utf8');
  } catch {}
}

function deny(reason) {
  logSafetyEvent(reason);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${TAG} ${reason}` },
  }));
  process.exit(0);
}
function passThrough() { process.exit(0); }

// [2026-07-12] Harness 위임(존재 시 자체검사 생략) 로직은 도입 후 라이브 셀프테스트에서
// 실제 회귀(격리 실행 시 위험 샘플이 무검증 통과)가 확인되어 롤백함 — 안전 공백 > 중복실행 비효율.
// 자체 검사는 항상 수행한다(§5-1 "훅 중복" 한계는 유지되나 위험도는 기존에 이미 "낮음"으로 평가됨).

let raw = '';
try { raw = readFileSync(0, 'utf8'); }
catch { deny('안전검사 입력을 읽지 못했습니다(fail-closed). /re-selftest 또는 재설치를 권장합니다.'); }

let payload;
try {
  if (!raw.trim()) deny('빈 입력을 받았습니다(fail-closed). /re-selftest 또는 재설치를 권장합니다.');
  payload = JSON.parse(raw);
}
catch { deny('안전검사 입력 해석에 실패했습니다(fail-closed).'); }

const ti = payload.tool_input || payload.toolInput || {};
const parts = [ti.command, ti.content, ti.new_string, ti.old_string, ti.file_path, ti.path, ti.prompt, ti.description];
let haystack = parts.filter((v) => typeof v === 'string').join('\n');
try { haystack += '\n' + JSON.stringify(ti); } catch {}
const hay = haystack.toLowerCase();

const here = dirname(fileURLToPath(import.meta.url));
let corpus = { keywords: [], regex: [] };
try {
  const loaded = JSON.parse(readFileSync(join(here, '..', 'references', 'deny-corpus.json'), 'utf8'));
  if (Array.isArray(loaded.keywords)) corpus.keywords = loaded.keywords;
  if (Array.isArray(loaded.regex)) corpus.regex = loaded.regex;
} catch {}

const BUILTIN = [
  '크랙', '유료 잠금', '결제 우회', '라이선스 우회', '인증 우회', '로그인 우회',
  '인증 분기 위치', '항상 true 반환하게', '토큰 추출해', '키 추출해', '비밀번호 추출해',
  'license bypass', 'bypass authentication', 'auth bypass', 'keygen',
  'always return true', 'nop the check', 'patch the check',
];
const keywords = corpus.keywords.length ? corpus.keywords : BUILTIN;

for (const kw of keywords) {
  if (typeof kw === 'string' && kw && hay.includes(kw.toLowerCase())) {
    deny(`금지 범위(크랙·우회·키/토큰 추출 등)로 의심되어 차단했습니다. 이 도구는 방어·교육·본인 소유물 분석 전용입니다. (감지 단서: "${kw}")`);
  }
}
for (const rx of corpus.regex) {
  try { if (new RegExp(rx, 'i').test(haystack)) deny('금지 범위로 의심되는 패턴을 차단했습니다(정규식 규칙). 방어·교육 전용입니다.'); } catch {}
}
passThrough();
