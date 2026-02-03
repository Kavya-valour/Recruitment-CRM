import express from "express";
import { getOfferLetters, createOfferLetter, deleteOfferLetter, regenerateOfferLetter } from "../controllers/offerLetterController.js";

const router = express.Router();

router.get("/", getOfferLetters);
router.post("/", createOfferLetter);
router.put("/:id/regenerate", regenerateOfferLetter);
router.delete("/:id", deleteOfferLetter);

export default router;
