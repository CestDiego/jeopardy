import { useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';
import { Config } from '../config';
import type { JeopardyAction } from '~/types/jeopardy';

interface WebSocketMessage {
  action: JeopardyAction;
  data: any;
}

const topic = 'jeopardy'

export function useMqtt(roomCode: string, handleMessage?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<mqtt.MqttClient | null>(null);

  const publish = async (action: JeopardyAction, data: any) => {
    if (!connectionRef.current) {
      console.error('MQTT connection not established');
      return;
    }

    const message: WebSocketMessage = { action, data };
    await connectionRef.current.publishAsync(
      `${Config.appName}/${Config.appStage}/${topic}/${roomCode}`,
      JSON.stringify(message),
      { qos: 1 }
    );
  };

  useEffect(() => {
    console.log({ Config });

    const connection = mqtt.connect(
      `wss://${Config.realtimeUrl}/mqtt?x-amz-customauthorizer-name=${Config.realtimeAuthorizer}`,
      {
        protocolVersion: 5,
        manualConnect: true,
        username: "", // Must be empty for the authorizer
        password: "PLACEHOLDER_TOKEN", // Passed as the token to the authorizer
      },
    );

    connection.on('connect', async () => {
      try {
        await connection.subscribeAsync(`${Config.appName}/${Config.appStage}/${topic}/${roomCode}`, {qos: 1});
        setIsConnected(true);
      } catch (error) {
        console.error(error);
      }
    });

    connection.on('message', (_fullTopic, payload) => {
      const message: WebSocketMessage = JSON.parse(new TextDecoder("utf8").decode(new Uint8Array(payload)));
      
      if (handleMessage) {
        handleMessage(message);
      }
    });

    connection.on('error', console.error);

    connection.connect();

    connectionRef.current = connection;

    return () => {
      connection.end();
      connectionRef.current = null;
    };
  }, [roomCode, handleMessage]);

  return { isConnected, publish };
} 