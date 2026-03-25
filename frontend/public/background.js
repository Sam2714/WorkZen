const FOCUS_KEY = "wz_focus_state";
const SESSIONS_KEY = "wz_sessions";
const SETTINGS_KEY = "wz_settings";
const LOGS_KEY = "wz_activity_logs";
const FOCUS_TOTAL_MS = 25 * 60 * 1000;
const COMPLETE_ALARM = "workzen-focus-complete";
const BLINK_ALARM = "workzen-focus-blink";

const DEFAULT_SETTINGS = {
  notifications: {
    focusStart: false,
    focusPause: false,
    focusComplete: true,
    badgePulse: true,
  },
};

let blinkVisible = false;

function normalizeFocusState(state = {}) {
  return {
    status: "idle",
    startedAt: null,
    endsAt: null,
    remainingMs: FOCUS_TOTAL_MS,
    taskId: "",
    notes: "",
    sessionId: null,
    completedAt: null,
    sessionLoggedAt: null,
    ...state,
  };
}

function normalizeSettings(settings = {}) {
  return {
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(settings.notifications || {}),
    },
  };
}

function createLogEntry(kind, message, details = {}) {
  return {
    id: details.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    message,
    createdAt: details.createdAt || new Date().toISOString(),
    ...details,
  };
}

async function getSettings() {
  const stored = await chrome.storage.local.get([SETTINGS_KEY]);
  return normalizeSettings(stored[SETTINGS_KEY]);
}

async function appendLog(kind, message, details = {}) {
  const stored = await chrome.storage.local.get([LOGS_KEY]);
  const logs = Array.isArray(stored[LOGS_KEY]) ? stored[LOGS_KEY] : [];
  await chrome.storage.local.set({
    [LOGS_KEY]: [createLogEntry(kind, message, details), ...logs].slice(0, 180),
  });
}

async function maybeNotify(id, payload, enabled) {
  if (!enabled) {
    return;
  }

  try {
    await chrome.notifications.create(id, {
      type: "basic",
      iconUrl: "icon128.png",
      priority: 2,
      ...payload,
    });
  } catch (error) {
    console.error("Failed to show WorkZen notification", error);
  }
}

async function enableSidePanelAction() {
  if (!chrome?.sidePanel?.setPanelBehavior) {
    return;
  }

  try {
    await chrome.sidePanel.setPanelBehavior({
      openPanelOnActionClick: true,
    });
  } catch (error) {
    console.error("Failed to enable WorkZen side panel action", error);
  }
}

async function clearFocusAlarms() {
  await chrome.alarms.clear(COMPLETE_ALARM);
  await chrome.alarms.clear(BLINK_ALARM);
}

async function setToolbarIdle() {
  await chrome.action.setBadgeText({ text: "" });
  await chrome.action.setTitle({ title: "Open WorkZen side panel" });
}

async function setToolbarPaused() {
  await chrome.action.setBadgeBackgroundColor({ color: "#f5a623" });
  await chrome.action.setBadgeText({ text: "II" });
  await chrome.action.setTitle({ title: "WorkZen focus session paused" });
}

async function setToolbarRunning(settings, blink = false) {
  const pulseEnabled = settings.notifications.badgePulse;
  await chrome.action.setBadgeBackgroundColor({ color: "#4ade80" });
  if (pulseEnabled && blink) {
    blinkVisible = !blinkVisible;
    await chrome.action.setBadgeText({ text: blinkVisible ? "ON" : "" });
  } else {
    blinkVisible = true;
    await chrome.action.setBadgeText({ text: "ON" });
  }
  await chrome.action.setTitle({ title: "WorkZen focus session running" });
}

async function completeFocusSession() {
  const stored = await chrome.storage.local.get([FOCUS_KEY, SESSIONS_KEY, SETTINGS_KEY]);
  const focusState = normalizeFocusState(stored[FOCUS_KEY]);
  const settings = normalizeSettings(stored[SETTINGS_KEY]);
  if (focusState.status !== "running") {
    await clearFocusAlarms();
    await setToolbarIdle();
    return;
  }

  const completedAt = focusState.endsAt || Date.now();
  const sessionId = focusState.sessionId || String(completedAt);
  const sessions = Array.isArray(stored[SESSIONS_KEY]) ? stored[SESSIONS_KEY] : [];
  const nextSessions = sessions.some(session => session?.id === sessionId)
    ? sessions
    : [
        ...sessions,
        {
          id: sessionId,
          date: new Date(completedAt).toISOString(),
          taskId: focusState.taskId || null,
          notes: focusState.notes || "",
        },
      ];

  await chrome.storage.local.set({
    [FOCUS_KEY]: normalizeFocusState({
      ...focusState,
      status: "completed",
      endsAt: null,
      remainingMs: 0,
      completedAt,
      sessionLoggedAt: completedAt,
      sessionId,
    }),
    [SESSIONS_KEY]: nextSessions,
  });

  await appendLog("focus_completed", "Focus session completed after 25 minutes.", {
    source: "extension",
    taskId: focusState.taskId || null,
  });

  await clearFocusAlarms();
  blinkVisible = false;
  await setToolbarIdle();

  await maybeNotify(
    `workzen-focus-complete-${completedAt}`,
    {
      title: "Focus session complete",
      message: "25 minutes are up. Nice work.",
    },
    settings.notifications.focusComplete,
  );
}

