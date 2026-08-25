<template>
  <div>
    <section class="hero">
      <div class="container hero__row">
        <div class="hero__content">
          <a-tag class="hero__badge">ສະດວກ, ປອດໄພ, ໄວ້ໃຈໄດ້</a-tag>

          <h1 class="hero__title">
            ປະສົບການທ່ອງທ່ຽວ ທີ່ດີທີ່ສຸດ
          </h1>

          <p class="hero__subtitle">
            ປ່ຽນປະສົບການຈອງທີ່ພັກ ແລະ ການເດີນທາງຂອງທ່ານດ້ວຍແພລັດຟອມທີ່ສົມບູນແບບ.
            ງ່າຍ, ປອດໄພ ແລະ ເຊື່ອຖືໄດ້ສຳລັບການເດີນທາງທົ່ວປະເທດລາວ.
          </p>

          <div class="hero__actions">
            <a-button type="primary" size="large">ເລີ່ມຕົ້ນ</a-button>
            <a-button size="large" class="hero__btn-outline">ຮຽນຮູ້ເພີ່ມເຕີມ</a-button>
          </div>

          <a-row :gutter="16" class="hero__stats">
            <a-col :span="8">
              <div class="hero__stat-value">50K+</div>
              <div class="hero__stat-label">ຜູ້ໃຊ້ງານຈິງ</div>
            </a-col>
            <a-col :span="8">
              <div class="hero__stat-value">1M+</div>
              <div class="hero__stat-label">ທຸລະກຳ/ການຈອງ</div>
            </a-col>
            <a-col :span="8">
              <div class="hero__stat-value">98%</div>
              <div class="hero__stat-label">ອັດຕາຄວາມພໍໃຈ</div>
            </a-col>
          </a-row>
        </div>
      </div>
    </section>

    <!-- Search box overlaps the bottom edge of the hero, Booking.com/Agoda style -->
    <div class="container search-form-wrapper">
      <BookingSearchForm />
    </div>

    <!-- Services grid -->
    <section class="services-section">
      <div class="container services-section__inner">
        <div class="services-header">
          <a-tag class="services-header__badge">ບໍລິການຂອງພວກເຮົາ</a-tag>
          <h2 class="services-header__title">ເລືອກບໍລິການທ່ອງທ່ຽວ</h2>
          <p class="services-header__subtitle">
            ຄົ້ນພົບບໍລິການທີ່ຫຼາກຫຼາຍຂອງພວກເຮົາທີ່ອອກແບບມາເພື່ອຕອບສະໜອງຄວາມຕ້ອງການເດີນທາງຂອງທ່ານ
          </p>
        </div>

        <a-row :gutter="[24, 24]">
          <a-col v-for="service in services" :key="service.title" :xs="24" :sm="12" :lg="6">
            <div class="service-card">
              <div class="service-card__icon">
                <component :is="service.icon" />
              </div>
              <h3 class="service-card__title">{{ service.title }}</h3>
              <p class="service-card__desc">{{ service.description }}</p>
            </div>
          </a-col>
        </a-row>
      </div>
    </section>

    <!-- Integrated journey network -->
    <section class="journey-network-section">
      <div class="container journey-network-section__inner">
        <a-row type="flex" align="middle" :gutter="[48, 32]">
          <!-- Left: luxury copy -->
          <a-col :xs="24" :md="10">
            <span class="journey-text__label">MODULAR TRAVEL SOLUTIONS</span>
            <h2 class="journey-text__title">ການເດີນທາງທີ່ເຊື່ອມຕໍ່ກັນຢ່າງສົມບູນ</h2>
            <p class="journey-text__desc">
              ປະຢັດເວລາ ແລະ ເພີ່ມຄວາມສະດວກສະບາຍດ້ວຍແພລັດຟອມຂອງພວກເຮົາ.
              ເຊື່ອມຕໍ່ການເດີນທາງຂອງທ່ານຕັ້ງແຕ່ສະໜາມບິນ, ລົດໄຟຕ່ວນ, ລົດຮັບສົ່ງ, ໂຮງແຮມ
              ຈົນຮອດສະຖານທີ່ທ່ອງທ່ຽວ ໄວ້ໃນບ່ອນດຽວ.
            </p>
          </a-col>

          <!-- Right: glassmorphism network constellation, animated in sequence -->
          <a-col :xs="24" :md="14">
            <div class="journey-diagram">
              <!-- Soft glow blur behind the whole constellation -->
              <div class="journey-diagram__glow" />

              <svg
                class="journey-diagram__lines"
                viewBox="0 0 600 500"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0ea5e9" />
                    <stop offset="50%" stop-color="#10b981" />
                    <stop offset="100%" stop-color="#f59e0b" />
                  </linearGradient>
                </defs>
                <path
                  v-for="line in journeyLines"
                  :key="line.d"
                  class="journey-diagram__path"
                  :class="{ active: currentStep >= line.activationStep }"
                  :d="line.d"
                  fill="none"
                  stroke="url(#journeyGradient)"
                  stroke-width="3"
                  stroke-linecap="round"
                  vector-effect="non-scaling-stroke"
                />
              </svg>

              <div
                v-for="node in journeyNodes"
                :key="node.label"
                class="network-node"
                :class="{ active: currentStep >= node.activationStep }"
                :style="{ top: node.top, left: node.left }"
              >
                <div class="network-node__icon-wrap" :class="`network-node__icon-wrap--${node.accent}`">
                  <component :is="node.icon" class="network-node__icon" />
                </div>
                <span class="network-node__label">{{ node.label }}</span>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </section>

    <!-- Services grid: premium fintech-style app grid -->
    <section class="services-grid-section">
      <div class="services-grid-section__shape services-grid-section__shape--one" />
      <div class="services-grid-section__shape services-grid-section__shape--two" />

      <div class="container services-grid-section__inner">
        <div class="services-grid-header">
          <span class="services-grid-header__badge">ບໍລິການຂອງພວກເຮົາ</span>
          <h2 class="services-grid-header__title">ເລືອກບໍລິການ</h2>
          <p class="services-grid-header__subtitle">
            ຄົ້ນພົບບໍລິການດິຈິຕອລທີ່ຫຼາກຫຼາຍຂອງພວກເຮົາທີ່ອອກແບບມາເພື່ອຕອບສະໜອງຄວາມຕ້ອງການເດີນທາງຂອງທ່ານ
          </p>
        </div>

        <a-row :gutter="[24, 24]">
          <a-col v-for="item in serviceGridItems" :key="item.title" :xs="24" :sm="12" :lg="8">
            <div class="grid-card">
              <div class="grid-card__icon" :style="{ background: item.color }">
                <component :is="item.icon" class="grid-card__icon-glyph" />
              </div>
              <h3 class="grid-card__title">{{ item.title }}</h3>
              <p class="grid-card__desc">{{ item.description }}</p>
            </div>
          </a-col>
        </a-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  BankOutlined,
  CarOutlined,
  SendOutlined,
  CompassOutlined,
  RocketOutlined,
  CoffeeOutlined,
  CameraOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons-vue'

