export default defineEventHandler(event => defineOAuthGitHubEventHandler({
  onSuccess: async (event, { user, tokens }) => {
    await setUserSession(event, {
      user,
      secure: {
        tokens,
      },
    })
    return sendRedirect(event, '/vaults')
  },
  config: {
    // delete_repo: deleting a vault deletes the repo. A session keeps the scopes granted at sign-in.
    scope: ['repo', 'delete_repo'],
    // Deploy previews log in through the production relay; elsewhere the request URL is used
    redirectURL: getPreviewOAuthRedirectURL(getRequestHost(event)),
  },
})(event))
