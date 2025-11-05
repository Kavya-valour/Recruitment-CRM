import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
  employeeName: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  offeredCtc: { type: Number, required: true },
  pdfUrl: { type: String },  // Path to stored PDF
  status: { type: String, default: "Generated" }, // Optional status
}, { timestamps: true });

export default mongoose.model("OfferLetter", offerLetterSchema);
