import { z } from 'zod'

// `.` and `..` would let the URL resolve outside /repos/{owner}/{repo}
const isPathSegment = (segment: string) => segment !== '' && segment !== '.' && segment !== '..'

/**
 * Query of every route that targets one of the user's vault repos.
 * `path` comes out URL-encoded per segment, ready to put in a GitHub URL; it is '' at the repo root.
 */
export const vaultRepoQuerySchema = z.object({
  repo: z.string().regex(/^[\w.-]+$/).refine(isPathSegment),
  path: z.string()
    .refine(path => path.split('/').every(isPathSegment))
    .transform(path => path.split('/').map(encodeURIComponent).join('/'))
    .optional()
    .transform(path => path ?? ''),
})

type GitHubFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT'
  query?: Record<string, string>
  body?: Record<string, unknown>
}

/**
 * Calls the GitHub REST API as the session user. `endpoint` receives the user's login,
 * so a route can only reach the user's own repos. GitHub errors are rethrown with
 * GitHub's own message as `statusMessage`.
 */
export const github = async <T>(event: Parameters<typeof requireUserSession>[0], endpoint: (owner: string) => string, options: GitHubFetchOptions = {}): Promise<T> => {
  const { user, secure } = await requireUserSession(event)
  try {
    return await $fetch<T>(endpoint(user.login), {
      ...options,
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${secure?.tokens.access_token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
  }
  catch (error) {
    if (!(error instanceof Error) || !('statusCode' in error) || typeof error.statusCode !== 'number') throw error
    const data = 'data' in error ? error.data : undefined
    const message = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string' ? data.message : undefined
    throw createError({
      statusCode: error.statusCode,
      // statusMessage is a single header line
      statusMessage: message?.split('\n')[0] ?? error.message,
    })
  }
}
