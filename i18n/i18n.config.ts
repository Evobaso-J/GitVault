import type { I18nOptions } from 'vue-i18n'
import enUS from '~/locales/en-US.json'

type MasterMessagesSchema = typeof enUS
type AvailableLocales = 'en-US'

type I18nConfig = I18nOptions<{
  message: MasterMessagesSchema
}, AvailableLocales>

export default defineI18nConfig<I18nConfig>(() => ({
  locale: 'en-US',
  messages: {
    'en-US': enUS,
  },
}))
