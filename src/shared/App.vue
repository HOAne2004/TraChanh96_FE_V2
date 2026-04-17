<script setup lang="ts">
import LoginModal from '@/modules/identity/components/LoginModal.vue';
import RegisterModal from '@/modules/identity/components/RegisterModal.vue';
import ForgotPasswordModal from '@/modules/identity/components/ForgotPasswordModal.vue';
import ToastContainer from '@/shared/components/ToastContainer.vue';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';
</script>

<template>
  <router-view></router-view>
  <LoginModal></LoginModal>
  <RegisterModal></RegisterModal>
  <ForgotPasswordModal></ForgotPasswordModal>
  <ToastContainer />
  <ConfirmModal />
</template>

<style scoped></style>
