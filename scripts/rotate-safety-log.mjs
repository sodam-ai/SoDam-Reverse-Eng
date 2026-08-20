#!/usr/bin/env node
/**
 * rotate-safety-log.mjs — `.sodam-re/`의 안전로그·동의기록 보존기간 관리 (PRD 02_DATA_MODEL §M7).
 *
 * 안전로그(safety-log.jsonl)는 원문 대신 해시만 저장하지만(자기부죄 방지 1차), reason 필드에는
 * 어떤 유형의 요청이 차단됐는지 알아볼 수 있는 문구가 남는다. 파일이 무기한 쌓이면
 * "이 사용자가 특정 유형의 시도를 언제·몇 번 했는가"라는 타임라인 자체가 노출 위험이 된다.
 * 동의기록(consent-log.jsonl)은 자기부죄 성격은 약하지만(§5-36: target_scope 평문 저장이 의도적
 * 설계 — "동의 증빙"이 목적) 마찬가지로 무기한 누적되면 "언제 무엇을 분석했는가"라는 이용 이력
 * 타임라인이 남는다. 이 스크립트는 두 로그 모두 오래된 항목을 삭제해 그 위험을 줄인다.
 *
 * 수동 실행 도구(자동 hook 아님) — check-family.mjs·check-trust-freshness.mjs와 동일한
 * 위치의 진단/유지보수 스크립트. 안전 3층 판정 로직에는 관여하지 않는다(로그는 기록용일 뿐).
 *
 * 실행: node scripts/rotate-safety-log.mjs [--days=30] [--dry-run] [--only=safety|consent]
 *   --days=N   보존 일수(기본 30, 두 로그 공통). PRD가 특정 숫자를 지정하지 않아 권장값으로 둔 것.
 *   --dry-run  실제로 지우지 않고 몇 줄이 삭제 대상인지만 미리 보여준다.
 *   --only=X   기본은 두 로그 모두 처리. 하나만 처리하려면 safety 또는 consent 지정.
 */
import { readFileSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const SODAM_RE_DIR = resolve(__dir, '..', '.sodam-re');

// 로그마다 저장 방식이 다르므로(해시 vs 평문, §5-4/§5-36 각각의 설계 근거 그대로) 시각 필드만
// 다르게 지정하고 삭제 로직 자체는 공유한다.
const TARGETS = [
  { key: 'safety', label: '안전로그', file: 'safety-log.jsonl', timeField: 'occurred_at' },
  { key: 'consent', label: '동의기록', file: 'consent-log.jsonl', timeField: 'agreed_at' },
];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const daysArg = args.find((a) => a.startsWith('--days='));
const RETENTION_DAYS = daysArg ? Number(daysArg.slice('--days='.length)) : 30;
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice('--only='.length) : null;

if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS <= 0) {
  console.error('❌ --days 값이 올바르지 않습니다(양의 정수를 넣어주세요). 예: --days=30');
  process.exit(1);
}
if (only && !TARGETS.some((t) => t.key === only)) {
  console.error(`❌ --only 값이 올바르지 않습니다(safety 또는 consent). 예: --only=consent`);
  process.exit(1);
}

function filterByRetention(lines, retentionDays, nowMs, timeField) {
  const cutoff = nowMs - retentionDays * 86_400_000;
  const kept = [];
  const dropped = [];
  let malformed = 0;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const t = Date.parse(entry[timeField]);
      // 시각 필드가 없거나 해석 불가하면 "오래됨"으로 단정하지 않고 보존한다(안전 쪽으로 기본값).
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

function processTarget(target) {
  const logPath = resolve(SODAM_RE_DIR, target.file);
  console.log(`\n🗂️  ${target.label} 보존기간 점검 (${target.file}, 기준: ${RETENTION_DAYS}일)`);

  if (!existsSync(logPath)) {
    console.log(`ℹ️  ${target.label} 파일이 아직 없습니다(기록 없음): ${logPath}`);
    return { ok: true };
  }

  let raw;
  try {
    raw = readFileSync(logPath, 'utf8');
  } catch (e) {
    console.error(`❌ ${target.label} 파일을 읽지 못했습니다: ${e.message}`);
    return { ok: false };
  }
  const lines = raw.split('\n').filter((l) => l.trim());
  const { kept, dropped, malformed } = filterByRetention(lines, RETENTION_DAYS, Date.now(), target.timeField);

  console.log(
    `   전체 ${lines.length}줄 — 유지 ${kept.length}줄 / 삭제대상 ${dropped.length}줄` +
      (malformed ? ` / 해석불가(보존) ${malformed}줄` : '')
  );

  if (dropped.length === 0) {
    console.log('✅ 삭제할 만큼 오래된 항목이 없습니다.');
    return { ok: true };
  }

  if (dryRun) {
    console.log('🔎 --dry-run: 미리보기만 표시했습니다(실제 삭제 없음). 적용하려면 --dry-run 없이 다시 실행하세요.');
    return { ok: true };
  }

  // 임시파일→rename으로 쓰기 자체는 원자적으로 처리(교체 도중 프로세스 종료·손상 방지).
  // 읽기~rename 사이의 좁은 구간에 새 로그 줄이 추가되면 그 줄만 유실될 잔여 위험은 남지만,
  // 수동 실행·1인 로컬 환경 기준으로 낮은 위험으로 판단해 락 없이 이 수준까지만 개선한다.
  try {
    const tmpPath = `${logPath}.tmp-${process.pid}`;
    writeFileSync(tmpPath, kept.length ? kept.join('\n') + '\n' : '', 'utf8');
    renameSync(tmpPath, logPath);
  } catch (e) {
    console.error(`❌ ${target.label} 파일 쓰기에 실패했습니다: ${e.message}`);
    return { ok: false };
  }
  console.log(`🧹 ${dropped.length}줄 삭제 완료. 안전 3층 차단 판정에는 영향 없습니다(이 로그는 기록용).`);
  return { ok: true };
}

const targets = only ? TARGETS.filter((t) => t.key === only) : TARGETS;
const results = targets.map(processTarget);

if (results.some((r) => !r.ok)) process.exit(1);
