// Production end of the deploy-preview OAuth relay (see server/utils/previewOAuth.ts):
// forwards GitHub's callback (code, state) to the preview that started the login.
// Only ever targets this site's own previews, never an arbitrary host.
export default defineEventHandler((event) => {
  const callbackURL = getPreviewOAuthCallbackURL(getRequestHost(event), getRouterParam(event, 'pr'))
  if (!callbackURL) throw createError({ statusCode: 400, message: 'Invalid deploy preview' })
  return sendRedirect(event, callbackURL + getRequestURL(event).search)
})
