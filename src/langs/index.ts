import { createI18n } from 'vue-i18n'
import en from '@/langs/en'
import zhCN from '@/langs/zh-CN'
import zhTW from '@/langs/zh-TW'

const messages: Record<SupportedLang, LangTextItem> = {
    'en': en,
    'zh-CN': zhCN,
    'zh-TW': zhTW
}

export const getLang = () => {
    const lang = navigator.language || 'en'
    return Object.keys(messages).includes(lang) ? lang : 'en'
}

const i18n = createI18n({
    legacy: false,
    locale: getLang(),
    fallbackLocale: 'en',
    globalInjection: true,
    missingWarn: false,
    fallbackWarn: false,
    silentTranslationWarn: true,
    messages
})

export default i18n
