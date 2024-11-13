import type { APIGatewayProxyWebsocketEventV2, APIGatewayProxyWebsocketHandlerV2 } from "aws-lambda";
import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";
import { Resource } from "sst";

// In-memory storage (will reset when Lambda cold starts)
const connections: Record<string, Set<string>> = {};
const connectionDetails: Record<
  string,
  {
    type: "host" | "player";
    roomCode: string;
    playerInfo?: { name: string; color: string };
  }
> = {};

const client = new ApiGatewayManagementApi({
  apiVersion: "2018-11-29",
  endpoint: Resource.WsApi.url,
});

const sendToConnection = async (connectionId: string, data: any) => {
  try {
    await client.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(data),
    });
  } catch (e) {
    // Handle disconnected clients
    if (e.statusCode === 410) {
      const roomCode = connectionDetails[connectionId]?.roomCode;
      if (roomCode) {
        connections[roomCode]?.delete(connectionId);
      }
      delete connectionDetails[connectionId];
    }
  }
};

const handleConnect = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  const roomCode = event.queryStringParameters?.room;
  if (!roomCode) return { statusCode: 400, body: "Room code required" };

  if (!connections[roomCode]) {
    connections[roomCode] = new Set();
  }
  connections[roomCode].add(connectionId);
  return { statusCode: 200, body: "Connected" };
};

const handleDisconnect = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  const disconnectingRoom = connectionDetails[connectionId]?.roomCode;
  if (disconnectingRoom) {
    connections[disconnectingRoom]?.delete(connectionId);

    // Notify others in the room
    if (connectionDetails[connectionId]?.type === "player") {
      const playerInfo = connectionDetails[connectionId]?.playerInfo;
      for (const otherConnectionId of connections[disconnectingRoom]) {
        await sendToConnection(otherConnectionId, {
          action: "playerLeft",
          data: playerInfo,
        });
      }
    }
  }
  delete connectionDetails[connectionId];
  return { statusCode: 200, body: "Disconnected" };
};

const handleIdentify = async (event: APIGatewayProxyWebsocketEventV2) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body || "{}");
  connectionDetails[connectionId] = {
    type: body.data.type,
    roomCode: body.data.roomCode,
    playerInfo: body.data.playerInfo,
  };

  if (body.data.type === "player") {
    // Notify host of new player
    const roomConnections = connections[body.data.roomCode];
    for (const otherConnectionId of roomConnections) {
      if (connectionDetails[otherConnectionId]?.type === "host") {
        await sendToConnection(otherConnectionId, {
          action: "playerJoined",
          data: body.data.playerInfo,
        });
      }
    }
  }
  return { statusCode: 200, body: "Identified" };
};

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
  const domain = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const connectionId = event.requestContext.connectionId;

  try {
    switch (event.requestContext.routeKey) {
      case "$connect":
        return handleConnect(event);
      case "$disconnect":
        return handleDisconnect(event);
      case "identify":
        return handleIdentify(event);
      default:
        return { statusCode: 400, body: "Unknown route" };
    }
  } catch (err) {
    return { statusCode: 500, body: "Internal server error" };
  }
};