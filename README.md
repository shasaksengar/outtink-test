## What This Covers

- Secure login automation with valid and invalid credentials
- Challenge detection for CAPTCHA, MFA, bot protection, rate limiting, and additional verification
- XSS and input validation checks for script, HTML, special-character, long, and malformed inputs
- Session validation after logout and across multiple browser contexts
- Playwright artifacts for debugging: screenshots, videos, traces, HTML report, and JSON observations

## Project Structure

```text
outtink-test/
  fixtures/               Shared Playwright fixtures
  pages/                  Page objects for login and protected flows
  tests/                  Login, XSS/input, and session specs
  test-data/              CSV-backed credentials and payload datasets
  utils/                  Env loader, CSV reader, payload/session helpers
  docs/                   AI prompt notes
  README.md               Setup, execution, assumptions, and limitations
```

## Setup

Install dependencies:

```bash
npm install
```

Install Playwright browsers if needed:

```bash
npm run install:browsers
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `.env` with the provided dummy login app values:

```bash
BASE_URL=https://provided-login-app.example
```

Use `.env` only for environment-specific configuration such as base URL, paths, and optional selector overrides.

## Configuration

Required values:

- `BASE_URL`

Optional values:

- `LOGIN_PATH`, default `/login`
- `PROTECTED_PATH`, default `/dashboard`
- `LOGOUT_PATH`, default `/logout`
- `USERNAME_SELECTOR`
- `PASSWORD_SELECTOR`
- `LOGIN_BUTTON_SELECTOR`
- `LOGOUT_SELECTOR`
- `ERROR_SELECTOR`
- `PROTECTED_ASSERT_SELECTOR`

If required values are missing, tests skip with a clear message instead of failing with misleading errors.

## Test Data

CSV-backed test data lives in:

- `test-data/credentials.csv`
- `test-data/security-payloads.csv`

This keeps environment configuration separate from scalable scenario data.

Example `credentials.csv` shape:

```csv
scenario,username,password,expectedOutcome,notes
valid-login,valid.user@example.com,change-me,success,Happy path login
invalid-login,invalid.user@example.com,wrong-password,error,Invalid credentials should be rejected
```

Example `security-payloads.csv` shape:

```csv
name,category,value
script tag injection,script,<script>window.__xssExecuted = true</script>
special characters,special,"'"?><&;(){}[]\/%00"
```

Add new rows to expand valid, invalid, edge-case, or role-based scenarios without editing the spec files.

## Running Tests

Run all tests:

```bash
npm test
```

Run login tests only:

```bash
npm run test:login
```

Run XSS/input validation tests only:

```bash
npm run test:xss
```

Run session tests only:

```bash
npm run test:session
```

Run in headed mode for debugging or interview demo:

```bash
npm run test:headed
```

Open the HTML report:

```bash
npm run report
```

## Reporting And Debugging

Playwright is configured to keep useful artifacts:

- screenshots on failure
- traces retained on failure
- videos retained on failure
- HTML report under `playwright-report/`
- test outputs under `test-results/`
- JSON observations attached to tests for invalid login, challenge detection, XSS behavior, and session reuse

## Security Approach

The framework detects CAPTCHA, MFA, bot protection, rate limiting, temporary denial, and additional verification. It does not bypass these controls. If a challenge appears, the test records the evidence and either asserts the expected defensive behavior or skips flows that cannot ethically continue without human verification.

Input validation tests verify both visible behavior and browser-observable behavior:

- no script execution marker is set
- no browser dialog is triggered
- active injected DOM such as script tags or event-handler payloads is not rendered
- the application shows an error, safe rejection, or defensive challenge

Session tests validate that logout invalidates protected access and that old cookies or storage state cannot be reused. Concurrent session behavior is documented because some systems intentionally allow multiple active sessions while others invalidate older sessions.



## Prompt Documentation

See `docs/ai-prompts.md` for the prompts, decisions, accepted changes.