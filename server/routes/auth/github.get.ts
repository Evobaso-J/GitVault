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
  // delete_repo: deleting a vault deletes the repo. Changing scopes needs a new sign-in.
  config: { scope: ['repo', 'delete_repo'] },
})
