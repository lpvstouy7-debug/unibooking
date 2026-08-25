import axios from 'axios';

const TOKEN_STORAGE_KEY = 'auth_token';

export default defineNuxtPlugin((nuxtApp) => {
  // 1. ສ້າງ Instance ສຳລັບ UniBooking API
  const unibookingApi = axios.create({
    baseURL: process.env.API_URL || 'https://api.unibooking.la/v1',
    headers: {
      common: {
        Accept: 'application/json, text/plain, */*'
      }
    }
  });

  // 2. ດັກຈັບກ່ອນຍິງ Request ໄປຫາ Server: ຕິດ JWT ຈາກ localStorage ໃສ່ Authorization header
  unibookingApi.interceptors.request.use((config) => {
    const token = process.client ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  // 3. ດັກຈັບ Response ແລະ Error
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

          // Token ໝົດອາຍຸ/ບໍ່ຖືກຕ້ອງ: ລ້າງ Session ແລ້ວສົ່ງກັບໄປໜ້າ Login
          if (process.client) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
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

  // 4. ສົ່ງອອກໃຫ້ໃຊ້ງານໄດ້ທົ່ວແອັບພລິເຄຊັນ (ເອີ້ນໃຊ້ຜ່ານ ໂຕແປ $unibookingApi)
  return {
    provide: {
      unibookingApi
    }
  };
});
