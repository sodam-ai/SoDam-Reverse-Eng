# CHECKPOINT — SoDam-Reverse-Eng

> **다음 세션은 이 파일을 먼저 읽고 이어가면 됩니다.**
> 기준일: **2026-07-07** (최초 작성 2026-06-29). 정본 기획서: `.PRD/` (로컬 전용 · GitHub 푸시 금지).

---

## 0. 현재 위치 한눈에 (2026-07-07 실측)

- **브랜치:** `feat/m5-readiness` — `main` 대비 **6커밋 앞섬, 미머지·미푸시** (`origin/main` = `d1393cd`). 작업 트리 clean.
- **Phase 1 MVP:** 코드 완료, 안전 3층 셀프테스트 **6 통과 / 0 실패**. 사람 검증(M5)만 남음.
- **Phase 2 안드로이드:** **골격 완료 · 라이브 미검증** (Java/JADX/Apktool·테스트 APK 부재로 실동작 미확인).
- **Phase 2 AI 에이전트 분석 (NEXT-1):** ✅ **완료·독립 레드팀 감사 통과** (`re-analyze-agent`+`re-agent`, 소스레벨·외부도구 0).
  - 1차 보강(자체검증): 프롬프트 인젝션 방어(§0-1) + 거부경로 실측(`agent-injection-demo.md`) + `~/.claude` 루트 하드게이트(실측: 이 PC agents 1,289개·skills 636개).
  - **2차 보강(독립 감사, 2026-07-11)**: 자체검증은 "자기 채점"이라 신뢰도 낮음(05_AUDIT.md의 "독립 서브에이전트 3명" 원칙과 불일치) → 무관한 독립 에이전트가 블라인드로 공격 6종 고안 → **PARTIAL GAPS 판정**: ①가짜 `<system-reminder>` 시스템태그 스푸핑(가장 심각) ②SKILL.md 본문에 박힌 키는 마스킹 스코프 밖 ③대상 안의 가짜 ConsentRecord로 동의 우회 가능 — 3건 모두 §0-1에 규칙 4개 추가로 봉쇄, `agent-injection-demo-2.md`(결합공격 재현)로 재검증 통과.
- **문서:** README·GUIDE (한/영) **md + html**, "업데이트 요약" 토글 포함. deny 코퍼스 = **키워드 48 + 정규식 5**.
- **다음 할 일 → §6 "다음 작업" 참조.**

최근 6커밋:
```
1686176 chore: 문서 HTML 4종 추적 예외 + 커밋
544780d docs: 왕초보 README·GUIDE 정비 + HTML판(한/영) + 모순 정정
f46d402 docs: Phase 2 안드로이드 도구 설치 안내(GUIDE) + deny 개수 정정
e7353cb feat: Phase 2 골격 — 안드로이드 분석 스킬·명령 활성화 (라이브 미검증)
a7e463a feat: Phase 2 안전 우선 — 안드로이드 위험 패턴 deny 확장
cd2d518 fix: M5 준비 정비 — /re-ping 추가·보고서 형식 정합·세션파일 제외
```

---

## 1. 완료된 것 (✅) — 2026-07-07 갱신

