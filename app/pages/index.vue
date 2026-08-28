<template>
  <div>
    <section class="hero-section">
      <div class="hero-card" :style="{ '--hero-image': `url(${heroSlides[heroSlide].image})` }">
        <header class="hero-navbar">
          <NuxtLink to="/" class="hero-navbar__logo">Uni<span>Booking</span></NuxtLink>

          <ClientOnly>
            <nav class="hero-navbar__links">
              <NuxtLink to="/">Home</NuxtLink>
              <a href="#">About Us</a>
              <a href="#">Premium</a>
              <a href="#">Blogs</a>
            </nav>
          </ClientOnly>

          <div class="hero-navbar__actions">
            <ClientOnly>
              <a-dropdown placement="bottomRight">
                <a class="hero-navbar__lang" @click.prevent>
                  <component :is="GlobalOutlined" />
                  <span>{{ heroLang }}</span>
                </a>
                <template #overlay>
                  <a-menu @click="({ key }) => (heroLang = key)">
                    <a-menu-item key="EN">EN</a-menu-item>
                    <a-menu-item key="Lao">Lao</a-menu-item>
                    <a-menu-item key="Thai">Thai</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </ClientOnly>

            <a href="#services" class="hero-navbar__btn">Explore</a>

            <ClientOnly>
              <NuxtLink v-if="!authStore.isAuthenticated" to="/login" class="hero-navbar__btn">
                Login
              </NuxtLink>
              <NuxtLink v-else to="/profile" class="hero-navbar__btn">
                {{ authStore.user?.name }}
              </NuxtLink>
            </ClientOnly>
          </div>
        </header>

        <div class="hero-copy">
          <span class="hero-copy__tag">LANDMARK</span>
          <h1 class="hero-copy__title">{{ heroSlides[heroSlide].title }}</h1>
          <p class="hero-copy__subtitle">{{ heroSlides[heroSlide].subtitle }} · Discover Laos through places worth remembering.</p>
          <a href="#services" class="hero-copy__button">ເລີ່ມຕົ້ນ</a>
          <div class="hero-copy__controls">
            <button type="button" aria-label="Previous destination" class="hero-copy__nav-btn" @click="showPreviousHeroSlide">&lt;</button>
            <button type="button" aria-label="Next destination" class="hero-copy__nav-btn" @click="showNextHeroSlide">&gt;</button>
          </div>
        </div>

        <div class="hero-carousel" aria-label="Popular destinations">
          <div class="hero-carousel__inner">
            <ClientOnly>
              <Swiper
                :modules="[EffectCoverflow]"
                effect="coverflow"
                :centered-slides="true"
                slides-per-view="auto"
                :space-between="14"
                :coverflow-effect="heroCoverflowEffect"
                :slide-to-clicked-slide="true"
                :initial-slide="heroSlide"
                class="hero-carousel__swiper"
                @swiper="setHeroSwiper"
                @slide-change="onHeroSlideChange"
              >
                <SwiperSlide
                  v-for="slide in heroSlides"
                  :key="slide.title"
                  class="hero-carousel__slide"
                  v-slot="{ isActive }"
                >
                  <div class="hero-carousel__slide-inner" :class="{ 'is-active': isActive }">
                    <img :src="slide.image" :alt="slide.title">
                  </div>
                </SwiperSlide>
              </Swiper>

              <!-- Static fallback during SSR / before hydration so the swipeable
                   library (browser-only) doesn't crash the server render. -->
              <template #fallback>
                <div class="hero-carousel__fallback">
                  <div
                    v-for="slide in heroSlides"
                    :key="slide.title"
                    class="hero-carousel__slide-inner"
                    :class="{ 'is-active': heroSlide === slide.index }"
                  >
                    <img :src="slide.image" :alt="slide.title">
                  </div>
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </section>

    <div class="search-form-wrapper">
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

    <!-- Modular Travel Solutions: luxury connected node network -->
    <section class="modular-section">
      <div class="container modular-section__inner">
        <!-- Left: copy -->
        <div class="modular-text">
          <span class="modular-badge">MODULAR TRAVEL SOLUTIONS</span>
          <h2 class="modular-title">ການເດີນທາງທີ່ເຊື່ອມຕໍ່ກັນຢ່າງສົມບູນ</h2>
          <p class="modular-desc">
            ປະຢັດເວລາ ແລະ ເພີ່ມຄວາມສະດວກສະບາຍດ້ວຍແພລດຟອມຂອງພວກເຮົາ.
            ເຊື່ອມຕໍ່ການເດີນທາງຂອງທ່ານຕັ້ງແຕ່ສະໜາມບິນ, ລົດໄຟດ່ວນ, ລົດຮັບສົ່ງ, ໂຮງແຮມ
            ຈົນຮອດສະຖານທີ່ທ່ອງທ່ຽວ ໄວ້ໃນບ່ອນດຽວ.
          </p>
        </div>

        <!-- Right: the realistic traveler circuit, built as a sequential chain
             reaction — a short glowing "data packet" comet travels along one
             segment and vanishes the instant it reaches its node, then the
             next segment's comet fires, and so on all the way from Airport to
             Entertainment and back across to Hotel. Each segment/node pair
             below has its own hardcoded timing (see flowLine--* / nodeGlow--*
             keyframes) rather than a shared delay, so every element can
             independently fire on schedule; the nodes stay lit afterward as a
             persistent "connected" trail while the comets themselves are
             transient. -->
        <div class="orbit-diagram">
          <div class="orbit-diagram__glow" />

          <svg class="orbit-diagram__ring" viewBox="0 0 100 100">
            <!-- Faint permanent track: the same 6 segments, always visible at
                 low opacity, giving the comets below a visible "rail" so the
                 full circuit shape reads even while nothing is flowing. -->
            <line class="circuit-track" :x1="AIRPORT.x" :y1="AIRPORT.y" :x2="TRANSFERS.x" :y2="TRANSFERS.y" />
            <line class="circuit-track" :x1="TRANSFERS.x" :y1="TRANSFERS.y" :x2="HOTEL.x" :y2="HOTEL.y" />
            <line class="circuit-track" :x1="HOTEL.x" :y1="HOTEL.y" :x2="RESTAURANT.x" :y2="RESTAURANT.y" />
            <line class="circuit-track" :x1="RESTAURANT.x" :y1="RESTAURANT.y" :x2="ATTRACTIONS.x" :y2="ATTRACTIONS.y" />
            <line class="circuit-track" :x1="ATTRACTIONS.x" :y1="ATTRACTIONS.y" :x2="ENTERTAINMENT.x" :y2="ENTERTAINMENT.y" />
            <path class="circuit-track" :d="returnPathD" fill="none" />

            <!-- pathLength="1" normalizes every segment (regardless of its
                 real geometric length) to a 0-1 range. stroke-dasharray is a
                 short 0.1-unit dash followed by a 1-unit gap — a single short
                 comet with nothing else in the pattern — and each segment
                 animates stroke-dashoffset from 1 (comet parked just before
                 the segment's start, invisible) to -1 (comet has slid a full
                 unit past the segment's end, also invisible): the only place
                 it's ever actually on-path is mid-animation, sliding across. -->
            <line class="circuit-line circuit-line--1" :x1="AIRPORT.x" :y1="AIRPORT.y" :x2="TRANSFERS.x" :y2="TRANSFERS.y" pathLength="1" />
            <line class="circuit-line circuit-line--2" :x1="TRANSFERS.x" :y1="TRANSFERS.y" :x2="HOTEL.x" :y2="HOTEL.y" pathLength="1" />
            <line class="circuit-line circuit-line--3" :x1="HOTEL.x" :y1="HOTEL.y" :x2="RESTAURANT.x" :y2="RESTAURANT.y" pathLength="1" />
            <line class="circuit-line circuit-line--4" :x1="RESTAURANT.x" :y1="RESTAURANT.y" :x2="ATTRACTIONS.x" :y2="ATTRACTIONS.y" pathLength="1" />
            <line class="circuit-line circuit-line--5" :x1="ATTRACTIONS.x" :y1="ATTRACTIONS.y" :x2="ENTERTAINMENT.x" :y2="ENTERTAINMENT.y" pathLength="1" />
            <!-- Segment 6: the realistic "return to sleep" leg — a gentle bow
                 back across the circle to Hotel instead of a straight chord
                 stabbing through the center glow. -->
            <path class="circuit-line circuit-line--6" :d="returnPathD" fill="none" pathLength="1" />
          </svg>

          <div
            v-for="node in orbitNodes"
            :key="node.label"
            class="orbit-node"
            :class="`orbit-node--${node.id}`"
            :style="{ top: node.top, left: node.left }"
          >
            <component :is="node.icon" class="orbit-node__icon" />
            <span class="orbit-node__label">{{ node.label }}</span>
          </div>
        </div>
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

    <!-- Value proposition: minimalist gold-icon feature strip -->
    <section class="value-section">
      <div class="container value-section__inner">
        <div v-for="item in valueProps" :key="item.title" class="value-card">
          <div class="value-card__icon">
            <component :is="item.icon" />
          </div>
          <h3 class="value-card__title">{{ item.title }}</h3>
          <p class="value-card__desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Best of Laos: curated experience categories -->
    <section class="best-of-section">
      <div class="container">
        <div class="luxury-header">
          <span class="luxury-header__label">CURATED FOR YOU</span>
          <h2 class="luxury-header__title">BEST OF LAOS</h2>
        </div>

        <div class="best-of-grid">
          <NuxtLink
            v-for="item in bestOfLaos"
            :key="item.title"
            to="/tour-detail"
            class="luxury-card"
            :class="{ 'luxury-card--tinted': !item.image }"
          >
            <img v-if="item.image" :src="item.image" :alt="item.title">
            <component :is="item.icon" v-else class="luxury-card__ghost-icon" />
            <div class="luxury-card__overlay">
              <span class="luxury-card__title">{{ item.title }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Top Destinations: editorial photo mosaic -->
    <section class="destinations-section">
      <div class="container">
        <div class="luxury-header">
          <span class="luxury-header__label">EXPLORE THE KINGDOM</span>
          <h2 class="luxury-header__title">TOP DESTINATIONS</h2>
        </div>

        <div class="destinations-grid">
          <div
            v-for="(item, index) in topDestinations"
            :key="item.title"
            class="luxury-card"
            :class="{ 'luxury-card--feature': index === 0 }"
          >
            <img :src="item.image" :alt="item.title">
            <div class="luxury-card__overlay">
              <span class="luxury-card__title">{{ item.title }}</span>
              <span class="luxury-card__subtitle">{{ item.subtitle }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tour Categories: curated category grid with premium image cards -->
    <section class="tour-categories-section">
      <div class="container">
        <div class="tour-categories-header">
          <h2 class="tour-categories-header__title">ປະເພດທົວ</h2>
          <a href="#" class="tour-categories-header__link">
            ເບິ່ງລາຍການທັງໝົດ
            <ArrowRightOutlined class="tour-categories-header__link-icon" />
          </a>
        </div>

        <div class="tour-categories-grid">
          <NuxtLink
            v-for="category in tourCategories"
            :key="category.title"
            to="/tour-detail"
            class="tour-category-card"
          >
            <div class="tour-category-card__bg" :style="{ backgroundImage: `url(${category.image})` }" />
            <div class="tour-category-card__scrim" />
            <span class="tour-category-card__badge">{{ category.title }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Media & social proof -->
    <section class="media-section">
      <div class="container">
        <div class="luxury-header">
          <span class="luxury-header__label">FOLLOW OUR JOURNEY</span>
          <h2 class="luxury-header__title">Our Latest Videos</h2>
        </div>

        <div class="media-layout">
          <!-- Mock Facebook page plugin -->
          <div class="fb-card">
            <div class="fb-card__cover" :style="{ backgroundImage: `url(/images/phathartlaung.jpeg)` }" />
            <div class="fb-card__body">
              <div class="fb-card__avatar">
                <FacebookFilled />
              </div>
              <h3 class="fb-card__name">UniBooking Travel</h3>
              <p class="fb-card__followers">128K ຄົນຕິດຕາມ</p>
              <button type="button" class="fb-card__btn">
                <LikeOutlined /> ຕິດຕາມເຮົາ
              </button>
            </div>
          </div>

          <!-- YouTube-style video thumbnail grid -->
          <div class="video-grid">
            <div
              v-for="video in videos"
              :key="video.title"
              class="video-card"
              @click="openVideo(video)"
            >
              <img :src="video.thumb" :alt="video.title">
              <PlayCircleFilled class="video-card__play" />
              <div class="video-card__meta">
                <span class="video-card__title">{{ video.title }}</span>
                <span class="video-card__duration">{{ video.duration }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Luxury video lightbox: plays the clicked video's YouTube embed full-screen -->
    <Teleport to="body">
      <div v-if="isVideoModalOpen" class="video-modal" @click.self="closeVideo">
        <button type="button" class="video-modal__close" aria-label="Close" @click="closeVideo">
          <CloseOutlined />
        </button>
        <div class="video-modal__player">
          <iframe
            v-if="currentVideo"
            :src="`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0&start=${currentVideo.start}&end=${currentVideo.end}`"
            title="Video player"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, h } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import {
  BankOutlined,
  CarOutlined,
  SendOutlined,
  CompassOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  CreditCardOutlined,
  ThunderboltOutlined,
  GlobalOutlined,
  CustomerServiceOutlined,
  ClusterOutlined,
  FacebookFilled,
  LikeOutlined,
  PlayCircleFilled,
  ArrowRightOutlined,
  CloseOutlined,
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '~/stores/auth'

// Hides the persistent site header on desktop (see site-header--hero-mode in
// app/layouts/default.vue) since the floating hero card below carries its own
// integrated navbar there; the site header still shows on mobile for its drawer.
definePageMeta({ hideSiteHeader: true })

const authStore = useAuthStore()
const heroLang = ref('Lao')

const heroSlide = ref(0)
const heroSlides = [
  { index: 0, title: 'ປະຕູໄຊ', subtitle: 'Vientiane', image: '/images/patuxay.jpeg' },
  { index: 1, title: 'ພະທາດຫຼວງ', subtitle: 'Vientiane', image: '/images/phathartlaung.jpeg' },
  { index: 2, title: 'ນ້ຳຕົກຕາດກວາງຊີ', subtitle: 'Luang Prabang', image: '/images/Tardkaungse.png' },
  { index: 3, title: 'ວັງວຽງ', subtitle: 'Vang Vieng', image: '/images/hero-bg.jpg' },
  { index: 4, title: 'ວັດພູ', subtitle: 'Champasak', image: '/images/Wat-Phu-Laos.jpg' },
  { index: 5, title: 'ຄອນພະເພັງ', subtitle: 'Champasak', image: '/images/khonephapheng.jpg' },
  { index: 6, title: 'ເມືອງງອຍ', subtitle: 'Luang Prabang', image: '/images/Muaengngoy.jpg' }
]

const heroSwiper = ref(null)
const heroCoverflowEffect = { rotate: 0, stretch: 0, depth: 140, modifier: 1.2, slideShadows: false }

function setHeroSwiper(swiper) {
  heroSwiper.value = swiper
}

function onHeroSlideChange(swiper) {
  heroSlide.value = swiper.activeIndex
}

function goToHeroSlide(index) {
  heroSwiper.value?.slideTo(index)
}

function showPreviousHeroSlide() {
  heroSwiper.value?.slidePrev()
}

function showNextHeroSlide() {
  heroSwiper.value?.slideNext()
}

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

// Accurate, real-world icons (Material Symbols glyphs, Apache-2.0) for the nodes
// antd doesn't cover precisely — a real airplane (not SendOutlined's paper plane),
// a bed/building for hotels, crossed fork+knife for restaurants, and a cocktail
// glass for entertainment venues. CarOutlined/CameraOutlined below are close
// enough matches already and stay as antd icons.
function makeGlyphIcon(pathData) {
  return {
    render: () => h('svg', { viewBox: '0 0 24 24', width: '1em', height: '1em', fill: 'currentColor' }, [
      h('path', { d: pathData })
    ])
  }
}

const FlightIcon = makeGlyphIcon('M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z')
const HotelIcon = makeGlyphIcon('M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z')
const RestaurantIcon = makeGlyphIcon('M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z')
const CocktailIcon = makeGlyphIcon('M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7 5.66 5h12.69l-1.78 2H7.43z')

// Realistic circuit layout: 6 nodes placed every 60° around one ring, in the
// order the traveler actually visits them. The gold line traces the outer
// perimeter from Airport all the way to Entertainment, then curves straight
// back across the circle to Hotel — the traveler sleeps where they're
// staying, not back at the Airport.
const CIRCLE_RADIUS = 42 // percent, distance from center to each node's midpoint

function angleToPoint(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: 50 + CIRCLE_RADIUS * Math.cos(rad),
    y: 50 + CIRCLE_RADIUS * Math.sin(rad)
  }
}

// Clock-face visiting order: Airport(12) -> Transfers(2) -> Hotel(4) ->
// Restaurant(6) -> Attractions(8) -> Entertainment(10), 60° apart.
const NODE_ANGLES = [-90, -30, 30, 90, 150, 210]
const [AIRPORT, TRANSFERS, HOTEL, RESTAURANT, ATTRACTIONS, ENTERTAINMENT] = NODE_ANGLES.map(angleToPoint)

// Inner "return to hotel" curve: a gentle bow offset perpendicular to the
// straight Entertainment -> Hotel line, so it reads as a deliberate curved
// shortcut rather than a straight line stabbing through the center glow.
const returnVector = { x: HOTEL.x - ENTERTAINMENT.x, y: HOTEL.y - ENTERTAINMENT.y }
const returnLength = Math.hypot(returnVector.x, returnVector.y)
const returnUnit = { x: returnVector.x / returnLength, y: returnVector.y / returnLength }
const returnPerp = { x: returnUnit.y, y: -returnUnit.x }
const CURVE_BULGE = 14 // percent-units the inner curve bows away from the straight diameter
const returnControl1 = {
  x: ENTERTAINMENT.x + returnVector.x / 3 + returnPerp.x * CURVE_BULGE,
  y: ENTERTAINMENT.y + returnVector.y / 3 + returnPerp.y * CURVE_BULGE
}
const returnControl2 = {
  x: ENTERTAINMENT.x + (returnVector.x * 2) / 3 + returnPerp.x * CURVE_BULGE,
  y: ENTERTAINMENT.y + (returnVector.y * 2) / 3 + returnPerp.y * CURVE_BULGE
}

// Segment 6's shape: Entertainment -> (bow) -> Hotel.
const returnPathD = `M ${ENTERTAINMENT.x},${ENTERTAINMENT.y} `
  + `C ${returnControl1.x},${returnControl1.y} ${returnControl2.x},${returnControl2.y} ${HOTEL.x},${HOTEL.y}`

// The circuit is now 6 independent segments (5 straight chords + the curved
// return above) instead of one continuous path, each with pathLength="1" in
// the template — so every segment's stroke-dasharray/dashoffset animates over
// the same normalized 0-1 range regardless of its real length. That's what
// lets each one get a hardcoded, uniform 0.5s draw time (see .circuit-line--*
// / drawLine--* in the CSS): Line 1 draws, Node 2 lights, Line 2 draws, and so
// on in a fixed chain reaction, rather than timing proportional to distance.
//
// Node identity only — the actual light-up timing is baked directly into each
// node's own nodeGlow--<id> keyframes in CSS (see below), hardcoded to fire
// the instant its incoming segment finishes drawing. It has to live in CSS
// rather than here: each node needs to stay lit from its own arrival moment
// all the way to one shared reset point at the end of the loop, which a
// single shared keyframes + per-node animation-delay can't express — delay
// only shifts a whole timeline, it can't compress a per-node "time remaining
// until the same global reset" into it.
function orbitNode(icon, label, angleDeg, id) {
  const point = angleToPoint(angleDeg)
  return {
    icon,
    label,
    left: `${point.x}%`,
    top: `${point.y}%`,
    id
  }
}

const orbitNodes = [
  orbitNode(FlightIcon, 'ສະໜາມບິນ', NODE_ANGLES[0], 'airport'),
  orbitNode(CarOutlined, 'ລົດຮັບສົ່ງ / ລົດເຊົ່າ', NODE_ANGLES[1], 'transfers'),
  orbitNode(HotelIcon, 'ໂຮງແຮມ / ທີ່ພັກ', NODE_ANGLES[2], 'hotel'),
  orbitNode(RestaurantIcon, 'ຮ້ານອາຫານ', NODE_ANGLES[3], 'restaurant'),
  orbitNode(CameraOutlined, 'ສະຖານທີ່ທ່ອງທ່ຽວ', NODE_ANGLES[4], 'attractions'),
  orbitNode(CocktailIcon, 'ສະຖານທີ່ບັນເທີງ', NODE_ANGLES[5], 'entertainment')
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

const valueProps = [
  {
    icon: CrownOutlined,
    title: 'Best Products & Experiences',
    desc: 'ຄັດສັນສະເພາະປະສົບການ ແລະ ບໍລິການທີ່ດີທີ່ສຸດ'
  },
  {
    icon: CreditCardOutlined,
    title: 'Payment Options',
    desc: 'ຮອງຮັບການຊຳລະຫຼາກຫຼາຍຊ່ອງທາງ ປອດໄພ ແລະ ວ່ອງໄວ'
  },
  {
    icon: ThunderboltOutlined,
    title: 'Seamless Booking',
    desc: 'ຈອງງ່າຍ ພຽງສອງສາມຄລິກ ບໍ່ຫຍຸ້ງຍາກ'
  },
  {
    icon: GlobalOutlined,
    title: 'Covering All of Laos',
    desc: 'ຄອບຄຸມທຸກແຂວງທົ່ວປະເທດລາວ'
  },
  {
    icon: CustomerServiceOutlined,
    title: 'Service-Oriented Support',
    desc: 'ທີມງານພ້ອມໃຫ້ບໍລິການທ່ານຕະຫຼອດ 24 ຊົ່ວໂມງ'
  }
]

// Categories without real photography fall back to a tinted gradient + ghost icon
// (see .luxury-card--tinted) rather than borrowing an unrelated destination photo.
const bestOfLaos = [
  { title: 'River Cruise', image: '/images/Muaengngoy.jpg' },
  { title: 'Train Ticketing', icon: ClusterOutlined },
  { title: 'Car Rentals', icon: CarOutlined }
]

const topDestinations = [
  { title: 'Vang Vieng', subtitle: 'ວັງວຽງ', image: '/images/hero-bg.jpg' },
  { title: 'Luang Prabang', subtitle: 'ຫຼວງພະບາງ', image: '/images/Tardkaungse.png' },
  { title: 'Vientiane', subtitle: 'ວຽງຈັນ', image: '/images/patuxay.jpeg' },
  { title: 'Champasak', subtitle: 'ຈຳປາສັກ', image: '/images/Wat-Phu-Laos.jpg' },
  { title: 'Pakse', subtitle: 'ປາກເຊ', image: '/images/khonephapheng.jpg' }
]

const tourCategories = [
  { title: 'ADVENTURES & SPORTS', image: '/images/khonephapheng.jpg' },
  { title: 'PILGRIMAGE TOURS', image: '/images/Wat-Phu-Laos.jpg' },
  { title: 'CYCLING TOURS', image: '/images/Muaengngoy.jpg' }
]

// Real, verified 4K travel/nature footage (checked against YouTube's oembed
// endpoint before adding — the previous IDs here were meme/placeholder videos).
// start/end trim each embed down to a 15s highlight instead of playing in full.
const videos = reactive([
  { thumb: '/images/Tardkaungse.png', title: 'ທ່ຽວນ້ຳຕົກຕາດກວາງຊີ', duration: '0:15', youtubeId: '1sjB1KgMM5U', start: 30, end: 45 },
  { thumb: '/images/khonephapheng.jpg', title: 'ພະລັງນ້ຳຕົກຄອນພະເພັງ', duration: '0:15', youtubeId: 'Zy-HzW1QF_4', start: 40, end: 55 },
  { thumb: '/images/Wat-Phu-Laos.jpg', title: 'ວັດພູ ມໍລະດົກໂລກ', duration: '0:15', youtubeId: 'S_yyfJbKj9Y', start: 25, end: 40 },
  // 7Xv-a9z0M_s (originally requested) 404s on YouTube's oembed endpoint —
  // substituted with Oxvp6i49GFo, verified live and titled "Plain Of Jars
  // (Laos) Vacation Travel Video Guide".
  { thumb: '/images/thonghaiheen.jpg', title: 'ຄວາມລຶກລັບທົ່ງໄຫຫິນ', duration: '0:15', youtubeId: 'Oxvp6i49GFo', start: 15, end: 30 }
])

const isVideoModalOpen = ref(false)
const currentVideo = ref(null)

function openVideo(video) {
  currentVideo.value = video
  isVideoModalOpen.value = true
}

function closeVideo() {
  isVideoModalOpen.value = false
  currentVideo.value = null
}
</script>

<style scoped>
/* Shared centered container: sections own full-width backgrounds, this caps the content at 1200px */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}

/* ============================================================
   Hero: single floating card — full-bleed background image with a
   dark gradient overlay (left, for the copy block; bottom, for the
   carousel strip). Navbar, copy block, and carousel are each
   absolutely positioned within it.
   ============================================================ */
.hero-section {
  width: 100%;
  padding: 0;
  background: transparent;
}

.hero-card {
  max-width: 1440px;
  width: 95%;
  height: 85vh;
  min-height: 640px;
  border-radius: 36px;
  margin: 40px auto;
  position: relative;
  overflow: hidden;
  /* Left-side scrim keeps the copy block legible; bottom-side scrim keeps
     the carousel thumbnails legible — both over the same full-bleed photo. */
  background:
    linear-gradient(100deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 38%, rgba(0, 0, 0, 0.15) 62%, rgba(0, 0, 0, 0) 78%),
    linear-gradient(to top, rgba(0, 0, 0, 0.88) 0%, rgba(0, 0, 0, 0.42) 26%, rgba(0, 0, 0, 0) 52%),
    var(--hero-image) center / cover no-repeat;
  box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6);
}

/* Left copy block — strictly left-aligned, pinned to the upper area of the
   card so it never reaches down into the carousel strip at the bottom. */
.hero-copy {
  position: absolute;
  top: 130px;
  left: 6%;
  z-index: 4;
  width: min(440px, 40%);
  color: #fff;
  text-align: left;
}

.hero-copy__tag {
  display: block;
  color: #d8bc7b;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.hero-copy__title {
  margin: 14px 0 12px;
  color: #fff;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  line-height: 1.05;
}

.hero-copy__subtitle {
  max-width: 390px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 16px;
  line-height: 1.6;
}

.hero-copy__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 132px;
  margin-top: 26px;
  padding: 13px 28px;
  border-radius: 100px;
  background: #c5a059;
  color: #0a0a0a;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.25s ease, transform 0.25s ease;
}

.hero-copy__button:hover {
  background: #d8bc7b;
  color: #0a0a0a;
  transform: translateY(-2px);
}

.hero-copy__controls {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}

.hero-copy__nav-btn {
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease;
}

.hero-copy__nav-btn:hover {
  background: #c5a059;
  border-color: #c5a059;
}

/* Bottom carousel overlay — a swipeable (Swiper) coverflow strip, centered
   in the same 1200px column as the search box below the hero card so the
   two line up on desktop. */
.hero-carousel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  padding: 0 0 28px;
}

.hero-carousel__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.hero-carousel__swiper {
  width: 100%;
  padding: 10px 0 6px;
  overflow: visible;
}

.hero-carousel__fallback {
  display: flex;
  justify-content: center;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 10px 0 6px;
}

.hero-carousel__fallback::-webkit-scrollbar {
  display: none;
}

.hero-carousel__slide {
  position: relative;
  width: clamp(120px, 14vw, 168px);
  height: clamp(150px, 20vh, 190px);
}

.hero-carousel__slide-inner {
  position: relative;
  width: clamp(120px, 14vw, 168px);
  height: clamp(150px, 20vh, 190px);
  flex: 0 0 auto;
  border-radius: 18px;
  overflow: hidden;
  background: #111826;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  opacity: 0.72;
  transition: opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
}

.hero-carousel__slide-inner:hover,
.hero-carousel__slide-inner.is-active {
  opacity: 1;
  transform: translateY(-6px);
}

.hero-carousel__slide-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-carousel__slide-inner::after {
  content: '';
  position: absolute;
  inset: 55% 0 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
}

.hero-carousel__slide-inner.is-active::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border: 2px solid #c5a059;
  border-radius: 18px;
}

