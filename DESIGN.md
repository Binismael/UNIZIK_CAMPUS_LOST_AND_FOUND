# Visual Design Contract

`AGENTS.md` is the canonical statement of the blank-canvas rule — check
`app/routes/_index.tsx` and `app/global.css`, preserve any real UI/brand
already there, and only treat the canvas as blank when those files still show
the starter's placeholder. This file does not restate that rule; it records
**this app's** visual direction. The fields below are the source of truth for
that direction: once filled in, read and preserve them on every build; while
they are still empty, the first substantial UI pass fills them in.

## Non-negotiable: impress by default

When this app is still a blank canvas, every app generated from this template
must look **spectacular on first load**, even when the build prompt gives no
design direction. "Looks like a clean, intentional product" is the floor, not
the goal. When no direction is supplied, you still commit to one — do not
default to safe gray SaaS:

- Commit to one concrete visual world (see the `frontend-design` skill and its
  `references/visual-direction.md`). Do not ship the neutral placeholder theme.
- Choose a product-fitting accent family and set it in the `app/global.css`
  tokens for **both** light and dark. Never leave the 0%-saturation default as
  the shipped palette.
- Establish a clear type hierarchy, a consistent spacing rhythm, and one
  signature detail (a considered empty state, a distinctive header, a crafted
  primary action) that makes the surface feel designed for its domain.
- Get focus, hover, empty, loading, and dark-mode states right — that polish is
  the difference between an AI demo and a product.

Pick a direction and execute it fully; never average toward generic SaaS. Once
a direction is established and recorded below, preserve and extend it rather
than starting over unless otherwise directed to.

## Fill in before building the first surface

Once the fields below are filled in, they describe this app's established
visual direction — read and preserve them on every subsequent build; do not
re-derive a new direction. The first UI pass must fill these fields in as
part of that build, not leave them as an empty template.

- Product mode: `operate` (mobile-first campus utility; welcome/auth screens lean `persuade`)
- Audience and cadence: UNIZIK students, quick on-the-go sessions on phones (390px), occasional desktop (1280px).
- Visual world: "Campus noticeboard, calm and trustworthy" — deep teal surfaces with a warm amber signal for anything actionable or new.
- Palette family + neutral undertone: deep teal #0B3C49 (brand/primary), amber #FFB703 (accent, Found/Pending/New pills, Report CTA), light teal #EEF5F5 cards, ink #102A33, muted #3F565C, input border #B9CDCF, divider #D5E3E3, link #0E6F78. Light theme only (dark tokens mirror light). Tokens live in app/global.css as `brand`, `amber`, `surface`, `ink`, `muted-ink`, `line`, `divider`, `link`, `photo`.
- Type treatment: serif display (Cambria/Georgia, `font-display`) only for welcome/auth/complete-profile headlines; system sans everywhere else, bold 17px for buttons and card titles.
- Composition: mobile = brand top bar + bottom bar with raised amber Report button (amber pill behind active tab); desktop ≥1024px = 255px dark teal sidebar with amber "Report found item" + 88px top bar, content in 2-column grids. Auth screens split dark/white on desktop.
- Shape language: 12–16px radii, pill chips/badges, 52px buttons, 48px inputs, 44px+ tap targets, flat surfaces (no shadows except the raised Report button).
- Anti-references: generic gray SaaS dashboards, gradients, heavy shadows, dark mode, extra decorative icons/sections not in the CampusLostFound screen exports.

## Agent-Native is structural, not visual

This shell already meets the Agent-Native contract: data in SQL, actions as the
single source of truth, application state for navigation/selection, and
real-time sync. **Chat and the agent rail are opt-in, not default.** Build the
product UI first. Add an `AgentSidebar`, a full-page chat route, or
`sendToAgentChat` handoffs only when the user asks for agent interaction — and
when you do, follow `agent-native-toolkit` and `frontend-design` → Agent
Surface And Page Boundaries so the surfaces are wired correctly.

## Guardrails

- Keep semantic token names and shared component seams intact; express the
  direction through token _values_, type, spacing, and composition — not by
  forking the design system.
- Density comes from data, not prose. Subtract explanatory chrome; never
  subtract the visual craft that makes the app impressive.
- Compare against real products in the chosen mode, not against the starter.
