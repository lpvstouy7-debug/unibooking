import { defineStore } from 'pinia';
import { API_LOGIN } from '../utils/api';

const TOKEN_STORAGE_KEY = 'auth_token';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },

  actions: {
    // ເອີ້ນ API ລັອກອິນແທ້ ຄາດຫວັງ response: { success: true, data: { token, user } }
    async login(email, password) {
      this.isLoading = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const response = await $unibookingApi.post(API_LOGIN, { email, password });

        // ບາງ API ຫໍ່ຂໍ້ມູນໄວ້ໃນ dataResponse, ບາງອັນໃນ data, ບາງອັນສົ່ງມາກົງໆ
        const result = response.data?.dataResponse || response.data?.data || response.data || {};
        const { token, user } = result;

        this.token = token;
        this.user = user;

        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }

        return user;
      } catch (err) {
        this.error = 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    },

    // ຮຽກໃຊ້ຕອນແອັບໂຫລດ ເພື່ອກູ້ຄືນ Session ຈາກ Token ທີ່ບັນທຶກໄວ້
    initAuth() {
      if (typeof window === 'undefined') return;

      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) return;

      this.token = token;
      // Mock: ບໍ່ມີ Backend ໃຫ້ດຶງຂໍ້ມູນຜູ້ໃຊ້ແທ້ ຈຶ່ງໃຊ້ຄ່າຈຳລອງໄປກ່ອນ
      this.user = { name: 'John Doe', email: 'john.doe@unibooking.la' };
    }
  }
});
