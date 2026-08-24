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
            <a-select v-model:value="hotelSearch.guests" size="large" style="width: 100%">
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
.search-form {
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(2, 132, 199, 0.15);
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}
</style>
