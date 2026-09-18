# npm Trusted Publishing Implementation Plan

> Execute inline in the current task. The user has approved the migration; preserve the existing release behavior.

**Goal:** Publish VUtil packages from GitHub Actions using OIDC instead of `NPM_TOKEN`.

**Architecture:** Keep Rush and pnpm publishing. Provide a compatible system npm CLI and OIDC permissions, then register each existing release workflow in each npm package's trusted publishers.

**Tech Stack:** GitHub Actions, Node 20 for build/test and Node 24 for publishing, npm 11.17.0, Rush 5.164.0, pnpm 10.7.0.

## Global Constraints

- All three release workflows must preserve their branch triggers, versioning, distribution tags, and post-publish steps.
- Use `VisActor/VUtil` with matching case in repository metadata and npm settings.
- Only a real GitHub-hosted release can validate OIDC authentication end to end.

## Task 1: Update release configuration

**Files:** `.github/workflows/release.yml`, `.github/workflows/pre-release.yml`, `.github/workflows/hotfix-release.yml`, `common/config/rush/.npmrc-publish`, and the four `packages/*/package.json` files.

- [x] Keep the build/test Node matrix at `20.x`; use `actions/checkout@v6` and `actions/setup-node@v6`, with a separate Node 24 setup immediately before publishing.
- [x] Disable setup-node package manager caching for release jobs and install `npm@11.17.0` explicitly.
- [x] Add `id-token: write` alongside existing job permissions and remove the publish step's `NODE_AUTH_TOKEN` / `NPM_AUTH_TOKEN` environment block.
- [x] Add `repository.type = git`, `repository.url = git+https://github.com/VisActor/VUtil.git`, and each package's `repository.directory`.
- [x] Set the publish registry explicitly and document the optional local token reference.

## Task 2: Validate the existing publication path

- [x] Run `git diff --check` and an Actions workflow validator.
- [x] Run `node common/scripts/install-run-rush.js install --bypass-policy` with Node 20.
- [x] Run `node common/scripts/install-run-rush.js build --only tag:package` and `CI=true node common/scripts/install-run-rush.js test --only tag:package`.
- [x] Use pnpm 10.7.0 with `publish --dry-run --no-git-checks` for each public package; verify packed manifests contain canonical repository metadata and no `workspace:` dependency specifications.

## Task 3: Configure npm and report rollout status

- [x] After the user signs in, inspect existing trusted publishers for each of the four packages.
- [x] Add any missing GitHub Actions publishers for `VisActor/VUtil`: `release.yml`, `pre-release.yml`, and `hotfix-release.yml`, with no environment and direct publishing allowed.
- [x] Verify saved npm settings and document any required user authentication step.
- [x] Report local validation and the remaining release action accurately; do not claim a successful OIDC publish before a real Actions run succeeds.

## Validation results and current state

- Actionlint 1.7.12 and `git diff --check` pass.
- Node 20.20.2 install/build/test pass: 92 suites and 737 tests pass; 1 suite and 6 tests remain skipped by the existing configuration.
- Node 24.19.0 / npm 11.17.0 / pnpm 10.7.0 dry-runs pass for all four packages. Packed repository metadata, resolved workspace dependencies, and cjs/es/dist outputs were checked. Dry-runs use temporary unpacked copies bumped to 1.0.24, as the working tree's 1.0.23 versions already exist on npm. Logs and tarballs: `/tmp/vutil-oidc-packages-y0ay5lak`.
- npm confirms all four packages (`vdataset`, `vutils`, `vscale`, and `vlayouts`) trust all three workflows in `VisActor/VUtil`, with direct publish allowed (12/12 connections saved and verified).
- The final `vlayouts` hotfix connection was saved in Google Chrome after the user completed 2FA there; the in-app browser could not accept the user's verification input.
- Local validation did not publish any packages. A real GitHub Actions run must confirm OIDC authentication end to end.
- Roll out these changes by committing and pushing to `release/1.0.24`. The original failed run used `3998da1b11b59738cd55766b093a96389077b3db`; rerunning it would retain its original workflow.
