export enum Command {
  INITIAL_CAPTURE = 'Initial capture',
  CAPTURE_CHANGES = 'Capture changes'
}

// Format for sending data to extension page
export interface ChannelMessage {
  command: Command,
  serializedImage: string
}