/* Original white search card, pulled up to overlap the hero's bottom edge. */
.search-form-wrapper {
  position: relative;
  z-index: 50;
  width: 100%;
  max-width: 1200px;
  margin: -60px auto 0;
}

.search-form-wrapper :deep(.search-form.ant-card) {
  background: #14294f;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 0 40px rgba(255, 255, 255, 0.12);
}

/* Transparent navbar: floats over the top of the card. Hidden below 768px —
   the persistent site header (with the hamburger drawer) is what mobile
   visitors use instead (see site-header--hero-mode). */
.hero-navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 30px 50px;
  z-index: 10;
}

.hero-navbar__logo {
  flex: 0 0 auto;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ffffff;
  text-decoration: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.hero-navbar__logo span {
  color: #c5a059;
}

.hero-navbar__links {
  display: flex;
  align-items: center;
  gap: 36px;
}

.hero-navbar__links a {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: color 0.25s ease;
}

.hero-navbar__links a:hover {
  color: #c5a059;
}

.hero-navbar__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-navbar__lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.hero-navbar__lang:hover {
  color: #ffffff;
}

.hero-navbar__btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

.hero-navbar__btn:hover {
  background: #c5a059;
  border-color: #c5a059;
  color: #0a0a0a;
}

@media (max-width: 767px) {
  .hero-navbar {
    display: none;
  }
}

@media (max-width: 1200px) {
  .hero-copy {
    width: min(380px, 46%);
  }

  .hero-copy__title {
    font-size: 2.5rem;
  }
}

@media (max-width: 900px) {
  .hero-card {
    height: auto;
    min-height: 0;
    background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), var(--hero-image) center / cover no-repeat;
    padding-top: 100px;
    padding-bottom: 24px;
  }

  .hero-copy {
    position: relative;
    top: 0;
    left: 0;
    width: auto;
    max-width: none;
    padding: 0 24px;
    margin-bottom: 32px;
  }

  .hero-carousel {
    position: relative;
    padding: 0 0 24px;
  }
}

