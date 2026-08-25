<template>
  <div class="checkout-page">
    <a-row :gutter="32">
      <!-- Left: contact info + payment method -->
      <a-col :xs="24" :lg="16">
        <a-card class="section-card" :bordered="false">
          <h2 class="section-card__title">ຂໍ້ມູນຜູ້ຕິດຕໍ່</h2>

          <a-form ref="contactFormRef" layout="vertical" :model="bookingStore.customerInfo">
            <a-row :gutter="16">
              <a-col :xs="24" :sm="12">
                <a-form-item
                  label="ຊື່"
                  name="firstName"
                  :rules="[{ required: true, message: 'ກະລຸນາປ້ອນຊື່' }]"
                >
                  <a-input v-model:value="bookingStore.customerInfo.firstName" size="large" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item
                  label="ນາມສະກຸນ"
                  name="lastName"
                  :rules="[{ required: true, message: 'ກະລຸນາປ້ອນນາມສະກຸນ' }]"
                >
                  <a-input v-model:value="bookingStore.customerInfo.lastName" size="large" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item
                  label="ອີເມວ"
                  name="email"
                  :rules="[{ required: true, type: 'email', message: 'ກະລຸນາປ້ອນອີເມວທີ່ຖືກຕ້ອງ' }]"
                >
                  <a-input v-model:value="bookingStore.customerInfo.email" size="large" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :sm="12">
                <a-form-item
                  label="ເບີໂທລະສັບ"
                  name="phone"
                  :rules="[{ required: true, message: 'ກະລຸນາປ້ອນເບີໂທລະສັບ' }]"
                >
                  <a-input v-model:value="bookingStore.customerInfo.phone" size="large" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </a-card>

        <a-card class="section-card" :bordered="false">
          <h2 class="section-card__title">ຊ່ອງທາງຊຳລະເງິນ</h2>

          <a-radio-group v-model:value="paymentMethod" class="payment-options">
            <a-radio v-for="option in paymentOptions" :key="option.value" :value="option.value" class="payment-option">
              <component :is="option.icon" class="payment-option__icon" />
              <span class="payment-option__label">{{ option.label }}</span>
            </a-radio>
          </a-radio-group>
        </a-card>
      </a-col>

      <!-- Right: sticky booking summary -->
      <a-col :xs="24" :lg="8">
        <a-card class="summary-card" :bordered="false">
          <template v-if="!bookingStore.selectedService">
            <a-empty description="ຍັງບໍ່ໄດ້ເລືອກບໍລິການ">
              <a-button type="primary" @click="router.push('/hotels')">
                ກັບໄປໜ້າໂຮງແຮມ
              </a-button>
            </a-empty>
          </template>

          <template v-else>
            <img
              v-if="bookingStore.selectedService.image"
              :src="bookingStore.selectedService.image"
              :alt="bookingStore.selectedService.name"
              class="summary-card__image"
            />

            <h3 class="summary-card__name">{{ bookingStore.selectedService.name }}</h3>
            <a-rate
              v-if="bookingStore.selectedService.stars"
              disabled
              :value="bookingStore.selectedService.stars"
              class="summary-card__rate"
            />

            <a-divider />

            <div class="price-row">
              <span>ລາຄາພື້ນຖານ</span>
              <span>₭ {{ formatPrice(basePrice) }}</span>
            </div>
            <div class="price-row">
              <span>ພາສີ ແລະ ຄ່າທຳນຽມ (10%)</span>
              <span>₭ {{ formatPrice(taxAmount) }}</span>
            </div>

            <a-divider />

            <div class="price-row price-row--total">
              <span>ລາຄາລວມ</span>
              <span class="price-row__total-value">₭ {{ formatPrice(totalWithTax) }}</span>
            </div>

            <a-button
              type="primary"
              size="large"
              block
              class="confirm-btn"
              :loading="isSubmitting"
              @click="handleConfirmBooking"
            >
              ຢືນຢັນການຈອງ
            </a-button>
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Modal } from 'ant-design-vue'
import { QrcodeOutlined, CreditCardOutlined, HomeOutlined } from '@ant-design/icons-vue'
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const router = useRouter()

const contactFormRef = ref(null)
const isSubmitting = ref(false)

const paymentOptions = [
  { value: 'qr', label: 'BCEL One / QR Pay', icon: QrcodeOutlined },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCardOutlined },
  { value: 'hotel', label: 'Pay at Hotel', icon: HomeOutlined }
]
const paymentMethod = ref('qr')

const basePrice = computed(() => bookingStore.totalPrice)
const taxAmount = computed(() => Math.round(basePrice.value * 0.1))
const totalWithTax = computed(() => basePrice.value + taxAmount.value)

function formatPrice(value) {
  return new Intl.NumberFormat('lo-LA').format(value ?? 0)
}

async function handleConfirmBooking() {
  try {
    await contactFormRef.value?.validate()
  } catch {
    return
  }

  isSubmitting.value = true

  setTimeout(() => {
    isSubmitting.value = false

    Modal.success({
      title: 'ການຈອງສຳເລັດແລ້ວ!',
      content: 'ຂອບໃຈທີ່ໃຊ້ບໍລິການ UniBooking. ພວກເຮົາໄດ້ສົ່ງລາຍລະອຽດການຈອງໄປທາງອີເມວຂອງທ່ານແລ້ວ.',
      okText: 'ຕົກລົງ',
      onOk: () => {
        bookingStore.selectedService = null
        router.push('/')
      }
    })
  }, 1500)
}
</script>

<style scoped>
.checkout-page {
  background: #f8fafc;
  padding: 40px 24px;
  border-radius: 16px;
}

.section-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  margin-bottom: 24px;
}

.section-card__title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
}

/* Payment method: large selectable blocks instead of plain radios */
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.payment-option {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0 !important;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.payment-option:hover {
  border-color: #1e40af;
}

.payment-option :deep(.ant-radio) {
  order: -1;
}

.payment-option :deep(span:not(.ant-radio)) {
  display: flex;
  align-items: center;
  width: 100%;
}

.payment-option.ant-radio-wrapper-checked {
  border-color: #1e40af;
  background: rgba(30, 64, 175, 0.04);
}

.payment-option__icon {
  font-size: 22px;
  color: #1e40af;
  margin: 0 12px;
}

.payment-option__label {
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
}

/* Summary */
.summary-card {
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
  position: sticky;
  top: 100px;
}

.summary-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 16px;
}

.summary-card__name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.summary-card__rate {
  font-size: 14px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 10px;
}

.price-row--total {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
}

.price-row__total-value {
  font-size: 22px;
  color: #1e40af;
}

.confirm-btn {
  margin-top: 4px;
}

@media (max-width: 991px) {
  .summary-card {
    position: static;
  }
}

@media (max-width: 767px) {
  .checkout-page {
    padding: 24px 16px;
  }
}
</style>
