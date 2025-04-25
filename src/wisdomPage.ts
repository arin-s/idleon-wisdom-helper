import { ChannelMessage } from "./background";
document.addEventListener('DOMContentLoaded', () => {
  let canvas = document.getElementById('canvas') as HTMLCanvasElement;
  let ctx = canvas.getContext('2d');
  const channel = new BroadcastChannel('image');
  channel.addEventListener('message', async (event: MessageEvent<ChannelMessage>) => {
    console.log(`Received ${event.data.command} event\nLength: ${event.data.serializedImage.length}`);
    let img = new Image();
    img.src = event.data.serializedImage;
    ctx?.drawImage(img, 0, 0);
  })
})

