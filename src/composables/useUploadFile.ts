import { useFileDialog, type UseFileDialogOptions } from '@vueuse/core'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

const convertFileToBase64 = async (file: File) => {
  const uint8File = new Uint8Array(await file.arrayBuffer())
  const binaryString = uint8File.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

export const useUploadFile = (options?: UseFileDialogOptions) => {
  const { queryPath } = useRouteQueryPath()

  const { onChange, reset, ...rest } = useFileDialog({
    ...options,
  })

  onChange(async (files) => {
    if (!files?.[0]) return
    const fileName = files[0].name
    const body: GhRepoContentsRequestParams = {
      content: await convertFileToBase64(files[0]),
      message: 'Upload file',
      // TODO: add safety for the sha option when replacing a file
    }
    const path = (queryPath.value ?? '').split('/').concat(fileName).join('/')
    $fetch('/api/gh-repo-contents', {
      method: 'PUT',
      query: {
        path,
      },
      body,
    })
    reset()
  })
  return { onChange, ...rest }
}
