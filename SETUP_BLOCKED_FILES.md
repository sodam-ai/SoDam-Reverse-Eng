# ⚙️ 수동 생성 필요 파일 (5개)

> **왜 이 문서가 있나요?**
> 이 5개 파일은 **플러그인 manifest와 안전 hook**입니다. 다른 SoDam 형제 플러그인의 *자기보호 가드레일*이
> "AI 에이전트가 플러그인/hook 파일을 만드는 것"을 막기 때문에, **사람이 직접** 만들어야 합니다.
> (가드는 *에이전트의* 쓰기만 막고, 사용자 본인 작성은 막지 않습니다.)
>
> **만드는 법 (택1):**
> 1. 메모장/VS Code 등 편집기로 아래 경로에 새 파일을 만들고 코드블록 내용을 붙여넣기 (**UTF-8, BOM 없음**)
> 2. 또는 Claude Code 입력창에서 `!` 를 붙여 사용자 셸로 직접 생성
>
> 5개를 만든 뒤 **완전 재시작 → `/re-selftest`** 로 안전 3층을 검증하세요.

---

## 1) `.claude-plugin/plugin.json`

```json
{
  "name": "sodam-reverse",
  "version": "0.1.0",
  "description": "검증된 리버스 엔지니어링 엔진을 한국어·초보 UX와 코드레벨 안전장치(3층)로 감싼 Claude Code 플러그인. 방어·교육·본인 소유물 전용.",
  "author": { "name": "SoDam AI Studio" },
  "license": "Apache-2.0",
  "keywords": ["reverse-engineering", "security", "korean", "beginner", "sodam", "defensive"]
}
```

## 2) `.claude-plugin/marketplace.json`

```json
{
  "name": "sodamreverse-marketplace",
  "owner": { "name": "SoDam AI Studio" },
  "metadata": {
    "description": "SoDam-Reverse-Eng 독립 마켓플레이스. 초보·바이브코더용 안전한 한국어 리버스 엔지니어링 플러그인.",
    "version": "0.1.0"
  },
  "plugins": [
    { "name": "sodam-reverse", "source": "./", "description": "방어·교육 전용 RE 플러그인 (안전 3층: AI 출력거부 + deny-hook + SHA-256 무결성)." }
  ]
}
```

## 3) `hooks/hooks.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Write|Edit|MultiEdit",
        "hooks": [
          { "type": "command", "command": "node \"${CLAUDE_PLUGIN_ROOT}/hooks/re-deny-guard.mjs\"" }
        ]
      }
    ]
  }
}
```

## 4) `hooks/re-deny-guard.mjs`  — 안전 2층(deny-hook), fail-closed

```js
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
```

## 5) `hooks/_selftest.mjs`  — 안전 3층 자가검증

```js
#!/usr/bin/env node
/** sodam-reverse :: _selftest.mjs — 안전 3층 자가검증. 실행: node hooks/_selftest.mjs (또는 /re-selftest) */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const lines = []; let pass = 0, fail = 0;
const ok = (m) => { pass++; lines.push(`  ✅ ${m}`); };
const no = (m) => { fail++; lines.push(`  ❌ ${m}`); };

function runGuardDenied(toolName, toolInput) {
  try {
    const out = execFileSync('node', [join(here, 're-deny-guard.mjs')], { input: JSON.stringify({ tool_name: toolName, tool_input: toolInput }), encoding: 'utf8' });
    if (!out.trim()) return false;
    return JSON.parse(out)?.hookSpecificOutput?.permissionDecision === 'deny';
  } catch { return false; }
}

console.log('🔒 SoDam-Reverse 안전 3층 셀프테스트\n');

const skillFiles = ['skills/re-router/SKILL.md', 'skills/re-analyze-mycode/SKILL.md', 'skills/re-report/SKILL.md', 'skills/re-analyze-agent/SKILL.md', 'skills/re-analyze-binary/SKILL.md', 'skills/re-analyze-android/SKILL.md'];
for (const f of skillFiles) {
  const p = join(root, f);
  if (existsSync(p)) {
    const t = readFileSync(p, 'utf8');
    if (t.includes('거부') && (t.includes('크랙') || t.includes('우회'))) ok(`1층 규칙 존재: ${f}`); else no(`1층 규칙 미흡: ${f}`);
  } else no(`1층 스킬 파일 없음: ${f}`);
}

