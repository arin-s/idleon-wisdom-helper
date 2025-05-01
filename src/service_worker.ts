import browser from 'webextension-polyfill';

export enum Command {
  INITIAL_CAPTURE = 'Initial capture',
  CAPTURE_CHANGES = 'Capture changes'
}

// Format for sending data to extension page
export interface ChannelMessage {
  command: Command,
  serializedImage: string
}

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
  // Search for open extension pages
  if (isFirefox)
    pattern = `moz-extension://${browser.runtime.id}/*`;
  else
    pattern = `chrome-extension://${browser.runtime.id}/*`;
  const tabs = await browser.tabs.query({ url: [pattern] });
  // If no extension pages are found, open one in a new window
  if (tabs.length === 0) {
    browser.windows.create({ url: browser.runtime.getURL('src/extension_page.html') });
  }
  else {
    // If extension pages are found, select the first one
    const tab = tabs[0];
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