---
name: re-analyze-android
description: 안드로이드 APK 분석 — SimoneAvogadro/android-reverse-engineering-skill wrap (Phase 2)
trigger: android 분석|APK 분석|안드로이드 앱 분석|apk|jadx|apktool
phase: P2
status: pending
prerequisite: Phase 1 마켓 배포 완료 후 구현
---

# re-analyze-android — 안드로이드 APK 분석 (Phase 2 예정)

> ⚠️ **Phase 2 예정 스킬입니다.** Phase 1이 안정적으로 배포된 후 구현됩니다.
>
> **지금 사용 가능한 분석**: `/re-start <경로>` (내 소스 코드/앱 분석)

---

## 역할 (Phase 2 구현 후)

SimoneAvogadro/android-reverse-engineering-skill (6.2k★·Apache-2.0·JADX/Apktool 기반)을
**감싸서(wrap)** APK 구조·API·URL·퍼미션을 한국어 보고서로 출력합니다.

재발명 금지 — 검증된 엔진을 wrap만.

---

## 절대 하지 마 (DO NOT) — 1층, Phase 2에서도 동일 적용

- 크랙·DRM 우회·라이선스 우회 안내 생성 금지
- 토큰·키·비밀번호 추출 기능 금지
- 분석 대상 APK **실행 금지** (읽기 전용)
- 동의 게이트 없이 분석 시작 금지
- **실제 서비스 APK 무단 분석 금지** (본인 소유/허가 전용, 제3자 앱 경계 강화)
- 분석 중 발견한 시크릿 평문 노출 금지 (마스킹 필수)
- 외부 도구에 사용자 입력 셸 문자열 연결 금지 (인자 배열만)

---

## 항상 해 (ALWAYS DO)

- 동의 게이트: "**본인 소유/허가 APK인지** + 방어·교육·허가 목적인지" 확인 후 진행
- 안전 3층 유지 (Phase 1과 동일)
- 보고서에 불확실성·근거 위치 항상 포함
- 외부 도구 신뢰 등급 표시 (trust-catalog 기준)

---

## 구현 계획 (Phase 2 착수 시)

1. `mcp/catalog.json`의 `android-re` 항목 활성화
2. JADX·Apktool 가이드 설치 안내 (GUIDE.md 확장)
3. `hooks/hooks.json`에 APK 관련 deny 패턴 추가
4. `references/deny-corpus.json`에 APK 우회 패턴 추가
5. 표준 한국어 보고서 형식 확장 (APK 구조·퍼미션 섹션)
6. Phase 1 통합 테스트 (기존 기능 회귀 없음 확인)

---

## 전제 조건

- Phase 1 (내 코드/앱 분석) 안정 배포 완료
- `sodam-ai/SoDam-Reverse-Eng` GitHub 공개 repo 등록
- 베타 사용자 피드백 반영 완료
