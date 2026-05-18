<template>
  <div id="app">
    <LanguageSelector />
    <Navigation />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer">
      <div class="footer-content">
        <p>{{ $t('footer.copyright') }}</p>
        <p>{{ $t('footer.description') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import Navigation from './components/Navigation.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import { startTimers, stopTimers, getUser } from './utils/auth'

// 组件挂载时启动自动登出监控
onMounted(() => {
  const user = getUser()
  if (user && user.token) {
    startTimers()
  }
})

// 组件卸载时停止监控
onBeforeUnmount(() => {
  stopTimers()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px;
}

.footer {
  background: linear-gradient(135deg, #1a5f4a 0%, #2d8659 100%);
  color: white;
  padding: 30px 20px;
  text-align: center;
  margin-top: 60px;
}

.footer-content p {
  margin: 8px 0;
}

.footer-content p:first-child {
  font-weight: 500;
  font-size: 16px;
}

.footer-content p:last-child {
  font-size: 14px;
  opacity: 0.9;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>



