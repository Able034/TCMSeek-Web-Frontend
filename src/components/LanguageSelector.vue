<template>
  <transition name="modal-fade">
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <h2 class="modal-title-cn">请选择您的语言</h2>
        <h3 class="modal-title-en">Select Language</h3>

        <div class="language-options">
          <!-- <div 
            class="language-card"
            :class="{ selected: selectedLanguage === 'bilingual' }"
            @click="selectLanguage('bilingual')"
          >
            <h3>中英双语</h3>
            <p class="description">中文为系统语言，知识库内容显示中英双语内容</p>
          </div> -->
<!-- 
          <div 
            class="language-card"
            :class="{ selected: selectedLanguage === 'en-cn' }"
            @click="selectLanguage('en-cn')"
          >
            <h3>English-Chinese bilingual</h3>
            <p class="description">English is the system language, and the contents of knowledge base are bilingual</p>
          </div> -->

          <div 
            class="language-card"
            :class="{ selected: selectedLanguage === 'zh' }"
            @click="selectLanguage('zh')"
          >
            <h3>中文</h3>
            <p class="description">中文为系统语言，且知识库内容仅显示中文信息</p>
          </div>

          <div 
            class="language-card"
            :class="{ selected: selectedLanguage === 'en' }"
            @click="selectLanguage('en')"
          >
            <h3>English</h3>
            <p class="description">English is the system language, and only English information is displayed in the knowledge base</p>
          </div>
        </div>

        <p class="hint">之后可在顶部导航的语言设置中更换语言</p>
        <p class="hint-en">You can change the language in the top navigation bar later</p>

        <button class="confirm-btn" @click="confirmLanguage" :disabled="!selectedLanguage">
          OK
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const showModal = ref(false)
const selectedLanguage = ref('')

onMounted(() => {
  // 检查是否已经选择过语言
  const hasSelectedLanguage = localStorage.getItem('tcmseek-language')
  if (!hasSelectedLanguage) {
    showModal.value = true
  }
})

const selectLanguage = (lang) => {
  selectedLanguage.value = lang
}

const confirmLanguage = () => {
  if (selectedLanguage.value) {
    localStorage.setItem('tcmseek-language', selectedLanguage.value)
    
    // 根据语言设置切换 i18n locale
    if (selectedLanguage.value === 'en' || selectedLanguage.value === 'en-cn') {
      locale.value = 'en'
    } else {
      locale.value = 'zh'
    }
    
    showModal.value = false
  }
}

const closeModal = () => {
  // 可选：是否允许点击外部关闭
  // showModal.value = false
}

// 导出方法供外部调用
defineExpose({
  showModal
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title-cn {
  text-align: center;
  font-size: 28px;
  color: #1a5f4a;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.modal-title-en {
  text-align: center;
  font-size: 22px;
  color: #1a5f4a;
  margin: 0 0 40px 0;
  font-weight: 500;
}

.language-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.language-card {
  border: 3px solid #e0e0e0;
  border-radius: 12px;
  padding: 25px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.language-card:hover {
  border-color: #2d8659;
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(45, 134, 89, 0.15);
}

.language-card.selected {
  border-color: #2d8659;
  background: linear-gradient(135deg, #f0f9f5 0%, #e8f5ef 100%);
  border-width: 3px;
  box-shadow: 0 8px 20px rgba(45, 134, 89, 0.2);
  position: relative;
}

.language-card.selected::after {
  content: '✓';
  position: absolute;
  top: 10px;
  right: 15px;
  width: 28px;
  height: 28px;
  background: #2d8659;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.language-card h3 {
  font-size: 18px;
  color: #1a5f4a;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.language-card .description {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.hint {
  text-align: center;
  font-size: 14px;
  color: #888;
  margin: 8px 0 0 0;
}

.hint-en {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin: 4px 0 25px 0;
}

.confirm-btn {
  display: block;
  width: 200px;
  margin: 0 auto;
  padding: 14px 32px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.confirm-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(23, 162, 184, 0.3);
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* 模态框过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-container {
    padding: 30px 20px;
  }

  .modal-title-cn {
    font-size: 24px;
  }

  .modal-title-en {
    font-size: 18px;
    margin-bottom: 30px;
  }

  .language-options {
    grid-template-columns: 1fr;
  }

  .language-card {
    min-height: 120px;
  }

  .language-card h3 {
    font-size: 16px;
  }

  .language-card .description {
    font-size: 12px;
  }
}

/* 滚动条样式 */
.modal-container::-webkit-scrollbar {
  width: 8px;
}

.modal-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-container::-webkit-scrollbar-thumb {
  background: #2d8659;
  border-radius: 10px;
}

.modal-container::-webkit-scrollbar-thumb:hover {
  background: #1a5f4a;
}
</style>




