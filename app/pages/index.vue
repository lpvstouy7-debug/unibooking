<template>
  <div>
    <section class="hero">
      <h1 class="hero__title">
        ຈອງທີ່ພັກ ແລະ ການເດີນທາງ ງ່າຍໆກັບ UniBooking
      </h1>
      <p class="hero__subtitle">
        ຄົ້ນຫາ ແລະ ຈອງໂຮງແຮມ, ລົດຮັບສົ່ງ ແລະ ບໍລິການທ່ອງທ່ຽວທົ່ວປະເທດລາວ ໄດ້ໃນທີ່ດຽວ
      </p>
    </section>

    <!-- Search form floats over the bottom edge of the hero, Booking.com/Agoda style -->
    <div class="search-form-wrapper">
      <BookingSearchForm />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 80px 16px 120px;
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 12px;
}

.hero__title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.hero__subtitle {
  font-size: 16px;
  color: #e0f2fe;
  margin-bottom: 0;
}

.search-form-wrapper {
  max-width: 1100px;
  margin: -64px auto 0;
  padding: 0 16px;
}
</style>
