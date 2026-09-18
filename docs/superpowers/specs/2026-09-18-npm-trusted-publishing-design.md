# npm trusted publishing

## Goal

Restore automated releases without an expiring npm token. The user approved migrating the GitHub workflows and npm package settings to trusted publishing.

## Approach

Keep Rush 5.164.0 and pnpm 10.7.0. The pinned pnpm implementation packs workspace dependencies and invokes the system npm CLI, inheriting the GitHub OIDC environment. Keep build and test on Node 20, then switch all three workflows to Node 24 and npm 11.17.0 immediately before publishing, grant `id-token: write`, and stop passing `NPM_TOKEN` to publishing. Preserve the existing release commands and distribution tags.

The existing vscale Wilkinson tiny-number test fails under Node 24 but passes under Node 20. Restricting the runtime upgrade to publishing avoids coupling this authentication migration to numerical behavior changes.

Replacing Rush with a custom publisher would duplicate its version checks, workspace packing, and partial-release recovery. Rotating a granular token would restore publishing temporarily but retain the expiry problem. Neither is needed for this migration.

Add the canonical `git+https://github.com/VisActor/VUtil.git` repository URL and package directory to each public package. These metadata let npm validate the repository when generating provenance. Keep `.npmrc-publish` pointed at the public npm registry; its optional token reference remains available for local workflows and is omitted by Rush when unset in CI.

## npm configuration

For each of `@visactor/vdataset`, `@visactor/vlayouts`, `@visactor/vscale`, and `@visactor/vutils`, add GitHub Actions trusted publishers for `VisActor/VUtil` with workflow filenames `release.yml`, `pre-release.yml`, and `hotfix-release.yml`. Leave the environment name unset because these jobs do not declare an environment. Allow direct `npm publish`, matching the existing release process. Do not change unrelated package permissions or revoke credentials during setup.

## Validation and rollout

Validate workflow syntax, build and test the four packages with Node 20, and dry-run packing/publishing with the pinned pnpm and npm versions. Check packed repository metadata and resolved workspace dependency versions. These checks cannot prove OIDC exchange locally; that requires a real GitHub Actions release after npm settings are saved and the workflow changes reach the release branch. Re-running the original failed run alone will reuse its old workflow.
