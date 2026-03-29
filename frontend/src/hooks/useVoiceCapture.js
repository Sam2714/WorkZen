import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { transcribeAudio } from "../services/api";

const MAX_RECORDING_MS = 15_000;
const FALLBACK_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

function getSpeechRecognitionCtor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function getPreferredLanguage() {
  if (typeof navigator === "undefined") {
    return "en-IN";
  }

  return navigator.language || "en-IN";
}

function extractTranscript(event) {
  return Array.from(event?.results || [])
    .map((result) => result?.[0]?.transcript || "")
    .join(" ")
    .trim();
}

function getRecorderMimeType() {
  if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
    return "";
  }

  const supported = FALLBACK_MIME_TYPES.find((value) =>
    window.MediaRecorder.isTypeSupported?.(value),
  );

  return supported || "";
}

function stopTracks(stream) {
  stream?.getTracks?.().forEach((track) => track.stop());
}

function mapSpeechError(event) {
  const code = String(event?.error || "").toLowerCase();
  const detail = String(event?.message || "").trim();

  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return {
        code,
        message: "Browser speech recognition was blocked. Allow microphone access and try again.",
        canFallback: true,
      };
    case "audio-capture":
      return {
        code,
        message: "No microphone was available for browser speech recognition.",
        canFallback: true,
      };
    case "network":
      return {
        code,
        message: "Browser speech recognition hit a network issue.",
        canFallback: true,
      };
    case "no-speech":
      return {
        code,
        message: "I could not hear any speech. Try again in a quieter spot.",
        canFallback: false,
      };
    case "language-not-supported":
      return {
        code,
        message: "The current browser speech language is not supported here.",
        canFallback: true,
      };
    case "aborted":
      return {
        code,
        message: "Voice capture was cancelled.",
        canFallback: false,
      };
    default:
      return {
        code: code || "unknown",
        message: detail || "Browser speech recognition failed.",
        canFallback: true,
      };
  }
}

