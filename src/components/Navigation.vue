<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="nav-brand">
        <router-link to="/">
          <h1 class="logo">TCMSeek</h1>
          <p class="subtitle">{{ $t('home.hero.subtitle') }}</p>
        </router-link>
      </div>
      <ul class="nav-menu">
        <li v-for="item in navItems" :key="item.path" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ active: isActive(item.path) }"
          >
            {{ item.name }}
          </router-link>
        </li>
        <li class="nav-item">
          <!-- 工具下拉框 -->
          <el-dropdown command="tool" trigger="click">
            <span class="nav-link tool-menu">
              <el-icon><Tools /></el-icon>
              <span class="tool-text">{{ $t('nav.tool') }}</span>
            </span>
            <template #dropdown> 
              <el-dropdown-menu> 
                <el-dropdown-item command="gotoMedicalCaseDB1"  @click="gotoMedicalCaseDB">
                  <img 
                    src="/src/assets/icon/读取数据库.svg" 
                    style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"
                  >
                  {{ $t('nav.toolAction1') }}
                </el-dropdown-item>
                <el-dropdown-item command="gotoEnrichment"  @click="gotoEnrichment">
                  <el-icon class="tool-icon"><DataAnalysis /></el-icon>
                  {{ $t('nav.toolAction2') }}
                </el-dropdown-item>
                <el-dropdown-item command="gotoPpiHub" @click="gotoPpiHub">
                  <el-icon class="tool-icon"><Connection /></el-icon>
                  {{ $t('nav.toolAction3') }}
                </el-dropdown-item>
                <el-dropdown-item command="gotoTargetPrediction" @click="gotoTargetPrediction">
                  <el-icon class="tool-icon"><Aim /></el-icon>
                  {{ $t('nav.toolAction4') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </li>
        <!-- 登录/用户菜单 -->
        <li class="nav-item">
          <el-dropdown v-if="isLoggedIn" @command="handleUserCommand" trigger="click">
            <span class="nav-link user-menu">
              <el-icon><Avatar /></el-icon>
              <span class="user-name">{{ currentUser.username || currentUser.account }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>
                  <div class="user-info">
                    <div class="user-account">{{ currentUser.account }}</div>
                    <div class="user-role">{{ currentUser.role || 'User' }}</div>
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="profile">
                  <el-icon><User /></el-icon>
                  {{ $t('nav.profile') }}
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  {{ $t('nav.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <router-link v-else to="/login" class="nav-link login-btn">
            <el-icon><UserFilled /></el-icon>
            <span>{{ $t('nav.login') }}</span>
          </router-link>
        </li>
        <!-- 语言切换按钮 -->
        <li class="nav-item">
          <el-dropdown @command="handleLanguageChange" trigger="click">
            <span class="nav-link language-selector">
              <el-icon><Position /></el-icon>
              <span class="language-text">{{ currentLanguageLabel }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <!-- <el-dropdown-item command="bilingual">中英双语</el-dropdown-item>
                <el-dropdown-item command="en-cn">English-Chinese</el-dropdown-item> -->
                <el-dropdown-item command="zh">中文</el-dropdown-item>
                <el-dropdown-item command="en">English</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Position, Avatar, User, SwitchButton, UserFilled, DataAnalysis, Connection, Aim, List } from '@element-plus/icons-vue'
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const currentLanguage = ref(localStorage.getItem('tcmseek-language') || 'bilingual')
// 用户登录状态
const isLoggedIn = ref(false)
const currentUser = ref({})
const navItems = computed(() => [
  { name: t('nav.home'), path: '/' },
  { name: t('nav.model'), path: '/model' },
  { name: t('nav.structure'), path: '/structure' },
  { name: t('nav.knowledgeGraph'), path: '/knowledge-graph' },
  { name: t('nav.medicine'), path: '/medicine' },
  { name: t('nav.help'), path: '/help' }
])
const currentLanguageLabel = computed(() => {
  const labels = {
    'bilingual': t('languageLabels.bilingual'),
    'en-cn': t('languageLabels.en-cn'),
    'zh': t('languageLabels.zh'),
    'en': t('languageLabels.en')
  }
  return labels[currentLanguage.value] || t('languageLabels.bilingual')
})
// 检查登录状态
const checkLoginStatus = () => {
  const loginUser = localStorage.getItem('loginUser')
  if (loginUser) {
    try {
      currentUser.value = JSON.parse(loginUser)
      isLoggedIn.value = true
    } catch (error) {
      console.error('Failed to parse user information:', error)
      isLoggedIn.value = false
    }
  } else {
    isLoggedIn.value = false
  }
}
//gotoMedicalCaseDB
const gotoMedicalCaseDB = async () => {
  router.push('/medical-case-show')
}
const gotoEnrichment = () => {
  router.push('/enrichment-analysis')
}
const gotoPpiHub = () => {
  router.push('/ppi-hub-proteins')
}
const gotoTargetPrediction = () => {
  router.push('/target-prediction')
}
const gotoTargetPredictionJobs = () => {
  router.push('/target-prediction/jobs')
}
// 处理用户菜单命令
const handleUserCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm(
        t('nav.logoutConfirm'),
        t('nav.logoutTitle'),
        {
          confirmButtonText: t('nav.confirmLogout'),
          cancelButtonText: t('nav.cancel'),
          type: 'warning'
        }
      )
      // 使用 auth 工具清除登录信息
      const { clearUser } = await import('@/utils/auth')
      clearUser()
      isLoggedIn.value = false
      currentUser.value = {}
      ElMessage.success(t('nav.logoutSuccess'))
      // 跳转到首页
      if (route.path !== '/') {
        router.push('/')
      }
    } catch (error) {
      // 用户取消登出
      console.log('Cancel Logout')
    }
  } else if (command === 'profile') {
    ElMessage.info(t('nav.profileTip'))
    // 可以添加跳转到个人中心的逻辑
    // router.push('/profile')
  }else if (command === 'gotoMedicalCaseDB') {
    router.push('/medical-case-show')
  }
}
const handleLanguageChange = (command) => {
  currentLanguage.value = command
  localStorage.setItem('tcmseek-language', command)
  // 切换 i18n locale
  if (command === 'en' || command === 'en-cn') {
    locale.value = 'en'
  } else {
    locale.value = 'zh'
  }
}
const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
// 组件挂载时检查登录状态
onMounted(() => {
  checkLoginStatus()
})
// 监听路由变化，自动刷新登录状态
// 当用户登录成功后跳转页面时，导航栏会自动更新
watch(() => route.path, () => {
  checkLoginStatus()
}, { immediate: false })
</script>
<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}
.nav-brand a {
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.logo {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}
.subtitle {
  font-size: 12px;
  color: #666;
  margin: 0;
}
.nav-menu {
  display: flex;
  list-style: none;
  gap: 8px;
}
.nav-item {
  margin: 0;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  text-decoration: none;
  color: #333;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 16px;
}
.nav-link:hover {
  background: #f0f9f5;
  color: #2d8659;
  transform: translateY(-2px);
}
.nav-link.active {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(45, 134, 89, 0.3);
}
.language-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
.tool-icon {
  margin-right: 8px;
}
.language-text {
  font-size: 14px;
}
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}
.user-info {
  padding: 5px 0;
  text-align: center;
}
.user-account {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.user-role {
  font-size: 12px;
  color: #999;
  text-transform: capitalize;
}
.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg,#2d8659 0%, #1a5f4a 100%);
  color: white !important;
  padding: 10px 20px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
.login-btn:hover {
  background: linear-gradient(135deg,#2d8659 0%, #1a5f4a 100%);
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
.login-btn.active {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }
  .nav-menu {
    width: 100%;
    justify-content: space-around;
    margin-top: 15px;
  }
  .nav-link {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>
