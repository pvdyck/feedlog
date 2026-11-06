import { isWidgetTranslation, resolveWidgetLocale, widgetLocaleRequest } from '#layers/feedlog/shared/utils/widget-locale'
import type { WidgetLanguage } from '#layers/feedlog/shared/utils/widget-locale'
import { mergeWidgetMessages } from '#layers/feedlog/shared/utils/widget-messages'
import type { Ref } from 'vue'

// This layer's translations, and the app root's overrides of single strings. In a
// plain build both name the same files.
type MessageFiles = Record<string, () => Promise<{ default: Record<string, unknown> }>>
const layerFiles: MessageFiles = import.meta.glob('../../i18n/widget/*.json')
const rootFiles: MessageFiles = import.meta.glob('~~/i18n/widget/*.json')
const load = async (files: MessageFiles, language: string) =>
  (await Object.entries(files).find(([path]) => path.endsWith(`/${language}.json`))?.[1]())?.default

export function useWidgetLocale(override: Ref<WidgetLanguage | undefined>) {
  const route = useRoute()
  const { locale, loadLocaleMessages, setLocaleMessage } = useI18n()
  const request = computed(() => override.value ?? widgetLocaleRequest(route.query.locale, route.path))
  useHead({ htmlAttrs: { lang: () => locale.value === 'zh' ? 'zh-CN' : locale.value } })
  let sequence = 0

  async function apply() {
    const current = ++sequence
    const language = resolveWidgetLocale(request.value, navigator.languages?.length ? navigator.languages : [navigator.language])
    if (isWidgetTranslation(language)) {
      await loadLocaleMessages('en')
      const [layer, root] = await Promise.all([load(layerFiles, language), load(rootFiles, language)])
      setLocaleMessage(language, mergeWidgetMessages(layer ?? {}, root))
    }
    else await loadLocaleMessages(language)
    // A slower language download must not overwrite a newer host instruction.
    if (current !== sequence) return
    ;(locale as Ref<string>).value = language
  }

  const update = () => { void apply().catch(() => console.warn('[widget] Language messages could not be loaded')) }
  watch(request, update)
  onBeforeUnmount(() => {
    sequence++
    window.removeEventListener('languagechange', update)
  })
  return {
    init: async () => {
      window.addEventListener('languagechange', update)
      await apply().catch(() => console.warn('[widget] Language messages could not be loaded'))
    },
  }
}
