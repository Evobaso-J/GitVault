# Landing Page Plan

## Status (2026-11-02)
Built: `/` (prerendered) with components in `src/components/Landing/`, app moved under `/vaults`. Prototype: [GitVault Rotator Showcase](https://claude.ai/artifact/7xMfFbXGu9uwGUf7naj6T5): the Rotator hero plus "Showcase" below the fold, i.e. small, truthful product visuals next to each step and each reason (private artifact; HTML prototype, not production code).

FAQ behaviour the owner asked for: opening an answer must not move the content below it. In the prototype only one answer is open at a time (`<details name>`), and the panel's min-height is set to its tallest open state. In Nuxt, use `UAccordion` (single mode) with a reserved height, or measure the same way.

## Decisions
- **Audience**: generic users, not developers. They understand "unlimited free storage" and "a drive with folders", not commits. Power-user angles (GitHub Actions on a vault) are left out for now.
- **Route**: public `/`, rendered with SSR. The app is a client-only SPA today, so `/` needs its own `routeRules` entry; every other route stays client-only.
- **Language**: EN only. Copy goes in `src/locales/en-US.json` like every other string.
- **CTA**: one primary action, "Sign in with GitHub". Under it: "Free GitHub account required. No account? Create one in a minute →" (links to github.com/signup). Account creation is also step 1 of "How it works".
- **Pitch**: "Unlimited free storage, on your own GitHub." Limits are stated plainly in the FAQ (100 MB per file, 1–5 GB recommended per repo, GitHub rate limits). "No third-party servers" is not claimed: it is false (GitHub hosts the files, Netlify proxies the calls) and is not a feature.
- **Not on the page**: mobile app (plan 08, not built), pricing table, testimonials, feature grid. Features get one line: "a standard file drive".
- **FAQ order**: price first. The answer about access to other repos must stay true to the OAuth `repo` scope (GitHub grants access to every repo; GitVault only touches repos with the `gitvault` topic).

"Why GitVault" is a switcher, chosen by the owner over a bento and a dark band, because the 3-card version looked identical to "How it works". From 900px up, the 3 reasons are vertical tabs on the left and one fixed-height stage on the right shows the active visual, so switching doesn't move the page. Auto-advance runs every 5 s, stops for good on the first click, key press or focus, and never runs under reduced motion. Arrow keys, Home and End switch reasons. Tab ARIA is added only on desktop. Below 900px, and without JS, it's a plain list with each visual under its copy. In Nuxt, build it as a `UTabs`-style vertical tablist with the same rules as the rotator: timers start in `onMounted`, use `usePreferredReducedMotion`, and SSR renders the first reason.

## Copy
Final copy lives in the prototype; move it into `en-US.json` when building. One change from the rest of the copy: the Rotator headline reads "Unlimited free storage / for your {photos|documents|music|videos|files}, / on your own GitHub."

## Design
"Clean" direction: white page, cool blue-tinted greys, the app's `royal-blue` scale used only for actions and progress. Fonts: Schibsted Grotesk for display headings only; all other text uses the app's own font (Tailwind's default system stack, since `main.css` sets none), so the look doesn't change at sign-in. Not yet confirmed by the owner. Hero: headline and CTA on top, a full-width file-browser mock below, with a live upload row. Sections: How it works (3 steps), one-line features, Why GitVault, FAQ, final CTA, footer.

The mock should mirror the real app (`src/layouts/default.vue`, vault navigation, `FolderContents/Table`): vault sidebar, search, "New folder", "Upload file", summary line, Name/Type/Size table, drop hint. No invented domain or username.

## Rotator: build it carefully
The owner saw buggy motion in the prototype's word rotator. That's fine for a prototype; the real build must not inherit the prototype's approach. Requirements:
- **SSR / no JS / reduced motion**: the server renders the final word "files". Rotation starts only on mount, and only when `prefers-reduced-motion` is not set.
- **Screen readers**: they read the full sentence once (visually hidden text). The rotating part is `aria-hidden`.
- **No layout jumps**: the prototype's bug is that the comma sits after the animated box, which changes width while the outgoing and incoming words overflow onto it. Put the comma inside each word (`photos,`), so the box ends the line and needs no width animation. Stack the outgoing and incoming words in one grid cell instead of using `position: absolute`. Move both words in lockstep (same duration and easing, no delay, no fade), each by exactly 100% of its height, and clip tight to the box. With different timings or partial offsets (the prototype's first version used 85% plus a delay), both words are visible at once and overlap. Details: `.ui-design/reviews/clean-a-rotator_20261102_190000.md`.
- **Constant width**: put an invisible copy of the longest word ("documents,") in the same grid cell, so the box always has that width. Otherwise the line's min-content changes with each word: in a grid track with an `auto` minimum (`1.5fr`), the column resizes and the hero reflows on every swap. Use `minmax(0, …)` tracks as well.
- **Narrow phones**: line 2 doesn't wrap; check "for your documents," at 360px.
- **SPA cleanup**: start the timers in `onMounted`, clear them in `onBeforeUnmount` (or use VueUse helpers that clean up on their own), and react to changes in the reduced-motion setting (`usePreferredReducedMotion`).
- **WCAG 2.2.2**: stop after a few cycles, or add a pause control if it loops forever.
- **Mock sync**: highlighting the matching folder is optional; drop it if it adds complexity.

## Related
The vault storage-usage chip and the "create a new vault" hint are tracked separately. They back the FAQ answer "when a vault fills up, create another one".
