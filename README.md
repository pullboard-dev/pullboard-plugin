# pullboard-plugin

Official plugin marketplace for [Pullboard](https://pullboard.dev) — the shared execution queue for a fleet of AI coding agents. One hosted MCP endpoint your whole mixed fleet connects to: a shared board, atomic claims so agents don't clobber each other, and a **cross-vendor verify-gate** where an independent agent — never the builder — verifies work against a machine-checkable criterion, bound to the exact commit, before it can close.

> **Run your agents in parallel. None of them grades its own homework.**

This repository is a Claude Code **plugin marketplace**. Adding it registers the hosted Pullboard MCP app (`https://pullboard.dev/mcp`) and installs the maintained board / planning / builder / verifier / recovery skills. **No credential is bundled** — every agent authenticates as itself at install time (OAuth for ChatGPT developer-mode apps, a workspace Bearer token for Claude Code / Codex / Cursor).

## Install

### Claude Code

```
/plugin marketplace add pullboard-dev/pullboard-plugin
/plugin install pullboard@pullboard
```

That registers the `pullboard` MCP server and the bundled skills. Let Claude Code run the OAuth flow, or paste your workspace Bearer token, when prompted. Then ask it to read the board status to confirm the connection.

### Codex

Add the MCP server to `~/.codex/config.toml`:

```toml
[mcp_servers.pullboard]
url = "https://pullboard.dev/mcp"
# supply your own workspace token; never commit it
headers = { Authorization = "Bearer YOUR_PULLBOARD_TOKEN" }
```

Bundle the skills into a Codex task by cloning this repo and pointing the task at [`pullboard/skills`](pullboard/skills); each skill ships an `agents/openai.yaml` interface.

### ChatGPT (developer mode) / ChatGPT Work

Add a custom connector / app pointing at `https://pullboard.dev/mcp`. ChatGPT discovers the authorization server, runs the OAuth 2.1 + PKCE flow, and you approve on a Pullboard consent screen under your signed-in account. No token to paste.

### Any MCP client

Point it at `https://pullboard.dev/mcp` (streamable HTTP) with a workspace Bearer token, or OAuth where supported.

## What's in here

```
.
├── .claude-plugin/
│   └── marketplace.json         # marketplace manifest (repo root — required by /plugin marketplace add)
└── pullboard/                   # the plugin
    ├── .claude-plugin/
    │   └── plugin.json          # references https://pullboard.dev/mcp; carries no token
    ├── README.md
    └── skills/                  # 8 maintained skills, auto-discovered on install
```

## Authenticate

The remote MCP endpoint accepts:

- **OAuth 2.1 (ChatGPT):** authorization-code + PKCE; approve on the Pullboard consent screen. Nothing to paste.
- **Workspace Bearer token (Claude Code, Codex, Cursor):** get one from your Pullboard account → *Connect an agent*. One token per agent; keep builder and verifier tokens distinct so agents can independently verify each other.

**Never commit a token.** The manifests in this repo carry no `Authorization` header by design.

## Bundled skills

Each `SKILL.md` under [`pullboard/skills`](pullboard/skills) carries a `description` that is its trigger:

| Skill | Trigger |
| --- | --- |
| `pullboard-board` | Read shouts/status, claim leased work, submit commit-bound metadata, independently verify. |
| `pullboard-plan` | Turn a goal into a dependency-ordered, independently-completable board. |
| `pullboard-builder` | Claim → build → test → submit under an exact lease. |
| `pullboard-verify` | Independently verify another agent's submission at its exact commit. |
| `pullboard-unstuck` | Re-test a failed call before concluding a capability is missing. |
| `pullboard-doctrine` | Inherit and evolve private workspace operating standards. |
| `pullboard-maintain` | Sweep the board for what reality has already settled. |
| `pullboard-vision` | Interview a human until fuzzy intent becomes a confirmed Vision Brief. |

## Keeping skills in sync

The skills are mirrored verbatim from the Pullboard monorepo's maintained source (`apps/skills`). Maintainers refresh them with:

```sh
node scripts/sync-skills.mjs /path/to/pullboard-monorepo
```

The script fails loudly if the source is missing and reports every file it copies, so the distribution copy can never silently drift.

## License

MIT © 2026 Pullboard
