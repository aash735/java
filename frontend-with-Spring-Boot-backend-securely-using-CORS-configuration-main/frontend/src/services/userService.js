import axiosInstance from "../api/axiosInstance";

export async function getAllUsers() {
  const response = await axiosInstance.get("/api/user/all");
  return response.data;
}

export async function createUser(payload) {
  const response = await axiosInstance.post("/api/user/register", payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await axiosInstance.put(`/api/user/update/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  await axiosInstance.delete(`/api/user/delete/${id}`);
}

