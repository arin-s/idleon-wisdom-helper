window.addEventListener('keydown', preventAlt, {capture: true});
window.addEventListener('keyup', preventAlt, {capture: true});

let connected = false;

// Prevent passing Alt, Q and W key events to the game
async function preventAlt(event: KeyboardEvent) {
  if((event.key === "Alt"  || event.key === "AltGraph" || event.altKey) && event.isTrusted) {
    event.stopImmediatePropagation();
    event.preventDefault();
    console.log("Alt prevented!");
  }
}