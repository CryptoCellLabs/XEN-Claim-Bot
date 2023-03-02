<script
    lang="ts"
    setup
>
import { ref } from 'vue'
import copy from 'copy-text-to-clipboard'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  text: string;
  tipText?: string;
  target?: any;
}>()

const {t} = useI18n({
  messages: {
    en: {
      clickToCopy: 'Click to copy'
    },
    'zh-TW': {
      clickToCopy: '點擊復製'
    },
    'zh-CN': {
      clickToCopy: '点击复制'
    }
  }
})

const text = ref(props.tipText || t('clickToCopy'))

const copyText = () => {
  if (props.target) {
    copy(props.text, {
      target: props.target
    })
  } else {
    copy(props.text)
  }
}
</script>

<template>
  <VBtn
      variant="text"
      size="small"
      icon
      @click="copyText"
  >
    <VIcon icon="mdi-content-copy" />
    <VTooltip
        activator="parent"
        location="top"
    >
      {{ text }}
    </VTooltip>
  </VBtn>
</template>
