export default defineAppConfig({
  ui: {
    primary: 'royal-blue',
    gray: 'neutral',
    card: {
      shadow: 'shadow-none',
    },
    breadcrumb: {
      base: 'font-medium',
      active: 'text-gray-900 dark:text-gray-200',
      inactive: 'text-gray-400 hover:text-gray-900 dark:hover:text-gray-200',
      divider: {
        base: 'text-gray-400 flex-shrink-0 w-4 h-4 rtl:rotate-180',
      },
      label: 'max-w-40',
    },
  },
})