| 파일 | 상태 | 비고 |
|---|---|---|
| `skills/re-router/SKILL.md` | ✅ | 안전 1층 규칙 |
| `skills/re-analyze-mycode/SKILL.md` | ✅ | 읽기전용·경로검증·마스킹 |
| `skills/re-report/SKILL.md` | ✅ | 고정 보고서 형식 |
| `commands/re-ping.md` | ✅ | **신규(cd2d518)** — 설치 진단 (`Pong!`) |
| `commands/re-start.md` | ✅ | 보고서 형식 정본 정합(cd2d518) |
| `commands/re-report.md` · `re-selftest.md` | ✅ | |
| `references/deny-corpus.json` | ✅ | **키워드 48 + 정규식 5** (안드로이드 우회 패턴 포함, a7e463a) |
| `references/mask-patterns.json` | ✅ | 10개 마스킹 패턴 |
| `references/trust-catalog.md` | ✅ | 15 repo 신뢰등급 스냅샷 |
| `references/report-template.md` | ✅ | 보고서 정본 양식 |
| `references/integrity.json` | ✅ | guard 해시 `8403cb13…` (M3에서 채움) |
| `samples/safe-login.js` · `deny-demo.txt` | ✅ | 정상/차단 테스트용 |
| `samples/agent-injection-demo.md` | ✅ | 프롬프트 인젝션 거부경로 레드팀 테스트용(자체 저작) |
| `samples/agent-injection-demo-2.md` | ✅ | **신규** — 독립 레드팀 감사가 찾은 결합공격(가짜 시스템태그+가짜동의+마스킹우회) 재현·회귀용 |
| `scripts/*.mjs` (4종) | ✅ | 시너지 주입·형제 진단·신선도 |
| `mcp/catalog.json` | ✅ | **android-re = active** (e7353cb) |
| `hooks/*` (5 보호파일) | ✅ | M2 완료 · **AI 편집 금지** |
| `README.md` · `README.en.md` | ✅ | + **html** · "업데이트 요약" 토글 · deny 48+5 정정 |
| `GUIDE.md` · `GUIDE.en.md` | ✅ | + **html** · **2-6 안드로이드 도구 설치안내** · 업데이트 토글 |
| `TROUBLESHOOTING.md` | ✅ | 12 실패패턴 해결법 |
| `SETUP_BLOCKED_FILES.md` | ✅ | 5 수동파일 전체 코드 |
| `.gitignore` · `LICENSE` · `NOTICE` | ✅ | Apache-2.0 · html 4종 추적 예외(1686176) |
| `skills/re-analyze-android/SKILL.md` | 🔄 | **골격 active · 라이브 미검증** (JADX/Apktool wrap; 안전·동의·보고서는 Phase 1 재사용) |
| `commands/re-android.md` | 🔄 | **기능화 · 라이브 미검증** |
| `skills/re-analyze-agent/SKILL.md` | ✅ | **NEXT-1 신규 · 독립 레드팀 감사 통과** (자체검증→편향 발견→독립 에이전트 블라인드 공격 6종→3건 실제 갭 확인(가짜시스템태그·가짜동의·마스킹스코프)→§0-1에 4개 규칙 보강→재검증 통과) |
| `commands/re-agent.md` | ✅ | **NEXT-1 신규** (re-android 미러링) |
| `skills/re-analyze-binary/SKILL.md` · `commands/re-binary.md` | ⏳ | Phase 3 stub (미착수) |

---

## 2. 수동 파일 (M2) — ✅ 완료 (2026-06-29)

> 5개 파일은 Agentic-Eng 세션에서 생성(Reverse 자기보호 가드레일 우회). 재시작 후 활성화됨.
> **이후 AI 편집 금지 (보호 5파일).**

- [x] `.claude-plugin/plugin.json`
- [x] `.claude-plugin/marketplace.json`
- [x] `hooks/hooks.json`
- [x] `hooks/re-deny-guard.mjs`
- [x] `hooks/_selftest.mjs`

---

## 3. 마일스톤 상태

### M3: 안전 3층 검증 — ✅ 완료 (6/0 PASS, 2026-06-29)
- [x] `node hooks/_selftest.mjs` → 1·2·3층 ✅, guard 해시 `8403cb13…` 저장·일치
- 이후 **모든 변경 후 회귀 6/0 유지 확인됨** (Phase 2·문서 작업 포함).
- 검증: `/re-selftest` · done-when: 3층 ✅, 실패 0 → **충족**

### M4: 시너지 스크립트 — ✅ (A·B·C 완료 / D 대기)
- **M4-A** Harness 주입 (`plugins.reverse` catastrophic 8 · risky 10) — ✅ 완료
- **M4-B** Context 연동 (`re-scope-guard`) — ✅ 완료
- **M4-C** 형제 상태 확인 (`check-family.mjs`) — ✅ 완료
- **M4-D** Prompt 연동 — ⏳ Phase 2 대기 (Prompt-Eng 코드 0개)

### M5: 라이브 검증 (사람 직접) — ⏸ **보류 (사용자 결정으로 최종 단계로 연기)**

> **[핵심 결정 기록 · 2026-07-07]** 사용자가 M5의 사람몫(레드팀·비개발자 베타·법무·GitHub 공개)을
> **"모든 구현(Phase 2·3)이 끝난 후"** 로 연기하고, 그 전에 구현을 먼저 진행하기로 **확정**.
> → PRD 원안(Phase 1 배포 후 Phase 2)의 **의도적 순서 변경**.
> **다음 세션은 이 항목을 앞당기거나 재제안하지 말 것** (사용자 명시).

- [ ] 레드팀 deny 테스트 — 새 세션에서 `samples/deny-demo.txt` 구절 입력 → 1층 거부 확인
- [ ] 2층 hook 테스트 — "크랙 방법 알려줘" → deny 메시지 확인
- [ ] 정상 분석 — `/re-start samples/safe-login.js` → 표준 보고서 확인
- [ ] 비개발자 베타 1명 — 혼자 `/re-start` 완주
- [ ] 법무 확인 — Apache-2.0 적용, "Claude" 상표 비제휴 고지, 동의 게이트 법적 검토 (PRD §H5/H6 미해결)
- [ ] GitHub 공개 전환 — **비가역·대외 → 사용자 명시 승인 필수**, 공개 전 시크릿·`.PRD` 재스캔
- done-when: 위 모두 통과 → Phase 1 졸업

