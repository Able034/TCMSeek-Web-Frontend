import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'

// 获取保存的语言设置
const savedLanguage = localStorage.getItem('tcmseek-language') || 'bilingual'

// 根据语言设置决定默认语言
let defaultLocale = 'zh'
if (savedLanguage === 'en' || savedLanguage === 'en-cn') {
  defaultLocale = 'en'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: 'zh',
  messages: {
    zh,
    en
  }
})

export default i18n


















