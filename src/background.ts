import browser from 'webextension-polyfill';

console.log(`Don't tell Lava...`); // ;P

export enum Command {
  INITIAL_CAPTURE = 'Initial capture',
  CAPTURE_CHANGES = 'Capture changes'
}

export interface ChannelMessage{
  command: Command,
  serializedImage: string
}

// Add "action" listener
let isFirefox = true;
try {
  browser.runtime.getBrowserInfo();
} catch {
  isFirefox = false
}
if(isFirefox)
  browser.browserAction.onClicked.addListener(onClick);
else
  browser.action.onClicked.addListener(onClick);

// Add hotkey listeners
browser.commands.onCommand.addListener(async (command, tab) => {
  if(!tab?.windowId) {
    console.error('Hotkey not executed in a tab?');
    return;
  }
  if(command === Command.INITIAL_CAPTURE) {
    console.log("init");
  }
  else if(command === Command.CAPTURE_CHANGES) {
    console.log("change");
  }
  const img = await browser.tabs.captureVisibleTab(tab.windowId, {format: 'png'});
  const channel = new BroadcastChannel('image');
  channel.postMessage({command: Command.INITIAL_CAPTURE, serializedImage: img})
});

async function onClick() {
  let pattern;
  if(isFirefox)
    pattern = `moz-extension://${browser.runtime.id}/*`;
  else
    pattern = `chrome-extension://${browser.runtime.id}/*`;
  const tabs = await browser.tabs.query({url: [pattern]});
  if(tabs.length === 0) {
    browser.windows.create({url: browser.runtime.getURL('src/wisdomPage.html')});
  } else {
    const tab = tabs[0];
    if(!tab.id || !tab.windowId) {
      console.error(`Error obtaining tabId:${tab.id} or windowId:${tab.windowId}`);
      return;
    }
    browser.tabs.update(tab.id, {active: true});
    browser.windows.update(tab.windowId, {focused: true, drawAttention: true});
  }

}

