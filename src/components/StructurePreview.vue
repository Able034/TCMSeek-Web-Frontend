<template>
  <div
    class="structure-preview"
    :style="{ width: `${width}px`, height: `${height}px` }"
    v-loading="loading"
  >
    <div v-if="errorMessage" class="structure-preview__error">{{ errorMessage }}</div>
    <div v-else-if="svgContent" class="structure-preview__svg" v-html="svgContent"></div>
    <div v-else class="structure-preview__placeholder">-</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getRDKitModule } from '@/utils/rdkit'
import { fetchTargetPredictionFileText } from '@/api/targetPrediction'

const svgCache = new Map()

const props = defineProps({
  requestId: {
    type: Number,
    required: true
  },
  relativePath: {
    type: String,
    required: true
  },
  wemolUserName: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: 90
  },
  height: {
    type: Number,
    default: 90
  }
})

const { t } = useI18n()
const svgContent = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function renderStructure() {
  if (!props.requestId || !props.relativePath || !props.wemolUserName) {
    svgContent.value = ''
    return
  }
  const cacheKey = `${props.requestId}:${props.relativePath}`
  if (svgCache.has(cacheKey)) {
    svgContent.value = svgCache.get(cacheKey)
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const rdkit = await getRDKitModule()
    const molBlock = await fetchTargetPredictionFileText(
      props.requestId,
      props.relativePath,
      props.wemolUserName
    )
    const mol = rdkit.get_mol(molBlock)
    const svg = mol.get_svg()
    mol.delete()
    svgCache.set(cacheKey, svg)
    svgContent.value = svg
  } catch (error) {
    errorMessage.value = t('targetPrediction.result.previewError')
    console.error('RDKit render failed', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.requestId, props.relativePath, props.wemolUserName],
  () => {
    svgContent.value = ''
    errorMessage.value = ''
    if (props.requestId && props.relativePath && props.wemolUserName) {
      renderStructure()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.structure-preview {
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.structure-preview__svg :deep(svg) {
  width: 100%;
  height: 100%;
}

.structure-preview__placeholder,
.structure-preview__error {
  font-size: 12px;
  color: #999;
  text-align: center;
  padding: 4px;
}

.structure-preview__error {
  color: #f56c6c;
}
</style>
