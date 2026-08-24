<template>
  <div class="container">
    <h1 class="page-title">ເລືອກຖ້ຽວລົດສຳລັບການເດີນທາງຂອງທ່ານ</h1>

    <a-row :gutter="[24, 24]">
      <a-col v-for="route in routes" :key="route.id" :xs="24" :md="12" :lg="8">
        <a-card hoverable class="route-card">
          <template #cover>
            <img :src="route.image" :alt="route.name" class="route-card__image" />
          </template>

          <h3 class="route-card__name">{{ route.name }}</h3>
          <a-tag color="blue" class="route-card__type">{{ route.type }}</a-tag>
          <p class="route-card__departure">ເວລາອອກ: {{ route.departureTime }}</p>
          <p class="route-card__price">{{ formatPrice(route.price) }} / ບ່ອນນັ່ງ</p>

          <a-button type="primary" block @click="handleBookNow(route)">
            ຈອງປີ້ລົດ
          </a-button>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
// Nuxt/Pinia auto-imports: reactive, useBookingStore, useRouter
const bookingStore = useBookingStore()
const router = useRouter()

const routes = reactive([
  {
    id: 1,
    name: 'Vientiane - Luang Prabang (VIP Van)',
    departureTime: '08:00',
    price: 250000,
    type: 'Van',
    image: 'https://placehold.co/600x400/f8fafc/0369a1?text=Transport'
  },
  {
    id: 2,
    name: 'Vientiane - Pakse (VIP Bus)',
    departureTime: '20:00',
    price: 180000,
    type: 'Bus',
    image: 'https://placehold.co/600x400/f8fafc/0369a1?text=Transport'
  },
  {
    id: 3,
    name: 'Vientiane - Vang Vieng (Minivan)',
    departureTime: '09:30',
    price: 60000,
    type: 'Van',
    image: 'https://placehold.co/600x400/f8fafc/0369a1?text=Transport'
  },
  {
    id: 4,
    name: 'Thanaleng - Boten (Lao-China Railway)',
    departureTime: '13:45',
    price: 320000,
    type: 'Train',
    image: 'https://placehold.co/600x400/f8fafc/0369a1?text=Transport'
  }
])

function formatPrice(value) {
  return `₭ ${new Intl.NumberFormat('lo-LA').format(value)}`
}

function handleBookNow(route) {
  bookingStore.selectedService = route
  router.push('/checkout')
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  color: #0c4a6e;
  margin-bottom: 24px;
}

.route-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.route-card__name {
  margin-bottom: 8px;
  color: #0c4a6e;
}

.route-card__type {
  margin-bottom: 8px;
}

.route-card__departure {
  color: #64748b;
  margin-bottom: 4px;
}

.route-card__price {
  font-weight: 700;
  color: #0284c7;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
