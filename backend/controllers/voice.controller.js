import { ok } from "../utils/response.js";
import { transcribeAudioBuffer } from "../services/voice.service.js";
import { env } from "../config/env.js";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/mp4",
  "audio/m4a",
  "audio/mpeg",
  "audio/mp3",
  "audio/mpga",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "video/webm",
];

function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isAcceptedAudioType(mimetype = "") {
  return ACCEPTED_MIME_TYPES.some((value) => mimetype === value);
}

export async function transcribeVoice(req, res) {
  const file = req.file;

  if (!file) {
    throw httpError(400, "Audio file is required.");
  }

  if (!isAcceptedAudioType(file.mimetype)) {
    throw httpError(
      400,
      "Audio must be recorded as webm, mp4, mp3, wav, or ogg.",
    );
  }

  if (!file.buffer?.length) {
    throw httpError(400, "Audio upload was empty.");
  }

  if (file.buffer.length > MAX_AUDIO_BYTES) {
    throw httpError(413, "Audio upload must be 10 MB or smaller.");
  }

  const data = await transcribeAudioBuffer({
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalname: file.originalname,
    language: req.body?.language,
  });

  if (!data.transcript) {
    throw httpError(422, "No transcript was returned for this audio.");
  }

  return ok(res, data);
}

export function getVoiceStatus(_req, res) {
  return ok(res, {
    backendOnline: true,
    transcriptionConfigured: Boolean(env.openaiApiKey),
    model: env.openaiTranscribeModel,
  });
}
