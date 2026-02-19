---
"create-momo": patch
---

Remove `momo init` command and unify the CLI entry point. `create-momo <name>` now routes directly to project creation via binary name detection. Running `momo` alone outside a project launches the creation wizard; inside a project it shows the help menu.
