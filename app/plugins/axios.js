import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  // 1. ສ້າງ Instance ສຳລັບ UniBooking API
  const unibookingApi = axios.create({
    baseURL: config.public.apiBase,
    // Backend auth is an httpOnly cookie (see AuthController.setAuthCookie),
    // not a bearer token -- withCredentials makes the browser attach/accept
    // that cookie on cross-origin requests (frontend :3000, API :3001).
    // Paired with backend's app.enableCors({ credentials: true, origin: [...] }).
    withCredentials: true,
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*'
      }
    }
  });

  // 2. ດັກຈັບ Response ແລະ Error (ບໍ່ຕ້ອງຕິດ Authorization header ອີກຕໍ່ໄປ -- cookie ໄປເອງອັດຕະໂນມັດ)
  unibookingApi.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      let errorMessage = 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຮູ້ຈັກ ກະລຸນາລອງໃໝ່ພາຍຫຼັງ.';

      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          errorMessage = 'ເຊດຊັນຂອງທ່ານໝົດອາຍຸແລ້ວ ກະລຸນາລັອກອິນໃໝ່.';

          // Cookie ໝົດອາຍຸ/ບໍ່ຖືກຕ້ອງ: ສົ່ງກັບໄປໜ້າ Login
          // (ບໍ່ມີ token ໃນ localStorage ໃຫ້ລ້າງອີກຕໍ່ໄປ -- cookie ຖືກ server ຈັດການ;
          // ການ redirect ແບບ full page load ນີ້ຈະລ້າງ Pinia state ໄປໃນຕົວ)
          if (process.client) {
            window.location.href = '/login';
          }
        }
        else if (status === 403) errorMessage = 'ທ່ານບໍ່ມີສິດເຂົ້າເຖິງຂໍ້ມູນນີ້.';
        else if (status === 404) errorMessage = 'ບໍ່ພົບຂໍ້ມູນບໍລິການທີ່ທ່ານຕ້ອງການ.';
        else if (status === 422) errorMessage = 'ຂໍ້ມູນທີ່ປ້ອນບໍ່ຖືກຕ້ອງ ກະລຸນາກວດສອບຄືນ.';
        else if (status === 500) errorMessage = 'ລະບົບເຊີບເວີຂັດຂ້ອງຊົ່ວຄາວ.';

        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'ບໍ່ສາມາດເຊື່ອມຕໍ່ຫາເຊີບເວີໄດ້ ກະລຸນາກວດສອບອິນເຕີເນັດ.';
      }

      // ແຈ້ງເຕືອນ Error (ໃຊ້ alert ໄປກ່ອນ ດຽວເຮົາຄ່ອຍເຊື່ອມ Ant Design) — ຍົກເວັ້ນ 401 ເພາະຈະ redirect ຢູ່ແລ້ວ
      if (process.client && error.response?.status !== 401) {
        alert(errorMessage);
      }

      return Promise.reject(error);
    }
  );

  // 3. ສົ່ງອອກໃຫ້ໃຊ້ງານໄດ້ທົ່ວແອັບພລິເຄຊັນ (ເອີ້ນໃຊ້ຜ່ານ ໂຕແປ $unibookingApi)
  return {
    provide: {
      unibookingApi
    }
  };
});
