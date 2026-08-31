#!/usr/bin/env node
/**
 * sodam-reverse :: apply-6th-patch.mjs
 *
 * SETUP_BLOCKED_FILES.md의 4)·5) 코드블록(5번째+6번째 패치 반영본, CHECKPOINT §5-49·§5-93)을
 * 실제 보호파일(hooks/re-deny-guard.mjs, hooks/_selftest.mjs)에 그대로 적용한다.
 *
 * 이 스크립트는 "사람이 실행"하는 용도다 — AI가 이 스크립트를 대신 실행하지 않는다(보호파일
 * 자기수정의 구조적 자기모순, CHECKPOINT §5-51). 목적은 지금까지 수동 복사·붙여넣기에서
 * 실제로 발생했던 사고(§5-27 BOM 오염, §5-14 부분 적용, §5-18 오래된 해시 재사용, §5-14 순서 오류)를
 * 자동화로 원천 차단하는 것뿐 — 새 판정 로직을 이 스크립트가 짓지 않는다(SETUP_BLOCKED_FILES.md가
 * 유일한 정본, 이 스크립트는 그 정본을 그대로 옮기기만 한다).
 *
 * 실행: node scripts/apply-6th-patch.mjs
 * 순서(고정): 잠금해제 → 교체 → 해시재계산 → integrity.json 갱신 → 재잠금 → 셀프테스트.
 */
import { readFileSync, writeFileSync, chmodSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const abs = (rel) => join(root, ...rel.split('/'));

const doc = readFileSync(abs('SETUP_BLOCKED_FILES.md'), 'utf8');

function extractCodeBlock(headingText) {
  // 정확한 "## N) `경로`" 헤딩 줄부터 찾는다(단순 문자열 언급과 혼동 방지) + 펜스는
  // 개행이 바로 뒤따르는 정확한 ```js 만 인정한다(```json이 ```js를 부분포함하는 함정 회피).
  const headingRe = new RegExp('^## \\d+\\) `' + headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '`', 'm');
  const headingMatch = headingRe.exec(doc);
  if (!headingMatch) throw new Error(`문서에서 섹션 헤딩을 찾지 못했습니다: ${headingText}`);
  const searchFrom = headingMatch.index + headingMatch[0].length;
  const fenceRe = /```js\r?\n/g;
  fenceRe.lastIndex = searchFrom;
  const fenceMatch = fenceRe.exec(doc);
  if (!fenceMatch) throw new Error(`코드펜스 시작을 찾지 못했습니다: ${headingText}`);
  const codeStart = fenceMatch.index + fenceMatch[0].length;
  const fenceEnd = doc.indexOf('\n```', codeStart);
  if (fenceEnd === -1) throw new Error(`코드펜스 끝을 찾지 못했습니다: ${headingText}`);
  return doc.slice(codeStart, fenceEnd).replace(/\r\n/g, '\n');
}

const guardCode = extractCodeBlock('hooks/re-deny-guard.mjs');
const selftestCode = extractCodeBlock('hooks/_selftest.mjs');

if (!guardCode.includes('isDocOnlyEdit') || !selftestCode.includes('R0 회귀')) {
  console.error('추출한 코드블록에 예상한 패치 흔적이 없습니다 — SETUP_BLOCKED_FILES.md 구조가 바뀐 것으로 보입니다. 중단합니다.');
  process.exit(1);
}

const PROTECTED = [
  'hooks/hooks.json',
  'hooks/re-deny-guard.mjs',
  'hooks/_selftest.mjs',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  'references/deny-corpus.json',
  'references/mask-patterns.json',
  'references/integrity.json',
];

console.log('1) 8개 보호파일 잠금 해제...');
for (const rel of PROTECTED) chmodSync(abs(rel), 0o666);

console.log('2) hooks/re-deny-guard.mjs, hooks/_selftest.mjs 교체 (UTF-8, BOM 없음)...');
writeFileSync(abs('hooks/re-deny-guard.mjs'), guardCode, 'utf8');
writeFileSync(abs('hooks/_selftest.mjs'), selftestCode, 'utf8');

console.log('3) 방금 저장한 그대로 SHA-256 재계산 (옛 해시 재사용 없음)...');
const hashOf = (rel) => createHash('sha256').update(readFileSync(abs(rel))).digest('hex');
const integrityPath = abs('references/integrity.json');
const integrity = JSON.parse(readFileSync(integrityPath, 'utf8'));
integrity['hooks/re-deny-guard.mjs'] = hashOf('hooks/re-deny-guard.mjs');
integrity['hooks/_selftest.mjs'] = hashOf('hooks/_selftest.mjs');
writeFileSync(integrityPath, JSON.stringify(integrity, null, 2) + '\n', 'utf8');

console.log('4) 8개 보호파일 재잠금...');
for (const rel of PROTECTED) chmodSync(abs(rel), 0o444);

console.log('5) 셀프테스트 실행...\n');
try {
  const out = execFileSync('node', [abs('hooks/_selftest.mjs')], { encoding: 'utf8' });
  console.log(out);
  console.log('완료 — 위 결과에 실패(❌)가 0개면 정상 적용된 것입니다.');
} catch (e) {
  console.log(e.stdout || '');
  console.error('\n⚠️ 셀프테스트가 실패를 보고했습니다. 위 출력에서 실패 항목을 확인하세요.');
  process.exitCode = 1;
}
