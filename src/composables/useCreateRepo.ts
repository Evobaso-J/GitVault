import type { OperationStatus } from '~/helpers'
import { $createUserRepo, type CreateUserRepoPayload } from '~/resources/CDNUserRepos/api'

export const useCreateUserRepo = () => {
  const toast = useToast()
  const { t } = useI18n()

  const createUserRepo = async ({ name }: CreateUserRepoPayload): Promise<OperationStatus> => {
    const toastId = `repo-${name}`

    toast.add({
      id: toastId,
      title: t('operationInProgress'),
      timeout: 0,
      icon: 'i-mdi-loading',
      ui: {
        icon: { base: 'animate-spin' },
      },
    })
    try {
      await $createUserRepo({ name })
      toast.update(toastId, {
        title: t('successMessage'),
        color: 'green',
        timeout: 3000,
        icon: 'i-mdi-check',
        ui: {
          icon: { base: 'animate-none' },
        },
      })
      refreshNuxtData()
      return 'success'
    }
    catch (error) {
      let errorMessage = t('errorMessage')
      if (error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string') {
        errorMessage = error.statusMessage
      }
      toast.update(toastId, {
        title: errorMessage,
        color: 'red',
        timeout: 3000,
        icon: 'i-mdi-alert-outline',
        ui: {
          icon: { base: 'animate-none' },
        },
      })
      return 'error'
    }
  }
  return { createUserRepo }
}