/* Services grid */
.services-section {
  width: 100%;
  background: transparent;
  padding: 80px 0;
}

.services-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 48px;
}

/* "Blue Light" accent block — electric cyan on black. Kept local to this
   section (see SearchForm.vue for the matching search-bar treatment)
   rather than swapping the sitewide gold accent used elsewhere. */
.services-header__badge {
  color: #22d3ee;
  background: rgba(34, 211, 238, 0.12);
  border: none;
  border-radius: 16px;
  padding: 4px 12px;
  margin-bottom: 16px;
}

.services-header__title {
  font-size: 2rem;
  font-weight: 800;
  color: #22d3ee;
  margin-bottom: 12px;
}

.services-header__subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(34, 211, 238, 0.65);
}

/* Dark blue block fill with a soft pale-white glowing edge */
.service-card {
  height: 100%;
  background: #14294f;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 32px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 22px rgba(255, 255, 255, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.service-card:hover {
  transform: translateY(-5px);
  background: #1a3566;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6), 0 0 32px rgba(255, 255, 255, 0.22);
}

/* Unselected (default) icon state — dimmer cyan */
.service-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(34, 211, 238, 0.1);
  color: rgba(34, 211, 238, 0.75);
  font-size: 24px;
  margin-bottom: 20px;
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}

