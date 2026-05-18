<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">{{ $t('home.hero.title') }}</h1>
          <h2 class="hero-subtitle">{{ $t('home.hero.subtitle') }}</h2>
          <p class="hero-description">
            {{ $t('home.hero.description') }}
          </p>
          <div class="hero-buttons">
            <router-link to="/model" class="btn btn-primary">
              <el-icon><Promotion /></el-icon>
              {{ $t('home.hero.btnModel') }}
            </router-link>
            <router-link to="/knowledge-graph" class="btn btn-secondary">
              <el-icon><Share /></el-icon>
              {{ $t('home.hero.btnGraph') }}
            </router-link>
          </div>
        </div>
        <div class="hero-illustration">
          <div class="floating-card card-1">
            <el-icon><GoodsFilled /></el-icon>
          </div>
          <div class="floating-card card-2">
            <el-icon><Reading /></el-icon>
          </div>
          <div class="floating-card card-3">
            <el-icon><Cpu /></el-icon>
          </div>
          <div class="floating-card card-4">
            <el-icon><Share /></el-icon>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">{{ $t('home.features.title') }}</h2>
        <div class="features-grid">
          <div class="feature-card card">
            <div class="feature-icon">
              <el-icon><Cpu /></el-icon>
            </div>
            <h3>{{ $t('home.features.aiTitle') }}</h3>
            <p>{{ $t('home.features.aiDesc') }}</p>
            <ul class="feature-list">
              <li><el-icon><Reading /></el-icon> {{ $t('home.features.aiModelType1') }}</li>
              <li><el-icon><ChatLineRound /></el-icon> {{ $t('home.features.aiModelType2') }}</li>
            </ul>
          </div>

          <div class="feature-card card">
            <div class="feature-icon">
              <el-icon><Share /></el-icon>
            </div>
            <h3>{{ $t('home.features.graphTitle') }}</h3>
            <p>{{ $t('home.features.graphDesc') }}</p>
          </div>

          <div class="feature-card card">
            <div class="feature-icon">
              <el-icon><GoodsFilled /></el-icon>
            </div>
            <h3>{{ $t('home.features.dbTitle') }}</h3>
            <p>{{ $t('home.features.dbDesc') }}</p>
          </div>

          <div class="feature-card card">
            <div class="feature-icon">
              <el-icon><School /></el-icon>
            </div>
            <h3>{{ $t('home.features.researchTitle') }}</h3>
            <p>{{ $t('home.features.researchDesc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Statistics Section -->
    <section class="statistics" ref="statisticsSection">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ animatedHerbs.toLocaleString() }}+</div>
            <div class="stat-label">{{ $t('home.stats.herbs') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ animatedFormulas.toLocaleString() }}+</div>
            <div class="stat-label">{{ $t('home.stats.formulas') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ animatedNodes.toLocaleString() }}+</div>
            <div class="stat-label">{{ $t('home.stats.nodes') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>{{ $t('home.features.startExplore') }}</h2>
        <p>{{ $t('home.features.startExploreDesc') }}</p>
        <router-link to="/model" class="btn btn-primary btn-large">
          <el-icon><Star /></el-icon>
          {{$t('home.stats.startNow') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Promotion, Share, GoodsFilled, Reading, Cpu, ChatLineRound, Search, DataAnalysis, Document, School, SetUp, Star, FirstAidKit } from '@element-plus/icons-vue'

// 统计数据的目标值
const targetHerbs = 10000
const targetFormulas = 5000
const targetNodes = 100000

// 当前显示的动画值
const animatedHerbs = ref(0)
const animatedFormulas = ref(0)
const animatedNodes = ref(0)

// 引用 statistics section
const statisticsSection = ref(null)

// 动画是否已经开始
let animationStarted = false

// Intersection Observer 实例
let observer = null

/**
 * 数字递增动画函数
 * @param {Object} ref - Vue ref 对象
 * @param {Number} target - 目标值
 * @param {Number} duration - 动画持续时间（毫秒）
 */
const animateNumber = (refObj, target, duration = 2000) => {
  const startTime = performance.now()
  const startValue = 0

  const updateNumber = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用 easeOutCubic 缓动函数，使动画更自然
    const easeProgress = 1 - Math.pow(1 - progress, 3)
    
    refObj.value = Math.floor(startValue + (target - startValue) * easeProgress)

    if (progress < 1) {
      requestAnimationFrame(updateNumber)
    } else {
      refObj.value = target // 确保最终值准确
    }
  }

  requestAnimationFrame(updateNumber)
}

/**
 * 启动所有统计数字的动画
 */
const startCountAnimation = () => {
  if (animationStarted) return
  animationStarted = true

  // 为每个统计项启动动画，添加延迟使其依次出现
  setTimeout(() => animateNumber(animatedHerbs, targetHerbs, 4000), 0)
  setTimeout(() => animateNumber(animatedFormulas, targetFormulas, 3000), 200)
  setTimeout(() => animateNumber(animatedNodes, targetNodes, 3000), 400)
}

onMounted(() => {
  // 创建 Intersection Observer 来检测统计区域是否进入视口
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCountAnimation()
        }
      })
    },
    {
      threshold: 0.3 // 当 30% 的元素可见时触发
    }
  )

  // 开始观察统计区域
  if (statisticsSection.value) {
    observer.observe(statisticsSection.value)
  }
})