async function syncFocusRuntime(state, settingsArg) {
  const focusState = normalizeFocusState(state);
  const settings = settingsArg || (await getSettings());
  if (focusState.status === "running" && focusState.endsAt) {
    if (focusState.endsAt <= Date.now()) {
      await completeFocusSession();
      return;
    }
    await chrome.alarms.create(COMPLETE_ALARM, { when: focusState.endsAt });
    if (settings.notifications.badgePulse) {
      await chrome.alarms.create(BLINK_ALARM, { periodInMinutes: 0.5 });
    } else {
      await chrome.alarms.clear(BLINK_ALARM);
    }
    await setToolbarRunning(settings, settings.notifications.badgePulse);
    return;
  }

  await clearFocusAlarms();
  blinkVisible = false;

  if (focusState.status === "paused") {
    await setToolbarPaused();
    return;
  }

  await setToolbarIdle();
}

async function handleFocusTransition(previousValue, nextValue, settings) {
  const previousState = normalizeFocusState(previousValue);
  const nextState = normalizeFocusState(nextValue);
  if (previousState.status === nextState.status) {
    return;
  }

  if (nextState.status === "running") {
    await appendLog("focus_started", "Focus session started.", {
      source: "extension",
      taskId: nextState.taskId || null,
    });
    await maybeNotify(
      `workzen-focus-start-${Date.now()}`,
      {
        title: "Focus session started",
        message: "Your 25-minute block is live.",
      },
      settings.notifications.focusStart,
    );
    return;
  }

  if (nextState.status === "paused") {
    await appendLog("focus_paused", "Focus session paused.", {
      source: "extension",
      taskId: nextState.taskId || null,
    });
    await maybeNotify(
      `workzen-focus-pause-${Date.now()}`,
      {
        title: "Focus session paused",
        message: "Resume when you are ready to continue.",
      },
      settings.notifications.focusPause,
    );
    return;
  }

  if (nextState.status === "idle" && (previousState.status === "running" || previousState.status === "paused")) {
    await appendLog("focus_reset", "Focus session reset.", {
      source: "extension",
      taskId: previousState.taskId || null,
    });
  }
}

async function recoverFocusRuntime() {
  const stored = await chrome.storage.local.get([FOCUS_KEY, SETTINGS_KEY]);
  await syncFocusRuntime(stored[FOCUS_KEY], normalizeSettings(stored[SETTINGS_KEY]));
}

chrome.runtime.onInstalled.addListener(() => {
  enableSidePanelAction();
  recoverFocusRuntime();
});

chrome.runtime.onStartup?.addListener(() => {
  enableSidePanelAction();
  recoverFocusRuntime();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes[SETTINGS_KEY]) {
    chrome.storage.local.get([FOCUS_KEY, SETTINGS_KEY]).then(stored => {
      syncFocusRuntime(stored[FOCUS_KEY], normalizeSettings(stored[SETTINGS_KEY]));
    });
  }

  if (changes[FOCUS_KEY]) {
    chrome.storage.local.get([SETTINGS_KEY]).then(stored => {
      const settings = normalizeSettings(stored[SETTINGS_KEY]);
      handleFocusTransition(changes[FOCUS_KEY].oldValue, changes[FOCUS_KEY].newValue, settings);
      syncFocusRuntime(changes[FOCUS_KEY].newValue, settings);
    });
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === COMPLETE_ALARM) {
    completeFocusSession();
    return;
  }

  if (alarm.name === BLINK_ALARM) {
    chrome.storage.local.get([FOCUS_KEY, SETTINGS_KEY]).then(stored => {
      const focusState = normalizeFocusState(stored[FOCUS_KEY]);
      const settings = normalizeSettings(stored[SETTINGS_KEY]);
      if (focusState.status !== "running") {
        syncFocusRuntime(focusState, settings);
        return;
      }
      setToolbarRunning(settings, true);
    });
  }
});

enableSidePanelAction();
recoverFocusRuntime();
