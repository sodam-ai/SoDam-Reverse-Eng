# SoDam-Reverse-Eng 문제 해결 가이드

> PRD §10.3 기반 — 실측·설계 과정에서 식별된 **실제 실패 모드** 중심.
> 일반 FAQ는 **[README.md](./README.md)** §12를 먼저 보세요.

---

## 1. 명령어가 안 보여요 (`/re-start`·`/re-selftest` 없음)

**원인 (1순위):** Claude Code **완전 재시작을 안 했음**.

**해결:**
1. Claude Code 완전히 종료 (작업표시줄·트레이 우클릭 → 종료).
2. 다시 시작 → `/re-start` 타이핑 시 자동완성 확인.

> 플러그인은 시작 시 로드됩니다. 재시작 없이는 명령이 뜨지 않습니다.

---

## 2. "Node.js가 없대요" / `node --version` 실패

**해결:**
1. https://nodejs.org → **LTS** 버튼 클릭 → 설치.
2. 설치 완료 후 **새 터미널** 열기 → `node --version` → `v18.x` 이상 확인.
3. Claude Code 완전 재시작.

---

## 3. 평소 잘 되던 작업이 자꾸 막혀요 (과차단)

**원인:** 홈 루트(`C:\Users\이름`)에서 Claude Code를 시작함.
Harness·Loop guard가 홈 폴더와 AppData를 보호하다가 정상 작업까지 차단하는 실측 사례가 있습니다.

