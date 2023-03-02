<script
    lang="ts"
    setup
>
import {
  discordLink,
  twitterLink,
  XENClaimBotGithubLink,
  XENTurboClaimBotLink,
  XENTurboDashboardLink,
  XENTurboMinerLink,
  XENTurboMonitorLink,
  XENTurboPortfolioLink,
  XENTurboXENFTLink
} from '@/consts/links'
import { useI18n } from 'vue-i18n'
import GithubIcon from '@/assets/imgs/github-round.svg'
import DiscordIcon from '@/assets/imgs/discord-round.svg'
import TwitterIcon from '@/assets/imgs/twitter-round.svg'

interface LinkItem {
  url: string;
  label: string;
  icon?: string;
}

const {t} = useI18n()

const navList: LinkItem[] = [
  {
    url: XENTurboXENFTLink,
    label: t('header.xenft')
  },
  {
    url: XENTurboMonitorLink,
    label: t('header.monitor')
  },
  {
    url: XENTurboDashboardLink,
    label: t('header.dashboard')
  },
  {
    url: XENTurboPortfolioLink,
    label: t('header.portfolio')
  },
  {
    url: XENTurboMinerLink,
    label: t('header.miner')
  },
  {
    url: XENTurboClaimBotLink,
    label: t('header.claimbot')
  }
]

const extraLinkList: LinkItem[] = [
  {
    icon: GithubIcon,
    url: XENClaimBotGithubLink,
    label: 'Github'
  },
  {
    icon: DiscordIcon,
    url: discordLink,
    label: 'Discord'
  },
  {
    icon: TwitterIcon,
    url: twitterLink,
    label: 'Twitter'
  }
]
</script>

<template>
  <header class="content-wrapper d-flex justify-space-between align-center">
    <a
        class="header-logo-link mr-10"
        :href="XENTurboClaimBotLink"
    >
      <img
          src="@/assets/imgs/xenturbo-logo.png"
          alt=""
      >
    </a>
    <ul class="nav-list d-flex align-center">
      <li
          v-for="(item, index) in navList"
          :key="index"
          class="nav-item"
      >
        <a
            :href="item.url"
            target="_blank"
            class="text-grey-lighten-1 mx-md-6 ma-lg-8 nav-item-link"
        >
          {{ item.label }}
        </a>
      </li>
    </ul>
    <ul class="link-list d-flex">
      <li
          v-for="(item, index) in extraLinkList"
          :key="index"
          class="link-item mx-2"
      >
        <a
            :href="item.url"
            target="_blank"
        >
          <img
              class="link-item-icon"
              :src="item.icon"
              :alt="item.label"
          />
        </a>
      </li>
    </ul>
  </header>
</template>

<style
    lang="scss"
    scoped
>
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #000;
  z-index: 99;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);

  .header-logo-link {
    img {
      height: 40px;
    }
  }

  .nav-list {
    cursor: pointer;
    white-space: nowrap;
    flex: 1;

    .nav-item {
      &-link {
        font-size: 18px;
        font-weight: 500;
      }
    }
  }

  .link-list {
    .link-item {
      &-icon {
        width: 32px;
        height: 32px;
      }
    }
  }
}
</style>
