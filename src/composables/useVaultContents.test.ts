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
/** Files already in the fake repo: path → sha */
let existing: Record<string, string>
let putStatus: number
const unregister: (() => void)[] = []

beforeEach(() => {
  requests = []
  existing = {}
  putStatus = 200
  routeParams.repo = 'gitvault-test'
  routeParams.path = ['docs', '2026']
  clearNuxtState(['vault-uploads', 'vault-uploads-processing'])
  // h3 v1 event, as created by @nuxt/test-utils
  unregister.push(
    registerEndpoint('/gh-repo-contents', {
      method: 'PUT',
      handler: async (event) => {
        if (!event.web?.url || !event.web.request) throw new Error('expected a web event')
        requests.push({
          query: Object.fromEntries(event.web.url.searchParams),
          body: await event.web.request.json(),
        })
        return new Response('{}', { status: putStatus })
      },
    }),
    registerEndpoint('/gh-repo-contents', {
      method: 'GET',
      handler: (event) => {
        const path = event.web?.url?.searchParams.get('path') ?? ''
        const sha = existing[path]
        return sha
          ? Response.json({ type: 'file', path, sha })
          : new Response('{}', { status: 404 })
      },
    }),
  )
})

afterEach(() => unregister.splice(0).forEach(fn => fn()))

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
  describe('upload', () => {
    it('uploads into the current folder', async () => {
      const vault = await setup()
      await vault.upload([new File(['hello'], 'a.txt')])

      expect(requests).toEqual([{
        query: { repo: 'gitvault-test', path: 'docs/2026/a.txt' },
        body: { content: btoa('hello'), message: 'feat: upload file' },
      }])
      expect(vault.uploads.value.map(upload => upload.status)).toEqual(['done'])
    })

    it('uploads at the repo root', async () => {
      routeParams.path = undefined
      await (await setup()).upload([new File(['hello'], 'a.txt')])

      expect(requests[0]?.query.path).toBe('a.txt')
    })

    it('encodes non-ASCII content as base64 of its UTF-8 bytes', async () => {
      await (await setup()).upload([new File(['venerdì'], 'a.txt')])

      expect(requests[0]?.body.content).toBe('dmVuZXJkw6w=')
    })

    it('uploads several files one after the other', async () => {
      await (await setup()).upload([new File(['1'], 'a.txt'), new File(['2'], 'b.txt')])

      expect(requests.map(request => request.query.path)).toEqual(['docs/2026/a.txt', 'docs/2026/b.txt'])
    })

    it('waits on a file that already exists, then replaces it with its sha', async () => {
      existing['docs/2026/a.txt'] = 'abc123'
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.txt'), new File(['2'], 'b.txt')])

      expect(vault.uploads.value.map(upload => upload.status)).toEqual(['conflict', 'done'])
      expect(requests.map(request => request.query.path)).toEqual(['docs/2026/b.txt'])

      await vault.resolveConflict(vault.uploads.value[0]!.id, 'replace')

      expect(requests[1]).toEqual({
        query: { repo: 'gitvault-test', path: 'docs/2026/a.txt' },
        body: { content: btoa('new'), message: 'feat: replace file', sha: 'abc123' },
      })
    })

    it('keeps both files under the first free numbered name', async () => {
      existing['docs/2026/a.txt'] = 'abc123'
      existing['docs/2026/a (1).txt'] = 'def456'
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.txt')])
      await vault.resolveConflict(vault.uploads.value[0]!.id, 'keepBoth')

      expect(requests).toEqual([{
        query: { repo: 'gitvault-test', path: 'docs/2026/a (2).txt' },
        body: { content: btoa('new'), message: 'feat: upload file' },
      }])
    })

    it('uploads to the given path and keeps both on a clash without asking', async () => {
      existing['Photos/2026/10/a.jpg'] = 'abc123'
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.jpg')], { getPath: () => 'Photos/2026/10/a.jpg', keepBoth: true })

      expect(requests.map(request => request.query.path)).toEqual(['Photos/2026/10/a (1).jpg'])
      expect(vault.uploads.value[0]?.status).toBe('done')
    })

    it('keeps the given path when it is free, even with keepBoth', async () => {
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.jpg')], { getPath: () => 'Photos/2026/10/a.jpg', keepBoth: true })

      expect(requests.map(request => request.query.path)).toEqual(['Photos/2026/10/a.jpg'])
    })

    it('skips a conflicting file without writing it', async () => {
      existing['docs/2026/a.txt'] = 'abc123'
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.txt')])
      await vault.resolveConflict(vault.uploads.value[0]!.id, 'skip')

      expect(requests).toEqual([])
      expect(vault.uploads.value[0]?.status).toBe('skipped')
    })

    it('marks a failed write and moves on to the next file', async () => {
      putStatus = 422
      const vault = await setup()
      await vault.upload([new File(['1'], 'a.txt'), new File(['2'], 'b.txt')])

      expect(vault.uploads.value.map(upload => upload.status)).toEqual(['error', 'error'])
    })

    it('clears the finished uploads but keeps the pending ones', async () => {
      existing['docs/2026/a.txt'] = 'abc123'
      const vault = await setup()
      await vault.upload([new File(['new'], 'a.txt'), new File(['2'], 'b.txt')])
      vault.clearUploads()

      expect(vault.uploads.value.map(upload => upload.file.name)).toEqual(['a.txt'])
    })
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

  it('reports an error when a toast write fails', async () => {
    putStatus = 422

    expect(await (await setup()).createFolder('photos')).toBe('error')
  })

  it('writes nothing without a repo in the route', async () => {
    routeParams.repo = undefined
    const vault = await setup()

    expect(await vault.createFolder('photos')).toBe('error')
    await vault.upload([new File(['hello'], 'a.txt')])
    expect(requests).toEqual([])
  })
})
