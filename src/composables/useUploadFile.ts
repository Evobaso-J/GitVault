import { useFileDialog, type UseFileDialogOptions } from '@vueuse/core'
import { $putFile } from '~/resources/CDNFiles/api'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

const convertFileToBase64 = async (file: File) => {
  const uint8File = new Uint8Array(await file.arrayBuffer())
  const binaryString = uint8File.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

export interface UseUploadFileOptions extends UseFileDialogOptions {
  /**
   * Input the path and sha of the file to be replaced
   * @default undefined
   */
  replace?: {
    path: string
    sha: string
  }
}

export const useUploadFile = (options?: Ref<UseUploadFileOptions>) => {
  const { queryPath } = useRouteQueryPath()

  const { runOperation } = useOperationToast()

  const { onChange, reset, ...rest } = useFileDialog({
    ...options?.value,
  })
  const { params: { repo } } = useRoute()

  onChange(async (files) => {
    if (!files?.[0] || !repo || Array.isArray(repo)) return
    const fileName = files[0].name

    const path = options?.value?.replace?.path ?? createFilePath(queryPath.value, fileName)
    const body: GhRepoContentsRequestParams = {
      content: await convertFileToBase64(files[0]),
      message: options?.value?.replace ? 'feat: replace file' : 'feat: upload file',
      sha: options?.value?.replace?.sha,
    }
    await runOperation(`uploading-${path}`, () => $putFile({ path, body, repo }))
    reset()
  })
  return { onChange, reset, ...rest }
}
