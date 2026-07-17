#!/usr/bin/env node
/**
 * re-local-install.mjs
 * SoDam-Reverse 로컬 설치 스크립트
 *
 * 마켓플레이스 배포 전 테스트용.
 * ~/.claude/plugins/sodam-reverse/ 에만 설치해 어느 폴더에서나 `/sodam-reverse:커맨드명` 형태로 동작하게 함.
 *
 * [2026-07-17] 이전엔 ~/.claude/skills/·~/.claude/commands/(전역 개인 폴더)에도 동일 이름으로
 * 이중 설치했으나, 같은 이름이 두 곳에 등록되면서 bare `/re-start` 호출이 "Unknown command"로
 * 실패하는 걸 실사용 중 확인함. 플러그인 스코프(`sodam-reverse:`)로만 단일화해 이 모호성을 제거함.
 *
 * 사용법: node scripts/re-local-install.mjs [--uninstall]
 */

import { existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PLUGIN_ROOT = dirname(__dirname); // scripts/ 의 부모 = 플러그인 루트

const SKILLS = ['re-router', 're-analyze-mycode', 're-report', 're-analyze-android', 're-analyze-binary', 're-analyze-agent'];
const COMMANDS = ['re-start', 're-report', 're-selftest', 're-android', 're-binary', 're-agent', 're-ping'];
const GLOBAL_SKILLS_DIR = join(homedir(), '.claude', 'skills');
const GLOBAL_COMMANDS_DIR = join(homedir(), '.claude', 'commands');
const GLOBAL_PLUGIN_DIR = join(homedir(), '.claude', 'plugins', 'sodam-reverse');
const UNINSTALL = process.argv.includes('--uninstall');

// ─── 언인스톨 ────────────────────────────────────────────────────────────────
if (UNINSTALL) {
  console.log('SoDam-Reverse 언인스톨 시작...\n');
  let removed = 0;
  for (const skill of SKILLS) {
    const destDir = join(GLOBAL_SKILLS_DIR, skill);
    if (existsSync(destDir)) {
      rmSync(destDir, { recursive: true, force: true });
      console.log(`🗑️  스킬 제거: ${destDir}`);
      removed++;
    } else {
      console.log(`⏭️  이미 없음(스킬): ${skill}`);
    }
  }
  for (const cmd of COMMANDS) {
    const destPath = join(GLOBAL_COMMANDS_DIR, `${cmd}.md`);
    if (existsSync(destPath)) {
      rmSync(destPath, { force: true });
      console.log(`🗑️  커맨드 제거: ${destPath}`);
      removed++;
    } else {
      console.log(`⏭️  이미 없음(커맨드): ${cmd}`);
    }
  }
  if (existsSync(GLOBAL_PLUGIN_DIR)) {
    rmSync(GLOBAL_PLUGIN_DIR, { recursive: true, force: true });
    console.log(`🗑️  플러그인 제거: ${GLOBAL_PLUGIN_DIR}`);
    removed++;
  } else {
    console.log(`⏭️  이미 없음(플러그인): sodam-reverse`);
  }
  console.log(`\n${removed}개 제거 완료. Claude Code를 재시작하면 적용됩니다.`);
  process.exit(0);
}

// ─── 인스톨 ──────────────────────────────────────────────────────────────────
console.log('SoDam-Reverse 로컬 설치 시작...\n');

let installed = 0;
let skipped = 0;
let failed = 0;

// [2026-07-17] 전역 개인 폴더(~/.claude/skills/, ~/.claude/commands/)에는 더 이상 설치하지 않음.
// 아래 "플러그인 등록"(~/.claude/plugins/sodam-reverse/)만 설치해 `/sodam-reverse:커맨드명`으로 단일화.
// 이전 버전이 그 두 폴더에 남겨둔 사본은 바로 아래 블록에서 정리한다.

// 이전 버전이 전역 개인 폴더에 남긴 사본 정리(이중 등록 모호성 제거)
console.log('[이전 이중 설치 정리]');
for (const skill of SKILLS) {
  const destDir = join(GLOBAL_SKILLS_DIR, skill);
  if (existsSync(destDir)) {
    rmSync(destDir, { recursive: true, force: true });
    console.log(`🧹 전역 스킬 사본 제거: ${destDir}`);
  }
}
for (const cmd of COMMANDS) {
  const destPath = join(GLOBAL_COMMANDS_DIR, `${cmd}.md`);
  if (existsSync(destPath)) {
    rmSync(destPath, { force: true });
    console.log(`🧹 전역 커맨드 사본 제거: ${destPath}`);
  }
}

// 플러그인 등록 (~/.claude/plugins/sodam-reverse/)
console.log('\n[플러그인 등록]');
try {
  mkdirSync(GLOBAL_PLUGIN_DIR, { recursive: true });
  const pluginJsonSrc = join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json');
  copyFileSync(pluginJsonSrc, join(GLOBAL_PLUGIN_DIR, 'plugin.json'));

  for (const skill of SKILLS) {
    const destSkillDir = join(GLOBAL_PLUGIN_DIR, 'skills', skill);
    mkdirSync(destSkillDir, { recursive: true });
    const srcPath = join(PLUGIN_ROOT, 'skills', skill, 'SKILL.md');
    if (existsSync(srcPath)) copyFileSync(srcPath, join(destSkillDir, 'SKILL.md'));
  }

  const destCmdDir = join(GLOBAL_PLUGIN_DIR, 'commands');
  mkdirSync(destCmdDir, { recursive: true });
  for (const cmd of COMMANDS) {
    const srcPath = join(PLUGIN_ROOT, 'commands', `${cmd}.md`);
    if (existsSync(srcPath)) copyFileSync(srcPath, join(destCmdDir, `${cmd}.md`));
  }

  console.log(`✅ sodam-reverse → ${GLOBAL_PLUGIN_DIR}`);
  installed++;
} catch (err) {
  console.log(`❌ 플러그인 등록 실패: ${err.message}`);
  failed++;
}

console.log('\n' + '─'.repeat(50));
console.log(`설치: ${installed}개 완료  |  실패: ${failed}개  |  건너뜀: ${skipped}개`);

if (installed > 0) {
  console.log(`
⚠️  중요: Claude Code를 완전히 재시작해야 적용됩니다.
   모든 Claude Code 창 닫기 → 다시 열기

설치 후 확인 방법:
   새 Claude Code 세션에서:
   /sodam-reverse:re-ping
   → "Pong!" 문구가 나오면 성공(플러그인 스코프 커맨드는 항상 이 형태로 호출)

언인스톨: node scripts/re-local-install.mjs --uninstall`);
}

if (failed > 0) {
  process.exit(1);
}
