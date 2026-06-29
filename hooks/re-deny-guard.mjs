#!/usr/bin/env node
/**
 * sodam-reverse :: re-deny-guard.mjs — 안전 3층 중 [2층] deny-hook.
 * 크랙·인증/라이선스 우회·키/토큰 추출 등 금지 범위 도구 호출을 차단.
 * 원칙: 1차 방어는 AI 출력거부(스킬). 이 hook은 2차. fail-closed(판단불가 시 차단). 과차단 최소화(좁은 패턴).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const TAG = '[sodam-reverse]';
function deny(reason) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${TAG} ${reason}` },
  }));
  process.exit(0);
}
function passThrough() { process.exit(0); }

let raw = '';
try { raw = readFileSync(0, 'utf8'); }
catch { deny('안전검사 입력을 읽지 못했습니다(fail-closed). /re-selftest 또는 재설치를 권장합니다.'); }

let payload;
try { payload = raw.trim() ? JSON.parse(raw) : {}; }
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
