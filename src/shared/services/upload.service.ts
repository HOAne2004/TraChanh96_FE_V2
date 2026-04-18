import apiClient from "@/shared/services/http/axios";

export const uploadService = {
  async uploadFile(file: File): Promise<string> {
    // 1. Tạo đối tượng FormData để chứa file
    const formData = new FormData();
    formData.append("file", file); // Chữ "file" phải khớp với tên tham số (IFormFile file) ở Backend

    // 2. Gửi request POST
    // Lưu ý: Phải ghi đè Content-Type thành multipart/form-data
    const response = await apiClient.post("/shared/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log('Dữ liẹu Backend trả về:', response.data);
    return response.data;
  }
};
