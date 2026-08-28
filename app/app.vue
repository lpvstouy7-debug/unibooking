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
const loadingIndicatorColor = 'repeating-linear-gradient(to right, #c5a059 0%, #d8bc7b 50%, #8a6d3b 100%)'

const themeConfig = {
  token: {
    colorPrimary: '#c5a059',
    borderRadius: 8
  }
}
</script>

<style>
body, html, #__nuxt, .ant-btn, .ant-input, .ant-menu, .ant-typography, * {
  font-family: 'Phetsarath OT', sans-serif !important;
}

/* Sitewide teal-glow backdrop: a soft cyan-teal radial glow anchored near the
   top of the viewport over a deep navy-black base, fixed so it stays put
   while the page scrolls. Every section background below is transparent so
   this shows through as one continuous gradient instead of per-section bands. */
html, body {
  background-color: #070c14;
  background-image:
    radial-gradient(1100px 650px at 50% 15%, rgba(31, 82, 102, 0.55) 0%, rgba(16, 40, 52, 0.32) 40%, rgba(7, 12, 20, 0) 70%),
    linear-gradient(180deg, #0b1420 0%, #0a121c 55%, #070c14 100%);
  background-attachment: fixed;
  background-size: 100% 100%;
}
</style>