/* Active icon state — full-brightness cyan with glow, on card hover */
.service-card:hover .service-card__icon {
  background: rgba(34, 211, 238, 0.18);
  color: #22d3ee;
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.35);
}

.service-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #22d3ee;
  margin-bottom: 8px;
}

.service-card__desc {
  font-size: 14px;
  line-height: 1.8;
  color: rgba(34, 211, 238, 0.65);
  margin-bottom: 0;
}

/* ============================================================
   Modular Travel Solutions: luxury connected node network.
   Pure CSS — no JS-driven activation state; the SVG lines and
   nodes are always "on," with a subtle animated dash flow and
   a gentle per-node float for a living, premium feel.
   ============================================================ */
.modular-section {
  position: relative;
  width: 100%;
  padding: 100px 0;
  overflow: hidden;
  background: transparent;
}

/* Blurred nature photo backdrop. Scaled up slightly so the blur filter never
   reveals a sharp edge, and kept a separate layer from the dark scrim below
   so the blur/darken can be tuned independently. */
.modular-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/images/Muaengfuaeng.webp') center / cover no-repeat;
  filter: blur(6px);
  transform: scale(1.1);
  z-index: 0;
}

/* Dark green scrim over the photo — this is what makes white text/gold accents
   readable regardless of how busy the underlying image is. */
