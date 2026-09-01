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

// [2026-08-31, §5-92 5-92-3] deny 메시지가 "방어·교육 전용입니다"로만 끝나 다음 행동 안내가 없던 문제 —
// 오탐이면 사람이 이 문서(SETUP_BLOCKED_FILES.md) 상단 절차대로 직접 판단·진행할 수 있음을 안내한다.
// AI가 스스로 이 안내를 따라 우회하는 것은 불가(보호파일은 여전히 AI 편집 대상 밖) — 사람 전용 경로만 연다.
const ESCAPE_HATCH = ' 실제로 정당한 방어·교육 목적인데 오탐이라면, 사람이 이 문서의 절차대로 직접 진행하세요.';
function deny(reason) {
  logSafetyEvent(reason);
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `${TAG} ${reason}${ESCAPE_HATCH}` },
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

// [2026-08-31, CHECKPOINT §5-91/92 R0 대응] "실행 요청"과 "개념을 글로 옮겨 적는 것"을 구분하지 못해
// .md 문서 편집(코드 실행 없음)까지 막히는 과차단이 실측 4회 재현됨(§5-92, 이번 패치 작성 시도 자체도 재현).
// Bash 등 실제 도구 호출은 이 예외의 대상이 아니다 — 오직 .md Write/Edit/MultiEdit만 판정 범위를 좁힌다.
const toolName = payload.tool_name || payload.toolName || '';
const isDocOnlyEdit = ['Write', 'Edit', 'MultiEdit'].includes(toolName)
  && typeof ti.file_path === 'string' && /\.md$/i.test(ti.file_path);

