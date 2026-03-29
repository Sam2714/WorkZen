const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(buildUrl(path), options);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}.`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload?.data ?? payload;
}

function buildAudioFilename(blob) {
  const type = String(blob?.type || "").toLowerCase();

  if (type.includes("mp4") || type.includes("m4a")) {
    return "voice-input.m4a";
  }

  if (type.includes("mpeg") || type.includes("mp3") || type.includes("mpga")) {
    return "voice-input.mp3";
  }

  if (type.includes("wav")) {
    return "voice-input.wav";
  }

  if (type.includes("ogg")) {
    return "voice-input.ogg";
  }

  return "voice-input.webm";
}

export async function transcribeAudio({ blob, language }) {
  const body = new FormData();
  body.append("audio", blob, buildAudioFilename(blob));

  if (language) {
    body.append("language", language);
  }

  return apiRequest("/voice/transcribe", {
    method: "POST",
    body,
  });
}

export { API_BASE_URL };
