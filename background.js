chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    const statusCode = details.statusCode;
    if (statusCode === 429) {
      chrome.runtime.sendMessage({ error: "Rate limit exceeded" });
    }
  },
  { urls: ["https://www.strava.com/*"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(function(message) {
  if (message.error) {
    alert(message.error);
  }
});
