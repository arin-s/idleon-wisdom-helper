import browser from "webextension-polyfill";

window.addEventListener('keydown', preventHotkey, {capture: true});
window.addEventListener('keyup', preventHotkey, {capture: true});

let connected = false;

// Prevent passing Alt, Q and W key events to the game when extension page is open
async function preventHotkey(event: KeyboardEvent) {
  if((event.key === "Alt"  || event.key === "AltGraph" || event.key.toLowerCase() === 'q' || event.key.toLowerCase() === 'w') && event.isTrusted && connected) {
    event.stopImmediatePropagation();
    event.preventDefault();
    console.log("Event prevented!");
  }
}

async function updateConnection() {
  let tabs = await browser.storage.local.get(null);
  if(Object.keys(tabs).length > 0)
    connected = true;
  else
    connected = false;
}

// Receive updates from service worker
browser.storage.local.onChanged.addListener(updateConnection);
// Get extension page status on launch
updateConnection();