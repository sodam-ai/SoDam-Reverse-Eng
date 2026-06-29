---
description: 안전 3층(AI 출력거부 · deny-hook · SHA-256 무결성)이 정상 작동하는지 자가검증합니다.
---

SoDam-Reverse-Eng의 **안전 3층 셀프테스트**를 실행하세요.

Bash로 다음을 실행합니다 (설치된 플러그인의 hooks 폴더):

```
node "${CLAUDE_PLUGIN_ROOT}/hooks/_selftest.mjs"
```

`${CLAUDE_PLUGIN_ROOT}`가 인식되지 않으면, 설치된 `sodam-reverse` 플러그인 폴더의 `hooks/_selftest.mjs` 경로를 찾아 실행하세요.

결과를 **초보가 이해하도록 한국어로** 설명하세요:
- ✅ 통과 / ❌ 실패 항목 구분
- 3층 무결성 manifest가 없으면, 출력된 해시를 `references/integrity.json`에 기록하는 방법 안내
  (형식: `{"hooks/re-deny-guard.mjs":"<출력된 해시>"}`)
- 마지막에 덧붙이기: **"셀프테스트 통과 = 완전한 안전 인증이 아니다. 레드팀 변형은 별도 라이브 검증이 필요하다."**
