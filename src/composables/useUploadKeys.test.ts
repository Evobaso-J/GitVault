import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport, mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { H3Event } from 'h3'
import { iosConnectUrl, useUploadKeys } from './useUploadKeys'

const { routeParams } = vi.hoisted(() => ({
  routeParams: {} as { repo?: string },
}))

mockNuxtImport('useRoute', () => () => ({ params: routeParams }))

const KID = '0123456789abcdef0123456789abcdef'
const record = { platform: 'ios', createdAt: '2026-10-31T02:00:00.000Z' }
let requests: { method: string, query: Record<string, string>, body?: unknown }[]
let registry: boolean
const unregister: (() => void)[] = []

beforeEach(() => {
  requests = []
  registry = true
  routeParams.repo = 'gitvault-test'
  clearNuxtData()
  clearNuxtState()
  const track = async (event: H3Event, method: string) => {
    if (!event.web?.url || !event.web.request) throw new Error('expected a web event')
    requests.push({ method, query: Object.fromEntries(event.web.url.searchParams), body: method === 'GET' ? undefined : await event.web.request.json() })
  }
  unregister.push(
    registerEndpoint('/gh-repo-contents', {
      method: 'GET',
      handler: async (event) => {
        await track(event, 'GET')
        const path = event.web?.url?.searchParams.get('path')
        if (!registry) return new Response('{}', { status: 404 })
        if (path === '.gitvault/keys') return Response.json([{ type: 'file', name: `${KID}.json`, path: `.gitvault/keys/${KID}.json`, sha: 'reg-sha' }])
        if (path === `.gitvault/keys/${KID}.json`) return Response.json({ type: 'file', path, sha: 'reg-sha', content: btoa(JSON.stringify(record)) })
        return new Response('{}', { status: 404 })
      },
    }),
    registerEndpoint('/gh-repo-contents', {
      method: 'DELETE',
      handler: async (event) => {
        await track(event, 'DELETE')
        return new Response('{}')
      },
    }),
    registerEndpoint('/upload-key', {
      method: 'POST',
      handler: async (event) => {
        await track(event, 'POST')
        return Response.json({ key: 'gvk1.sealed', kid: KID })
      },
    }),
  )
})

afterEach(() => unregister.splice(0).forEach(fn => fn()))

// useI18n and useToast need a component setup context
const setup = async () => {
  let uploadKeys!: ReturnType<typeof useUploadKeys>
  await mountSuspended(defineComponent({
    setup: () => {
      uploadKeys = useUploadKeys()
      return () => null
    },
  }))
  await uploadKeys.refresh()
  return uploadKeys
}

describe('useUploadKeys', () => {
  it('lists the keys from their registry files', async () => {
    const { keys } = await setup()

    expect(keys.value).toEqual([{ ...record, kid: KID, sha: 'reg-sha' }])
  })

  it('has no keys when the registry folder does not exist', async () => {
    registry = false
    const { keys, error } = await setup()

    expect(keys.value).toEqual([])
    expect(error.value).toBeFalsy()
  })

  it('issues a key for a platform and returns it once', async () => {
    const { create } = await setup()

    expect(await create('android')).toEqual({ key: 'gvk1.sealed', kid: KID })
    expect(requests.find(request => request.method === 'POST')).toEqual({ method: 'POST', query: {}, body: { repo: 'gitvault-test', platform: 'android' } })
  })

  it('revokes a key by deleting its registry file with its sha', async () => {
    const { keys, revoke } = await setup()

    expect(await revoke(keys.value[0]!)).toBe('success')
    expect(requests.find(request => request.method === 'DELETE')).toEqual({
      method: 'DELETE',
      query: { repo: 'gitvault-test', path: `.gitvault/keys/${KID}.json` },
      body: { message: 'feat: delete file', sha: 'reg-sha' },
    })
  })

  it('builds the shortcut link with the ingest URL and the key as a JSON text input', () => {
    const url = iosConnectUrl('https://vault.example/ingest', 'gvk1.a+b/c')
    const parsed = new URL(url)

    expect(url.startsWith('shortcuts://run-shortcut?name=GitVault%20Backup&input=text&text=')).toBe(true)
    expect(JSON.parse(parsed.searchParams.get('text')!)).toEqual({ url: 'https://vault.example/ingest', key: 'gvk1.a+b/c' })
  })
})
