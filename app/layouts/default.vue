<template>
  <a-layout class="site-layout">
    <!-- Top bar: slim dark strip above the main header, holds the language switcher -->
    <div class="top-bar">
      <div class="container top-bar__inner">
        <ClientOnly>
          <a-dropdown placement="bottomRight">
            <a class="lang-switcher" @click.prevent>
              <GlobalOutlined />
              <span class="lang-switcher__label">{{ currentLang }}</span>
            </a>
            <template #overlay>
              <a-menu @click="({ key }) => handleLangChange(key)">
                <a-menu-item key="EN">EN</a-menu-item>
                <a-menu-item key="Lao">Lao</a-menu-item>
                <a-menu-item key="Thai">Thai</a-menu-item>
                <a-menu-item key="Cha">Cha</a-menu-item>
                <a-menu-item key="Vt">Vt</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </ClientOnly>
      </div>
    </div>

    <!-- Header: pure white bg, logo | centered nav | user actions -->
    <a-layout-header class="site-header">
      <div class="container site-header__inner">
        <NuxtLink to="/" class="logo">UniBooking</NuxtLink>

        <!-- Desktop nav: centered, hidden below 768px via CSS.
             ClientOnly avoids the AMenu/Overflow/ResizeObserver SSR hydration crash
             (Ant Design Vue's Menu measures DOM nodes that don't exist during SSR). -->
        <ClientOnly>
          <a-menu
            mode="horizontal"
            :selectable="false"
            class="nav-menu nav-menu--desktop"
          >
            <a-menu-item key="home">
              <NuxtLink to="/">Home</NuxtLink>
            </a-menu-item>
            <a-menu-item key="hotels">
              <NuxtLink to="/hotels">Hotels</NuxtLink>
            </a-menu-item>
            <a-menu-item key="transport">
              <NuxtLink to="/transport">Transport</NuxtLink>
            </a-menu-item>
          </a-menu>

          <!-- Static fallback rendered during SSR / before hydration so layout doesn't jump -->
          <template #fallback>
            <div class="nav-menu nav-menu--desktop nav-menu--fallback" />
          </template>
        </ClientOnly>

        <!-- Right-hand actions: user dropdown or login link (desktop only) + hamburger (mobile only) -->
        <div class="site-header__actions">
          <ClientOnly>
            <a-dropdown v-if="authStore.isAuthenticated" placement="bottomRight" class="user-menu-wrapper--desktop">
              <a class="user-menu" @click.prevent>
                <a-avatar>{{ userInitial }}</a-avatar>
                <span class="user-menu__name">{{ authStore.user?.name }}</span>
              </a>
              <template #overlay>
                <a-menu @click="handleMenuClick">
                  <a-menu-item key="logout">ອອກຈາກລະບົບ</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
            <NuxtLink v-else to="/login" class="login-link user-menu-wrapper--desktop">
              Login
            </NuxtLink>
          </ClientOnly>

          <!-- Mobile hamburger: hidden from 768px up via CSS -->
          <a-button
            type="text"
            class="hamburger-btn"
            @click="isDrawerOpen = true"
          >
            <MenuOutlined style="font-size: 20px" />
          </a-button>
        </div>
      </div>
    </a-layout-header>

    <!-- Mobile navigation drawer -->
    <a-drawer
      v-model:open="isDrawerOpen"
      title="UniBooking"
      placement="right"
      width="260"
    >
      <ClientOnly>
        <a-menu mode="vertical" :selectable="false" @click="handleDrawerMenuClick">
          <a-menu-item key="home">
            <NuxtLink to="/">Home</NuxtLink>
          </a-menu-item>
          <a-menu-item key="hotels">
            <NuxtLink to="/hotels">Hotels</NuxtLink>
          </a-menu-item>
          <a-menu-item key="transport">
            <NuxtLink to="/transport">Transport</NuxtLink>
          </a-menu-item>

          <template v-if="authStore.isAuthenticated">
            <a-menu-item key="profile">
              <NuxtLink to="/profile">{{ authStore.user?.name }}</NuxtLink>
            </a-menu-item>
            <a-menu-item key="logout">
              ອອກຈາກລະບົບ
            </a-menu-item>
          </template>
          <a-menu-item v-else key="login">
            <NuxtLink to="/login">Login</NuxtLink>
          </a-menu-item>
        </a-menu>
      </ClientOnly>
    </a-drawer>

    <!-- Content: pages render here. Full-bleed: no horizontal boxing at this level,
         each page/section owns its own background width and .container centering. -->
    <a-layout-content class="site-content">
      <slot />
    </a-layout-content>

    <!-- Footer -->
    <a-layout-footer class="site-footer">
      &copy; {{ new Date().getFullYear() }} UniBooking Travel. All rights reserved.
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MenuOutlined, GlobalOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '~/stores/auth'

