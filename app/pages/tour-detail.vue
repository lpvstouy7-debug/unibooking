<template>
  <div class="tour-detail">
    <div class="container">
      <!-- Hero gallery: 1 large main image + 2 stacked side images -->
      <section class="gallery">
        <div class="gallery-main">
          <img src="/images/Wat-Phu-Laos.jpg" alt="ວັດພູ - Wat Phu Champasak">

          <button type="button" class="virtual-tour-btn" @click="isMapModalOpen = true">
            📍 View Location on Map
          </button>
        </div>

        <div class="gallery-side">
          <div class="gallery-side__item">
            <img src="/images/khonephapheng.jpg" alt="ນ້ຳຕົກຄອນພະເພັງ">
          </div>
          <div class="gallery-side__item">
            <img src="/images/Tardkaungse.png" alt="ນ້ຳຕົກຕາດກວາງຊີ">
          </div>
        </div>
      </section>

      <!-- Map Modal -->
      <Teleport to="body">
        <div v-if="isMapModalOpen" class="vt-modal" @click.self="isMapModalOpen = false">
          <button type="button" class="vt-modal__close" aria-label="Close" @click="isMapModalOpen = false">
            Close <CloseOutlined />
          </button>
          <div class="vt-modal__frame-wrap">
            <iframe
              class="vt-modal__frame"
              width="100%"
              height="100%"
              :src="mapEmbedUrl"
              title="Location Map"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            />
          </div>
        </div>
      </Teleport>

      <!-- Content: main details + sticky booking widget -->
      <section class="detail-grid">
        <!-- Left column -->
        <div class="detail-main">
          <span class="detail-badge">WORLD HERITAGE</span>
          <h1 class="detail-title">ວັດພູ ຈຳປາສັກ ແລະ ນ້ຳຕົກຄອນພະເພັງ</h1>
          <div class="detail-location">
            <EnvironmentOutlined />
            <span>ແຂວງຈຳປາສັກ, ລາວ (Champasak Province, Laos)</span>
          </div>

          <div class="detail-meta">
            <span class="detail-meta__item"><StarFilled /> 4.9 (312 ລີວິວ)</span>
            <span class="detail-meta__item"><ClockCircleOutlined /> 2 ວັນ 1 ຄືນ</span>
            <span class="detail-meta__item"><TeamOutlined /> ສູງສຸດ 12 ຄົນ</span>
          </div>

          <h2 class="detail-section-title">Overview</h2>
          <p class="detail-overview">
            ຄົ້ນຫາຄວາມສະຫງ່າງາມຂອງມໍລະດົກໂລກວັດພູ ວັດຮ້າງບູຮານອາຍຸກວ່າພັນປີທີ່ຕັ້ງຢູ່ຕີນພູກະເບົ້າ
            ພ້ອມສຳຜັດພະລັງອັນຍິ່ງໃຫຍ່ຂອງນ້ຳຕົກຄອນພະເພັງ ນ້ຳຕົກທີ່ໃຫຍ່ທີ່ສຸດໃນອາຊີຕາເວັນອອກສ່ຽງໃຕ້.
            ການເດີນທາງນີ້ອອກແບບມາສະເພາະສຳລັບຜູ້ທີ່ຕ້ອງການປະສົບການທ່ອງທ່ຽວລະດັບພຣີເມ້ຍມ
            ພ້ອມໄກເຊິດທ້ອງຖິ່ນຜູ້ຊ່ຽວຊານ ແລະ ການເດີນທາງທີ່ສະດວກສະບາຍຕະຫຼອດການເດີນທາງ.
          </p>

          <h2 class="detail-section-title">Location</h2>
          <div class="detail-map">
            <iframe
              class="detail-map__frame"
              width="100%"
              height="100%"
              :src="mapEmbedUrl"
              title="Location Map"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            />
          </div>

          <h2 class="detail-section-title">Inclusions</h2>
          <ul class="detail-inclusions">
            <li v-for="item in inclusions" :key="item">
              <CheckCircleFilled />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <!-- Right column: sticky booking widget -->
        <aside class="booking-widget">
          <div class="booking-widget__price">
            <span class="booking-widget__price-amount">$189</span>
            <span class="booking-widget__price-unit">/ ຄົນ</span>
          </div>

          <label class="booking-widget__label">ວັນທີເດີນທາງ</label>
          <a-date-picker
            v-model:value="selectedDate"
            class="booking-widget__input"
            placeholder="ເລືອກວັນທີ"
          />

          <label class="booking-widget__label">ຈຳນວນແຂກ</label>
          <a-select
            v-model:value="guestCount"
            class="booking-widget__input"
            :options="guestOptions"
          />

          <button type="button" class="booking-widget__btn">
            Book Now
          </button>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  EnvironmentOutlined,
  StarFilled,
  ClockCircleOutlined,
  TeamOutlined,
  CheckCircleFilled,
  CloseOutlined
} from '@ant-design/icons-vue'

const isMapModalOpen = ref(false)

// Shared by both the inline location preview and the full-screen modal map
const mapEmbedUrl = 'https://www.google.com/maps?q=Wat+Phou+Champasak,+Laos&output=embed'

