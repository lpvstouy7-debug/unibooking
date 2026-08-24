import { defineStore } from 'pinia';
import { API_GET_SERVICES, API_CREATE_BOOKING, API_GET_HISTORY } from '../utils/api';

// ປະເພດບໍລິການທີ່ຄິດລາຄາຕໍ່ "ບ່ອນນັ່ງ" ແທນ "ຄົນ" (ໂຮງແຮມ/ບໍລິການອື່ນ ຫຼື ບໍ່ມີ type ຈະຄິດຕໍ່ຄົນ)
const TRANSPORT_TYPES = new Set(['transport', 'bus', 'van', 'train']);

// ຄ່າເລີ່ມຕົ້ນ (ໃຊ້ Function ເພື່ອໃຫ້ໄດ້ Object ໃໝ່ທຸກຄັ້ງທີ່ resetBooking() ຖືກເອີ້ນ)
const getInitialState = () => ({
  services: [],
  selectedService: null,
  bookingData: {
    startDate: null,
    endDate: null,
    guests: 1,
    seats: 1,
    specialRequests: ''
  },
  customerInfo: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    passportNo: ''
  },
  paymentStatus: 'pending',
  bookingReference: null,
  bookingHistory: [],
  isLoading: false,
  error: null
});

export const useBookingStore = defineStore('booking', {
  state: () => getInitialState(),

  getters: {
    // ຈອງໄດ້ພຽງແຕ່ເມື່ອມີບໍລິການ, ວັນທີ່ເລີ່ມ, ຊື່ ແລະ ເບີໂທຄົບຖ້ວນ
    isBookingReady: (state) => {
      return Boolean(
        state.selectedService &&
        state.bookingData.startDate &&
        state.customerInfo.firstName &&
        state.customerInfo.phone
      );
    },

    // ບໍລິການປັດຈຸບັນເປັນປະເພດພາຫະນະບໍ (ຄິດລາຄາຕໍ່ບ່ອນນັ່ງ) ຫຼືບໍ່ (ຄິດຕໍ່ຄົນ)
    isTransportBooking: (state) => {
      return TRANSPORT_TYPES.has(state.selectedService?.type?.toLowerCase());
    },

    // ລາຄາລວມ = ລາຄາບໍລິການ x ຈຳນວນຫົວ (ພາຫະນະຄິດຕໍ່ບ່ອນນັ່ງ, ນອກນັ້ນຄິດຕໍ່ຄົນ)
    // ໃຊ້ function ທຳມະດາ (ບໍ່ແມ່ນ arrow) ເພື່ອໃຫ້ `this` ເຂົ້າເຖິງ getter ອື່ນໄດ້
    totalPrice(state) {
      if (!state.selectedService) return 0;

      const quantity = this.isTransportBooking ? state.bookingData.seats : state.bookingData.guests;

      return state.selectedService.price * quantity;
    }
  },

  actions: {
    // ດຶງລາຍການບໍລິການທັງໝົດ
    async fetchServices() {
      this.isLoading = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const response = await $unibookingApi.get(API_GET_SERVICES);

        // ບາງ API ຫໍ່ຂໍ້ມູນໄວ້ໃນ dataResponse, ບາງອັນໃນ data, ບາງອັນສົ່ງມາກົງໆ
        this.services = response.data?.dataResponse || response.data?.data || response.data || [];
      } catch (err) {
        this.error = 'ບໍ່ສາມາດດຶງຂໍ້ມູນບໍລິການໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    // ສ້າງການຈອງໃໝ່
    async createBooking() {
      this.isLoading = true;
      this.error = null;

      const payload = {
        service: this.selectedService,
        booking: this.bookingData,
        customer: this.customerInfo
      };

      try {
        const { $unibookingApi } = useNuxtApp();
        const response = await $unibookingApi.post(API_CREATE_BOOKING, payload);

        // ບາງ API ຫໍ່ຂໍ້ມູນໄວ້ໃນ dataResponse, ບາງອັນໃນ data, ບາງອັນສົ່ງມາກົງໆ
        const result = response.data?.dataResponse || response.data?.data || response.data || {};

        this.bookingReference = result.bookingReference;
        this.paymentStatus = 'processing';

        return result;
      } catch (err) {
        this.error = 'ການຈອງລົ້ມເຫຼວ ກະລຸນາລອງໃໝ່';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // ດຶງປະຫວັດການຈອງຂອງຜູ້ໃຊ້
    async fetchBookingHistory() {
      this.isLoading = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const response = await $unibookingApi.get(API_GET_HISTORY);

        // ບາງ API ຫໍ່ຂໍ້ມູນໄວ້ໃນ dataResponse, ບາງອັນໃນ data, ບາງອັນສົ່ງມາກົງໆ
        this.bookingHistory = response.data?.dataResponse || response.data?.data || response.data || [];
      } catch (err) {
        this.error = 'ບໍ່ສາມາດດຶງປະຫວັດການຈອງໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    // ຣີເຊັດ State ທັງໝົດກັບຄືນສູ່ຄ່າເລີ່ມຕົ້ນ
    resetBooking() {
      Object.assign(this, getInitialState());
    }
  }
});
