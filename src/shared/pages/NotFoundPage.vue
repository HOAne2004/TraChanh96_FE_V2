<script setup lang="ts">
import IconSvgArrowLeft from '@/assets/icons/IconSvgArrowLeft.svg'
// Để đảm bảo component này không làm rối layout chính, ta có thể dùng router-link
// hoặc dùng router.push nếu muốn logic phức tạp hơn.
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] py-12 bg-gray-50 dark:bg-gray-900 text-center"
  >
    <h1 class="text-9xl font-extrabold text-primary-600 dark:text-primary-500 tracking-widest">404</h1>

    <div class="bg-red-600 px-4 py-1 text-sm text-white rounded rotate-12 shadow-md">
      Trang không tồn tại
    </div>

    <p class="text-2xl font-semibold mt-8 text-gray-800 dark:text-gray-100">
      Rất tiếc, chúng tôi không tìm thấy trang bạn yêu cầu.
    </p>

    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
    </p>

    <router-link
      to="/"
      class="mt-8 inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
    >
      <IconSvgArrowLeft class="size-6 mr-2" />
      Quay về trang chủ
    </router-link>
  </div>
</template>
