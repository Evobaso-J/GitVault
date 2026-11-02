// Netlify deploy previews live on per-PR hosts (`deploy-preview-<pr>--<site>`) that the
// GitHub OAuth app cannot list as callbacks. A preview sends GitHub to the production
// relay instead, a sub-path of the registered callback, which bounces the code back.
const PREVIEW_HOST = /^deploy-preview-(\d+)--([a-z0-9.-]+)$/i

/** OAuth callback for a deploy preview host, `undefined` everywhere else. */
export const getPreviewOAuthRedirectURL = (host: string) => {
  const match = host.match(PREVIEW_HOST)
  return match ? `https://${match[2]}/auth/github/relay/${match[1]}` : undefined
}

/** Preview callback the production relay forwards to; `undefined` for anything but a PR number. */
export const getPreviewOAuthCallbackURL = (productionHost: string, pr: string | undefined) =>
  pr && /^\d+$/.test(pr) ? `https://deploy-preview-${pr}--${productionHost}/auth/github` : undefined
