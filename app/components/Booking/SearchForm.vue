<template>
  <a-card class="search-form" :bordered="false">
    <a-tabs v-model:activeKey="activeTab">
      <!-- Hotels -->
      <a-tab-pane key="hotels" tab="ໂຮງແຮມ">
        <a-row :gutter="[16, 16]" align="bottom">
          <a-col :xs="24" :sm="12" :md="7">
            <label class="field-label">ສະຖານທີ່</label>
            <a-input v-model:value="hotelSearch.location" placeholder="ນະຄອນຫຼວງວຽງຈັນ" size="large" />
          </a-col>

          <a-col :xs="24" :sm="12" :md="8">
            <label class="field-label">ວັນທີເຂົ້າພັກ - ວັນທີອອກ</label>
            <a-range-picker v-model:value="hotelSearch.dates" size="large" style="width: 100%" />
          </a-col>

          <a-col :xs="24" :sm="12" :md="5">
            <label class="field-label">ຈຳນວນຄົນ</label>
            <a-select id="hotel-search-guests" v-model:value="hotelSearch.guests" size="large" style="width: 100%">
              <a-select-option v-for="n in 6" :key="n" :value="n">{{ n }} ຄົນ</a-select-option>
            </a-select>
          </a-col>

          <a-col :xs="24" :sm="12" :md="4">
            <a-button type="primary" size="large" block @click="handleHotelSearch">
              ຄົ້ນຫາ
            </a-button>
          </a-col>
        </a-row>
      </a-tab-pane>

      <!-- Transport -->
      <a-tab-pane key="transport" tab="ພາຫະນະ">
        <a-row :gutter="[16, 16]" align="bottom">
          <a-col :xs="24" :sm="12" :md="6">
            <label class="field-label">ຕົ້ນທາງ</label>
            <a-input v-model:value="transportSearch.from" placeholder="ວຽງຈັນ" size="large" />
          </a-col>

          <a-col :xs="24" :sm="12" :md="6">
            <label class="field-label">ປາຍທາງ</label>
            <a-input v-model:value="transportSearch.to" placeholder="ຫຼວງພະບາງ" size="large" />
          </a-col>

          <a-col :xs="24" :sm="12" :md="7">
            <label class="field-label">ວັນທີເດີນທາງ</label>
            <a-date-picker v-model:value="transportSearch.departureDate" size="large" style="width: 100%" />
          </a-col>

          <a-col :xs="24" :sm="12" :md="5">
            <a-button type="primary" size="large" block @click="handleTransportSearch">
              ຄົ້ນຫາຖ້ຽວລົດ
            </a-button>
          </a-col>
        </a-row>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script setup>
// Nuxt auto-imports: ref, useBookingStore
const bookingStore = useBookingStore()

const activeTab = ref('hotels')

const hotelSearch = reactive({
  location: '',
  dates: [],
  guests: 1
})

const transportSearch = reactive({
  from: '',
  to: '',
  departureDate: null
})

function handleHotelSearch() {
  const [startDate, endDate] = hotelSearch.dates

  // ບັນທຶກຂໍ້ມູນການຄົ້ນຫາລົງໃນ Pinia store ເພື່ອໃຊ້ຕໍ່ໃນຂັ້ນຕອນການຈອງ
  bookingStore.bookingData.startDate = startDate ?? null
  bookingStore.bookingData.endDate = endDate ?? null
  bookingStore.bookingData.guests = hotelSearch.guests

  console.log('Hotel search payload:', {
    location: hotelSearch.location,
    ...bookingStore.bookingData
  })
}

function handleTransportSearch() {
  bookingStore.bookingData.startDate = transportSearch.departureDate

  console.log('Transport search payload:', {
    from: transportSearch.from,
    to: transportSearch.to,
    departureDate: transportSearch.departureDate
  })
}
</script>

<style scoped>
/* "Blue Light" accent — electric cyan on black. See index.vue's
   .services-section block for the matching service-card treatment. */
.search-form {
  border-radius: 12px;
}

.search-form :deep(.ant-tabs-tab) {
  color: rgba(34, 211, 238, 0.55);
}

.search-form :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #22d3ee !important;
}

/* Active navigation tab underline */
.search-form :deep(.ant-tabs-ink-bar) {
  background: #22d3ee;
}

.search-form :deep(.ant-input),
.search-form :deep(.ant-select-selector),
.search-form :deep(.ant-picker) {
  background: #1a2331;
  border-color: rgba(34, 211, 238, 0.4);
  color: #22d3ee;
}

.search-form :deep(.ant-input:hover),
.search-form :deep(.ant-select-selector:hover),
.search-form :deep(.ant-picker:hover) {
  border-color: #22d3ee;
}

.search-form :deep(.ant-input-focused),
.search-form :deep(.ant-input:focus),
.search-form :deep(.ant-select-focused .ant-select-selector),
.search-form :deep(.ant-picker-focused) {
  border-color: #22d3ee !important;
  box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2) !important;
}

.search-form :deep(.ant-input::placeholder),
.search-form :deep(.ant-picker-input input::placeholder) {
  color: rgba(34, 211, 238, 0.45);
}

.search-form :deep(.ant-select-selection-item),
.search-form :deep(.ant-picker-input input) {
  color: #22d3ee;
}

.search-form :deep(.ant-picker-suffix),
.search-form :deep(.ant-select-arrow) {
  color: rgba(34, 211, 238, 0.6);
}

/* Primary "ຄົ້ນຫາ" search button */
.search-form :deep(.ant-btn-primary) {
  background: #d4af37 !important;
  border-color: #d4af37 !important;
  color: #14294f !important;
  font-weight: 700;
  text-shadow: none;
  transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
}

.search-form :deep(.ant-btn-primary:hover) {
  background: #e0c05c !important;
  border-color: #e0c05c !important;
  color: #14294f !important;
  transform: scale(1.02);
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: #22d3ee;
  font-weight: 500;
}
</style>
