<template>
  <div class="hero-slider" aria-hidden="true">
    <div
      v-for="n in sliceCount"
      :key="n"
      class="hero-slider__slice"
      :style="sliceStyle(n - 1)"
    >
      <div
        class="hero-slider__flipper"
        :class="{ 'is-flipped': flipped, 'no-transition': skipTransition }"
        :style="flipperStyle(n - 1)"
      >
        <div class="hero-slider__face hero-slider__face--front">
          <img v-if="frontImage" :src="frontImage" alt="" class="hero-slider__face-img" :style="faceImgStyle(n - 1)">
        </div>
        <div class="hero-slider__face hero-slider__face--back">
          <img v-if="backImage" :src="backImage" alt="" class="hero-slider__face-img" :style="faceImgStyle(n - 1)">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 3D "venetian blinds" background transition: the card is split into
// `sliceCount` vertical strips, each showing a proportional slice of the
// SAME full-bleed photo via background-size/background-position math (no
// image cropping needed) rather than a plain crossfade or Swiper slide.
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  slides: { type: Array, required: true }, // each needs at least { image }
  activeIndex: { type: Number, required: true },
  sliceCount: { type: Number, default: 10 },
  flipDuration: { type: Number, default: 700 }, // ms, per-slice rotateY duration
  staggerDelay: { type: Number, default: 35 } // ms, added per slice index
})

const displayedIndex = ref(props.activeIndex) // shown on each slice's front face
const incomingIndex = ref(props.activeIndex) // shown on each slice's back face during a flip
const flipped = ref(false)
const skipTransition = ref(false)
let isAnimating = false
let settleTimer = null

const frontImage = computed(() => props.slides[displayedIndex.value]?.image)
const backImage = computed(() => props.slides[incomingIndex.value]?.image)
const sliceWidthPct = computed(() => 100 / props.sliceCount)

// Slice boxes are widened by this much and shifted left to compensate, so
// neighbors overlap by ~1px on each shared edge. Without it, subpixel
// rounding of each slice's percentage left/width leaves a hairline gap
// that shows the dark card background through as a thin vertical line --
// worse still during the flip, where a slice foreshortens toward zero
// width as it passes 90degrees and needs its neighbor's overlap to keep
// covering that seam. Bumped from a 1px total overlap because at typical
// hero widths (1200-1440px) rounding error alone could still exceed 1px.
const SLICE_OVERLAP_PX = 2

function sliceStyle(i) {
  return {
    left: `calc(${i * sliceWidthPct.value}% - ${SLICE_OVERLAP_PX / 2}px)`,
    width: `calc(${sliceWidthPct.value}% + ${SLICE_OVERLAP_PX}px)`
  }
}

// Each slice gets its OWN full-width <img> of the same photo (not a shared
// background sliced by percentage math) so the browser's native
// object-fit: cover does the aspect-ratio-correct scaling per image,
// using its real naturalWidth/naturalHeight -- no manual cover math, and
// no JS image-preload race to find those dimensions first. The img is
// sized to the full container width (`stops` slice-widths) and shifted
// left by `i` slice-widths, so only its own 1/stops slice shows through
// the slice wrapper's overflow:hidden -- together, all `stops` images
// reconstruct one seamless, undistorted photo.
function faceImgStyle(i) {
  const stops = props.sliceCount
  return {
    width: `${stops * 100}%`,
    left: `${-i * 100}%`
  }
}

function flipperStyle(i) {
  return {
    transitionDuration: `${props.flipDuration}ms`,
    transitionDelay: `${i * props.staggerDelay}ms`
  }
}

function runFlip(targetIndex) {
  isAnimating = true
  incomingIndex.value = targetIndex

  // Two rAFs: the first lets the (still unflipped) back-face image commit
  // and paint, the second starts the actual transition -- otherwise a
  // flip triggered right after a snap-back can get coalesced with it and
  // skip the animation entirely.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      flipped.value = true
    })
  })

  const totalMs = (props.sliceCount - 1) * props.staggerDelay + props.flipDuration
  clearTimeout(settleTimer)
  settleTimer = setTimeout(() => {
    skipTransition.value = true
    displayedIndex.value = targetIndex
    flipped.value = false
    requestAnimationFrame(() => {
      skipTransition.value = false
      isAnimating = false
      // The active slide moved on again while this flip was still
      // settling (e.g. rapid thumbnail clicks) -- chase the latest
      // target now rather than waiting for a prop change that already
      // happened and won't re-fire the watcher.
      if (props.activeIndex !== displayedIndex.value) {
        runFlip(props.activeIndex)
      }
    })
  }, totalMs)
}

watch(() => props.activeIndex, (next) => {
  if (isAnimating || next === displayedIndex.value) return
  runFlip(next)
})

onBeforeUnmount(() => clearTimeout(settleTimer))
</script>

<style scoped>
.hero-slider {
  position: absolute;
  inset: 0;
  overflow: hidden;
  perspective: 1600px;
}

.hero-slider__slice {
  position: absolute;
  top: 0;
  height: 100%;
  overflow: hidden;
}

.hero-slider__flipper {
  position: relative;
  width: 100%;
  height: 100%;
  transform: rotateY(0deg);
  transform-style: preserve-3d;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  will-change: transform;
}

.hero-slider__flipper.is-flipped {
  transform: rotateY(180deg);
}

.hero-slider__flipper.no-transition {
  transition: none !important;
}

.hero-slider__face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.hero-slider__face--back {
  transform: rotateY(180deg);
}

.hero-slider__face-img {
  position: absolute;
  top: 0;
  height: 100%;
  /* width/left are set inline per slice (faceImgStyle) -- object-fit
     does the real work: it scales this image, using its own true aspect
     ratio, to cover the (stops x wider) box below without distortion. */
  object-fit: cover;
  object-position: center;
  display: block;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .hero-slider__flipper {
    transition: none !important;
  }
}
</style>