const services = [
  {
    icon: BankOutlined,
    title: 'ຈອງໂຮງແຮມ',
    description: 'ທີ່ພັກຫຼາກຫຼາຍລະດັບ ພ້ອມໂປຣໂມຊັນພິເສດ'
  },
  {
    icon: CarOutlined,
    title: 'ບໍລິການລົດເຊົ່າ',
    description: 'ລົດເຊົ່າຂັບເອງ ຫຼື ພ້ອມຄົນຂັບ ປອດໄພທຸກເສັ້ນທາງ'
  },
  {
    icon: SendOutlined,
    title: 'ຈອງປີ້ຍົນ',
    description: 'ປີ້ຍົນລາຄາປະຢັດ ຄອບຄຸມທຸກສາຍການບິນ'
  },
  {
    icon: CompassOutlined,
    title: 'ແພັກເກດທົວ',
    description: 'ທົວຄົບວົງຈອນ ຈັດກຽມທຸກຢ່າງໃຫ້ທ່ານ'
  }
]

// Positions are % of the diagram container so the layout scales with it.
// Laid out as a hub-and-spoke constellation (Transfer is the hub) rather than a straight line.
// activationStep drives the sequential reveal: node/line lights up once currentStep reaches it.
const journeyNodes = [
  { icon: RocketOutlined, label: 'ສະໜາມບິນ', accent: 'blue', activationStep: 0, top: '2%', left: '8%' },
  { icon: CarOutlined, label: 'ລົດຮັບສົ່ງ', accent: 'gold', activationStep: 2, top: '38%', left: '42%' },
  { icon: BankOutlined, label: 'ໂຮງແຮມ', accent: 'blue', activationStep: 4, top: '80%', left: '28%' },
  { icon: CoffeeOutlined, label: 'ຮ້ານອາຫານ', accent: 'blue', activationStep: 6, top: '58%', left: '6%' },
  { icon: CameraOutlined, label: 'ສະຖານທີ່ທ່ອງທ່ຽວ', accent: 'blue', activationStep: 8, top: '62%', left: '80%' }
]

