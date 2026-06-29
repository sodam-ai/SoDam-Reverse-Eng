#!/usr/bin/env node
/**
 * check-trust-freshness.mjs — PRD 04_PROJECT_SPEC §H8
 *
 * trust-catalog.md는 스냅샷(2026-06-28 실측). 이 스크립트는 gh CLI로
 * last_commit·archived 상태를 재확인하고 오래된/폐기된 항목을 경고한다.
 *
 * 실행: node scripts/check-trust-freshness.mjs
 * 필요: gh CLI 인증 완료(gh auth status), Node.js v18+
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = resolve(__dir, '..', 'references', 'trust-catalog.md');
const STALE_DAYS   = 180; // 6개월 이상 커밋 없으면 경고
const log = (msg) => process.stdout.write(msg + '\n');

// trust-catalog.md에서 GitHub owner/repo 슬러그 추출
// 두 가지 형식 지원:
//   1) github.com/owner/repo (URL 형식)
//   2) | owner/repo | ... (마크다운 표 첫 번째 열 형식)
function extractRepos(md) {
  const seen = new Set();
  const VALID = /^[\w][\w\-.]{0,38}\/[\w][\w\-.]{0,100}$/;

  // 형식 1: github.com/owner/repo
  const urlPat = /github\.com\/([\w\-.]+\/[\w\-.]+)/g;
  let m;
  while ((m = urlPat.exec(md)) !== null) {
    const slug = m[1].replace(/\.git$/, '').replace(/[)\]"'`]/g, '');
    if (VALID.test(slug) && !seen.has(slug)) seen.add(slug);
  }

  // 형식 2: 표 셀 owner/repo (| owner/repo | 형식)
  const tablePat = /\|\s*([\w][\w\-.]{0,38}\/[\w][\w\-.]{0,100})\s*\|/g;
  while ((m = tablePat.exec(md)) !== null) {
    const slug = m[1].trim();
    if (VALID.test(slug) && !seen.has(slug)) seen.add(slug);
  }

  return [...seen];
}

// gh CLI로 repo 정보 조회 — 인자 배열 사용(명령어 주입 방지)
function fetchRepoInfo(slug) {
  try {
    const raw = execFileSync(
      'gh',
      ['repo', 'view', slug, '--json', 'pushedAt,isArchived,name'],
      { encoding: 'utf8', timeout: 12_000 }
    );
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function daysSince(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
let catalog;
try {
  catalog = readFileSync(CATALOG_PATH, 'utf8');
} catch {
  log(`❌ 카탈로그 파일 없음: ${CATALOG_PATH}`);
  process.exit(1);
}

const repos = extractRepos(catalog);
if (repos.length === 0) {
  log('ℹ️  카탈로그에서 GitHub 저장소를 찾지 못했습니다.');
  process.exit(0);
}

log('\n═══════════════════════════════════════════════════');
log(`  trust-catalog 신선도 점검  (${repos.length}개 저장소)`);
log(`  기준: ${STALE_DAYS}일 이상 업데이트 없으면 ⚠️`);
log('═══════════════════════════════════════════════════\n');

let warned = 0;
for (const slug of repos) {
  const info = fetchRepoInfo(slug);
  if (!info) {
    log(`  ❓ ${slug}  — gh API 조회 실패 (gh 인증 또는 네트워크 문제)`);
    continue;
  }
  const days = daysSince(info.pushedAt);
  if (info.isArchived) {
    log(`  🚫 ${slug}  — archived(폐기) 감지 → trust-catalog에서 제외 필요`);
    warned++;
  } else if (days >= STALE_DAYS) {
    log(`  ⚠️  ${slug}  — 마지막 업데이트 ${days}일 전 (기준: ${STALE_DAYS}일)`);
    warned++;
  } else {
    log(`  ✅ ${slug}  — ${days}일 전 업데이트 (정상)`);
  }
}

log('');
if (warned > 0) {
  log(`⚠️  ${warned}개 항목 재검토 필요. references/trust-catalog.md를 업데이트하세요.`);
} else {
  log(`✅ 모든 저장소 신선 (${STALE_DAYS}일 기준).`);
}
log('');
