import { useFileDialog, type UseFileDialogOptions } from '@vueuse/core'
import { $putFile } from '~/resources/CDNFiles/api'
import type { GhRepoContentsRequestParams } from '~~/server/resources/gitHubRepoContents'

const convertFileToBase64 = async (file: File) => {
  const uint8File = new Uint8Array(await file.arrayBuffer())
  const binaryString = uint8File.reduce((acc, byte) => acc + String.fromCharCode(byte), '')
  return btoa(binaryString)
}

const createFilePath = (queryPath: string | undefined, fileName: string) => {
  if (!queryPath || queryPath === '') return fileName
  return queryPath.split('/').concat(fileName).join('/')
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

  const toast = useToast()
  const { t } = useI18n()

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
    const toastId = `uploading-${path}`
    toast.add({
      id: toastId,
      title: t('operationInProgress'),
      duration: 0,
      icon: 'i-mdi-loading',
      ui: {
        icon: 'animate-spin',
      },
    })

    try {
      await $putFile({ path, body, repo })
      toast.update(toastId, {
        title: t('successMessage'),
        color: 'success',
        duration: 3000,
        icon: 'i-mdi-check',
        ui: {
          icon: 'animate-none',
        },
      })
      refreshNuxtData()
    }
    catch (error) {
      let errorMessage = t('errorMessage')
      if (error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string') {
        errorMessage = error.statusMessage
      }
      toast.update(toastId, {
        title: errorMessage,
        color: 'error',
        duration: 3000,
        icon: 'i-mdi-alert-outline',
        ui: {
          icon: 'animate-none',
        },
      })
    }
    finally {
      reset()
    }
  })
  return { onChange, reset, ...rest }
}
