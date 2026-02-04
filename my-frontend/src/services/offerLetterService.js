import api from "./api";

export const getAllOffers = async () => {
  try {
    const res = await api.get("/offer");
    return res.data;
  } catch (err) {
    console.error("Error fetching offers:", err);
    throw err;
  }
};

export const createOffer = async (record) => {
  try {
    const res = await api.post("/offer", record);
    return res.data;
  } catch (err) {
    console.error("Error creating offer:", err);
    throw err;
  }
};

export const deleteOffer = async (id) => {
  try {
    const res = await api.delete(`/offer/${id}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting offer:", err);
    throw err;
  }
};
