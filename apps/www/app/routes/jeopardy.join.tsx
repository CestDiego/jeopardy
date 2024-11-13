import { json, type LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useMqtt } from "~/hooks/useMqtt";

export const loader: LoaderFunction = ({ request }) => {
  const url = new URL(request.url);
  const existingRoom = url.searchParams.get('room');
  
  if (existingRoom) {
    return json({ roomCode: existingRoom, baseUrl: url.origin });
  }
  
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  // Redirect to the same page with the room code in the URL
  return redirect(`${url.pathname}?room=${roomCode}`);
};

export default function JeopardyJoin() {
  const { roomCode, baseUrl } = useLoaderData<typeof loader>();
  const [players, setPlayers] = useState<
    Array<{ playerInfo: { name: string; color: string } }>
  >([]);
  const { isConnected, publish } = useMqtt(roomCode, (message) => {
    console.log("handleMessage", message);
    switch (message.action) {
      case "identify":
        if (message.data.type === "player") {
          console.log("player joined", message.data);
          setPlayers((current) => [...current, message.data]);
        }
        if (message.data.type === "host") {
          console.log("host connected");
        }
        break;
      case "playerLeft":
        if (message.data.type === "player") {
          setPlayers((current) =>
            current.filter((p) => p.playerInfo.name !== message.data.name),
          );
        }
        break;
      default:
        console.error("unknown action", message);
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  const isJoining = location.search.includes('room=');
  const buzzerUrl = `${baseUrl}/jeopardy/buzzer/${roomCode}`;
  const inviteUrl = `${baseUrl}/jeopardy/join?room=${roomCode}`;

  useEffect(() => {
    publish('identify', { type: 'host', roomCode });
  }, [publish, roomCode]);

  const handleRemovePlayer = (playerName: string) => {
    publish('removePlayer', { name: playerName });
    setPlayers((current) =>
      current.filter((p) => p.playerInfo.name !== playerName)
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Jeopardy Game Setup</h1>

      <div className="text-center mb-8">
        <div className="mb-2">
          <span className={`inline-block w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          } mr-2`} />
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>
        <p className="text-xl mb-4">Scan to join as a player:</p>
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG value={buzzerUrl} size={256} />
        </div>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl mb-4">Connected Players:</h2>
        {players.length === 0 ? (
          <p className="text-gray-300">Waiting for players to join...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player) => (
              <li
                key={player.playerInfo.name}
                className="flex items-center justify-between p-2 rounded"
                style={{ backgroundColor: player.playerInfo.color }}
              >
                <span>{player.playerInfo.name}</span>
                <button
                  onClick={() => handleRemovePlayer(player.playerInfo.name)}
                  className="ml-2 px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white"
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="mt-8 px-6 py-3 bg-green-500 rounded-lg font-bold disabled:opacity-50"
        disabled={players.length < 2}
        type="button"
        onClick={() => {
          // Navigate to the main game display
          navigate(`/jeopardy/game/${roomCode}`);
        }}
      >
        Start Game ({players.length}/5 players)
      </button>
    </div>
  );
}
