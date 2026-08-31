import { defineStore } from 'pinia';
import { API_CREATE_REVIEW, apiServiceReviews } from '../utils/api';

const getInitialState = () => ({
  serviceId: null,
  reviews: [],
  meta: null,
  averageRating: null,
  reviewCount: 0,
  isLoading: false,
  isSubmitting: false,
  error: null
});

export const useReviewsStore = defineStore('reviews', {
  state: () => getInitialState(),

  actions: {
    // ດຶງຣີວິວຂອງບໍລິການໜຶ່ງ (GET /services/:serviceId/reviews) -- public, ບໍ່ຕ້ອງລັອກອິນ
    async fetchReviews(serviceId, { page = 1, limit = 10 } = {}) {
      this.serviceId = serviceId;
      this.isLoading = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const { data } = await $unibookingApi.get(apiServiceReviews(serviceId), { params: { page, limit } });

        // page > 1 means "load more" (see ReviewList.vue) -- append instead
        // of replacing so earlier pages stay visible.
        this.reviews = page > 1 ? [...this.reviews, ...data.data] : data.data;
        this.meta = data.meta;
        this.averageRating = data.averageRating;
        this.reviewCount = data.reviewCount;
      } catch (err) {
        this.error = 'ບໍ່ສາມາດດຶງຣີວິວໄດ້';
      } finally {
        this.isLoading = false;
      }
    },

    // ຂຽນຣີວິວໃໝ່ (POST /reviews) -- ຕ້ອງລັອກອິນ ແລະ ຕ້ອງມີການຈອງທີ່ສຳເລັດແລ້ວ (COMPLETED)
    // ສຳລັບ serviceId ນີ້ -- ຖ້າບໍ່ຄົບເງື່ອນໄຂ backend ຈະຕອບ 403 (ຄວາມໝາຍທີ່ eligibleItem ຫາບໍ່ພົບ)
    async submitReview({ serviceId, rating, comment }) {
      this.isSubmitting = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const { data } = await $unibookingApi.post(API_CREATE_REVIEW, { serviceId, rating, comment: comment || undefined });

        // ຕິດຣີວິວໃໝ່ໄວ້ເທິງສຸດຂອງລາຍການທີ່ໂຫລດໄວ້ແລ້ວ (ບໍ່ຕ້ອງ re-fetch ໝົດໜ້າ)
        if (this.serviceId === serviceId) {
          this.reviews = [data, ...this.reviews];
          this.reviewCount += 1;
          const priorTotal = (this.averageRating ?? 0) * (this.reviewCount - 1);
          this.averageRating = Number(((priorTotal + rating) / this.reviewCount).toFixed(2));
        }

        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'ບໍ່ສາມາດສົ່ງຣີວິວໄດ້';
        throw err;
      } finally {
        this.isSubmitting = false;
      }
    },

    reset() {
      Object.assign(this, getInitialState());
    }
  }
});
