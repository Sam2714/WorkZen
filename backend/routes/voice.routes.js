import { Router } from "express";
import multer from "multer";
import { getVoiceStatus, transcribeVoice } from "../controllers/voice.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const router = Router();

router.get("/status", getVoiceStatus);
router.post("/transcribe", upload.single("audio"), transcribeVoice);

export default router;
