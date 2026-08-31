// ລວມສູນກາງ API Endpoints ທັງໝົດຂອງ UniBooking ໄວ້ບ່ອນດຽວ ເພື່ອງ່າຍຕໍ່ການແກ້ໄຂ/ຄົ້ນຫາ
// Matches unibooking-backend's actual controllers -- no global route prefix there.

// Auth (unibooking-backend/src/auth/auth.controller.ts)
export const API_LOGIN = '/auth/login';
export const API_REGISTER = '/auth/register';
export const API_LOGOUT = '/auth/logout';
export const API_ME = '/auth/me';

// Services -- generic catalog (unibooking-backend/src/services/services.controller.ts)
export const API_SEARCH_SERVICES = '/services/search';

// Vertical search APIs -- each targets Service+InventoryPricing with its own
// filter set (unibooking-backend/src/{hotels,transport,tours,car-rentals}/)
export const API_SEARCH_HOTELS = '/hotels/search';
export const API_SEARCH_TRANSPORT = '/transport/search';
export const API_SEARCH_TOURS = '/tours/search';
export const API_SEARCH_CAR_RENTALS = '/car-rentals/search';

// Bookings (unibooking-backend/src/bookings/bookings.controller.ts)
export const API_CREATE_BOOKING = '/bookings';
export const API_GET_MY_BOOKINGS = '/bookings/me';

// Payments (unibooking-backend/src/payments/payments.controller.ts)
export const API_CREATE_CHECKOUT = '/payments/checkout';
export const apiPaymentStatus = (bookingId) => `/payments/status/${bookingId}`;

// Reviews (unibooking-backend/src/reviews/reviews.controller.ts)
export const API_CREATE_REVIEW = '/reviews';
export const apiServiceReviews = (serviceId) => `/services/${serviceId}/reviews`;
