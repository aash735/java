import axiosInstance from "../api/axiosInstance";

export async function getAllProducts() {
  const response = await axiosInstance.get("/api/product/all");
  return response.data;
}

export async function getMyProducts() {
  const response = await axiosInstance.get("/api/product/my-products");
  return response.data;
}

export async function createProduct(payload) {
  const response = await axiosInstance.post("/api/product/register", payload);
  return response.data;
}

export async function updateProduct(id, payload) {
  const response = await axiosInstance.put(`/api/product/update/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id) {
  await axiosInstance.delete(`/api/product/delete/${id}`);
}

