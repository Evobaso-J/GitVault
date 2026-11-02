export default defineOAuthGitHubEventHandler({
  onSuccess: async (event, { user, tokens }) => {
    await setUserSession(event, {
      user,
      secure: {
        tokens,
      },
    })
    return sendRedirect(event, '/')
  },
  // delete_repo: deleting a vault deletes the repo. A session keeps the scopes granted at sign-in.
  config: { scope: ['repo', 'delete_repo'] },
})
