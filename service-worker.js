chrome.action.onClicked.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));
});

// Listen for messages from the popup
chrome.runtime.onConnect.addListener((port) => {
  console.log("Connected to background script");

  port.onMessage.addListener((msg) => {
    console.log("Background script received message:", msg);

    if (msg.type === "REQUEST_OUTFIT_URL") {
      // Respond to the request from the popup
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { type: "REQUEST_OUTFIT_URL" },
          (response) => {
            port.postMessage(response);
          }
        );
      });
    }
  });
});
