// src/modules/catalog/store/category.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { categoryService } from '../services/category.service';
import type { Category } from '../types/category';
import {extractErrorMessage} from '@/shared/utils/errorHandler';

export const useCategoryStore = defineStore('category', () => {
  // --- STATE ---
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // --- GETTERS ---
  // Vẫn giữ nguyên logic tạo cây danh mục 2 cấp
  const categoryTree = computed(() => {
    const roots = categories.value.filter(c => c.parentId === null);
    return roots.map(root => ({
      ...root,
      children: categories.value.filter(c => c.parentId === root.id)
    }));
  });

  // --- ACTIONS ---
  const fetchCategories = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Gọi service, nó sẽ trả về trực tiếp mảng Category[]
      const data = await categoryService.getCategories();
      categories.value = data;

    } catch (err) {
      // Bắt lỗi từ ErrorResponse của Backend trả về
      error.value = extractErrorMessage(err, 'Lỗi khi tải danh mục');
    } finally {
      isLoading.value = false;
    }
  };

  return {
    categories,
    categoryTree,
    isLoading,
    error,
    fetchCategories
  };
});
