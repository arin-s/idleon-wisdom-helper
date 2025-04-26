import { ChannelMessage, Command } from "./background";
document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let initCapture: ImageData;
  let ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Couldn't obtain canvas context!`);
    return;
  }
  const channel = new BroadcastChannel('image');
  // Add event listener for messages from service worker
  channel.addEventListener('message', async (event: MessageEvent<ChannelMessage>) => {
    console.log(`Received ${event.data.command} event\nLength: ${event.data.serializedImage.length}`);
    let img = new Image();
    img.src = event.data.serializedImage;
    // await for img to load
    await img.decode();
    // If it's the initial capture, we just save the ImageData and draw to screen
    if (event.data.command === Command.INITIAL_CAPTURE) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      initCapture = ctx.getImageData(0, 0, img.width, img.height);
    }
    else if (event.data.command === Command.CAPTURE_CHANGES) {
      if (!initCapture) {
        console.warn(`Initial capture hasn't been performed yet!`);
        return;
      }
      // Load the image into a temporary canvas so we can get the ImageData
      let tmpCanvas = new OffscreenCanvas(canvas.width, canvas.height);
      const osCtx = tmpCanvas.getContext('2d');
      if (!osCtx) {
        console.error(`Couldn't obtain offscreen canvas context!`);
        return;
      }
      osCtx.drawImage(img, 0, 0);
      // Calculate the minimum width and height since the user may have resized the window
      const tmpCapture = osCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
      const minWidth = Math.min(initCapture.width, tmpCapture.width);
      const minHeight = Math.min(initCapture.height, tmpCapture.height);
      // Get the initial, current and temporary ImageData
      const initData = initCapture.data;
      const currCapture = ctx.getImageData(0, 0, img.width, img.height);
      const tmpData = tmpCapture.data;
      /* Each pixel is made up of 4 8-bit integers (RGBA format)
         Row index must be accessed using canvas' own width */
      for (let row = 0; row < minHeight; row++) {
        for (let col = 0; col < minWidth; col++) {
          // Iterate through the pixel
          for (let px = 0; px < 4; px++) {
            // Compare pixels and copy diffs to currCapture
            if (initData[(row * initCapture.width + col) * 4 + px] !== tmpData[(row * tmpCapture.width + col) * 4 + px]) {
              currCapture.data[(row * currCapture.width + col) * 4 + px] = tmpData[(row * tmpCapture.width + col) * 4 + px];
            }
          }
        }
      }
      ctx.putImageData(currCapture, 0, 0);
    }
  });
});

