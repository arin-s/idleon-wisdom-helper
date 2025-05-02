import browser from 'webextension-polyfill';

// Find out if we're on firefox or chrome, then add icon click listeners
let isFirefox = true;
try {
  browser.runtime.getBrowserInfo();
} catch {
  isFirefox = false
}
if (isFirefox)
  browser.browserAction.onClicked.addListener(onClick);
else
  browser.action.onClicked.addListener(onClick);
// Runs when the user clicks the extension icon
async function onClick() {
  let pattern;
  let tab;
  // Search for open extension pages
  if (isFirefox)
    pattern = `moz-extension://${browser.runtime.id}/*`;
  else
    pattern = `chrome-extension://${browser.runtime.id}/*`;
  const tabs = await browser.tabs.query({ url: [pattern] });
  if (tabs.length === 0)
    tab = null;
  else
    tab = tabs[0];
  // If no extension pages are found, open one in a new window
  if (!tab) {
    browser.windows.create({ url: browser.runtime.getURL('src/extension_page.html') });
  }
  // If extension pages are found, select the first one and draw attention to it
  else {
    // If the tabID or windowID is null, log the error and return
    if (!tab.id || !tab.windowId) {
      console.error(`Error obtaining tabId:${tab.id} or windowId:${tab.windowId}`);
      return;
    }
    // Make this tab active (selected) and bring its window forward
    browser.tabs.update(tab.id, { active: true });
    browser.windows.update(tab.windowId, { focused: true, drawAttention: true });
  }
}

// Add hotkey listener
browser.commands.onCommand.addListener(async (command, tab) => {
  if (!tab?.windowId) {
    console.error('Hotkey not executed in a tab?');
    return;
  }
  // Capture lossless base64 image of the current tab and send it to all extension pages
  const img = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const channel = new BroadcastChannel('image');
  channel.postMessage({ command: command, serializedImage: img })
});