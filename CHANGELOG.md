# Changelog

All notable changes to Cyber Snake are documented here. The project adopts
[Semantic Versioning](https://semver.org/) beginning with the next release;
the existing numbered archives remain unchanged as legacy history.

## [Unreleased]

Planned prerelease: [`0.9.1-beta.1`](https://github.com/Tao-2026/cyber-snake/compare/v0.9.0-beta.1...HEAD). It has not been tagged or published.

### Added

- Accept legacy `v001`–`v008` and strict stable/alpha/beta/rc Semantic Versions for leaderboard submissions.
- Classify invalid data, authentication, permission, network, and throttling failures without logging player data.

### Changed

- Preserve retryable pending scores while removing permanently invalid or permission-denied submissions from automatic retry.
- Prepare the backward-compatible `0.9.1-beta.1` patch prerelease metadata.

### Fixed

- Align client validation and Firestore Security Rules so Semantic Version scores can be uploaded.
- Replace the generic upload failure copy with accurate bilingual retry guidance.

### Security

- Keep all existing UID ownership, field range, server timestamp, personal-best, list-limit, and submission-throttle protections unchanged.

### Known Issues

- Updated Firestore Rules must be published before Semantic Version scores can reach the production leaderboard.

## [0.9.0-beta.1] - 2026-08-24

This is a beta prerelease, not a stable release.

### Added

- Version metadata, in-product update entry, validation tooling, and release documentation prepared for `0.9.0-beta.1`.

### Changed

- Versioning after v008 will use Semantic Versioning, including alpha, beta, and release-candidate channels.

### Fixed

- Nothing yet.

### Security

- Release checks identify common secret, service-account, private-key, and temporary-file risks without treating the public Firebase Web configuration as an administrator credential.

### Known Issues

- `0.9.0-beta.1` is a prerelease and must not be described as stable.
- Cyber Snake is a client-authoritative browser game and cannot provide server-grade anti-cheat.

## Legacy release history

These tags predate Semantic Versioning. They are preserved exactly and will not be renamed, overwritten, or deleted.

- [archive-v001-2026-08-14](https://github.com/Tao-2026/cyber-snake/tree/archive-v001-2026-08-14) (`6126db4`): initial playable Snake game.
- [archive-v002-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v001-2026-08-14...archive-v002-2026-08-17) (`9dc00b1`): cyberpunk presentation and early arcade interface improvements.
- [archive-v003-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v002-2026-08-17...archive-v003-2026-08-17) (`d4ffc01`): keyboard and mobile touch-control iteration.
- [archive-v004-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v003-2026-08-17...archive-v004-2026-08-17) (`39a9f3b`): current score, total cores, and dynamic scoring feedback.
- [archive-v005-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v004-2026-08-17...archive-v005-2026-08-17) (`e641b94`): local Top 3 Emoji Podium and bilingual interface iteration.
- [archive-v006-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v005-2026-08-17...archive-v006-2026-08-17) (`7c72593`): mobile pause control.
- [archive-v007-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v006-2026-08-17...archive-v007-2026-08-17) (`665060f`): mobile layout, pause placement, and Chinese copy refinements.
- [archive-v008-2026-08-17](https://github.com/Tao-2026/cyber-snake/compare/archive-v007-2026-08-17...archive-v008-2026-08-17) (`7aaabc6`): Firebase Anonymous Authentication, Firestore shared global Top 3, localStorage offline fallback, security rules, personal bests, and duplicate-submission protection.

[Unreleased]: https://github.com/Tao-2026/cyber-snake/compare/v0.9.0-beta.1...HEAD
[0.9.0-beta.1]: https://github.com/Tao-2026/cyber-snake/compare/archive-v008-2026-08-17...v0.9.0-beta.1