onBeforeUnmount(() => {
  // 清理 observer
  if (observer && statisticsSection.value) {
    observer.unobserve(statisticsSection.value)
    observer.disconnect()
  }
})
</script>

<style scoped>
.home {
  width: 100%;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #1a5f4a 0%, #2d8659 50%, #45a873 100%);
  color: white;
  padding: 100px 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') no-repeat bottom;
  background-size: cover;
}

.hero .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  animation: fadeInUp 0.8s ease;
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

.hero-title {
  font-size: 64px;
  font-weight: 700;
  margin-bottom: 10px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 20px;
  color: white;
}

.hero-description {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.95;
  line-height: 1.8;
}

.hero-buttons {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hero-buttons .btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-large {
  padding: 16px 32px;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.hero-illustration {
  position: relative;
  height: 400px;
}

.floating-card {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
}

.floating-card .el-icon {
  font-size: 56px;
}

.card-1 {
  top: 20px;
  left: 50px;
  animation-delay: 0s;
}

.card-2 {
  top: 120px;
  right: 80px;
  animation-delay: 0.5s;
}

.card-3 {
  bottom: 100px;
  left: 100px;
  animation-delay: 1s;
}

.card-4 {
  bottom: 50px;
  right: 50px;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Features Section */
.features {
  padding: 80px 0;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 42px;
  margin-bottom: 60px;
  color: #1a5f4a;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  text-align: center;
  padding: 40px 30px;
}

.feature-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #2d8659;
}

.feature-icon .el-icon {
  font-size: 64px;
}

.feature-card h3 {
  font-size: 24px;
  margin-bottom: 15px;
  color: #1a5f4a;
}

.feature-card p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.feature-list {
  list-style: none;
  text-align: left;
  padding: 0;
}

.feature-list li {
  padding: 8px 0;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-list li .el-icon {
  color: #2d8659;
  font-size: 18px;
  flex-shrink: 0;
}

/* Statistics Section */
.statistics {
  background: linear-gradient(135deg, #f0f9f5 0%, #e0f5ed 100%);
  padding: 60px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.stat-card {
  text-align: center;
  padding: 30px;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  color: #2d8659;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 18px;
  color: #666;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta h2 {
  font-size: 42px;
  color: white;
  margin-bottom: 20px;
}

.cta p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.95;
}

/* Responsive */
@media (max-width: 968px) {
  .hero .container {
    grid-template-columns: 1fr;
  }

  .hero-illustration {
    display: none;
  }

  .hero-title {
    font-size: 48px;
  }

  .hero-subtitle {
    font-size: 24px;
  }
}
</style>



