export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user,
      secure: {
        tokens,
      },
    })
    return sendRedirect(event, '/')
  },
})
