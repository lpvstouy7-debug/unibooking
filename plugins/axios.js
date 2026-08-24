import axios from 'axios';

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

  // 2. ດັກຈັບກ່ອນຍິງ Request ໄປຫາ Server
  unibookingApi.interceptors.request.use((config) => {
    // ດຶງ Token ຈາກ LocalStorage (ໃນ Nuxt 3 ຈະໃຊ້ວິທີອື່ນແທນ Vuex ເຊັ່ນ Pinia, ແຕ່ຕອນນີ້ໃຊ້ Local ໄປກ່ອນ)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
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
          // ສັ່ງໃຫ້ກັບໄປໜ້າ Login ເມື່ອ Token ໝົດອາຍຸ
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
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

      // ແຈ້ງເຕືອນ Error (ໃຊ້ alert ໄປກ່ອນ ດຽວເຮົາຄ່ອຍເຊື່ອມ Ant Design)
      if (typeof window !== 'undefined' && error.response?.status !== 401) {
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