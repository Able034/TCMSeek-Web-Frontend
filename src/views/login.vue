<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-pattern"></div>
    </div>
    
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <el-icon class="logo-icon"><FirstAidKit /></el-icon>
          <h1 class="brand-title">TCMSeek</h1>
        </div>
        <p class="brand-subtitle">{{ $t('login.subtitle') }}</p>
      </div>

      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="account">
          <el-input 
            v-model="loginForm.account" 
            :placeholder="$t('login.accountPlaceholder')"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            :placeholder="$t('login.passwordPlaceholder')"
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
          <el-checkbox v-model="loginForm.remember">
            {{ $t('login.remember') }}
          </el-checkbox>
          <el-link type="primary" class="forgot-link" @click="handleForgotPassword">
            {{ $t('login.forgotPassword') }}
          </el-link>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="login-btn" 
            :loading="loading"
            @click="handleLogin"
          >
            <el-icon v-if="!loading"><Right /></el-icon>
            {{ loading ? $t('login.loggingIn') : $t('login.login') }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <el-divider>{{ $t('login.or') }}</el-divider>
        <div class="footer-links">
          <el-button text @click="handleRegister">
            <el-icon><UserFilled /></el-icon>
            {{ $t('login.register') }}
          </el-button>
          <el-button text @click="goToHome">
            <el-icon><HomeFilled /></el-icon>
            {{ $t('login.backToHome') }}
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
              <el-dropdown-item command="zh">{{ $t('languageLabels.zh') }}</el-dropdown-item>
              <el-dropdown-item command="en">{{ $t('languageLabels.en') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { User, Lock, Right, UserFilled, HomeFilled, FirstAidKit, Position } from '@element-plus/icons-vue'
import { login } from '@/api'

const router = useRouter()
const { t, locale } = useI18n()

const DEFAULT_ACCOUNT = 'guest'
const DEFAULT_PASSWORD = '123456'

// 表单引用
const loginFormRef = ref(null)

// 加载状态
const loading = ref(false)

// 表单数据
const loginForm = reactive({
  account: DEFAULT_ACCOUNT,
  password: DEFAULT_PASSWORD,
  remember: !!DEFAULT_ACCOUNT
})

// 表单验证规则
const loginRules = reactive({
  account: [
    { required: true, message: t('login.accountRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.accountLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('login.passwordLength'), trigger: 'blur' }
  ]
})

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    // 验证表单
    await loginFormRef.value.validate()
    
    loading.value = true

    // 调用登录 API
    const response = await login({
      account: loginForm.account,
      password: loginForm.password
    })

    // 处理响应
    if (response.code === 200 || response.success) {
      // 使用 auth 工具保存用户信息和 token（会自动记录登录时间）
      const { setUser, startTimers } = await import('@/utils/auth')
      const loginUser = {
        ...response.data,
        token: response.data.token || response.token
      }
      setUser(loginUser)

      // 启动自动登出监控
      startTimers()

      // 如果选择记住密码
      if (loginForm.remember) {
        localStorage.setItem('rememberedAccount', loginForm.account)
      } else {
        localStorage.removeItem('rememberedAccount')
      }

      ElMessage.success(t('login.loginSuccess'))
      
      // 跳转到首页或之前的页面
      const redirect = router.currentRoute.value.query.redirect || '/'
      setTimeout(() => {
        router.push(redirect)
      }, 500)
    }
    // if (response.code === 500) {
    //   ElMessage.error(response.message )
    // }  
    else {
      // console.log('登录失败:', response)
      ElMessage.error(response.msg || t('login.loginFailed'))
    }
  } catch (error) {
    if (error.name !== 'ValidationError') {
      console.error('Login failed:', error)
      ElMessage.error(t('login.loginError'))
    }
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info(t('login.forgotPasswordTip'))
}

// 注册
const handleRegister = () => {
  // ElMessage.info(t('login.registerTip'))
  router.push('/register')
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

// 组件挂载时检查是否有记住的账号
const rememberedAccount = localStorage.getItem('rememberedAccount')
if (rememberedAccount) {
  loginForm.account = rememberedAccount
  loginForm.remember = true
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg,#2d8659 0%, #1a5f4a 100%);
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

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 450px;
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

.login-header {
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

.login-form {
  margin-top: 30px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item:nth-child(3)) {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-form :deep(.el-form-item:nth-child(3) .el-form-item__content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-link {
  font-size: 14px;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg,#2d8659 0%, #1a5f4a 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
  transform: translateY(0);
}

.login-footer {
  margin-top: 30px;
}

.login-footer :deep(.el-divider__text) {
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
  .login-card {
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
  .login-card {
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
