<template>
  <a-layout class="site-layout">
    <!-- Header: white bg + ocean blue accents, sits above content -->
    <a-layout-header class="site-header">
      <div class="site-header__inner">
        <NuxtLink to="/" class="logo">UniBooking</NuxtLink>

        <!-- Desktop nav: hidden below 768px via CSS -->
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
          <a-menu-item v-if="!authStore.isAuthenticated" key="login">
            <NuxtLink to="/login">Login</NuxtLink>
          </a-menu-item>
        </a-menu>

        <!-- Logged-in state: avatar + dropdown replaces the Login link (desktop only) -->
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

        <!-- Mobile hamburger: hidden from 768px up via CSS -->
        <a-button
          type="text"
          class="hamburger-btn"
          @click="isDrawerOpen = true"
        >
          <MenuOutlined style="font-size: 20px" />
        </a-button>
      </div>
    </a-layout-header>

    <!-- Mobile navigation drawer -->
    <a-drawer
      v-model:open="isDrawerOpen"
      title="UniBooking"
      placement="right"
      width="260"
    >
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
    </a-drawer>

    <!-- Content: pages render here -->
    <a-layout-content class="site-content">
      <div class="site-content__inner">
        <slot />
      </div>
    </a-layout-content>

    <!-- Footer -->
    <a-layout-footer class="site-footer">
      &copy; {{ new Date().getFullYear() }} UniBooking Travel. All rights reserved.
    </a-layout-footer>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MenuOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '~/stores/auth'

// Session restore happens in app/plugins/auth.client.js, before mount
const authStore = useAuthStore()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')

const isDrawerOpen = ref(false)

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

/* Header */
.site-header {
  background: #ffffff;
  border-bottom: 1px solid #e6f4fb;
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.06);
}

.site-header__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 22px;
  font-weight: 700;
  color: #0284c7;
  text-decoration: none;
  letter-spacing: 0.5px;
}

.nav-menu {
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(a) {
  color: inherit;
  text-decoration: none;
}

.nav-menu :deep(.ant-menu-item-selected) {
  color: #0ea5e9;
}

.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #0c4a6e;
}

.user-menu__name {
  font-weight: 500;
}

/* Mobile hamburger: hidden on desktop, shown below 768px */
.hamburger-btn {
  display: none;
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
}

/* Content */
.site-content {
  min-height: calc(100vh - 64px - 70px);
  padding: 24px;
  background: #f0f9ff;
}

.site-content__inner {
  max-width: 1200px;
  margin: 0 auto;
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
