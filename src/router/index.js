import { createRouter, createWebHashHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import Home from '../views/Home.vue'
import Model from '../views/Model.vue'
import Structure from '../views/Structure.vue'
import KnowledgeGraph from '../views/KnowledgeGraph.vue'
// import KnowledgeGraph from '../views/KnowledgeGraphNeo4j.vue'
import Medicine from '../views/Medicine.vue'
import HerbDetail from '../views/HerbDetail.vue'
import PrescriptionDetail from '../views/PrescriptionDetail.vue'
import CompoundDetail from '../views/CompoundDetail.vue'
import GeneDetail from '../views/GeneDetail.vue'
import DiseaseDetail from '../views/DiseaseDetail.vue'
import MedicalCaseDetail from '../views/MedicalCaseDetail.vue'
import SymptomDetail from '../views/SymptomDetail.vue'
import PhenotypeDetail from '../views/PhenotypeDetail.vue'
import PathwayDetail from '../views/PathwayDetail.vue'
import SyndromeDetail from '../views/SyndromeDetail.vue'
import WmSymptomDetail from '../views/WmSymptomDetail.vue'
import Help from '../views/Help.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import MedicalCaseShow from '../views/tools/MedicalCaseShow.vue'
import EnrichmentAnalysis from '../views/tools/EnrichmentAnalysis.vue'
import PPIHubProteins from '../views/tools/PPIHubProteins.vue'
import X2KAnalysis from '../views/tools/X2KAnalysis.vue'
import TargetPrediction from '../views/tools/TargetPrediction.vue'
import i18n from '../i18n'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { titleKey: 'routes.home' }
  },
  {
    path: '/model',
    name: 'Model',
    component: Model,
    meta: {
      titleKey: 'routes.model',
      requiresAuth: true  // 需要登录验证
    }
  },
  {
    path: '/structure',
    name: 'Structure',
    component: Structure,
    meta: { titleKey: 'routes.structure' }
  },
  // {
  //   path: '/knowledge-graph-neo4j',
  //   name: 'KnowledgeGraphNeo4j',
  //   component: KnowledgeGraphNeo4j,
  //   meta: { title: '知识图谱（Neo4j版）' }

  // },
  {
    path: '/knowledge-graph',
    name: 'KnowledgeGraph',
    component: KnowledgeGraph,
    meta: { titleKey: 'routes.knowledgeGraph' }
  },
  {
    path: '/medicine',
    name: 'Medicine',
    component: Medicine,
    meta: { titleKey: 'routes.medicine' }
  },
  {
    path: '/herb/:id',
    name: 'HerbDetail',
    component: HerbDetail,
    meta: { titleKey: 'routes.herbDetail' }
  },
  {
    path: '/prescription/:id',
    name: 'PrescriptionDetail',
    component: PrescriptionDetail,
    meta: { titleKey: 'routes.prescriptionDetail' }
  },
  {
    path: '/compound/:inchikey',
    name: 'CompoundDetail',
    component: CompoundDetail,
    meta: { titleKey: 'routes.compoundDetail' }
  },
  {
    path: '/gene/:id',
    name: 'GeneDetail',
    component: GeneDetail,
    meta: { titleKey: 'routes.geneDetail' }
  },
  {
    path: '/disease/:id',
    name: 'DiseaseDetail',
    component: DiseaseDetail,
    meta: { titleKey: 'routes.diseaseDetail' }
  },
  {
    path: '/phenotype/:id',
    name: 'PhenotypeDetail',
    component: PhenotypeDetail,
    meta: { titleKey: 'routes.phenotypeDetail' }
  },
  {
    path: '/pathway/:id',
    name: 'PathwayDetail',
    component: PathwayDetail,
    meta: { titleKey: 'routes.pathwayDetail' }
  },
  {
    path: '/medical-case/:id',
    name: 'MedicalCaseDetail',
    component: MedicalCaseDetail,
    meta: { titleKey: 'routes.medicalCaseDetail' }
  },
  {
    path: '/symptom/:id',
    name: 'SymptomDetail',
    component: SymptomDetail,
    meta: { titleKey: 'routes.symptomDetail' }
  },
  {
    path: '/syndrome/:id',
    name: 'SyndromeDetail',
    component: SyndromeDetail,
    meta: { titleKey: 'routes.syndromeDetail' }
  },
  {
    path: '/wm-symptom/:id',
    name: 'WmSymptomDetail',
    component: WmSymptomDetail,
    meta: { titleKey: 'routes.wmSymptomDetail' }
  },
  {
    path: '/help',
    name: 'Help',
    component: Help,
    meta: { titleKey: 'routes.help' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { titleKey: 'routes.login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { titleKey: 'routes.register' }
  },
  {
    path: '/medical-case-show',
    name: 'MedicalCaseShow',
    component: MedicalCaseShow,
    meta: { titleKey: 'routes.medicalCaseShow' }
  },
  {
    path: '/enrichment-analysis',
    name: 'EnrichmentAnalysis',
    component: EnrichmentAnalysis,
    meta: { titleKey: 'routes.enrichmentAnalysis' }
  },
  {
    path: '/ppi-hub-proteins',
    name: 'PPIHubProteins',
    component: PPIHubProteins,
    meta: { titleKey: 'routes.ppiHubProteins' }
  },
  {
    path: '/x2k-analysis',
    name: 'X2KAnalysis',
    component: X2KAnalysis,
    meta: { titleKey: 'routes.x2kAnalysis' }
  },
  {
    path: '/target-prediction',
    name: 'TargetPrediction',
    component: TargetPrediction,
    meta: {
      titleKey: 'routes.targetPrediction',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫 - 登录验证
router.beforeEach((to, from, next) => {
  // 设置页面标题 - 使用 i18n 翻译
  const { t } = i18n.global
  const title = to.meta.titleKey ? t(to.meta.titleKey) : 'TCMSeek'
  document.title = `${title} - TCMSeek`

  // 检查路由是否需要登录验证
  if (to.meta.requiresAuth) {
    // 获取本地存储的用户信息
    const loginUser = localStorage.getItem('loginUser')
    
    if (loginUser) {
      // 已登录，验证 token 是否有效
      try {
        const user = JSON.parse(loginUser)
        if (user && user.token) {
          // Token 存在，允许访问
          next()
        } else {
          // Token 无效，清除登录信息并跳转到登录页
          localStorage.removeItem('loginUser')
          ElMessage.warning('Invalid login information. Please log in again.')
          next({
            path: '/login',
            query: { redirect: to.fullPath }  // 保存原目标页面
          })
        }
      } catch (error) {
        // 解析用户信息失败
        console.error('解析用户信息失败:', error)
        localStorage.removeItem('loginUser')
        ElMessage.error('Abnormal login information. Please log in again.')
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    } else {
      // 未登录，跳转到登录页
      ElMessage.warning('Please log in first.')
      next({
        path: '/login',
        query: { redirect: to.fullPath }  // 保存原目标页面，登录后跳回
      })
    }
  } else {
    // 不需要登录验证，直接放行
    next()
  }
})

export default router
