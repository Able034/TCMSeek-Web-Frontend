import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 语言模式管理
 * 提供根据用户选择的语言模式控制数据显示的功能
 */
export function useLanguageMode() {
  const { locale } = useI18n()
  
  // 获取当前语言模式
  const languageMode = ref(localStorage.getItem('tcmseek-language') || 'bilingual')
  
  // 监听 localStorage 变化
  const updateLanguageMode = () => {
    languageMode.value = localStorage.getItem('tcmseek-language') || 'bilingual'
  }
  
  // 监听语言切换
  window.addEventListener('storage', updateLanguageMode)
  
  // 计算属性：是否显示双语内容
  const showBilingual = computed(() => {
    return ['bilingual', 'en-cn'].includes(languageMode.value)
  })
  
  // 计算属性：是否显示中文
  const showChinese = computed(() => {
    return ['bilingual', 'zh'].includes(languageMode.value)
  })
  
  // 计算属性：是否显示英文
  const showEnglish = computed(() => {
    return ['en', 'en-cn'].includes(languageMode.value)
  })
  
  // 计算属性：是否仅显示中文
  const chineseOnly = computed(() => {
    return languageMode.value === 'zh'
  })
  
  // 计算属性：是否仅显示英文
  const englishOnly = computed(() => {
    return languageMode.value === 'en'
  })
  
  // 获取显示名称（根据语言模式）
  const getDisplayName = (data) => {
    if (!data) return ''
    
    // 根据语言模式返回相应的名称
    if (languageMode.value === 'en') {
      return data.english || data.nameEn || data.name
    } else if (languageMode.value === 'zh') {
      return data.name || data.nameCn
    } else {
      // 双语模式：显示中文和英文/拼音
      const cn = data.name || data.nameCn || ''
      const extra = data.pinyin || data.english || data.nameEn || ''
      return extra ? `${cn} (${extra})` : cn
    }
  }
  
  // 手动更新语言模式（从导航栏切换时调用）
  const refreshLanguageMode = () => {
    updateLanguageMode()
  }
  
  // 监听 locale 变化，同步更新
  watch(locale, () => {
    updateLanguageMode()
  })
  
  return {
    languageMode,
    showBilingual,
    showChinese,
    showEnglish,
    chineseOnly,
    englishOnly,
    getDisplayName,
    refreshLanguageMode
  }
}


















