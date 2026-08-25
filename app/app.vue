<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator
      :color="loadingIndicatorColor"
      :height="4"
    />
    <!-- Global Ant Design Vue theme: ocean blue primary + friendly rounded corners -->
    <a-config-provider :theme="themeConfig">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </a-config-provider>
  </div>
</template>

<script setup>
const loadingIndicatorColor = 'repeating-linear-gradient(to right, #1e40af 0%, #3b5bdb 50%, #0f3460 100%)'

const themeConfig = {
  token: {
    colorPrimary: '#1e40af',
    borderRadius: 8
  }
}
</script>

<style>
body, html, #__nuxt, .ant-btn, .ant-input, .ant-menu, .ant-typography, * {
  font-family: 'Phetsarath OT', sans-serif !important;
}
</style>