const selectedDate = ref(null)
const guestCount = ref(2)

const guestOptions = [
  { value: 1, label: '1 ຄົນ' },
  { value: 2, label: '2 ຄົນ' },
  { value: 3, label: '3 ຄົນ' },
  { value: 4, label: '4 ຄົນ' },
  { value: 5, label: '5+ ຄົນ' }
]

const inclusions = [
  'ລົດຮັບ-ສົ່ງ ຕະຫຼອດການເດີນທາງ',
  'ໄກເຊິດທ້ອງຖິ່ນເວົ້າພາສາອັງກິດ',
  'ຄ່າເຂົ້າຊົມສະຖານທີ່ທັງໝົດ',
  'ອາຫານທ່ຽງ ແລະ ນ້ຳດື່ມ',
  'ປະກັນໄພການເດີນທາງ'
]
</script>

<style scoped>
.tour-detail {
  width: 100%;
  background: #fbf9f2;
  padding: 48px 0 96px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

/* ============================================================
   Hero gallery
   ============================================================ */
.gallery {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 48px;
}

.gallery-main {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  min-height: 480px;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gallery-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gallery-side__item {
  flex: 1;
  border-radius: 20px;
  overflow: hidden;
  min-height: 232px;
}

.gallery-side__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Map button: glassmorphism + gold border + pulse */
.virtual-tour-btn {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1.5px solid #c5a059;
  border-radius: 999px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  animation: pulseTour 2.4s ease-in-out infinite;
  transition: transform 0.25s ease, background 0.25s ease;
}

.virtual-tour-btn:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.28);
}

@keyframes pulseTour {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(197, 160, 89, 0.55);
  }
  50% {
    box-shadow: 0 0 0 14px rgba(197, 160, 89, 0);
  }
}

/* ============================================================
   Map Modal
   ============================================================ */
.vt-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Outer wrap sizes the modal viewport (90vw/90vh); the iframe inside then
   fills 100% of that box per the map's own sizing requirement. */
.vt-modal__frame-wrap {
  width: 90vw;
  height: 90vh;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.vt-modal__frame {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 12px;
}

.vt-modal__close {
  position: absolute;
  top: 28px;
  right: 32px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(197, 160, 89, 0.6);
  border-radius: 999px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease;
}

.vt-modal__close:hover {
  background: #c5a059;
  color: #1a3c28;
}

/* ============================================================
   2-column content layout
   ============================================================ */
.detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: flex-start;
  gap: 40px;
}

.detail-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #c5a059;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.detail-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.3;
  color: #1a3c28;
  margin-bottom: 16px;
}

.detail-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #5c6b62;
  font-size: 14px;
  margin-bottom: 20px;
}

.detail-location :deep(svg) {
  color: #c5a059;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 20px 0;
  margin-bottom: 32px;
  border-top: 1px solid rgba(26, 60, 40, 0.1);
  border-bottom: 1px solid rgba(26, 60, 40, 0.1);
}

.detail-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1a3c28;
}

.detail-meta__item :deep(svg) {
  color: #c5a059;
}

.detail-section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a3c28;
  margin-bottom: 16px;
}

.detail-overview {
  font-size: 15px;
  line-height: 1.9;
  color: #5c6b62;
  margin-bottom: 40px;
}

/* Inline location preview — lets guests see the map without opening the modal */
.detail-map {
  width: 100%;
  height: 260px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 8px 24px rgba(26, 60, 40, 0.1);
}

.detail-map__frame {
  width: 100%;
  height: 100%;
  border: 0;
}

.detail-inclusions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-inclusions li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #1a3c28;
}

.detail-inclusions li :deep(svg) {
  color: #10b981;
  margin-top: 3px;
  flex-shrink: 0;
}

/* ============================================================
   Sticky booking widget
   ============================================================ */
.booking-widget {
  position: sticky;
  top: 100px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 50px rgba(26, 60, 40, 0.15);
}

.booking-widget__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 24px;
}

.booking-widget__price-amount {
  font-size: 32px;
  font-weight: 800;
  color: #1a3c28;
}

.booking-widget__price-unit {
  font-size: 14px;
  color: #8a8577;
}

.booking-widget__label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1a3c28;
  margin-bottom: 8px;
}

.booking-widget__input {
  width: 100%;
  margin-bottom: 20px;
}

.booking-widget__btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #c5a059, #1a3c28);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(26, 60, 40, 0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.booking-widget__btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 36px rgba(26, 60, 40, 0.4);
}

/* ============================================================
   Responsive
   ============================================================ */
@media (max-width: 900px) {
  .gallery {
    grid-template-columns: 1fr;
  }

  .gallery-main {
    min-height: 320px;
  }

  .gallery-side {
    flex-direction: row;
  }

  .gallery-side__item {
    min-height: 160px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .booking-widget {
    position: static;
    top: auto;
    width: 100%;
    margin-top: 8px;
  }

  .detail-inclusions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 16px;
  }

  .detail-title {
    font-size: 1.6rem;
  }

  .vt-modal__close {
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
