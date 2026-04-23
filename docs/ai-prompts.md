# AI Prompt Notes


## Prompt 1: Framework Design

```text
Design a Playwright TypeScript Page Object Model framework for a dummy login app.
Use environment variables for URL and credentials.
Include reusable helpers for challenge detection, security payloads,
browser-side XSS observation, and session reuse checks.
```


## Prompt 2: Security Edge Cases

```text
Suggest security-oriented Playwright test scenarios for login, XSS/input validation,
and session management. Include visible UI assertions and browser-observable behavior.
Avoid destructive or abusive testing patterns.
```

## Prompt 3: Test Data Externalization To CSV


```text
Refactor the Playwright TypeScript framework so scalable login and negative test data
is read from CSV files instead of keeping all usernames and passwords in .env.
Keep .env only for environment-specific configuration such as BASE_URL and optional selectors.
Suggest a maintainable folder structure, CSV parsing utility, and how the tests should consume
multiple credential and payload records in the future.
```