export function useVoiceCapture({ enabled = true, onTranscript, onEvent }) {
  const recognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const fallbackSupported = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      typeof window !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== "undefined",
    [],
  );
  const [phase, setPhase] = useState("idle");
  const [mode, setMode] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const recognitionRef = useRef(null);
  const recognitionStateRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const recorderStateRef = useRef({ cancelled: false });
  const chunksRef = useRef([]);
  const autoStopRef = useRef(null);

  const emitEvent = useCallback(
    (kind, message, details = {}) => {
      onEvent?.({ kind, message, details });
    },
    [onEvent],
  );

  const clearAutoStop = useCallback(() => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  }, []);

  const resetRecorder = useCallback(() => {
    clearAutoStop();
    recorderRef.current = null;
    recorderStateRef.current = { cancelled: false };
    chunksRef.current = [];
    stopTracks(streamRef.current);
    streamRef.current = null;
  }, [clearAutoStop]);

  const finishWithError = useCallback(
    (message, kind = "voice_failed", details = {}) => {
      setError(message);
      setStatus("");
      setPhase("error");
      setMode(null);
      emitEvent(kind, message, details);
    },
    [emitEvent],
  );

  const handleTranscript = useCallback(
    async (transcript, details) => {
      const text = String(transcript || "").trim();

      if (!text) {
        finishWithError("No transcript was captured. Try again.");
        return;
      }

      setError("");
      setStatus("Voice task created.");
      setPhase("idle");
      setMode(null);
      emitEvent(
        "voice_transcribed",
        details?.source === "fallback"
          ? "Recorder fallback transcribed your voice input."
          : "Browser speech recognition captured your voice input.",
        details,
      );
      await Promise.resolve(onTranscript?.(text, details));
    },
    [emitEvent, finishWithError, onTranscript],
  );

  const transcribeBlob = useCallback(
    async (blob) => {
      setError("");
      setPhase("transcribing");
      setMode("fallback");
      setStatus("Transcribing audio through the backend...");

      try {
        const data = await transcribeAudio({
          blob,
          language: getPreferredLanguage(),
        });

        await handleTranscript(data?.transcript, {
          source: "fallback",
          provider: data?.provider || "openai",
          model: data?.model || null,
          language: data?.language || null,
        });
      } catch (requestError) {
        finishWithError(
          requestError?.message || "Remote transcription failed.",
          "voice_failed",
          { source: "fallback" },
        );
      }
    },
    [finishWithError, handleTranscript],
  );

  const stopFallbackCapture = useCallback(
    ({ cancel = false } = {}) => {
      const recorder = recorderRef.current;

      if (!recorder) {
        if (cancel) {
          setError("");
          setStatus("Voice capture cancelled.");
          setPhase("idle");
          setMode(null);
        }
        resetRecorder();
        return;
      }

      recorderStateRef.current = { cancelled: cancel };
      clearAutoStop();

      if (recorder.state === "inactive") {
        resetRecorder();
        setPhase("idle");
        setMode(null);
        return;
      }

      recorder.stop();
    },
    [clearAutoStop, resetRecorder],
  );

  const startFallbackCapture = useCallback(
    async (reasonMessage = "") => {
      if (!fallbackSupported) {
        finishWithError("Voice capture is not available in this browser surface.");
        return;
      }

      setError("");
      setPhase("requesting_permission");
      setMode("fallback");
      setStatus(
        reasonMessage
          ? `${reasonMessage} Switching to recorded audio...`
          : "Allow microphone access to record your task.",
      );

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = getRecorderMimeType();
        const recorder = mimeType
          ? new window.MediaRecorder(stream, { mimeType })
          : new window.MediaRecorder(stream);

        streamRef.current = stream;
        recorderRef.current = recorder;
        recorderStateRef.current = { cancelled: false };
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data?.size) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onerror = () => {
          resetRecorder();
          finishWithError(
            "Audio recording failed before transcription could start.",
            "voice_failed",
            { source: "fallback" },
          );
        };

        recorder.onstop = async () => {
          const cancelled = recorderStateRef.current.cancelled;
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || mimeType || "audio/webm",
          });

          resetRecorder();

          if (cancelled) {
            setError("");
            setStatus("Voice capture cancelled.");
            setPhase("idle");
            setMode(null);
            return;
          }

          if (!blob.size) {
            finishWithError(
              "No audio was captured. Try again and speak after recording starts.",
              "voice_failed",
              { source: "fallback" },
            );
            return;
          }

          await transcribeBlob(blob);
        };

        recorder.start();
        setPhase("listening");
        setMode("fallback");
        setStatus("Recording audio... click Voice again to stop.");
        emitEvent(
          "voice_fallback_started",
          "Recorder fallback started for voice capture.",
          { source: "fallback" },
        );

        autoStopRef.current = setTimeout(() => {
          stopFallbackCapture();
        }, MAX_RECORDING_MS);
      } catch (captureError) {
        finishWithError(
          captureError?.name === "NotAllowedError"
            ? "Microphone permission was denied."
            : "Microphone access failed for voice recording.",
          "voice_failed",
          { source: "fallback" },
        );
      }
    },
    [
      emitEvent,
      fallbackSupported,
      finishWithError,
      resetRecorder,
      stopFallbackCapture,
      transcribeBlob,
    ],
  );

  const startNativeCapture = useCallback(() => {
    if (!recognitionCtor) {
      startFallbackCapture();
      return;
    }

    setError("");
    setPhase("listening");
    setMode("native");
    setStatus("Listening... speak naturally.");

    const recognition = new recognitionCtor();
    const state = {
      handled: false,
      errorSeen: false,
      queuedFallback: false,
      cancelled: false,
      fallbackReason: "",
    };

    recognitionRef.current = recognition;
    recognitionStateRef.current = state;
    recognition.lang = getPreferredLanguage();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      state.handled = true;
      const transcript = extractTranscript(event);
      await handleTranscript(transcript, {
        source: "native",
        provider: "browser",
        model: null,
        language: recognition.lang || null,
      });
    };

    recognition.onerror = (event) => {
      const mapped = mapSpeechError(event);
      state.errorSeen = true;

      if (state.cancelled || mapped.code === "aborted") {
        setError("");
        setStatus("Voice capture cancelled.");
        setPhase("idle");
        setMode(null);
        return;
      }

      if (mapped.canFallback && fallbackSupported) {
        state.queuedFallback = true;
        state.fallbackReason = mapped.message;
        setError("");
        setPhase("requesting_permission");
        setMode("fallback");
        setStatus(`${mapped.message} Switching to recorded audio...`);
        emitEvent(
          "voice_native_failed",
          mapped.message,
          { source: "native", error: mapped.code },
        );
        return;
      }

      finishWithError(mapped.message, "voice_failed", {
        source: "native",
        error: mapped.code,
      });
    };

    recognition.onend = () => {
      const nextState = recognitionStateRef.current || state;
      recognitionRef.current = null;
      recognitionStateRef.current = null;

      if (nextState.cancelled) {
        setError("");
        setStatus("Voice capture cancelled.");
        setPhase("idle");
        setMode(null);
        return;
      }

      if (nextState.queuedFallback) {
        startFallbackCapture(nextState.fallbackReason);
        return;
      }

      if (!nextState.handled && !nextState.errorSeen) {
        finishWithError("No speech was detected. Try again.");
      }
    };

    try {
      recognition.start();
      emitEvent(
        "voice_started",
        "Browser speech recognition started for voice capture.",
        { source: "native" },
      );
    } catch (startError) {
      if (fallbackSupported) {
        startFallbackCapture("Browser speech recognition could not start.");
        return;
      }

      finishWithError(
        startError?.message || "Voice capture could not start.",
        "voice_failed",
        { source: "native" },
      );
    }
  }, [
    emitEvent,
    fallbackSupported,
    finishWithError,
    handleTranscript,
    recognitionCtor,
    startFallbackCapture,
  ]);

  const stopNativeCapture = useCallback(() => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setError("");
      setStatus("Voice capture cancelled.");
      setPhase("idle");
      setMode(null);
      return;
    }

    if (recognitionStateRef.current) {
      recognitionStateRef.current.cancelled = true;
    }

    try {
      recognition.abort?.();
    } catch {
      recognition.stop?.();
    }
  }, []);

  const toggleCapture = useCallback(() => {
    if (!enabled) {
      return;
    }

    if (phase === "requesting_permission" || phase === "transcribing") {
      return;
    }

    if (phase === "listening") {
      if (mode === "fallback") {
        stopFallbackCapture();
        return;
      }

      stopNativeCapture();
      return;
    }

    if (recognitionCtor) {
      startNativeCapture();
      return;
    }

    startFallbackCapture();
  }, [
    enabled,
    mode,
    phase,
    recognitionCtor,
    startFallbackCapture,
    startNativeCapture,
    stopFallbackCapture,
    stopNativeCapture,
  ]);

  useEffect(() => {
    return () => {
      if (recognitionStateRef.current) {
        recognitionStateRef.current.cancelled = true;
      }

      try {
        recognitionRef.current?.abort?.();
      } catch {}

      try {
        recognitionRef.current?.stop?.();
      } catch {}

      try {
        stopFallbackCapture({ cancel: true });
      } catch {
        resetRecorder();
      }
    };
  }, [resetRecorder, stopFallbackCapture]);

  const buttonLabel =
    phase === "transcribing"
      ? "Working"
      : phase === "requesting_permission"
        ? "Allow mic"
        : phase === "listening"
          ? "Stop"
          : "Voice";
  const disabled =
    !enabled ||
    (!recognitionCtor && !fallbackSupported) ||
    phase === "requesting_permission" ||
    phase === "transcribing";
  const helperText = error
    ? error
    : status ||
      (enabled
        ? recognitionCtor
          ? "Voice starts with browser speech recognition, then falls back to recorded audio if needed."
          : fallbackSupported
            ? "Browser speech recognition is unavailable here. Recorded audio will be sent to the backend for transcription."
            : "Voice capture is not available in this browser surface."
        : "Voice capture is currently disabled.");

  return {
    buttonLabel,
    disabled,
    error,
    helperText,
    isListening: phase === "listening",
    mode,
    phase,
    recognitionAvailable: Boolean(recognitionCtor),
    fallbackSupported,
    toggleCapture,
  };
}
