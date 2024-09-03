chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "getCurrentTimestamp") {
      const video = document.querySelector('video');
      if (video) {
        sendResponse({ currentTime: video.currentTime });
      }
    }
  });
  