import type { OperationStatus } from '~/helpers'

/**
 * Runs a mutation behind a loading toast that turns into a success or error toast,
 * and refreshes the fetched data on success.
 */
export const useOperationToast = () => {
  const toast = useToast()
  const { t } = useI18n()

  const runOperation = async (toastId: string, operation: () => Promise<unknown>): Promise<OperationStatus> => {
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
      await operation()
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
      return 'success'
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
      return 'error'
    }
  }

  return { runOperation }
}
