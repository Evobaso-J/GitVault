import { useFileDialog } from '@vueuse/core'
import type { OperationStatus } from '~/helpers'
import { getFileExtension } from '~/resources/CDNFiles/utils'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

export type ReplaceTarget = {
  path: string
  sha: string
}

const encodeBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  // The result is a data URL: `data:<mime>;base64,<content>`
  reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

/**
 * Writes to the contents of the active vault repo, in the folder of the current route.
 * Every write runs behind an operation toast and refreshes the fetched data on success.
 */
export const useVaultContents = () => {
  const route = useRoute()
  const { queryPath } = useRouteQueryPath()
  const { runOperation } = useOperationToast()

  const putFile = (toastId: string, path: string, createBody: () => Promise<GhRepoContentsRequestParams>): Promise<OperationStatus> => {
    const { repo } = route.params
    if (!repo || Array.isArray(repo)) return Promise.resolve('error')
    return runOperation(toastId, async () => $fetch('/gh-repo-contents', {
      method: 'PUT',
      query: { path, repo },
      body: await createBody(),
    }))
  }

  const upload = (file: File): Promise<OperationStatus> => {
    const path = createFilePath(queryPath.value, file.name)
    return putFile(`uploading-${path}`, path, async () => ({
      content: await encodeBase64(file),
      message: 'feat: upload file',
    }))
  }

  const replace = (file: File, { path, sha }: ReplaceTarget): Promise<OperationStatus> =>
    putFile(`uploading-${path}`, path, async () => ({
      content: await encodeBase64(file),
      message: 'feat: replace file',
      sha,
    }))

  // Folders don't exist in git: a folder is an empty `.gitkeep` inside it
  const createFolder = (name: string): Promise<OperationStatus> => {
    const path = createFilePath(queryPath.value, `${name}/.gitkeep`)
    return putFile(`folder-${path}`, path, async () => ({
      content: '',
      message: 'Create folder',
    }))
  }

  const { open, onChange, reset } = useFileDialog({ multiple: false })
  let onPick: (file: File) => Promise<OperationStatus> = upload
  onChange(async (files) => {
    if (!files?.[0]) return
    await onPick(files[0])
    reset()
  })

  const pickAndUpload = () => {
    onPick = upload
    open({ accept: '*' })
  }

  // A replacement keeps the old path, so a different format would break its preview
  const pickAndReplace = (target: ReplaceTarget) => {
    const fileName = target.path.split('/').pop() ?? ''
    onPick = file => replace(file, target)
    open({ accept: fileName.includes('.') ? `.${getFileExtension(fileName)}` : '*' })
  }

  return { upload, replace, createFolder, pickAndUpload, pickAndReplace }
}
