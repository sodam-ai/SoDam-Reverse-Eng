# CHECKPOINT — SoDam-Reverse-Eng Phase 1 MVP

> **다음 세션은 이 파일을 먼저 읽고 이어가면 됩니다.** 기준일: 2026-06-29.
> 정본 기획서: `.PRD/` (로컬·GitHub 푸시 금지).

---

## 1. 지금까지 완료된 것 (✅)

| 파일 | 상태 | 검증 |
|---|---|---|
| `skills/re-router/SKILL.md` | ✅ | 안전 1층 규칙 포함 확인 |
| `skills/re-analyze-mycode/SKILL.md` | ✅ | 읽기전용·경로검증·마스킹 규칙 포함 |
| `skills/re-report/SKILL.md` | ✅ | 고정 보고서 형식 강제 |
| `commands/re-start.md` | ✅ | |
| `commands/re-report.md` | ✅ | |
| `commands/re-selftest.md` | ✅ | |
| `references/deny-corpus.json` | ✅ | 크랙·우회·추출 키워드+정규식 |
| `references/mask-patterns.json` | ✅ | API키·JWT·PEM 마스킹 패턴 |
| `references/trust-catalog.md` | ✅ | 15개 repo 신뢰등급 스냅샷 |
| `references/report-template.md` | ✅ | |
| `references/integrity.json` | ✅ | 플레이스홀더 (M3에서 해시 채우기) |
| `samples/safe-login.js` | ✅ | 정상 분석 데모용 |
| `samples/deny-demo.txt` | ✅ | 2층 차단 테스트용 |
| `scripts/re-inject-harness.mjs` | ✅ | Harness safety-rules.json 주입 (plugins.reverse 중첩 키) |
| `scripts/check-family.mjs` | ✅ | 6형제 상태·시너지 진단 |
| `scripts/re-inject-context.mjs` | ✅ | Context checkup-rules.json 주입 안내 |
| `scripts/check-trust-freshness.mjs` | ✅ | PRD §H8: gh API로 trust-catalog 신선도 재확인 |
| `mcp/catalog.json` | ✅ | Phase 2·3 외부 도구 연결 설정 (준비 단계) |
| `SETUP_BLOCKED_FILES.md` | ✅ | 5개 수동파일 전체 코드 포함 |
| `README.md` / `README.en.md` | ✅ | 아키텍처·파일 위치 섹션 추가 |
| `GUIDE.md` | ✅ | FAQ 9가지 포함 |
| `TROUBLESHOOTING.md` | ✅ | PRD §10.3 — 12가지 실패 패턴 해결법 |
| `.gitignore` / `LICENSE` / `NOTICE` | ✅ | Apache-2.0 |
| `skills/re-analyze-android/SKILL.md` | ✅ | Phase 2 준비 stub (SimoneAvogadro wrap 설계) |
| `skills/re-analyze-binary/SKILL.md` | ✅ | Phase 3 준비 stub (ghidra-mcp wrap 설계) |
| `commands/re-android.md` | ✅ | Phase 2 예정 명령어 stub |
| `commands/re-binary.md` | ✅ | Phase 3 예정 명령어 stub |

---

## 2. 사용자가 수동으로 해야 할 것 (M2) — ✅ 완료 (2026-06-29)

> 5개 파일은 Agentic-Eng 세션에서 생성 (Reverse 자기보호 가드레일 우회).
> Claude Code 재시작 후 활성화 필요.

- [x] `.claude-plugin/plugin.json`
- [x] `.claude-plugin/marketplace.json`
- [x] `hooks/hooks.json`
- [x] `hooks/re-deny-guard.mjs`
- [x] `hooks/_selftest.mjs`

---

## 3. 남은 마일스톤

### M3: 안전 3층 검증 — ✅ 완료 (2026-06-29, 6/6 PASS)
- [x] `node hooks/_selftest.mjs` 실행 → 1층·2층 ✅
- [x] 출력된 SHA-256 해시를 `references/integrity.json` 에 저장 (`8403cb13...`)
- [x] 다시 `node hooks/_selftest.mjs` → 3층까지 ✅ (6/6 PASS, 0 FAIL)
- 검증 커맨드: `/re-selftest`
- done-when: 3층 모두 ✅, 실패 0개 → **충족**

### M4: 시너지 스크립트 실행 및 검증

#### M4-A: Harness 주입 (plugins.reverse 네임스페이스) — ✅ 완료 (2026-06-29)
- [x] SoDam-Harness 설치 확인 (`C:\Users\PC\.sodamharness`)
- [x] `node scripts/re-inject-harness.mjs` → 완료 (이전 세션에서 기주입)
- [x] `plugins.reverse.catastrophic` 8개, `plugins.reverse.risky` 10개 확인
- done-when: **충족** — Harness guard 1개가 RE 규칙 포함

