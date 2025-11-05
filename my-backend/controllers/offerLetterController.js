import OfferLetter from "../models/OfferLetter.js";
import pdfGenerator from "../utils/pdfGenerator.js";

export const createOfferLetter = async (req, res) => {
  try {
    const { employeeName, designation, joiningDate, offeredCtc } = req.body;

    if (!employeeName || !designation || !joiningDate || !offeredCtc) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Wait until PDF is fully written
    const relativePdfPath = await pdfGenerator.generateOfferLetter({
      employeeName,
      designation,
      joiningDate,
      offeredCtc,
    });

    if (!relativePdfPath) {
      return res.status(500).json({ message: "PDF generation failed" });
    }

    // ✅ Full absolute URL for frontend
    const fullPdfUrl = `${req.protocol}://${req.get("host")}${relativePdfPath}`;

    const offer = new OfferLetter({
      employeeName,
      designation,
      joiningDate,
      offeredCtc,
      pdfUrl: fullPdfUrl,
    });

    const savedOffer = await offer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    console.error("Error creating offer letter:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all offer letters
export const getOfferLetters = async (req, res) => {
  try {
    const offers = await OfferLetter.find();
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete offer letter
export const deleteOfferLetter = async (req, res) => {
  try {
    const offer = await OfferLetter.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer letter not found" });
    res.json({ message: "Offer letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
