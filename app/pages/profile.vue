<template>
  <div class="container">
    <!-- Guarded by definePageMeta below; this only renders once authenticated -->
    <a-card class="profile-header" :bordered="false">
      <div class="profile-header__inner">
        <a-avatar :size="64">{{ userInitial }}</a-avatar>
        <div>
          <h1 class="profile-header__name">{{ authStore.user?.name }}</h1>
          <p class="profile-header__email">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <a-button danger @click="handleLogout">
        ອອກຈາກລະບົບ
      </a-button>
    </a-card>

    <a-card class="profile-tabs-card">
      <a-tabs default-active-key="history">
        <!-- Tab 1: Booking History -->
        <a-tab-pane key="history" tab="ປະຫວັດການຈອງ">
          <a-table
            :columns="historyColumns"
            :data-source="bookingStore.bookingHistory"
            :loading="bookingStore.isLoading"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'status'">
                <a-tag :color="statusTagMeta(record.status).color">
                  {{ statusTagMeta(record.status).text }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'totalPrice'">
                {{ formatPrice(record.totalPrice) }} ກີບ
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" @click="handleViewDetail(record)">
                  ເບິ່ງລາຍລະອຽດ
                </a-button>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <!-- Tab 2: Personal Info -->
        <a-tab-pane key="info" tab="ຂໍ້ມູນສ່ວນຕົວ">
          <a-descriptions :column="1" bordered size="middle">
            <a-descriptions-item label="ຊື່">{{ authStore.user?.name }}</a-descriptions-item>
            <a-descriptions-item label="ອີເມວ">{{ authStore.user?.email }}</a-descriptions-item>
          </a-descriptions>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Booking Detail Modal -->
    <a-modal
      v-model:open="isModalVisible"
      title="ລາຍລະອຽດການຈອງ"
      :footer="null"
    >
      <a-descriptions v-if="selectedBooking" :column="1" bordered size="middle">
        <a-descriptions-item label="ລະຫັດການຈອງ">{{ selectedBooking?.id || '-' }}</a-descriptions-item>
        <a-descriptions-item label="ຊື່ບໍລິການ">{{ selectedBooking?.serviceName || 'Service' }}</a-descriptions-item>
        <a-descriptions-item label="ວັນທີ">{{ selectedBooking?.date || '-' }}</a-descriptions-item>
        <a-descriptions-item :label="selectedBooking?.type === 'transport' ? 'ຈຳນວນບ່ອນນັ່ງ' : 'ຈຳນວນຄົນ'">
          {{ selectedBooking?.quantity || '-' }}
        </a-descriptions-item>
        <a-descriptions-item label="ລາຄາລວມ">{{ formatPrice(selectedBooking?.totalPrice) }} ກີບ</a-descriptions-item>
        <a-descriptions-item label="ສະຖານະ">
          <a-tag :color="statusTagMeta(selectedBooking.status).color">
            {{ statusTagMeta(selectedBooking.status).text }}
          </a-tag>
        </a-descriptions-item>
      </a-descriptions>

      <div class="modal-actions">
        <a-button @click="isModalVisible = false">ປິດ</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
// Redirect unauthenticated visitors before the page renders
definePageMeta({
  middleware: [
    () => {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return navigateTo('/login')
      }
    }
  ]
})

// Nuxt/Pinia auto-imports: computed, onMounted, useAuthStore, useBookingStore, navigateTo
const authStore = useAuthStore()
const bookingStore = useBookingStore()

const userInitial = computed(() => authStore.user?.name?.charAt(0).toUpperCase() ?? '?')

onMounted(() => {
  bookingStore.fetchBookingHistory()
})

const historyColumns = [
  { title: 'ລະຫັດການຈອງ', dataIndex: 'id', key: 'id' },
  { title: 'ຊື່ບໍລິການ', dataIndex: 'serviceName', key: 'serviceName' },
  { title: 'ວັນທີ', dataIndex: 'date', key: 'date' },
  { title: 'ລາຄາລວມ', dataIndex: 'totalPrice', key: 'totalPrice' },
  { title: 'ສະຖານະ', dataIndex: 'status', key: 'status' },
  { title: 'ຈັດການ', key: 'action' }
]

// ແປ status code ຈາກ backend ເປັນສີ+ຂໍ້ຄວາມ Lao ສຳລັບ a-tag
const STATUS_TAG_MAP = {
  pending: { color: 'warning', text: 'ລໍຖ້າຊຳລະ' },
  completed: { color: 'success', text: 'ສຳເລັດ' },
  cancelled: { color: 'error', text: 'ຍົກເລີກ' }
}

function statusTagMeta(status) {
  return STATUS_TAG_MAP[status] || { color: 'default', text: status }
}

function formatPrice(value) {
  return new Intl.NumberFormat('lo-LA').format(value || 0)
}

function handleLogout() {
  authStore.logout()
  navigateTo('/')
}

// Booking detail modal
const isModalVisible = ref(false)
const selectedBooking = ref(null)

function handleViewDetail(record) {
  selectedBooking.value = record
  isModalVisible.value = true
}
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
}

.profile-header {
  margin-bottom: 24px;
}

.profile-header :deep(.ant-card-body) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.profile-header__inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-header__name {
  margin: 0;
  color: #0c4a6e;
}

.profile-header__email {
  margin: 0;
  color: #64748b;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
