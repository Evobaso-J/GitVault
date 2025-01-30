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
  config: { scope: ['repo'] },
})
