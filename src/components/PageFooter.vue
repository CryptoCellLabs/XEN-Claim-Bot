<script
    lang="ts"
    setup
>
import { useI18n } from 'vue-i18n'
import SvgIcon from '@/components/SvgIcon.vue'
import {
  websiteLink,
  docsLink,
  twitterLink,
  youtubeLink,
  blockCatLink,
  emailToLink,
  mediumLink,
  discordLink,
  XENTurboLink,
  ordinalsTurboLink
} from '@/consts/links'

interface Link {
  name: string;
  url: string;
  icon?: string;
}

interface ResourceItem {
  title: string;
  list: Link[]
}

const {t} = useI18n()

const resourceList: ResourceItem[] = [
  {
    title: 'Tools',
    list: [
      {
        icon: 'blockcat',
        name: 'BlockCat',
        url: blockCatLink
      },
      {
        icon: 'xenturbo',
        name: 'XENTurbo',
        url: XENTurboLink
      },
      {
        name: 'OrdinalsTurbo',
        url: ordinalsTurboLink
      }
    ]
  },
  {
    title: 'Resource',
    list: [
      {
        name: 'Docs',
        url: docsLink
      },
      {
        name: 'Website',
        url: websiteLink
      },
      {
        name: 'Medium',
        url: mediumLink
      }
    ]
  },
  {
    title: 'Community',
    list: [
      {
        name: 'Twitter',
        icon: 'twitter',
        url: twitterLink
      },
      {
        name: 'Discord',
        icon: 'discord',
        url: discordLink
      },
      {
        name: 'Youtube',
        icon: 'youtube',
        url: youtubeLink
      }
    ]
  },
  {
    title: 'More',
    list: [
      {
        name: 'Email',
        icon: 'mail',
        url: emailToLink
      }
    ]
  }
]
</script>

<template>
  <footer class="content-wrapper d-flex justify-space-between py-8">
    <div class="copyright">
      <div class="copyright-logo d-flex align-end mb-2">
        <a
            :href="websiteLink"
            target="_blank"
        >
          <img
              src="@/assets/imgs/cryptocell-logo.svg"
              alt=""
          >
        </a>
        <span class="text-grey ml-3">{{ t('footer.copyRights') }}</span>
      </div>
      <p class="copyright-desc text-grey">
        {{ t('footer.intro') }}
      </p>
    </div>
    <ul class="category-list d-flex">
      <li
          v-for="(item, index) in resourceList"
          :key="index"
          class="category-item mx-5"
      >
        <div class="category-title mb-3">
          {{ item.title }}
        </div>
        <ul class="category-link-list">
          <li
              v-for="(link, index) in item.list"
              :key="index"
              class="category-link-item mb-3"
          >
            <a
                :href="link.url"
                target="_blank"
                class="d-flex align-center text-grey"
            >
              <SvgIcon
                  v-if="link.icon"
                  :name="link.icon || ''"
                  class="category-link-item-icon mr-2"
                  color="grey"
              />
              <span>{{ link.name }}</span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </footer>
</template>

<style
    lang="scss"
    scoped
>
footer {
  border-top: 1px solid rgba(255, 255, 255, 0.15);

  .copyright-desc {
    max-width: 40vw;
  }

  .category-title, .category-link-item-icon {
    font-size: 1.2em
  }
}
</style>
