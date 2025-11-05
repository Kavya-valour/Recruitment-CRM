import express from "express";
import { getOfferLetters, createOfferLetter, deleteOfferLetter } from "../controllers/offerLetterController.js";

const router = express.Router();

router.get("/", getOfferLetters);
router.post("/", createOfferLetter);
router.delete("/:id", deleteOfferLetter);

export default router;
