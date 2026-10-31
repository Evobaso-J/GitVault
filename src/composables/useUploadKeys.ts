import { IOS_SHORTCUT_NAME } from '~/config'
import { decodeBase64Utf8 } from '~/resources/CDNFiles/utils'
import type { UploadKeyRecord, UploadKeyRequest, UploadKeyResponse } from '~~/server/resources/uploadKey'

export type UploadKey = UploadKeyRecord & { kid: string, sha: string }

/** `shortcuts://` link that runs the backup shortcut with the ingest URL and the key as its input, for it to save */
export const iosConnectUrl = (ingestUrl: string, key: string): string =>
  `shortcuts://run-shortcut?name=${encodeURIComponent(IOS_SHORTCUT_NAME)}&input=text&text=${encodeURIComponent(JSON.stringify({ url: ingestUrl, key }))}`

const isNotFound = (error: unknown) => error instanceof Error && 'statusCode' in error && error.statusCode === 404

/**
 * Upload keys of the active vault, one registry file each under `UPLOAD_KEYS_DIR`:
 * issuing writes the file and seals the key, revoking deletes the file.
 */
export const useUploadKeys = () => {
  const route = useRoute()
  const { runOperation } = useOperationToast()
  const { remove } = useVaultContents()
  const repo = computed(() => String(route.params.repo))

  const { data: keys, status, error, refresh } = useAsyncData(() => `upload-keys-${repo.value}`, async (): Promise<UploadKey[]> => {
    const entries = await $fetch('/gh-repo-contents', { query: { repo: repo.value, path: UPLOAD_KEYS_DIR } })
      .catch(error => isNotFound(error) ? [] : Promise.reject(error))
    if (!Array.isArray(entries)) return []
    // A handful of devices at most: one GET per registry file
    return Promise.all(entries.map(async ({ name, path, sha }) => {
      const file = await $fetch('/gh-repo-contents', { query: { repo: repo.value, path } })
      const record: UploadKeyRecord = JSON.parse(decodeBase64Utf8(!Array.isArray(file) && file.type === 'file' ? file.content : ''))
      return { ...record, kid: name.replace(/\.json$/, ''), sha }
    }))
  }, { default: () => [], watch: [repo] })

  /** The key is returned once and never stored: hand it to the phone right away */
  const create = async (platform: UploadKeyRequest['platform']): Promise<UploadKeyResponse | undefined> => {
    let issued: UploadKeyResponse | undefined
    const body: UploadKeyRequest = { repo: repo.value, platform }
    await runOperation(`upload-key-${platform}`, async () => {
      issued = await $fetch('/upload-key', { method: 'POST', body })
    })
    return issued
  }

  const revoke = (key: UploadKey) => remove({ path: `${UPLOAD_KEYS_DIR}/${key.kid}.json`, sha: key.sha })

  const ingestUrl = new URL('/ingest', useRequestURL()).toString()

  return { keys, status, error, refresh, create, revoke, ingestUrl }
}
