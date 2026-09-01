<template>
  <div class="secure-payment">
    <svg class="secure-payment__logo secure-payment__logo--visa" viewBox="0 0 48 20" role="img" aria-label="VISA">
      <text x="24" y="15" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="700" font-size="16" letter-spacing="0.5" fill="#1a1f71">VISA</text>
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 40 24" role="img" aria-label="Mastercard">
      <circle cx="15" cy="12" r="11" fill="#eb001b" />
      <circle cx="25" cy="12" r="11" fill="#f79e1b" />
      <path d="M20 3.5a11 11 0 0 1 0 17 11 11 0 0 1 0-17z" fill="#ff5f00" />
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 40 22" role="img" aria-label="UnionPay">
      <rect x="1" y="2" width="11" height="18" rx="2" fill="#e21836" />
      <rect x="14.5" y="2" width="11" height="18" rx="2" fill="#00447c" />
      <rect x="28" y="2" width="11" height="18" rx="2" fill="#00913a" />
      <text x="20" y="14.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="7" fill="#ffffff">UP</text>
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 36 22" role="img" aria-label="JCB">
      <rect x="1" y="1" width="10.5" height="20" rx="3" fill="#0e6eb8" />
      <rect x="12.75" y="1" width="10.5" height="20" rx="3" fill="#ee0839" />
      <rect x="24.5" y="1" width="10.5" height="20" rx="3" fill="#00a650" />
      <text x="18" y="14.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="8" fill="#ffffff">JCB</text>
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 44 22" role="img" aria-label="American Express">
      <rect x="0" y="0" width="44" height="22" rx="3" fill="#2e77bc" />
      <text x="22" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="8.5" letter-spacing="0.3" fill="#ffffff">AMEX</text>
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 34 22" role="img" aria-label="WeChat Pay">
      <path d="M6 3h20a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5h-8l-5 3 1-3H6a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5z" fill="#09bb07" />
      <text x="16" y="12.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="10" fill="#ffffff">¥</text>
    </svg>

    <svg class="secure-payment__logo" viewBox="0 0 76 22" role="img" aria-label="Alipay+">
      <text x="0" y="16" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="#1677ff">Alipay</text>
      <text x="60" y="16" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="#00a3ff">+</text>
    </svg>
  </div>
</template>

<script setup>
// Flat, static logo row -- no glass/3D card treatment. Logos are
// simplified inline SVG renditions (brand colors, not trademarked artwork).
</script>

<style scoped>
/* Flat logo row -- no cards, no borders, no shadows */
.secure-payment {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  padding: 20px 0;
}

.secure-payment__logo {
  height: 36px;
  width: auto;
  display: block;
}

/* Overrides the inline fill="#1a1f71" presentation attribute on the VISA
   text element -- a CSS fill declaration always wins over a presentation
   attribute, regardless of selector specificity. */
.secure-payment__logo--visa text {
  fill: #ff0000;
}
</style>
