import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'
import { useVaultContents } from './useVaultContents'

const { routeParams } = vi.hoisted(() => ({
  routeParams: {} as { repo?: string, path?: string[] },
}))

mockNuxtImport('useRoute', () => () => ({ params: routeParams }))

type PutRequest = { query: Record<string, string>, body: GhRepoContentsRequestParams }

let requests: PutRequest[]
let unregister: () => void

const respondWith = (status: number) => {
  unregister?.()
  unregister = registerEndpoint('/gh-repo-contents', {
    method: 'PUT',
    handler: async (event) => {
      if (!event.web?.url || !event.web.request) throw new Error('expected a web event')
      requests.push({
        query: Object.fromEntries(event.web.url.searchParams),
        body: await event.web.request.json(),
      })
      return new Response('{}', { status })
    },
  })
}

beforeEach(() => {
  requests = []
  routeParams.repo = 'gitvault-test'
  routeParams.path = ['docs', '2026']
  respondWith(200)
})

afterEach(() => unregister())

// useI18n and useToast need a component setup context
const setup = async () => {
  let vault!: ReturnType<typeof useVaultContents>
  await mountSuspended(defineComponent({
    setup: () => {
      vault = useVaultContents()
      return () => null
    },
  }))
  return vault
}

describe('useVaultContents', () => {
  it('uploads into the current folder', async () => {
    const status = await (await setup()).upload(new File(['hello'], 'a.txt'))

    expect(status).toBe('success')
    expect(requests).toEqual([{
      query: { repo: 'gitvault-test', path: 'docs/2026/a.txt' },
      body: { content: btoa('hello'), message: 'feat: upload file' },
    }])
  })

  it('uploads at the repo root', async () => {
    routeParams.path = undefined
    await (await setup()).upload(new File(['hello'], 'a.txt'))

    expect(requests[0]?.query.path).toBe('a.txt')
  })

  it('encodes non-ASCII content as base64 of its UTF-8 bytes', async () => {
    await (await setup()).upload(new File(['venerdì'], 'a.txt'))

    expect(requests[0]?.body.content).toBe('dmVuZXJkw6w=')
  })

  it('replaces a file at its own path with its sha', async () => {
    await (await setup()).replace(new File(['new'], 'other-name.txt'), { path: 'notes/a.txt', sha: 'abc123' })

    expect(requests).toEqual([{
      query: { repo: 'gitvault-test', path: 'notes/a.txt' },
      body: { content: btoa('new'), message: 'feat: replace file', sha: 'abc123' },
    }])
  })

  it('creates a folder as an empty .gitkeep', async () => {
    const status = await (await setup()).createFolder('photos')

    expect(status).toBe('success')
    expect(requests).toEqual([{
      query: { repo: 'gitvault-test', path: 'docs/2026/photos/.gitkeep' },
      body: { content: '', message: 'Create folder' },
    }])
  })

  it('reports an error when the write fails', async () => {
    respondWith(422)

    expect(await (await setup()).upload(new File(['hello'], 'a.txt'))).toBe('error')
  })

  it('reports an error without a repo in the route', async () => {
    routeParams.repo = undefined

    expect(await (await setup()).createFolder('photos')).toBe('error')
    expect(requests).toEqual([])
  })
})