.modular-section::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 26, 51, 0.82), rgba(6, 14, 30, 0.75));
  z-index: 0;
}

.modular-section__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
}

.modular-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #ffffff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 999px;
  padding: 6px 18px;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  margin-bottom: 20px;
}

.modular-title {
  font-size: 2.25rem;
  font-weight: 800;
  line-height: 1.3;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  margin-bottom: 20px;
}

.modular-desc {
  font-size: 15px;
  line-height: 1.9;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  max-width: 480px;
  margin-bottom: 0;
}

.orbit-diagram {
  position: relative;
  width: 100%;
  max-width: 400px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

/* Soft glow centered behind the ring */
.orbit-diagram__glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(197, 160, 89, 0.25) 0%, rgba(0, 0, 0, 0.1) 45%, transparent 75%);
  filter: blur(40px);
  z-index: 0;
  pointer-events: none;
}

.orbit-diagram__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Faint permanent track (see template): the full 6-segment circuit shape,
   always visible at low opacity, sitting behind the traveling comets below. */
.circuit-track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1.5;
  stroke-linecap: round;
}

/* True "data flow" comets, not solid drawn lines: 6 independent segments (see
   the template — 5 straight chords + the curved return), each normalized to
   pathLength="1" so the same stroke-dasharray reads as "a short 0.1-unit dash
   then a 1-unit gap" regardless of the segment's real geometric length —
   effectively a single short glowing packet with nothing else in the
   repeating pattern. Each segment gets its own hardcoded travel window inside
   a shared 6s loop (0.5s per segment: 0-0.5s, 0.5-1s, 1-1.5s, ... 2.5-3s) via
   its own flowLine--N keyframes below, animating stroke-dashoffset from 1
   (packet parked just before the segment, invisible) to -1 (packet has slid a
   full unit past the segment's end, also invisible) — Line 1's packet departs
   and arrives, Node 2 lights (see nodeGlow--* further down), Line 2's packet
   departs, and so on in a fixed chain reaction. The comet itself is always
   transient; the nodes are what stay lit afterward as the "connected" trail. */
