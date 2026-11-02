import { z } from 'zod'

const feedbackSchema = z.object({
  message: z.string().trim().min(1).max(5000),
})

/**
 * Opens a public issue on the GitVault repo as the session user (the `repo` scope covers it).
 * The only route that reaches a repo outside the user's own; the body carries nothing about their vaults.
 */
export default defineEventHandler(async (event) => {
  const { message } = await readValidatedBody(event, data => feedbackSchema.parse(data))
  const firstLine = message.split('\n')[0]!
  await github(event, () => '/repos/Evobaso-J/GitVault/issues', {
    method: 'POST',
    body: {
      title: `[Feedback] ${firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine}`,
      body: message,
    },
  })
  setResponseStatus(event, 204)
})
