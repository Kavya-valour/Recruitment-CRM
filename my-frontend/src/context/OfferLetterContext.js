import React, { createContext, useState, useEffect } from "react";
import * as offerService from "../services/offerLetterService";

export const OfferLetterContext = createContext();

export const OfferLetterProvider = ({ children }) => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all offer letters from backend
  const getOffers = async () => {
    setLoading(true);
    try {
      const data = await offerService.getAllOffers();
      setOffers(data);
    } catch (err) {
      console.error("Error fetching offers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new offer
  const addOffer = async (offerData) => {
    try {
      setOffers((prev) => [offerData, ...prev]); // Optimistic update
    } catch (err) {
      console.error("Error adding offer:", err);
    }
  };

  // Delete an offer
  const deleteOffer = async (id) => {
    try {
      await offerService.deleteOffer(id);
      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Error deleting offer:", err);
    }
  };

  useEffect(() => {
    getOffers();
  }, []);

  return (
    <OfferLetterContext.Provider
      value={{ offers, loading, getOffers, addOffer, deleteOffer }}
    >
      {children}
    </OfferLetterContext.Provider>
  );
};
