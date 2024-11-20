export type MQTTAction = 
  | 'identify'
  | 'buzz'
  | 'playerLeft'
  | 'questionReady'
  | 'buzzOpen'
  | 'buzzClosed'
  | 'buzzAccepted'
  | 'buzzRejected';

export interface MQTTMessage {
  action: MQTTAction;
  data: any;
} 