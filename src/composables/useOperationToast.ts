import type { OperationStatus } from '~/helpers'

/**
 * Runs a mutation behind a loading toast that turns into a success or error toast,
 * and refreshes the fetched data on success.
 */
export const useOperationToast = () => {
  const toast = useToast()
  const { t, te } = useI18n()

  /** `onSuccess` replaces the default refresh, for a caller that must navigate around it */
  const runOperation = async (toastId: string, operation: () => Promise<unknown>, onSuccess: () => unknown = () => void refreshNuxtData()): Promise<OperationStatus> => {
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
    }
    catch (error) {
      let errorMessage = t('errorMessage')
      // A server error with a known `data.code` (OperationErrorCode) is shown translated
      const code = error instanceof Error && 'data' in error ? (error.data as { data?: { code?: unknown } } | undefined)?.data?.code : undefined
      if (typeof code === 'string' && te(`operationError.${code}`)) {
        errorMessage = t(`operationError.${code}`)
      }
      else if (error instanceof Error && 'statusMessage' in error && typeof error.statusMessage === 'string') {
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
    toast.update(toastId, {
      title: t('successMessage'),
      color: 'success',
      duration: 3000,
      icon: 'i-mdi-check',
      ui: {
        icon: 'animate-none',
      },
    })
    // The operation succeeded: a failed refresh or navigation must not report it as failed
    await Promise.resolve().then(onSuccess).catch(() => {})
    return 'success'
  }

  return { runOperation }
}
