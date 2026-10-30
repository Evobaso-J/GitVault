import { useFileDialog } from '@vueuse/core'
import type { OperationStatus } from '~/helpers'
import { getFileExtension } from '~/resources/CDNFiles/utils'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

export type ReplaceTarget = {
  path: string
  sha: string
}

export type UploadStatus = 'waiting' | 'uploading' | 'conflict' | 'done' | 'skipped' | 'error'

export type UploadItem = {
  id: number
  file: File
  repo: string
  /** Target path, fixed when the file is queued: navigating away doesn't move it */
  path: string
  status: UploadStatus
  /** Sha of the file already at `path`: set on a conflict, sent when the user replaces it */
  sha?: string
  /** The user chose "keep both": upload under the first free `name (n).ext` */
  keepBoth?: boolean
}

export type ConflictChoice = 'replace' | 'keepBoth' | 'skip'

const encodeBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  // The result is a data URL: `data:<mime>;base64,<content>`
  reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(file)
})

/** `docs/a.txt` → `docs/a (1).txt` */
const withCopyNumber = (path: string, copy: number) => {
  const slash = path.lastIndexOf('/') + 1
  const name = path.slice(slash)
  const dot = name.lastIndexOf('.')
  const [stem, extension] = dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, '']
  return `${path.slice(0, slash)}${stem} (${copy})${extension}`
}

/**
 * Writes to the contents of the active vault repo, in the folder of the current route.
 *
 * Uploads go through a queue shared by the whole app: one file at a time, each checked
 * for a file already at its path first; a clash waits for the user to replace, keep
 * both or skip. Replace, delete and create folder run behind an operation toast. Every
 * successful write refreshes the fetched data.
 */
export const useVaultContents = () => {
  const route = useRoute()
  const { queryPath } = useRouteQueryPath()
  const { runOperation } = useOperationToast()

  const uploads = useState<UploadItem[]>('vault-uploads', () => [])
  const isProcessing = useState('vault-uploads-processing', () => false)
  const nextId = useState('vault-uploads-next-id', () => 0)

  const getRepo = () => {
    const { repo } = route.params
    return !repo || Array.isArray(repo) ? undefined : repo
  }

  const writeFile = (repo: string, path: string, body: GhRepoContentsRequestParams) =>
    $fetch('/gh-repo-contents', { method: 'PUT', query: { path, repo }, body })

  /** Sha of the file at `path`, or undefined when there is none */
  const findExisting = async (repo: string, path: string): Promise<string | undefined> => {
    try {
      const existing = await $fetch('/gh-repo-contents', { query: { path, repo } })
      return Array.isArray(existing) ? undefined : existing.sha
    }
    catch (error) {
      if (error instanceof Error && 'statusCode' in error && error.statusCode === 404) return undefined
      throw error
    }
  }

  const uploadItem = async (item: UploadItem) => {
    if (item.keepBoth) {
      let copy = 1
      while (await findExisting(item.repo, withCopyNumber(item.path, copy))) copy++
      item.path = withCopyNumber(item.path, copy)
    }
    else if (!item.sha) {
      const sha = await findExisting(item.repo, item.path)
      if (sha) {
        item.sha = sha
        item.status = 'conflict'
        return
      }
    }
    await writeFile(item.repo, item.path, {
      content: await encodeBase64(item.file),
      message: item.sha ? 'feat: replace file' : 'feat: upload file',
      sha: item.sha,
    })
    item.status = 'done'
    refreshNuxtData()
  }

  // ponytail: one file at a time; parallel PUTs on one branch make GitHub reject commits with 409
  const processUploads = async () => {
    if (isProcessing.value) return
    isProcessing.value = true
    let item: UploadItem | undefined
    while ((item = uploads.value.find(upload => upload.status === 'waiting'))) {
      item.status = 'uploading'
      try {
        await uploadItem(item)
      }
      catch {
        item.status = 'error'
      }
    }
    isProcessing.value = false
  }

  /**
   * Queues the files, into the current folder unless `getPath` says otherwise;
   * resolves when the queue stops (done or waiting on a conflict)
   */
  const upload = (files: File[], getPath = (file: File) => createFilePath(queryPath.value, file.name)): Promise<void> => {
    const repo = getRepo()
    if (!repo) return Promise.resolve()
    uploads.value.push(...files.map(file => ({
      id: nextId.value++,
      file,
      repo,
      path: getPath(file),
      status: 'waiting' as const,
    })))
    return processUploads()
  }

  const resolveConflict = (id: number, choice: ConflictChoice): Promise<void> => {
    const item = uploads.value.find(upload => upload.id === id)
    if (item?.status !== 'conflict') return Promise.resolve()
    if (choice === 'skip') {
      item.status = 'skipped'
      return Promise.resolve()
    }
    if (choice === 'keepBoth') {
      item.sha = undefined
      item.keepBoth = true
    }
    item.status = 'waiting'
    return processUploads()
  }

  /** Drops the finished uploads from the queue */
  const clearUploads = () => {
    uploads.value = uploads.value.filter(upload => ['waiting', 'uploading', 'conflict'].includes(upload.status))
  }

  const putFile = (toastId: string, path: string, createBody: () => Promise<GhRepoContentsRequestParams>): Promise<OperationStatus> => {
    const repo = getRepo()
    if (!repo) return Promise.resolve('error')
    return runOperation(toastId, async () => writeFile(repo, path, await createBody()))
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

  const remove = ({ path, sha }: ReplaceTarget): Promise<OperationStatus> => {
    const repo = getRepo()
    if (!repo) return Promise.resolve('error')
    return runOperation(`deleting-${path}`, () => $fetch('/gh-repo-contents', {
      method: 'DELETE',
      query: { path, repo },
      body: { message: 'feat: delete file', sha },
    }))
  }

  const { open, onChange, reset } = useFileDialog()
  let onPick: (files: File[]) => Promise<unknown> = upload
  onChange(async (files) => {
    if (!files?.length) return
    const picked = Array.from(files)
    reset()
    await onPick(picked)
  })

  const pickAndUpload = () => {
    onPick = upload
    open({ accept: '*', multiple: true })
  }

  // A replacement keeps the old path, so a different format would break its preview
  const pickAndReplace = (target: ReplaceTarget) => {
    const fileName = target.path.split('/').pop() ?? ''
    onPick = ([file]) => file ? replace(file, target) : Promise.resolve()
    open({ accept: fileName.includes('.') ? `.${getFileExtension(fileName)}` : '*', multiple: false })
  }

  return {
    uploads: readonly(uploads),
    upload,
    resolveConflict,
    clearUploads,
    replace,
    createFolder,
    remove,
    pickAndUpload,
    pickAndReplace,
  }
}
