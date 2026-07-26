#!/usr/bin/env node
/**
 * rotate-safety-log.mjs — .sodam-re/safety-log.jsonl 보존기간 관리 (PRD 02_DATA_MODEL §M7).
 *
 * 안전로그는 원문 대신 해시만 저장하지만(자기부죄 방지 1차), reason 필드에는
 * 어떤 유형의 요청이 차단됐는지 알아볼 수 있는 문구가 남는다. 파일이 무기한 쌓이면
 * "이 사용자가 특정 유형의 시도를 언제·몇 번 했는가"라는 타임라인 자체가 노출 위험이 된다.
 * 이 스크립트는 오래된 항목을 삭제해 그 위험을 줄인다(자기부죄 방지 2차).
 *
 * 수동 실행 도구(자동 hook 아님) — check-family.mjs·check-trust-freshness.mjs와 동일한
 * 위치의 진단/유지보수 스크립트. 안전 3층 판정 로직에는 관여하지 않는다(로그는 기록용일 뿐).
 *
 * 실행: node scripts/rotate-safety-log.mjs [--days=30] [--dry-run]
 *   --days=N   보존 일수(기본 30). PRD가 특정 숫자를 지정하지 않아 권장값으로 둔 것 — 필요시 조정.
 *   --dry-run  실제로 지우지 않고 몇 줄이 삭제 대상인지만 미리 보여준다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const LOG_PATH = resolve(__dir, '..', '.sodam-re', 'safety-log.jsonl');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const daysArg = args.find((a) => a.startsWith('--days='));
const RETENTION_DAYS = daysArg ? Number(daysArg.slice('--days='.length)) : 30;

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) {
  console.error('❌ --days 값이 올바르지 않습니다(양의 정수를 넣어주세요). 예: --days=30');
  process.exit(1);
}

function filterByRetention(lines, retentionDays, nowMs) {
  const cutoff = nowMs - retentionDays * 86_400_000;
  const kept = [];
  const dropped = [];
  let malformed = 0;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const t = Date.parse(entry.occurred_at);
      // occurred_at이 없거나 해석 불가하면 "오래됨"으로 단정하지 않고 보존한다(안전 쪽으로 기본값).
      if (Number.isFinite(t) && t < cutoff) dropped.push(line);
      else kept.push(line);
    } catch {
      // 손상된 줄도 삭제 대신 보존 — 데이터 유실보다 침묵 실패 방지가 우선.
      malformed++;
      kept.push(line);
    }
  }
  return { kept, dropped, malformed };
}

if (!existsSync(LOG_PATH)) {
  console.log(`ℹ️  안전로그 파일이 아직 없습니다(차단 이력 없음): ${LOG_PATH}`);
  process.exit(0);
}

const raw = readFileSync(LOG_PATH, 'utf8');
const lines = raw.split('\n').filter((l) => l.trim());
const { kept, dropped, malformed } = filterByRetention(lines, RETENTION_DAYS, Date.now());

console.log(`🗂️  안전로그 보존기간 점검 (기준: ${RETENTION_DAYS}일)`);
console.log(
  `   전체 ${lines.length}줄 — 유지 ${kept.length}줄 / 삭제대상 ${dropped.length}줄` +
    (malformed ? ` / 해석불가(보존) ${malformed}줄` : '')
);

if (dropped.length === 0) {
  console.log('✅ 삭제할 만큼 오래된 항목이 없습니다.');
  process.exit(0);
}

if (dryRun) {
  console.log('🔎 --dry-run: 미리보기만 표시했습니다(실제 삭제 없음). 적용하려면 --dry-run 없이 다시 실행하세요.');
  process.exit(0);
}

writeFileSync(LOG_PATH, kept.length ? kept.join('\n') + '\n' : '', 'utf8');
console.log(`🧹 ${dropped.length}줄 삭제 완료(원문이 아닌 해시만 있던 항목입니다). 안전 3층 차단 판정에는 영향 없습니다.`);