// SVG coordinates in the 0-600 x 0-500 viewBox (preserveAspectRatio="none" maps
// each axis linearly to the container's %, matching the node top/left above).
// Each line's activationStep sits between its two endpoint nodes' steps, so the
// sequence reads: Airport -> line -> Transfer -> line -> Hotel/Restaurant -> line -> Attraction.
const journeyLines = [
  { d: 'M102,50 C220,90 260,160 306,230', activationStep: 1 }, // Airport -> Transfer
  { d: 'M306,230 C280,300 250,380 222,440', activationStep: 3 }, // Transfer -> Hotel
  { d: 'M306,230 C200,260 120,300 90,330', activationStep: 5 }, // Transfer -> Restaurant
  { d: 'M222,440 C340,460 460,420 534,350', activationStep: 7 } // Hotel -> Attraction
]

const serviceGridItems = [
  {
    icon: BankOutlined,
    title: 'ຈອງໂຮງແຮມ & ຣີສອດ',
    description: 'ຊອກຫາ ແລະ ຈອງທີ່ພັກທົ່ວປະເທດລາວ',
    color: '#10b981'
  },
  {
    icon: SendOutlined,
    title: 'ຈອງປີ້ຍົນ',
    description: 'ປີ້ຍົນພາຍໃນ ແລະ ຕ່າງປະເທດ',
    color: '#0ea5e9'
  },
  {
    icon: CarOutlined,
    title: 'ລົດຮັບ-ສົ່ງ & ເຊົ່າລົດ',
    description: 'ບໍລິການລົດຮັບສົ່ງສະໜາມບິນ ແລະ ລົດເຊົ່າ',
    color: '#f59e0b'
  },
  {
    icon: CameraOutlined,
    title: 'ສະຖານທີ່ທ່ອງທ່ຽວ',
    description: 'ຈອງປີ້ເຂົ້າຊົມສະຖານທີ່ທ່ອງທ່ຽວຍອດຮິດ',
    color: '#8b5cf6'
  },
  {
    icon: SafetyCertificateOutlined,
    title: 'ປະກັນໄພການເດີນທາງ',
    description: 'ເດີນທາງອຸ່ນໃຈດ້ວຍປະກັນໄພຄຸ້ມຄອງ',
    color: '#f43f5e'
  },
  {
    icon: CompassOutlined,
    title: 'ແພັກເກດທົວ',
    description: 'ທົວຄົບວົງຈອນ ຈັດກຽມທຸກຢ່າງໃຫ້ທ່ານ',
    color: '#ec4899'
  }
]

const MAX_STEP = 8
const currentStep = ref(0)
let stepTimer = null

