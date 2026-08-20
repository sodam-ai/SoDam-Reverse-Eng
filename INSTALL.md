# INSTALL — SoDam-Reverse-Eng 필요 프로그램 설치 안내

> 이 문서는 **README.md §6-2와 동기화된 상세판**입니다. `/re-start`(내 코드/앱 분석)만 쓰신다면 이 문서는 필요 없습니다 — Node.js만 있으면 충분합니다.
> `/re-android`(APK 분석) 또는 `/re-binary`(실행파일 분석)를 쓰시려는 분만 아래를 참고하세요.
>
> **현재 범위: Windows 기준 · 안드로이드 분석 도구까지만 다룹니다.** 맥(Mac)·아이폰(iOS) 관련 설치 안내는 **추후 추가 예정**입니다(2026-08-04 계획 확정, 아직 미작성).

---

## 0. 지금 이 문서가 필요한지 먼저 확인

| 쓰고 싶은 기능 | 필요한 프로그램 | 이 문서에서 볼 절 |
|---|---|---|
| `/re-start` (내 코드/앱) | Node.js 18+ (README §5에서 이미 안내) | 해당 없음 — 설치 불필요 |
| `/re-android` (APK 분석) | Java 17+, JADX, Apktool | §1 |
| `/re-binary` (실행파일 분석) | **JDK 21+**, Ghidra **또는** Python+LIEF(경량 대안) | §2 |
| `/re-binary` + IDA Pro 연동(선택) | 본인 소유 IDA Pro 라이선스 | §3 |

---

## 1. 안드로이드 앱 분석 도구 (`/re-android`용)

> ✅ **2026-07-13 실제 설치·분석 성공까지 확인된 조합입니다.**

### 1-1. Java 17 이상

