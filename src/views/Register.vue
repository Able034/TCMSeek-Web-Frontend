<template>
  <div class="register-container">
    <div class="register-background">
      <div class="bg-pattern"></div>
    </div>
    
    <div class="register-card">
      <div class="register-header">
        <div class="logo-section">
          <el-icon class="logo-icon"><FirstAidKit /></el-icon>
          <h1 class="brand-title">TCMSeek</h1>
        </div>
        <p class="brand-subtitle">{{ $t('register.subtitle') }}</p>
      </div>

      <el-form 
        ref="registerFormRef" 
        :model="registerForm" 
        :rules="registerRules" 
        class="register-form"
        @keyup.enter="handleRegister"
      >
        <el-form-item prop="account">
          <el-input 
            v-model="registerForm.account" 
            :placeholder="$t('register.accountPlaceholder')"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="username">
          <el-input 
            v-model="registerForm.username" 
            :placeholder="$t('register.usernamePlaceholder')"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Avatar /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input 
            v-model="registerForm.email" 
            :placeholder="$t('register.emailPlaceholder')"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="code">
          <el-input 
            v-model="registerForm.code" 
            :placeholder="$t('register.codePlaceholder')"
            size="large"
            clearable
            maxlength="6"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
            <template #append>
              <el-button 
                @click="handleSendCode" 
                :disabled="countdown > 0 || !registerForm.email"
                :loading="sendingCode"
              >
                {{ countdown > 0 ? `${countdown}s` : $t('register.sendCode') }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="registerForm.password" 
            type="password" 
            :placeholder="$t('register.passwordPlaceholder')"
            size="large"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input 
            v-model="registerForm.confirmPassword" 
            type="password" 
            :placeholder="$t('register.confirmPasswordPlaceholder')"
            size="large"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="registerForm.agree">
            {{ $t('register.agreePrefix') }}
            <el-link type="primary" @click="showTerms">{{ $t('register.terms') }}</el-link>
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="register-btn" 
            :loading="loading"
            @click="handleRegister"
          >
            <el-icon v-if="!loading"><Right /></el-icon>
            {{ loading ? $t('register.registering') : $t('register.register') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="register-footer">
        <el-divider>{{ $t('register.or') }}</el-divider>
        <div class="footer-links">
          <el-button text @click="goToLogin">
            <el-icon><UserFilled /></el-icon>
            {{ $t('register.hasAccount') }}
          </el-button>
          <el-button text @click="goToHome">
            <el-icon><HomeFilled /></el-icon>
            {{ $t('register.backToHome') }}
          </el-button>
        </div>
      </div>

      <div class="language-switch">
        <el-dropdown @command="handleLanguageChange" trigger="click">
          <el-button text circle>
            <el-icon><Position /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh">中文</el-dropdown-item>
              <el-dropdown-item command="en">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Right, UserFilled, HomeFilled, FirstAidKit, Position, Avatar, Message, Key } from '@element-plus/icons-vue'
import { register, sendCode } from '@/api'

const router = useRouter()
const { t, locale } = useI18n()

// 表单引用
const registerFormRef = ref(null)

// 加载状态
const loading = ref(false)
const sendingCode = ref(false)

// 倒计时
const countdown = ref(0)
let countdownTimer = null

// 表单数据
const registerForm = reactive({
  account: '',
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 自定义验证规则
const validateAccount = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('register.accountRequired')))
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    callback(new Error(t('register.accountFormat')))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('register.emailRequired')))
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    callback(new Error(t('register.emailFormat')))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error(t('register.confirmPasswordRequired')))
  } else if (value !== registerForm.password) {
    callback(new Error(t('register.passwordMismatch')))
  } else {
    callback()
  }
}

