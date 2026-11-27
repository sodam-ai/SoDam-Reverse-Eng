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
- 3층 무결성에 실패가 있으면(해시 불일치, 기준 파일 없음·해석 실패) **재설치를 안내**하세요. 현재 파일의 해시를 계산해 `references/integrity.json`에 덮어쓰거나, 그렇게 하라고 안내하지 마세요(변경된 파일이 정상으로 바뀝니다).
- 마지막에 덧붙이기: **"셀프테스트 통과 = 완전한 안전 인증이 아니다. 레드팀 변형은 별도 라이브 검증이 필요하다."**
