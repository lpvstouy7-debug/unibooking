<template>
  <div class="container">
    <h1 class="page-title">ໂຮງແຮມທີ່ແນະນຳສຳລັບທ່ານ</h1>

    <a-row :gutter="[24, 24]">
      <a-col v-for="hotel in hotels" :key="hotel.id" :xs="24" :md="12" :lg="8">
        <a-card hoverable class="hotel-card">
          <template #cover>
            <img :src="hotel.image" :alt="hotel.name" class="hotel-card__image" />
          </template>

          <h3 class="hotel-card__name">{{ hotel.name }}</h3>
          <a-rate disabled :value="hotel.rating" class="hotel-card__rating" />
          <p class="hotel-card__description">{{ hotel.description }}</p>
          <p class="hotel-card__price">{{ formatPrice(hotel.price) }} / ຄືນ</p>

          <a-button type="primary" block @click="handleBookNow(hotel)">
            ຈອງດຽວນີ້
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

const hotels = reactive([
  {
    id: 1,
    name: 'Vientiane Riverside Hotel',
    description: 'ໂຮງແຮມສະໄຕລ໌ທັນສະໄໝ ຕິດແມ່ນ້ຳຂອງ ໃຈກາງນະຄອນຫຼວງວຽງຈັນ',
    price: 500000,
    rating: 4,
    image: 'https://placehold.co/600x400/e2e8f0/0284c7?text=Hotel+Image'
  },
  {
    id: 2,
    name: 'Luang Prabang Heritage Villa',
    description: 'ວິນລາສະໄຕລ໌ຝຣັ່ງ-ລາວ ໃກ້ວັດວາອາຮາມ ບັນຍາກາດສະຫງົບ',
    price: 750000,
    rating: 5,
    image: 'https://placehold.co/600x400/e2e8f0/0284c7?text=Hotel+Image'
  },
  {
    id: 3,
    name: 'Pakse Garden Resort',
    description: 'ຣີສອດທ່າມກາງສວນສີຂຽວ ພ້ອມສະລອຍນ້ຳກາງແຈ້ງ',
    price: 420000,
    rating: 3,
    image: 'https://placehold.co/600x400/e2e8f0/0284c7?text=Hotel+Image'
  },
  {
    id: 4,
    name: 'Vang Vieng Mountain Lodge',
    description: 'ໂຮງແຮມວິວພູເຂົາ ໃກ້ແມ່ນ້ຳຊອງ ເໝາະສຳລັບຄອບຄົວ',
    price: 380000,
    rating: 4,
    image: 'https://placehold.co/600x400/e2e8f0/0284c7?text=Hotel+Image'
  }
])

function formatPrice(value) {
  return `₭ ${new Intl.NumberFormat('lo-LA').format(value)}`
}

function handleBookNow(hotel) {
  bookingStore.selectedService = hotel
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

.hotel-card__image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.hotel-card__name {
  margin-bottom: 4px;
  color: #0c4a6e;
}

.hotel-card__rating {
  font-size: 14px;
  margin-bottom: 8px;
}

.hotel-card__description {
  color: #64748b;
  min-height: 44px;
  margin-bottom: 8px;
}

.hotel-card__price {
  font-weight: 700;
  color: #0284c7;
  font-size: 16px;
  margin-bottom: 16px;
}
</style>
