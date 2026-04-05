import api from "./api";

/* ================= OFFER LETTER APIs ================= */

// 🔹 Get all offer letters
export const getAllOffers = async () => {
  const res = await api.get("/offer");
  return res.data;
};

// 🔹 Create new offer letter
export const createOffer = async (data) => {
  const res = await api.post("/offer", data);
  return res.data;
};

// 🔹 Delete offer letter
export const deleteOffer = async (id) => {
  const res = await api.delete(`/offer/${id}`);
  return res.data;
};

export const regenerateOffer = async (id) => {
  const res = await api.post(`/offer/regenerate/${id}`);
  return res.data;
};