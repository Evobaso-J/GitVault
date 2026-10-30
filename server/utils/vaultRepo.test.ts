import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { createVaultRepo } from './vaultRepo'
import { github } from './github'

vi.mock('./github', () => ({ github: vi.fn() }))

const githubMock = vi.mocked(github)
const event = {} as H3Event
// GitHub normalizes the requested name; the topic call must use the one it returns
const created = { name: 'gitvault-my-notes' }

const endpointOf = (call: number) => githubMock.mock.calls[call]![1]('octo')

beforeEach(() => {
  githubMock.mockReset()
})

describe('createVaultRepo', () => {
  it('creates the repo, then sets the gitvault topic on the name GitHub returned', async () => {
    githubMock.mockResolvedValueOnce(created).mockResolvedValueOnce({ names: ['gitvault'] })

    await expect(createVaultRepo(event, { name: 'gitvault-my notes', private: true })).resolves.toEqual(created)

    expect(endpointOf(0)).toBe('/user/repos')
    expect(githubMock.mock.calls[0]![2]).toEqual({ method: 'POST', body: { name: 'gitvault-my notes', private: true } })
    expect(endpointOf(1)).toBe('/repos/octo/gitvault-my-notes/topics')
    expect(githubMock.mock.calls[1]![2]).toEqual({ method: 'PUT', body: { names: ['gitvault'] } })
  })

  it('names the created repo when tagging fails, keeping the status', async () => {
    githubMock.mockResolvedValueOnce(created).mockRejectedValueOnce(createError({ statusCode: 403, statusMessage: 'Resource not accessible' }))

    await expect(createVaultRepo(event, { name: 'gitvault-my-notes', private: true })).rejects.toMatchObject({
      statusCode: 403,
      statusMessage: 'Repository gitvault-my-notes was created but could not be tagged as a vault: Resource not accessible',
    })
  })

  it('does not try to tag when creation fails', async () => {
    githubMock.mockRejectedValueOnce(createError({ statusCode: 422, statusMessage: 'name already exists on this account' }))

    await expect(createVaultRepo(event, { name: 'gitvault-a', private: true })).rejects.toMatchObject({ statusCode: 422 })
    expect(githubMock).toHaveBeenCalledTimes(1)
  })
})
