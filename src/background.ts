import browser from 'webextension-polyfill';
import html from '/wisdomPage.html?url'

console.log(`Don't tell Lava...`); // ;P

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
browser.commands.onCommand.addListener((command, string) => {
  if(command === 'Initial capture') {
    console.log("init");
  }
  else if(command === 'Capture changes') {
    console.log("change");
  }
  const channel = new BroadcastChannel('wisdomImage');
});

async function onClick() {
  let pattern;
  if(isFirefox)
    pattern = `moz-extension://${browser.runtime.id}/*`;
  else
    pattern = `chrome-extension://${browser.runtime.id}/*`;
  const tabs = await browser.tabs.query({url: [pattern]});
  if(tabs.length === 0) {
    browser.windows.create({url: browser.runtime.getURL(html)});
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

