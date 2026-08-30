<script setup>
/**
 * Reusable animated conic-gradient border glow, driven by a registered
 * CSS Houdini custom property (--border-angle) so the rotation is
 * interpolated by the compositor instead of stepped like a plain string
 * custom property would be — smooth 60fps with zero JS per frame.
 *
 * Usage:
 *   <MagicBorderGlow palette="luxury" radius="20px">
 *     <div class="grid-card">...</div>
 *   </MagicBorderGlow>
 */

defineProps({
  // 'cyber' (cyan/purple), 'luxury' (gold/cyan), or 'neon' (all three)
  palette: {
    type: String,
    default: 'cyber',
    validator: (value) => ['cyber', 'luxury', 'neon'].includes(value)
  },
  // Element/component to render as the outer wrapper
  as: {
    type: String,
    default: 'div'
  },
  radius: {
    type: String,
    default: '20px'
  },
  borderWidth: {
    type: String,
    default: '2px'
  },
  // Background painted into the masked center — should match whatever
  // surface the wrapped content expects to sit on
  surface: {
    type: String,
    default: '#0b1220'
  },
  speed: {
    type: String,
    default: '6s'
  },
  hoverSpeed: {
    type: String,
    default: '2.2s'
  }
})
</script>

<template>
  <component
    :is="as"
    class="magic-glow"
    :class="`magic-glow--${palette}`"
    :style="{
      '--glow-radius': radius,
      '--glow-border-width': borderWidth,
      '--glow-surface': surface,
      '--glow-speed': speed,
      '--glow-hover-speed': hoverSpeed
    }"
  >
    <div class="magic-glow__content">
      <slot />
    </div>
  </component>
</template>

<style>
/* Unscoped deliberately: @property is a document-level registration, not a
   selector rule, so it must only be declared once regardless of how many
   MagicBorderGlow instances mount. Registering it as '<angle>' is what
   makes --border-angle interpolate smoothly across the keyframe instead of
   snapping between values the way an untyped custom property would. */
@property --border-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.magic-glow {
  position: relative;
  isolation: isolate;
  border-radius: var(--glow-radius);
  padding: var(--glow-border-width);
}

/* ::before paints the rotating conic-gradient ring behind everything;
   ::after masks its center with a solid surface color, leaving only a
   razor-thin glowing rim showing at the wrapper's padding width. */
.magic-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: conic-gradient(
    from var(--border-angle),
    var(--glow-c1) 0%,
    transparent 22%,
    var(--glow-c2) 50%,
    transparent 72%,
    var(--glow-c1) 100%
  );
  animation: magic-glow-spin var(--glow-speed) linear infinite;
  filter: saturate(1) brightness(1);
  transition: filter 0.3s ease;
  will-change: filter;
}

.magic-glow::after {
  content: '';
  position: absolute;
  inset: var(--glow-border-width);
  z-index: 0;
  border-radius: calc(var(--glow-radius) - var(--glow-border-width));
  background: var(--glow-surface);
}

.magic-glow__content {
  position: relative;
  z-index: 1;
  height: 100%;
}

@keyframes magic-glow-spin {
  to {
    --border-angle: 360deg;
  }
}

.magic-glow:hover::before,
.magic-glow:focus-within::before {
  animation-duration: var(--glow-hover-speed);
  filter: saturate(1.5) brightness(1.3);
}

/* Neon cyberpunk: cyan + electric purple */
.magic-glow--cyber {
  --glow-c1: #2ff5c8;
  --glow-c2: #7c5cff;
}

/* Dark navy luxury: gold + cyan, matching the site's brand accents */
.magic-glow--luxury {
  --glow-c1: #d4af37;
  --glow-c2: #2ff5c8;
}

/* Three-stop mix of all three brand accents */
.magic-glow--neon {
  --glow-c1: #2ff5c8;
  --glow-c2: #7c5cff;
  --glow-c3: #d4af37;
}

.magic-glow--neon::before {
  background: conic-gradient(
    from var(--border-angle),
    var(--glow-c1) 0%,
    transparent 16%,
    var(--glow-c2) 33%,
    transparent 50%,
    var(--glow-c3) 66%,
    transparent 83%,
    var(--glow-c1) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .magic-glow::before {
    animation: none;
  }
}
</style>
