import { defineStore } from 'pinia';
import { API_LOGIN, API_LOGOUT, API_ME } from '../utils/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Shape from POST /auth/login|register: SafeUser (id, email, firstName,
    // lastName, phone, role, ...). After a page reload it's re-hydrated via
    // GET /auth/me instead, which only returns the JWT payload
    // {sub, email, role} -- see initAuth() -- so firstName/lastName can be
    // absent until the user logs in again in this tab.
    user: null,
    isLoading: false,
    error: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),

    fullName: (state) => {
      if (!state.user) return '';
      const name = [state.user.firstName, state.user.lastName].filter(Boolean).join(' ');
      return name || state.user.email || '';
    }
  },

  actions: {
    async login(email, password) {
      this.isLoading = true;
      this.error = null;

      try {
        const { $unibookingApi } = useNuxtApp();
        const { data } = await $unibookingApi.post(API_LOGIN, { email, password });

        // Backend sets the httpOnly auth cookie itself (Set-Cookie on this
        // response); nothing to store client-side for the token itself.
        this.user = data.user;
        return this.user;
      } catch (err) {
        this.error = err.response?.data?.message || 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        const { $unibookingApi } = useNuxtApp();
        await $unibookingApi.post(API_LOGOUT);
      } catch {
        // Best effort -- clear local state regardless of whether the
        // network call succeeded, so the UI never gets stuck "logged in".
      } finally {
        this.user = null;
        navigateTo('/login');
      }
    },

    // ຮຽກໃຊ້ຕອນແອັບໂຫລດ (see plugins/auth.client.js): the auth cookie is
    // httpOnly so this Pinia store starts empty on every fresh page load
    // even when the browser still holds a valid session -- ask the server.
    async initAuth() {
      if (this.initialized || !process.client) return;
      this.initialized = true;

      try {
        const { $unibookingApi } = useNuxtApp();
        const { data } = await $unibookingApi.get(API_ME);
        // GET /auth/me returns the raw JWT payload {sub, email, role} only.
        this.user = { id: data.sub, email: data.email, role: data.role };
      } catch {
        // No/expired cookie -- stay logged out, silently (this runs on
        // every page load for anonymous visitors too).
        this.user = null;
      }
    }
  }
});
