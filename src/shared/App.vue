<script setup lang="ts">
import LoginModal from '@/modules/identity/components/auth/LoginModal.vue';
import RegisterModal from '@/modules/identity/components/auth/RegisterModal.vue';
import ForgotPasswordModal from '@/modules/identity/components/auth/ForgotPasswordModal.vue';
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