// 表单验证规则
const registerRules = reactive({
  account: [
    { required: true, validator: validateAccount, trigger: 'blur' }
  ],
  username: [
    { required: true, message: t('register.usernameRequired'), trigger: 'blur' },
    { min: 2, max: 20, message: t('register.usernameLength'), trigger: 'blur' }
  ],
  email: [
    { required: true, validator: validateEmail, trigger: 'blur' }
  ],
  code: [
    { required: true, message: t('register.codeRequired'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('register.codeFormat'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('register.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('register.passwordLength'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 发送验证码
const handleSendCode = async () => {
  // 验证邮箱格式
  if (!registerForm.email) {
    ElMessage.warning(t('register.emailRequired'))
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    ElMessage.warning(t('register.emailFormat'))
    return
  }

  try {
    sendingCode.value = true

    // 调用发送验证码 API
    const response = await sendCode({
      email: registerForm.email
    })

    if (response.code === 200 || response.success) {
      ElMessage.success(response.data || t('register.codeSent'))
      
      // 开始倒计时（60秒）
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }
      }, 1000)
    } else {
      ElMessage.error(response.msg || response.message || t('register.codeSendFailed'))
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    ElMessage.error(t('register.codeSendError'))
  } finally {
    sendingCode.value = false
  }
}

// 注册处理
const handleRegister = async () => {
  if (!registerFormRef.value) return

  // 检查是否同意条款
  if (!registerForm.agree) {
    ElMessage.warning(t('register.agreeTerms'))
    return
  }

  try {
    // 验证表单
    await registerFormRef.value.validate()
    
    loading.value = true

    // 调用注册 API（包含验证码）
    const response = await register({
      account: registerForm.account,
      username: registerForm.username,
      email: registerForm.email,
      code: registerForm.code,
      password: registerForm.password
    })

    // 处理响应
    if (response.code === 200 || response.success) {
      ElMessage.success(t('register.registerSuccess'))
      
      // 清除倒计时
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
      
      // 提示用户并跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response.msg || response.message || t('register.registerFailed'))
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('注册失败:', error)
      ElMessage.error(t('register.registerError'))
    }
  } finally {
    loading.value = false
  }
}

// 显示服务条款
const showTerms = () => {
  ElMessageBox.alert(
    t('register.termsContent'),
    t('register.termsTitle'),
    {
      confirmButtonText: t('register.understand'),
      type: 'info'
    }
  )
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

// 返回首页
const goToHome = () => {
  router.push('/')
}

// 语言切换
const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('tcmseek-language', lang)
}

// 组件卸载时清除倒计时
onBeforeUnmount(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  z-index: 0;
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px);
  animation: slidePattern 20s linear infinite;
}

@keyframes slidePattern {
  0% {
    transform: translateX(0) translateY(0);
  }
  100% {
    transform: translateX(70px) translateY(70px);
  }
}

.register-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15px;
}

.logo-icon {
  font-size: 50px;
  color: #2d8659;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.brand-subtitle {
  font-size: 1rem;
  color: #666;
  margin: 0;
  font-weight: 400;
}

.register-form {
  margin-top: 30px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item:nth-last-child(2)) {
  margin-bottom: 16px;
}

.register-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(45, 134, 89, 0.4);
}

.register-btn:active {
  transform: translateY(0);
}

.register-footer {
  margin-top: 30px;
}

.register-footer :deep(.el-divider__text) {
  color: #999;
  font-size: 14px;
  background-color: transparent;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 20px;
}

.footer-links .el-button {
  font-size: 14px;
  color: #2d8659;
  display: flex;
  align-items: center;
  gap: 5px;
}

.footer-links .el-button:hover {
  color: #1a5f4a;
}

.language-switch {
  position: absolute;
  top: 20px;
  right: 20px;
}

.language-switch .el-button {
  font-size: 20px;
  color: #2d8659;
}

.language-switch .el-button:hover {
  color: #1a5f4a;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-card {
    padding: 40px 30px;
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    font-size: 0.9rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }

  .logo-icon {
    font-size: 40px;
  }

  .brand-title {
    font-size: 1.8rem;
  }
}
</style>

