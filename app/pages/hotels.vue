<template>
  <div class="hotels-page">
    <a-row :gutter="24">
      <!-- Filter sidebar -->
      <a-col :xs="24" :md="7" :lg="6">
        <a-card class="filter-card" :bordered="false">
          <h3 class="filter-card__title">ຕົວກອງ</h3>

          <div class="filter-block">
            <p class="filter-block__label">ຊ່ວງລາຄາ</p>
            <a-slider
              v-model:value="filters.priceRange"
              range
              :min="0"
              :max="5000000"
              :step="50000"
            />
            <div class="filter-block__price-display">
              ₭ {{ formatPrice(filters.priceRange[0]) }} - ₭ {{ formatPrice(filters.priceRange[1]) }}
            </div>
          </div>

          <a-divider />

          <div class="filter-block">
            <p class="filter-block__label">ລະດັບດາວ</p>
            <a-checkbox-group v-model:value="filters.stars" class="filter-block__group">
              <a-checkbox v-for="star in [5, 4, 3, 2]" :key="star" :value="star" class="filter-block__checkbox">
                {{ star }} ດາວ
              </a-checkbox>
            </a-checkbox-group>
          </div>

          <a-divider />

          <div class="filter-block">
            <p class="filter-block__label">ປະເພດທີ່ພັກ</p>
            <a-checkbox-group v-model:value="filters.propertyTypes" class="filter-block__group">
              <a-checkbox v-for="type in propertyTypeOptions" :key="type" :value="type" class="filter-block__checkbox">
                {{ type }}
              </a-checkbox>
            </a-checkbox-group>
          </div>
        </a-card>
      </a-col>

      <!-- Results -->
      <a-col :xs="24" :md="17" :lg="18">
        <div class="results-header">
          <h2 class="results-header__count">ພົບ {{ filteredHotels.length }} ໂຮງແຮມໃນວຽງຈັນ</h2>
          <a-select v-model:value="sortBy" size="large" class="results-header__sort">
            <a-select-option value="price-asc">ລາຄາ: ຕ່ຳ ຫາ ສູງ</a-select-option>
            <a-select-option value="rating-desc">ຄະແນນສູງສຸດ</a-select-option>
          </a-select>
        </div>

        <div class="hotel-list">
          <div v-for="hotel in sortedHotels" :key="hotel.id" class="hotel-card">
            <img :src="hotel.image" :alt="hotel.name" class="hotel-card__image" />

            <div class="hotel-card__body">
              <h3 class="hotel-card__name">{{ hotel.name }}</h3>
              <a-rate disabled :value="hotel.stars" class="hotel-card__rate" />
              <p class="hotel-card__location">
                <EnvironmentOutlined />
                {{ hotel.location }}
              </p>
              <div class="hotel-card__amenities">
                <a-tag v-for="amenity in hotel.amenities" :key="amenity" color="blue">{{ amenity }}</a-tag>
              </div>
            </div>

            <div class="hotel-card__action">
              <div class="hotel-card__price">₭ {{ formatPrice(hotel.price) }} / ຄືນ</div>
              <div class="hotel-card__price-note">ລວມພາສີ ແລະ ຄ່າທຳນຽມແລ້ວ</div>
              <a-button type="primary" size="large" @click="handleBookNow(hotel)">
                ຈອງເລີຍ
              </a-button>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const router = useRouter()

const propertyTypeOptions = ['Hotel', 'Resort', 'Villa', 'Guesthouse']

const hotels = reactive([
  {
    id: 1,
    name: 'Landmark Mekong Riverside Hotel',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    stars: 5,
    location: 'ຕິດແມ່ນ້ຳຂອງ, ນະຄອນຫຼວງວຽງຈັນ',
    price: 850000,
    propertyType: 'Hotel',
    amenities: ['Free WiFi', 'Pool', 'Breakfast']
  },
  {
    id: 2,
    name: 'Crowne Plaza Vientiane',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800&auto=format&fit=crop',
    stars: 5,
    location: 'ໃຈກາງນະຄອນຫຼວງວຽງຈັນ',
    price: 1200000,
    propertyType: 'Hotel',
    amenities: ['Free WiFi', 'Gym', 'Spa']
  },
  {
    id: 3,
    name: 'Salana Boutique Hotel',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
    stars: 4,
    location: 'ຖະໜົນເຊດຖາທິລາດ, ວຽງຈັນ',
    price: 550000,
    propertyType: 'Villa',
    amenities: ['Free WiFi', 'Breakfast']
  },
  {
    id: 4,
    name: 'Vientiane Garden Guesthouse',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop',
    stars: 3,
    location: 'ບ້ານທ່າດິນແດງ, ວຽງຈັນ',
    price: 280000,
    propertyType: 'Guesthouse',
    amenities: ['Free WiFi']
  }
])

const filters = reactive({
  priceRange: [200000, 2000000],
  stars: [],
  propertyTypes: []
})

const sortBy = ref('price-asc')

const filteredHotels = computed(() => {
  return hotels.filter((hotel) => {
    const inPriceRange = hotel.price >= filters.priceRange[0] && hotel.price <= filters.priceRange[1]
    const matchesStars = filters.stars.length === 0 || filters.stars.includes(hotel.stars)
    const matchesType = filters.propertyTypes.length === 0 || filters.propertyTypes.includes(hotel.propertyType)
    return inPriceRange && matchesStars && matchesType
  })
})

const sortedHotels = computed(() => {
  const list = [...filteredHotels.value]

  if (sortBy.value === 'price-asc') {
    return list.sort((a, b) => a.price - b.price)
  }
  return list.sort((a, b) => b.stars - a.stars)
})

function formatPrice(value) {
  return new Intl.NumberFormat('lo-LA').format(value)
}

function handleBookNow(hotel) {
  bookingStore.selectedService = hotel
  router.push('/checkout')
}
</script>

<style scoped>
.hotels-page {
  background: #f8fafc;
  padding: 40px 24px;
  border-radius: 16px;
}

/* Filter sidebar */
.filter-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  position: sticky;
  top: 24px;
}

.filter-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}

.filter-block__label {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 12px;
}

.filter-block__price-display {
  font-size: 13px;
  color: #64748b;
  margin-top: 8px;
}

.filter-block__group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-block__checkbox {
  margin-left: 0 !important;
}

/* Results header */
.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.results-header__count {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.results-header__sort {
  width: 220px;
}

/* Hotel list */
.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hotel-card {
  display: flex;
  gap: 20px;
  background: #ffffff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hotel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.12);
}

.hotel-card__image {
  flex: 0 0 280px;
  width: 280px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}

.hotel-card__body {
  flex: 1;
  min-width: 0;
}

.hotel-card__name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
}

.hotel-card__rate {
  font-size: 14px;
  margin-bottom: 8px;
}

.hotel-card__location {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 12px;
}

.hotel-card__amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hotel-card__action {
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  text-align: right;
  gap: 4px;
}

.hotel-card__price {
  font-size: 20px;
  font-weight: 700;
  color: #1e40af;
}

.hotel-card__price-note {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 8px;
}

/* Mobile: stack card content vertically */
@media (max-width: 767px) {
  .hotels-page {
    padding: 24px 16px;
  }

  .filter-card {
    position: static;
    margin-bottom: 20px;
  }

  .hotel-card {
    flex-direction: column;
  }

  .hotel-card__image {
    width: 100%;
    height: 180px;
  }

  .hotel-card__action {
    flex: none;
    align-items: flex-start;
    text-align: left;
    width: 100%;
  }

  .hotel-card__action .ant-btn {
    width: 100%;
  }
}
</style>
