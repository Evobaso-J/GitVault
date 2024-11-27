import { useFileDialog, type UseFileDialogOptions } from '@vueuse/core'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

const convertFileToBase64 = async (file: File) => {
  const uint8File = new Uint8Array(await file.arrayBuffer())
  const binaryString = uint8File.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

export const useUploadFile = (options?: UseFileDialogOptions) => {
  const { onChange, ...rest } = useFileDialog({
    ...options,
  })

  onChange(async (files) => {
    if (!files?.[0]) return
    const body: GhRepoContentsRequestParams = {
      content: await convertFileToBase64(files[0]),
      message: 'Upload file',
      // TODO: add safety for the sha option when replacing a file
    }
    $fetch('/api/gh-repo-contents', {
      method: 'PUT',
      body,
    })
    console.log('FETCH CALLED')
  })
  return { onChange, ...rest }
}
