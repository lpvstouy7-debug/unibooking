import { defineStore } from 'pinia';

const TOKEN_STORAGE_KEY = 'auth_token';

function readStoredToken() {
  if (!process.client) return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readStoredToken(),
    user: null,
    isLoading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },

  actions: {
    // ຈຳລອງການເອີ້ນ API ລັອກອິນ (ໃຫ້ປ່ຽນເປັນ $unibookingApi.post('/auth/login') ເມື່ອມີ Backend ແທ້)
    login(email, password) {
      this.isLoading = true;
      this.error = null;

      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            if (!email || !password) {
              throw new Error('ກະລຸນາປ້ອນອີເມວ ແລະ ລະຫັດຜ່ານ');
            }

            const token = 'mock-jwt-token-xyz';

            this.token = token;

            if (process.client) {
              localStorage.setItem(TOKEN_STORAGE_KEY, token);
            }

            await this.fetchProfile();

            resolve(this.user);
          } catch (err) {
            this.error = err.message || 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່';
            reject(err);
          } finally {
            this.isLoading = false;
          }
        }, 1500);
      });
    },

    // ຈຳລອງການເອີ້ນ GET /profile ດ້ວຍ Token ທີ່ໄດ້ຈາກ login/initAuth
    fetchProfile() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.user = {
            name: 'John Doe',
            email: 'john.doe@unibooking.la'
          };
          resolve(this.user);
        }, 500);
      });
    },

    logout() {
      this.user = null;
      this.token = null;

      if (process.client) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }

      navigateTo('/login');
    },

    // ຮຽກໃຊ້ຕອນແອັບໂຫລດ ເພື່ອກູ້ຄືນ Session (state.token ຖືກຕັ້ງຄ່າແລ້ວຕັ້ງແຕ່ state() ຖ້າມີ Token ໃນ localStorage)
    initAuth() {
      if (this.token && !this.user) {
        this.fetchProfile();
      }
    }
  }
});
