# Cyber Snake release process

Cyber Snake uses Semantic Versioning after the legacy `archive-v001` through
`archive-v008` history. Never rename, overwrite, move, or delete those tags.

## Prepare a release

1. Confirm that feature work and regression testing are complete.
2. Choose the next Semantic Version according to compatibility:
   - MAJOR for incompatible changes.
   - MINOR for backward-compatible features.
   - PATCH for backward-compatible fixes.
   - Use `-alpha.N`, `-beta.N`, or `-rc.N` for prereleases.
3. Update `version.js`, including the version, channel, codename, release date,
   and commit metadata. Until the GitHub Release exists, keep the product update
   link on `CHANGELOG_URL` so users never receive a link to a missing Release.
4. Update the matching `package.json` version.
5. Move the prepared notes in `CHANGELOG.md` from Unreleased to the dated
   release section. Beta notes must clearly identify the build as a prerelease,
   not a stable version.
6. Run `npm test`.
7. Run `npm run check:version`.
8. Run `npm run check:release`. This script is read-only. A dirty or unpushed
   preparation branch is expected to fail those specific checks until committed
   and pushed.

## Review and publish

1. Create an `agent/` release branch from the latest `main`.
2. Stage only files belonging to the release. Never use `git add -A` in a
   workspace containing unrelated files.
3. Create a clear release-preparation commit and push the branch without force.
4. Open a Draft PR listing the version contract, test results, known issues,
   security notes, and release restrictions.
5. Provide desktop and mobile screenshots of visual version changes.
6. Wait for explicit human confirmation.
7. Merge the approved PR to `main` without rewriting history, and preserve the
   release branch.
8. Confirm the exact merge commit SHA.
9. Create an annotated `vMAJOR.MINOR.PATCH[-prerelease]` tag on that commit.
   Never overwrite or reuse a tag.
10. Push the tag without force.
11. Create the GitHub Release. The release body must contain the full commit SHA
    and a Compare link from the previous release/tag. Mark beta builds as
    prereleases and never describe them as stable.
12. Confirm the GitHub Release, `version.js`, `package.json`, product UI, and tag
    show the same version.
13. Create a local tracked-source ZIP and SHA-256 checksum in `archives/`.
    `archives/` must remain ignored by Git.
14. Wait for GitHub Pages deployment to complete.
15. Open the deployed site and verify the displayed version, keyboard access,
    bilingual copy, Firebase online state, and localStorage offline fallback.

## Non-negotiable safeguards

- Never force-push or rewrite shared history.
- Never overwrite, move, or delete an existing tag.
- Never commit `archives/`, `.env` files, service-account JSON, private keys,
  caches, or local test data.
- A Firebase Web App configuration is public client metadata; it is not an
  administrator key. Admin SDK credentials and service-account files are never
  allowed in the repository.
- Every GitHub Release must include its commit SHA and a Compare link.
- GitHub Release and in-product version strings must match.
- A beta version is not a stable release.
- This client-authoritative browser game cannot provide server-grade anti-cheat.