onMounted(() => {
  stepTimer = setInterval(() => {
    currentStep.value = currentStep.value >= MAX_STEP ? 0 : currentStep.value + 1
  }, 1500)
})

onUnmounted(() => {
  clearInterval(stepTimer)
})
</script>

<style scoped>
/* Shared centered container: sections own full-width backgrounds, this caps the content at 1200px */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

.hero {
  position: relative;
  width: 100%;
  margin: 0;
  min-height: 620px;
  display: flex;
  align-items: center;
  padding: 100px 0 160px 0;
  background-image: linear-gradient(to right, rgba(6, 78, 59, 0.95) 0%, rgba(6, 78, 59, 0.4) 100%),
    url('/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}

.hero__row {
  width: 100%;
}

.hero__content {
  max-width: 640px;
  animation: fadeInUp 0.8s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero__badge {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  padding: 4px 12px;
  margin-bottom: 20px;
  backdrop-filter: blur(4px);
}

.hero__title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: #ffffff;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
  margin-bottom: 24px;
}

.hero__subtitle {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 32px;
  max-width: 480px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 44px;
}

.hero__btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: #ffffff;
}

.hero__btn-outline:hover {
  border-color: #ffffff;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

.hero__stats {
  max-width: 420px;
}

.hero__stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

.hero__stat-label {
  font-size: 13px;
  color: #b7c6f0;
}

.search-form-wrapper {
  margin-top: -60px;
  position: relative;
  z-index: 2;
}

/* Premium floating search card: bigger radius, soft shadow, borderless inputs */
.search-form-wrapper :deep(.search-form) {
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.search-form-wrapper :deep(.ant-input),
.search-form-wrapper :deep(.ant-select-selector),
.search-form-wrapper :deep(.ant-picker) {
  background: #f8fafc;
  border: 1px solid transparent;
  border-radius: 12px;
}

.search-form-wrapper :deep(.ant-input:hover),
.search-form-wrapper :deep(.ant-select:hover .ant-select-selector),
.search-form-wrapper :deep(.ant-picker:hover),
.search-form-wrapper :deep(.ant-input:focus),
.search-form-wrapper :deep(.ant-select-focused .ant-select-selector),
.search-form-wrapper :deep(.ant-picker-focused) {
  background: #ffffff;
  border-color: #1e40af;
}

/* Services grid */
.services-section {
  width: 100%;
  background: #f8fafc;
  padding: 80px 0;
}

.services-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 48px;
}

.services-header__badge {
  color: #1e40af;
  background: rgba(30, 64, 175, 0.08);
  border: none;
  border-radius: 16px;
  padding: 4px 12px;
  margin-bottom: 16px;
}

.services-header__title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
}

.services-header__subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: #64748b;
}

.service-card {
  height: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

.service-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(30, 64, 175, 0.1);
  color: #1e40af;
  font-size: 24px;
  margin-bottom: 20px;
}

.service-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.service-card__desc {
  font-size: 14px;
  line-height: 1.8;
  color: #64748b;
  margin-bottom: 0;
}

/* Integrated journey network */
.journey-network-section {
  width: 100%;
  background: #ffffff;
  padding: 100px 0;
}

.journey-text__label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #b8860b;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 999px;
  padding: 6px 16px;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.journey-text__title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.25;
  margin-bottom: 16px;
  background: linear-gradient(to right, #0f2027, #203a43, #2c5364);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.journey-text__desc {
  font-size: 15px;
  line-height: 1.85;
  color: #475569;
  max-width: 480px;
}

.journey-diagram {
  position: relative;
  min-height: 450px;
}

/* Large soft glow behind the whole constellation */
.journey-diagram__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 90%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(14, 165, 233, 0.16) 0%, rgba(16, 185, 129, 0.08) 45%, rgba(245, 158, 11, 0) 75%);
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}

.journey-diagram__lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Lines start fully undrawn and "draw" themselves once .active is applied */
.journey-diagram__path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  filter: drop-shadow(0 0 4px rgba(14, 165, 233, 0.5));
  transition: stroke-dashoffset 1s linear;
}

