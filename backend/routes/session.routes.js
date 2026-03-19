import { Router } from "express";
import {
  createSession,
  listSessions,
} from "../controllers/session.controller.js";

const router = Router();

router.get("/", listSessions);
router.post("/", createSession);

export default router;