- **공식 배포처**: [adoptium.net](https://adoptium.net/temurin/releases?version=17) — "Temurin 17 (LTS)" 선택 → Windows `.msi` 다운로드 → 실행
- **확인 명령**: `java -version`
- **실제 검증된 버전** (이 프로젝트 개발 환경 기준): `OpenJDK Runtime Environment Temurin-17.0.19` — 버전 출력에 `Temurin`이라는 글자가 보이면 이 공식 배포처에서 받은 것이 맞습니다.

### 1-2. JADX (APK → 자바 코드 복원)

- **공식 배포처**: [github.com/skylot/jadx/releases](https://github.com/skylot/jadx/releases)
- **받을 파일**: `jadx-x.x.x.zip` (cli+gui 통합본). `jadx-gui-*.zip`은 GUI 전용이라 제외.
- **설치**: 원하는 위치에 압축 해제(예: `C:\jadx`) → PATH에 `C:\jadx\bin` 추가 → **Claude Code 완전 재시작**
- **확인 명령**: `jadx --version`
- **실제 검증된 버전**: `1.5.6`

### 1-3. Apktool (리소스·매니페스트 복원)

- **공식 배포처**: [apktool.org/docs/install](https://apktool.org/docs/install/) (원본 저장소: [bitbucket.org/iBotPeaches/apktool](https://bitbucket.org/iBotPeaches/apktool/downloads/))
- **설치**: 안내에 따라 `apktool.bat`과 최신 jar(반드시 `apktool.jar`로 이름 변경) 다운로드 → 같은 폴더에 배치(예: `C:\apktool`) → PATH 등록 → **Claude Code 완전 재시작**
- **확인 명령**: `apktool --version`
- **실제 검증된 상태**: `C:\apktool\apktool.bat` 정상 설치·동작 확인됨

### PATH 등록 방법 (Windows, 공통)

1. Windows 검색 → **"환경 변수"** 입력 → **"시스템 환경 변수 편집"** 클릭
2. **"환경 변수(N)..."** 버튼 → 사용자 변수의 **`Path`** 선택 → **편집**
3. **"새로 만들기"** → 설치 폴더 경로 입력(예: `C:\jadx\bin`) → 확인
4. **Claude Code를 완전히 종료 후 재시작** (새 터미널만으로는 부족할 수 있음)

---

## 2. 실행파일(바이너리) 분석 도구 (`/re-binary`용)

> ✅ **2026-08-19 Ghidra 12.1.3 실제 설치·headless 분석 명령 정상 동작까지 확인된 조합입니다**(CHECKPOINT §5-68). 단, `/re-binary` 슬래시 명령 자체(동의→분석→보고서 전체 흐름)의 실사용 확인은 아직 진행 전입니다.

### 방법 A — Ghidra (정식, 무료, NSA 개발)

- **공식 배포처**: [ghidra-sre.org](https://ghidra-sre.org/) (실제로는 [github.com/NationalSecurityAgency/ghidra/releases](https://github.com/NationalSecurityAgency/ghidra/releases)의 zip으로 연결됩니다 — `gh release download Ghidra_<버전>_build --repo NationalSecurityAgency/ghidra --pattern "*.zip"`로도 받을 수 있습니다)
- **필요 조건**: **JDK 21 이상**(⚠️ 2026-08-19 실측 정정: 예전엔 "Java 17 이상"으로 적혀 있었으나, 실제로 Ghidra 12.1.3을 설치해보니 `analyzeHeadless`가 "JDK 21+ (64-bit) could not be found"로 명확히 요구했습니다. Ghidra 버전이 오르면서 요구 JDK도 올라간 것으로 보입니다 — §1-1의 JDK 17은 **안드로이드 도구(JADX/Apktool) 전용**이고 Ghidra엔 별도로 JDK 21+가 필요하다는 뜻입니다. 새 Ghidra 버전을 받을 땐 이 요구사항을 다시 확인하세요)
- **설치**: 압축 해제 후 `ghidraRun.bat`(Windows) 또는 `support/analyzeHeadless.bat`(headless) 실행 확인
- **JDK 21을 새로 받아야 하는 경우(기존 Java 17을 안 건드리는 방법)**: [adoptium.net](https://adoptium.net/temurin/releases?version=21)에서 Windows x64 JDK zip을 받아 원하는 폴더(예: `D:\Tools\jdk-21`)에 압축만 풀고, Ghidra 설치 폴더의 `support/launch.properties` 파일에서 `JAVA_HOME_OVERRIDE=` 줄에 그 JDK 폴더 경로를 적어 넣으세요(예: `JAVA_HOME_OVERRIDE=D:\Tools\jdk-21`). 시스템 전역 `JAVA_HOME`을 바꾸지 않아 기존에 Java 17로 동작하던 JADX/Apktool 등에 영향이 없습니다.
- **자주 겪는 문제**: `ghidraRun`/`analyzeHeadless`가 "JDK ... could not be found"로 안 열리면 위 `JAVA_HOME_OVERRIDE` 설정이 안 됐거나 JDK 버전이 21 미만인 게 원인입니다.
- **headless 분석 실행 예시**(실제로 검증된 명령 형태): `support\analyzeHeadless.bat <프로젝트폴더> <프로젝트이름> -import <분석대상파일> -deleteProject`

### 방법 B — Python + LIEF (경량 대안, Ghidra 설치가 부담스러울 때)

- **설치**: `pip install lief` (Python 3 필요)
- **확인**: `python -c "import lief; print(lief.__version__)"` (Windows에서 `python`이 안 먹으면 `py`로 시도)
- **실제 검증된 버전**: Python `3.13.7`(2026-08-02) → `3.14.7`(2026-08-13 재검증, 이 PC의 Python 자동 업데이트 후에도 재설치만으로 정상 동작 확인), LIEF `1.0.0`
- **참고**: Python 버전이 바뀌어도 `pip install lief`를 다시 실행하면 그 버전에 맞는 LIEF가 자동으로 설치됩니다(별도 조치 불필요).
- **한계**: 헤더·섹션·임포트 같은 구조 정보만 가능, 디스어셈블(코드 역분석)은 불가

### (선택) IDA Pro 연동

본인 소유의 **상용** IDA Pro 라이선스가 있는 경우만 해당합니다. 이 프로젝트는 IDA를 번들하지 않으며, 이미 설치된 IDA를 가리키기만 합니다.

```powershell
setx SODAM_RE_IDA_PATH "C:\Program Files\IDA Pro 8.x\ida64.exe"
```
설정 후 새 터미널에서 `/re-binary`가 이 경로를 인식합니다.

---

## 3. 테스트용 안전 대상 준비 (선택)

동의 게이트(§2 소유권 확인) 때문에, 분석 대상은 **본인이 만들었거나 분석 권한이 있는 것**이어야 합니다.

- **연습용 코드**: 저장소에 이미 포함된 `samples/safe-login.js` 사용 가능(설치 불필요).
- **연습용 APK**: [f-droid.org](https://f-droid.org/)의 오픈소스 앱은 라이선스가 명확해 연습 대상으로 적합합니다(저작권 문제 없는 공개 소프트웨어).

---

## 요약 표 (다시 보기)

| 프로그램 | 공식 배포처 | 확인 명령 | 이 프로젝트에서 검증된 버전 |
|---|---|---|---|
| Java 17+ | adoptium.net | `java -version` | Temurin-17.0.19 |
| JADX | github.com/skylot/jadx | `jadx --version` | 1.5.6 |
| Apktool | apktool.org | `apktool --version` | 설치 확인됨(버전 미기재) |
| Ghidra | ghidra-sre.org (GitHub releases) | `analyzeHeadless -help` 정상 출력 | **12.1.3 설치·headless 실행 확인됨**(2026-08-19, JDK 21 필요) |
| Python + LIEF | pip install lief | `py -c "import lief"` | Python 3.14.7 · LIEF 1.0.0 |
| IDA Pro | (본인 구매) | — | 미설치(상용, 선택) |

문제가 생기면 [README.md §12 문제 해결·FAQ](./README.md#12-문제-해결faq)를 먼저 확인하세요.