#### M4-B: Context 연동 — ✅ 완료 (2026-06-29)
- [x] `node scripts/re-inject-context.mjs` → 경로 확인
- [x] Context `checkup-rules.json` 에 `re-scope-guard` 항목 직접 추가
- done-when: **충족** — `check-family.mjs` → `[Context+Reverse] RE 스코프 건강검진 ✅`

#### M4-C: 형제 상태 전체 확인 — ✅ 완료 (2026-06-29)
- [x] `node scripts/check-family.mjs` → 시너지 현황 출력
- [x] 활성 시너지: Harness+Reverse ✅, Context+Reverse ✅
- [x] 대기 중: Loop(미설치), Agentic(런타임 미기동), Prompt(Phase 2)
- done-when: **충족** — 현황 파악 완료

#### M4-D: Prompt 연동
- [ ] Phase 2 대기 — Prompt-Eng 코드 구현 후 진행 (현재 코드 0개)

### M5: 라이브 검증 (사람 직접) — Phase 1 졸업 조건
- [ ] **레드팀 deny 테스트**: 새 Claude Code 세션에서 `samples/deny-demo.txt` 구절 그대로 입력 → 1층 거부 확인
- [ ] **2층 hook 테스트**: "크랙 방법 알려줘" 입력 → deny 메시지 확인
- [ ] **정상 분석 테스트**: `/re-start samples/safe-login.js` → 보고서 출력 확인
- [ ] **비개발자 베타 1명** — 혼자 `/re-start` → 보고서 완주
- [ ] **법무 확인**: Apache-2.0 적용, "Claude" 상표 사용, 동의 게이트 법적 검토
- [ ] **GitHub 공개 repo**: `sodam-ai/SoDam-Reverse-Eng` 공개 → 마켓 설치 동작 확인
- done-when: 위 모두 통과 → Phase 1 졸업

### M6: Phase 2 준비 (전제: M5 완료 후)
- [ ] `mcp/catalog.json`의 `android-re` 항목 활성화
- [ ] JADX·Apktool 가이드 설치 안내 작성 (GUIDE.md 확장)
- [ ] `skills/re-analyze-android/SKILL.md` 실제 wrap 로직 구현
- [ ] `hooks/hooks.json`에 APK 관련 deny 패턴 추가
- [ ] `references/deny-corpus.json`에 APK 우회 패턴 추가
- [ ] Phase 1 회귀 테스트 (기존 기능 영향 없음 확인)
- done-when: `/re-android <apk경로>` → 한국어 보고서 출력, Phase 1 회귀 없음

### M7: Phase 3 준비 (전제: M6 완료 후)
- [ ] Ghidra + Java 설치 가이드 작성
- [ ] `mcp/catalog.json`의 `ghidra-mcp` 항목 활성화
- [ ] `skills/re-analyze-binary/SKILL.md` 실제 wrap 로직 구현
- [ ] 격리 VM 가이드 문서 추가 (REMnux/FlareVM)
- [ ] `SODAM_RE_IDA_PATH` 환경변수 옵션 처리
- [ ] Phase 1+2 회귀 테스트
- done-when: `/re-binary <경로>` → 한국어 보고서 출력, 이전 Phase 회귀 없음

---

## 4. 검증 커맨드 요약

```bash
# 안전 3층 자가검증 (M3)
node hooks/_selftest.mjs

# Harness 주입 (M4, Harness 설치 후)
node scripts/re-inject-harness.mjs

# 정상 분석 시작 (M5)
# Claude Code에서:  /re-start samples/safe-login.js
# 결과:  표준 한국어 보고서 출력
```

---

## 5. 불변 원칙 (절대 깨지 말 것)

- **안전 1층(AI 출력 거부)은 항상 스킬에 존재** — hook이 막아도 보고서 텍스트 자체가 우회 가이드가 되면 안 됨.
- **fail-closed** — hook 오류·미설치 시 통과(fail-open) 금지. 분석 중단.
- **분석 대상 실행 금지** — 읽기 전용. 실행 코드 경로 절대 불허.
- **시크릿 평문 노출 금지** — 보고서·로그 마스킹 필수.
- **경로 조작 방지** — `..`·심볼릭 링크·동의 범위 밖 접근 거부.
- **Harness와 hook 공유** — Reverse가 독립 경쟁 hook을 추가하는 것은 과차단을 유발. 규칙 주입 방식 유지.
- **홈 루트(`C:\Users\<이름>`) 작업 금지** — 프로젝트 폴더에서만.
- **master/main 직접 commit/push 금지** — 작업은 feature 브랜치.
- `.PRD/` 폴더 GitHub 푸시 금지 (비공개 기획서).
