<template>
  <div class="container">
    <h1 class="page-title">ເລືອກຖ້ຽວການເດີນທາງຂອງທ່ານ</h1>

    <a-card class="filter-card" :bordered="false">
      <a-row :gutter="16">
        <a-col :xs="24" :sm="12" :md="4">
          <label class="field-label">ປະເພດ</label>
          <a-select v-model:value="filters.mode" size="large" style="width: 100%" allow-clear placeholder="ທັງໝົດ">
            <a-select-option v-for="mode in modeOptions" :key="mode" :value="mode">{{ mode }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <label class="field-label">ຕົ້ນທາງ</label>
          <a-input v-model:value="filters.origin" size="large" placeholder="ວຽງຈັນ" />
        </a-col>
        <a-col :xs="24" :sm="12" :md="5">
          <label class="field-label">ປາຍທາງ</label>
          <a-input v-model:value="filters.destination" size="large" placeholder="ຫຼວງພະບາງ" />
        </a-col>
        <a-col :xs="24" :sm="12" :md="4">
          <label class="field-label">ວັນທີ່ເດີນທາງ</label>
          <a-input v-model:value="filters.departureDate" type="date" size="large" />
        </a-col>
        <a-col :xs="24" :sm="12" :md="3">
          <label class="field-label">ຊັ້ນທີ່ນັ່ງ</label>
          <a-select v-model:value="filters.seatClass" size="large" style="width: 100%" allow-clear placeholder="ທັງໝົດ">
            <a-select-option v-for="cls in seatClassOptions" :key="cls" :value="cls">{{ cls }}</a-select-option>
          </a-select>
        </a-col>
        <a-col :xs="24" :md="3" class="filter-card__search-col">
          <a-button type="primary" block size="large" :loading="bookingStore.isLoading" @click="runSearch">
            ຄົ້ນຫາ
          </a-button>
        </a-col>
      </a-row>
    </a-card>

    <a-spin :spinning="bookingStore.isLoading">
      <a-empty v-if="!bookingStore.isLoading && !bookingStore.services.length" description="ບໍ່ພົບຖ້ຽວການເດີນທາງທີ່ຕົງກັບການຄົ້ນຫາ" />

      <a-row v-else :gutter="[24, 24]">
        <a-col v-for="route in bookingStore.services" :key="route.id" :xs="24" :md="12" :lg="8">
          <a-card hoverable class="route-card">
            <template #cover>
              <img :src="placeholderImage(route.name)" :alt="route.name" class="route-card__image" />
            </template>

            <h3 class="route-card__name">{{ route.name }}</h3>
            <a-tag color="blue" class="route-card__type">{{ route.type }}</a-tag>
            <a-tag v-if="route.transportDetails?.seatClass" color="gold">{{ route.transportDetails.seatClass }}</a-tag>
            <p class="route-card__route">
              {{ route.transportDetails?.origin ?? route.location }}
              <ArrowRightOutlined />
              {{ route.transportDetails?.destination }}
            </p>
            <p class="route-card__price">
              <template v-if="unitPriceFor(route) != null">
                {{ formatPrice(unitPriceFor(route)) }} ກີບ / ບ່ອນນັ່ງ
              </template>
              <template v-else>ບໍ່ມີບ່ອນນັ່ງວ່າງມື້ນີ້</template>
            </p>

            <a-button type="primary" block :disabled="unitPriceFor(route) == null" @click="handleBookNow(route)">
              ຈອງປີ້
            </a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { ArrowRightOutlined } from '@ant-design/icons-vue'
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const router = useRouter()

const modeOptions = ['FLIGHT', 'TRAIN', 'BUS']
const seatClassOptions = ['ECONOMY', 'BUSINESS', 'FIRST']

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

// Transport is a same-day service -- one departure date, one seat = one unit
// (see GET /transport/search on unibooking-backend, which widens a single
// departureDate into a one-day availability window).
const filters = reactive({
  mode: undefined,
  origin: '',
  destination: '',
  departureDate: isoDate(new Date()),
  seatClass: undefined
})

function runSearch() {
  bookingStore.searchTransport({
    mode: filters.mode,
    origin: filters.origin || undefined,
    destination: filters.destination || undefined,
    departureDate: filters.departureDate,
    seatClass: filters.seatClass,
    sortBy: 'price_asc'
  })
}

onMounted(runSearch)

function unitPriceFor(route) {
  const entry = route.inventory?.find((row) => row.date?.slice(0, 10) === filters.departureDate) ?? route.inventory?.[0]
  return entry ? Number(entry.price) : null
}

function placeholderImage(name) {
  return `https://placehold.co/600x400/f8fafc/0369a1?text=${encodeURIComponent(name)}`
}

function formatPrice(value) {
  return new Intl.NumberFormat('lo-LA').format(value)
}

function handleBookNow(route) {
  bookingStore.selectedService = route
  bookingStore.bookingData.startDate = filters.departureDate
  bookingStore.bookingData.endDate = filters.departureDate
  router.push('/checkout')
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;
}

.filter-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  margin-bottom: 24px;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.filter-card__search-col {
  display: flex;
  align-items: flex-end;
}

.route-card {
  border-radius: 12px;
  overflow: hidden;
}

.route-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.route-card__name {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.route-card__type {
  margin-bottom: 8px;
}

.route-card__route {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  margin: 8px 0 4px;
}

.route-card__price {
  font-size: 16px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 16px;
}
</style>
