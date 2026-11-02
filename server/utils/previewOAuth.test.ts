import { describe, expect, it } from 'vitest'
import { getPreviewOAuthCallbackURL, getPreviewOAuthRedirectURL } from './previewOAuth'

describe('getPreviewOAuthRedirectURL', () => {
  it('sends a deploy preview through the production relay', () => {
    expect(getPreviewOAuthRedirectURL('deploy-preview-48--gitvault.netlify.app'))
      .toBe('https://gitvault.netlify.app/auth/github/relay/48')
  })

  it('leaves production, branch deploys and local dev alone', () => {
    expect(getPreviewOAuthRedirectURL('gitvault.netlify.app')).toBeUndefined()
    expect(getPreviewOAuthRedirectURL('feat-x--gitvault.netlify.app')).toBeUndefined()
    expect(getPreviewOAuthRedirectURL('localhost:3000')).toBeUndefined()
  })
})

describe('getPreviewOAuthCallbackURL', () => {
  it('targets the preview of the same site', () => {
    expect(getPreviewOAuthCallbackURL('gitvault.netlify.app', '48'))
      .toBe('https://deploy-preview-48--gitvault.netlify.app/auth/github')
  })

  it('refuses anything but a PR number, so the code never leaves the site', () => {
    expect(getPreviewOAuthCallbackURL('gitvault.netlify.app', 'evil.com')).toBeUndefined()
    expect(getPreviewOAuthCallbackURL('gitvault.netlify.app', '48@evil.com')).toBeUndefined()
    expect(getPreviewOAuthCallbackURL('gitvault.netlify.app', undefined)).toBeUndefined()
  })
})