.journey-diagram__path.active {
  stroke-dashoffset: 0;
}

/* Nodes start dim/gray and light up in sequence once .active is applied */
.network-node {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 128px;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid #cbd5e1;
  border-radius: 18px;
  box-shadow: 0 15px 35px rgba(15, 32, 39, 0.08);
  text-align: center;
  opacity: 0.4;
  transition: opacity 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease, transform 0.25s ease;
}

.network-node:hover {
  transform: translateY(-4px);
}

.network-node.active {
  opacity: 1;
  border-color: #10b981;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.3), 0 15px 35px rgba(16, 185, 129, 0.25);
}

.network-node__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #94a3b8, #cbd5e1);
  filter: grayscale(1);
  transition: filter 0.5s ease;
}

.network-node.active .network-node__icon-wrap--blue {
  background: linear-gradient(135deg, #0ea5e9, #10b981);
}

.network-node.active .network-node__icon-wrap--gold {
  background: linear-gradient(135deg, #f59e0b, #d4af37);
}

.network-node.active .network-node__icon-wrap {
  filter: grayscale(0);
}

.network-node__icon {
  font-size: 20px;
  color: #ffffff;
}

.network-node__label {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

/* Services grid: premium fintech-style app grid */
.services-grid-section {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: #f6fcf9;
  padding: 80px 0;
}

/* Faint rotated blurred squares for texture */
.services-grid-section__shape {
  position: absolute;
  border-radius: 32px;
  transform: rotate(20deg);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}

.services-grid-section__shape--one {
  top: -60px;
  right: 8%;
  width: 260px;
  height: 260px;
  background: rgba(16, 185, 129, 0.12);
}

.services-grid-section__shape--two {
  bottom: -80px;
  left: 6%;
  width: 220px;
  height: 220px;
  background: rgba(14, 165, 233, 0.1);
  transform: rotate(-15deg);
}

.services-grid-section__inner {
  position: relative;
  z-index: 1;
}

.services-grid-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 48px;
}

.services-grid-header__badge {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: #047857;
  background: rgba(16, 185, 129, 0.12);
  border-radius: 999px;
  padding: 6px 16px;
  margin-bottom: 16px;
}

.services-grid-header__title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 12px;
}

.services-grid-header__subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: #64748b;
}

.grid-card {
  height: 100%;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  text-align: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.grid-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.08);
}

.grid-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  margin: 0 auto;
}

.grid-card__icon-glyph {
  font-size: 28px;
  color: #ffffff;
}

.grid-card__title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin-top: 16px;
  margin-bottom: 6px;
}

.grid-card__desc {
  font-size: 13px;
  line-height: 1.8;
  color: #94a3b8;
  margin-bottom: 0;
}

/* Mobile: center hero copy and stack stats a little tighter */
@media (max-width: 767px) {
  .container {
    padding: 0 16px;
  }

  .hero {
    min-height: 520px;
    padding: 56px 0 100px 0;
  }

  .hero__title {
    font-size: 2.25rem;
  }

  .hero__subtitle {
    max-width: none;
  }

  .services-section {
    padding: 64px 0;
  }

  .journey-network-section {
    padding: 64px 0;
    text-align: center;
  }

  .journey-text__desc {
    max-width: none;
  }

  .journey-diagram {
    min-height: 340px;
  }

  .network-node {
    width: 92px;
    padding: 10px 8px;
    gap: 6px;
  }

  .network-node__icon-wrap {
    width: 34px;
    height: 34px;
  }

  .network-node__icon {
    font-size: 16px;
  }

  .network-node__label {
    font-size: 10px;
  }

  .services-grid-section {
    padding: 64px 0;
  }
}

/* Very small screens: the constellation gets too cramped for the connecting lines to read cleanly */
@media (max-width: 480px) {
  .journey-diagram__lines,
  .journey-diagram__glow {
    display: none;
  }
}
</style>
