import { api } from "./api";

export const uploadService = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api
      .post<{ data: { url: string } }>("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data.url);
  },
};
