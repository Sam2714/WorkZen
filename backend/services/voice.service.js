import OpenAI, { toFile } from "openai";
import { env } from "../config/env.js";

let client;

function getClient() {
  if (!env.openaiApiKey) {
    const error = new Error("Voice transcription is not configured on the server.");
    error.statusCode = 503;
    throw error;
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }

  return client;
}

function normalizeLanguage(language) {
  const value = String(language || "").trim();

  if (!value) {
    return undefined;
  }

  return value.split(/[-_]/)[0].toLowerCase();
}

function buildFilename(mimetype = "") {
  if (mimetype.includes("mp4") || mimetype.includes("m4a")) {
    return "voice-input.m4a";
  }

  if (mimetype.includes("mpeg") || mimetype.includes("mp3") || mimetype.includes("mpga")) {
    return "voice-input.mp3";
  }

  if (mimetype.includes("wav")) {
    return "voice-input.wav";
  }

  if (mimetype.includes("ogg")) {
    return "voice-input.ogg";
  }

  return "voice-input.webm";
}

export async function transcribeAudioBuffer({
  buffer,
  mimetype,
  originalname,
  language,
}) {
  const normalizedLanguage = normalizeLanguage(language);
  const filename = originalname || buildFilename(mimetype);
  const file = await toFile(buffer, filename, {
    type: mimetype || "audio/webm",
  });

  try {
    const response = await getClient().audio.transcriptions.create({
      file,
      model: env.openaiTranscribeModel,
      ...(normalizedLanguage ? { language: normalizedLanguage } : {}),
    });

    return {
      transcript: String(response.text || "").trim(),
      provider: "openai",
      model: env.openaiTranscribeModel,
      language: normalizedLanguage || null,
    };
  } catch (error) {
    const wrapped = new Error(
      error?.message || "Voice transcription failed upstream.",
    );
    wrapped.statusCode = error?.status || 502;
    throw wrapped;
  }
}
