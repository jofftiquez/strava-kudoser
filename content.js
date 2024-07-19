chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startKudosClicker") {
    // The message is received from the popup.js script
  }
});