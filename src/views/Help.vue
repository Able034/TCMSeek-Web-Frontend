<template>
  <div class="help-container">
    <!-- 页面头部 -->
    <div class="help-header">
      <h1 class="help-title">
        <el-icon><QuestionFilled /></el-icon>
        {{ $t('help.title') }}
      </h1>
      <p class="help-subtitle">{{ $t('help.subtitle') }}</p>
    </div>

    <!-- 关于 TCMSeek -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('help.about.title') }}</span>
        </div>
      </template>
      <p class="section-desc">{{ $t('help.about.description') }}</p>
      <el-row :gutter="20" class="mission-vision">
        <el-col :xs="24" :sm="12">
          <div class="info-box">
            <el-icon class="info-icon"><Aim /></el-icon>
            <h3>{{ $t('help.about.mission') }}</h3>
            <p>{{ $t('help.about.missionDesc') }}</p>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="info-box">
            <el-icon class="info-icon"><Flag /></el-icon>
            <h3>{{ $t('help.about.vision') }}</h3>
            <p>{{ $t('help.about.visionDesc') }}</p>
          </div>
        </el-col>
      </el-row>
      
      <!-- 快速导航 -->
      <div class="quick-nav">
        <h3>{{ $t('help.quickNav.title') }}</h3>
        <el-row :gutter="15">
          <el-col :xs="12" :sm="6">
            <el-button class="nav-btn" @click="$router.push('/')">
              <el-icon><HomeFilled /></el-icon>
              <span>{{ $t('nav.home') }}</span>
            </el-button>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-button class="nav-btn" @click="$router.push('/model')">
              <el-icon><Cpu /></el-icon>
              <span>{{ $t('nav.model') }}</span>
            </el-button>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-button class="nav-btn" @click="$router.push('/knowledge-graph')">
              <el-icon><Share /></el-icon>
              <span>{{ $t('nav.knowledgeGraph') }}</span>
            </el-button>
          </el-col>
          <el-col :xs="12" :sm="6">
            <el-button class="nav-btn" @click="$router.push('/medicine')">
              <el-icon><GoodsFilled /></el-icon>
              <span>{{ $t('nav.medicine') }}</span>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 使用指南 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><Reading /></el-icon>
          <span>{{ $t('help.usage.title') }}</span>
        </div>
      </template>
      
      <el-collapse accordion>
        <!-- 首页使用 -->
        <el-collapse-item>
          <template #title>
            <div class="collapse-title">
              <el-icon><HomeFilled /></el-icon>
              <span>{{ $t('help.usage.home.title') }}</span>
            </div>
          </template>
          <div class="collapse-content">
            <p>{{ $t('help.usage.home.desc') }}</p>
            <div class="action-box">
              <el-button type="primary" @click="$router.push('/')" plain>
                <el-icon><HomeFilled /></el-icon>
                {{ $t('common.goToExperience') }}
              </el-button>
            </div>
          </div>
        </el-collapse-item>

        <!-- 大模型问答 -->
        <el-collapse-item>
          <template #title>
            <div class="collapse-title">
              <el-icon><Cpu /></el-icon>
              <span>{{ $t('help.usage.model.title') }}</span>
            </div>
          </template>
          <div class="collapse-content">
            <p>{{ $t('help.usage.model.desc') }}</p>
            <ul class="usage-list">
              <li>
                <el-tag type="success">{{ $t('model.academicMode') }}</el-tag>
                <span>{{ $t('help.usage.model.academic') }}</span>
              </li>
              <li>
                <el-tag type="info">{{ $t('model.generalMode') }}</el-tag>
                <span>{{ $t('help.usage.model.general') }}</span>
              </li>
            </ul>
            <el-alert :title="$t('help.usage.model.howto')" type="info" :closable="false" show-icon />
            <div class="action-box">
              <el-button type="primary" @click="$router.push('/model')" plain>
                <el-icon><Cpu /></el-icon>
                {{ $t('common.goToExperience') }}
              </el-button>
            </div>
          </div>
        </el-collapse-item>

        <!-- 知识图谱 -->
        <el-collapse-item>
          <template #title>
            <div class="collapse-title">
              <el-icon><Share /></el-icon>
              <span>{{ $t('help.usage.graph.title') }}</span>
            </div>
          </template>
          <div class="collapse-content">
            <p>{{ $t('help.usage.graph.desc') }}</p>
            <div class="steps-box">
              <p><strong>{{ $t('help.usage.graph.howto') }}</strong></p>
              <el-steps direction="vertical" :space="60">
                <el-step :title="$t('help.usage.graph.step1')" />
                <el-step :title="$t('help.usage.graph.step2')" />
                <el-step :title="$t('help.usage.graph.step3')" />
                <el-step :title="$t('help.usage.graph.step4')" />
                <el-step :title="$t('help.usage.graph.step5')" />
              </el-steps>
            </div>
            <div class="action-box">
              <el-button type="primary" @click="$router.push('/knowledge-graph')" plain>
                <el-icon><Share /></el-icon>
                {{ $t('common.goToExperience') }}
              </el-button>
            </div>
          </div>
        </el-collapse-item>

        <!-- 中医药数据库 -->
        <el-collapse-item>
          <template #title>
            <div class="collapse-title">
              <el-icon><GoodsFilled /></el-icon>
              <span>{{ $t('help.usage.medicine.title') }}</span>
            </div>
          </template>
          <div class="collapse-content">
            <p>{{ $t('help.usage.medicine.desc') }}</p>
            <div class="steps-box">
              <p><strong>{{ $t('help.usage.medicine.howto') }}</strong></p>
              <el-steps direction="vertical" :space="60">
                <el-step :title="$t('help.usage.medicine.step1')" />
                <el-step :title="$t('help.usage.medicine.step2')" />
                <el-step :title="$t('help.usage.medicine.step3')" />
                <el-step :title="$t('help.usage.medicine.step4')" />
              </el-steps>
            </div>
            <div class="action-box">
              <el-button type="primary" @click="$router.push('/medicine')" plain>
                <el-icon><GoodsFilled /></el-icon>
                {{ $t('common.goToExperience') }}
              </el-button>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <!-- 常见问题 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><ChatDotRound /></el-icon>
          <span>{{ $t('help.faq.title') }}</span>
        </div>
      </template>
      
      <div class="faq-list">
        <div class="faq-item" v-for="i in 5" :key="i">
          <div class="faq-question">
            <el-icon><QuestionFilled /></el-icon>
            <strong>{{ $t(`help.faq.q${i}.question`) }}</strong>
          </div>
          <div class="faq-answer">
            <el-icon><Select /></el-icon>
            <span>{{ $t(`help.faq.q${i}.answer`) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 开发实验室信息 -->
    <el-card class="section-card lab-card">
      <template #header>
        <div class="card-header">
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ $t('help.lab.title') }}</span>
        </div>
      </template>
      
      <div class="lab-content">
        <div class="lab-name">
          <h2>{{ $t('help.lab.name') }}</h2>
          <p class="lab-name-en">{{ $t('help.lab.nameEn') }}</p>
        </div>
        
        <p class="lab-intro">{{ $t('help.lab.intro') }}</p>

        <el-divider />

        <!-- 研究方向 -->
        <div class="lab-section">
          <h3>
            <el-icon><Compass /></el-icon>
            {{ $t('help.lab.research.title') }}
          </h3>
          <el-row :gutter="15">
            <el-col :xs="24" :sm="12" :md="8" v-for="i in 5" :key="i">
              <el-tag type="primary" size="large" class="research-tag">
                {{ $t(`help.lab.research.direction${i}`) }}
              </el-tag>
            </el-col>
          </el-row>
        </div>

        <el-divider />

        <!-- 团队介绍 -->
        <div class="lab-section">
          <h3>
            <el-icon><UserFilled /></el-icon>
            {{ $t('help.lab.team.title') }}
          </h3>
          <p>{{ $t('help.lab.team.desc') }}</p>
        </div>

        <el-divider />

        <!-- 主要成果 -->
        <div class="lab-section">
          <h3>
            <el-icon><Medal /></el-icon>
            {{ $t('help.lab.achievements.title') }}
          </h3>
          <ul class="achievements-list">
            <li v-for="i in 4" :key="i">
              <el-icon><Star /></el-icon>
              {{ $t(`help.lab.achievements.achievement${i}`) }}
            </li>
          </ul>
        </div>

        <el-divider />

        <!-- 联系我们 -->
        <div class="lab-section">
          <h3>
            <el-icon><Message /></el-icon>
            {{ $t('help.lab.contact.title') }}
          </h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item>
              <template #label>
                <el-icon><Message /></el-icon>
                {{ $t('help.lab.contact.email') }}
              </template>
              <a :href="`mailto:${$t('help.lab.contact.emailValue')}`" class="contact-link">
                {{ $t('help.lab.contact.emailValue') }}
              </a>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <el-icon><Location /></el-icon>
                {{ $t('help.lab.contact.address') }}
              </template>
              {{ $t('help.lab.contact.addressValue') }}
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <el-icon><Link /></el-icon>
                {{ $t('help.lab.contact.website') }}
              </template>
              <a :href="$t('help.lab.contact.websiteValue')" target="_blank" class="contact-link">
                {{ $t('help.lab.contact.websiteValue') }}
              </a>
            </el-descriptions-item>
            <el-descriptions-item>
              <template #label>
                <el-icon><Link /></el-icon>
                {{ $t('help.lab.contact.github') }}
              </template>
              <a :href="$t('help.lab.contact.githubValue')" target="_blank" class="contact-link">
                {{ $t('help.lab.contact.githubValue') }}
              </a>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>

  
    <!-- 免责声明 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ $t('help.disclaimer.title') }}</span>
        </div>
      </template>
      <el-alert
        :title="$t('help.disclaimer.content')"
        type="warning"
        :closable="false"
        show-icon
      />
    </el-card>

    <!-- 版本信息 -->
    <el-card class="section-card version-card">
      <template #header>
        <div class="card-header">
          <el-icon><Stamp /></el-icon>
          <span>{{ $t('help.version.title') }}</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="$t('help.version.current')">
          <el-tag type="success">{{ $t('help.version.currentValue') }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('help.version.updateDate')">
          {{ $t('help.version.updateDateValue') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { 
  QuestionFilled, InfoFilled, Aim, Flag, Reading, HomeFilled, 
  Cpu, Share, GoodsFilled, ChatDotRound, Select, OfficeBuilding, 
  Compass, UserFilled, Medal, Star, Message, Location, Link, 
  SetUp, Monitor, DataAnalysis, MagicStick, WarningFilled, Stamp 
} from '@element-plus/icons-vue'
</script>

<style scoped>
.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.help-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 20px;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  border-radius: 10px;
  color: white;
}

.help-title {
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.help-title .el-icon {
  font-size: 2.5rem;
}

.help-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.section-card {
  margin-bottom: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3rem;
  font-weight: bold;
  color: #303133;
}

.card-header .el-icon {
  font-size: 1.5rem;
  color: #409eff;
}

.section-desc {
  font-size: 1rem;
  line-height: 1.8;
  color: #606266;
  margin-bottom: 20px;
}

.mission-vision {
  margin-top: 20px;
}

.info-box {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  height: 100%;
}

.info-icon {
  font-size: 2.5rem;
  color: #409eff;
  margin-bottom: 10px;
}

.info-box h3 {
  margin: 10px 0;
  color: #303133;
}

.info-box p {
  color: #606266;
  line-height: 1.6;
}

.quick-nav {
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 8px;
}

.quick-nav h3 {
  text-align: center;
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 1.2rem;
}

.nav-btn {
  width: 100%;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.9rem;
  transition: all 0.3s;
  margin-bottom: 10px;
}

.nav-btn .el-icon {
  font-size: 1.8rem;
}

.nav-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.collapse-content {
  padding: 10px 0;
  color: #606266;
  line-height: 1.8;
}

.usage-list {
  list-style: none;
  padding: 15px 0;
  margin: 0;
}

.usage-list li {
  margin: 10px 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.usage-list li span {
  flex: 1;
}

.steps-box {
  margin-top: 15px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.action-box {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
  text-align: center;
}

.action-box .el-button {
  font-size: 1rem;
  padding: 12px 24px;
}

.faq-list {
  padding: 10px 0;
}

.faq-item {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.faq-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  color: #303133;
  font-size: 1.05rem;
}

.faq-question .el-icon {
  color: #409eff;
  font-size: 1.2rem;
}

.faq-answer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #606266;
  line-height: 1.8;
  padding-left: 28px;
}

.faq-answer .el-icon {
  color: #67c23a;
  margin-top: 3px;
  flex-shrink: 0;
}

.lab-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%);
}

.lab-content {
  padding: 10px 0;
}

.lab-name {
  text-align: center;
  margin-bottom: 20px;
}

.lab-name h2 {
  margin: 0 0 5px 0;
  color: #303133;
  font-size: 2rem;
}

.lab-name-en {
  color: #909399;
  font-style: italic;
  margin: 0;
}

.lab-intro {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #606266;
  text-align: center;
}

.lab-section {
  margin: 20px 0;
}

.lab-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  color: #303133;
  font-size: 1.3rem;
}

.lab-section h3 .el-icon {
  color: #409eff;
}

.lab-section p {
  color: #606266;
  line-height: 1.8;
}

.research-tag {
  margin: 5px;
  width: calc(100% - 10px);
  display: block;
  text-align: center;
}

.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.achievements-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  color: #606266;
  font-size: 1rem;
}

.achievements-list .el-icon {
  color: #f59e0b;
  font-size: 1.2rem;
}

.contact-link {
  color: #409eff;
  text-decoration: none;
  transition: color 0.3s;
}

.contact-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.tech-box {
  text-align: center;
  padding: 30px 20px;
  background: #f5f7fa;
  border-radius: 8px;
  height: 100%;
  transition: transform 0.3s, box-shadow 0.3s;
}

.tech-box:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tech-icon {
  font-size: 3rem;
  color: #409eff;
  margin-bottom: 15px;
}

.tech-box h3 {
  margin: 10px 0;
  color: #303133;
  font-size: 1.2rem;
}

.tech-box p {
  color: #606266;
  line-height: 1.6;
  font-size: 0.95rem;
}

.version-card {
  margin-bottom: 50px;
}

@media (max-width: 768px) {
  .help-header {
    padding: 30px 15px;
  }

  .help-title {
    font-size: 2rem;
  }

  .help-title .el-icon {
    font-size: 2rem;
  }

  .help-subtitle {
    font-size: 1rem;
  }

  .lab-name h2 {
    font-size: 1.5rem;
  }

  .tech-box {
    margin-bottom: 15px;
  }
}
</style>
