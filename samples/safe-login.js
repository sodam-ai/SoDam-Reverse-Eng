// samples/safe-login.js — 연습용 안전 샘플 (본인 소유가 보장된 더미 코드)
// 목적: "정상 분석 → 표준 한국어 보고서" 시연. 실제 비밀번호/키 없음.
// 주의: 데모용이므로 실제 서비스 인증에 사용하지 말 것.

/** 아주 단순한 로그인 검사 (데모용) */
function checkLogin(username, password, users) {
  if (!username || !password) return { ok: false, reason: '빈 입력' };
  const user = users.find((u) => u.name === username);
  if (!user) return { ok: false, reason: '없는 사용자' };
  if (user.passwordHash !== hash(password)) return { ok: false, reason: '비밀번호 불일치' };
  return { ok: true, user: user.name };
}

/** 데모용 가짜 해시 (보안용 아님 — 분석 연습 목적) */
function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return 'demo:' + h;
}

module.exports = { checkLogin, hash };
