import { useEffect, useRef, useState, useCallback } from 'react';
import mqtt from 'mqtt';
import { Config } from '../config';
import type { JeopardyAction } from '~/types/jeopardy';

interface WebSocketMessage {
  action: JeopardyAction;
  data: any;
}

const topic = 'jeopardy'

const getRandomUUID = () => {
  if (typeof window.crypto.randomUUID === 'undefined') {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
  return window.crypto.randomUUID();
}

const getClientId = (roomCode: string) => {
  if (typeof window === 'undefined') return null;
  
  const savedClientId = window.localStorage.getItem(`jeopardy-client-${roomCode}`);
  if (savedClientId) {
    return savedClientId;
  }
  
  const newClientId = `jeopardy-${roomCode}-${getRandomUUID()}`;
  window.localStorage.setItem(`jeopardy-client-${roomCode}`, newClientId);
  return newClientId;
};

export function useMqtt(roomCode: string, handleMessage?: (message: WebSocketMessage) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<mqtt.MqttClient | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const clientIdRef = useRef<string | null>(null);

  const publish = useCallback(async (action: JeopardyAction, data: any) => {
    if (!connectionRef.current || !clientIdRef.current) {
      console.error('MQTT connection not established');
      return;
    }

    const message: WebSocketMessage = { 
      action, 
      data: {
        ...data,
        clientId: clientIdRef.current // Always include clientId in messages
      }
    };
    
    await connectionRef.current.publishAsync(
      `${Config.appName}/${Config.appStage}/${topic}/${roomCode}`,
      JSON.stringify(message),
      { qos: 1 }
    );
  }, [roomCode]);

  const connect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    // Ensure we have a clientId
    if (!clientIdRef.current) {
      clientIdRef.current = getClientId(roomCode);
      if (!clientIdRef.current) return; // Don't connect if we can't get a clientId
    }

    const connection = mqtt.connect(
      `wss://${Config.realtimeUrl}/mqtt?x-amz-customauthorizer-name=${Config.realtimeAuthorizer}`,
      {
        protocolVersion: 5,
        // clean: false, // Enable session persistence
        manualConnect: true,
        username: "", // Must be empty for the authorizer
        password: "PLACEHOLDER_TOKEN", // Passed as the token to the authorizer
        clientId: clientIdRef.current, // Use consistent clientId
        keepalive: 600,
        reconnectPeriod: Math.min(1000 * 2 ** reconnectAttempts.current, 30000),
        connectTimeout: 30 * 1000,
      }
    );

    connection.on('connect', async () => {
      try {
        await connection.subscribeAsync(
          `${Config.appName}/${Config.appStage}/${topic}/${roomCode}`,
          { qos: 1 }
        );
        setIsConnected(true);
        reconnectAttempts.current = 0;
      } catch (error) {
        console.error(error);
      }
    });

    connection.on('close', () => {
      setIsConnected(false);
      reconnectAttempts.current++;
    });

    connection.on('error', (error) => {
      console.error('MQTT Error:', error);
      setIsConnected(false);
    });

    connection.connect();

    connectionRef.current = connection;

    return connection;
  }, [roomCode]);

  // Initialize clientId on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !clientIdRef.current) {
      clientIdRef.current = getClientId(roomCode);
    }
  }, [roomCode]);

  useEffect(() => {
    if (!clientIdRef.current) return; // Don't connect without a clientId
    
    const connection = connect();
    
    return () => {
      if (connection) {
        connection.end();
      }
      connectionRef.current = null;
    };
  }, [connect]);

  // Add heartbeat mechanism
  useEffect(() => {
    if (!isConnected || !connectionRef.current || !clientIdRef.current) return;

    const heartbeatInterval = setInterval(() => {
      publish('heartbeat', { 
        timestamp: Date.now(),
        clientId: clientIdRef.current 
      });
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  return { 
    isConnected, 
    publish,
    clientId: clientIdRef.current 
  };
} 