<template>
  <div class="medicine-page">
    <div class="container" >
      <!-- Page Header -->
      <div class="page-header">
        <h1>
          <el-icon>
            <GoodsFilled />
          </el-icon>
          {{ $t('nav.medicine') }}
        </h1>
        <p class="page-description">
          {{ $t('medicine.titleDesc') }}
        </p>
      </div>

      <!-- Search Bar -->
      <div class="search-section card">
        <div class="search-bar">
          <input v-model="searchQuery" type="text" :placeholder="$t('medicine.searchPlaceholder')" class="search-input"
            @keyup.enter="handleSearch" />
          <button class="btn btn-primary search-btn" @click="handleSearch" :disabled="loading">
            <el-icon v-if="loading">
              <Loading />
            </el-icon>
            <el-icon v-else>
              <Search />
            </el-icon>
            {{ $t('medicine.search') }}
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id">
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        <!-- 中药材 -->
        <div v-if="activeTab === 'herbs'" class="tab-content">
          <h2>{{ $t('medicine.tn') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="herbs.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <!-- <th>{{ $t('medicine.herb.id') }}</th> -->
                    <th>{{ $t('medicine.herb.name') }}</th>
                    <!-- <th>{{ $t('medicine.herb.pinyin') }}</th> -->
                    <th>{{ $t('medicine.herb.latin') }}</th>
                    <th>{{ $t('medicine.herb.english') }}</th>
                    <th>{{ $t('medicine.herb.type') }}</th> 
                    <th>{{ $t('medicine.herb.category') }}</th>
                    <!-- 
                    <th>{{ $t('medicine.herb.efficacy') }}</th>
                    <th>{{ $t('medicine.herb.classification') }}</th>
                    <th>{{ $t('medicine.herb.usePart') }}</th>  -->
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="herb in herbs" :key="herb.id" class="table-row">
                    <!-- <td class="id-cell clickable" @click="goToHerbDetail(herb.tcmHerbId)">{{ herb.tcmHerbId }}</td> -->
                    <td class="name-cell clickable" @click="goToHerbDetail(herb.tcmHerbId)">
                      <div class="name-with-icon">
                        <strong>{{ herb.name }}</strong>
                      </div>
                    </td>
                    <!-- <td class="pinyin-cell">{{ herb.pinyin || '-' }}</td> -->
                    <td class="latin-cell">{{ herb.latin || '-' }}</td>
                    <td>{{ herb.english || '-' }}</td>
                   <td>
                      <span class="type-badge" v-if="herb.type">{{ herb.type }}</span>
                      <span v-else>-</span>
                    </td>
                    <td>
                      <span class="category-badge" v-if="herb.efficacyCategory">{{ herb.efficacyCategory }}</span>
                      <span v-else>-</span>
                    </td>
                    <!-- <td>
                      <span class="category-badge" v-if="herb.efficacyCategory">{{ herb.efficacyCategory }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="efficacy-cell">{{ $i18n.locale === 'zh' ? (herb.efficacyZh || '-') : (herb.functionEn ||
                      '-') }}</td>
                    <td class="bio-cell">
                      {{
                        $i18n.locale === 'zh'
                          ? (herb.classificationZh || herb.classification || '-')
                          : (herb.classification || herb.classificationZh || '-')
                      }}
                    </td>
                    <td>{{ herb.usePart || '-' }}</td> -->
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="herbsPagination.page" :page-size="herbsPagination.pageSize"
                :total="herbsPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleHerbsPageChange" background />
            </div>
          </template>
        </div>

        <!-- 方剂 -->
        <div v-if="activeTab === 'formulas'" class="tab-content">
          <h2>{{ $t('medicine.formula.tableName') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="formulas.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.formula.id') }}</th>
                    <th>{{ $t('medicine.formula.name') }}</th>
                    <th>{{ $t('medicine.formula.pinyin') }}</th>
                    <th>{{ $t('medicine.formula.source') }}</th>
                    <th>{{ $t('medicine.formula.effects') }}</th>
                    <th>{{ $t('medicine.formula.indication') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="formula in formulas" :key="formula.id" class="table-row">
                    <td class="id-cell clickable" @click="goToPrescriptionDetail(formula.tcmPrescriptionId)">{{
                      formula.tcmPrescriptionId }}</td>
                    <td class="name-cell clickable" @click="goToPrescriptionDetail(formula.tcmPrescriptionId)">
                      <div class="name-with-icon">
                        <strong>{{ formula.name }}</strong>
                      </div>
                    </td>
                    <td class="pinyin-cell">{{ formula.pinyin || '-' }}</td>
                    <td>{{ formula.source || '-' }}</td>
                    <!-- 在模板中替换原来调用函数的地方 -->
                    <td class="effects-cell">{{ $i18n.locale === 'zh' ? (formula.effectsZh || '-') : (formula.effects ||
                      '-') }}</td>
                    <td class="indication-cell">{{ $i18n.locale === 'zh' ? (formula.indicationsZh || '-') :
                      (formula.indicationsEn || '-') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="formulasPagination.page" :page-size="formulasPagination.pageSize"
                :total="formulasPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleFormulasPageChange" background />
            </div>
          </template>
        </div>

        <!-- 症状 -->
        <div v-if="activeTab === 'symptoms'" class="tab-content">
          <h2>{{ $t('medicine.commonSymptoms') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="symptoms.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.symptom.id') }}</th>
                    <th>{{ $t('medicine.symptom.name') }}</th>
                    <th>{{ $t('medicine.symptom.pinyin') }}</th>
                    <th>{{ $t('medicine.symptom.locus') }}</th>
                    <th>{{ $t('medicine.symptom.type') }}</th>
                    <th>{{ $t('medicine.symptom.property') }}</th>
                    <th>{{ $t('medicine.symptom.definition') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="symptom in symptoms" :key="symptom.id" class="table-row">
                    <td class="id-cell clickable" @click="goToSymptomDetail(symptom.tcmSymptomId)">{{
                      symptom.tcmSymptomId }}</td>
                    <td class="name-cell clickable" @click="goToSymptomDetail(symptom.tcmSymptomId)">
                      <div class="name-with-icon">
                        <strong>{{ symptom.name }}</strong>
                      </div>
                    </td>
                    <td class="pinyin-cell">{{ symptom.symptomPinyin || '-' }}</td>
                    <td>{{ symptom.symptomLocus || '-' }}</td>
                    <td>
                      <span class="type-badge" v-if="symptom.type">{{ symptom.type }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="pinyin-cell">{{ symptom.symptomProperty || '-' }}</td>
                    <td class="efficacy-cell">{{ symptom.symptomDefinition || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="symptomsPagination.page" :page-size="symptomsPagination.pageSize"
                :total="symptomsPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleSymptomsPageChange" background />
            </div>
          </template>
        </div>

        <!-- 中医证候 -->
        <div v-if="activeTab === 'syndromes'" class="tab-content">
          <h2>{{ $t('medicine.syndrome.title') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="syndromes.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.syndrome.id') }}</th>
                    <th>{{ $t('medicine.syndrome.name') }}</th>
                    <th>{{ $t('medicine.syndrome.pinyin') }}</th>
                    <th>{{ $t('medicine.syndrome.english') }}</th>
                    <th>{{ $t('medicine.syndrome.category') }}</th>
                    <th>{{ $t('medicine.syndrome.categoryEn') }}</th>
                    <!-- <th>{{ $t('medicine.syndrome.definition') }}</th> -->
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="syndrome in syndromes" :key="syndrome.id" class="table-row">
                    <td class="id-cell clickable" @click="goToSyndromeDetail(syndrome.tcmSyndromeId)">{{
                      syndrome.tcmSyndromeId }}</td>
                    <td class="name-cell clickable" @click="goToSyndromeDetail(syndrome.tcmSyndromeId)">
                      <div class="name-with-icon">
                        <strong>{{ syndrome.syndromeNameZh }}</strong>
                      </div>
                    </td>
                    <td class="pinyin-cell">{{ syndrome.syndromePinyin || '-' }}</td>
                    <td>{{ syndrome.syndromeEnglish || '-' }}</td>
                    <td>
                      <span class="category-badge"
                        v-if="$i18n.locale === 'zh' ? syndrome.categoryZh : syndrome.categoryEn">
                        {{ $i18n.locale === 'zh' ? syndrome.categoryZh : syndrome.categoryEn }}
                      </span>
                      <span v-else>-</span>
                    </td>
                    <td>{{ $i18n.locale === 'zh' ? (syndrome.categoryEn || '-') : (syndrome.categoryZh || '-') }}</td>
                    <!-- <td class="efficacy-cell">{{ $i18n.locale === 'zh' ? (syndrome.syndromeDefinitionZh || '-') :
                      (syndrome.syndromeDescriptionEn || '-') }}</td> -->
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="syndromesPagination.page" :page-size="syndromesPagination.pageSize"
                :total="syndromesPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleSyndromesPageChange" background />
            </div>
          </template>
        </div>

        <!-- 化合物 -->
        <div v-if="activeTab === 'compounds'" class="tab-content">
          <h2>{{ $t('medicine.compound.title') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="compounds.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    
                    <th>{{ $t('medicine.compound.name') }}</th>
                    <th>{{ $t('medicine.compound.inchikey') }}</th>
                    <th>{{ $t('medicine.compound.formula') }}</th>
                    <th>{{ $t('medicine.compound.weight') }}</th>
                    <th>PubChem CID</th>
                    <!-- <th>LogP</th>
                  <th>TPSA</th> -->
                    <th>SMILES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="compound in compounds" :key="compound.id" class="table-row">
                    
                    <td class="name-cell clickable" @click="goToCompoundDetail(compound.inchikey)">
                      <div class="name-with-icon">
                        <strong>{{ compound.compoundName || '-' }}</strong>
                      </div>
                    </td>
                    <td class="id-cell clickable" @click="goToCompoundDetail(compound.inchikey)">
                      {{ compound.inchikey ? compound.inchikey.substring(0, 14) + '...' : '-' }}
                    </td>

                    <td class="name-cell clickable" @click="goToCompoundDetail(compound.inchikey)">
                      <div class="name-with-icon">
                        <strong>{{ compound.molecularFormula || '' }}</strong>
                      </div>
                    </td>
                    <td>{{ compound.molecularWeight ? compound.molecularWeight.toFixed(2) : '-' }}</td>
                    <td>{{ compound.pubchemCid || '-' }}</td>
                    <!-- <td>{{ compound.logp ? compound.logp.toFixed(2) : '-' }}</td>
                  <td>{{ compound.tpsa ? compound.tpsa.toFixed(2) : '-' }}</td> -->
                    <td class="efficacy-cell">
                      {{ compound.canonicalSmiles ? (compound.canonicalSmiles.length > 60 ?
                        compound.canonicalSmiles.substring(0, 60) + '...' : compound.canonicalSmiles) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="compoundsPagination.page" :page-size="compoundsPagination.pageSize"
                :total="compoundsPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleCompoundsPageChange" background />
            </div>
          </template>
        </div>

        <!-- 基因 -->
        <div v-if="activeTab === 'genes'" class="tab-content">
          <h2>{{ $t('medicine.gene.title') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="genes.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.gene.id') }}</th>
                    <th>{{ $t('medicine.gene.symbol') }}</th>
                    <th>Entrez ID</th>
                    <th>UniProt ID</th>
                    <th>Ensembl ID</th>
                    <th>{{ $t('medicine.gene.geneType') }}</th>
                    <th>{{ $t('medicine.gene.description') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="gene in genes" :key="gene.tcmTarId" class="table-row">
                    <td class="id-cell clickable" @click="goToGeneDetail(gene.tcmTarId)">{{ gene.tcmTarId }}</td>
                    <td class="name-cell clickable" @click="goToGeneDetail(gene.tcmTarId)">
                      <div class="name-with-icon">
                        <strong>{{ gene.symbol || '' }}</strong>
                      </div>
                    </td>
                    <td>{{ gene.geneEntrezId || '-' }}</td>
                    <td class="pinyin-cell">{{ gene.uniprotId || '-' }}</td>
                    <td class="pinyin-cell">{{ gene.ensemblId || '-' }}</td>
                    <td>
                      <span class="type-badge" v-if="gene.typeOfGene">{{ gene.typeOfGene }}</span>
                      <span v-else>-</span>
                    </td>
                    <td class="efficacy-cell">
                      {{ gene.description ? (gene.description.length > 100 ? gene.description.substring(0, 100) + '...'
                        : gene.description) : '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="genesPagination.page" :page-size="genesPagination.pageSize"
                :total="genesPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handleGenesPageChange" background />
            </div>
          </template>
        </div>

        <!-- 表型 -->
        <div v-if="activeTab === 'phenotypes'" class="tab-content">
          <h2>{{ $t('medicine.phenotype.title') }}</h2>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon">
              <Loading />
            </el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>

          <!-- 空数据提示 -->
          <div v-else-if="phenotypes.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>

          <!-- 数据内容 -->
          <template v-else>
            <div class="academic-table-wrapper">
              <table class="academic-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.phenotype.id') }}</th>
                    <th>{{ $t('medicine.phenotype.name') }}</th>
                    <th>{{ $t('medicine.phenotype.source') }}</th>
                    <th>{{ $t('medicine.phenotype.geneCount') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="phenotype in phenotypes" :key="phenotype.phenotypeId" class="table-row">
                    <td class="id-cell clickable" @click="goToPhenotypeDetail(phenotype.phenotypeId)">{{
                      phenotype.phenotypeId }}</td>
                    <td class="name-cell clickable" @click="goToPhenotypeDetail(phenotype.phenotypeId)">
                      <div class="name-with-icon">
                        <strong>{{ phenotype.phenotypeName }}</strong>
                      </div>
                    </td>
                    <td>{{ phenotype.source || 'HPO' }}</td>
                    <td>
                      <span class="count-badge">{{ phenotype.geneCount || 0 }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页组件 -->
            <div class="pagination-wrapper">
              <el-pagination v-model:current-page="phenotypesPagination.page" :page-size="phenotypesPagination.pageSize"
                :total="phenotypesPagination.total" layout="total, prev, pager, next, jumper"
                @current-change="handlePhenotypesPageChange" background />
            </div>
          </template>
        </div>
      </div>

      <!-- 通路 -->
      <!-- 通路 -->
      <div v-if="activeTab === 'pathways'" class="tab-content">
        <h2>{{ $t('medicine.pathway.title') }}</h2>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <p>{{ t('common.loading') }}...</p>
        </div>

        <!-- 空数据提示 -->
        <div v-else-if="pathways.length === 0" class="empty-container">
          <p>{{ t('common.noData') }}</p>
        </div>

        <!-- 数据内容 -->
        <template v-else>
          <div class="academic-table-wrapper">
            <table class="academic-table">
              <thead>
                <tr>
                  <th>{{ $t('medicine.pathway.id') }}</th>
                  <th>{{ $t('medicine.pathway.name') }}</th>
                  <th>{{ $t('medicine.pathway.geneCount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pathway in pathways" :key="pathway.pathwayId" class="table-row">
                  <td class="id-cell clickable" @click="goToPathwayDetail(pathway.pathwayId)">{{ pathway.pathwayId }}
                  </td>
                  <td class="name-cell clickable" @click="goToPathwayDetail(pathway.pathwayId)">
                    <div class="name-with-icon">
                      <strong>{{ pathway.name }}</strong>
                    </div>
                  </td>
                  <td>
                    <span class="count-badge">{{ pathway.targetCount || 0 }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页组件 -->
          <div class="pagination-wrapper">
            <el-pagination v-model:current-page="pathwaysPagination.page" :page-size="pathwaysPagination.pageSize"
              :total="pathwaysPagination.total" layout="total, prev, pager, next, jumper"
              @current-change="handlePathwaysPageChange" background />
          </div>
        </template>
      </div>
      <!-- Statistics Section -->
      <div class="medicine-stats">
        <div class="stat-card card">
          <div class="stat-number">{{ stats.herbsCount.toLocaleString() }}+</div>
          <div class="stat-label">{{ $t('medicine.variety') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-number">{{ stats.formulasCount.toLocaleString() }}+</div>
          <div class="stat-label">{{ $t('home.stats.formulas') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-number">{{ stats.symptomsCount.toLocaleString() }}+</div>
          <div class="stat-label">{{ $t('medicine.symptoms') }}</div>
        </div>
        <div class="stat-card card">
          <div class="stat-number">{{ stats.casesCount.toLocaleString() }}+</div>
          <div class="stat-label">{{ $t('graph.categories.book') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, markRaw, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { GoodsFilled, Search, Orange as MedicineIcon, Document, FirstAidKit, Orange, Cherry, Apple, Pear, Files, Notebook, CollectionTag, Finished, WindPower, Loading, Platform } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getHerbsList, getPrescriptionsList, getSymptomsList, getCompoundsList, getGenesList, getSyndromesList, getPhenotypesList, getPathwaysList, getDatabaseStats } from '@/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const searchQuery = ref('')
const activeTab = ref('herbs')
const loading = ref(false)

// 分页参数
const herbsPagination = ref({ page: 1, pageSize: 6, total: 0 })
const formulasPagination = ref({ page: 1, pageSize: 4, total: 0 })
const symptomsPagination = ref({ page: 1, pageSize: 6, total: 0 })
const compoundsPagination = ref({ page: 1, pageSize: 6, total: 0 })
const genesPagination = ref({ page: 1, pageSize: 6, total: 0 })
const syndromesPagination = ref({ page: 1, pageSize: 6, total: 0 })
const phenotypesPagination = ref({ page: 1, pageSize: 6, total: 0 })
const pathwaysPagination = ref({ page: 1, pageSize: 6, total: 0 })

// // 修改这两个函数
// const i18nEffects = (formula) => {
//   return $i18n.locale === 'zh' ? (formula.effectsZh || '-') : (formula.effects || '-')
// }

// const i18nIndications = (formula) => {
//   return $i18n.locale === 'zh' ? (formula.indicationsZh || '-') : (formula.indicationsEn || '-')
// }



// 统计数据
const stats = ref({
  herbsCount: 0,
  formulasCount: 0,
  symptomsCount: 0,
  casesCount: 0
})

const tabs = computed(() => [
  { id: 'herbs', name: t('medicine.tabs.herbs'), icon: markRaw(MedicineIcon) },
  { id: 'formulas', name: t('medicine.tabs.formulas'), icon: markRaw(Document) },
  { id: 'symptoms', name: t('medicine.tabs.symptoms'), icon: markRaw(FirstAidKit) },
  { id: 'syndromes', name: t('medicine.tabs.syndromes'), icon: markRaw(Notebook) },
  { id: 'compounds', name: t('medicine.tabs.compounds'), icon: markRaw(CollectionTag) },
  { id: 'genes', name: t('medicine.tabs.genes'), icon: markRaw(Finished) },
  { id: 'phenotypes', name: t('medicine.tabs.phenotypes'), icon: markRaw(Platform) },
  { id: 'pathways', name: t('medicine.tabs.pathways'), icon: markRaw(WindPower) }
])

// 数据列表
const herbs = ref([])
const formulas = ref([])
const symptoms = ref([])
const syndromes = ref([])
const compounds = ref([])
const genes = ref([])
const phenotypes = ref([])
const pathways = ref([])

// 图标映射（为数据添加图标）
const iconMap = [markRaw(Orange), markRaw(Cherry), markRaw(Apple), markRaw(Pear)]
const formulaIconMap = [markRaw(Files), markRaw(Document), markRaw(Notebook)]
const symptomIconMap = [markRaw(WindPower), markRaw(Finished), markRaw(CollectionTag), markRaw(FirstAidKit)]

// ==================== 数据加载函数 ====================

/**
 * 加载中药材列表
 */
const loadHerbs = async () => {
  loading.value = true
  try {
    const response = await getHerbsList({
      page: herbsPagination.value.page,
      pageSize: herbsPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      herbs.value = data.map((herb, index) => ({
        ...herb,  // 保留所有后端字段
        name: herb.herbNameZh || t('medicine.herb.unknown'),  // 显示用的name字段
        pinyin: herb.pinyinName || '',
        latin: herb.latinName || '',
        english: herb.englishName || '',
        icon: iconMap[index % iconMap.length]
      }))
      herbsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载中药材失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 加载方剂列表
 */
const loadFormulas = async () => {
  loading.value = true
  try {
    const response = await getPrescriptionsList({
      page: formulasPagination.value.page,
      pageSize: formulasPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      formulas.value = data.map((formula, index) => ({
        ...formula,  // 保留所有后端字段
        name: formula.nameZh || t('medicine.herb.unknown'),  // 显示用的name字段
        pinyin: formula.pinyinName || '',
        icon: formulaIconMap[index % formulaIconMap.length]
      }))
      formulasPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载方剂失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 加载症状列表
 */
const loadSymptoms = async () => {
  loading.value = true
  try {
    const response = await getSymptomsList({
      page: symptomsPagination.value.page,
      pageSize: symptomsPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      symptoms.value = data.map((symptom, index) => ({
        ...symptom,  // 保留所有后端字段
        name: symptom.symptomNameZh || t('medicine.herb.unknown'),  // 显示用的name字段
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      symptomsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载症状失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 加载化合物列表
 */
const loadCompounds = async () => {
  loading.value = true
  try {
    const response = await getCompoundsList({
      page: compoundsPagination.value.page,
      pageSize: compoundsPagination.value.pageSize,
      keyword: searchQuery.value
    })
    // 后端返回格式: { code: 200, msg: '查询成功', total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      compounds.value = data.map((compound, index) => ({
        ...compound,
        name: compound.compoundName || compound.molecularFormula || compound.inchikey || t('medicine.herb.unknown'),
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      compoundsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载化合物失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}


/**
 * 加载基因列表
 */
const loadGenes = async () => {
  loading.value = true
  try {
    const response = await getGenesList({
      page: genesPagination.value.page,
      pageSize: genesPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", data: { rows: [...], total: 26 } }
    if (response.code === 200 && response.data) {
      const data = response.data.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      genes.value = data.map((gene, index) => ({
        ...gene,  // 保留所有后端字段
        name: gene.symbol || t('medicine.herb.unknown'),  // 显示用的name字段
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      genesPagination.value.total = response.data.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载基因失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 加载证候列表
 */
const loadSyndromes = async () => {
  loading.value = true
  try {
    const response = await getSyndromesList({
      page: syndromesPagination.value.page,
      pageSize: syndromesPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      syndromes.value = data.map((syndrome, index) => ({
        ...syndrome,  // 保留所有后端字段
        name: syndrome.syndromeNameZh || t('medicine.herb.unknown'),  // 显示用的name字段
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      syndromesPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载证候失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

// 加载表型数据
const loadPhenotypes = async () => {
  loading.value = true
  try {
    const response = await getPhenotypesList({
      page: phenotypesPagination.value.page,
      pageSize: phenotypesPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: X, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      phenotypes.value = data.map((phenotype, index) => ({
        ...phenotype,  // 保留所有后端字段
        name: phenotype.phenotypeName || t('medicine.herb.unknown'),  // 显示用的name字段
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      phenotypesPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载表型失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

// 加载通路数据
const loadPathways = async () => {
  loading.value = true
  try {
    const response = await getPathwaysList({
      page: pathwaysPagination.value.page,
      pageSize: pathwaysPagination.value.pageSize,
      keyword: searchQuery.value
    })

    // 后端返回格式: { code: 200, msg: "查询成功", total: X, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      pathways.value = data.map((pathway, index) => ({
        ...pathway,  // 保留所有后端字段
        name: pathway.name || t('medicine.herb.unknown'),  // 显示用的name字段
        icon: symptomIconMap[index % symptomIconMap.length]
      }))
      pathwaysPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载通路失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 加载统计数据
 */
const loadStats = async () => {
  try {
    const response = await getDatabaseStats()
    if (response.code === 200) {
      const data = response.data || {}
      stats.value = {
        herbsCount: data.herbsCount || 10000,
        formulasCount: data.formulasCount || 5000,
        symptomsCount: data.symptomsCount || 3000,
        casesCount: data.casesCount || 1000
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用默认值
    stats.value = {
      herbsCount: 10000,
      formulasCount: 5000,
      symptomsCount: 3000,
      casesCount: 1000
    }
  }
}

/**
 * 执行搜索
 */
const handleSearch = () => {
  // 重置到第一页
  herbsPagination.value.page = 1
  formulasPagination.value.page = 1
  symptomsPagination.value.page = 1
  syndromesPagination.value.page = 1
  compoundsPagination.value.page = 1
  genesPagination.value.page = 1
  phenotypesPagination.value.page = 1
  pathwaysPagination.value.page = 1

  // 根据当前激活的tab加载数据
  if (activeTab.value === 'herbs') {
    loadHerbs()
  } else if (activeTab.value === 'formulas') {
    loadFormulas()
  } else if (activeTab.value === 'symptoms') {
    loadSymptoms()
  } else if (activeTab.value === 'syndromes') {
    loadSyndromes()
  } else if (activeTab.value === 'compounds') {
    loadCompounds()
  } else if (activeTab.value === 'genes') {
    loadGenes()
  } else if (activeTab.value === 'phenotypes') {
    loadPhenotypes()
  } else if (activeTab.value === 'pathways') {
    loadPathways()
  }
}

/**
 * 切换分页
 */
const handleHerbsPageChange = (page) => {
  herbsPagination.value.page = page
  loadHerbs()
}

const handleFormulasPageChange = (page) => {
  formulasPagination.value.page = page
  loadFormulas()
}

const handleSymptomsPageChange = (page) => {
  symptomsPagination.value.page = page
  loadSymptoms()
}

const handleCompoundsPageChange = (page) => {
  compoundsPagination.value.page = page
  loadCompounds()
}

const handleGenesPageChange = (page) => {
  genesPagination.value.page = page
  loadGenes()
}

const handleSyndromesPageChange = (page) => {
  syndromesPagination.value.page = page
  loadSyndromes()
}

const handlePhenotypesPageChange = (page) => {
  phenotypesPagination.value.page = page
  loadPhenotypes()
}

const handlePathwaysPageChange = (page) => {
  pathwaysPagination.value.page = page
  loadPathways()
}

// 监听tab切换，加载对应数据
watch(activeTab, (newTab) => {
  if (newTab === 'herbs' && herbs.value.length === 0) {
    loadHerbs()
  } else if (newTab === 'formulas' && formulas.value.length === 0) {
    loadFormulas()
  } else if (newTab === 'symptoms' && symptoms.value.length === 0) {
    loadSymptoms()
  } else if (newTab === 'syndromes' && syndromes.value.length === 0) {
    loadSyndromes()
  } else if (newTab === 'compounds' && compounds.value.length === 0) {
    loadCompounds()
  } else if (newTab === 'genes' && genes.value.length === 0) {
    loadGenes()
  } else if (newTab === 'phenotypes' && phenotypes.value.length === 0) {
    loadPhenotypes()
  } else if (newTab === 'pathways' && pathways.value.length === 0) {
    loadPathways()
  }
})

// ==================== 路由跳转 ====================

/**
 * 跳转到药材详情页
 */
const goToHerbDetail = (herbId) => {
  router.push(`/herb/${herbId}`)
}

/**
 * 跳转到方剂详情页
 */
const goToPrescriptionDetail = (prescriptionId) => {
  router.push(`/prescription/${prescriptionId}`)
}

/**
 * 跳转到症状详情页
 */
const goToSymptomDetail = (symptomId) => {
  if (symptomId) {
    router.push({
      name: 'SymptomDetail',
      params: { id: symptomId }
    })
  }
}

/**
 * 跳转到化合物详情页
 */
const goToCompoundDetail = (inchikey) => {
  if (inchikey) {
    router.push({
      name: 'CompoundDetail',
      params: { inchikey: inchikey }
    })
  }
}

/**
 * 跳转到基因详情页
 */
const goToGeneDetail = (geneId) => {
  if (geneId) {
    router.push({
      name: 'GeneDetail',
      params: { id: geneId }
    })
  }
}

/**
 * 跳转到证候详情页
 */
const goToSyndromeDetail = (syndromeId) => {
  if (syndromeId) {
    router.push({
      name: 'SyndromeDetail',
      params: { id: syndromeId }
    })
  }
}

/**
 * 跳转到表型详情页
 */
const goToPhenotypeDetail = (phenotypeId) => {
  if (phenotypeId) {
    router.push({
      path: `/phenotype/${phenotypeId}`
    })
  }
}

/**
 * 跳转到通路详情页
 */
const goToPathwayDetail = (pathwayId) => {
  if (pathwayId) {
    router.push({
      path: `/pathway/${pathwayId}`
    })
  }
}

// 页面加载时初始化
onMounted(() => {
  loadHerbs() // 默认加载中药材
  loadStats() // 加载统计数据
})
</script>

<style scoped>
.medicine-page {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
}

.container{
  flex: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
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

.search-section {
  margin-bottom: 30px;
  padding: 30px;
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2d8659;
  box-shadow: 0 0 0 3px rgba(45, 134, 89, 0.1);
}

.search-btn {
  padding: 15px 30px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  background: white;
  border: 2px solid #2d8659;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  color: #2d8659;
}

.tab-icon {
  font-size: 24px;
}

.tab-icon .el-icon {
  font-size: 24px;
}

.tab-btn:hover {
  background: #f0f9f5;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(45, 134, 89, 0.3);
}

.content-area {
  margin-bottom: 60px;
}

.tab-content h2 {
  text-align: center;
  font-size: 32px;
  color: #1a5f4a;
  margin-bottom: 30px;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
}

.item-card {
  padding: 25px;
  transition: all 0.3s ease;
}

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.item-icon {
  font-size: 36px;
  flex-shrink: 0;
  color: #2d8659;
}

.item-icon .el-icon {
  font-size: 36px;
}

/* 学术表格样式 */
.academic-table-wrapper {
  overflow-x: auto;
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.academic-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
}

.academic-table thead {
  background: linear-gradient(135deg, #1a5f4a 0%, #2d8659 100%);
  color: white;
}

.academic-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.academic-table th:last-child {
  border-right: none;
}

.academic-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  color: #333;
}

.academic-table tbody tr:hover {
  background: #f0f9f5;
}

.academic-table tbody tr:last-child td {
  border-bottom: none;
}

.id-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2d8659;
}

.name-cell {
  font-weight: 600;
  color: #1a5f4a;
}

.name-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-icon {
  font-size: 20px;
  color: #2d8659;
}

.pinyin-cell {
  color: #666;
  font-size: 13px;
}

.latin-cell {
  font-style: italic;
  color: #666;
  font-size: 10px;
}

.efficacy-cell,
.effects-cell,
.indication-cell {
  max-width: 300px;
  line-height: 1.6;
  color: #333;
}

.bio-cell {
  font-size: 12px;
  color: #555;
  max-width: 200px;
}

.category-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #fff3e0;
  color: #ff9800;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #e8f5ef;
  color: #2d8659;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.toxicity-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.toxicity-badge.safe {
  background: #e8f5ef;
  color: #2d8659;
}

.toxicity-badge.toxic {
  background: #fff3e0;
  color: #ff9800;
}

/* 详细信息卡片 */
.detail-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 24px;
  margin-top: 30px;
}

.detail-card {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f9f5;
}

.card-icon {
  font-size: 40px;
  color: #2d8659;
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 22px;
  color: #1a5f4a;
  margin: 0 0 4px 0;
}

.pinyin-small {
  font-size: 14px;
  font-weight: 400;
  color: #666;
  margin-left: 8px;
}

.latin-name {
  font-style: italic;
  font-size: 13px;
  color: #888;
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  line-height: 1.7;
  font-size: 14px;
}

.info-row .label {
  font-weight: 600;
  color: #1a5f4a;
  min-width: 100px;
  flex-shrink: 0;
}

.info-row .value {
  color: #555;
  flex: 1;
}

.badge-value {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #e8f5ef 0%, #d4ede1 100%);
  color: #2d8659;
  border-radius: 6px;
  font-weight: 500;
}

.importance-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #8b6914;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

/* 方剂卡片样式 */
.formula-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.formula-detail-card {
  padding: 0;
  overflow: hidden;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f9f5 0%, #e8f5ef 100%);
  border-bottom: 3px solid #2d8659;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.formula-header h3 {
  font-size: 24px;
  color: #1a5f4a;
  margin: 0 0 4px 0;
}

.english-name {
  font-size: 13px;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.header-right {
  flex-shrink: 0;
}

.importance-tag {
  display: inline-block;
  padding: 8px 16px;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #8b6914;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.formula-body {
  padding: 24px;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  color: #1a5f4a;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e8f5ef;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.info-item .label {
  font-weight: 600;
  color: #1a5f4a;
  white-space: nowrap;
}

.info-item .value {
  color: #555;
}

.category-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.category-tag {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.category-tag.primary {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
}

.category-tag.secondary {
  background: #e8f5ef;
  color: #2d8659;
  border: 2px solid #2d8659;
}

.composition-box,
.function-box,
.clinical-box,
.method-box {
  background: #f8fffe;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2d8659;
}

.composition-box p,
.function-box p,
.clinical-box p,
.method-box p {
  margin: 8px 0;
  line-height: 1.8;
  color: #333;
}

.composition-en {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.info-box,
.indication-box {
  background: #f8fffe;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #2d8659;
}

.info-box p,
.indication-box p {
  margin: 8px 0;
  line-height: 1.8;
  color: #333;
}

.symptom-pinyin {
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
}

.item-description {
  margin-top: 12px;
  margin-bottom: 12px;
}

.item-description strong {
  color: #1a5f4a;
  display: block;
  margin-bottom: 8px;
}

.item-description p {
  color: #666;
  line-height: 1.8;
  margin: 0;
  text-align: justify;
  max-height: 150px;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .formula-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

.item-header h3 {
  font-size: 24px;
  color: #1a5f4a;
  margin: 0;
}

.item-properties {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.property-tag {
  padding: 5px 12px;
  background: #f0f9f5;
  border: 1px solid #2d8659;
  border-radius: 20px;
  font-size: 13px;
  color: #2d8659;
}

.property-tag.source {
  background: #fff3e0;
  border-color: #ff9800;
  color: #ff9800;
}

.item-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.item-details {
  border-top: 1px solid #e0e0e0;
  padding-top: 15px;
}

.detail-row {
  padding: 6px 0;
  color: #555;
  line-height: 1.7;
}

.detail-row strong {
  color: #1a5f4a;
}

.medicine-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 25px;
}

.stat-card {
  text-align: center;
  padding: 30px;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: #2d8659;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 16px;
  color: #666;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }

  .items-grid {
    grid-template-columns: 1fr;
  }
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #2d8659;
}

.loading-icon {
  font-size: 48px;
  animation: rotate 1.5s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 16px;
  color: #666;
}

/* 空数据状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-container p {
  font-size: 16px;
  margin: 0;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px 0;
}

.pagination-wrapper :deep(.el-pagination) {
  display: flex;
  gap: 8px;
}

.pagination-wrapper :deep(.el-pagination button:disabled) {
  background-color: #f5f5f5;
}

.pagination-wrapper :deep(.el-pager li.is-active) {
  background-color: #2d8659;
  color: white;
}

.pagination-wrapper :deep(.el-pager li:hover) {
  color: #2d8659;
}

.pagination-wrapper :deep(.el-pagination button:hover) {
  color: #2d8659;
}

/* 搜索按钮禁用状态 */
.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 可点击单元格样式 */
.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  background-color: #e8f5ef !important;
  color: #2d8659 !important;
}

.id-cell.clickable:hover,
.name-cell.clickable:hover {
  font-weight: 600;
}
</style>
