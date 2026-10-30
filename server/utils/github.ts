import { z } from 'zod'
import { isRepoNameValid } from '~/resources/CDNUserRepos/utils'

// `.` and `..` would let the URL resolve outside /repos/{owner}/{repo}
export const isPathSegment = (segment: string) => segment !== '' && segment !== '.' && segment !== '..'

/**
 * Query of every route that targets one of the user's vault repos.
 * `path` comes out URL-encoded per segment, ready to put in a GitHub URL; it is '' at the repo root.
 */
export const vaultRepoQuerySchema = z.object({
  repo: z.string().refine(isRepoNameValid),
  path: z.string()
    .refine(path => path.split('/').every(isPathSegment))
    .transform(path => path.split('/').map(encodeURIComponent).join('/'))
    .optional()
    .transform(path => path ?? ''),
})

type GitHubFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Record<string, string>
  body?: Record<string, unknown>
  /** Act as this user instead of the session user: for routes authenticated by an upload key */
  auth?: { login: string, token: string }
}

/**
 * Calls the GitHub REST API as the session user (or `options.auth`). `endpoint` receives the user's login,
 * so a route can only reach the user's own repos. GitHub errors are rethrown with
 * GitHub's own message as `statusMessage`.
 */
export const github = async <T>(event: Parameters<typeof requireUserSession>[0], endpoint: (owner: string) => string, { auth, ...options }: GitHubFetchOptions = {}): Promise<T> => {
  const session = auth ? undefined : await requireUserSession(event)
  const login = auth?.login ?? session?.user.login ?? ''
  const token = auth?.token ?? session?.secure?.tokens.access_token
  try {
    return await $fetch<T>(endpoint(login), {
      ...options,
      baseURL: 'https://api.github.com',
      headers: {
        'Authorization': `Bearer ${token}`,
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