.circuit-line {
  fill: none;
  stroke: #c5a059;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 0.1 1;
  filter: drop-shadow(0 0 3px rgba(197, 160, 89, 0.95)) drop-shadow(0 0 9px rgba(197, 160, 89, 0.6));
  animation-duration: 6s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.circuit-line--1 {
  animation-name: flowLine--1;
}

.circuit-line--2 {
  animation-name: flowLine--2;
}

.circuit-line--3 {
  animation-name: flowLine--3;
}

.circuit-line--4 {
  animation-name: flowLine--4;
}

.circuit-line--5 {
  animation-name: flowLine--5;
}

.circuit-line--6 {
  animation-name: flowLine--6;
}

/* Line 1: Airport -> Transfers, packet travels 0s -> 0.5s. Each keyframe's
   outgoing segment is pinned to `linear` (constant speed while traveling —
   an eased packet would blur exactly when it "arrives", which is what the
   synchronized node glow depends on); once past -1 it stays fully off-path
   (invisible) for the rest of the loop, so nothing lingers as a solid line. */
@keyframes flowLine--1 {
  0% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  8.333%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Line 2: Transfers -> Hotel, packet travels 0.5s -> 1.0s (right after Line 1's packet arrives). */
@keyframes flowLine--2 {
  0%,
  8.333% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  16.667%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Line 3: Hotel -> Restaurant, packet travels 1.0s -> 1.5s. */
@keyframes flowLine--3 {
  0%,
  16.667% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  25%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Line 4: Restaurant -> Attractions, packet travels 1.5s -> 2.0s. */
@keyframes flowLine--4 {
  0%,
  25% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  33.333%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Line 5: Attractions -> Entertainment, packet travels 2.0s -> 2.5s. */
@keyframes flowLine--5 {
  0%,
  33.333% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  41.667%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Line 6: Entertainment -> Hotel (the return curve), packet travels 2.5s ->
   3.0s — the chain reaction's final leg, arriving back at Hotel to close the
   loop. Nodes then hold their lit state solo (see nodeGlow--* below, still
   unchanged) until 83.333%, fading together with the rest of the loop. */
@keyframes flowLine--6 {
  0%,
  41.667% {
    stroke-dashoffset: 1;
    animation-timing-function: linear;
  }
  50%,
  100% {
    stroke-dashoffset: -1;
  }
}

/* Nodes: glassmorphism cards, gold icon on dark green text, spaced evenly every
   60° around the ring (see orbitNode() in the script). Each one starts dim and
   snaps to a bright "connected" glow the instant the incoming line above
   finishes drawing to it, via its own nodeGlow--<id> keyframes — then stays
   lit through the hold and fades back to dim together with the lines. */
.orbit-node {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 128px;
  padding: 16px 10px;
  background: linear-gradient(135deg, rgba(20, 41, 79, 0.65), rgba(10, 20, 40, 0.55));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  text-align: center;
  transform: translate(-50%, -50%);
  transition: all 0.4s ease;
  animation-duration: 6s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

/* Pause the connect/glow cycle on hover so the lift/glow below reads cleanly */
.orbit-node:hover {
  animation-play-state: paused;
  transform: translate(-50%, -50%) translateY(-5px) scale(1.03);
  border-color: rgba(197, 160, 89, 0.55) !important;
  box-shadow: 0 20px 45px rgba(197, 160, 89, 0.2), 0 8px 28px rgba(56, 189, 248, 0.2) !important;
}

.orbit-node--airport {
  animation-name: nodeGlow--airport;
}

.orbit-node--transfers {
  animation-name: nodeGlow--transfers;
}

.orbit-node--hotel {
  animation-name: nodeGlow--hotel;
}

.orbit-node--restaurant {
  animation-name: nodeGlow--restaurant;
}

.orbit-node--attractions {
  animation-name: nodeGlow--attractions;
}

.orbit-node--entertainment {
  animation-name: nodeGlow--entertainment;
}

/* Airport is lit from 0% — it's the start of the chain, already glowing as
   Line 1 begins drawing away from it. */
@keyframes nodeGlow--airport {
  0%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Transfers lights up the instant Line 1 finishes (0.5s). */
@keyframes nodeGlow--transfers {
  0%,
  8.033% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
  8.333%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Hotel lights up the instant Line 2 finishes (1.0s) — it's visited again at
   the very end of the circuit (Line 6), but by then it's already lit and
   simply stays that way, so no second pulse is needed here. */
@keyframes nodeGlow--hotel {
  0%,
  16.367% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
  16.667%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Restaurant lights up the instant Line 3 finishes (1.5s). */
@keyframes nodeGlow--restaurant {
  0%,
  24.7% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
  25%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Attractions lights up the instant Line 4 finishes (2.0s). */
@keyframes nodeGlow--attractions {
  0%,
  33.033% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
  33.333%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Entertainment lights up the instant Line 5 finishes (2.5s). */
@keyframes nodeGlow--entertainment {
  0%,
  41.367% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
  41.667%,
  83.333% {
    border: 1px solid #c5a059;
    box-shadow: 0 0 0 6px rgba(197, 160, 89, 0.25), 0 20px 45px rgba(197, 160, 89, 0.45);
    transform: translate(-50%, -50%) scale(1.06);
  }
  100% {
    border: 1px solid rgba(255, 255, 255, 0.35);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    transform: translate(-50%, -50%) scale(1);
  }
}

.orbit-node__icon {
  font-size: 24px;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.orbit-node__label {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

/* Services grid: premium fintech-style app grid */
.services-grid-section {
  position: relative;
  overflow: hidden;
  width: 100%;
  background: transparent;
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
  background: rgba(197, 160, 89, 0.14);
}

.services-grid-section__shape--two {
  bottom: -80px;
  left: 6%;
  width: 220px;
  height: 220px;
  background: rgba(255, 255, 255, 0.06);
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
  color: #c5a059;
  background: rgba(197, 160, 89, 0.12);
  border-radius: 999px;
  padding: 6px 16px;
  margin-bottom: 16px;
}

.services-grid-header__title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
}

.services-grid-header__subtitle {
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.65);
}

/* Dark blue block fill with a soft pale-white glowing edge */
.grid-card {
  height: 100%;
  background: #14294f;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4), 0 0 22px rgba(255, 255, 255, 0.12);
  text-align: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.grid-card:hover {
  transform: translateY(-5px);
  background: #1a3566;
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(255, 255, 255, 0.22);
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
  color: #ffffff;
  margin-top: 16px;
  margin-bottom: 6px;
}

.grid-card__desc {
  font-size: 13px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0;
}

/* Mobile: shrink hero card radius and sections to fit smaller viewports */
@media (max-width: 767px) {
  .container {
    padding: 0 16px;
  }

  .hero-card {
    width: 92%;
    border-radius: 24px;
    margin: 24px auto;
  }

  .hero-copy__title {
    font-size: 2rem;
  }

  .services-section {
    padding: 64px 0;
  }

  .modular-section {
    padding: 64px 0;
    text-align: center;
  }

  .modular-section__inner {
    grid-template-columns: 1fr;
  }

  .modular-desc {
    max-width: none;
    margin-left: auto;
    margin-right: auto;
  }

  .orbit-diagram {
    max-width: 300px;
  }

  .orbit-node {
    width: 84px;
    padding: 10px 6px;
    gap: 6px;
  }

  .orbit-node__icon {
    font-size: 18px;
  }

  .orbit-node__label {
    font-size: 10px;
  }

  .services-grid-section {
    padding: 64px 0;
  }
}

/* ============================================================
   Luxury OTA sections: value proposition, Best of Laos,
   Top Destinations, Media & Social. Brand palette:
   teal-glow gradient (see app.vue's fixed body background) / #111826, gold #c5a059, white text.
   ============================================================ */
.value-section {
  width: 100%;
  background: transparent;
  padding: 72px 0;
}

.value-section__inner {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 32px;
}

.value-card {
  text-align: center;
}

.value-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border: 1px solid rgba(197, 160, 89, 0.35);
  border-radius: 50%;
  color: #c5a059;
  font-size: 26px;
  transition: background 0.3s ease, color 0.3s ease;
}

.value-card:hover .value-card__icon {
  background: #c5a059;
  color: #0a0a0a;
}

.value-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.value-card__desc {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0;
}

/* Shared section heading for the luxury sections below */
.luxury-header {
  text-align: center;
  max-width: 640px;
  margin: 0 auto 40px;
}

.luxury-header__label {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 3px;
  color: #c5a059;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.luxury-header__title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ffffff;
  margin-bottom: 0;
}

/* Shared luxury card: used by Best of Laos + Top Destinations grids.
   Best of Laos cards are <NuxtLink>s (anchors), so display:block/color/
   text-decoration are reset here to keep the box + hover behavior identical
   to a plain div. */
/* Soft gold glow border — keeps photo tiles crisply separated from the
   dark background so the image itself reads clearly. */
.luxury-card {
  position: relative;
  display: block;
  border-radius: 20px;
  overflow: hidden;
  height: 100%;
  min-height: 240px;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(197, 160, 89, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 18px rgba(197, 160, 89, 0.25);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.luxury-card:hover {
  transform: translateY(-5px);
  border-color: rgba(197, 160, 89, 0.85);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.7), 0 0 28px rgba(197, 160, 89, 0.4);
}

.luxury-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.luxury-card__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  text-align: center;
  padding: 24px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.92), transparent 65%);
}

.luxury-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
}

.luxury-card__subtitle {
  font-size: 12px;
  letter-spacing: 1px;
  color: #d9c9a3;
  margin-top: 4px;
}

/* No-photo category variant: gradient fill + ghost icon instead of an image */
.luxury-card--tinted {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #111826, #1e2a3a);
}

.luxury-card__ghost-icon {
  font-size: 64px;
  color: rgba(197, 160, 89, 0.4);
}

/* Best of Laos: 3-up category strip */
.best-of-section {
  width: 100%;
  background: transparent;
  padding: 80px 0;
}

.best-of-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Top Destinations: editorial mosaic — first card doubled in both directions */
.destinations-section {
  width: 100%;
  background: transparent;
  padding: 80px 0;
}

.destinations-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  gap: 20px;
}

.luxury-card--feature {
  grid-column: span 2;
  grid-row: span 2;
}

.luxury-card--feature .luxury-card__title {
  font-size: 26px;
}

/* Tour Categories: curated category grid with premium image cards */
.tour-categories-section {
  width: 100%;
  background: transparent;
  padding: 80px 0;
}

.tour-categories-header {
  text-align: center;
  margin: 0 auto 40px;
}

.tour-categories-header__title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ffffff;
  margin-bottom: 12px;
}

.tour-categories-header__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #c5a059;
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(197, 160, 89, 0.5);
  transition: color 0.3s ease, border-color 0.3s ease;
}

.tour-categories-header__link:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.7);
}

.tour-categories-header__link-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.tour-categories-header__link:hover .tour-categories-header__link-icon {
  transform: translateX(4px);
}

.tour-categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Cards are <NuxtLink>s (anchors); reset the browser's default inline/underlined/blue-link
   styling so they still behave as plain block grid items. */
.tour-category-card {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: 20px;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(197, 160, 89, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 18px rgba(197, 160, 89, 0.25);
  cursor: pointer;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.tour-category-card:hover {
  border-color: rgba(197, 160, 89, 0.85);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 28px rgba(197, 160, 89, 0.4);
}

/* Separate layer from the badge so the image scale-up never moves the text */
.tour-category-card__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s ease;
}

.tour-category-card:hover .tour-category-card__bg {
  transform: scale(1.05);
}

.tour-category-card__scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.08) 45%, transparent 70%);
  pointer-events: none;
}

.tour-category-card__badge {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  display: inline-block;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(197, 160, 89, 0.5);
  border-radius: 8px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

/* Media & social */
.media-section {
  width: 100%;
  background: transparent;
  padding: 80px 0;
}

.media-layout {
  display: grid;
  grid-template-columns: 25% 1fr;
  gap: 24px;
  align-items: stretch;
}

/* Mock Facebook page plugin card */
/* Dark blue block fill with a soft pale-white glowing edge */
.fb-card {
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: #14294f;
  border: 1px solid rgba(197, 160, 89, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 18px rgba(197, 160, 89, 0.25);
}

.fb-card__cover {
  height: 120px;
  background-size: cover;
  background-position: center;
}

.fb-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px 24px;
  text-align: center;
}

.fb-card__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-top: -32px;
  margin-bottom: 12px;
  border: 3px solid rgba(255, 255, 255, 0.85);
  border-radius: 50%;
  background: #1a2331;
  color: #ffffff;
  font-size: 28px;
}

.fb-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.fb-card__followers {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.fb-card__btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  background: #c5a059;
  color: #0a0a0a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.fb-card__btn:hover {
  background: #d8bc7b;
  color: #0a0a0a;
}

/* YouTube-style thumbnail grid */
.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.video-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  cursor: pointer;
  border: 1px solid rgba(197, 160, 89, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 18px rgba(197, 160, 89, 0.25);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.video-card:hover {
  border-color: rgba(197, 160, 89, 0.85);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.6), 0 0 28px rgba(197, 160, 89, 0.4);
}

.video-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-card__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  font-size: 48px;
  color: #c5a059;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s ease;
}

.video-card:hover .video-card__play {
  transform: translate(-50%, -50%) scale(1.1);
}

.video-card__meta {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.92), transparent);
  color: #ffffff;
  font-size: 12px;
}

