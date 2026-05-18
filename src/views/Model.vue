<template>
  <div class="model-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>
          <el-icon><Cpu /></el-icon>
          {{$t('model.title')}}
        </h1>
        <p class="page-description">
          {{$t('model.titleDesc')}}
        </p>
      </div>

      <!-- Model Info Cards -->
      <div class="model-info-grid">
        <div class="info-card card">
          <div class="info-icon">
            <el-icon><MagicStick /></el-icon>
          </div>
          <h3>{{$t('model.tech')}}</h3>
          <p>{{$t('model.techDesc')}}</p>
        </div>
        <div class="info-card card">
          <div class="info-icon">
            <el-icon><Reading /></el-icon>
          </div>
          <h3>{{$t('model.data')}}</h3>
          <p>{{$t('model.dataDesc')}}</p>
        </div>
        <div class="info-card card">
          <div class="info-icon">
            <el-icon><Aim /></el-icon>
          </div>
          <h3>{{$t('model.answer')}}</h3>
          <p>{{$t('model.answerDesc')}}</p>
        </div>
      </div>

      <!-- Question Answer Component -->
      <QuestionAnswer />

      <!-- Model Features -->
      <div class="model-features">
        <h2>{{$t('model.features')}}</h2>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-number">01</div>
            <h3>{{$t('model.dualModeSwitch')}}</h3>
            <p>{{$t('model.dualModeSwitchDesc')}}</p>
          </div>
          <div class="feature-item">
            <div class="feature-number">02</div>
            <h3>{{$t('model.context')}}</h3>
            <p>{{$t('model.contextDesc')}}</p>
          </div>
          <div class="feature-item">
            <div class="feature-number">03</div>
            <h3>{{$t('model.trace')}}</h3>
            <p>{{$t('model.traceDesc')}}</p>
          </div>
          <div class="feature-item">
            <div class="feature-number">04</div>
            <h3>{{$t('model.continuousLearning')}}</h3>
            <p>{{$t('model.continuousLearningDesc')}}</p>
          </div>
        </div>
      </div>

      <!-- Use Cases -->
      <div class="use-cases">
        <h2>{{$t('model.application')}}</h2>
        <div class="cases-grid">
          <div class="case-card card">
            <h3>
              <el-icon><School /></el-icon>
              {{$t('model.academicResearch')}}
            </h3>
            <p>{{$t('model.applicationDetail')}}</p>
          </div>
          <div class="case-card card">
            <h3>
              <el-icon><FirstAidKit /></el-icon>
              {{$t('model.clinicalAssistant')}}
            </h3>
            <p>{{$t('model.clinicalAssistantDesc')}}</p>
          </div>
          <div class="case-card card">
            <h3>
              <el-icon><Reading /></el-icon>
              {{$t('model.education')}}
            </h3>
            <p>{{$t('model.educationDesc')}}</p>
          </div>
          <div class="case-card card">
            <h3>
              <el-icon><GoodsFilled /></el-icon>
              {{$t('model.healthConsulting')}}
            </h3>
            <p>{{$t('model.healthConsultingDesc')}}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import QuestionAnswer from '@/components/QuestionAnswer.vue'
import { Cpu, MagicStick, Reading, Aim, School, FirstAidKit, GoodsFilled } from '@element-plus/icons-vue'
</script>

<style scoped>
.model-page {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
}

.container {
  width: 100%;
  max-width: none;
  padding: 0 32px;
  box-sizing: border-box;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 48px;
  color: #1a5f4a;
  margin-bottom: 15px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.page-description {
  font-size: 18px;
  color: #666;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
}

.model-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 50px;
}

.info-card {
  text-align: center;
  padding: 30px 20px;
}

.info-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #2d8659;
}

.info-icon .el-icon {
  font-size: 48px;
}

.info-card h3 {
  font-size: 22px;
  color: #1a5f4a;
  margin-bottom: 10px;
}

.info-card p {
  color: #666;
  line-height: 1.6;
}

.model-features {
  margin: 60px 0;
}

.model-features h2 {
  text-align: center;
  font-size: 36px;
  color: #1a5f4a;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-item {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid #2d8659;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.feature-number {
  font-size: 36px;
  font-weight: 700;
  color: #2d8659;
  margin-bottom: 15px;
  opacity: 0.3;
}

.feature-item h3 {
  font-size: 22px;
  color: #1a5f4a;
  margin-bottom: 10px;
}

.feature-item p {
  color: #666;
  line-height: 1.7;
}

.use-cases {
  margin: 60px 0;
}

.use-cases h2 {
  text-align: center;
  font-size: 36px;
  color: #1a5f4a;
  margin-bottom: 40px;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.case-card {
  padding: 30px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.case-card:hover {
  border-color: #2d8659;
  transform: translateY(-3px);
}

.case-card h3 {
  font-size: 20px;
  color: #1a5f4a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.case-card h3 .el-icon {
  font-size: 24px;
}

.case-card p {
  color: #666;
  line-height: 1.6;
}
</style>

