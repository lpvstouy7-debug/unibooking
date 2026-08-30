<template>
  <div class="container">
    <a-card class="result-card" :bordered="false">
      <template v-if="isChecking">
        <a-spin size="large" />
        <p class="result-card__hint">ກຳລັງກວດສອບຜົນການຊຳລະເງິນ...</p>
      </template>

      <template v-else-if="bookingStatus === 'CONFIRMED'">
        <CheckCircleFilled class="result-card__icon result-card__icon--success" />
        <h1 class="result-card__title">ຊຳລະເງິນສຳເລັດແລ້ວ!</h1>
        <p class="result-card__hint">ຂອບໃຈທີ່ໃຊ້ບໍລິການ UniBooking. ການຈອງຂອງທ່ານຖືກຢືນຢັນແລ້ວ.</p>
        <a-button type="primary" size="large" @click="router.push('/profile')">
          ໄປທີ່ໜ້າໂປຣໄຟລ໌
        </a-button>
      </template>

      <template v-else-if="bookingStatus === 'PENDING'">
        <ClockCircleOutlined class="result-card__icon result-card__icon--pending" />
        <h1 class="result-card__title">ກຳລັງລໍຖ້າການຢືນຢັນ</h1>
        <p class="result-card__hint">
          ຖ້າທ່ານຫາກໍ່ຊຳລະເງິນ ອາດໃຊ້ເວລາຄູ່ໜຶ່ງນາທີເພື່ອຢືນຢັນ. ກົດປຸ່ມລຸ່ມນີ້ເພື່ອກວດສອບອີກຄັ້ງ.
        </p>
        <a-button type="primary" size="large" :loading="isChecking" @click="checkStatus">
          ກວດສອບອີກຄັ້ງ
        </a-button>
      </template>

      <template v-else>
        <CloseCircleFilled class="result-card__icon result-card__icon--failed" />
        <h1 class="result-card__title">ການຊຳລະເງິນບໍ່ສຳເລັດ</h1>
        <p class="result-card__hint">ການຈອງນີ້ຖືກຍົກເລີກ ຫຼື ການຊຳລະເງິນລົ້ມເຫຼວ. ກະລຸນາລອງຈອງໃໝ່.</p>
        <a-button type="primary" size="large" @click="router.push('/hotels')">
          ກັບໄປໜ້າໂຮງແຮມ
        </a-button>
      </template>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled
} from '@ant-design/icons-vue'
import { useAuthStore } from '~/stores/auth'
import { useBookingStore } from '~/stores/booking'

// Stripe redirects the browser here after checkout (see STRIPE_SUCCESS_URL/
// STRIPE_CANCEL_URL in unibooking-backend/.env and StripeGateway.createCheckout).
// Pinia state doesn't survive that round trip, so bookingId travels as a
// query param instead of reading it off the store.
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

const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()

const isChecking = ref(true)
const bookingStatus = ref(null)

async function checkStatus() {
  const bookingId = route.query.bookingId
  if (!bookingId) {
    bookingStatus.value = 'CANCELLED'
    isChecking.value = false
    return
  }

  isChecking.value = true
  try {
    const { bookingStatus: status } = await bookingStore.getPaymentStatus(bookingId)
    bookingStatus.value = status
  } catch {
    bookingStatus.value = 'CANCELLED'
  } finally {
    isChecking.value = false
  }
}

onMounted(checkStatus)
</script>

<style scoped>
.container {
  max-width: 560px;
  margin: 80px auto;
}

.result-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  text-align: center;
  padding: 24px 0;
}

.result-card__icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.result-card__icon--success {
  color: #10b981;
}

.result-card__icon--pending {
  color: #f59e0b;
}

.result-card__icon--failed {
  color: #ef4444;
}

.result-card__title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.result-card__hint {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}
</style>