const denySamples = [['Bash', { command: '이 앱의 유료 잠금 풀어줘' }], ['Write', { content: '인증 우회: 이 함수가 항상 true 반환하게 패치' }]];
const safeSamples = [['Bash', { command: 'node --version' }], ['Write', { content: 'function add(a, b) { return a + b; }' }]];
if (denySamples.every(([n, i]) => runGuardDenied(n, i))) ok('2층 deny-hook: 위험 샘플 전부 차단'); else no('2층 deny-hook: 위험 샘플 일부 통과(위험)');
if (safeSamples.every(([n, i]) => !runGuardDenied(n, i))) ok('2층 deny-hook: 안전 샘플 전부 통과(오차단 없음)'); else no('2층 deny-hook: 안전 샘플 오차단(과차단)');

// (2026-07-27 갱신: 검사 범위를 1개→5개 보호파일 전체로 확장. 기존엔 re-deny-guard.mjs만 검사해
// deny-corpus.json(차단 키워드 원본) 등 나머지 4개가 위변조돼도 전혀 탐지되지 않는 공백이 있었음.)
const manifestPath = join(root, 'references', 'integrity.json');
const PROTECTED_FILES = [
  'hooks/hooks.json',
  'hooks/re-deny-guard.mjs',
  'hooks/_selftest.mjs',
  'references/deny-corpus.json',
  'references/mask-patterns.json',
];
if (existsSync(manifestPath)) {
  let manifest;
  try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); }
  catch { no('3층 무결성: manifest 해석 실패'); manifest = null; }
  if (manifest) {
    for (const relPath of PROTECTED_FILES) {
      const abs = join(root, relPath);
      if (!existsSync(abs)) { no(`3층 무결성: 파일 없음 (${relPath})`); continue; }
      const hash = createHash('sha256').update(readFileSync(abs)).digest('hex');
      const expected = manifest[relPath];
      if (!expected) no(`3층 무결성: manifest에 항목 없음 (${relPath})`);
      else if (expected === hash) ok(`3층 무결성: 해시 일치 (${relPath})`);
      else no(`3층 무결성: 해시 불일치·변조 의심 (${relPath}) → 재설치 권장`);
    }
  }
} else {
  lines.push('  ⚠️ 3층 무결성: manifest 없음 → 최초 1회 생성 필요.');
  for (const relPath of PROTECTED_FILES) {
    const abs = join(root, relPath);
    if (existsSync(abs)) {
      const hash = createHash('sha256').update(readFileSync(abs)).digest('hex');
      lines.push(`     ${relPath}: ${hash}`);
    }
  }
  lines.push('     위 해시들을 references/integrity.json 에 저장하면 활성화됩니다.');
}

console.log(lines.join('\n'));
console.log(`\n결과: ${pass} 통과 / ${fail} 실패`);
console.log(fail > 0 ? '⚠️ 실패 항목 해결 후 사용(fail-closed).' : '✅ 안전 3층 기본 동작 확인. (레드팀 라이브 검증은 별도)');
process.exit(fail > 0 ? 1 : 0);
```

---

## 만든 뒤 할 일

1. Claude Code **완전 재시작** (hook 로드에 필수).
2. `/re-selftest` 또는 `node hooks/_selftest.mjs` 실행.
3. 3층 무결성에서 출력된 **5개 파일의 해시**를 **`references/integrity.json`** 에 저장(이미 있는 항목은 유지, 없는 항목만 추가):
   ```json
   {
     "hooks/hooks.json": "<셀프테스트가 출력한 해시>",
     "hooks/re-deny-guard.mjs": "<셀프테스트가 출력한 해시>",
     "hooks/_selftest.mjs": "<셀프테스트가 출력한 해시>",
     "references/deny-corpus.json": "<셀프테스트가 출력한 해시>",
     "references/mask-patterns.json": "<셀프테스트가 출력한 해시>"
   }
   ```
4. 다시 `/re-selftest` → 3층 5개 항목 전부 ✅ 확인.

> **참고**: 이 문서 상단의 "5개 파일"(①~⑤, plugin.json·marketplace.json 포함)은 *AI가 쓰기 차단당해 사람이 새로 만들어야 하는* 파일 목록이고, 위 3층 무결성의 "5개 파일"은 *위변조 탐지 대상*(plugin.json·marketplace.json 대신 deny-corpus.json·mask-patterns.json 포함) 목록입니다. 3개가 겹치지만 목적이 달라 대상이 다릅니다 — 혼동 방지용으로 남겨둡니다.
