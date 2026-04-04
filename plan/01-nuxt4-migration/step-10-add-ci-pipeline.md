# Step 10: Add CI pipeline

**File:** `.github/workflows/ci.yml`

## 10.1 Create workflow file

Follow nuxt-starter's 3-job pattern:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: npx nuxt typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '23.6.0'
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test run
```

## 10.2 Push and verify CI passes

Open a PR and confirm all three jobs go green.
