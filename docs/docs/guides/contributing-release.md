---
sidebar_position: 6
title: Release Framework
---

# Release Framework

## Versioning

RAG Axis follows semantic versioning strictly.

- PATCH: bug fixes, no API changes
- MINOR: new features, backwards compatible
- MAJOR: breaking changes, invariant relaxations, Protocol changes

## Commit Convention

Conventional Commits format required on all commits to main.

- feat: new feature
- fix: bug fix
- docs: documentation only
- refactor: no behaviour change
- test: test additions or fixes
- chore: build, tooling, dependencies
- breaking: breaking change (must include BREAKING CHANGE footer)

## Release Steps

1. Update CHANGELOG.md with all changes since last release
2. Bump version in pyproject.toml
3. Create and push version tag: git tag v0.x.y
4. GitHub Actions publishes to PyPI via Trusted Publishing (OIDC)
5. Create GitHub Release with CHANGELOG section as body

## Pre-1.0 Policy

Adapter Protocols may evolve with minor version notice in CHANGELOG.
All invariants still apply in full from v0.1 onward.
