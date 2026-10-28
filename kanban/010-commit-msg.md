---
id: 010
title: Hook git commit-msg
status: done
epic: E02
app: site
depends_on: []
adr: 0001
verify: commit avec `Co-Authored-By` refusé
---

# 010 — Hook git commit-msg

## Action

`.githooks/commit-msg` : refuse `Co-Authored-By`, un auteur autre que breakyt, et un sujet sans `[NNN]` (ou `[hotfix]`). Activation : `git config core.hooksPath .githooks`.
