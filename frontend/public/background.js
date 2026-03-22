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

chrome.runtime.onInstalled.addListener(() => {
  enableSidePanelAction();
});

chrome.runtime.onStartup?.addListener(() => {
  enableSidePanelAction();
});

enableSidePanelAction();
