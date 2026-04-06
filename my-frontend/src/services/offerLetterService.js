import api from "./api";

// GET
export const getAllOffers = async () => {
  const res = await api.get("/offerletters");
  return res.data;
};

// CREATE
export const createOffer = async (data) => {
  const res = await api.post("/offerletters", data);
  return res.data;
};

// DELETE
export const deleteOffer = async (id) => {
  const res = await api.delete(`/offerletters/${id}`);
  return res.data;
};

// REGENERATE
export const regenerateOffer = async (id) => {
  const res = await api.put(`/offerletters/${id}/regenerate`);
  return res.data;
};