.video-card__duration {
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 4px;
}

/* ============================================================
   Video lightbox: full-screen player launched from a video card
   ============================================================ */
.video-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 24px;
}

.video-modal__player {
  position: relative;
  width: min(1100px, 90vw);
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.video-modal__player iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.video-modal__close {
  position: absolute;
  top: 28px;
  right: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
}

.video-modal__close:hover {
  background: #c5a059;
  color: #0a0a0a;
  transform: rotate(90deg);
}

/* Tablet: trim the 5/4-column grids down before they get cramped */
@media (max-width: 1024px) and (min-width: 768px) {
  .value-section__inner {
    grid-template-columns: repeat(3, 1fr);
  }

  .destinations-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .luxury-card--feature {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (max-width: 767px) {
  .value-section {
    padding: 56px 0;
  }

  .value-section__inner {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .best-of-section,
  .destinations-section,
  .media-section,
  .tour-categories-section {
    padding: 56px 0;
  }

  .best-of-grid {
    grid-template-columns: 1fr;
  }

  .destinations-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 220px;
  }

  .luxury-card--feature {
    grid-column: span 1;
    grid-row: span 1;
  }

  .tour-categories-header__title {
    font-size: 1.75rem;
  }

  .tour-categories-grid {
    grid-template-columns: 1fr;
  }

  .media-layout {
    grid-template-columns: 1fr;
  }

  .video-grid {
    grid-template-columns: 1fr;
  }

  .video-modal__close {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
}
</style>