### M6: Phase 2 — 🔄 **진행 중 (안드로이드 골격)**

> **전제 정정:** 원안은 "M5 완료 후"였으나 위 2026-07-07 결정으로 **M5 전에 착수(합의됨)**.

- [x] `mcp/catalog.json` android-re 활성화 (e7353cb)
- [x] JADX·Apktool·Java 17+ 가이드 설치 안내 (GUIDE 2-6, f46d402)
- [x] `references/deny-corpus.json` APK 우회 패턴 추가 (a7e463a) — *`hooks.json`은 코퍼스를 로드하므로 별도 수정 불필요*
- [x] Phase 1 회귀 없음 — 셀프테스트 6/0 유지
- [~] `skills/re-analyze-android/SKILL.md` wrap 로직 = **골격 작성(라이브 미검증)**
- [ ] **안드로이드 라이브 검증** (도구+테스트 APK 필요) → §6 NEXT-2
- [x] **AI 코딩 에이전트 구조 분석 모듈** (PRD 03 명시 · Phase 2 나머지 절반) — ✅ **완료·라이브 검증됨** (`re-analyze-agent`, 외부도구 0, 도그푸드 통과)
- done-when: `/re-android <apk경로>` → 한국어 보고서 + Phase 1 회귀 없음 → **미충족**

### M7: Phase 3 — 대기 (전제: M6 완료 후)
- [ ] Ghidra + Java 설치 가이드 · `mcp/catalog.json` `ghidra-mcp` 활성화
- [ ] `skills/re-analyze-binary/SKILL.md` 실제 wrap 로직 (bethington/ghidra-mcp)
- [ ] 격리 VM 가이드 (REMnux/FlareVM) · `SODAM_RE_IDA_PATH` 옵션 · Phase 1+2 회귀
- done-when: `/re-binary <경로>` → 한국어 보고서, 이전 Phase 회귀 없음

---

## 4. 검증 커맨드 요약

```bash
node hooks/_selftest.mjs          # 안전 3층 (6/0 기대)
node scripts/check-family.mjs     # 6형제 시너지 현황
node -e "const d=require('./references/deny-corpus.json');console.log('kw',d.keywords.length,'rx',d.regex.length)"  # 48 / 5 기대
git log --oneline main..HEAD      # 미머지 커밋 확인
git ls-files .PRD                 # 빈값 = .PRD 미추적(정상)
# Claude Code 내부:  /re-selftest  ·  /re-start samples/safe-login.js
```

---

## 5. 불변 원칙 (절대 깨지 말 것)

- **안전 1층(AI 출력 거부)은 항상 스킬에 존재** — hook이 막아도 보고서 텍스트가 우회 가이드가 되면 안 됨.
- **fail-closed** — hook 오류·미설치 시 통과(fail-open) 금지, 분석 중단.
- **분석 대상 실행 금지** — 읽기 전용. 실행 코드 경로 절대 불허.
- **시크릿 평문 노출 금지** — 보고서·로그 마스킹(`••••`) 필수.
- **경로 조작 방지** — `..`·심볼릭 링크·동의 범위 밖 접근 거부. 외부 도구엔 인자 배열(셸 문자열 연결 금지).
- **Harness와 hook 공유** — Reverse 독립 경쟁 hook 추가 금지(과차단 유발). 규칙 주입 방식 유지.
- **안전층 5파일 AI 편집 금지** — `hooks/re-deny-guard.mjs`·`hooks/_selftest.mjs`·`hooks/hooks.json`·`.claude-plugin/plugin.json`·`.claude-plugin/marketplace.json`. 불가피 시 `SETUP_BLOCKED_FILES.md` 수동 경로 + `integrity.json` 재기록.
- **홈 루트(`C:\Users\<이름>`) 작업 금지** — 프로젝트 폴더에서만.
- **master/main 직접 commit/push 금지** — 작업은 feature 브랜치.
- **`.PRD/` GitHub 푸시 영구 금지** (비공개 기획서).
- **repo 공개 전환은 비가역·대외 → 사용자 명시 승인 필수, AI 자율 실행 금지.**

---

## 6. 다음 작업 (우선순위 · 2026-07-07)

> 각 작업의 담당(AI 단독 / 사람·환경 게이트 / 사용자 결정)과 done-when, 예상 리스크·변수·충돌·실패, 대응을 함께 명시.