**해결:**
- Claude Code를 **프로젝트 폴더**(`D:\내프로젝트\` 등)에서 시작하세요.
- 임시 파일은 작업 폴더 안 `Temp\` 또는 프로젝트 폴더 내에 두세요.
- 형제 플러그인(Harness·Loop) 설치 여부 확인: `node scripts/check-family.mjs`

---

## 4. 분석이 시작이 안 돼요

**원인 A:** 동의 게이트 미통과.
→ "본인 소유 또는 허가 대상" + "방어·교육 목적"에 **둘 다** "예"를 해야 합니다.

**원인 B:** 분석 대상 경로가 동의 범위 밖.
→ `../` 상위 폴더 이동이나 심볼릭 링크 탈출은 자동 차단됩니다.

**해결:** 분석 대상이 본인 소유이고 프로젝트 폴더 안에 있는지 확인하세요.

---

## 5. 위험 요청이 거부돼요

**이것은 정상 동작입니다.** SoDam-Reverse는 **방어·교육·본인 소유물 전용**입니다.
크랙·DRM 우회·인증 우회·키 추출 요청은 설계상 거부합니다.

---

## 6. `/re-selftest` 일부 항목이 ❌

**해결:**
1. `SETUP_BLOCKED_FILES.md`를 열어 5개 파일이 모두 있는지 확인.
2. 없는 파일만 직접 만들기 (파일 내용은 `SETUP_BLOCKED_FILES.md` 안에 있음).
3. Claude Code **완전 재시작** → `/re-selftest` 재실행.

SHA-256 불일치 경고 시: hook 파일이 변조됐을 가능성 → 플러그인 재설치 후 `node scripts/re-inject-harness.mjs` 재실행.

---

## 7. Harness 시너지가 안 잡혀요

**해결:**
```
node scripts/re-inject-harness.mjs
```
→ "RE 규칙 N개 주입 완료" 메시지 확인.

형제 상태 전체 확인:
```
node scripts/check-family.mjs
```

---

## 8. Codex에서 안전장치가 다르게 동작해요

MVP는 **Claude Code 전용**입니다. Codex hook 모델은 deny 등가물이 검증되지 않아 Phase 2 이후로 지원이 미뤄졌습니다.

---

## 9. AI 사용량이 갑자기 많이 늘어요

큰 파일/폴더를 한 번에 분석하면 토큰 사용량이 급증합니다.

**해결:**
- 파일 단위로 나눠서 분석하세요: `/re-start src/specific-file.js`
- 대형 레포: 폴더 단위 분할 제안을 AI가 자동 안내합니다.

---

## 10. 보고서에서 비밀번호·API 키가 그대로 보여요

**이것은 버그입니다.** 즉시 보고해 주세요:
1. 해당 보고서 내용을 공유하지 마세요.
2. `references/mask-patterns.json`에 해당 패턴이 누락됐는지 확인.
3. GitHub Issues에 패턴 추가 요청.

---

## 11. trust-catalog 신선도 확인

카탈로그가 오래됐다고 느껴지면:
```
node scripts/check-trust-freshness.mjs
```
→ 폐기(archived)되거나 6개월 이상 업데이트 없는 도구 경고.

---

## 12. Phase 2·3 명령어(/re-android·/re-binary)가 안 돼요

Phase 2는 실제 도구로 라이브 검증 완료, Phase 3(바이너리)은 **코드·도구·환경까지는 검증됐으나 `/re-binary` 슬래시 명령 자체의 라이브 실행만 아직 남은 상태**입니다(2026-08-19 재확인: Java/JADX/Apktool·Ghidra·JDK 21 전부 이 PC에 설치·작동 확인됨). "구현 전"이 아니라 "슬래시 명령 실사용만 미검증"이 정확한 표현입니다.

- Phase 2(안드로이드): ✅ 라이브 검증 완료(2026-07-13). JADX·Apktool·Java 17+ 설치 필요(README.md §6-2).
- Phase 3(바이너리): ✅ Ghidra 12.1.3 설치 + headless 분석·추출 스크립트 실제 성공까지 확인(2026-08-19). **JDK 21+** 필요(Java 17이 아님 — 실측 정정, README.md §6-2 참고). 슬래시 명령 자체의 새 세션 라이브 실행만 남음.

도구를 설치했는데도 명령이 실패하면 아래 12-1·12-2를 확인하세요.

지금 바로 시도하고 싶다면 `/re-start <경로>` 로 소스 코드를 분석하세요(도구 설치 없이 바로 가능).

---

## 12-1. 안드로이드 도구 설치했는데 안 돼요

**JADX가 PATH에 없다고 나옴:**
- 설치 후 압축 해제한 폴더의 `bin` 경로가 시스템 PATH에 등록됐는지 확인(`jadx --version`으로 재확인).
- PATH 등록 직후엔 **새 터미널**을 열어야 반영됩니다(기존 터미널은 갱신 안 됨).

**Apktool 실행이 안 됨:**
- `apktool.jar`와 실행용 `apktool.bat`(또는 `apktool`)가 **같은 폴더**에 있어야 합니다. 둘이 다른 폴더에 있으면 실행이 실패합니다.

---

## 12-2. 바이너리(Ghidra) 도구 설치했는데 안 돼요

**`ghidraRun`(또는 `analyzeHeadless.bat`) 실행 시 "JDK 21+ (64-bit) could not be found" 에러가 남:**
- **2026-08-19 실측 확인된 원인**: Ghidra 12.1.3부터 **JDK 21 이상**이 필요합니다(예전엔 Java 17로 안내됐으나 버전 요구사항이 올라갔습니다). 이 PC의 Java 17(안드로이드 도구용)만으로는 부족합니다.
- **검증된 해결법**: 시스템 전역 `JAVA_HOME`을 바꾸지 마세요(JADX·Apktool이 Java 17에 의존하므로 깨질 수 있습니다). 대신 JDK 21을 별도 폴더에 받아 압축만 풀고, **Ghidra 설치 폴더의 `support/launch.properties` 파일에서 `JAVA_HOME_OVERRIDE=` 줄에 그 JDK 21 폴더 경로를 적어 넣으세요**(예: `JAVA_HOME_OVERRIDE=D:\Tools\jdk-21`). Ghidra만 21을 쓰고 나머지 도구는 그대로 17을 씁니다.
- 상세 설치 방법은 README.md §6-2 참고.

**IDA Pro 옵션이 인식 안 됨:**
- `SODAM_RE_IDA_PATH` 환경변수가 정확히 설정됐는지 확인(README.md §6-2에 Windows `setx` 명령 안내).

---

> 더 자세한 설치·사용법: **[README.md](./README.md)**  
> 버그 신고: GitHub Issues (공개 후)
