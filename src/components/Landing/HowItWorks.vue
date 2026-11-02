<template>
  <section
    id="how"
    class="band band-tint"
  >
    <div class="wrap">
      <h2 class="h2">
        {{ $t('landing.how.title') }}
      </h2>
      <ol class="steps">
        <li>
          <div
            class="viz"
            aria-hidden="true"
          >
            <div class="mock">
              <div class="mock-h">
                <UIcon
                  name="i-simple-icons-github"
                  class="ic"
                />{{ $t('landing.how.step1.mock.title') }}
              </div>
              <div class="mock-b">
                <div class="field">
                  <span>{{ $t('landing.how.step1.mock.email') }}</span>
                  <div class="input">
                    {{ $t('landing.how.step1.mock.emailValue') }}
                  </div>
                </div>
                <div class="field">
                  <span>{{ $t('landing.how.step1.mock.username') }}</span>
                  <div class="input">
                    {{ $t('landing.how.step1.mock.usernameValue') }}
                  </div>
                </div>
                <span class="mbtn gh">{{ $t('landing.how.step1.mock.continue') }}</span>
              </div>
            </div>
          </div>
          <div class="step-copy">
            <h3>{{ $t('landing.how.step1.title') }}</h3>
            <p>{{ $t('landing.how.step1.text') }}</p>
          </div>
        </li>
        <li>
          <div
            class="viz"
            aria-hidden="true"
          >
            <div class="consent">
              <span class="mbtn solid"><UIcon
                name="i-simple-icons-github"
                class="ic-sm"
              />{{ $t('landing.how.step2.mock.button') }}</span>
              <span class="wire" />
              <div class="mock">
                <div class="mock-h">
                  <LandingLogo class="logo size-5" />{{ $t('landing.how.step2.mock.authorize') }}
                </div>
                <div class="mock-b">
                  <div class="perm">
                    <UIcon
                      name="i-mdi-source-repository"
                      class="ic"
                    />
                    <div>
                      <b>{{ $t('landing.how.step2.mock.repos') }}</b><span class="muted">{{ $t('landing.how.step2.mock.scope') }}</span>
                    </div>
                  </div>
                  <span class="mbtn gh">{{ $t('landing.how.step2.mock.cta') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="step-copy">
            <h3>{{ $t('landing.how.step2.title') }}</h3>
            <p>{{ $t('landing.how.step2.text') }}</p>
          </div>
        </li>
        <li>
          <div
            class="viz"
            aria-hidden="true"
          >
            <div class="vault-stack">
              <div class="mock">
                <div class="mock-h">
                  {{ $t('createRepo') }}<UIcon
                    name="i-mdi-close"
                    class="ic-sm x"
                  />
                </div>
                <div class="mock-b">
                  <div class="input on">
                    {{ $t('landing.how.step3.mock.value') }}<span class="caret" />
                  </div>
                  <div class="row-end">
                    <span class="mbtn outlined">{{ $t('cancel') }}</span><span class="mbtn outlined">{{ $t('create') }}</span>
                  </div>
                </div>
              </div>
              <div class="mini-side">
                <div class="side-label">
                  {{ $t('vaults') }}
                </div>
                <div class="nav-item">
                  <UIcon
                    name="i-mdi-archive-outline"
                    class="ic"
                  />personal
                </div>
                <div class="nav-item new">
                  <UIcon
                    name="i-mdi-archive-outline"
                    class="ic"
                  />{{ $t('landing.how.step3.mock.value') }}
                </div>
              </div>
            </div>
          </div>
          <div class="step-copy">
            <h3>{{ $t('landing.how.step3.title') }}</h3>
            <p>{{ $t('landing.how.step3.text') }}</p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.steps { list-style: none; margin: 48px 0 0; padding: 0; display: grid; gap: 20px; counter-reset: s; }
.steps > li { counter-increment: s; display: grid; grid-template-rows: auto 1fr; background: var(--lp-raised); border: 1px solid var(--lp-line); border-radius: 20px; padding: 10px; min-width: 0; }
/* Desktop: the 3 cards share two row tracks (subgrid), so every visual and every copy block lines up. */
@media (min-width: 960px) {
  .steps { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: auto auto; row-gap: 0; }
  .steps > li { grid-row: span 2; grid-template-rows: subgrid; }
}
.viz { min-height: 236px; }
.step-copy { padding: 22px 14px 16px; display: grid; gap: 6px; align-content: start; }
.step-copy::before { content: counter(s); width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: var(--lp-primary); color: var(--lp-primary-fg); font: 600 14px/1 "Schibsted Grotesk", ui-sans-serif, system-ui, sans-serif; margin-bottom: 10px; }
h3 { font-size: 20px; font-weight: 600; line-height: 1.25; letter-spacing: -0.015em; }
.step-copy p { color: var(--lp-muted); max-width: 34ch; }

/* step 1: sign-up form */
.field { display: grid; gap: 5px; }
.field > span { font-size: 12px; font-weight: 600; color: var(--lp-fg); }
.input { height: 32px; border: 1px solid var(--lp-line); border-radius: 6px; padding-inline: 10px; display: flex; align-items: center; color: var(--lp-muted); background: var(--lp-bg); }
.input.on { border-color: var(--lp-primary); box-shadow: 0 0 0 2px var(--lp-primary-soft); color: var(--lp-fg); }
/* Blinks a few times, then stays on (no endless blinking, WCAG 2.2.2). */
.caret { width: 1.5px; height: 15px; background: var(--lp-fg); margin-left: 1px; animation: blink 1.1s steps(1) 4; }
@keyframes blink { 50% { opacity: 0; } }
.row-end { display: flex; justify-content: flex-end; gap: 8px; }

/* step 2: sign-in button + GitHub consent */
.consent { display: grid; justify-items: center; width: 100%; max-width: 300px; }
.consent > .mbtn.solid { height: 38px; padding-inline: 16px; font-size: 14px; box-shadow: var(--lp-shadow-lg); }
.wire { width: 2px; height: 22px; background: repeating-linear-gradient(var(--lp-primary-line) 0 4px, transparent 4px 8px); }
.perm { display: flex; align-items: center; gap: 10px; }
.perm .ic { color: var(--lp-muted); }
.perm b { display: block; font-weight: 600; }

/* step 3: create-vault modal + sidebar */
.vault-stack { width: 100%; max-width: 300px; display: grid; gap: 12px; }
.mini-side { background: var(--lp-raised); border: 1px solid var(--lp-line); border-radius: 12px; padding: 8px; font: 500 13px/1.3 var(--lp-font-text); box-shadow: var(--lp-shadow-lg); }
.mini-side .side-label { padding: 4px 8px 6px; font-size: 11px; }
.mini-side .nav-item { padding: 5px 8px; }
.mini-side .nav-item.new { background: var(--lp-primary-soft); color: var(--lp-primary-ink); }
.mini-side .nav-item.new .ic { color: var(--lp-primary); }
</style>