// Session restore happens in app/plugins/auth.client.js, before mount
const authStore = useAuthStore()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')

const isDrawerOpen = ref(false)

const currentLang = ref('Lao')

function handleLangChange(lang) {
  currentLang.value = lang
}

function handleMenuClick({ key }) {
  if (key === 'logout') {
    authStore.logout()
  }
}

// Mobile drawer menu: close the drawer on any tap, and log out if that's what was tapped
function handleDrawerMenuClick({ key }) {
  isDrawerOpen.value = false
  if (key === 'logout') {
    authStore.logout()
  }
}
</script>

<style scoped>
.site-layout {
  min-height: 100vh;
}

/* Shared centered container: full-width bars/sections sit behind this, content stays 1200px-capped */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
}

/* Top bar */
.top-bar {
  width: 100%;
  background: #0f172a;
}

.top-bar__inner {
  height: 36px;
  align-items: center;
  /* Only one item (lang switcher) lives here, so keep it flush right rather than
     letting the shared .container's space-between push it to the start */
  justify-content: flex-end;
}

.lang-switcher {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  cursor: pointer;
}

.lang-switcher:hover {
  color: #ffffff;
}

/* Header: premium dark green, seamless with the hero below (no border/shadow separating them) */
.site-header {
  width: 100%;
  background: #064e3b;
  height: 64px;
  line-height: 64px;
}

.site-header__inner {
  height: 100%;
  align-items: center;
}

.logo {
  flex: 0 0 auto;
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  letter-spacing: 0.5px;
}

/* Nav sits in the remaining space and centers itself within it */
.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(.ant-menu-item) {
  color: rgba(255, 255, 255, 0.85);
}

.nav-menu :deep(a) {
  color: inherit;
  text-decoration: none;
}

.nav-menu :deep(.ant-menu-item:hover) {
  color: #ffffff;
}

.nav-menu :deep(.ant-menu-item-selected) {
  color: #ffffff;
  font-weight: 600;
}

.nav-menu :deep(.ant-menu-item-selected)::after {
  border-bottom-color: #ffffff !important;
}

/* Reserves the nav's height during SSR/pre-hydration so nothing jumps when ClientOnly swaps in */
.nav-menu--fallback {
  flex: 1;
  height: 64px;
}

.site-header__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.login-link {
  color: #ffffff;
  font-weight: 500;
  text-decoration: none;
}

.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #ffffff;
}

.user-menu__name {
  font-weight: 500;
}

/* Mobile hamburger: hidden on desktop, shown below 768px */
.hamburger-btn {
  display: none;
  color: #ffffff;
}

@media (max-width: 767px) {
  .nav-menu--desktop,
  .user-menu-wrapper--desktop {
    display: none;
  }

  .hamburger-btn {
    display: inline-flex;
    align-items: center;
  }

  .container {
    padding: 0 16px;
  }
}

/* Content: no horizontal padding here by design (full-bleed pages own their own
   background width); pages that need a boxed look supply their own max-width wrapper. */
.site-content {
  min-height: calc(100vh - 64px - 70px - 36px);
  background: #f0f9ff;
}

/* Footer */
.site-footer {
  text-align: center;
  background: #f0f9ff;
  color: #64748b;
  padding: 24px;
  height: 70px;
}
</style>
