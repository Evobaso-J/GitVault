import { useFileDialog, type UseFileDialogOptions } from '@vueuse/core'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

const convertFileToBase64 = async (file: File) => {
  const uint8File = new Uint8Array(await file.arrayBuffer())
  const binaryString = uint8File.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

interface UseUploadFileOptions extends UseFileDialogOptions {
  /**
   * Input the path and sha of the file to be replaced
   * @default undefined
   */
  replace?: {
    path: string
    sha: string
  }
}

export const useUploadFile = (options?: UseUploadFileOptions) => {
  const { queryPath } = useRouteQueryPath()

  const toast = useToast()
  const { t } = useI18n()

  const { onChange, reset, ...rest } = useFileDialog({
    ...options,
  })

  onChange(async (files) => {
    if (!files?.[0]) return
    const fileName = files[0].name
    const body: GhRepoContentsRequestParams = {
      content: await convertFileToBase64(files[0]),
      message: 'Upload file',
      sha: options?.replace?.sha,
    }
    const path = options?.replace?.path ?? (queryPath.value ?? '').split('/').concat(fileName).join('/')
    try {
      await $fetch('/api/gh-repo-contents', {
        method: 'PUT',
        query: {
          path,
        },
        body,
      })
      toast.add({
        title: t('successMessage'),
        color: 'green',
      })
    }
    catch (error) {
      toast.add({
        title: t('errorMessage'),
        color: 'red',
      })
    }
    finally {
      reset()
    }
  })
  return { onChange, reset, ...rest }
}
