export default defineNuxtPlugin(() => {
  // Client-only: runs before the app mounts, so the header never renders
  // a logged-out flash before the session is restored from localStorage
  const authStore = useAuthStore();
  authStore.initAuth();
});
