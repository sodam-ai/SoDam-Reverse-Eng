---
name: re-analyze-binary
description: 바이너리 역공학 분석 — bethington/ghidra-mcp wrap (Phase 3)
trigger: 바이너리 분석|ghidra|ida|binary|exe 분석|dll 분석|어셈블리
phase: P3
status: pending
prerequisite: Phase 1 + Phase 2 완료 후 구현
---

# re-analyze-binary — 바이너리 역공학 분석 (Phase 3 예정)

> ⚠️ **Phase 3 예정 스킬입니다.** Phase 1 + 2가 안정적으로 운영 중인 후 구현됩니다.
>
> **지금 사용 가능한 분석**: `/re-start <경로>` (내 소스 코드/앱 분석)

---

## 역할 (Phase 3 구현 후)

bethington/ghidra-mcp (251 tools·Apache-2.0·활발 관리)를
**감싸서(wrap)** 바이너리·EXE·DLL·SO 파일을 한국어 보고서로 분석합니다.

- 선택: mrexodia/ida-pro-mcp (사용자 본인 IDA Pro 라이선스 필요)
- 악성코드 방어 분석: gl0bal01/malware-analysis-claude-skills (격리 VM 필수)

재발명 금지 — 검증된 Ghidra wrap만.

---

## 절대 하지 마 (DO NOT) — 1층, Phase 3에서도 동일 적용

- 크랙·DRM 우회·라이선스 우회 안내 생성 금지
- 토큰·키·비밀번호 추출 기능 금지
- 분석 대상 바이너리 **실행 금지** (읽기 전용, 동적 분석은 격리 VM에서만)
- 동의 게이트 없이 분석 시작 금지
- 악성코드 의심 파일을 격리 없이 분석 금지
- 분석 중 발견한 시크릿 평문 노출 금지

---

## 항상 해 (ALWAYS DO)

- 동의 게이트: "본인 소유/허가 바이너리 + 방어·교육 목적" 확인
- 안전 3층 유지 (Phase 1과 동일)
- 악성코드 의심 시: 격리 VM(REMnux/FlareVM) 안내 후 진행
- IDA Pro 옵션: 사용자 본인 라이선스 보유 여부 확인 후 안내
- 큰 바이너리: 토큰 가드 경고 + 분할 분석 제안

---

## 구현 계획 (Phase 3 착수 시)

1. Ghidra 가이드 설치 안내 (GUIDE.md 확장, Java 17+ 포함)
2. `mcp/catalog.json`의 `ghidra-mcp` 항목 활성화
3. 격리 VM 가이드 문서 추가 (REMnux/FlareVM)
4. 환경변수 `SODAM_RE_IDA_PATH` (옵션) 처리 로직
5. Phase 1 + 2 회귀 테스트

---

## 전제 조건

- Phase 1 (내 코드/앱) + Phase 2 (안드로이드) 안정 운영 중
- 사용자 PC에 Ghidra + Java 설치 (가이드 제공)
- 악성코드 분석 시 격리 VM 구성 완료
