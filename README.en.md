# SoDam-Reverse-Eng — AI Code Analysis Plugin for Claude Code

> **Completely new to computers or AI? That's fine — follow this document step by step.**
>
> A Claude Code plugin that **explains your own (or authorized) code in plain language** using AI.
>
> ⚠️ **Honest Promise:** Crack guides, DRM bypass, authentication bypass, license bypass, and credential extraction are **refused no matter what** — this tool is exclusively for defense, education, and analysis of code you own.

---

## Table of Contents

1. [What Is This?](#1-what-is-this)
2. [What Does It Do?](#2-what-does-it-do)
3. [What Does It Refuse?](#3-what-does-it-refuse-safety-boundary)
4. [SoDam Family Synergy](#4-sodam-family-synergy)
5. [Prerequisites](#5-prerequisites-free-2-items)
6. [Installation](#6-installation)
7. [Commands](#7-commands)
8. [Analysis Workflow](#8-analysis-workflow)
9. [Security · Data Flow](#9-security--data-flow)
10. [Architecture · File Structure](#10-architecture--file-structure)
11. [File · Document Locations](#11-file--document-locations)
12. [Troubleshooting · FAQ](#12-troubleshooting--faq)
13. [License · Copyright · Commercial Use](#13-license--copyright--commercial-use)
14. [Contact · Contributing](#14-contact--contributing)
15. [Update Summary](#15-update-summary)

---

## 1. What Is This?

A **plugin** is a small add-on that gives an existing program new capabilities —
similar to installing an app on your smartphone.

**SoDam-Reverse-Eng** is a plugin that adds "code analysis" capability to **Claude Code** (an AI tool).

### In Simple Terms

- You ask the AI: "What does this code do?"
- The AI reads the code and **explains it in plain language**
- The result is organized into a **standard report**
- Dangerous requests (cracking, bypass, etc.) are **automatically refused**

### Who Is It For?

- When you cannot remember how your old code worked
- When you need to understand someone else's code (with permission)
- When you are wondering "Why does this function behave this way?"
- When you want to find security vulnerabilities in your own code

---

## 2. What Does It Do?

| Feature | Description |
|---|---|
| 🔍 Code Explanation | "What does this function do?" → explained in plain language |
| 📋 Standard Report | Summary · per-function explanation · source location · uncertainties · next steps |
| 🛡️ 3-Layer Safety | AI refusal (Layer 1) + real-time block (Layer 2) + integrity check (Layer 3) |
| 🔒 Auto-Masking | Passwords, API keys, tokens shown as `••••` in reports |
| 🗣️ Full Korean UI | All messages and errors displayed in Korean |
| 📁 Local Storage Only | Results saved only to your computer (no external upload) |

---

## 3. What Does It Refuse? (Safety Boundary)

| Request | Result | Reason |
|---|---|---|
| "Explain how this code works" | ✅ Proceed (after consent) | Allowed |
| "Find bugs for me" | ✅ Proceed (after consent) | Allowed |
| "Where are the security vulnerabilities?" | ✅ Proceed (after consent) | Allowed |
| "Tell me how to crack this" | 🛑 Refused | Absolutely prohibited |
| "Write authentication bypass code" | 🛑 Refused | Absolutely prohibited |
| "Extract tokens/passwords" | 🛑 Refused | Absolutely prohibited |
| "How do I remove DRM?" | 🛑 Refused | Absolutely prohibited |
| "Bypass the license" | 🛑 Refused | Absolutely prohibited |
| API key found during analysis | 🔒 `••••(masked)` | Privacy protection |

---

## 4. SoDam Family Synergy

SoDam-Reverse is the **youngest** of 6 sibling plugins. Installing siblings makes it more powerful.

**Recommended installation order:** Harness → Loop → Context → Agentic → Prompt → **Reverse (this one)**

| Sibling Plugin | Role | With Reverse |
|---|---|---|
| **SoDam-Harness** | Safety belt · backup | Shares RE patterns → one hook covers both (no duplication) |
| **SoDam-Loop** | Safe repetition control | Keeps repeated analysis loops safe |
| **SoDam-Context** | CLAUDE.md health check | Auto-detects scope violations |
| **SoDam-Agentic** | Planning · easy review | Re-reads reports for non-developer readability |
| **SoDam-Prompt** | Improves natural language requests | Better "analyze this" quality |

> ⚠️ **Important:** Starting Claude Code from `C:\Users\name` (home folder) causes Harness and Loop guards to block even safe operations.
> Always start from a **project folder** (`D:\my-project\` etc.).

**If Harness is installed — run once:**
```
node scripts/re-inject-harness.mjs
```
→ RE danger patterns are added to Harness safety rules and the hook is shared (no duplication).

---

## 5. Prerequisites (Free, 2 Items)

### Item 1: Node.js (Version 18 or higher)

**Node.js** is the "runtime engine" needed for the safety guards to work.

**Check if you already have it:**
1. Press **⊞ Windows key**
2. Type `powershell` → click **Windows PowerShell**
3. In the black window, type and press **Enter**:
   ```
   node --version
   ```
4. If you see a number like `v18.` or higher → **OK** (e.g., `v20.19.0`, `v22.14.0`)

**If not installed (or lower than v18):**
1. Open a web browser (Chrome, Edge, etc.) → go to **nodejs.org**
2. Click the green **"LTS"** button → download the `.msi` file
3. Double-click the downloaded file → keep clicking "**Next**" → install
4. **Close PowerShell completely** → reopen it
5. Run `node --version` again to confirm

> 💡 You may need to reboot your computer for it to take effect.

### Item 2: Claude Code

If you are reading this inside Claude Code, **you already have it**.
If not, install Claude Code from the Anthropic official website.

---

## 6. Installation

> 📌 **Detailed step-by-step guide:** See [GUIDE.en.md](./GUIDE.en.md) Chapter 2

---

### ⚠️ Read Before Installing — Most Common Failure Cause

> **#1 reason commands do not appear: Claude Code was started in the wrong folder**
>
> Claude Code reads commands **based on the folder it was started in**.
> Typing `cd other-folder` inside the chat does NOT reload commands.
>
> **Correct sequence:**
> 1. Open PowerShell (black window)
> 2. Type `cd D:\my-project-folder` (navigate to your project folder)
> 3. Type `claude` to launch Claude Code
>
> ❌ Starting from the home folder (`C:\Users\name`) means `/re-start` will not appear.

---

### Step 1: Register the Marketplace

Type one of the following in the Claude Code chat:

> 📦 **This is a private repository.**
> Choose the method below that matches how you received the plugin.

---

**Option A — Clone from GitHub (for invited repository members)**

> ⚠️ You need a GitHub account and access permission (invitation) to the repository.
> Request an invitation: startmxk@gmail.com

1. Open PowerShell (black window) and run the clone command:
   ```powershell
   git clone https://github.com/sodam-ai/SoDam-Reverse-Eng.git
   ```
   → A folder named `SoDam-Reverse-Eng` will be created in your current directory.

2. Note the path to the cloned folder (e.g., `C:\Users\YourName\SoDam-Reverse-Eng`)

3. In the Claude Code chat, type:
   ```
   /plugin marketplace add C:\Users\YourName\SoDam-Reverse-Eng
   ```
   > 💡 Replace `YourName` with your actual Windows username.

---

**Option B — Received as a folder or zip file (no git required)**

1. Unzip the received file or place the folder in a convenient location
   (e.g., `C:\Users\YourName\SoDam-Reverse-Eng`)

2. In the Claude Code chat, type the actual path:
   ```
   /plugin marketplace add C:\Users\YourName\SoDam-Reverse-Eng
   ```
   > 💡 If the path contains spaces, wrap it in double quotes:
   > `/plugin marketplace add "C:\My Folder\SoDam-Reverse-Eng"`

### Step 2: Install the Plugin

After registering the marketplace, type:
```
/plugin install sodam-reverse@sodamreverse-marketplace
```

Or type `/plugin` → menu → **Browse marketplaces → sodam-reverse → Install**.

### Step 3: Full Restart (Required!)

Plugins are **only loaded when Claude Code starts**. You must fully exit and restart.

1. Type `/exit` in the chat → Enter
2. **Completely close** the terminal window
3. Open a new PowerShell window
4. **Start from your project folder:**
   ```powershell
   cd D:\my-project-folder
   claude
   ```

### Step 4: Verify Installation

Once Claude Code opens, type `/re-p` — autocomplete should show:
```
/re-ping    (sodam-reverse)  ← diagnostic
/re-start   (sodam-reverse)  ← start analysis
```

The `(sodam-reverse)` tag confirms the plugin loaded correctly.

**Run the diagnostic command:**
```
/re-ping
```
→ If you get `"Pong! /re-ping is working."` — installation is complete.

### Step 5: Verify the 3-Layer Safety (Required!)

```
/re-selftest
```

**Expected result:** ✅✅✅ All three green

If any are not green → See [GUIDE.en.md](./GUIDE.en.md) Chapter 2

### Step 6: Register Integrity Hash (Activate Layer 3)

Copy the SHA-256 hash from the selftest output →
Paste it as the value for `hooks/re-deny-guard.mjs` in `references/integrity.json` → Save
→ Run `/re-selftest` again → Confirm Layer 3 ✅

---

## 7. Commands

| Command | When to Use | Example |
|---|---|---|
| `/re-ping` | Verify installation · diagnostics (test this first) | `/re-ping` |
| `/re-start [file-path]` | Start a new analysis | `/re-start src/login.js` |
| `/re-report` | View the last analysis report again | `/re-report` |
| `/re-selftest` | Check the 3-layer safety system | `/re-selftest` |
| `/re-agent [config-folder/repo path]` | Understand your own Claude config or another plugin's structure | `/re-agent ~/.claude` |

**Upcoming commands (after Phase 2·3):**

| Command | Status | Description |
|---|---|---|
| `/re-android [APK-path]` | ⏳ Phase 2 | Android app analysis |
| `/re-binary [file-path]` | ⏳ Phase 3 | Binary/executable analysis |

---

## 8. Analysis Workflow

```
User: /re-start my-code/login.js
          ↓
[Step 1] Consent Gate
  AI: "Is this code yours or do you have permission to analyze it?" → Yes/No
  AI: "Do you agree this is for defense/education only? You bear responsibility." → Yes/No
  Both "Yes" required to proceed
          ↓
[Step 2] 3-Layer Safety Check (automatic)
  Layer 1: AI self-judges whether content involves cracking/bypass
  Layer 2: deny-hook blocks dangerous patterns in real time
  Layer 3: SHA-256 integrity check on safety files
          ↓
[Step 3] Analysis Begins (read-only)
  - File reading ONLY (never executed)
  - Path manipulation (../, symlinks) auto-blocked
  - Passwords and keys auto-masked
          ↓
[Step 4] Standard Report Output
  ┌─────────────────────────────────────────────┐
  │ ■ One-line summary (what this code does)    │
  │ ■ Per-function explanation (file:line refs) │
  │ ■ Uncertainties (what AI is not sure about) │
  │ ■ Next steps (suggestions for follow-up)    │
  └─────────────────────────────────────────────┘
          ↓
[Step 5] Local Storage
  Saved to .sodam-re/ folder (.gitignore registered)
  No upload to external servers
```

---

## 9. Security · Data Flow

### Where Does My Code Data Go?

```
Code on my computer
    ↓ (sent to AI for analysis)
Claude AI (Anthropic servers)
    ↓ (only analysis results returned)
Saved to .sodam-re/ on my computer
```

- **Sent to AI:** Code content (required for analysis — Anthropic API Terms apply)
- **NOT sent externally:** Analysis results, consent records, block logs
- **Masked before saving:** Passwords, keys, tokens found in code

### 3-Layer Safety Architecture

| Layer | Name | Role | File |
|---|---|---|---|
| **Layer 1** | AI Refusal Rules | AI itself refuses to output crack/bypass content | `skills/re-router/SKILL.md` |
| **Layer 2** | deny-hook | Real-time blocking of dangerous keyword patterns | `hooks/re-deny-guard.mjs` |
| **Layer 3** | Integrity Check | Detects tampering via SHA-256 hashing | `hooks/_selftest.mjs` |

**fail-closed principle:** If a hook encounters an error, analysis is **immediately halted** — not passed through.

### Analysis Result Storage

```
[plugin-folder]/
└── .sodam-re/                  ← Results folder (auto-created)
    ├── reports/                ← Report files
    ├── consent/                ← Consent records (con-TIMESTAMP.json)
    └── safety-log.jsonl        ← Block event log (content is hashed)
```

The `.sodam-re/` folder is registered in `.gitignore` — **never uploaded to Git**.

---

## 10. Architecture · File Structure

```
SoDam-Reverse-Eng/
│
├── .claude-plugin/              ← Claude Code plugin declaration
│   ├── plugin.json
│   └── marketplace.json
│
├── commands/                    ← Command definitions
│   ├── re-ping.md               ← /re-ping (diagnostic)
│   ├── re-start.md              ← /re-start (analysis start)
│   ├── re-report.md             ← /re-report
│   ├── re-selftest.md           ← /re-selftest
│   ├── re-agent.md              ← /re-agent (AI agent structure analysis)
│   ├── re-android.md            ← Phase 2 (stub)
│   └── re-binary.md             ← Phase 3 (stub)
│
├── skills/                      ← AI analysis logic
│   ├── re-router/               ← Layer 1 safety rules + request routing
│   ├── re-analyze-mycode/       ← Source code analysis
│   ├── re-report/               ← Report generation
│   ├── re-analyze-android/      ← Phase 2 (stub)
│   └── re-analyze-binary/       ← Phase 3 (stub)
│
├── hooks/                       ← Safety layers 2 and 3
│   ├── re-deny-guard.mjs        ← Layer 2: real-time danger blocking
│   ├── _selftest.mjs            ← Layer 3: SHA-256 integrity check
│   └── hooks.json               ← Hook configuration
│
├── references/                  ← Data and rule files
│   ├── deny-corpus.json         ← 48 keywords + 5 regex
│   ├── mask-patterns.json       ← 10 masking rules
│   ├── trust-catalog.md         ← 15 trusted tool entries
│   ├── report-template.md       ← Standard report template
│   └── integrity.json           ← SHA-256 hash store
│
├── scripts/                     ← Utility scripts
│   ├── re-inject-harness.mjs    ← Harness synergy setup
│   ├── re-inject-context.mjs    ← Context synergy setup
│   ├── check-family.mjs         ← 6-sibling status check
│   └── check-trust-freshness.mjs
│
├── samples/                     ← Example files for testing
│   ├── safe-login.js
│   └── deny-demo.txt
│
├── .sodam-re/                   ← Analysis results (auto-created, .gitignore)
│
├── README.md                    ← Korean overview
├── README.en.md                 ← This file (English overview)
├── GUIDE.md                     ← Korean detailed guide
├── GUIDE.en.md                  ← English detailed guide
├── TROUBLESHOOTING.md           ← Error resolution guide
├── LICENSE                      ← Apache-2.0 full text
└── NOTICE                       ← Copyright notice
```

---

## 11. File · Document Locations

| File / Document | Location | Purpose |
|---|---|---|
| Korean README | `README.md` | Korean overview |
| English README | `README.en.md` | This file |
| Korean Guide | `GUIDE.md` | Comprehensive Korean guide |
| English Guide | `GUIDE.en.md` | Comprehensive English guide |
| Error Resolution | `TROUBLESHOOTING.md` | Full troubleshooting reference |
| Safety File Code | `SETUP_BLOCKED_FILES.md` | Manual setup file contents |
| License Full Text | `LICENSE` | Apache-2.0 full text |
| Copyright Notice | `NOTICE` | Third-party notices |
| Dev Progress | `CHECKPOINT.md` | Developer milestones |
| Danger Pattern DB | `references/deny-corpus.json` | 48 keyword + 5 regex patterns |
| Masking Patterns | `references/mask-patterns.json` | 10 masking rules |
| Trusted Tool List | `references/trust-catalog.md` | 15 tools with trust ratings |
| Report Template | `references/report-template.md` | Report format definition |
| Integrity Hashes | `references/integrity.json` | SHA-256 hash store |
| Family Status | `scripts/check-family.mjs` | 6-sibling diagnostic script |

---

## 12. Troubleshooting · FAQ

### Q1. `/re-start` does not appear or shows "Unknown command" (most common)

**Cause:** Claude Code was launched from the home folder (`C:\Users\name`) or you used `cd` inside the chat (commands do not reload on `cd`).

**Fix:**
1. Fully close Claude Code
2. Open a new PowerShell window
3. **Navigate to your project folder, then launch:**
   ```powershell
   cd D:\my-project-folder
   claude
   ```
4. Type `/re-ping` → confirm `"Pong!"` response

---

### Q2. What is `/re-ping`?

A diagnostic command to verify the plugin loaded. If you get `"Pong! /re-ping is working."`, the plugin is loaded correctly. If `/re-ping` fails, `/re-start` will also fail.

---

### Q3. "Node.js not found" error

nodejs.org → install **LTS** → reboot → reopen terminal → `node --version`

---

### Q4. Normal operations keep getting blocked

You are likely running Claude Code from `C:\Users\name` (home folder).
```powershell
cd D:\my-project-folder
claude
```
Restart Claude Code from a **project folder**.

---

### Q5. The consent question keeps prompting

Answer clearly with `yes`, `Yes`, or `I agree`.
Vague answers like "I think so" or "probably" are not treated as consent.

---

### Q6. Crack/bypass request was refused

**This is correct behavior.** This tool is exclusively for defense, education, and analysis of code you own.

---

### Q7. `/re-selftest` shows some items as ❌

Check that all 5 files from `SETUP_BLOCKED_FILES.md` exist →
Recreate any missing files → Fully restart Claude Code → Run `/re-selftest` again

SHA-256 mismatch:
```
node hooks/_selftest.mjs
```
Copy output hash → save to `references/integrity.json` → rerun

---

### Q8. Passwords appear in plain text in the report

**This is a bug.** The pattern is not in `references/mask-patterns.json`.
Do not share that report. File a GitHub Issue.

---

### Q9. Analysis is taking too long

Analyze one file at a time:
```
/re-start src/auth.js
```
File-by-file analysis is much faster than folder-wide.

---

### Q10. Harness synergy is not connecting

```
node scripts/re-inject-harness.mjs
```
"N RE rules injected" message means success.

---

### Q11. More detailed error resolution

→ **[GUIDE.en.md](./GUIDE.en.md)** — 25 FAQs and detailed guide
→ **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** — Full error pattern reference

---

## 13. License · Copyright · Commercial Use

### Applied License

**Apache License 2.0 · © 2026 SoDam AI Studio**

### Explicitly Permitted

| Action | Permitted? |
|---|---|
| Personal use | ✅ Permitted |
| Modification | ✅ Permitted (must document changes) |
| Copying and forking | ✅ Permitted |
| Redistribution | ✅ Permitted (must include license and copyright notice) |
| **Commercial use** | ✅ Permitted |
| Patent use | ✅ Permitted |

### Required Actions (Obligations)

| Obligation | Details |
|---|---|
| Preserve license notice | Must include the `LICENSE` file |
| Preserve copyright notice | Keep `© 2026 SoDam AI Studio` |
| Document changes | Must state what was modified if you change the code |
| Include NOTICE file | Must distribute `NOTICE` file alongside |

### Not Permitted

| Action | Notes |
|---|---|
| Unauthorized use of "SoDam" trademark | Cannot use as your own product/service trademark without permission |
| Warranty claims | Provided AS-IS — no warranty of quality or fitness |
| Liability claims | Disclaimer applies |

### Third-Party Trademark Notice

- **"Claude"**, **"Claude Code"**, **"Anthropic"** — Trademarks of Anthropic PBC
- **"IDA Pro"** — Trademark of Hex-Rays SA (Phase 3 optional feature)
- The above are **not affiliated with or endorsed by** this product

### Commercial Use Checklist

| Item | What to Check |
|---|---|
| This tool itself | Apache-2.0 allows commercial use |
| Analyzed software | Check that software's EULA and license **separately** |
| Claude API usage | Anthropic Terms of Service apply **separately** |
| IDA Pro (Phase 3, optional) | Requires **separate** commercial license purchase |

### Disclaimer

- Provided **"AS-IS"**
- **No warranty** of quality, performance, or fitness for a particular purpose
- **User bears responsibility** for the results of use
- No security tool can guarantee 100% safety

**Full license text:** [LICENSE](./LICENSE) · **Copyright notice:** [NOTICE](./NOTICE)
**Detailed license explanation:** See [GUIDE.en.md](./GUIDE.en.md) Chapter 12

---

## 14. Contact · Contributing

- **Bug reports and feature requests:** [GitHub Issues](https://github.com/sodam-ai/SoDam-Reverse-Eng/issues) (accessible to invited members only) or by email
- **Email:** startmxk@gmail.com
- **GitHub repository:** https://github.com/sodam-ai/SoDam-Reverse-Eng (private — invitation required)
- **How to contribute:** Contact by email first → discuss and proceed (private repository)

---

## 15. Update Summary

> Click each item to expand the details. (Based on development history — collapsible on both GitHub and browsers.)

<details>
<summary><strong>v0.1.0 — Initial Release (Phase 1 MVP)</strong></summary>

- Built-in 3-layer safety (1: AI output refusal, 2: deny-hook, 3: SHA-256 integrity)
- Consent gate (ownership/authorization + responsibility notice) — no analysis without passing
- Standard Korean report (summary, per-function, source location, uncertainties, next steps)
- Commands `/re-start`, `/re-report`, `/re-selftest`
- Market curation catalog + safe practice sample (`samples/`)
- Auto-masking (passwords, keys, tokens → `••••`)

</details>

<details>
<summary><strong>Phase 1 Hardening — Release Prep (M5)</strong></summary>

- New `/re-ping`: install-verification diagnostic (the first command to try)
- Aligned `/re-start` report format with the standard template (`report-template.md`)
- Improved install docs: private-repo clone (A) / folder-or-zip delivery (B)
- Registered session file in `.gitignore` (prevents accidental commits)

</details>

<details>
<summary><strong>Phase 2 Start — Android Analysis Scaffolding (⚠️ Not Live-Verified)</strong></summary>

- **Safety first**: expanded the block corpus with Android danger patterns → **48 keywords + 5 regex**
- Added `re-analyze-android` skill + `/re-android` command scaffolding (stronger consent gate, read-only; not yet usable)
- Added JADX/Apktool/Java 17+ install guide (section 2-6) to GUIDE
- ⚠️ Actual decompilation is **pending live verification** on a machine with the tools (currently scaffolding). Safety, consent, and report rules operate the same as Phase 1.

</details>

<details>
<summary><strong>Phase 2 — AI Coding Agent Structure Analysis Module (Live-Verified)</strong></summary>

- Added `re-analyze-agent` skill + `/re-agent` command — source-level analysis of your own Claude config or another plugin's structure (no external tools needed)
- Unlike Android, this needed no external tooling, so it's **fully live-verified**: self-analysis dogfood + 2 rounds of prompt-injection red-teaming (self-check, then an independent blind-test agent)
- Analyzing the entire `~/.claude` root requires passing a confirmation gate first, to protect against runaway token usage

</details>

> For detailed development history, see `CHECKPOINT.md` (for developers).

---

*Korean version: [README.md](./README.md)*
*Detailed English guide: [GUIDE.en.md](./GUIDE.en.md)*
*Error resolution: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)*
