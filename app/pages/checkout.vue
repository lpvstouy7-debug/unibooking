<template>
  <div class="checkout-page">
    <a-row :gutter="[24, 24]">
      <!-- Left: multi-step checkout flow -->
      <a-col :xs="24" :md="16">
        <a-card class="steps-card">
          <a-steps :current="currentStep" class="steps">
            <a-step title="ຂໍ້ມູນລູກຄ້າ" />
            <a-step title="ຊຳລະເງິນ" />
            <a-step title="ສຳເລັດ" />
          </a-steps>

          <!-- Step 1: Customer Info -->
          <div v-if="currentStep === 0" class="step-content">
            <a-form layout="vertical" :model="bookingStore.customerInfo">
              <a-row :gutter="16">
                <a-col :xs="24" :sm="12">
                  <a-form-item label="ຊື່">
                    <a-input v-model:value="bookingStore.customerInfo.firstName" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="ນາມສະກຸນ">
                    <a-input v-model:value="bookingStore.customerInfo.lastName" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="ເບີໂທລະສັບ">
                    <a-input v-model:value="bookingStore.customerInfo.phone" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24" :sm="12">
                  <a-form-item label="ອີເມວ">
                    <a-input v-model:value="bookingStore.customerInfo.email" size="large" />
                  </a-form-item>
                </a-col>
                <a-col :xs="24">
                  <a-form-item label="ເລກທີ່ໜັງສືເດີນທາງ (Passport No.)">
                    <a-input v-model:value="bookingStore.customerInfo.passportNo" size="large" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>

            <div class="step-actions">
              <a-button
                type="primary"
                size="large"
                :disabled="!canGoToPayment"
                @click="currentStep = 1"
              >
                ຖັດໄປ
              </a-button>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div v-else-if="currentStep === 1" class="step-content">
            <div class="qr-payment">
              <div class="qr-payment__placeholder">
                QR CODE
              </div>
              <p class="qr-payment__hint">
                ສະແກນ QR Code ຜ່ານແອັບທະນາຄານຂອງທ່ານເພື່ອຊຳລະເງິນ
              </p>
              <p class="qr-payment__amount">
                ຍອດຊຳລະ: <strong>{{ formatPrice(bookingStore.totalPrice) }} ກີບ</strong>
              </p>
            </div>

            <a-alert
              v-if="bookingStore.error"
              type="error"
              show-icon
              :message="bookingStore.error"
              class="payment-error"
            />

            <div class="step-actions">
              <a-button size="large" @click="currentStep = 0">
                ກັບຄືນ
              </a-button>
              <a-button
                type="primary"
                size="large"
                :loading="bookingStore.isLoading"
                @click="handleConfirmPayment"
              >
                ຢືນຢັນການຊຳລະເງິນ
              </a-button>
            </div>
          </div>

          <!-- Step 3: Success -->
          <div v-else class="step-content">
            <a-result
              status="success"
              title="ການຈອງສຳເລັດແລ້ວ!"
              :sub-title="`ລະຫັດການຈອງຂອງທ່ານ: ${bookingStore.bookingReference}`"
            >
              <template #extra>
                <a-button type="primary" size="large" @click="handleBackHome">
                  ກັບໜ້າຫຼັກ
                </a-button>
              </template>
            </a-result>
          </div>
        </a-card>
      </a-col>

      <!-- Right: sticky order summary -->
      <a-col :xs="24" :md="8">
        <a-card title="ສະຫຼຸບການຈອງ" class="summary-card">
          <template v-if="bookingStore.selectedService">
            <h3 class="summary-service">{{ bookingStore.selectedService.name }}</h3>

            <a-descriptions :column="1" size="small" class="summary-details">
              <a-descriptions-item label="ວັນທີເຂົ້າພັກ">
                {{ formatDate(bookingStore.bookingData.startDate) }}
              </a-descriptions-item>
              <a-descriptions-item label="ວັນທີອອກ">
                {{ formatDate(bookingStore.bookingData.endDate) }}
              </a-descriptions-item>
              <a-descriptions-item :label="bookingStore.isTransportBooking ? 'ຈຳນວນບ່ອນນັ່ງ' : 'ຈຳນວນຄົນ'">
                {{ bookingStore.isTransportBooking ? bookingStore.bookingData.seats : bookingStore.bookingData.guests }}
                {{ bookingStore.isTransportBooking ? 'ບ່ອນນັ່ງ' : 'ຄົນ' }}
              </a-descriptions-item>
            </a-descriptions>

            <a-divider />

            <div class="summary-total">
              <span>ລວມທັງໝົດ</span>
              <span class="summary-total__value">{{ formatPrice(bookingStore.totalPrice) }} ກີບ</span>
            </div>
          </template>

          <a-empty v-else description="ຍັງບໍ່ໄດ້ເລືອກບໍລິການ" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
// dayjs ships as a dependency of ant-design-vue but isn't auto-imported
import dayjs from 'dayjs'

// Nuxt/Pinia auto-imports: ref, computed, useBookingStore, navigateTo
const bookingStore = useBookingStore()

const currentStep = ref(0)

// Require the fields isBookingReady checks before letting the user move to payment
const canGoToPayment = computed(() => bookingStore.isBookingReady)

function formatPrice(value) {
  return new Intl.NumberFormat('lo-LA').format(value ?? 0)
}

function formatDate(value) {
  if (!value) return '-'
  return dayjs(value).format('DD/MM/YYYY')
}

async function handleConfirmPayment() {
  try {
    await bookingStore.createBooking()
    currentStep.value = 2
  } catch {
    // bookingStore.error already holds the Lao error message; shown via a-alert above
  }
}

function handleBackHome() {
  bookingStore.resetBooking()
  navigateTo('/')
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
}

.steps {
  margin-bottom: 32px;
}

.step-content {
  min-height: 280px;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Payment */
.qr-payment {
  text-align: center;
  padding: 32px 16px;
}

.qr-payment__placeholder {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border: 2px dashed #0ea5e9;
  border-radius: 8px;
  color: #0284c7;
  font-weight: 700;
  letter-spacing: 1px;
}

.qr-payment__hint {
  color: #64748b;
  margin-bottom: 8px;
}

.qr-payment__amount {
  font-size: 16px;
  color: #0c4a6e;
}

.payment-error {
  margin-bottom: 16px;
}

/* Order summary */
.summary-card {
  position: sticky;
  top: 24px;
}

.summary-service {
  margin-bottom: 12px;
  color: #0c4a6e;
}

.summary-details {
  margin-bottom: 8px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.summary-total__value {
  color: #0284c7;
}

/* Stack columns on mobile: sticky summary would otherwise pin below the fold */
@media (max-width: 767px) {
  .summary-card {
    position: static;
  }
}
</style>
