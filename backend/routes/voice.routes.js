import { Router } from "express";
import multer from "multer";
import { transcribeVoice } from "../controllers/voice.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const router = Router();

router.post("/transcribe", upload.single("audio"), transcribeVoice);

export default router;
