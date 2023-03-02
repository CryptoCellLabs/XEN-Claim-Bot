<script
    setup
    lang="ts"
>
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getChainName } from '@/utils/formatter'
import PageFooter from '@/components/PageFooter.vue'
import PageHeader from '@/components/PageHeader.vue'
import { isDesktop } from '@/utils/device'

const {t} = useI18n()
const chain = import.meta.env.VITE_APP_CHAIN
const chainName = getChainName(chain)
const isDesktopBrowser = isDesktop()
</script>

<template>
  <div class="layout-container">
    <template v-if="isDesktopBrowser">
      <PageHeader />
      <div class="page-layout page-layout-padding content-wrapper">
        <div class="text-center mb-5">
          <div class="text-h3 mb-1">{{ t('claimBot') }}</div>
          <div class="text-h5 text-grey">({{ chainName }})</div>
        </div>
        <RouterView class="page-view" />
      </div>
      <PageFooter />
    </template>
    <template v-else>
      <div class="page-layout content-wrapper d-flex justify-center align-center text-h6">
        {{ t('mobileVisitNotice') }}
      </div>
    </template>
  </div>
</template>

<style
    lang="scss"
    scoped
>
.layout-container {
  .page-layout {
    min-height: 100vh;

    &-padding {
      padding-top: 90px;
      padding-bottom: 30px;
    }
  }
}
</style>
