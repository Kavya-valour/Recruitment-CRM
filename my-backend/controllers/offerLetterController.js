import OfferLetter from "../models/OfferLetter.js";
import pdfGenerator from "../utils/pdfGenerator.js";

export const createOfferLetter = async (req, res) => {
  try {
    const {
      employeeName,
      relationPrefix,
      fatherName,
      employeeAddress,     // will come as array from frontend
      designation,
      joiningDate,
      basic,
      hra,
      da,
      specialAllowance,
      offeredCtc,
      tds,
    } = req.body;

    // ✅ Validate Required Fields
    if (!employeeName || !designation || !joiningDate || !offeredCtc) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // ✅ Convert numeric fields to numbers (avoid string issues)
    const payload = {
      employeeName,
      relationPrefix,
      fatherName,
      employeeAddress, 
      designation,
      joiningDate,
      basic: Number(basic) || 0,
      hra: Number(hra) || 0,
      da: Number(da) || 0,
      specialAllowance: Number(specialAllowance) || 0,
      offeredCtc: Number(offeredCtc) || 0,
      tds: Number(tds) || 0,
    };

    // ✅ Generate PDF
    const relativePdfPath = await pdfGenerator.generateOfferLetter(payload);

    if (!relativePdfPath) {
      return res.status(500).json({ message: "PDF generation failed" });
    }

    // ✅ Construct full public URL
    const fullPdfUrl = `${req.protocol}://${req.get("host")}${relativePdfPath}`;

    // ✅ Save to DB
    const offer = new OfferLetter({
      employeeName,
      relationPrefix,
      fatherName,
      employeeAddress,
      designation,
      joiningDate,
      offeredCtc: Number(offeredCtc),
      pdfUrl: fullPdfUrl,
      status: "Generated",
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

// Regenerate offer letter PDF
export const regenerateOfferLetter = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await OfferLetter.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer letter not found" });

    // Prepare data from existing offer
    const data = {
      employeeName: offer.employeeName,
      relationPrefix: offer.relationPrefix,
      fatherName: offer.fatherName,
      employeeAddress: offer.employeeAddress,
      designation: offer.designation,
      joiningDate: offer.joiningDate,
      basic: offer.basic,
      hra: offer.hra,
      da: offer.da,
      specialAllowance: offer.specialAllowance,
      offeredCtc: offer.offeredCtc,
      tds: offer.tds,
    };

    // Generate new PDF
    const relativePdfPath = await pdfGenerator.generateOfferLetter(data);
    if (!relativePdfPath) {
      return res.status(500).json({ message: "PDF regeneration failed" });
    }

    // Construct full public URL
    const fullPdfUrl = `${req.protocol}://${req.get("host")}${relativePdfPath}`;

    // Update the offer with new PDF URL
    offer.pdfUrl = fullPdfUrl;
    await offer.save();

    res.json({ message: "Offer letter regenerated successfully", offer });
  } catch (error) {
    console.error("Error regenerating offer letter:", error);
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
