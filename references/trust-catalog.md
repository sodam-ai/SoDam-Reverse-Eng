# 신뢰 등급 카탈로그 (노출 3등급 + 제외)

> 기준: **관리상태 + 라이선스** (별 수 아님). 실측: 2026-06-28 (gh CLI).
> MVP엔 wrap 도구가 없다(소스 직접 읽기). 이 표는 **P2부터 노출할 후보의 등급 체계 + 스냅샷**이다.
> ⚠️ **카탈로그 신선도**: 스냅샷이므로 설치/사용 시 gh API로 last_commit 재확인, archived 감지 시 자동 강등·제외(H8).
> **2026-07-26 정체일수 재확인**(`node scripts/check-trust-freshness.mjs`): 아래 표의 정체일수만 최신값으로 갱신. 별점·라이선스 등 나머지 항목은 전체 재조회한 것은 아님(범위 밖).

## 등급 정의

- 🟢 **공식/검증**: 라이선스 명확 + 활발히 관리 → 노출
- 🟡 **조건부**: 정체(1년+) 또는 라이선스 수동검토 필요 → 경고와 함께 노출
- 🔴 **제외**: archived(폐기) 또는 라이선스 파일 없음 → 노출 금지

## 스냅샷 (실측 2026-06-28)

| 저장소 | ⭐ | 라이선스 | 관리 | 판정 | Phase |
|---|---|---|---|---|---|
| NationalSecurityAgency/ghidra | 70,207 | Apache-2.0 | 활발 | 🟢공식 | P3(엔진) |
| skylot/jadx | 49,213 | Apache-2.0 | 활발 | 🟢공식 | P2 |
| iBotPeaches/Apktool | 24,878 | Apache-2.0 | 활발 | 🟢공식 | P2 |
| SimoneAvogadro/android-reverse-engineering-skill | 6,221 | Apache-2.0 | 활발 | 🟢검증 | **P2 wrap** |
| bethington/ghidra-mcp | 2,619 | Apache-2.0 | 매우 활발(251 tools) | 🟢검증 | **P3 wrap** |
| mrexodia/ida-pro-mcp | 9,716 | MIT | 활발 | 🟢검증 | P3 옵션(IDA 상용) |
| gl0bal01/malware-analysis-claude-skills | 40 | MIT | 활발 | 🟡검증 | P3 |
| clearbluejar/pyghidra-mcp | 366 | Apache-2.0 | 활발 | 🟡검증 | P3 후보 |
| radareorg/radare2 | 24,212 | NOASSERTION⚠️ | 활발 | 🟡(라이선스 수동검토) | 후보 |
| frida/frida | 21,142 | NOASSERTION⚠️ | 활발 | 🟡(라이선스 수동검토) | 후보 |
| incogbyte/iOS-reverse-engineering-claude-skill | 44 | 확인필요 | 활발 | 🟡 | 백로그(iOS) |
| LaurieWired/GhidraMCP | 9,350 | Apache-2.0 | ⚠️397일 정체(2026-07-26 재확인) | 🟡조건부 | 비선호(bethington 우선) |
| OwenPawl/ghidra-re-skill | 86 | ❌무라이선스 | 활발 | 🔴제외(법적) | — |
| Yuyz0112/claude-code-reverse | 2,390 | ❌무라이선스 | ⚠️333일 정체(2026-07-26 재확인) | 🔴제외(법적) | — |
| DaCodeChick/GhidraMCP | 26 | Apache-2.0 | ❌archived | 🔴제외(폐기) | — |

## 규칙

- 라이선스 **파일 없음 = 제외**. **NOASSERTION = 자동분류 실패이니 제외하지 말고 수동검토 큐**(실측: radare2·frida·공식 MCP servers도 NOASSERTION).
- **별 수로 신뢰 판단 금지**(LaurieWired 9.3k★도 1년 정체).
- wrap은 기본 **"외부 설치 안내(비번들)"** → 타 도구 코드 재배포 안 함(라이선스 전파 최소화). 번들 시 각 LICENSE/NOTICE 동봉.
