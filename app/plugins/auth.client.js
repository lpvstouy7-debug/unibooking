export default defineNuxtPlugin(() => {
  // Client-only: runs before the app mounts, so the header never renders
  // a logged-out flash before the session is restored by asking
  // GET /auth/me whether the httpOnly cookie is still valid.
  const authStore = useAuthStore();
  authStore.initAuth();
});