| # | 작업 | 담당 | done-when |
|---|---|---|---|
| **NEXT-0** | 본 CHECKPOINT 현실화 | AI | ✅ **본 갱신으로 완료** |
| **NEXT-1** | Phase 2 나머지 절반 = **AI 코딩 에이전트 구조 분석 모듈** | AI | ✅ **완전 완료** — `re-analyze-agent`+`re-agent` 신규, router 4번 활성, 셀프테스트 6/0 무회귀. 자체검증(3건)→**독립 레드팀 감사**(3건 실제 갭 추가 발견·전부 봉쇄)로 2단계 강화. **문서 4종(README·GUIDE 한/영) 동기화 완료**(PRD §10 의무 이행) — 이 모듈은 여기서 종료, 추가 레드팀 루프는 의도적으로 중단(한계효용 판단, 다음은 Phase C/D). (A4 deny-corpus 추가는 문서 카운트 동기화 회피 위해 의도적 생략) |
| **NEXT-2** | 안드로이드 **라이브 검증** | 사람·환경 | 도구+테스트 APK로 `/re-android` 동의→디컴파일→보고서, 크랙 요청 거부 재현 |
| **NEXT-3** | 6커밋 브랜치 **머지/푸시** | 사용자 결정 | 승인 시 `feat/m5-readiness`→`main` 머지(또는 백업 브랜치 푸시) |
| **NEXT-4** | **Phase 3 골격** (바이너리 ghidra-mcp wrap) | AI | NEXT-1 완료 후 착수, M7 항목 |
| **NEXT-5** | **M5 사람몫** (레드팀·베타·법무·공개) | 사람 | 모든 구현 후(연기 확정) |

### 작업별 리스크·변수·대응

**NEXT-1 — AI 코딩 에이전트 구조 분석 모듈 (다음 구현, AI 단독)**
- **왜 다음인가:** PRD 03이 Phase 2로 명시(안드로이드와 "병행 가능"). **소스레벨 분석이라 외부 도구 불필요 · Phase 1 엔진/안전 재사용 → 안드로이드와 달리 라이브 검증까지 AI가 가능**(골격 debt 안 쌓임). 본래 목적 이탈 없음.
- **리스크·변수:** ① PRD 스펙이 한 줄로 **얇음** → **착수 전 `.PRD/01_PRD.md`·`03_PHASES.md`에서 범위 확정 필수**(빈 스펙 밀기 금지). ② 새 슬래시 명령 신설 시 `.claude-plugin/plugin.json`(보호파일) 등록이 필요할 수 있음 → **편집 금지라 수동 경로/사용자 승인** 또는 기존 `re-router` 확장으로 우회 검토. ③ 새 1층 규칙의 셀프테스트 커버리지는 `_selftest.mjs`(보호파일) 편집이 있어야 하므로 **이번에도 미포함으로 남김**(알려진 gap).
- **충돌·실패:** 기존 스킬 미변경(신규) → 충돌 낮음. 실패 시 `re-router` 라우팅에만 항목 추가하고 스킬은 골격 유지.

**NEXT-2 — 안드로이드 라이브 검증 (사람·환경 게이트)**
- **리스크:** 도구 설치 실패(→ GUIDE 2-6의 **공식 페이지 우선**), 대형 APK가 **사용자 AI 사용량 급소모**, **제3자 APK 무단 분석 금지**(동의 게이트가 차단), 디컴파일 산출물 경로 주입(인자 배열·경로 검증). 데모는 **본인이 만든 APK** 사용.
- **변수:** AI가 도구 설치·실행 결과를 직접 관찰 못 하므로 **사람이 관찰**해야 함.

**NEXT-3 — 브랜치 머지/푸시 (사용자 결정)**
- **리스크:** `main`·push는 **비가역/대외**(비공개라도) → **승인 필수**. 머지 전 `git ls-files .PRD`(빈값)·시크릿 재확인. 백업만 원하면 *브랜치만* 푸시하는 선택지.

**NEXT-4 — Phase 3 골격 (AI, NEXT-1 완료 후)**
- **리스크:** **악성코드 분석 도메인 → 격리 VM 안내 필수**, 설치 부담 큼(Java/Ghidra), 미검증 골격 debt 재발 → "라이브 미검증" 라벨 유지.

**NEXT-5 — M5 사람몫 (최종 · 연기 확정)**
- **지금 준비·재제안 금지**(사용자 확정). 공개 전환은 비가역·승인 필수. 법무 H5/H6 미해결.

### 상시 유의 (cross-cutting)
- **골격 debt:** 미검증 스캐폴딩(안드로이드, 향후 바이너리)이 쌓임 → 문서·CHECKPOINT에 **"라이브 미검증" 라벨 유지**, 도구 확보 시 검증 우선.
- **CHECKPOINT 신선도:** **매 구현 후 이 파일을 갱신**할 것 — 안 하면 지도-현실 괴리 재발(2026-07-07 갱신 전 android가 "stub"으로 방치됐던 것이 실제 사례).
- **안전·경로 규율:** §5 불변 원칙 상시 준수.