// 우회 방지(2026-07-12, 4차 레드팀 감사 반영): 제로폭 문자 제거 + 유니코드 정규화(전각→반각 등) +
// 라틴 문자와 자주 혼동되는 키릴 유사문자(homoglyph) 치환. 실제 우회 실증(전각문자·제로폭문자·유사문자 삽입)에 대응.
// \u 이스케이프 코드로만 지정(눈에 안 보이는 문자를 소스에 직접 넣지 않음 — 검증 가능성 확보).
const ZERO_WIDTH_RE = new RegExp('[\\u200B\\u200C\\u200D\\uFEFF]', 'g');
const CYRILLIC_MAP = { 'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y', 'і': 'i', 'ѕ': 's', 'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'Х': 'X' };
const CYRILLIC_RANGE_RE = new RegExp('[\\u0400-\\u04FF]', 'g');
function normalizeForMatch(s) {
  let out = s.normalize('NFKC').replace(ZERO_WIDTH_RE, '');
  out = out.replace(CYRILLIC_RANGE_RE, (ch) => CYRILLIC_MAP[ch] || ch);
  return out;
}
haystack = normalizeForMatch(haystack);
const hay = haystack.toLowerCase();

const here = dirname(fileURLToPath(import.meta.url));
let corpus = { keywords: [], regex: [], ambiguousKeywords: [], ambiguousRegexIndices: [] };
try {
  const loaded = JSON.parse(readFileSync(join(here, '..', 'references', 'deny-corpus.json'), 'utf8'));
  if (Array.isArray(loaded.keywords)) corpus.keywords = loaded.keywords;
  if (Array.isArray(loaded.regex)) corpus.regex = loaded.regex;
  if (Array.isArray(loaded.ambiguousKeywords)) corpus.ambiguousKeywords = loaded.ambiguousKeywords;
  if (Array.isArray(loaded.ambiguousRegexIndices)) corpus.ambiguousRegexIndices = loaded.ambiguousRegexIndices;
} catch {}

const BUILTIN = [
  '크랙', '유료 잠금', '결제 우회', '라이선스 우회', '인증 우회', '로그인 우회',
  '인증 분기 위치', '항상 true 반환하게', '토큰 추출해', '키 추출해', '비밀번호 추출해',
  'license bypass', 'bypass authentication', 'auth bypass', 'keygen',
  'always return true', 'nop the check', 'patch the check',
];
const keywords = corpus.keywords.length ? corpus.keywords : BUILTIN;
const AMBIGUOUS_KEYWORDS = new Set(corpus.ambiguousKeywords);
const AMBIGUOUS_REGEX_INDICES = new Set(corpus.ambiguousRegexIndices);

// [2026-07-14, §5-11 실사용 결함 수정] 라이브 테스트(F-Droid 계산기 앱 분석)에서 deny-hook이 AI 자신의
// "크랙 방지 코드가 없다"는 정상 관찰 서술을 2회 차단해 최종 보고서에서 해당 내용이 통째로 빠지는 결함이
// 발견됨. "위험 요청"과 "정상 부재 관찰"을 좁게 구분한다 — 완화는 아래 화이트리스트(코퍼스의
// ambiguousKeywords/ambiguousRegexIndices, 명령형 어미가 없는 "우회/크랙 개념 명사구"만) 대상으로만 적용.
// 토큰/키/비밀번호/개인정보 "추출" 계열(PRD 01§6 Out-of-Scope 최고위험군)과 코드패턴 정규식은 절대 완화하지
// 않음. 격리 프로토타입 38개 케이스(§5-11 과차단 5건 PASS + §5-8 레드팀·양보절스머글링·24종 전수스윕 33건
// DENY)로 검증 완료 — §5-8에서 닫은 우회 경로를 재개방하지 않음.
const NEGATION_MARKERS = [
  '없음', '없습니다', '없다', '없었', '없는', '없이', '없고',
  '아님', '아니다', '아니었', '아니에요', '아닙니다',
  '발견되지 않', '발견 안', '찾지 못', '못 찾', '확인되지 않', '확인 안',
  '불가능', '존재하지 않',
  'not found', 'no evidence', 'none found', 'absent', 'not present',
  'does not contain', "doesn't contain", 'not detected', 'no sign of', 'not identified',
];
const UNCERTAINTY_MARKERS = [
  '단정 불가', '확인 필요', '전문가 확인', '판단 불가', '불확실', '추정',
  'uncertain', 'not certain', 'requires expert', 'cannot confirm',
];
const SAFE_CONTEXT_MARKERS = [...NEGATION_MARKERS, ...UNCERTAINTY_MARKERS];
const REQUEST_MARKERS = [
  '해줘', '해주세요', '알려줘', '알려주세요', '방법', '부탁', '좀 해', '어떻게 해',
  '시켜줘', '시켜', '하는 법', '알려 주',
  'please', 'how to', 'tell me', 'show me', 'give me', 'way to', 'method to',
];
// [2026-08-31, §5-92 R0] 자격정보 관련 최고위험군 키워드는 .md 문서 안에서도 절대 완화하지 않는다.
function isExtractionTier(kw) {
  const k = kw.toLowerCase();
  return k.includes('추출') || k.includes('extract');
}

function isSafeObservation(text, matchIndex, matchLen) {
  // [2026-08-13 수정] NEG_WINDOW 20/beforeCtx 6은 한국어 후치부정("~이 없습니다")엔 맞지만
  // 영어 전치부정("does not contain X", "I confirmed X is not present")처럼 부정어와 대상 사이에
  // 단어가 몇 개 끼는 문장에서 창이 너무 좁아 정상 관찰까지 차단하는 실사용 결함이 실측으로
  // 발견됨(재현: "this code does not contain any <키워드> logic." 류가 오탐 차단됨).
  // 30/30으로 넓혀 해결하되, beforeCtx만 넓히면 "not present, give me <키워드>"처럼 부정어+요청어를
  // 매치 앞쪽에 둘 다 배치하는 새 스머글링 경로가 열리는 것을 격리 테스트로 확인 →
  // 요청표지 검사(wideCtx)도 같은 폭만큼 매치 앞쪽까지 함께 확장해 막는다.
  const NEG_WINDOW = 30, BEFORE_WINDOW = 30, REQ_WINDOW = 40;
  const afterStart = matchIndex + matchLen;
  const afterCtx = text.slice(afterStart, afterStart + NEG_WINDOW);
  const beforeCtx = text.slice(Math.max(0, matchIndex - BEFORE_WINDOW), matchIndex);
  const hasSafeMarker = SAFE_CONTEXT_MARKERS.some((n) => afterCtx.includes(n) || beforeCtx.includes(n));
  if (!hasSafeMarker) return false;
  const wideCtx = text.slice(Math.max(0, matchIndex - BEFORE_WINDOW), afterStart + REQ_WINDOW);
  return !REQUEST_MARKERS.some((r) => wideCtx.includes(r));
}

for (const kw of keywords) {
  if (typeof kw !== 'string' || !kw) continue;
  // [2026-08-31, §5-92 R0] .md 문서 편집이고 최고위험군이 아니면 이 키워드는 아예 건너뛴다
  // (실행되는 것이 없는 문서에서 개념을 언급하는 것 자체는 위험하지 않다는 §5-92 판단).
  if (isDocOnlyEdit && !isExtractionTier(kw)) continue;
  const kwLower = kw.toLowerCase();
  let searchFrom = 0, idx;
  while ((idx = hay.indexOf(kwLower, searchFrom)) !== -1) {
    const ambiguous = AMBIGUOUS_KEYWORDS.has(kw);
    if (!ambiguous || !isSafeObservation(hay, idx, kwLower.length)) {
      deny(`금지 범위(크랙·우회·키/토큰 추출 등)로 의심되어 차단했습니다. 이 도구는 방어·교육·본인 소유물 분석 전용입니다. (감지 단서: "${kw}")`);
    }
    searchFrom = idx + kwLower.length;
  }
}
for (let i = 0; i < corpus.regex.length; i++) {
  let re;
  try { re = new RegExp(corpus.regex[i], 'gi'); } catch { continue; }
  let m;
  while ((m = re.exec(haystack)) !== null) {
    const ambiguous = AMBIGUOUS_REGEX_INDICES.has(i);
    if (!ambiguous || !isSafeObservation(hay, m.index, m[0].length)) {
      deny('금지 범위로 의심되는 패턴을 차단했습니다(정규식 규칙). 방어·교육 전용입니다.');
    }
    if (m.index === re.lastIndex) re.lastIndex++;
  }
}
passThrough();