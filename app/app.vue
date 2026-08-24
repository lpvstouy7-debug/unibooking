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
const loadingIndicatorColor = 'repeating-linear-gradient(to right, #0ea5e9 0%, #38bdf8 50%, #0284c7 100%)'

const themeConfig = {
  token: {
    colorPrimary: '#0ea5e9',
    borderRadius: 8
  }
}
</script>
