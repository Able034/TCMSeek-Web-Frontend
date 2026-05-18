<template>
  <div v-if="normalizedSections.length" class="anchor-nav">
    <div class="anchor-card">
      <p class="anchor-title">{{ titleText }}</p>
      <ul class="anchor-list">
        <li
          v-for="section in normalizedSections"
          :key="section.id"
          :class="['anchor-item', { active: activeId === section.id }]"
          @click="handleClick(section)"
        >
          <span class="anchor-dot"></span>
          <span class="anchor-text">{{ getLabel(section) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  },
  titleKey: {
    type: String,
    default: 'common.anchorTitle'
  },
  scrollOffset: {
    type: Number,
    default: 80
  }
})

const { t } = useI18n()

const activeId = ref('')
let observer = null

const normalizedSections = computed(() =>
  (props.sections || []).filter((section) => section && section.id)
)

const titleText = computed(() => t(props.titleKey || 'common.anchorTitle'))

const getLabel = (section) => {
  if (!section) return ''
  if (section.label) return section.label
  if (section.labelKey) return t(section.labelKey)
  return ''
}

const disconnectObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

const initObserver = async () => {
  if (typeof window === 'undefined' || !normalizedSections.value.length) {
    activeId.value = ''
    return
  }

  await nextTick()

  disconnectObserver()

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        activeId.value = visible[0].target.id
      }
    },
    {
      root: null,
      rootMargin: '-40% 0px -50% 0px',
      threshold: 0.1
    }
  )

  normalizedSections.value.forEach((section) => {
    const el = document.getElementById(section.id)
    if (el) {
      observer.observe(el)
    }
  })

  if (!activeId.value && normalizedSections.value.length) {
    activeId.value = normalizedSections.value[0].id
  }
}

watch(
  normalizedSections,
  async () => {
    await initObserver()
  },
  { immediate: true }
)

const handleClick = async (section) => {
  if (!section || !section.id || typeof window === 'undefined') return

  if (typeof section.onActivate === 'function') {
    await section.onActivate()
  }

  await nextTick()

  const target = document.getElementById(section.id)
  if (!target) return

  const top =
    target.getBoundingClientRect().top + window.pageYOffset - props.scrollOffset

  window.scrollTo({
    top,
    behavior: 'smooth'
  })

  activeId.value = section.id
}

onUnmounted(() => {
  disconnectObserver()
})
</script>

<style scoped>
.anchor-nav {
  position: fixed;
  top: 140px;
  right: 40px;
  width: 240px;
  z-index: 20;
}

.anchor-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.anchor-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a5f4a;
  margin-bottom: 12px;
}

.anchor-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.anchor-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;
}

.anchor-item:hover {
  background: #f0f9f5;
  color: #1a5f4a;
}

.anchor-item.active {
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
}

.anchor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c0c4cc;
  flex-shrink: 0;
}

.anchor-item.active .anchor-dot {
  background: #1890ff;
}

.anchor-text {
  flex: 1;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .anchor-nav {
    display: none;
  }
}
</style>
